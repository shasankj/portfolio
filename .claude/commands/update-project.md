---
description: Re-analyze a project that changed and update its case study without overwriting the owner's hand edits
argument-hint: <project slug or path to project folder> [optional notes]
---

Update an existing case study. Arguments: `$ARGUMENTS` (a slug in `src/content/projects/` or `src/content/work/`, or the project folder path; the rest is the owner's notes about what changed).

## Git rule (repeat of CLAUDE.md, non-negotiable)

Never run `git commit`, `git push`, `git tag`, `git rebase`, `git reset`, `git stash`, `git add`, `git rm`, `git restore`, `git checkout -- <path>`, or any command that creates, stages or rewrites commits, history or the index, in this repo or in any project folder. Read-only git commands only. The owner commits manually. Never add "Co-Authored-By", "Generated with" or any AI attribution anywhere.

Also: never invent metrics, never copy secrets into the portfolio (mask them in output), never modify the project folder without showing the diff and getting a yes. Read `CLAUDE.md` first.

## Steps

1. **Locate** the case study MDX and its diagram (`src/diagrams/<diagram>.svg` or `.mmd`) and the project folder. If the folder is not given, infer it from `links.repo` and the sibling folders, and confirm.

2. **Understand what the owner already edited.** Treat all existing prose as the owner's. Read `git log --follow -- <mdx>` and `git diff -- <mdx>` (read-only) to see whether the file has uncommitted edits or edits made after it was first generated. Never overwrite wording that looks hand-written. Only change a statement if the code now contradicts it.

3. **Re-analyze the project** exactly as in `/add-project` step 2 and 3 (stack, architecture, cloud services, notable engineering, tests, deployment, limitations, `git log` since the case study's `date`, and the masked secrets scan with `node scripts/secrets-scan.mjs`). Focus on what changed: new services, removed features, new tests, fixed limitations, new debugging history.

4. **Build a change proposal** as a list, each item tagged with its evidence (file or commit):
   - **Facts that became wrong** (stack, a limitation that is now fixed, a metric that changed): propose a minimal edit.
   - **New material** (a new decision, a new real challenge, new metrics, new readiness facts, new next steps): propose additions.
   - **Diagram**: does the architecture still match? If a node or flow changed, propose the SVG edit and the matching `steps` entries, keeping the `data-step` rules.
   - Leave everything else untouched.
   Ask the owner for missing facts (new links, new metrics) with AskUserQuestion; never guess.

5. **Show the diff first.** Produce the proposed edits as a unified diff against the current files and show it. Write nothing until the owner approves, in whole or per item. Apply only the approved items, with the smallest possible edits that preserve surrounding text and formatting. Keep `date` as is unless the owner says to change it; bump `status` only on request.

6. **README**: if the project's own README is now out of date, offer an updated version as a diff. Write to the project folder only after an explicit yes.

7. **Verify**: `npm run check`, `npm run build`, `npm run links`, and look at the page at 375 and 1440 px in both themes (diagram labels fit, walkthrough highlights every step).

8. **Summarize**: what changed and why (with evidence), what was deliberately left alone, remaining TODOs, anything unverified, and a **suggested commit message**. Then stop. Do not commit, do not stage.
