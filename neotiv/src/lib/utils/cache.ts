import { Redis } from '@upstash/redis';

// Graceful fallback for environments missing the Upstash tokens
export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  if (!redis) {
    console.warn(`Upstash Redis not configured. Bypassing cache for key: ${key}`);
    return await fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached) {
      return cached;
    }
    
    const fresh = await fetcher();
    
    if (fresh) {
       await redis.set(key, fresh, { ex: ttlSeconds });
    }
    
    return fresh;
  } catch (error) {
    console.error(`Cache error for ${key}:`, error);
    return await fetcher();
  }
}
