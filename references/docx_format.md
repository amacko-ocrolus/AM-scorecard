# DOCX Formatting Specification — AM Scorecard v1

This document defines the exact formatting for the Word document output.

## Document Structure

1. **Title Page** — Report title, confidentiality notice, date, period, recipient, scoring dimensions
2. **Table of Contents** — Auto-generated from headings
3. **Summary** — Overall Assessment, What This Means, Best Examples Observed, Coaching Priority
4. **Executive Summary** — Rankings table, narrative, model call callout
5. **Individual Rep Reports** (one per rep) — Profile, Four Pillars, Key Areas, AM Profile, scorecards, per-call notes, strengths, dev areas, coaching plan
6. **Cross-Rep Comparison** — Full ranking, team Four Pillars heatmap, best practices, shadow pairings, priorities
7. **Appendix: Methodology** — Scoring framework, dimension and pillar definitions, top calls for review

## Color Palette

| Purpose | Hex | Usage |
|---------|-----|-------|
| Primary dark | #1F3864 | Heading 1, document title |
| Primary medium | #2E75B6 | Heading 2/3, table headers, accents |
| Table header bg | #D5E8F0 | Alternate table header style |
| Alternating row | #F2F7FB | Zebra striping on tables |
| Score green | #C6EFCE | Scores 8.5+ and Pillar covered |
| Score blue | #B4D7FF | Scores 7.5-8.49 |
| Score yellow | #FFEB9C | Scores below 7.5 |
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

- **Header**: "CONFIDENTIAL — AM Client Call Scorecard Report" — right-aligned, 9pt, #999999
- **Footer**: "Page [X]" — centered, 9pt, #999999

## Numbering

- Use `LevelFormat.BULLET` for bullets (never unicode characters)
- Never use `\n` in text runs — use separate Paragraph elements
- Each unique bullet/number list needs its own reference ID

## Score Color Logic

```javascript
function scoreColor(score) {
  if (score >= 8.5) return "#C6EFCE";  // green
  if (score >= 7.5) return "#B4D7FF";  // blue
  return "#FFEB9C";                     // yellow
}

function pillarColor(covered) {
  return covered ? "#C6EFCE" : "#FFC7CE";
}

function areaColor(area) {
  if (area === "Retention") return "#C6EFCE";
  if (area === "Expansion") return "#B4D7FF";
  return "#E8D5F5"; // Evangelism
}
```

## Title Page Content

```
AM Client Call Scorecard Report
Confidential — For Management Review
Date Generated: [today's date]
Period Covered: [date range]
Prepared for: [recipient name and title]
Scoring: Relationship Quality (20%) · Client Discovery (25%) · Value Delivery (25%) · Strategic Advancement (20%) · Client Engagement (10%)
```

## Summary Section (Mandatory — appears before Executive Summary)

### Overall Assessment
2-4 paragraphs covering call quality, client relationship quality, value delivery, and
strategic advancement themes.

### What This Means
- For leadership: interpretation of deal health / rep effectiveness / coaching priority
- For the rep: what to keep doing and what to improve first

### Best Examples Observed
- What worked: "[transcript quote or paraphrase]" → why it worked
- What to improve: "[transcript quote]" → what stronger language sounds like

### Coaching Priority
Numbered list of top 1-3 coaching priorities in order.

## Executive Summary Table Columns

Rank | Rep | Avg Score | Best Call | Worst Call | AM Profile | Development Area

## Individual Rep Sections

Each rep section contains:

1. **Profile Classification Table** (3 columns):
   AM Profile | Relationship Depth | Key Strength

2. **Four Pillars Coverage Table** (3 columns):
   Pillar | Coverage (Covered/Not Covered, color-coded green/red) | Evidence

3. **Key Areas Assessment Table** (2 columns):
   Area (Retention/Expansion/Evangelism) | Assessment

4. **Call-by-Call Scorecard** (8 columns):
   # | Call Title | Date | RQ | CD | VD | SA | CE | Total
   - Dimension abbreviations: RQ=Relationship Quality, CD=Client Discovery, VD=Value Delivery, SA=Strategic Advancement, CE=Client Engagement
   - Sort by score descending
   - Bold the top call, italic the bottom call
   - Color-code the Total column

5. **Per-Call Dimension Notes**: For each call, show per-dimension "What Happened" + example quote
   - Dimension names: Relationship Quality, Client Discovery, Value Delivery, Strategic Advancement, Client Engagement

6. **Strengths**: Numbered list, 2-3 items, each with transcript evidence

7. **Development Opportunities**: Numbered list, 2-3 items, each with gap + coaching action + coaching example (Observed → Stronger version)

8. **Best Call Highlight**: 1-2 paragraph deep dive

9. **Coaching Action Plan**:
    - Keep Doing (2-3 bullets)
    - Start Doing (2-3 bullets with specific language)
    - Stop Doing (1-2 bullets)

## Cross-Rep Section

1. **All Calls Ranked** (7 columns):
   Rank | Rep | Call Title | Date | Score | Top Dimension | Weakest Dimension

2. **Team Four Pillars Heatmap** (1 + N columns):
   Pillar (KDM / CS / AV / PR) | [Rep 1] | [Rep 2] | ... — all color-coded by coverage (green=covered, red=not covered)

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
