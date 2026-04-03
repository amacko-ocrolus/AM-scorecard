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
- Filter defaults: `scope = "External"`, `direction = "Conference"`, `duration > 300` seconds (5 min minimum)
- Title-based exclusions: training sessions, internal/team syncs, 1:1s, pipeline reviews, handoffs/transitions, POV/proof of value, pilot calls, trial evaluations, kickoff/kick-off calls
- Calls that ARE scored: regular client check-ins, QBRs/business reviews, escalations, onboarding calls, demos, support/troubleshooting, expansion discussions
- Users endpoint paginates at 100 per page; all five reps are known IDs above

## Scoring Framework (AM Scorecard v1.1 — Career Pathing Integration)

### Foundation: Ocrolus AM Career Pathing Competency Model

The scoring methodology is grounded in the Ocrolus AM Career Pathing document, which defines 6 competencies across 3 career levels (AM I → AM II → Senior AM). Each scoring dimension maps to a career competency with level-specific behavioral anchors.

### Multi-Layer Scoring Model

The AM Scorecard uses a multi-layer approach:
1. **Five Scoring Dimensions** — 1-10 scale per call, anchored to AM career competencies
2. **Four Pillars of Success** — binary (yes/no) tracking per call (did it happen?)
3. **Three Key Areas** — tagged per call (which areas were advanced?)
4. **AM Profile Classification** — behavioral style per call
5. **Career Maturity Level** — AM I / AM II / Senior AM sophistication per call
6. **Ocrolus Values Assessment** — Empathy, Curiosity, Humility, Ownership (scored but not displayed on dashboard)

### Five Scoring Dimensions (1-10 scale)

```
Weighted Score = (Relationship Quality × 0.20) + (Client Discovery × 0.25) +
                 (Value Delivery × 0.25) + (Strategic Advancement × 0.20) +
                 (Client Engagement × 0.10)
```

| Dimension | Weight | Career Competency | What It Measures |
|-----------|--------|-------------------|------------------|
| Relationship Quality | 20% | Client Relationship Management | Rapport, trust, multi-threading, stakeholder awareness, advocacy cultivation |
| Client Discovery | 25% | Client Retention | Client health, satisfaction, pain points, usage/volume patterns, churn signals |
| Value Delivery | 25% | Subject Matter Expertise | ROI validation, industry knowledge, product knowledge, advising, best practices |
| Strategic Advancement | 20% | Strategic Account Planning | Next steps, expansion, roadmap alignment, upsell/cross-sell, negotiation |
| Client Engagement | 10% | — | Client energy, voluntary elaboration, positive signals, advocacy indicators |

Each dimension uses career-level behavioral anchors for score calibration:
- **AM I behaviors → scores 5-6**: Foundational execution, reactive, handles basics independently
- **AM II behaviors → scores 7-8**: Strategic, proactive, anticipates needs, independent on most activities
- **Senior AM behaviors → scores 9-10**: Multi-threaded strategy, executive influence, mentors peers, market expert

### Four Pillars of Success (Binary per Call)

| Pillar | Key | What to Look For |
|--------|-----|-----------------|
| Key Decision Maker | KDM | Was the call held with someone who has authority over budget, renewal, or strategic direction? |
| Client Success | CS | Did the AM discuss whether Ocrolus is helping the client achieve their goals/find success? |
| Additional Value | AV | Did the AM explore ways to bring more value (new features, use cases, expanded usage)? |
| Product Roadmap | PR | Did the AM discuss Ocrolus product roadmap, upcoming features, or product direction? |

Tracked as 1 (covered) or 0 (not covered) per call. Displayed as a heatmap across calls.

### Three Key Areas (Tags per Call)

| Area | Color | What It Means on a Call |
|------|-------|------------------------|
| Retention | Green | AM validated client health, addressed concerns, confirmed value realization, strengthened relationship |
| Expansion | Blue | AM identified upsell/cross-sell opportunities, explored new use cases, discussed volume growth |
| Advocacy | Purple | AM cultivated advocacy — references, case studies, peer introductions, event participation |

### AM Profile Classification

