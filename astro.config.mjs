// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Strona jest statyczna (prerender), a endpointy /api/* renderują się na żądanie
// (export const prerender = false) jako funkcje na Cloudflare Pages.
export default defineConfig({
  site: 'https://air-quality-map.pages.dev',
  output: 'static',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
});
