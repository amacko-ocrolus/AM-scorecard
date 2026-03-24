#!/usr/bin/env node
/**
 * AM Scorecard DOCX Generator — Template (v1)
 *
 * This is a TEMPLATE. When using this skill, Claude should:
 * 1. Copy this file to the working directory
 * 2. Replace the DATA section with actual evaluation data
 * 3. Update the title page metadata (recipient, date, period)
 * 4. Run: node generate_docx.js
 *
 * v1: AM Scorecard framework
 * - Four Pillars of Success (KDM, CS, AV, PR) — binary per call
 * - Five Scoring Dimensions (RQ, CD, VD, SA, CE) — 1-10 scale
 * - Three Key Areas (Retention, Expansion, Advocacy)
 * - AM Profile Classification
 * - Per-call dimension notes with coaching examples
 *
 * Dependencies: npm install docx
 */

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak
} = require("docx");

// ========================
// COLOR PALETTE
// ========================
const C = {
  darkBlue: "1F3864",
  medBlue: "2E75B6",
  tableHeader: "D5E8F0",
  altRow: "F2F7FB",
  green: "C6EFCE",
  yellow: "FFEB9C",
  red: "FFC7CE",
  quote: "404040",
  border: "CCCCCC",
  gray: "666666",
  lightGray: "999999",
  white: "FFFFFF",
};

// ========================
// HELPER FUNCTIONS
// ========================
const border = { style: BorderStyle.SINGLE, size: 1, color: C.border };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };
const TABLE_W = 9360;

function scoreColor(score) {
  if (score >= 8.5) return C.green;
  if (score >= 7.5) return "B4D7FF"; // blue
  return C.yellow;
}

function pillarColor(covered) {
  return covered ? C.green : C.red;
}
function areaColor(area) {
  if (area === "Retention") return C.green;
  if (area === "Expansion") return "B4D7FF"; // light blue
  return "E8D5F5"; // light purple for Advocacy
}

// Header cell (blue bg, white text)
function hc(text, w) {
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: C.medBlue, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, font: "Arial", size: 20, color: C.white })]
    })],
  });
}

// Data cell
function dc(text, w, opts = {}) {
  const fill = opts.fill || undefined;
  const shading = fill ? { fill, type: ShadingType.CLEAR } : undefined;
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading,
    margins: cellMargins,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({
        text: String(text),
        font: "Arial",
        size: 20,
        bold: opts.bold || false,
        italic: opts.italic || false
      })]
    })],
  });
}

// Heading helpers
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Arial", size: 36, bold: true, color: C.darkBlue })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Arial", size: 28, bold: true, color: C.medBlue })]
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: C.medBlue })]
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    indent: opts.indent ? { left: 720 } : undefined,
    children: [new TextRun({
      text,
      font: "Arial",
      size: 22,
      bold: opts.bold,
      italic: opts.italic,
      color: opts.color
    })],
  });
}
function quoteText(text) {
  return new Paragraph({
    spacing: { after: 120 },
    indent: { left: 720 },
    children: [new TextRun({ text, font: "Arial", size: 20, italic: true, color: C.quote })],
  });
}
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

