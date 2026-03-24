# AM Scorecard — Project Context

## What This Is

This repo contains the weekly Ocrolus AM (Account Manager) client call scorecard — an HTML dashboard hosted via GitHub Pages at `index.html`. It displays scored Gong client calls for five AMs, with per-call breakdowns, coaching notes, Four Pillars coverage, and cross-rep comparisons.

The scorecard is updated weekly (typically Sundays) and shared with sales leadership via a permanent Google Drive URL and Slack.

## The Reps

| Rep | Title | Gong User ID |
|-----|-------|-------------|
| Anjelica Purnell | Account Manager | 7521307078149635406 |
| Noah Jones | Account Manager | 8357687250089071625 |
| Elizabeth Spade | Account Manager | 1260140667797651866 |
| Madeline Mazzella | Account Manager | 926479123958068574 |
| Spencer Schultz | Account Manager | 7188235930408947059 |

## Gong API Details

- **Workspace ID**: 509723422617923879
- **getCalls** requires explicit workspace ID and date range in ISO 8601 with timezone offset (e.g., `2026-03-09T00:00:00-05:00`)
- **getCallTranscripts** must be fetched one call at a time: `filter: { callIds: ["<single_id>"] }` (bulk fetches exceed size limits)
- Filter defaults: `scope = "External"`, `direction = "Conference"`, `duration > 600` seconds
- Users endpoint paginates at 100 per page; all five reps are known IDs above

## Scoring Framework (AM Scorecard v1)

### Two-Layer Scoring Model

The AM Scorecard uses a two-layer approach:
1. **Four Pillars of Success** — binary (yes/no) tracking per call (did it happen?)
2. **Five Scoring Dimensions** — 1-10 scale per call (how well did the AM perform?)

Plus:
3. **Three Key Areas** — tagged per call (which areas were advanced?)

### Four Pillars of Success (Binary per Call)

| Pillar | Key | What to Look For |
|--------|-----|-----------------|
| Key Decision Maker | KDM | Was the call held with someone who has authority over budget, renewal, or strategic direction? |
| Client Success | CS | Did the AM discuss whether Ocrolus is helping the client achieve their goals/find success? |
| Additional Value | AV | Did the AM explore ways to bring more value (new features, use cases, expanded usage)? |
| Product Roadmap | PR | Did the AM discuss Ocrolus product roadmap, upcoming features, or product direction? |

Tracked as 1 (covered) or 0 (not covered) per call. Displayed as a heatmap across calls.

### Five Scoring Dimensions (1-10 scale)

```
Weighted Score = (Relationship Quality × 0.20) + (Client Discovery × 0.25) +
                 (Value Delivery × 0.25) + (Strategic Advancement × 0.20) +
                 (Client Engagement × 0.10)
```

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| Relationship Quality | 20% | Rapport, trust signals, multi-threading, stakeholder awareness, tactical empathy |
| Client Discovery | 25% | Uncovering client health, satisfaction, pain points, usage patterns, business changes |
| Value Delivery | 25% | ROI validation, demonstrating ongoing value, teaching/advising, best practice sharing |
| Strategic Advancement | 20% | Next steps, action items, expansion signals, roadmap alignment, mutual planning |
| Client Engagement | 10% | Client energy, voluntary elaboration, positive signals, advocacy indicators |

### Three Key Areas (Tags per Call)

Each call is tagged with which areas were actively advanced:

| Area | Color | What It Means on a Call |
|------|-------|------------------------|
| Retention | Green | AM validated client health, addressed concerns, confirmed value realization, strengthened relationship |
| Expansion | Blue | AM identified upsell/cross-sell opportunities, explored new use cases, discussed volume growth |
| Evangelism | Purple | AM cultivated advocacy — references, case studies, peer introductions, event participation |

### AM Profile Classification

| Profile | Description |
|---------|-------------|
| Trusted Advisor | Deep strategic relationship, proactive guidance, client views AM as partner |
| Relationship Builder | Strong rapport, responsive, but may miss strategic/expansion opportunities |
| Problem Solver | Excellent at reactive support, but doesn't proactively advance the account |
| Account Grower | Strong expansion instincts, identifies opportunities, drives revenue growth |
| Caretaker | Maintains status quo, keeps client satisfied but doesn't advance the relationship |

### Four Pillars Philosophy

The Four Pillars are **not a single-call checklist**. AMs should cover 2-3 pillars per call based on the client relationship stage and call purpose:
- Regular check-ins: Client Success + Additional Value
- QBRs/strategic reviews: All four pillars
- Product-focused calls: Product Roadmap + Additional Value
- Escalation/issue calls: Client Success + Key Decision Maker

Score **depth over breadth**. Pattern-level gaps (across multiple calls) matter more than single-call gaps.

### Epistemic Humility

- AI has transcripts only — no tone, body language, account history, or relationship context
- Low-confidence feedback must be excluded
- Use "the transcript shows" not "the AM felt"

## Transcript Processing

**MANDATORY**: Never score raw Gong transcripts directly. Always use the transcript processor first.

```bash
python3 scripts/process_transcript.py <raw_transcript.json> <summary_output.json>
```

The processor extracts: opening/middle/closing segments, speaker talk ratios, AM questions, client positive signals (including retention, expansion, and advocacy indicators). It condenses large transcripts into a workable scoring summary.

## HTML Dashboard Structure

`index.html` is a single-file HTML dashboard with embedded CSS and JS. Key sections:
- Header with version, date range, and rep count
- Per-rep cards with scored calls, dimension breakdowns, coaching notes
- Four Pillars coverage heatmaps (color-coded: green/gray)
- Key Area tags per call (Retention/Expansion/Evangelism)
- Cross-rep comparison and team-level insights
- Footer with rubric version and dimension weights

### Design Conventions
- Color palette: dark blue (#1F3864), medium blue (#2E75B6), green (#C6EFCE), yellow (#FFEB9C), red (#FFC7CE)
- Score color logic: ≥8.5 green, 7.5-8.49 blue, <7.5 yellow
- All data is embedded inline (no external API calls from the HTML)
- Mobile-responsive layout

## Workflow for Weekly Updates

1. Pull calls for the date range: `getCalls` with workspace ID + date range
2. Filter by rep user IDs, external scope, >10 min duration
3. Pull transcripts one at a time via `getCallTranscripts`
4. Process each through `scripts/process_transcript.py`
5. Score each call against the 5 dimensions + 4 Pillars + 3 Key Areas
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
AM-Scorecard/
├── CLAUDE.md                          ← This file (project context for Claude Code)
├── index.html                         ← The HTML dashboard (main deliverable)
├── scripts/
│   ├── process_transcript.py          ← Mandatory transcript processor
│   └── generate_docx_template.js      ← DOCX report generator template
├── CHANGELOG.md                       ← Version history
└── references/
    └── docx_format.md                 ← DOCX formatting specification
```
