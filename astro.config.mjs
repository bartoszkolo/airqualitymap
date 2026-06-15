// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Strona jest statyczna (prerender), a endpointy /api/* renderują się na żądanie
// (export const prerender = false) jako serverless functions na Vercel.
export default defineConfig({
  site: 'https://air-quality-map.pages.dev',
  output: 'server',
  adapter: vercel(),
});
