import type { TbEnv } from './thingsboard';

/**
 * Odczyt sekretów ThingsBoard:
 *  - lokalnie (astro dev): z import.meta.env (plik .env)
 *  - na Vercel: z import.meta.env (zmienne środowiskowe projektu)
 *
 * Vercel serverless functions mają env vars dostępne przez import.meta.env,
 * tak jak zwykły Node.js runtime.
 */
export function readTbEnv(_locals: unknown): TbEnv {
  const env: TbEnv = {
    TB_URL: import.meta.env.TB_URL as string,
    TB_USERNAME: import.meta.env.TB_USERNAME as string,
    TB_PASSWORD: import.meta.env.TB_PASSWORD as string,
  };
  if (!env.TB_URL || !env.TB_USERNAME || !env.TB_PASSWORD) {
    throw new Error('Brak konfiguracji TB_URL / TB_USERNAME / TB_PASSWORD');
  }
  return env;
}
