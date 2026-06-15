// src/pages/api/sensors.json.ts
import type { APIRoute } from 'astro';
import { readTbEnv } from '../../lib/env';
import {
  listDevices,
  deviceAttributes,
  deviceLatest,
} from '../../lib/thingsboard';
import type { Sensor, SensorsResponse } from '../../lib/types';

export const prerender = false;

const TELEMETRY_KEYS = ['pm10', 'pm25', 'pm1_0'];
const TTL = 60_000;
let cache: { at: number; payload: SensorsResponse } | null = null;

const num = (v: unknown): number | null => {
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
};
const bool = (v: unknown): boolean => v === true || v === 'true';

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=30',
    },
  });
}

export const GET: APIRoute = async ({ locals }) => {
  if (cache && Date.now() - cache.at < TTL) return json(cache.payload);

  try {
    const env = readTbEnv(locals);
    const devices = await listDevices(env);

    const sensors = await Promise.all(
      devices.map(async (d): Promise<Sensor | null> => {
        const [attrs, latest] = await Promise.all([
          deviceAttributes(env, d.id),
          deviceLatest(env, d.id, TELEMETRY_KEYS),
        ]);
        const lat = num(attrs.latitude);
        const lon = num(attrs.longitude);
        if (lat == null || lon == null) return null;

        // Find latest timestamp across all pollutants
        const ts =
          latest.pm10?.ts ?? latest.pm25?.ts ?? latest.pm1_0?.ts ?? Date.now();
        const maxTs = Math.max(
          latest.pm10?.ts ?? 0,
          latest.pm25?.ts ?? 0,
          latest.pm1_0?.ts ?? 0
        );

        return {
          id: d.id,
          name: d.name,
          address: d.name,
          lat,
          lon,
          ts,
          lastSeen: maxTs || ts, // Use maxTs if available, fallback to ts
          pm10: num(latest.pm10?.value),
          pm25: num(latest.pm25?.value),
          pm1: num(latest.pm1_0?.value),
          active: bool(attrs.active),
        };
      })
    );

    const payload: SensorsResponse = {
      updatedAt: Date.now(),
      sensors: sensors.filter((s): s is Sensor => s !== null),
    };
    cache = { at: Date.now(), payload };
    return json(payload);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502);
  }
};