// Coaching example pair: Observed vs. Stronger version
function coachingExample(observed, stronger) {
  return [
    new Paragraph({
      spacing: { after: 60 },
      indent: { left: 720 },
      children: [
        new TextRun({ text: "Observed: ", font: "Arial", size: 20, bold: true, color: C.quote }),
        new TextRun({ text: `"${observed}"`, font: "Arial", size: 20, italic: true, color: C.quote }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      indent: { left: 720 },
      children: [
        new TextRun({ text: "Stronger: ", font: "Arial", size: 20, bold: true, color: C.medBlue }),
        new TextRun({ text: `"${stronger}"`, font: "Arial", size: 20, italic: true, color: C.medBlue }),
      ],
    }),
  ];
}

// ========================
// DATA — REPLACE THIS SECTION
// ========================
// Claude: populate these objects with actual evaluation data.

const META = {
  dateGenerated: "March 12, 2026",
  periodCovered: "REPLACE: e.g. February 9 - March 2, 2026",
  preparedFor: "REPLACE: e.g. John Lowenthal, VP Sales",
  outputPath: process.env.OUTPUT_PATH || `${process.env.HOME}/am_scorecard_report.docx`,
};

// Top-of-report summary (mandatory)
const summary = {
  overallAssessment: "REPLACE: 2-4 paragraphs covering call quality, client engagement, pillar coverage, and key area themes.",
  forLeadership: "REPLACE: Brief interpretation of client health / AM effectiveness / coaching priority.",
  forAM: "REPLACE: Brief interpretation of what to keep doing and what to improve first.",
  bestExamples: [
    // { type: "worked", quote: "what the AM said or did", why: "why it worked" },
    // { type: "improve", quote: "what happened", stronger: "what stronger language sounds like" },
  ],
  coachingPriorities: [
    // "Priority 1 description",
    // "Priority 2 description",
  ],
};

// Each rep object:
// {
//   name: "Rep Name",
//   title: "Account Manager",
//   avg: 7.50,
//   profile: "Trusted Advisor",              // AM Profile Classification
//   fourPillars: {                            // Four Pillars Coverage
//     KDM: { covered: true, evidence: "Evidence text" },
//     CS:  { covered: true, evidence: "Evidence text" },
//     AV:  { covered: false, evidence: "N/A" },
//     PR:  { covered: true, evidence: "Evidence text" },
//   },
//   keyAreas: {                               // Three Key Areas assessment
//     retention: "Assessment text",
//     expansion: "Assessment text",
//     evangelism: "Assessment text",
//   },
//   calls: [
//     { t: "Call Title", date: "Mar 17", dur: "47m",
//       rq: 8, cd: 8, vd: 9, sa: 9, ce: 9, w: 8.55,
//       rqNote: "What happened", rqEx: "Quote",
//       cdNote: "What happened", cdEx: "Quote",
//       vdNote: "What happened", vdEx: "Quote",
//       saNote: "What happened", saEx: "Quote",
//       ceNote: "What happened", ceEx: "Quote",
//       pillars: { KDM: 1, CS: 1, AV: 0, PR: 1 },
//       keyAreas: ["Retention", "Expansion"],
//     },
//   ],
//   strengths: [["Strength title", "Evidence", "\"Quote\""]],
//   devAreas: [["Gap title", "Coaching action", "\"Observed\" -> \"Stronger\""]],
//   bestCall: "Description of best call",
//   keep: ["Keep doing 1"], start: ["Start doing 1"], stop: ["Stop doing 1"],
// }

const reps = [
  // REPLACE: Add rep objects here
];

// Each ranked call:
// { rank: 1, rep: "Name", t: "Call Title", date: "Mar 17", w: 8.55, top: "Value Delivery", weak: "Client Engagement" }
const allCalls = [
  // REPLACE: Add all ranked calls here
];

const execNarrative = "REPLACE: 2-3 paragraph executive summary of team performance.";
const modelCallHighlight = "REPLACE: Description of the best call and why it's a model.";

// ========================
// BUILD DOCUMENT
// ========================

// Numbering configs — one per unique list in the doc
const numberingConfigs = [];
for (let i = 0; i < 30; i++) {
  numberingConfigs.push({
    reference: `list${i}`,
    levels: [{
      level: 0,
      format: i % 2 === 0 ? LevelFormat.BULLET : LevelFormat.DECIMAL,
      text: i % 2 === 0 ? "\u2022" : "%1.",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } }
    }]
  });
}

function bullet(text, ref) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}

function numberedItem(boldText, normalText, ref) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: [
      new TextRun({ text: boldText + ": ", font: "Arial", size: 22, bold: true }),
      new TextRun({ text: normalText, font: "Arial", size: 22 }),
    ]
  });
}

const sectionProps = {
  page: {
    size: { width: 12240, height: 15840 },
    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
  },
};

