import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeMermaid from 'rehype-mermaid';

// Deploy config comes from env (set in .github/workflows/deploy.yml):
//   SITE_URL  e.g. https://shasankj.github.io   (or a custom domain)
//   BASE_PATH e.g. /portfolio                    (use / for a custom domain or a user site)
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://shasankj.github.io',
  base: process.env.BASE_PATH ?? '/',
  // Mermaid fences in .md/.mdx render to inline SVG at build time (needs a Playwright browser:
  // `npx playwright install chromium` in CI; locally set MERMAID_BROWSER_CHANNEL=chrome to use installed Chrome).
  markdown: {
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    rehypePlugins: [[rehypeMermaid, {
      strategy: 'inline-svg',
      launchOptions: process.env.MERMAID_BROWSER_CHANNEL ? { channel: process.env.MERMAID_BROWSER_CHANNEL } : {},
      mermaidConfig: { theme: 'base', themeVariables: { fontFamily: 'IBM Plex Sans, sans-serif', lineColor: '#4a5568', primaryColor: '#faf8f2', primaryBorderColor: '#14213d', primaryTextColor: '#14213d' } },
    }]],
  },
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
