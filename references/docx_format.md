# DOCX Formatting Specification (v5)

This document defines the exact formatting for the Word document output.

## Document Structure

1. **Title Page** — Report title, confidentiality notice, date, period, recipient, frameworks
2. **Table of Contents** — Auto-generated from headings
3. **Summary** — Overall Assessment, What This Means, Best Examples Observed, Coaching Priority
4. **Executive Summary** — Rankings table, narrative, model call callout
5. **Individual Rep Reports** (one per rep) — Profile, MEDDPICC, Challenger Lens, Gap Selling Lens, scorecards, per-call notes, strengths, dev areas, coaching plan
6. **Cross-Rep Comparison** — Full ranking, team heatmap, best practices, shadow pairings, priorities
7. **Appendix: Methodology** — Scoring framework, framework definitions, top calls for review

## Color Palette

| Purpose | Hex | Usage |
|---------|-----|-------|
| Primary dark | #1F3864 | Heading 1, document title |
| Primary medium | #2E75B6 | Heading 2/3, table headers, accents |
| Table header bg | #D5E8F0 | Alternate table header style |
| Alternating row | #F2F7FB | Zebra striping on tables |
| Score green | #C6EFCE | Scores 8.0+ and "Always"/"Strongly covered"/"Strong Challenger"/"Strong Voss technique" |
| Score yellow | #FFEB9C | Scores 5.0-7.99 and "Sometimes"/"Touched but shallow"/"Partial Challenger"/"Some Voss technique" |
| Score red | #FFC7CE | Scores below 5.0 and "Rarely"/"Not covered"/"Mostly reactive"/"Minimal Voss technique" |
| Quote text | #404040 | Transcript quotes |
| Borders | #CCCCCC | Table borders |
| Gray | #666666 | Subtitle text |
| Light gray | #999999 | Header/footer text |

## Typography

| Element | Font | Size | Style | Color |
|---------|------|------|-------|-------|
| Document title | Arial | 28pt | Bold | #1F3864 |
| Heading 1 | Arial | 18pt | Bold | #1F3864 |
| Heading 2 | Arial | 14pt | Bold | #2E75B6 |
| Heading 3 | Arial | 12pt | Bold | #2E75B6 |
| Body text | Arial | 11pt | Normal | Black |
| Table body | Arial | 10pt | Normal | Black |
| Table header | Arial | 10pt | Bold | White on #2E75B6 |
| Transcript quotes | Arial | 10pt | Italic | #404040 |
| Coaching examples | Arial | 10pt | Italic | #2E75B6 (stronger) / #404040 (observed) |
| Confidential header | Arial | 9pt | Normal | #999999 |

## Page Setup

