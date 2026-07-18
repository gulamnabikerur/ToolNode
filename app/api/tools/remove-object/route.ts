import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

import { createApiHandler } from "@/lib/api-handler";

export const POST = createApiHandler({
  handler: async (req) => {
    const form  = await req.formData();
    const image = form.get("image") as File | null;
    const mask  = form.get("mask")  as File | null;
    if (!image || !mask) return NextResponse.json({ error: "Image and mask required" }, { status: 400 });

    if (!image.type.startsWith("image/") || !mask.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const token = process.env.HUGGINGFACE_API_TOKEN;
    if (!token) return NextResponse.json({ error: "API not configured" }, { status: 503 });

    const imgBuf  = Buffer.from(await image.arrayBuffer());
    const maskBuf = Buffer.from(await mask.arrayBuffer());

    // Use Stable Diffusion inpainting via HuggingFace
    const payload = {
      inputs: {
        image: imgBuf.toString("base64"),
        mask:  maskBuf.toString("base64"),
        prompt: "empty background, clean surroundings, natural fill, seamless",
        negative_prompt: "artifacts, blurry, distorted",
        num_inference_steps: 20,
      }
    };

    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-inpainting",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!hfRes.ok) {
      if (hfRes.status === 503) {
        return NextResponse.json({ error: "AI model warming up, please try in 30 seconds" }, { status: 503 });
      }
      throw new Error(await hfRes.text());
    }

    const resultBuf = await hfRes.arrayBuffer();
    const base64    = Buffer.from(resultBuf).toString("base64");
    const dataUrl   = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  }
});
