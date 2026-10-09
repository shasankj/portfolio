---
description: Analyze a project folder and add it to the portfolio as a case study with an animated architecture diagram
argument-hint: <relative path to project folder> [optional notes]
---

Add a project to this portfolio. Arguments: `$ARGUMENTS` (first token is the path to the project folder, relative to the workspace root, which is the parent of `portfolio/`; the rest is the owner's notes).

## Git rule (repeat of CLAUDE.md, non-negotiable)

Never run `git commit`, `git push`, `git tag`, `git rebase`, `git reset`, `git stash`, `git add`, `git rm`, `git restore`, `git checkout -- <path>`, or any command that creates, stages or rewrites commits, history or the index, in this repo or in any project folder. Read-only git commands only (`status`, `diff`, `log`, `show`, `ls-files`, `check-ignore`). The owner commits manually. Never add "Co-Authored-By", "Generated with" or any AI attribution anywhere.

Also: never invent metrics or outcomes (use `TODO:` and tell the owner), never copy secrets into the portfolio, never print a secret in full, and never modify the project folder without showing the diff and getting a yes. Read `CLAUDE.md` first and follow it (schema, writing style, tokens, motion, diagram conventions).

## Steps

1. **Resolve the folder.** If no path was given, list the sibling folders (excluding `portfolio/`) and ask which one. Check there is no existing case study for it (`src/content/projects/`, `src/content/work/`); if there is, tell the owner to use `/update-project` instead.

2. **Analyze it** (read, do not change anything). Read the README, WORKBOOK/docs, `package.json` / `requirements.txt` / `pom.xml` / `pyproject.toml`, infra files (Terraform, SAM, CDK, Dockerfiles, compose, CI configs), the main source, tests, and `git log` (read-only) for real debugging history. Infer and write down for yourself: purpose, who it is for, stack, architecture and data flow, cloud services, anything notable (concurrency, retries, caching, eval logic, guardrails, constraints), what is tested, how it is deployed, known limitations. Note where each claim came from.

3. **Secrets check.** Run `node scripts/secrets-scan.mjs "<folder>"` and read the result. Triage each hit (real, fixture, placeholder). Report findings with file paths and **masked** values only. If anything looks real or an env file was ever committed, stop and tell the owner before going further. Never copy values into the portfolio.

4. **Ask for what is missing** with one AskUserQuestion round (skip questions the folder already answers): live demo URL, repository URL, 2-minute video URL (optional, omit if none), the owner's role on it, whether it is `live` / `in-progress` / `archived`, and **real metrics** (load tests, eval results, users, latency, cost). Also ask whether it should be `featured` and which `order` it deserves (AI projects first). Do not make up answers: unknown becomes `metrics: []` or a `TODO:` line.

5. **Scaffold.** Run `npm run new-project -- "<Project Name>"`. It creates `src/content/projects/<slug>.mdx` and a starter `src/diagrams/<slug>.svg`.

6. **Write the case study.** Fill the frontmatter and the body per `CLAUDE.md`:
   - TL;DR (2 to 3 sentences), `summary`, tags from the allowed set, stack and cloud badges, links.
   - Body = **Problem** (1 to 3 short paragraphs, first person, impact first).
   - `decisions`: decision, why, alternative considered. Source them from the code, docs and commits.
   - `challenges`: only real stories you can source (commits, fix history, workbook, test names). Root cause, fix, lesson.
   - `metrics`: only numbers found in the project or given by the owner, each with what it was measured on. Otherwise `metrics: []`.
   - `readiness`: tests, CI/CD, observability, security, cost. State plainly what exists and what does not. No `TODO:` unless the owner could fill it in later and it is genuinely unknown.
   - `next`: 3 to 4 concrete next steps.
   - `draft: true` until the owner approves.

7. **Animated diagram.** Replace the starter SVG with a real one following "Diagram conventions" in `CLAUDE.md`: `data-step` on every node and edge, a node and the edges into it share a step, one `steps` entry per step in the frontmatter, short labels that fit 140 px boxes, `diagramAlt` filled in. Copy the marker `<defs>` and layout style from `src/diagrams/care-bot.svg`. Mermaid (`.mmd` with a `%% steps:` line) is acceptable if the owner prefers it.

8. **Accent color and cover.** Pick `accentColor` (light) and `accentColorDark` that suit the project and differ from existing projects. Verify with `node scripts/contrast.mjs "<light>" "<dark>"`; both must pass 4.5:1. The cover pattern and the OG image (`/og/projects-<slug>.png`) are generated from the slug and accent at build time; confirm the OG file exists in `dist/og/` after the build and look at it.

9. **README upgrade (offer, do not do silently).** Ask whether to write or upgrade the project's own `README.md`. If yes, draft it (overview, architecture diagram as Mermaid or ASCII, setup in 3 commands or fewer, an environment-variable table with **names and descriptions only, no values**, tests, deployment, a link back to the portfolio case study) and **show the owner a unified diff against the existing README first**. Write to the project folder only after an explicit yes.

10. **Verify.** Run `npm run check` and `npm run build` and fix errors in the files you created. Start `npm run dev` (stop a stale server with `astro dev stop` first) or use `astro preview`, and look at the case-study page at 375 and 1440 px in both themes: no label overflow in the diagram, the walkthrough highlights each step, nothing is cut off. Run `npm run links`. If you changed anything beyond content, run the Playwright suite (see CLAUDE.md).

11. **Summarize.** List: files added or changed, the secrets-check result, what the owner still needs to supply (every `TODO:` and empty `metrics`), anything you could not verify, and a **suggested commit message**. Then stop. Do not commit, do not stage.
