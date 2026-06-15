// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// Strona jest statyczna (prerender), a endpointy /api/* renderują się na żądanie
// (export const prerender = false) jako serverless functions na Vercel.
export default defineConfig({
  site: 'https://air-quality-map.pages.dev',
  output: 'server',
  adapter: vercel(),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // We'll use custom CSS file
    }),
  ],
});