| Profile | Description |
|---------|-------------|
| Trusted Advisor | Proactive guidance, strategic insights, positioned as partner, client seeks AM's opinion |
| Relationship Builder | Strong rapport, responsive, but may miss strategic/expansion opportunities |
| Problem Solver | Primarily reactive — resolves issues but doesn't proactively advance the account |
| Account Grower | Actively pursues expansion — new use cases, volume growth, cross-sell, upsell |
| Caretaker | Maintains status quo, routine check-ins, no meaningful forward momentum |

### Career Maturity Level (New in v1.1)

Per-call assessment of AM behavioral sophistication, mapped to the AM Career Pathing levels:

| Level | What It Looks Like on a Call |
|-------|------------------------------|
| AM I | Executes core activities, foundational knowledge, handles basics independently, reactive |
| AM II | Anticipates needs, strategic account plans, independent negotiations, connects product to outcomes |
| Senior AM | Multi-threaded strategies, executive relationships, translates insights to internal strategy, mentors |

This reflects call-level behavior, not a performance evaluation of the person.

### Ocrolus Values Assessment (New in v1.1)

Scored per call but not displayed on dashboard (available for coaching/analysis):

| Value | Observable Signals |
|-------|-------------------|
| Empathy | Tailored solutions, acknowledging frustrations, active listening, "I understand" language |
| Curiosity | Open-ended questions, client-specific research, probing deeper, learning mindset |
| Humility | Acknowledging unknowns, accepting feedback, not overselling, learning from client |
| Ownership | Specific next steps with dates, volunteering to handle items, "I will..." language |

### Four Pillars Philosophy

The Four Pillars are **not a single-call checklist**. AMs should cover 2-3 pillars per call based on the client relationship stage and call purpose:
- Regular check-ins: Client Success + Additional Value
- QBRs/strategic reviews: All four pillars
- Product-focused calls: Product Roadmap + Additional Value
- Escalation/issue calls: Client Success + Key Decision Maker

Score **depth over breadth**. Pattern-level gaps (across multiple calls) matter more than single-call gaps.

### Coaching Principles

- **Keep/Start/Stop = ONE item each** — the single highest-impact action per category, not a list
- **No rep name openers** — don't start coaching with "Sarah, you need to..." — get straight to the point
- **Executive-level gravitas** — coaching reads like a senior leader, not a checkbox audit
- **Never criticize call length** — long calls usually mean an engaged customer
- **Specific call references** — coaching must cite actual call moments, not generic advice. Reference what the client said and suggest a specific alternative phrase or question the AM could have used
- **Multi-call patterns > single-call gaps** — one missed dimension on one call doesn't matter; the same gap across multiple calls is the coaching moment

### Pillar Coaching Format

The `pillarCoaching` field must be **1-2 paragraphs** of synthesized, actionable insights — not per-call notes. Each week, analyze pillar coverage across all of a rep's calls and generate a concise summary that:

- Identifies which pillars are **consistently missed** and which are **consistently covered** across the week's calls
- Provides **1-2 specific, actionable suggestions** with example questions or phrases the AM could use to address their pillar gaps
- If prior week data is available, notes whether the rep is **improving or regressing** on pillar coverage
- Follows the same coaching principles above: executive gravitas, no name openers, cite specific call moments only when illustrating a pattern
- Reads as a brief coaching talking point a manager can reference in a 1:1, not a transcript audit

Do **not** produce per-call pillar notes. The output should be a pattern-level synthesis that a reader can absorb in under 30 seconds.

### Epistemic Humility

- AI has transcripts only — no tone, body language, account history, or relationship context
- Call-level behaviors only — do not infer CRM hygiene, meeting frequency, or quantitative KPIs
- Low-confidence feedback must be excluded
- Use "the transcript shows" not "the AM felt"

### What Is NOT Scored (Manager-Assessed Only)

These career-pathing KPIs are not observable from transcripts:
- Meeting frequency (1/month per client)
- Testimonial quotas (1/quarter)
- Forecast accuracy (within 12%)
- Salesforce logging compliance
- NRR numbers
- In-person visit frequency

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
- Key Area tags per call (Retention/Expansion/Advocacy)
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