const headerFooter = {
  headers: {
    default: new Header({
      children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({
          text: "CONFIDENTIAL \u2014 AM Client Call Scorecard Report",
          font: "Arial", size: 18, color: C.lightGray
        })],
      })],
    }),
  },
  footers: {
    default: new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Page ", font: "Arial", size: 18, color: C.lightGray }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: C.lightGray }),
        ],
      })],
    }),
  },
};

// ---------- TITLE PAGE ----------
const titlePage = [
  new Paragraph({ spacing: { before: 3600 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "AM Client Call Scorecard Report", font: "Arial", size: 56, bold: true, color: C.darkBlue })
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [
    new TextRun({ text: "Confidential \u2014 For Management Review", font: "Arial", size: 24, italic: true, color: C.gray })
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [
    new TextRun({ text: `Date Generated: ${META.dateGenerated}`, font: "Arial", size: 22 })
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [
    new TextRun({ text: `Period Covered: ${META.periodCovered}`, font: "Arial", size: 22 })
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [
    new TextRun({ text: `Prepared for: ${META.preparedFor}`, font: "Arial", size: 22, bold: true })
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 480 }, children: [
    new TextRun({
      text: "Scoring: Relationship Quality (20%) \u00B7 Client Discovery (25%) \u00B7 Value Delivery (25%) \u00B7 Strategic Advancement (20%) \u00B7 Client Engagement (10%)",
      font: "Arial", size: 20, italic: true, color: C.gray
    })
  ]}),
  pb(),
];

// ---------- TOC ----------
const tocPage = [
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
  pb(),
];

// ---------- MANDATORY SUMMARY ----------
function buildSummary() {
  const kids = [];
  kids.push(h1("Summary"));

  kids.push(h2("Overall Assessment"));
  kids.push(body(summary.overallAssessment));

  kids.push(h2("What This Means"));
  kids.push(new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: "For leadership: ", font: "Arial", size: 22, bold: true }),
      new TextRun({ text: summary.forLeadership, font: "Arial", size: 22 }),
    ]
  }));
  kids.push(new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "For the AM: ", font: "Arial", size: 22, bold: true }),
      new TextRun({ text: summary.forAM, font: "Arial", size: 22 }),
    ]
  }));

  kids.push(h2("Best Examples Observed"));
  summary.bestExamples.forEach(ex => {
    if (ex.type === "worked") {
      kids.push(new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: "What worked: ", font: "Arial", size: 22, bold: true }),
          new TextRun({ text: `"${ex.quote}"`, font: "Arial", size: 22, italic: true }),
        ]
      }));
      kids.push(body(`  \u2192 ${ex.why}`, { indent: true }));
    } else {
      kids.push(...coachingExample(ex.quote, ex.stronger));
    }
  });

  kids.push(h2("Coaching Priority"));
  summary.coachingPriorities.forEach((p, i) => {
    kids.push(body(`${i + 1}. ${p}`));
  });

  kids.push(pb());
  return kids;
}

