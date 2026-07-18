import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

import { createApiHandler } from "@/lib/api-handler";

export const POST = createApiHandler({
  handler: async (req) => {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const hfToken = process.env.HUGGINGFACE_API_TOKEN;

    if (!hfToken || hfToken === "hf_demo_placeholder") {
      // Return a mock transparent PNG for demo mode
      return NextResponse.json({
        error: "HuggingFace API token not configured. Add HUGGINGFACE_API_TOKEN to .env.local",
        demo: true,
      }, { status: 503 });
    }

    // Try BRIA RMBG 2.0 first
    const response = await fetch(
      "https://api-inference.huggingface.co/models/briaai/RMBG-2.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": file.type || "image/jpeg",
        },
        body: buffer,
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      // Model loading (503) — instruct client to retry
      if (response.status === 503) {
        return NextResponse.json({ error: "AI model is warming up. Please try again in 30 seconds." }, { status: 503 });
      }
      return NextResponse.json({ error: `HuggingFace API error: ${response.status} — ${errText.slice(0, 200)}` }, { status: response.status });
    }

    const resultBuffer = await response.arrayBuffer();
    return new NextResponse(Buffer.from(resultBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="no-background.png"',
      },
    });
  }
});
