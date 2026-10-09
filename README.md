# Portfolio

Shasank Jabade's portfolio: an animated, accessible, static site built with Astro, TypeScript and Tailwind. Every project is one MDX file, so adding a new one never touches a page component.

- **Stack:** Astro 7 (static), TypeScript, Tailwind CSS 4, MDX, GSAP (architecture diagrams only), View Transitions. No backend, no analytics.
- **Design:** "Blueprint": paper and drafting-table colors, mono display type, one signal accent, light and dark themes. Details live on the site's "How this site was built" page.
- **Content:** projects, anonymized work case studies and notes, all Markdown with typed frontmatter.

## Run locally

Requires Node 22.12 or newer.

```bash
npm install
npm run dev          # http://localhost:4321  (drafts are visible in dev)
```

| Command | What it does |
|---|---|
| `npm run build` | Production build to `dist/` (drafts excluded) |
| `npm run preview` | Serve `dist/` locally |
| `npm run check` | Astro and TypeScript diagnostics, content schema validation. Must be 0 errors |
| `npm run links` | Check every internal link and anchor in `dist/` |
| `npm test` | Playwright smoke, feature and axe accessibility tests (run `npm run build` first) |
| `npm run shots` | Screenshot matrix (375, 768, 1440 px, light and dark) into `shots/matrix/` |
| `npm run new-project -- "Name"` | Scaffold a new case study from the template |

Optional environment variables:

| Variable | Purpose |
|---|---|
| `SITE_URL`, `BASE_PATH` | Canonical origin and base path (for example `https://shasankj.github.io` and `/portfolio`). Default is the domain root. CI sets them automatically. |
| `MERMAID_BROWSER_CHANNEL=chrome` | Render Mermaid diagrams with your installed Chrome. CI installs Chromium instead. Only needed if a case study uses Mermaid. |
| `PW_CHANNEL=chrome` | Run Playwright tests with installed Chrome, for example `PW_CHANNEL=chrome npx playwright test --project=chromium`. |

## Add a project

### With Claude Code (recommended)

From this folder, in Claude Code:

```
/add-project ../name-of-project-folder  optional notes about the project
```

It analyzes the project folder (stack, architecture, notable engineering), runs a read-only secrets check, asks you for missing links and metrics, writes the case-study MDX and an animated architecture diagram, picks an accent color, verifies the generated social image, offers to upgrade the project's own README (diff first), runs the build and checks, and lists what is left for you. It never commits; you review and commit.

Related commands:

- `/update-project <slug or folder>`: re-analyze a changed project and update its case study while preserving your hand edits (diff first).
- `/add-note <topic or folder>`: draft a Writing post.

The rules these commands follow are in [CLAUDE.md](CLAUDE.md).

### By hand

```bash
npm run new-project -- "My Project"
```

This creates `src/content/projects/my-project.mdx` (copied from the documented [template](src/content/projects/_template.mdx)) and a starter diagram `src/diagrams/my-project.svg`. Fill in the frontmatter, then run `npm run dev` and open `/projects/my-project/`. Set `draft: false` when it is ready. The card, filters, sitemap, command palette entry and social image all update on their own.

Rules of thumb:

- Never invent metrics. Leave `metrics: []` and the page shows a visible TODO until you have real numbers.
- Diagram conventions (`data-step` attributes, one walkthrough entry per step) are in [CLAUDE.md](CLAUDE.md#diagram-conventions).
- Check an accent color with `node scripts/contrast.mjs "#light" "#dark"` (4.5:1 required).

## Project structure

```
src/content/{projects,work,notes}/   MDX content, schema in src/content.config.ts
src/diagrams/                        animated architecture diagrams (SVG or Mermaid)
src/data/                            identity and nav (site.ts), experience and skills (experience.ts)
src/components/ src/layouts/ src/pages/ src/lib/ src/styles/
tests/                               Playwright specs
scripts/                             new-project, check-links, secrets-scan, contrast
docs/                                ANIMATION.md (tune the hero), DEPLOY.md
.github/workflows/                   deploy.yml (GitHub Pages), ci.yml (checks, 3-browser tests, Lighthouse)
.claude/commands/                    add-project, update-project, add-note
```

Quick edits: your links and contact details are in [src/data/site.ts](src/data/site.ts), the experience timeline in [src/data/experience.ts](src/data/experience.ts), and the hero animation settings in [src/lib/hero-stream.ts](src/lib/hero-stream.ts) (guide: [docs/ANIMATION.md](docs/ANIMATION.md)). The résumé PDF is `public/resume.pdf`; replace the file to update it.

## Deploy

Pushing to `main` deploys to GitHub Pages through [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

1. Push this repository to GitHub.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`. The site appears at `https://<your-user>.github.io/<repo-name>/`.

A custom domain, Vercel and Netlify are covered in [docs/DEPLOY.md](docs/DEPLOY.md).

## Quality checks

The CI workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs `astro check`, the build, the link check, the Playwright suite (including axe accessibility scans in light and dark) on Chromium, Firefox and WebKit, and Lighthouse CI with these budgets: Performance at least 90, Accessibility, Best Practices and SEO at least 95, LCP under 2.0 s, CLS under 0.05.

## Notes

- Drafts (`draft: true`) appear in `npm run dev` and are left out of production builds.
- The site respects the system "reduce motion" setting and offers a manual toggle in the footer and the command palette (Cmd/Ctrl+K).
- Do not add a phone number to any page.
