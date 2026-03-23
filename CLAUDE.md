# AM Scorecard — Project Context

## What This Is

This repo contains the weekly Ocrolus AM (Account Manager) sales call scorecard — an HTML dashboard hosted via GitHub Pages at `index.html`. It displays scored Gong sales calls for three reps, with per-call breakdowns, coaching notes, MEDDPICC coverage, and cross-rep comparisons.

The scorecard is updated weekly (typically Sundays) and shared with sales leadership via a permanent Google Drive URL and Slack.

## The Reps

| Rep | Title | Gong User ID |
|-----|-------|-------------|
| Anjelica Purnell | Account Manager | REPLACE_WITH_GONG_ID |
| Noah Jones | Account Manager | REPLACE_WITH_GONG_ID |
| Elizabeth Spade | Account Manager | REPLACE_WITH_GONG_ID |

## Gong API Details

- **Workspace ID**: 509723422617923879
- **getCalls** requires explicit workspace ID and date range in ISO 8601 with timezone offset (e.g., `2026-03-09T00:00:00-05:00`)
- **getCallTranscripts** must be fetched one call at a time: `filter: { callIds: ["<single_id>"] }` (bulk fetches exceed size limits)
- Filter defaults: `scope = "External"`, `direction = "Conference"`, `duration > 600` seconds
- Users endpoint paginates at 100 per page; all three reps are known IDs above

## Scoring Framework (v9)

Four frameworks, weighted:

| Framework | Weight | Primary Influence |
|-----------|--------|-------------------|
| MEDDPICC | 30% | Discovery depth, qualification rigor, deal mechanics |
| Gap Selling | 30% | Problem diagnosis, current/future state, business impact |
| The Challenger Sale | 25% | Value delivery, commercial teaching, process control |
| Never Split the Difference (Voss) | 15% | Tactical empathy, rapport, engagement, negotiation |

### Six Scoring Dimensions (1-10 scale)

```
Weighted Score = (Rapport × 0.10) + (Discovery × 0.30) + (Value × 0.15) +
                 (Advancement × 0.20) + (Control × 0.10) + (Engagement × 0.15)
```

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| Rapport & Connection | 10% | Opening quality, tactical empathy, mirroring, labeling |
| Discovery & Qualification | 30% | MEDDPICC coverage, Gap Selling diagnosis, calibrated questions |
| Value Articulation | 15% | Challenger teach/tailor, ROI framing, proof points |
| Deal Advancement | 20% | Next steps, mutual action plan, take control behaviors |
| Call Control & Structure | 10% | Agenda, transitions, talk ratio, redirection |
| Prospect Engagement | 15% | Buying signals, "that's right" moments, voluntary elaboration |

### v9 MEDDPICC Philosophy

MEDDPICC is a **multi-call** framework, not a single-call checklist. Reps are expected to cover 2-4 elements per call based on stage:
- Early: Pain, Metrics, Decision Process
- Mid: Economic Buyer, Decision Criteria, Champion
- Late: Competition, validation of prior elements

Score **depth over breadth**. Pattern-level gaps (across multiple calls) matter more than single-call gaps.

## Transcript Processing

**MANDATORY**: Never score raw Gong transcripts directly. Always use the transcript processor first.

```bash
python3 scripts/process_transcript.py <raw_transcript.json> <summary_output.json>
```

The processor extracts: opening/middle/pricing/next-steps/closing segments, speaker talk ratios, rep questions, prospect positive signals. It condenses large transcripts into a workable scoring summary.

## HTML Dashboard Structure

`index.html` is a single-file HTML dashboard with embedded CSS and JS. Key sections:
- Header with version, date range, and rep count
- Per-rep cards with scored calls, dimension breakdowns, coaching notes
- MEDDPICC coverage heatmaps (color-coded: green/yellow/red)
- Cross-rep comparison and team-level insights
- Footer with rubric version and framework weights

### Design Conventions
- Color palette: dark blue (#1F3864), medium blue (#2E75B6), green (#C6EFCE), yellow (#FFEB9C), red (#FFC7CE)
- Score color logic: ≥8.0 green, 5.0-7.99 yellow, <5.0 red
- All data is embedded inline (no external API calls from the HTML)
- Mobile-responsive layout

## Workflow for Weekly Updates

1. Pull calls for the date range: `getCalls` with workspace ID + date range
2. Filter by rep user IDs, external scope, >10 min duration
3. Pull transcripts one at a time via `getCallTranscripts`
4. Process each through `scripts/process_transcript.py`
5. Score each call against the 6 dimensions
6. Update `index.html` with new call data
7. Git commit and push

## DOCX Output (Optional)

When requested, generate a formatted Word doc using `scripts/generate_docx_template.js`. See `references/docx_format.md` for the full formatting spec. The doc is formatted for delivery to John Lowenthal (VP Sales) and Andrew Rains (CRO).

## Slack Distribution

Confirmed Ocrolus Slack user IDs for scorecard distribution:
- Matt Bronen: U042XCUG8BE
- Adam Hanson: U0239947F6J
- Andrew Barnes: U0A65V8CGT1
- Andrew Rains (CRO): U045N7073UM

## File Structure

```
AE-Scorecard/
├── CLAUDE.md                          ← This file (project context for Claude Code)
├── index.html                         ← The HTML dashboard (main deliverable)
├── scripts/
│   ├── process_transcript.py          ← Mandatory transcript processor
│   └── generate_docx_template.js      ← DOCX report generator template
├── CHANGELOG.md                       ← Version history (v7 → v8 → v9)
├── AE-Scorer_v9.skill                 ← Current skill file (ZIP archive)
└── references/
    └── docx_format.md                 ← DOCX formatting specification
```
