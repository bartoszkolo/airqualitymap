/**
 * Mały klient REST API ThingsBoard — używany WYŁĄCZNIE po stronie serwera
 * (endpointy /api/*). Dane logowania nigdy nie trafiają do przeglądarki.
 *
 * Odkryta struktura (instancja w Gnieźnie):
 *  - urządzenia: /api/tenant/devices
 *  - współrzędne: atrybuty `latitude` / `longitude` (string)
 *  - telemetria: klucze `pm10`, `pm25`, `pm1_0` (wartości jako string)
 *  - `active` (bool) — czujnik online/offline
 */

export interface TbEnv {
  TB_URL: string;
  TB_USERNAME: string;
  TB_PASSWORD: string;
}

// Cache tokena w obrębie izolatu (Pages Function żyje jakiś czas między requestami).
let cachedToken: { token: string; exp: number } | null = null;

// Niektóre firewalle/WAF odrzucają (403) zapytania bez User-Agent — Cloudflare
// Workers domyślnie go nie wysyła, więc nadajemy własny.
const COMMON_HEADERS = {
  'User-Agent': 'AirQualityMap/1.0 (+cloudflare-pages)',
  Accept: 'application/json',
};

async function login(env: TbEnv): Promise<string> {
  const res = await fetch(`${env.TB_URL}/api/auth/login`, {
    method: 'POST',
    headers: { ...COMMON_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: env.TB_USERNAME, password: env.TB_PASSWORD }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TB login ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { token: string };
  // token domyślnie ważny ~2,5h — odświeżamy z zapasem co 60 min
  cachedToken = { token: data.token, exp: Date.now() + 60 * 60 * 1000 };
  return data.token;
}

async function getToken(env: TbEnv): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now()) return cachedToken.token;
  return login(env);
}

async function tbGet<T>(env: TbEnv, path: string): Promise<T> {
  let token = await getToken(env);
  let res = await fetch(`${env.TB_URL}${path}`, {
    headers: { ...COMMON_HEADERS, 'X-Authorization': `Bearer ${token}` },
  });
  if (res.status === 401) {
    token = await login(env);
    res = await fetch(`${env.TB_URL}${path}`, {
      headers: { ...COMMON_HEADERS, 'X-Authorization': `Bearer ${token}` },
    });
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TB GET ${path} -> ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export interface TbDevice {
  id: string;
  name: string;
}

export async function listDevices(env: TbEnv): Promise<TbDevice[]> {
  const data = await tbGet<{ data: { id: { id: string }; name: string }[] }>(
    env,
    `/api/tenant/devices?pageSize=200&page=0`
  );
  return (data.data ?? []).map((d) => ({ id: d.id.id, name: d.name }));
}

export async function deviceAttributes(
  env: TbEnv,
  id: string
): Promise<Record<string, unknown>> {
  const arr = await tbGet<{ key: string; value: unknown }[]>(
    env,
    `/api/plugins/telemetry/DEVICE/${id}/values/attributes`
  );
  const out: Record<string, unknown> = {};
  for (const a of arr) out[a.key] = a.value;
  return out;
}

export interface TsPoint {
  ts: number;
  value: string;
}

export async function deviceLatest(
  env: TbEnv,
  id: string,
  keys: string[]
): Promise<Record<string, TsPoint | undefined>> {
  const data = await tbGet<Record<string, TsPoint[]>>(
    env,
    `/api/plugins/telemetry/DEVICE/${id}/values/timeseries?keys=${keys.join(',')}`
  );
  const out: Record<string, TsPoint | undefined> = {};
  for (const k of Object.keys(data)) out[k] = data[k]?.[0];
  return out;
}

export async function deviceHistory(
  env: TbEnv,
  id: string,
  keys: string[],
  startTs: number,
  endTs: number,
  interval: number
): Promise<Record<string, TsPoint[]>> {
  const q =
    `/api/plugins/telemetry/DEVICE/${id}/values/timeseries` +
    `?keys=${keys.join(',')}&startTs=${startTs}&endTs=${endTs}` +
    `&interval=${interval}&agg=AVG&limit=1000&orderBy=ASC`;
  return tbGet<Record<string, TsPoint[]>>(env, q);
}
