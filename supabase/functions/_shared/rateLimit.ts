import { Redis } from 'https://esm.sh/@upstash/redis'

const url = Deno.env.get('UPSTASH_REDIS_REST_URL')?.trim() ?? ''
const token = Deno.env.get('UPSTASH_REDIS_REST_TOKEN')?.trim() ?? ''

const redis = url && token ? new Redis({ url, token }) : null

/** @returns 'limited' if over max; 'ok' if allowed */
export async function checkRateLimit(
  ip: string,
  namespace: string,
  maxPerWindow: number,
  windowSeconds: number
): Promise<'ok' | 'limited'> {
  if (!redis) {
    console.warn(`[rate-limit:${namespace}] Upstash not configured — skipping`)
    return 'ok'
  }
  try {
    const key = `rate:${namespace}:${ip}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, windowSeconds)
    if (count > maxPerWindow) return 'limited'
    return 'ok'
  } catch (e) {
    console.error(`[rate-limit:${namespace}] Redis error:`, e)
    return 'ok'
  }
}
