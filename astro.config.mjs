import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// TODO: set `site` (and `base` for a project page) once the GitHub Pages URL / custom domain is known.
export default defineConfig({
  site: 'https://shasankj.github.io',
  integrations: [react(), mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
