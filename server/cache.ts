// ============================================================
// server/cache.ts
// In-Memory SHA-256 Hash-Keyed LRU AI Cache for AeroGuard AI
// Delivers sub-10ms response times for repeated atmospheric states
// Prevents API quota exhaustion per EFFICIENCY.md
// ============================================================

import { createHash } from 'crypto';

export interface CacheEntry {
  data: unknown;
  cachedAt: number;
}

export const insightCache = new Map<string, CacheEntry>();
export const MAX_CACHE_ENTRIES = 100;

/**
 * Produces a deterministic 16-character SHA-256 hash key from any payload.
 */
export function hashPayload(obj: unknown): string {
  const jsonStr = JSON.stringify(obj, Object.keys(obj as object).sort());
  return createHash('sha256').update(jsonStr).digest('hex').slice(0, 16);
}

/**
 * LRU Cache Pruning: drops oldest item if size exceeds MAX_CACHE_ENTRIES.
 */
export function pruneCache(): void {
  if (insightCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = insightCache.keys().next().value;
    if (oldestKey) {
      insightCache.delete(oldestKey);
    }
  }
}

/**
 * Resets cache (primarily used in testing).
 */
export function clearCache(): void {
  insightCache.clear();
}
