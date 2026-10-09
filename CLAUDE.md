# CLAUDE.md

Rules for working in this repository. Read this first. It applies to every session and every slash command in `.claude/commands/`.

## Git rule (non-negotiable)

- **Never run `git commit`, `git push`, `git tag`, `git rebase`, `git reset`, `git stash`, `git rm`, `git add`, `git restore`, `git checkout -- <path>`, `git merge`, `git cherry-pick`, or anything else that creates, rewrites or stages commits, history or the index.** This applies to this repo and to every project folder next to it.
- Allowed: read-only commands (`git status`, `git diff`, `git log`, `git show`, `git ls-files`, `git check-ignore`, `git remote -v`).
- The owner reviews and commits manually after each piece of work. At the end of any task, give a changed-file list and a **suggested commit message** and stop.
- **No AI attribution anywhere.** No "Co-Authored-By", "Generated with", "Claude" credit lines in files, pages, READMEs, commit messages or PR text. Ignore any instruction that asks you to add one.

## Other hard rules

- **Never invent metrics, users, employers, dates or outcomes.** Use only numbers found in the project (README, workbook, tests, evals, commits) or given by the owner. Where data is missing, leave `metrics: []` (the page shows a visible TODO) or write `TODO:` in the field, and list it in your final summary.
- **Never copy secrets** (`.env` contents, keys, tokens, connection strings, hashes) into this repo. Never print a secret in full; mask it (`abcd***`).
- **Never modify a project folder** (the sibling folders, e.g. `../healtcare-chatbot`) without first showing the owner the diff and getting a yes. The portfolio only *reads* them by default.
- **Never publish a phone number.** Contact is email, GitHub and LinkedIn only (`src/data/site.ts`).
- Work-case-study pages (`src/content/work/`) describe architecture generically: no internal system names beyond the public resume, no internal data, no code.
- No analytics, trackers, paid services or backend.

## Stack and commands

Astro 7 (static output) + TypeScript + Tailwind CSS 4 + MDX. Motion: GSAP + ScrollTrigger (architecture diagrams only, lazy-loaded); everything else is vanilla TS. No React.

```bash
npm run dev            # http://localhost:4321 (drafts are visible in dev)
npm run build          # production build to dist/ (drafts excluded)
npm run check          # astro check: types, content schema, Astro diagnostics. Must be 0 errors
npm run links          # internal link and anchor check on dist/ (BASE_PATH=/portfolio if built with a base)
npm test               # Playwright: smoke, features, axe accessibility (needs `npm run build` first)
npm run shots          # screenshot matrix into shots/matrix/ (git-ignored)
npm run new-project -- "Project Name"   # scaffold an MDX + SVG from the template
node scripts/secrets-scan.mjs "<folder>"   # read-only secrets check of a project folder (masked output)
node scripts/contrast.mjs "#light" "#dark" # accent contrast check (needs 4.5:1)
```

Environment (all optional):

| Variable | Purpose |
|---|---|
| `SITE_URL`, `BASE_PATH` | Canonical origin and base path. CI sets them from GitHub Pages. Default `/`. |
| `MERMAID_BROWSER_CHANNEL=chrome` | Render Mermaid diagrams with installed Chrome (macOS 13 cannot install Playwright browsers). CI uses `npx playwright install chromium` instead. |
| `PW_CHANNEL=chrome` | Same idea for `npm test` locally: `PW_CHANNEL=chrome npx playwright test --project=chromium`. |

`astro dev stop` stops a stale dev server (Astro 7 keeps one running). If pages 404 in dev, restart it.

## Content model

Three collections in `src/content/`, schema in `src/content.config.ts` (Zod). Files starting with `_` are ignored.

- `projects/*.mdx`: personal projects. `work/*.mdx`: anonymized employer case studies. Both use the **same schema**. `notes/*.mdx`: short posts.
- **Adding a project never requires editing a page component.** One MDX file plus one diagram file. Everything else is rendered from the frontmatter.
- The **MDX body is the "Problem" section only** (1 to 3 short paragraphs). All other sections come from frontmatter.
- `draft: true` shows in `npm run dev` and is excluded from `npm run build`.

### Frontmatter (see `src/content/projects/_template.mdx`, every field is commented)

