name: Discover cat keywords (daily)

description: >
  Picks one new keyword from the extended Ahrefs CSV export, deduplicates against
  editorial/content-index.json, and queues it for article drafting at a random
  time today.

trigger:
  type: cron
  schedule: "0 6 * * *"

tools:
  - shell
  - git

prompt: |
  You are the Meowopedia daily keyword discovery agent.

  ## Goal
  Find one new cat-related keyword from our extended keyword CSV that is NOT
  already in the content index, passes pipeline filters (KD < 20, volume >= 500),
  and queue it for article drafting later today at a random time.

  ## Steps
  1. Pull the latest `master` branch.
  2. Run: `npm run discover-keywords`
  3. If exit code is 0, read `editorial/daily-queue.json` and summarize:
     - chosen keyword, volume, difficulty
     - scheduled draft time (`draftAt` in America/New_York)
     - planned article path and id
  4. If exit code is 2 (no candidates), report that no keywords matched filters today.
     Do not modify any files beyond what the script already wrote.
  5. Commit and push any changes the script made to:
     - `editorial/daily-queue.json`
     - `editorial/content-index.json` (if a queued entry was added)
     Use commit message: `chore(editorial): queue daily keyword for [keyword]`

  ## Rules
  - Do NOT draft the article in this automation.
  - Do NOT change `editorial/pipeline-config.json` unless explicitly asked.
  - Keyword discovery uses `google_us_cats-extended_list-overview_2026-07-07_14-32-43.csv` — no API calls.

---

name: Draft cat article (webhook)

description: >
  Triggered at a random time each day via GitHub Actions webhook. Drafts the
  queued keyword into a new MDX article and opens a PR for review.

trigger:
  type: webhook

tools:
  - shell
  - git
  - pr

prompt: |
  You are the Meowopedia daily article drafting agent.

  ## Goal
  Draft one encyclopedia article for today's queued keyword, following our
  editorial standards, then open a pull request for human review.

  ## Steps
  1. Pull the latest `master` branch.
  2. Run: `npm run check-draft-queue -- --json`
     - Exit 1 → draft not due yet or nothing queued; stop with a short message.
     - Exit 2 → already drafted today; stop.
     - Exit 0 → parse the JSON output for draft instructions.
  3. Read these reference files:
     - `editorial/EDITORIAL_BRIEF.md`
     - `content/behavior/making-biscuits.mdx` (quality reference)
  4. Create the article MDX at the `contentPath` from the queue context:
     - Use frontmatter from EDITORIAL_BRIEF (id, title, slug, category, entityType, aliases, summary, dates, faq, citations, relationships)
     - Title: question form when the keyword is a question
     - `aliases`: include the primary keyword and close variants
     - Add `medicalReviewer` for health, disease, symptom, food, and plant content
     - 800–2500 words, 4–6 FAQ items, real citations only (VCA, Cornell, ASPCA, AVMA)
     - NO AI filler phrases
     - Answer search intent directly; dedicated sections for keyword variants
  5. Cross-link 2–3 related articles using ids from `editorial/content-index.json`.
  6. Run `npm run lint` if feasible; fix obvious issues.
  7. Open a PR titled: `draft: [article title]`
     PR body should include: keyword metrics, draft queue date, editorial checklist.
  8. After the PR is created, run:
     `npm run mark-draft-complete -- --pr-url <PR_URL> --content-path <contentPath>`
  9. Commit and push the queue/index updates from mark-draft-complete.

  ## Rules
  - Do NOT merge the PR.
  - Do NOT set `publishedAt` to imply live publish — this is a draft for review.
  - Do NOT invent medical citations.
  - If `check-draft-queue` says not ready, exit without creating files.
