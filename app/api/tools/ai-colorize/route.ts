import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

import { createApiHandler } from "@/lib/api-handler";

export const POST = createApiHandler({
  handler: async (req) => {
    const form  = await req.formData();
    const image = form.get("image") as File | null;
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const token = process.env.HUGGINGFACE_API_TOKEN;
    if (!token) return NextResponse.json({ error: "API not configured" }, { status: 503 });

    const buf = Buffer.from(await image.arrayBuffer());

    // Use HuggingFace colorization model
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/vinesmsuic/colorizer",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
        },
        body: buf,
      }
    );

    if (!hfRes.ok) {
      if (hfRes.status === 503) {
        return NextResponse.json({ error: "AI model is warming up, please try again in 30 seconds" }, { status: 503 });
      }
      throw new Error(await hfRes.text());
    }

    const resultBuf = await hfRes.arrayBuffer();
    const base64    = Buffer.from(resultBuf).toString("base64");
    const dataUrl   = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  }
});