// ---------- EXEC SUMMARY ----------
function buildExecSummary() {
  const cols = [800, 1800, 900, 1600, 1600, 1200, 1460];
  const rows = reps.map((r, i) => {
    const best = r.calls[0];
    const worst = r.calls[r.calls.length - 1];
    return new TableRow({ children: [
      dc(String(i + 1), 800, { fill: i % 2 ? C.altRow : undefined, align: AlignmentType.CENTER }),
      dc(r.name, 1800, { fill: i % 2 ? C.altRow : undefined, bold: true }),
      dc(r.avg.toFixed(2), 900, { fill: scoreColor(r.avg), align: AlignmentType.CENTER, bold: true }),
      dc(`${best.t} (${best.w.toFixed(2)})`, 1600, { fill: i % 2 ? C.altRow : undefined }),
      dc(`${worst.t} (${worst.w.toFixed(2)})`, 1600, { fill: i % 2 ? C.altRow : undefined }),
      dc(r.profile, 1200, { fill: i % 2 ? C.altRow : undefined }),
      dc(r.devAreas[0][0], 1460, { fill: i % 2 ? C.altRow : undefined }),
    ]});
  });

  return [
    h1("Executive Summary"),
    body(execNarrative),
    new Paragraph({
      spacing: { before: 240, after: 240 },
      shading: { fill: C.altRow, type: ShadingType.CLEAR },
      indent: { left: 360, right: 360 },
      children: [
        new TextRun({ text: "Model Call: ", font: "Arial", size: 22, bold: true }),
        new TextRun({ text: modelCallHighlight, font: "Arial", size: 22 }),
      ]
    }),
    new Table({
      width: { size: TABLE_W, type: WidthType.DXA },
      columnWidths: cols,
      rows: [
        new TableRow({ children: [
          hc("Rank", 800), hc("Rep", 1800), hc("Avg", 900),
          hc("Best Call", 1600), hc("Worst Call", 1600),
          hc("Profile", 1200), hc("Dev Area", 1460)
        ]}),
        ...rows
      ],
    }),
    pb(),
  ];
}

