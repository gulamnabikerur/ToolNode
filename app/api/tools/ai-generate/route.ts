import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { redis } from "@/lib/redis";
import { consumeServerCredit } from "@/lib/server-credits";

// Fallback in-memory job store if Redis is missing
const jobStore = new Map<string, { status: string; imageUrl?: string; error?: string }>();

import { z } from "zod";
import { createApiHandler } from "@/lib/api-handler";

const getJobSchema = z.object({
  jobId: z.string().min(1)
});

export const GET = createApiHandler({
  schema: getJobSchema,
  handler: async (req, data) => {
    if (redis) {
      const job = await redis.get(`job:${data.jobId}`);
      if (!job) return NextResponse.json({ status: "pending" });
      return NextResponse.json(job);
    } else {
      const job = jobStore.get(data.jobId);
      if (!job) return NextResponse.json({ status: "pending" });
      return NextResponse.json(job);
    }
  }
});

const generateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  style: z.string().optional()
});

export const POST = createApiHandler({
  schema: generateSchema,
  handler: async (req, data) => {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // Server-Side Credit Check
    const creditCheck = await consumeServerCredit(ip);
    if (!creditCheck.success) {
      return NextResponse.json({ error: "Out of credits. Please upgrade." }, { status: 402 });
    }

    const { prompt, style } = data;

    const hfToken = process.env.HUGGINGFACE_API_TOKEN;
    const hordeKey = process.env.AI_HORDE_API_KEY || "0000000000";

    if (!hfToken || hfToken === "hf_demo_placeholder") {
      // Try AI Horde (completely free, no key needed)
      return await generateWithAiHorde(prompt, hordeKey);
    }

    // Try HuggingFace FLUX Schnell first
    try {
      const fullPrompt = `${prompt}${style && !prompt.includes(style) ? `, ${style}` : ""}`;
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: fullPrompt }),
          signal: AbortSignal.timeout(60000),
        }
      );

      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString("base64");
        const imageUrl = `data:image/jpeg;base64,${base64}`;
        return NextResponse.json({ imageUrl });
      }
      if (response.status === 503) {
        // Model loading — fall through to AI Horde
      }
    } catch {
      // Fall through to AI Horde
    }

    return await generateWithAiHorde(prompt, hordeKey);
  }
});

async function generateWithAiHorde(prompt: string, apiKey: string): Promise<NextResponse> {
  try {
    // Submit async job
    const submitRes = await fetch("https://aihorde.net/api/v2/generate/async", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": apiKey },
      body: JSON.stringify({
        prompt,
        params: {
          width: 512,
          height: 512,
          steps: 20,
          n: 1,
          cfg_scale: 7,
          sampler_name: "k_euler",
        },
        models: ["stable_diffusion"],
        r2: true,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      return NextResponse.json({ error: `AI generation failed: ${err.slice(0, 200)}` }, { status: 500 });
    }

    const { id: jobId } = await submitRes.json();
    
    if (redis) {
      await redis.set(`job:${jobId}`, { status: "pending" }, { ex: 3600 });
    } else {
      jobStore.set(jobId, { status: "pending" });
    }

    // Start polling in background (won't block response)
    pollAiHorde(jobId, apiKey);

    return NextResponse.json({ jobId, status: "pending" });
  } catch (e: unknown) {
    return NextResponse.json({ error: "AI Horde unavailable. Please try again." }, { status: 500 });
  }
}

async function pollAiHorde(jobId: string, apiKey: string) {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    try {
      const res = await fetch(`https://aihorde.net/api/v2/generate/check/${jobId}`, {
        headers: { "apikey": apiKey },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.done) {
        const statusRes = await fetch(`https://aihorde.net/api/v2/generate/status/${jobId}`, {
          headers: { "apikey": apiKey },
        });
        const statusData = await statusRes.json();
        if (statusData.generations?.[0]?.img) {
          const payload = { status: "done", imageUrl: statusData.generations[0].img };
          if (redis) await redis.set(`job:${jobId}`, payload, { ex: 3600 });
          else jobStore.set(jobId, payload);
          return;
        }
      }
      if (data.faulted) {
        const payload = { status: "error", error: "Generation failed on AI Horde" };
        if (redis) await redis.set(`job:${jobId}`, payload, { ex: 3600 });
        else jobStore.set(jobId, payload);
        return;
      }
    } catch { continue; }
  }
  const payload = { status: "error", error: "Timed out" };
  if (redis) await redis.set(`job:${jobId}`, payload, { ex: 3600 });
  else jobStore.set(jobId, payload);
}
