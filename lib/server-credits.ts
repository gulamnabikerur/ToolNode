import { redis } from "./redis";
import { DAILY_AI_CREDIT_LIMIT } from "./constants";

export async function consumeServerCredit(ip: string): Promise<{ success: boolean; remaining: number }> {
  if (!redis) {
    // If Redis is not configured, we allow it (development mode)
    return { success: true, remaining: DAILY_AI_CREDIT_LIMIT };
  }

  const today = new Date().toISOString().split("T")[0];
  const key = `credits:${ip}:${today}`;

  try {
    const used = await redis.get<number>(key) || 0;
    
    if (used >= DAILY_AI_CREDIT_LIMIT) {
      return { success: false, remaining: 0 };
    }

    const newUsed = await redis.incr(key);
    if (newUsed === 1) {
      await redis.expire(key, 60 * 60 * 24); // 24 hours
    }

    return { 
      success: true, 
      remaining: Math.max(0, DAILY_AI_CREDIT_LIMIT - newUsed) 
    };
  } catch (e) {
    console.error("Redis credit tracking failed:", e);
    // Fail open if Redis crashes so we don't break the site
    return { success: true, remaining: DAILY_AI_CREDIT_LIMIT };
  }
}