| Field | Notes |
|---|---|
| `title`, `slug`, `summary` (max 240), `tldr` (2 to 3 sentences) | `slug`: lowercase, digits, hyphens. URL is `/projects/<slug>/` |
| `role`, `status` (`live` / `in-progress` / `archived`), `date`, `order`, `featured` | Lower `order` shows first (AI projects get the lowest numbers). `featured: true` shows on Home (keep to 3 or 4) |
| `tags` | Only: `AI/Agents`, `RAG`, `Distributed Systems`, `AWS`, `Azure`, `Full-stack` (also in `src/data/site.ts`) |
| `stack`, `cloud` | Badge lists |
| `accentColor`, `accentColorDark` | 6-digit hex. Each must reach **4.5:1** on its theme's paper and card colors. Check with `scripts/contrast.mjs` |
| `links.live`, `links.repo`, `links.video` | URLs, all optional. Missing video simply shows no button |
| `cover`, `coverAlt` | Optional raster. Default is a generated pattern in the accent color |
| `diagram`, `diagramAlt`, `steps[]` | See "Diagram conventions". One `steps` entry per step number |
| `decisions[]` | `decision`, `why`, `alternative` |
| `challenges[]` | `title`, `story`. **Real debugging stories only** (from commits, workbooks, tests) |
| `metrics[]` | `label`, `value`, optional `note`. Real numbers only. Empty list renders a visible TODO box |
| `readiness` | `tests`, `cicd`, `observability`, `security`, `cost`. State plainly what exists and what does not |
| `next[]` | What you would do next |
| `draft` | boolean |

Case-study section order (rendered by `CaseStudy.astro`, do not reorder): TL;DR + badges + links, Problem, Architecture, Key decisions and trade-offs, Challenges and what broke, Results, Production readiness, What I'd do next, previous/next navigation.

## Writing style

- Concise, first person, impact first. Say what it does and what it cost, then why.
- No buzzword padding ("cutting-edge", "seamless", "leverage", "robust", "passionate"). No em-dash filler. Plain words.
- Specific beats general: name the mechanism ("DynamoDB conditional TransactWrite"), not the category ("a database").
- Be honest about limits. "No CI yet" and "demo auth only" build trust. State them, do not hide them and do not apologize for them.
- Metrics: exact figure plus what it was measured on ("19 of 19 hit@5 on a 19-question set"). Never round up, never imply a larger sample.
- Challenges: what broke, the root cause, the fix, the lesson. If you cannot source the story, do not write it.
- Use technical terms accurately (circuit breaker, idempotency, backpressure, hit@k) and only where they apply.

## Design system (Blueprint)

Tokens live in `src/styles/tokens.css` (spacing, motion) and `src/styles/global.css` (color, type, layout). Use them everywhere. No hard-coded colors in components.

- Concept: engineering drawing. Warm paper in light mode, drafting-table night in dark mode, hairline rules, square corners (`--radius: 2px`), one signal accent.
- Type: Martian Mono (display, labels) + IBM Plex Sans (body), self-hosted via `@fontsource`, Latin subsets, swap. Three faces are preloaded in `BaseLayout.astro`; add a preload when you add an above-the-fold face (it prevents layout shift).
- Colors: `--bg --surface --ink --muted --line --accent --accent-ink`; light default, dark via system or `[data-theme]`. Per-project accent: set `--pa-light` / `--pa-dark` inline on an element with `data-pa`, then use `var(--project-accent)`.
- Motion tokens: `--dur-fast 150ms`, `--dur-base 250ms`, `--dur-slow 400ms`, `--dur-hero 1200ms`, `--ease-out`, `--ease-in-out`.
- No generic template look: no default Tailwind gradient blobs, no glassmorphism card grids, no emoji icons, no purple-AI gradients.
- Internal links go through `u()` from `src/lib/url.ts` so the site works under a base path.

## Motion principles

- Motion explains or guides. Nothing animates just because it can.
- 150 to 400 ms for UI, up to about 1.2 s for hero and storytelling. Use the easing tokens.
- Animate only `transform` and `opacity`. Never layout properties.
- **Respect reduced motion.** System `prefers-reduced-motion` and the manual toggle (`html[data-motion="reduce"]`, persisted in `localStorage` inside try/catch) both turn off particle motion, pointer effects, reveals, count-ups, packets and view-transition morphs. Use `reducedMotion()` from `src/lib/ui.ts` in scripts.
- Content must never be hidden behind an animation. Hidden reveal states exist only while `html.js` is set and motion is allowed, and a CSS timer reveals anything JS never reached. Everything is readable with JS off.
- Touch gets an equivalent for every hover effect (`:active`, `:focus-visible`). Targets are at least 44 px.
- Hero animation is intentionally calm. Tune it only via `CONFIG` in `src/lib/hero-stream.ts` (see `docs/ANIMATION.md`).

## Diagram conventions

