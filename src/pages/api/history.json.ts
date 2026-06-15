import type { APIRoute } from 'astro';
import { readTbEnv } from '../../lib/env';
import { deviceHistory } from '../../lib/thingsboard';
import type { HistoryPoint } from '../../lib/types';

export const prerender = false;

const HOUR = 3600_000;
const num = (v: unknown): number | null => {
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
};

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=120',
    },
  });
}

export const GET: APIRoute = async ({ url, locals }) => {
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'brak parametru id' }, 400);

  try {
    const env = readTbEnv(locals);
    const endTs = Date.now();
    const startTs = endTs - 24 * HOUR;
    const data = await deviceHistory(env, id, ['pm10', 'pm25'], startTs, endTs, HOUR);

    // scal serie po znaczniku czasu
    const byTs = new Map<number, HistoryPoint>();
    for (const key of ['pm10', 'pm25'] as const) {
      for (const p of data[key] ?? []) {
        const point = byTs.get(p.ts) ?? { ts: p.ts, pm10: null, pm25: null };
        point[key] = num(p.value);
        byTs.set(p.ts, point);
      }
    }
    const points = [...byTs.values()].sort((a, b) => a.ts - b.ts);
    return json({ id, points });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502);
  }
};