- **Size**: US Letter (12240 x 15840 DXA)
- **Margins**: 1 inch all sides (1440 DXA each)
- **Content width**: 9360 DXA (with 1" margins)

## Table Formatting

- Full width: 9360 DXA
- Use `WidthType.DXA` (never PERCENTAGE)
- Tables need BOTH `columnWidths` on table AND `width` on each cell
- Use `ShadingType.CLEAR` (never SOLID) for cell backgrounds
- Borders: #CCCCCC, `BorderStyle.SINGLE`, size 1
- Header row: #2E75B6 background, white bold text
- Cell padding: top/bottom 80, left/right 120 DXA
- Alternating rows where applicable

## Headers & Footers

- **Header**: "CONFIDENTIAL — Sales Call Evaluation Report" — right-aligned, 9pt, #999999
- **Footer**: "Page [X]" — centered, 9pt, #999999

## Numbering

- Use `LevelFormat.BULLET` for bullets (never unicode characters)
- Never use `\n` in text runs — use separate Paragraph elements
- Each unique bullet/number list needs its own reference ID

## Score Color Logic

```javascript
function scoreColor(score) {
  if (score >= 8) return "#C6EFCE";  // green
  if (score >= 5) return "#FFEB9C";  // yellow
  return "#FFC7CE";                   // red
}

function freqColor(frequency) {
  if (frequency === "Always") return "#C6EFCE";
  if (frequency === "Sometimes") return "#FFEB9C";
  return "#FFC7CE";
}

function coverageColor(coverage) {
  if (coverage === "Strongly covered") return "#C6EFCE";
  if (coverage === "Touched but shallow") return "#FFEB9C";
  return "#FFC7CE";  // "Not covered"
}

function challengerColor(assessment) {
  if (assessment === "Strong Challenger behavior") return "#C6EFCE";
  if (assessment === "Partial Challenger behavior") return "#FFEB9C";
  return "#FFC7CE";  // "Mostly reactive / relationship-led"
}

function vossColor(assessment) {
  if (assessment === "Strong Voss technique") return "#C6EFCE";
  if (assessment === "Some Voss technique") return "#FFEB9C";
  return "#FFC7CE";  // "Minimal / no Voss technique"
}
```

## Title Page Content

```
Sales Call Evaluation Report
Confidential — For Management Review
Date Generated: [today's date]
Period Covered: [date range]
Prepared for: [recipient name and title]
Frameworks Applied: MEDDPICC (30%) · Gap Selling (30%) · The Challenger Sale (25%) · Never Split the Difference (15%)
```

## Summary Section (Mandatory — appears before Executive Summary)

### Overall Assessment
2-4 paragraphs covering call quality, commercial effectiveness, deal advancement, and
framework themes from MEDDPICC, Challenger, and Gap Selling.

### What This Means
- For leadership: interpretation of deal health / rep effectiveness / coaching priority
- For the rep: what to keep doing and what to improve first

### Best Examples Observed
- What worked: "[transcript quote or paraphrase]" → why it worked
- What to improve: "[transcript quote]" → what stronger language sounds like

### Coaching Priority
Numbered list of top 1-3 coaching priorities in order.

## Executive Summary Table Columns

Rank | Rep | Avg Score | Best Call | Worst Call | Challenger Profile | Development Area

## Individual Rep Sections

Each rep section contains:

1. **Profile Classification Table** (4 columns):
   Challenger Sale Profile | MEDDPICC Maturity | Discovery Maturity | Gap Selling Quality

2. **MEDDPICC Coverage Table** (4 columns):
   Element | Coverage (color-coded: Strongly covered / Touched but shallow / Not covered) | Evidence | Example to Improve

3. **Challenger Sale Lens Table** (3 columns):
   Behavior (Teach/Tailor/Take Control) | Assessment (color-coded: Strong/Partial/Mostly reactive) | Evidence

4. **Gap Selling Lens Table** (2 columns):
   Element (Current State / Future State / Problems / Business Impact / Root Causes / Gap Quality) | Assessment

5. **Never Split the Difference Lens Table** (2 columns):
   Technique (Tactical Empathy / Mirroring & Labeling / Calibrated Questions / "That's Right" Moments / Overall Voss Technique) | Assessment
   - Overall row color-coded: Strong (green) / Some (yellow) / Minimal (red)

7. **Call-by-Call Scorecard** (10 columns):
   # | Call Title | Date | Rapport | Discovery | Value | Advancement | Control | Engagement | Total
   - Sort by score descending
   - Bold the top call, italic the bottom call
   - Color-code the Total column

8. **Per-Call Dimension Notes**: For each call, show per-dimension "What Happened" + example quote

9. **Strengths**: Numbered list, 2-3 items, each with transcript evidence

10. **Development Opportunities**: Numbered list, 2-3 items, each with gap + coaching action + coaching example (Observed → Stronger version)

11. **Best Call Highlight**: 1-2 paragraph deep dive

12. **Coaching Action Plan**:
    - Keep Doing (2-3 bullets)
    - Start Doing (2-3 bullets with specific language)
    - Stop Doing (1-2 bullets)

## Cross-Rep Section

1. **All Calls Ranked** (7 columns):
   Rank | Rep | Call Title | Date | Score | Top Dimension | Weakest Dimension

2. **Team MEDDPICC Heatmap** (1 + N columns):
   Element | [Rep 1] | [Rep 2] | ... — all color-coded by frequency

3. **Best Practices to Share**: Numbered list of top calls for team review

4. **Recommended Shadow Pairings**: Who should shadow whom and why

5. **Team Development Priorities**: 3-5 numbered items on team-level gaps

## Coaching Example Format

When showing coaching examples in DOCX:
- **Observed**: italic, #404040 (quote color)
- **Stronger version**: italic, #2E75B6 (medium blue)
- Both indented at 720 DXA

## Validation

After generating, validate with the docx skill's validator if available. Common issues:
- Remove `.DS_Store` files from unpacked directories
- The `core.xml` null-schema warning is a validator quirk, not a document issue
- The `pack.py` validation ("All validations PASSED!") is the authoritative check
