# Deploying

## GitHub Pages (default)

1. Push the repository to GitHub (`shasankj/portfolio`).
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`. `.github/workflows/deploy.yml` runs `astro check`, builds, checks internal links and publishes `dist/`.

The site is served at `https://shasankj.github.io/portfolio/`. The workflow reads the origin and base path from GitHub (`actions/configure-pages`) and passes them to the build as `SITE_URL` and `BASE_PATH`. Every internal link goes through `src/lib/url.ts`, so the same code works under `/portfolio` and at a domain root.

### Custom domain later

1. Settings → Pages → Custom domain, enter it, and add the DNS records GitHub shows.
2. Nothing else changes: `configure-pages` then reports an empty base path and the new origin.
3. For local production builds, set `SITE_URL=https://your.domain BASE_PATH=/`.

## Vercel or Netlify instead

Both detect Astro automatically.

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node | 22 or newer |
| Environment | `SITE_URL=https://<your-site>`; leave `BASE_PATH` unset (the site is at the domain root) |

Delete or disable `.github/workflows/deploy.yml` if you deploy this way. Keep `ci.yml` for checks on pull requests.

## Mermaid diagrams

Diagrams written as Mermaid are rendered to SVG during the build and need a browser. CI installs Chromium (`npx playwright install --with-deps chromium`). On Vercel or Netlify, add the same install to the build command, or use hand-authored SVG diagrams, which need no browser.
