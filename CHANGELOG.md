# AM Scorecard — Version Changelog

## AM Scorecard v1 (2026-03-24)
**Complete transition**: AE Scorer v9 → AM Scorecard v1

### New: AM-Oriented Scoring Framework
- Replaced AE sales frameworks (MEDDPICC, Gap Selling, Challenger Sale, Voss) with AM client relationship framework
- Two-layer scoring: binary Four Pillars tracking + scored dimensions (1-10)
- Three Key Areas (Retention, Expansion, Advocacy) tagged per call

### New: Four Pillars of Success (Binary per Call)
- **Key Decision Maker (KDM)** — Was the call held with someone who has authority?
- **Client Success (CS)** — Did we discuss if Ocrolus is helping the client win?
- **Additional Value (AV)** — Did we explore ways to bring more value?
- **Product Roadmap (PR)** — Did we discuss Ocrolus product roadmap?
- Replaces MEDDPICC 7-element heatmap with 4-pillar heatmap

### New: Five Scoring Dimensions (replaces 6 AE dimensions)
- Relationship Quality (20%) — rapport, trust, multi-threading, stakeholder awareness
- Client Discovery (25%) — client health, satisfaction, pain points, usage patterns
- Value Delivery (25%) — ROI validation, ongoing value demonstration, best practice sharing
- Strategic Advancement (20%) — next steps, expansion signals, roadmap alignment
- Client Engagement (10%) — client energy, voluntary elaboration, advocacy indicators
- Weighted formula: (RQ × 0.20) + (CD × 0.25) + (VD × 0.25) + (SA × 0.20) + (CE × 0.10)

### New: Three Key Areas (Tags per Call)
- **Retention** (green) — validated client health, confirmed value realization
- **Expansion** (blue) — identified upsell/cross-sell, explored new use cases
- **Advocacy** (purple) — cultivated advocacy, references, case studies

### New: AM Profile Classification
- Trusted Advisor, Relationship Builder, Problem Solver, Account Grower, Caretaker
- Replaces Challenger Sale profiles (Challenger, Relationship Builder, Hard Worker, etc.)

### Changed: Call Scope (inverted from AE)
- AE v9 excluded existing customer calls — AM Scorecard scores them
- Focus is on client relationship calls, QBRs, check-ins, expansion discussions
- Excludes cold outreach, initial prospecting, and new business discovery calls

### Changed: Coaching Voice
- Retained Keep/Start/Stop format (one high-impact item each)
- Framework coaching now references AM best practices: relationship depth, value realization, expansion signals, advocacy cultivation
- Epistemic humility principle retained from v9

### Changed: Transcript Processor
- Updated keyword detection for AM context: renewal, adoption, roadmap, feature request, case study, reference, ROI, success, expand, rollout
- Updated signal detection for client engagement indicators

### Changed: Dashboard
- Header: "AE Scorer v9" → "AM Scorecard v1"
- Subtitle references: Retention · Expansion · Advocacy
- MEDDPICC view → Pillars view (4-row heatmap)
- Call cards show Key Area tags (colored badges)
- Compare view updated for new dimensions
- Auth localStorage key updated

### Changed: DOCX Report
- Replaced MEDDPICC/Challenger/Gap Selling/Voss lens tables with:
  - Four Pillars Coverage Table
  - Key Areas Assessment (Retention/Expansion/Advocacy)
  - AM Profile Classification
- Updated scoring dimensions in call-by-call table
- Updated appendix methodology

---

## AE Scorer v9 (2026-03-14)
**Renamed**: `gong-call-scorer` → `AE-Scorer`

### New: Prospect-Only Scope
- Analysis now explicitly excludes non-prospect calls: kickoffs, existing customer calls, partner calls, expansion/upsell calls
- Excluded calls are noted for transparency (e.g., "Excluded: Staunton Kickoff — existing customer")
- Filtering guidance added to Step 1 (call finding) and a new dedicated "Call Scope" section

### New: Coaching Voice & Tone Section
- Coaching must read as if written by a CRO — executive gravitas, no filler
- **Never open coaching sections with the rep's name** — lead with the insight
- **Keep / Start / Stop = exactly ONE item each** — highest impact only, forces prioritization
- Each item: bold one-sentence headline + 2-3 sentences of evidence from specific calls
- **Framework coaching written as oratory** — flowing prose weaving real call examples into teaching, not bullet points

