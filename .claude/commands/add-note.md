---
description: Draft a Writing/Notes post from a topic or from a project folder
argument-hint: <topic, or relative path to a project folder> [optional angle]
---

Draft a note for the Writing section. Arguments: `$ARGUMENTS` (a topic in plain words, or a path to a project folder to mine for a story, plus an optional angle).

## Git rule (repeat of CLAUDE.md, non-negotiable)

Never run `git commit`, `git push`, `git tag`, `git rebase`, `git reset`, `git stash`, `git add`, `git rm`, `git restore`, `git checkout -- <path>`, or any command that creates, stages or rewrites commits, history or the index. Read-only git commands only. The owner commits manually. Never add "Co-Authored-By", "Generated with" or any AI attribution to the note or anywhere else.

Also: never invent facts, numbers or experiences; never copy secrets; never modify a project folder. Read `CLAUDE.md` first (writing style applies in full).

## Steps

1. **Decide the source.** If the argument is a folder, read its README, workbook, tests and `git log` (read-only) and find one real, specific story: a bug, a trade-off, a measurement, a design decision. If it is a topic, ask the owner (AskUserQuestion) for the real experience behind it, or tie it to an existing case study. Do not write generic explainers: a note must come from something the owner actually built or debugged.

2. **Pick one narrow point.** A good note answers one question ("How do I prevent double-booking?", "Why did hybrid search get worse?"). Aim for 400 to 800 words, plain headings, one small code or config snippet at most, no filler intro.

3. **Create `src/content/notes/<slug>.mdx`** (slug: lowercase, digits, hyphens; not already used). Frontmatter:
   ```yaml
   title: "..."
   slug: "..."
   description: "One sentence, max 240 chars, says what the reader learns"
   date: <today, YYYY-MM-DD>
   tags: ["..."]
   project: "<slug of a related case study, optional>"
   draft: true
   ```
   Body: first person, impact first, concrete (name the mechanism, show the number and what it was measured on). Structure that works: the problem, the tempting approach and why it fails, what I did, the evidence, what I would check next. Where the source does not contain a fact, write `TODO:` in the text instead of inventing it.

4. **Link it**: if it relates to a project, set `project` and, where natural, mention it in prose. Do not edit page components.

5. **Verify**: `npm run check` and `npm run build` (drafts are excluded from the build, so also open it in `npm run dev` at `/notes/<slug>/` and read it at 375 and 1440 px).

6. **Summarize**: the file created, the one point it makes, where each fact came from, the `TODO:` lines left for the owner, and a **suggested commit message**. Tell the owner to set `draft: false` when ready. Stop. Do not commit, do not stage.
