// src/lib/historyCache.ts
// Module-level in-memory cache — żyje przez całą sesję przeglądarki
import type { HistoryResponse } from './types';

const MAX_CACHE_SIZE = 50;
const cache = new Map<string, { data: HistoryResponse; fetchedAt: number }>();

const TTL: Record<'24h' | '30d', number> = {
  '24h': 5 * 60 * 1000,   // 5 minut — dane intraday zmieniają się często
  '30d': 60 * 60 * 1000,  // 1 godzina — dane historyczne są stabilne
};

export function getCachedHistory(sensorId: string, range: '24h' | '30d'): HistoryResponse | null {
  const key = `${sensorId}:${range}`;
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > TTL[range]) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCachedHistory(sensorId: string, range: '24h' | '30d', data: HistoryResponse): void {
  const key = `${sensorId}:${range}`;

  // Evict oldest entry if at capacity
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(key, { data, fetchedAt: Date.now() });
}
