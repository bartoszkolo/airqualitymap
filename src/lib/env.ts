import type { TbEnv } from './thingsboard';

/**
 * Odczyt sekretów ThingsBoard:
 *  - lokalnie (astro dev): z import.meta.env (plik .env)
 *  - na Cloudflare Pages: z locals.runtime.env (zmienne środowiskowe projektu)
 */
export function readTbEnv(locals: unknown): TbEnv {
  const r =
    (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env ?? {};
  const get = (k: string): string =>
    (r[k] as string) ?? (import.meta.env[k] as string) ?? '';

  const env: TbEnv = {
    TB_URL: get('TB_URL'),
    TB_USERNAME: get('TB_USERNAME'),
    TB_PASSWORD: get('TB_PASSWORD'),
  };
  if (!env.TB_URL || !env.TB_USERNAME || !env.TB_PASSWORD) {
    throw new Error('Brak konfiguracji TB_URL / TB_USERNAME / TB_PASSWORD');
  }
  return env;
}
