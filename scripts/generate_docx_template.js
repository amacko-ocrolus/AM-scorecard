#!/usr/bin/env node
/**
 * Gong Call Evaluation DOCX Generator — Template (v5)
 *
 * This is a TEMPLATE. When using this skill, Claude should:
 * 1. Copy this file to the working directory
 * 2. Replace the DATA section with actual evaluation data
 * 3. Update the title page metadata (recipient, date, period)
 * 4. Run: node generate_docx.js
 *
 * v5 additions:
 * - Mandatory top-of-report summary (Overall Assessment, What This Means, Best
 *   Examples Observed, Coaching Priority)
 * - Framework Overlays: MEDDPICC (Coverage/Evidence/Example to Improve),
 *   Challenger Lens (Teach/Tailor/Take Control), Gap Selling Lens
 * - Updated scoring table with "What Happened" and "Example" columns
 * - Coaching examples (Observed vs Stronger version) throughout
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
  if (score >= 8) return C.green;
  if (score >= 5) return C.yellow;
  return C.red;
}

function freqColor(f) {
  return f === "Always" ? C.green : f === "Sometimes" ? C.yellow : C.red;
}

function coverageColor(c) {
  if (c === "Strongly covered") return C.green;
  if (c === "Touched but shallow") return C.yellow;
  return C.red;
}

function challengerColor(c) {
  if (c === "Strong Challenger behavior") return C.green;
  if (c === "Partial Challenger behavior") return C.yellow;
  return C.red;
}

function vossColor(v) {
  if (v === "Strong Voss technique") return C.green;
  if (v === "Some Voss technique") return C.yellow;
  return C.red;
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
  outputPath: process.env.OUTPUT_PATH || `${process.env.HOME}/gong_call_evaluation_report.docx`,
};

// Top-of-report summary (mandatory in v5)
const summary = {
  overallAssessment: "REPLACE: 2-4 paragraphs covering call quality, commercial effectiveness, deal advancement, and framework themes.",
  forLeadership: "REPLACE: Brief interpretation of deal health / rep effectiveness / coaching priority.",
  forRep: "REPLACE: Brief interpretation of what to keep doing and what to improve first.",
  bestExamples: [
    // { type: "worked", quote: "what the rep said or did", why: "why it worked" },
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
//   title: "Job Title",
//   avg: 7.50,
//   profile: "Challenger",                  // Challenger Sale profile
//   challengerDetail: {                     // v5: explicit Teach/Tailor/Take Control
//     teach: "Strong Challenger behavior",
//     tailor: "Partial Challenger behavior",
//     takeControl: "Strong Challenger behavior",
//     teachEvidence: "Evidence text",
//     tailorEvidence: "Evidence text",
//     takeControlEvidence: "Evidence text",
//   },
//   meddpicc: "Proficient",                // MEDDPICC maturity level
//   discovery: "Strong",                    // Discovery maturity level
//   gapSelling: {                           // v5: Gap Selling lens
//     currentState: "Assessment text",
//     futureState: "Assessment text",
//     problems: "Assessment text",
//     impact: "Assessment text",
//     rootCauses: "Assessment text",
//     gapQuality: "Summary statement",
//   },
//   vossLens: {                             // v5+: Never Split the Difference lens
//     tacticalEmpathy: "Assessment text",
//     mirroringLabeling: "Assessment text",
//     calibratedQuestions: "Assessment text",
//     thatsRight: "Assessment text",
//     overall: "Strong Voss technique",     // Strong / Some / Minimal
//     overallEvidence: "Evidence text",
//   },
//   calls: [
//     { t: "Call Title", date: "Feb 17", dur: "47m",
//       r: 8, d: 8, v: 9, a: 9, c: 8, e: 9, w: 8.55,
//       rNote: "What happened", rEx: "Quote or coaching example",   // v5: per-dimension notes
//       dNote: "What happened", dEx: "Quote or coaching example",
//       vNote: "What happened", vEx: "Quote or coaching example",
//       aNote: "What happened", aEx: "Quote or coaching example",
//       cNote: "What happened", cEx: "Quote or coaching example",
//       eNote: "What happened", eEx: "Quote or coaching example",
//     },
//   ],
//   meddpiccMap: {                          // v5: uses Coverage + Evidence + Example to Improve
//     M:  { coverage: "Strongly covered",       evidence: "Evidence", improve: "Example phrase" },
//     E:  { coverage: "Touched but shallow",    evidence: "Evidence", improve: "Example phrase" },
//     DC: { coverage: "Not covered",            evidence: "N/A",      improve: "Example phrase" },
//     DP: { coverage: "Touched but shallow",    evidence: "Evidence", improve: "Example phrase" },
//     I:  { coverage: "Strongly covered",       evidence: "Evidence", improve: "" },
//     Ch: { coverage: "Not covered",            evidence: "N/A",      improve: "Example phrase" },
//     Co: { coverage: "Touched but shallow",    evidence: "Evidence", improve: "Example phrase" },
//   },
//   meddpiccFreq: { M: "Always", E: "Sometimes", DC: "Always", DP: "Sometimes", I: "Always", Ch: "Always", Co: "Sometimes" },
//   strengths: [
//     ["Strength title", "Evidence description", "\"Transcript quote\""],
//   ],
//   devAreas: [
//     ["Gap title", "Coaching action + suggested phrase", "\"Observed\" -> \"Stronger version\""],
//   ],
//   bestCall: "Description of best call and why",
//   keep: ["Keep doing item 1", "Keep doing item 2"],
//   start: ["Start doing item 1 with specific language", "Start doing item 2"],
//   stop: ["Stop doing item 1"],
// }

const reps = [
  // REPLACE: Add rep objects here
];

// Each ranked call:
// { rank: 1, rep: "Name", t: "Call Title", date: "Feb 17", w: 8.55, top: "Advancement", weak: "Rapport" }
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
          text: "CONFIDENTIAL \u2014 Sales Call Evaluation Report",
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
    new TextRun({ text: "Sales Call Evaluation Report", font: "Arial", size: 56, bold: true, color: C.darkBlue })
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
      text: "Frameworks Applied: MEDDPICC (30%) \u00B7 Gap Selling (30%) \u00B7 The Challenger Sale (25%) \u00B7 Never Split the Difference (15%)",
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

// ---------- MANDATORY SUMMARY (v5) ----------
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
      new TextRun({ text: "For the rep: ", font: "Arial", size: 22, bold: true }),
      new TextRun({ text: summary.forRep, font: "Arial", size: 22 }),
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

  // Profile table (v5: includes Gap Selling)
  const profCols = [2340, 2340, 2340, 2340];
  kids.push(new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: profCols,
    rows: [
      new TableRow({ children: [
        hc("Challenger Profile", 2340), hc("MEDDPICC Maturity", 2340),
        hc("Discovery Maturity", 2340), hc("Gap Selling", 2340)
      ]}),
      new TableRow({ children: [
        dc(rep.profile, 2340, { align: AlignmentType.CENTER }),
        dc(rep.meddpicc, 2340, { align: AlignmentType.CENTER }),
        dc(rep.discovery, 2340, { align: AlignmentType.CENTER }),
        dc(rep.gapSelling ? rep.gapSelling.gapQuality : "N/A", 2340, { align: AlignmentType.CENTER }),
      ]}),
    ],
  }));

  // MEDDPICC Coverage (v5: Coverage + Evidence + Example to Improve)
  kids.push(h2("MEDDPICC Coverage"));
  const mCols = [1600, 1600, 3160, 3000];
  const mElements = [
    { el: "Metrics", key: "M" }, { el: "Economic Buyer", key: "E" },
    { el: "Decision Criteria", key: "DC" }, { el: "Decision Process", key: "DP" },
    { el: "Identify Pain", key: "I" }, { el: "Champion", key: "Ch" },
    { el: "Competition", key: "Co" },
  ];
  kids.push(new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: mCols,
    rows: [
      new TableRow({ children: [
        hc("Element", 1600), hc("Coverage", 1600), hc("Evidence", 3160), hc("Example to Improve", 3000)
      ]}),
      ...mElements.map((m, i) => {
        const entry = rep.meddpiccMap ? rep.meddpiccMap[m.key] : null;
        const coverage = entry ? entry.coverage : "Not covered";
        const evidence = entry ? entry.evidence : "N/A";
        const improve = entry ? entry.improve : "";
        return new TableRow({ children: [
          dc(m.el, 1600, { fill: i % 2 ? C.altRow : undefined, bold: true }),
          dc(coverage, 1600, { fill: coverageColor(coverage), align: AlignmentType.CENTER }),
          dc(evidence, 3160, { fill: i % 2 ? C.altRow : undefined }),
          dc(improve, 3000, { fill: i % 2 ? C.altRow : undefined, italic: true }),
        ]});
      }),
    ],
  }));

  // Challenger Lens (v5: Teach / Tailor / Take Control)
  if (rep.challengerDetail) {
    kids.push(h2("Challenger Sale Lens"));
    const chCols = [1800, 2000, 5560];
    kids.push(new Table({
      width: { size: TABLE_W, type: WidthType.DXA },
      columnWidths: chCols,
      rows: [
        new TableRow({ children: [hc("Behavior", 1800), hc("Assessment", 2000), hc("Evidence", 5560)] }),
        new TableRow({ children: [
          dc("Teach", 1800, { bold: true }),
          dc(rep.challengerDetail.teach, 2000, { fill: challengerColor(rep.challengerDetail.teach), align: AlignmentType.CENTER }),
          dc(rep.challengerDetail.teachEvidence, 5560),
        ]}),
        new TableRow({ children: [
          dc("Tailor", 1800, { bold: true, fill: C.altRow }),
          dc(rep.challengerDetail.tailor, 2000, { fill: challengerColor(rep.challengerDetail.tailor), align: AlignmentType.CENTER }),
          dc(rep.challengerDetail.tailorEvidence, 5560, { fill: C.altRow }),
        ]}),
        new TableRow({ children: [
          dc("Take Control", 1800, { bold: true }),
          dc(rep.challengerDetail.takeControl, 2000, { fill: challengerColor(rep.challengerDetail.takeControl), align: AlignmentType.CENTER }),
          dc(rep.challengerDetail.takeControlEvidence, 5560),
        ]}),
      ],
    }));
  }

  // Gap Selling Lens (v5)
  if (rep.gapSelling) {
    kids.push(h2("Gap Selling Lens"));
    const gCols = [2000, 7360];
    kids.push(new Table({
      width: { size: TABLE_W, type: WidthType.DXA },
      columnWidths: gCols,
      rows: [
        new TableRow({ children: [hc("Element", 2000), hc("Assessment", 7360)] }),
        new TableRow({ children: [dc("Current State", 2000, { bold: true }), dc(rep.gapSelling.currentState, 7360)] }),
        new TableRow({ children: [dc("Future State", 2000, { bold: true, fill: C.altRow }), dc(rep.gapSelling.futureState, 7360, { fill: C.altRow })] }),
        new TableRow({ children: [dc("Problems", 2000, { bold: true }), dc(rep.gapSelling.problems, 7360)] }),
        new TableRow({ children: [dc("Business Impact", 2000, { bold: true, fill: C.altRow }), dc(rep.gapSelling.impact, 7360, { fill: C.altRow })] }),
        new TableRow({ children: [dc("Root Causes", 2000, { bold: true }), dc(rep.gapSelling.rootCauses, 7360)] }),
        new TableRow({ children: [
          dc("Gap Quality", 2000, { bold: true, fill: C.altRow }),
          dc(rep.gapSelling.gapQuality, 7360, { fill: C.altRow, bold: true }),
        ]}),
      ],
    }));
  }

  // Never Split the Difference Lens (v5+)
  if (rep.vossLens) {
    kids.push(h2("Never Split the Difference Lens"));
    const vCols = [2200, 7160];
    kids.push(new Table({
      width: { size: TABLE_W, type: WidthType.DXA },
      columnWidths: vCols,
      rows: [
        new TableRow({ children: [hc("Technique", 2200), hc("Assessment", 7160)] }),
        new TableRow({ children: [dc("Tactical Empathy", 2200, { bold: true }), dc(rep.vossLens.tacticalEmpathy, 7160)] }),
        new TableRow({ children: [dc("Mirroring / Labeling", 2200, { bold: true, fill: C.altRow }), dc(rep.vossLens.mirroringLabeling, 7160, { fill: C.altRow })] }),
        new TableRow({ children: [dc("Calibrated Questions", 2200, { bold: true }), dc(rep.vossLens.calibratedQuestions, 7160)] }),
        new TableRow({ children: [dc("\"That's Right\" Moments", 2200, { bold: true, fill: C.altRow }), dc(rep.vossLens.thatsRight, 7160, { fill: C.altRow })] }),
        new TableRow({ children: [
          dc("Overall Voss Technique", 2200, { bold: true }),
          dc(`${rep.vossLens.overall} — ${rep.vossLens.overallEvidence}`, 7160, {
            fill: vossColor(rep.vossLens.overall), bold: true
          }),
        ]}),
      ],
    }));
  }

  // Call-by-call Scorecard (v5: includes What Happened + Example columns via notes)
  kids.push(h2("Call-by-Call Scorecards"));
  const sCols = [400, 2160, 700, 700, 700, 700, 700, 700, 700, 1900];
  kids.push(new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: sCols,
    rows: [
      new TableRow({ children: [
        hc("#", 400), hc("Call Title", 2160), hc("Date", 700),
        hc("Rap", 700), hc("Disc", 700), hc("Val", 700),
        hc("Adv", 700), hc("Ctrl", 700), hc("Eng", 700), hc("Total", 1900)
      ]}),
      ...rep.calls.map((call, i) => new TableRow({ children: [
        dc(String(i + 1), 400, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(call.t, 2160, { bold: i === 0, italic: i === rep.calls.length - 1, fill: i % 2 ? C.altRow : undefined }),
        dc(call.date, 700, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(String(call.r), 700, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(String(call.d), 700, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(String(call.v), 700, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(String(call.a), 700, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(String(call.c), 700, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(String(call.e), 700, { align: AlignmentType.CENTER, fill: i % 2 ? C.altRow : undefined }),
        dc(call.w.toFixed(2), 1900, { align: AlignmentType.CENTER, bold: true, fill: scoreColor(call.w) }),
      ]})),
    ],
  }));

  // Per-call dimension notes (v5: What Happened + Example for each dimension)
  rep.calls.forEach((call) => {
    kids.push(h3(`${call.t} (${call.date})`));
    const dims = [
      { name: "Rapport", note: call.rNote, ex: call.rEx },
      { name: "Discovery", note: call.dNote, ex: call.dEx },
      { name: "Value", note: call.vNote, ex: call.vEx },
      { name: "Advancement", note: call.aNote, ex: call.aEx },
      { name: "Control", note: call.cNote, ex: call.cEx },
      { name: "Engagement", note: call.eNote, ex: call.eEx },
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

  // Dev areas (v5: with coaching examples)
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

  // Team MEDDPICC heatmap (uses frequency for multi-call)
  if (reps.length > 1) {
    kids.push(h2("Team MEDDPICC Heatmap"));
    const repNames = reps.map(r => r.name.split(" ")[0]);
    const hmColW = Math.floor((TABLE_W - 1900) / reps.length);
    const hmCols = [1900, ...repNames.map(() => hmColW)];
    const mElements = ["Metrics", "Economic Buyer", "Decision Criteria", "Decision Process", "Identify Pain", "Champion", "Competition"];
    const mKeys = ["M", "E", "DC", "DP", "I", "Ch", "Co"];

    kids.push(new Table({
      width: { size: TABLE_W, type: WidthType.DXA },
      columnWidths: hmCols,
      rows: [
        new TableRow({ children: [hc("Element", 1900), ...repNames.map(n => hc(n, hmColW))] }),
        ...mElements.map((el, i) => new TableRow({ children: [
          dc(el, 1900, { bold: true, fill: i % 2 ? C.altRow : undefined }),
          ...reps.map(r => {
            const freq = r.meddpiccFreq ? (r.meddpiccFreq[mKeys[i]] || "Rarely") : "N/A";
            return dc(freq, hmColW, { align: AlignmentType.CENTER, fill: freqColor(freq) });
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
    body("Each call was evaluated on six dimensions (1-10 scale), combined using: Weighted Score = (Rapport x 0.10) + (Discovery x 0.30) + (Value x 0.15) + (Advancement x 0.20) + (Control x 0.10) + (Engagement x 0.15). The weighting is derived from four framework priorities: MEDDPICC (30%), Gap Selling (30%), Challenger Sale (25%), and Never Split the Difference (15%)."),
    h2("Framework Definitions"),
    body("MEDDPICC: A B2B sales qualification methodology tracking Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion, and Competition. Each element was assessed per call using 'Strongly covered / Touched but shallow / Not covered' classification, and across calls per rep using 'Always / Sometimes / Rarely' frequency."),
    body("The Challenger Sale: Evaluates reps on three core behaviors: Teach (bringing insights), Tailor (customizing to the account), and Take Control (guiding the process). Each behavior is classified as Strong / Partial / Mostly reactive."),
    body("Gap Selling: Assesses whether the rep uncovered the buyer's Current State, Future State, Problems, Business Impact, Root Causes, and Cost of Inaction. A strong Gap Selling execution means the rep understood the gap, not just the symptoms."),
    body("Never Split the Difference (Chris Voss): Evaluates negotiation and influence techniques including Tactical Empathy, Mirroring, Labeling, Calibrated Questions, Accusation Audits, and 'That\\'s Right' moments. Each rep is classified as Strong / Some / Minimal Voss technique."),
    body("Effective Discovery: Evaluates whether reps systematically uncover Timeline, Budget, Competition, Decision Process, Pain Points, Business Impact, Root Causes, and Stakeholder Map."),
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