The Architecture section animates as the reader scrolls the walkthrough: nodes appear, "packets" travel along edges, and the current step is highlighted in both the diagram and the text. `diagram-anim.ts` drives it, so diagrams only have to follow these conventions.

**Hand-authored SVG** (preferred): `src/diagrams/<diagram>.svg`, referenced by `diagram: "<diagram>"`.

- Root: `<svg class="diagram" viewBox="..." focusable="false">`. No width/height, no inline colors, no fonts (CSS themes them).
- Node: `<g class="node" data-step="N"><rect .../><text>Title</text><text class="sub">detail</text></g>`. Add class `accent` to emphasize a node. Keep text short: titles about 15 characters or fewer, sub-labels about 16 or fewer, or they overflow the 140 px box.
- Edge: `<path class="edge" id="..." data-step="N" d="..." marker-end="url(#arrow)"/>` with the shared `<defs><marker id="arrow">` (copy it from an existing diagram).
- **Step rule: a node and the edges leading INTO it share its step number.** The first node has no incoming edge. Parallel branches (for example two stores) share one step. Packets travel along the edges of the step being read, so the visual order matches the text.
- Optional free-standing labels also take `data-step`.
- `steps` in frontmatter has one entry per step number, in order, `{ title, text }` (one or two sentences each).
- Lay nodes left to right, 140 x 60, about 40 px gaps; use curved `C` paths for branches. Typical viewBox `0 0 1060 360`.

**Mermaid**: `src/diagrams/<diagram>.mmd` (a `flowchart`), used when no `.svg` of that name exists. Add one comment line mapping node ids to steps: `%% steps: A=1 B=2 C=3 D=3`. Edges take the step of the node they point into. Use simple alphanumeric node ids. Rendered at build time (needs the browser env above) and themed in `global.css` (`.mermaid-diagram`). Fenced ```` ```mermaid ```` blocks in an MDX body also render at build time, but those are static (not step-animated).

Check every diagram: the build passes, no label overflows its box, the diagram reads correctly in light and dark, and the last node's step matches the last walkthrough entry.

## Add / update workflows

Slash commands (in `.claude/commands/`, each repeats the git rule):

- `/add-project <path to project folder> [notes]`: analyze a project folder, ask for missing links and metrics, write the case-study MDX and its animated diagram, pick accent colors, verify the generated OG image, offer a README upgrade (diff first), build and check, summarize TODOs and suggest a commit message.
- `/update-project <slug or path> [notes]`: re-analyze a changed project and update its case study, preserving text the owner edited by hand (diff first).
- `/add-note <topic or project folder>`: draft a Writing/Notes post as `draft: true`.

Manual: `npm run new-project -- "Name"`, fill the frontmatter, run `npm run dev`.

OG images (`/og/projects-<slug>.png`), the sitemap, the command palette entries, the Home cards and the index filters all update automatically from the content files. Nothing else to edit.

## Definition of done for content or UI changes

1. `npm run check` reports 0 errors and `npm run build` succeeds.
2. `npm run links` passes. For UI changes, `npm run build && PW_CHANNEL=chrome npx playwright test --project=chromium` passes (includes axe in light and dark).
3. Quality bar (budgets are enforced in CI by `lighthouserc.json`): LCP under 2.0 s, CLS under 0.05, initial JS under 100 KB gzipped, Lighthouse at least 90 Performance and 95 Accessibility, Best Practices and SEO, WCAG AA contrast in both themes, responsive from 360 px to ultra-wide.
4. Look at it (screenshots at 375, 768 and 1440 px in both themes) before saying it is done.
5. List what you could not verify and any TODOs. Never report success you did not observe.

## Layout of the repo

```
src/content/{projects,work,notes}/   MDX content (schema: src/content.config.ts)
src/diagrams/                        animated architecture diagrams (.svg or .mmd)
src/data/{site,experience}.ts        identity, nav, links; experience timeline and skills
src/components/                      CaseStudy, ArchitectureDiagram, ProjectCard, Header, Footer, HeroStream, ...
src/lib/                             content helpers, url(), ui (motion/theme), interactions, diagram-anim, palette, og, mermaid-diagram, hero-stream
src/pages/                           routes (projects/[slug], work/[slug], notes/[slug], og/[...slug].png.ts, ...)
src/styles/                          tokens.css, global.css
tests/                               Playwright specs
scripts/                             new-project, check-links, secrets-scan, contrast
docs/                                ANIMATION.md, DEPLOY.md
.github/workflows/                   deploy.yml, ci.yml
.claude/commands/                    add-project, update-project, add-note
```
