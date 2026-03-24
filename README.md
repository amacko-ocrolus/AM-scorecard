# AM Client Call Scorecard

Weekly scorecard for Ocrolus Account Manager client calls, powered by Gong transcript analysis.

## View the Scorecard

**Live Dashboard:** [https://amacko-ocrolus.github.io/AM-scorecard/](https://amacko-ocrolus.github.io/AM-scorecard/)

Sign in with your Ocrolus GitHub account (work email) to access the dashboard. You must be a member of the `amacko-ocrolus` GitHub organization.

> **Note:** If GitHub Pages is not yet enabled, a repo admin needs to go to **Settings > Pages** and set the source to the `main` branch.

## What It Does

The scorecard evaluates AM client calls across three layers:

- **Four Pillars of Success** (binary per call) — Key Decision Maker, Client Success, Additional Value, Product Roadmap
- **Five Scoring Dimensions** (1-10 scale) — Relationship Quality, Client Discovery, Value Delivery, Strategic Advancement, Client Engagement
- **Three Key Areas** (tags per call) — Retention, Expansion, Evangelism

## Reps

| Rep | Title |
|-----|-------|
| Anjelica Purnell | Account Manager |
| Noah Jones | Account Manager |
| Elizabeth Spade | Account Manager |

## Weekly Update Workflow

1. Pull calls from Gong API for the date range
2. Filter by rep, external scope, >10 min duration
3. Fetch transcripts one at a time
4. Process each through `scripts/process_transcript.py`
5. Score against all dimensions
6. Update `index.html` with new data
7. Commit and push — dashboard updates automatically

## File Structure

```
AM-Scorecard/
├── index.html                         ← Live dashboard (GitHub Pages)
├── scripts/
│   ├── process_transcript.py          ← Transcript processor (run before scoring)
│   └── generate_docx_template.js      ← DOCX report generator
├── score.js                           ← Scoring logic
├── CLAUDE.md                          ← Project context for Claude Code
├── CHANGELOG.md                       ← Version history
└── references/
    └── docx_format.md                 ← DOCX formatting spec
```

## Scoring Weights

```
Weighted Score = (Relationship Quality × 0.20) + (Client Discovery × 0.25) +
                 (Value Delivery × 0.25) + (Strategic Advancement × 0.20) +
                 (Client Engagement × 0.10)
```

| Score | Color |
|-------|-------|
| 8.5+  | Green |
| 7.5 - 8.49 | Blue |
| < 7.5 | Yellow |

## Distribution

The scorecard is updated weekly (typically Sundays) and shared with sales leadership via a permanent Google Drive URL and Slack.
