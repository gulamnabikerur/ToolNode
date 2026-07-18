import { NextRequest } from "next/server";
import { redis } from "./redis";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 15; // Max 15 requests per minute
const WINDOW_MS = 60 * 1000;

export async function checkRateLimit(req: NextRequest): Promise<{ success: boolean; error?: string }> {
  // Use x-forwarded-for for Vercel, fallback to random string for local testing if needed
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  
  if (redis) {
    try {
      const key = `rate-limit:${ip}`;
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, 60); // 1 minute window
      }
      if (current > LIMIT) {
        return { success: false, error: "Too many requests. Please try again later." };
      }
      return { success: true };
    } catch (e) {
      console.warn("Redis rate limit failed, falling back to memory:", e);
    }
  }

  const now = Date.now();
  const windowData = rateLimitMap.get(ip);

  if (!windowData) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { success: true };
  }

  if (now - windowData.lastReset > WINDOW_MS) {
    // Reset window
    windowData.count = 1;
    windowData.lastReset = now;
    return { success: true };
  }

  if (windowData.count >= LIMIT) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  windowData.count++;
  return { success: true };
}
