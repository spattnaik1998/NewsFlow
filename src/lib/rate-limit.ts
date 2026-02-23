/**
 * Simple in-memory rate limiter using sliding window counters.
 * Keyed by IP address to prevent abuse of expensive endpoints.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  limit: number;       // max requests
  windowMs: number;    // window in ms
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.limit - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}

// Cleanup old entries every 5 minutes
if (typeof global !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export const RATE_LIMITS = {
  FEED: { limit: 60, windowMs: 60_000 },         // 60 req/min for feed
  SUMMARIZE: { limit: 10, windowMs: 60_000 },     // 10 AI summaries/min
  SEARCH: { limit: 20, windowMs: 60_000 },        // 20 searches/min
  CATEGORIZE: { limit: 5, windowMs: 60_000 },     // 5 categorize batches/min
} as const;
