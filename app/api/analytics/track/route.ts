import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  if (!redis) {
    return NextResponse.json({ success: true, mocked: true });
  }

  try {
    const { toolSlug } = await req.json();
    if (!toolSlug || typeof toolSlug !== "string") {
      return NextResponse.json({ error: "Invalid tool slug" }, { status: 400 });
    }

    // Increment the sorted set score for the specific tool
    await redis.zincrby("analytics:tool_hits", 1, toolSlug);
    
    // Also track raw total
    await redis.incr("analytics:total_hits");

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Analytics tracking failed:", e);
    // Always return 200 so we don't break the client if analytics fail
    return NextResponse.json({ success: false });
  }
}