// ---------- REP SECTIONS ----------
function buildRepSection(rep, listIdx) {
  const kids = [];
  const numRef = `list${listIdx * 6 + 1}`;
  const numRef2 = `list${listIdx * 6 + 3}`;
  const numRef3 = `list${listIdx * 6 + 5}`;
  const bulRef = `list${listIdx * 6}`;
  const bulRef2 = `list${listIdx * 6 + 2}`;
  const bulRef3 = `list${listIdx * 6 + 4}`;

  kids.push(h1(`${rep.name} \u2014 ${rep.title}`));
  kids.push(h2(`Overall Score: ${rep.avg.toFixed(2)} / 10`));

  // Profile table (3 columns: AM Profile, Relationship Depth, Key Strength)
  const profCols = [3120, 3120, 3120];
  kids.push(new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: profCols,
    rows: [
      new TableRow({ children: [
        hc("AM Profile", 3120), hc("Relationship Depth", 3120),
        hc("Key Strength", 3120)
      ]}),
      new TableRow({ children: [
        dc(rep.profile, 3120, { align: AlignmentType.CENTER }),
        dc(rep.relationshipDepth || "N/A", 3120, { align: AlignmentType.CENTER }),
        dc(rep.keyStrength || "N/A", 3120, { align: AlignmentType.CENTER }),
      ]}),
    ],
  }));

  // Four Pillars Coverage
  kids.push(h2("Four Pillars Coverage"));
  const pCols = [2200, 1600, 5560];
  const pillars = [
    { name: "Key Decision Maker (KDM)", key: "KDM" },
    { name: "Client Success (CS)", key: "CS" },
    { name: "Additional Value (AV)", key: "AV" },
    { name: "Product Roadmap (PR)", key: "PR" },
  ];
  kids.push(new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: pCols,
    rows: [
      new TableRow({ children: [
        hc("Pillar", 2200), hc("Coverage", 1600), hc("Evidence", 5560)
      ]}),
      ...pillars.map((p, i) => {
        const entry = rep.fourPillars ? rep.fourPillars[p.key] : null;
        const covered = entry ? entry.covered : false;
        const evidence = entry ? entry.evidence : "N/A";
        return new TableRow({ children: [
          dc(p.name, 2200, { fill: i % 2 ? C.altRow : undefined, bold: true }),
          dc(covered ? "Covered" : "Not Covered", 1600, { fill: pillarColor(covered), align: AlignmentType.CENTER }),
          dc(evidence, 5560, { fill: i % 2 ? C.altRow : undefined }),
        ]});
      }),
    ],
  }));

  // Key Areas Assessment
  kids.push(h2("Key Areas Assessment"));
  const aCols = [2000, 7360];
  const areas = [
    { name: "Retention", key: "retention" },
    { name: "Expansion", key: "expansion" },
    { name: "Advocacy", key: "evangelism" },
  ];
  kids.push(new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: aCols,
    rows: [
      new TableRow({ children: [hc("Area", 2000), hc("Assessment", 7360)] }),
      ...areas.map((a) => {
        const assessment = rep.keyAreas ? (rep.keyAreas[a.key] || "N/A") : "N/A";
        return new TableRow({ children: [
          dc(a.name, 2000, { bold: true, fill: areaColor(a.name) }),
          dc(assessment, 7360),
        ]});
      }),
    ],
  }));

  // Call-by-call Scorecard
  kids.push(h2("Call-by-Call Scorecards"));
  const sCols = [400, 2460, 700, 800, 800, 800, 800, 800, 1800];
  kids.push(new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: sCols,
    rows: [
      new TableRow({ children: [
        hc("#", 400), hc("Call Title", 2460), hc("Date", 700),
        hc("RQ", 800), hc("CD", 800), hc("VD", 800),
        hc("SA", 800), hc("CE", 800), hc("Total", 1800)
      ]}),
      ...rep.calls.map((call, i) => new TableRow({ children: [
        dc(String(i + 1), 400, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(call.t, 2460, { bold: i === 0, italic: i === rep.calls.length - 1, fill: i % 2 ? C.altRow : undefined }),
        dc(call.date, 700, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(String(call.rq), 800, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(String(call.cd), 800, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(String(call.vd), 800, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(String(call.sa), 800, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(String(call.ce), 800, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(call.w.toFixed(2), 1800, { align: AlignmentType.CENTER, bold: true, fill: scoreColor(call.w) }),
      ]})),
    ],
  }));

  // Per-call dimension notes
  rep.calls.forEach((call) => {
    kids.push(h3(`${call.t} (${call.date})`));
    const dims = [
      { name: "Relationship Quality", note: call.rqNote, ex: call.rqEx },
      { name: "Client Discovery", note: call.cdNote, ex: call.cdEx },
      { name: "Value Delivery", note: call.vdNote, ex: call.vdEx },
      { name: "Strategic Advancement", note: call.saNote, ex: call.saEx },
      { name: "Client Engagement", note: call.ceNote, ex: call.ceEx },
    ];
    dims.forEach(dim => {
      if (dim.note) {
        kids.push(new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${dim.name}: `, font: "Arial", size: 20, bold: true }),
            new TextRun({ text: dim.note, font: "Arial", size: 20 }),
          ]
        }));
      }
      if (dim.ex) {
        kids.push(quoteText(dim.ex));
      }
    });
  });

  // Strengths
  kids.push(h2("Strengths"));
  rep.strengths.forEach((s) => {
    kids.push(numberedItem(s[0], s[1], numRef));
    if (s[2]) kids.push(quoteText(s[2]));
  });

  // Dev areas (with coaching examples)
  kids.push(h2("Development Opportunities"));
  rep.devAreas.forEach((d) => {
    kids.push(numberedItem(d[0], d[1], numRef2));
    if (d[2]) kids.push(quoteText(d[2]));
  });

  // Best call
  kids.push(h2("Best Call Highlight"));
  kids.push(body(rep.bestCall));

  // Action plan
  kids.push(h2("Coaching Action Plan"));
  kids.push(h3("Keep Doing"));
  rep.keep.forEach(k => kids.push(bullet(k, bulRef)));
  kids.push(h3("Start Doing"));
  rep.start.forEach(s => kids.push(bullet(s, bulRef2)));
  kids.push(h3("Stop Doing"));
  rep.stop.forEach(s => kids.push(bullet(s, bulRef3)));

  kids.push(pb());
  return kids;
}

// ---------- CROSS-REP ----------
function buildCrossRep() {
  const kids = [];
  kids.push(h1("Cross-Rep Comparison"));
  kids.push(h2(`All ${allCalls.length} Calls Ranked`));

  const rankCols = [500, 1000, 3060, 900, 1200, 1400, 1300];
  kids.push(new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: rankCols,
    rows: [
      new TableRow({ children: [
        hc("Rk", 500), hc("Rep", 1000), hc("Call Title", 3060),
        hc("Date", 900), hc("Score", 1200), hc("Top Dim", 1400), hc("Weak Dim", 1300)
      ]}),
      ...allCalls.map((c, i) => new TableRow({ children: [
        dc(String(c.rank), 500, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(c.rep, 1000, { fill: i % 2 ? C.altRow : undefined }),
        dc(c.t, 3060, { fill: i % 2 ? C.altRow : undefined }),
        dc(c.date, 900, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(c.w.toFixed(2), 1200, { align: AlignmentType.CENTER, bold: true, fill: scoreColor(c.w) }),
        dc(c.top, 1400, { fill: i % 2 ? C.altRow : undefined }),
        dc(c.weak, 1300, { fill: i % 2 ? C.altRow : undefined }),
      ]})),
    ],
  }));

  // Team Four Pillars Heatmap
  if (reps.length > 1) {
    kids.push(h2("Team Four Pillars Heatmap"));
    const repNames = reps.map(r => r.name.split(" ")[0]);
    const hmColW = Math.floor((TABLE_W - 1900) / reps.length);
    const hmCols = [1900, ...repNames.map(() => hmColW)];
    const pillarElements = [
      { name: "Key Decision Maker", key: "KDM" },
      { name: "Client Success", key: "CS" },
      { name: "Additional Value", key: "AV" },
      { name: "Product Roadmap", key: "PR" },
    ];

    kids.push(new Table({
      width: { size: TABLE_W, type: WidthType.DXA },
      columnWidths: hmCols,
      rows: [
        new TableRow({ children: [hc("Pillar", 1900), ...repNames.map(n => hc(n, hmColW))] }),
        ...pillarElements.map((el, i) => new TableRow({ children: [
          dc(el.name, 1900, { bold: true, fill: i % 2 ? C.altRow : undefined }),
          ...reps.map(r => {
            const entry = r.fourPillars ? r.fourPillars[el.key] : null;
            const covered = entry ? entry.covered : false;
            return dc(covered ? "Covered" : "Not Covered", hmColW, { align: AlignmentType.CENTER, fill: pillarColor(covered) });
          }),
        ]})),
      ],
    }));
  }

  kids.push(pb());
  return kids;
}

// ---------- APPENDIX ----------
function buildAppendix() {
  return [
    h1("Appendix: Methodology"),
    h2("Scoring Framework"),
    body("Each call was evaluated on five dimensions (1-10 scale), combined using: Weighted Score = (Relationship Quality \u00D7 0.20) + (Client Discovery \u00D7 0.25) + (Value Delivery \u00D7 0.25) + (Strategic Advancement \u00D7 0.20) + (Client Engagement \u00D7 0.10)."),
    h2("Four Pillars of Success"),
    body("The Four Pillars track whether key topics were addressed on each call: Key Decision Maker (KDM), Client Success (CS), Additional Value (AV), and Product Roadmap (PR). Each is binary (covered/not covered) per call."),
    h2("Three Key Areas"),
    body("Each call is tagged with the areas actively advanced: Retention (client health, value realization), Expansion (upsell/cross-sell, new use cases), and Advocacy (advocacy, references, case studies)."),
    h2("AM Profile Classification"),
    body("Each AM is classified based on their overall pattern: Trusted Advisor, Relationship Builder, Problem Solver, Account Grower, or Caretaker."),
  ];
}

// ========================
// ASSEMBLE & WRITE
// ========================

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: C.darkBlue },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: C.medBlue },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: C.medBlue },
        paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: { config: numberingConfigs },
  sections: [{
    properties: sectionProps,
    ...headerFooter,
    children: [
      ...titlePage,
      ...tocPage,
      ...buildSummary(),
      ...(reps.length > 0 ? buildExecSummary() : []),
      ...reps.flatMap((r, i) => buildRepSection(r, i)),
      ...(reps.length > 1 ? buildCrossRep() : []),
      ...buildAppendix(),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(META.outputPath, buffer);
  console.log(`DOCX written to ${META.outputPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
});