### New: Epistemic Humility Principle
- AI has transcripts only — no tone, body language, deal history, or relationship context
- **Low-confidence feedback must be excluded** — if interpreting humor, sarcasm, or intent would be required, leave it out
- The 5% that's wrong makes reps discount the 95% that's right
- Use "the transcript shows" not "the rep felt"

### New: Demo Length Rule
- **Never criticize demo length** — long demos are driven by customer engagement, not poor structure
- A prospect on a 45-minute demo is buying, not suffering
- If talk ratio is problematic, address talk ratio directly — not duration

### New: SE/POV Call Handling
- **Do not penalize AE for SE presence on POV/demo calls** — the SE is doing their job
- Score AE on orchestration, business context, qualification, stakeholder management, and deal advancement
- Do not ding talk ratio or technical depth when SE is present

### Enhanced: MEDDPICC Multi-Call Philosophy
- Added explicit rule: **Never praise covering all 7 elements on a single call** — that's not how the framework works
- Depth on 2-3 elements is always superior to surface-level mention of all 7
- (Multi-call philosophy was in v8 but this makes the anti-pattern explicit)

### Enhanced: Writing Guidelines
- Added "Do not penalize team selling" section
- Added "Do not criticize demo length" section
- Added "Apply epistemic humility" section
- Strengthened "Look for patterns" guidance

### Enhanced: Critical Implementation Notes
- Added note 10: Prospect-only scope
- Added note 11: One Keep, one Start, one Stop
- Added note 12: Epistemic humility is non-negotiable

---

## v8 (2026-03-09)
**File**: `gong-call-scorer_v8.skill`

### Added: Never Split the Difference (Voss) Framework
- Added as 4th framework at 15% weight
- Tactical empathy, mirroring, labeling, calibrated questions, accusation audit, "that's right" moments
- Integrated into Rapport (10%), Discovery (30%), Advancement (20%), and Engagement (15%) dimensions
- Added Voss lens to Step 4 framework overlays
- Added vossColor() to DOCX formatting spec

### Added: MEDDPICC Multi-Call Philosophy
- MEDDPICC treated as multi-call framework, not single-call checklist
- 2-4 elements per call based on stage (early/mid/late)
- Pattern-level gaps across calls matter more than single-call gaps
- Do not penalize for elements not covered on a single call

### Changed: Framework Weights
- MEDDPICC: 30% (unchanged)
- Gap Selling: 30% (unchanged)
- Challenger: 25% (was 30%)
- Voss: 15% (new)

### Enhanced: Scoring Dimensions
- Rapport: Now includes Voss tactical empathy, mirroring, labeling, accusation audit
- Discovery: Now includes Voss calibrated questions alongside MEDDPICC and Gap Selling
- Advancement: Now includes Voss loss aversion, anchoring, "no"-oriented questions
- Engagement: Now includes "that's right" moments and voluntary elaboration

### Added: Mandatory Top-of-Report Summary
- Overall Assessment, What This Means, Best Examples Observed, Coaching Priority
- Required before all detailed scorecards

---

## v7 (2026-03-02)
**File**: `gong-call-AE-scorer_v7.skill`

### Core Framework
- Three frameworks: MEDDPICC (30%), Gap Selling (30%), Challenger Sale (30%)
- Six scoring dimensions with weighted formula
- Transcript processor requirement (process_transcript.py)
- DOCX output support with full formatting spec

### Scoring Dimensions
- Rapport & Connection (10%)
- Discovery & Qualification (30%)
- Value Articulation (15%)
- Deal Advancement (20%)
- Call Control & Structure (10%)
- Prospect Engagement (15%)

### Features
- Single call, small batch (2-5), and full batch (6-11) output formats
- Per-call scorecards with dimension breakdowns
- MEDDPICC coverage heatmaps
- Challenger Sale lens analysis
- Gap Selling lens analysis
- Keep / Start / Stop coaching action plans
- Cross-rep comparison for multi-rep batches
