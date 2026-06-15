// src/pages/api/history.json.ts
import type { APIRoute } from 'astro';
import { readTbEnv } from '../../lib/env';
import { deviceHistory } from '../../lib/thingsboard';
import type { HistoryResponse, HistoryPoint } from '../../lib/types';

export const prerender = false;

const TTL_1H = 30_000;     // 30 seconds
const TTL_24H = 60_000;    // 1 minute
const TTL_30D = 300_000;   // 5 minutes

const cache = new Map<string, { at: number; payload: HistoryResponse }>();

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=30',
    },
  });
}

function getRangeConfig(range: string) {
  const now = Date.now();
  switch (range) {
    case '1h':
      return {
        startTs: now - 60 * 60 * 1000,
        endTs: now,
        interval: 60 * 1000, // 1 minute
        ttl: TTL_1H,
      };
    case '24h':
      return {
        startTs: now - 24 * 60 * 60 * 1000,
        endTs: now,
        interval: 60 * 60 * 1000, // 1 hour
        ttl: TTL_24H,
      };
    case '30d':
      return {
        startTs: now - 30 * 24 * 60 * 60 * 1000,
        endTs: now,
        interval: 24 * 60 * 60 * 1000, // 1 day
        ttl: TTL_30D,
      };
    default:
      // Default to 24h
      return {
        startTs: now - 24 * 60 * 60 * 1000,
        endTs: now,
        interval: 60 * 60 * 1000,
        ttl: TTL_24H,
      };
  }
}

function calculateAverage(points: HistoryPoint): number {
  const allValues: number[] = [];
  for (const key of ['pm10', 'pm25', 'pm1_0'] as const) {
    const keyPoints = points[key];
    if (keyPoints) {
      for (const p of keyPoints) {
        const v = parseFloat(p.value);
        if (!Number.isNaN(v)) allValues.push(v);
      }
    }
  }
  if (allValues.length === 0) return 0;
  return allValues.reduce((a, b) => a + b, 0) / allValues.length;
}

function calculateMinMax(points: HistoryPoint): { min: number; max: number } {
  const allValues: number[] = [];
  for (const key of ['pm10', 'pm25', 'pm1_0'] as const) {
    const keyPoints = points[key];
    if (keyPoints) {
      for (const p of keyPoints) {
        const v = parseFloat(p.value);
        if (!Number.isNaN(v)) allValues.push(v);
      }
    }
  }
  if (allValues.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...allValues),
    max: Math.max(...allValues),
  };
}

export const GET: APIRoute = async ({ locals, url }) => {
  const id = url.searchParams.get('id');
  const range = url.searchParams.get('range') || '24h';

  if (!id) {
    return json({ error: 'Missing sensor id' }, 400);
  }

  const cacheKey = `${id}:${range}`;
  const cached = cache.get(cacheKey);
  const config = getRangeConfig(range);

  if (cached && Date.now() - cached.at < config.ttl) {
    return json(cached.payload);
  }

  try {
    const env = readTbEnv(locals);
    const points = await deviceHistory(
      env,
      id,
      ['pm10', 'pm25', 'pm1_0'],
      config.startTs,
      config.endTs,
      config.interval
    );

    const average = calculateAverage(points);
    const { min, max } = calculateMinMax(points);

    const payload: HistoryResponse = {
      points,
      average,
      min,
      max,
      range: range as '1h' | '24h' | '30d',
    };

    cache.set(cacheKey, { at: Date.now(), payload });
    return json(payload);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502);
  }
};
