#!/usr/bin/env node
/**
 * Weekly AM Call Scorecard - Automated Pipeline
 *
 * Runs every Sunday at 2 PM ET via GitHub Actions.
 * 1. Pulls last 7 days of Gong calls for 3 AMs
 * 2. Scores each call via Claude API using AM Scorecard v1 methodology
 * 3. Injects data into index.html dashboard
 * 4. Sends Slack message to Sales Leadership
 *
 * Required environment variables:
 *   GONG_ACCESS_KEY, GONG_ACCESS_KEY_SECRET - Gong API credentials
 *   ANTHROPIC_API_KEY - Claude API key
 *   SLACK_WEBHOOK_URL - Slack incoming webhook
 */

require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const https = require("https");

// ─── Configuration ───────────────────────────────────────────────────────────

const REPS = [
  { name: "Anjelica Purnell", title: "Account Manager", gongId: "7521307078149635406" },
  { name: "Noah Jones", title: "Account Manager", gongId: "8357687250089071625" },
  { name: "Elizabeth Spade", title: "Account Manager", gongId: "1260140667797651866" },
  { name: "Madeline Mazzella", title: "Account Manager", gongId: "926479123958068574" },
  { name: "Spencer Schultz", title: "Account Manager", gongId: "7188235930408947059" },
];

const WORKSPACE_ID = "509723422617923879";
const MIN_DURATION = 300; // 5 minutes minimum

// Call title patterns to exclude — non-scorable AM calls
// Keeps: QBRs, escalations, onboarding, demos, support/troubleshooting, regular check-ins
const EXCLUDE_TITLE_PATTERNS = /\b(training\s+session|internal\s+sync|team\s+sync|1[:\-]1|one[\-\s]on[\-\s]one|pipeline\s+review|handoff|hand[\-\s]off|transition\s+call|POV|proof\s+of\s+value|pilot\s+review|pilot\s+call|trial\s+eval|kickoff|kick[\-\s]off)/i;

// AM Scorecard v1 — Two-Layer Scoring Model
// Layer 1: Five Scoring Dimensions (1-10 scale)
//   Weighted Score = (RQ × 0.20) + (CD × 0.25) + (VD × 0.25) + (SA × 0.20) + (CE × 0.10)
// Layer 2: Four Pillars of Success (binary per call)
//   KDM, CS, AV, PR
// Layer 3: Three Key Areas (tags per call)
//   Retention, Expansion, Advocacy

const SCORING_PROMPT = `You are an expert Account Management coach evaluating a client call for an Ocrolus Account Manager. Use the AM Scorecard v1 methodology below.

## Two-Layer Scoring Model

### Five Scoring Dimensions (1-10 scale)
- Relationship Quality (20% weight): Rapport, trust signals, multi-threading, stakeholder awareness, tactical empathy
- Client Discovery (25% weight): Uncovering client health, satisfaction, pain points, usage patterns, business changes
- Value Delivery (25% weight): ROI validation, demonstrating ongoing value, teaching/advising, best practice sharing
- Strategic Advancement (20% weight): Next steps, action items, expansion signals, roadmap alignment, mutual planning
- Client Engagement (10% weight): Client energy, voluntary elaboration, positive signals, advocacy indicators

### Four Pillars of Success (binary — did it happen on this call?)
- KDM (Key Decision Maker): Was the call held with someone who has authority over budget, renewal, or strategic direction?
- CS (Client Success): Did the AM discuss whether Ocrolus is helping the client achieve their goals/find success?
- AV (Additional Value): Did the AM explore ways to bring more value (new features, use cases, expanded usage)?
- PR (Product Roadmap): Did the AM discuss Ocrolus product roadmap, upcoming features, or product direction?

Note: AMs should cover 2-3 pillars per call based on the client relationship stage. Score depth over breadth.

### Three Key Areas (tag which were actively advanced)
- Retention: AM validated client health, addressed concerns, confirmed value realization, strengthened relationship
- Expansion: AM identified upsell/cross-sell opportunities, explored new use cases, discussed volume growth
- Advocacy: AM cultivated advocacy — references, case studies, peer introductions, event participation

### AM Profile Classification (choose ONE based on the dominant pattern in THIS call)
- Trusted Advisor: The AM proactively guided the conversation, offered strategic insights, challenged the client's thinking, or positioned themselves as a partner (not just a vendor). Look for: unsolicited recommendations, forward-looking strategy, mutual planning, or the client seeking the AM's opinion on business decisions.
- Relationship Builder: The AM demonstrated strong rapport and responsiveness — warm conversation, personal connection, active listening — but did NOT meaningfully advance expansion, strategy, or next steps. Look for: high Relationship Quality scores but lower Strategic Advancement or Value Delivery.
- Problem Solver: The AM was primarily reactive — the client brought issues and the AM resolved or triaged them. The AM did NOT proactively explore new topics, ask discovery questions, or advance the account beyond the issue at hand. Look for: troubleshooting-heavy calls, support-oriented discussions, low Client Discovery scores.
- Account Grower: The AM actively pursued expansion — new use cases, volume growth, cross-sell, or upsell. Look for: the AM introducing new Ocrolus capabilities, asking about adjacent workflows, quantifying growth potential, or discussing pricing/packaging for additional services.
- Caretaker: The AM maintained status quo — the call was a routine check-in with no meaningful discovery, no value articulation, and no forward momentum. Look for: short, surface-level conversations, generic "everything good?" questions, no concrete next steps.

## Coaching Principles
- Keep/Start/Stop = ONE item each — the single highest-impact action, not a list
- No rep name openers — don't start coaching with the AM's name, get straight to the point
- Executive-level gravitas — coaching reads like a senior leader, not a checkbox audit
- Never criticize call length — long calls mean an engaged customer
- Reference specific call moments — cite what was actually said and suggest a concrete alternative phrase or question the AM could have used
- Multi-call patterns matter more than single-call gaps — flag patterns, not one-offs

## Epistemic Humility Rules
- You have transcripts only — no tone, body language, account history, or relationship context
- Exclude low-confidence feedback
- Use "the transcript shows" not "the AM felt"

## Output Format

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "scores": {
    "rq": N,
    "cd": N,
    "vd": N,
    "sa": N,
    "ce": N
  },
  "weighted": N.NN,
  "talkRatio": N,
  "pillars": {"KDM": 0or1, "CS": 0or1, "AV": 0or1, "PR": 0or1},
  "keyAreas": ["Retention" and/or "Expansion" and/or "Advocacy"],
  "profile": "Trusted Advisor|Relationship Builder|Problem Solver|Account Grower|Caretaker (pick the ONE that best describes the AM's dominant behavior on THIS call based on the classification criteria above)",
  "strengths": ["specific strength with evidence from the transcript", "second strength"],
  "opportunities": ["specific opportunity with coaching suggestion", "second opportunity"],
  "keyQuote": "notable client quote from the transcript or empty string",
  "keyQuoteSpeaker": "speaker label for the quote, e.g. 'Client CTO' or empty string",
  "narrative": "2-3 sentence factual summary of what happened on the call. Use 'the transcript shows' language.",
  "coaching": "4-6 sentence coaching paragraph referencing specific call moments. Focus on AM techniques: discovery questions, value articulation, expansion signals, stakeholder management. Provide a specific alternative phrase or question the AM could have used.",
  "pillarCoaching": "1-2 sentences on which pillars were missed and how to incorporate them naturally in the next call with this client.",
  "nextCallPrep": ["specific action item for next call", "second prep item", "third prep item"]
}`;

// ─── Gong API ────────────────────────────────────────────────────────────────

function gongRequest(path, body) {
  const auth = Buffer.from(
    `${process.env.GONG_ACCESS_KEY}:${process.env.GONG_ACCESS_KEY_SECRET}`
  ).toString("base64");

  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: "us-29990.api.gong.io",
        path: `/v2${path}`,
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`Gong API ${path} returned ${res.statusCode}: ${body.slice(0, 500)}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Gong API parse error: ${body.slice(0, 200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function getCalls(fromDate, toDate) {
  let allCalls = [];
  let cursor = "";
  do {
    const body = { filter: { fromDateTime: fromDate, toDateTime: toDate, workspaceId: WORKSPACE_ID } };
    if (cursor) body.cursor = cursor;
    const result = await gongRequest("/calls/extensive", body);
    const batch = result.calls || [];
    allCalls = allCalls.concat(batch);
    cursor = result.records?.cursor || "";
    console.log(`   Fetched ${batch.length} calls (total so far: ${allCalls.length}, totalRecords: ${result.records?.totalRecords || "?"})${cursor ? ", fetching next page..." : ""}`);
  } while (cursor);
  return allCalls;
}

async function getTranscript(callId) {
  const result = await gongRequest("/calls/transcript", {
    filter: { callIds: [callId] },
  });
  return result.callTranscripts?.[0] || null;
}

// ─── Transcript Processing ───────────────────────────────────────────────────

function processTranscript(transcript) {
  if (!transcript?.transcript) return null;

  const speakers = {};
  let fullText = [];

  for (const segment of transcript.transcript) {
    const id = segment.speakerId;
    if (!speakers[id]) speakers[id] = { words: 0, sentences: [] };

    for (const sent of segment.sentences || []) {
      speakers[id].words += sent.text.split(/\s+/).length;
      speakers[id].sentences.push(sent.text);
      fullText.push({ speaker: id, text: sent.text, start: sent.start });
    }
  }

  // Sort by word count to find primary speakers
  const sorted = Object.entries(speakers).sort((a, b) => b[1].words - a[1].words);
  const totalWords = sorted.reduce((a, [, v]) => a + v.words, 0);

  // Extract key sections (opening, middle, closing)
  const totalSentences = fullText.length;
  const opening = fullText.slice(0, Math.min(30, totalSentences)).map(s => s.text).join(" ");
  const middleStart = Math.floor(totalSentences * 0.3);
  const middleEnd = Math.floor(totalSentences * 0.6);
  const middle = fullText.slice(middleStart, middleEnd).map(s => s.text).join(" ");
  const closing = fullText.slice(-Math.min(30, totalSentences)).map(s => s.text).join(" ");

  // Extract questions (AM discovery indicators)
  const questions = fullText
    .filter(s => s.text.includes("?"))
    .slice(0, 15)
    .map(s => s.text);

  // Extract client positive signals (retention, expansion, advocacy indicators)
  const positiveSignals = fullText
    .filter(s => /love|great|happy|excited|impressed|amazing|recommend|refer|grow|expand|more volume/i.test(s.text))
    .slice(0, 10)
    .map(s => s.text);

  return {
    speakerCount: sorted.length,
    topSpeakerRatio: Math.round((sorted[0]?.[1].words / totalWords) * 100),
    totalWords,
    opening: opening.slice(0, 1500),
    middle: middle.slice(0, 2000),
    closing: closing.slice(0, 1500),
    questions,
    positiveSignals,
  };
}

// ─── Claude API Scoring ──────────────────────────────────────────────────────

async function scoreCall(client, callInfo, processedTranscript) {
  const prompt = `${SCORING_PROMPT}

Call Info:
- Title: ${callInfo.title}
- Duration: ${Math.round(callInfo.duration / 60)} minutes
- Type: ${callInfo.direction}
- Scope: ${callInfo.scope}
- Speakers: ${processedTranscript.speakerCount}
- Top speaker talk ratio: ${processedTranscript.topSpeakerRatio}%

Transcript Summary:
OPENING: ${processedTranscript.opening}

MIDDLE: ${processedTranscript.middle}

CLOSING: ${processedTranscript.closing}

KEY QUESTIONS ASKED:
${processedTranscript.questions.join("\n")}

CLIENT POSITIVE SIGNALS:
${processedTranscript.positiveSignals.join("\n")}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.text || "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error(`Scoring error for ${callInfo.title}:`, e.message);
    return null;
  }
}

// ─── Dashboard Data Injection ────────────────────────────────────────────────

async function injectDashboardData(repResults, weekLabel, client) {
  const html = fs.readFileSync("index.html", "utf-8");

  // Build calls array matching index.html's expected structure
  const allCalls = [];
  const repsData = [];
  let callId = 1;

  for (const rep of repResults) {
    const repCalls = rep.calls.map(c => ({
      id: callId++,
      rep: rep.repId,
      title: c.title,
      prospect: c.prospect || "Multiple stakeholders",
      date: c.date,
      dur: `${Math.round(c.duration / 60)}m`,
      type: c.type || "Client Call",
      s: c.score?.scores || { rq: 0, cd: 0, vd: 0, sa: 0, ce: 0 },
      w: c.score?.weighted || 0,
      tr: c.score?.talkRatio || 50,
      p: c.score?.pillars || { KDM: 0, CS: 0, AV: 0, PR: 0 },
      keyAreas: c.score?.keyAreas || [],
      str: c.score?.strengths || [],
      opp: c.score?.opportunities || [],
      q: c.score?.keyQuote || "",
      qt: c.score?.keyQuoteSpeaker || "",
      coach: c.score?.coaching || "",
      prep: c.score?.nextCallPrep || [],
      url: c.url,
    }));

    allCalls.push(...repCalls);

    const avg = repCalls.length > 0
      ? parseFloat((repCalls.reduce((a, c) => a + c.w, 0) / repCalls.length).toFixed(2))
      : 0;

    repsData.push({
      id: rep.repId,
      name: rep.name,
      title: rep.title,
      profile: rep.calls.length > 0 ? mostCommon(rep.calls.map(c => c.score?.profile).filter(Boolean)) : "",
      avg,
      n: repCalls.length,
    });
  }

  // Build coaching object — synthesize a concise weekly summary per rep
  const coaching = {};
  for (const rep of repResults) {
    const strengths = rep.calls.flatMap(c => c.score?.strengths || []);
    const opps = rep.calls.flatMap(c => c.score?.opportunities || []);
    const narratives = rep.calls.map(c => c.score?.narrative || "").filter(Boolean);
    const coachingNotes = rep.calls.map(c => c.score?.coaching || "").filter(Boolean);
    const pillarNotes = rep.calls.map(c => c.score?.pillarCoaching || "").filter(Boolean);

    let weekSummary = `${rep.name} had ${rep.calls.length} qualifying calls this week.`;

    // Synthesize a concise weekly narrative via Claude instead of concatenating every per-call paragraph
    if (narratives.length > 0) {
      try {
        console.log(`   Synthesizing weekly summary for ${rep.name}...`);
        const synthResponse = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          temperature: 0,
          messages: [{ role: "user", content: `You are writing a concise weekly summary for a sales leadership dashboard. Synthesize these per-call narratives and coaching notes into ONE tight paragraph (4-6 sentences max). Lead with the overall pattern for the week, highlight 1-2 standout moments, and end with the single most important coaching point. Do not list every call — distill the themes. Use "the transcript shows" language. No fluff, no filler, executive-level brevity.

Rep: ${rep.name} (${rep.calls.length} calls this week)

Per-call narratives:
${narratives.map((n, i) => `Call ${i + 1}: ${n}`).join("\n")}

Per-call coaching:
${coachingNotes.map((c, i) => `Call ${i + 1}: ${c}`).join("\n")}

Respond with ONLY the summary paragraph, no JSON, no markdown.` }],
        });
        weekSummary = synthResponse.content[0]?.text?.trim() || weekSummary;
      } catch (e) {
        console.error(`   Weekly synthesis failed for ${rep.name}: ${e.message}`);
        // Fallback: use first narrative + first coaching note
        weekSummary = narratives[0] + (coachingNotes[0] ? `<br><br><strong style="color:#93c5fd">Coaching:</strong> ${coachingNotes[0]}` : "");
      }
    }

    coaching[rep.repId] = {
      narrative: weekSummary,
      keep: strengths[0] || "No data this week.",
      start: opps[0] || "No data this week.",
      stop: opps[1] || "Review needed.",
      pillarCoaching: pillarNotes.join("<br>") || "",
    };
  }

  // Load existing history and append this week
  const historyMatch = html.match(/const history=(\[[\s\S]*?\]);/);
  let history = [];
  if (historyMatch) {
    try { history = JSON.parse(historyMatch[1]); } catch (_) {}
  }

  // Add this week's snapshot to history
  const weekSnapshot = {
    weekOf: weekLabel,
    reps: repResults.map(rep => {
      const repCalls = allCalls.filter(c => c.rep === rep.repId);
      const avg = repCalls.length > 0
        ? parseFloat((repCalls.reduce((a, c) => a + c.w, 0) / repCalls.length).toFixed(2))
        : 0;
      const dimAvg = (dim) => repCalls.length > 0
        ? parseFloat((repCalls.reduce((a, c) => a + (c.s[dim] || 0), 0) / repCalls.length).toFixed(1))
        : 0;
      return {
        id: rep.repId,
        avg,
        n: repCalls.length,
        scores: { rq: dimAvg("rq"), cd: dimAvg("cd"), vd: dimAvg("vd"), sa: dimAvg("sa"), ce: dimAvg("ce") },
        coaching: {
          keep: coaching[rep.repId]?.keep || "",
          start: coaching[rep.repId]?.start || "",
          stop: coaching[rep.repId]?.stop || "",
        },
      };
    }),
  };

  // Avoid duplicate weeks
  history = history.filter(w => w.weekOf !== weekLabel);
  history.push(weekSnapshot);

  // Inject data into HTML by replacing the JS variable declarations
  let updated = html;

  // Validate that patterns exist before replacing
  const patterns = {
    reps: /const reps=\[[\s\S]*?\];/,
    calls: /const calls=\[[\s\S]*?\];/,
    coaching: /const coaching=\{[\s\S]*?\};/,
    history: /const history=\[[\s\S]*?\];/,
  };
  for (const [name, pat] of Object.entries(patterns)) {
    if (!pat.test(html)) {
      console.error(`   WARNING: Could not find ${name} pattern in index.html — data will NOT be injected`);
    }
  }

  // Replace reps array
  updated = updated.replace(
    /const reps=\[[\s\S]*?\];/,
    `const reps=${JSON.stringify(repsData)};`
  );

  // Replace calls array
  updated = updated.replace(
    /const calls=\[[\s\S]*?\];/,
    `const calls=${JSON.stringify(allCalls)};`
  );

  // Replace coaching object
  updated = updated.replace(
    /const coaching=\{[\s\S]*?\};/,
    `const coaching=${JSON.stringify(coaching)};`
  );

  // Replace history array
  updated = updated.replace(
    /const history=\[[\s\S]*?\];/,
    `const history=${JSON.stringify(history)};`
  );

  // Update the header date range and call count
  const totalCalls = allCalls.length;
  updated = updated.replace(
    /Week of [^·]*· \d+ reps · \d+ calls/,
    `${weekLabel} · ${repsData.length} reps · ${totalCalls} calls`
  );

  return { html: updated, repsData, allCalls, coaching };
}

function mostCommon(arr) {
  const counts = {};
  arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

// ─── Slack Notification ──────────────────────────────────────────────────────

function sendSlack(webhookUrl, message) {
  const url = new URL(webhookUrl);
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ text: message });
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function buildSlackMessage(repsData, allCalls) {
  const sorted = [...repsData].sort((a, b) => b.avg - a.avg);
  const medals = [":first_place_medal:", ":second_place_medal:", ":third_place_medal:"];
  const topCalls = [...allCalls].sort((a, b) => b.w - a.w).slice(0, 3);

  let msg = `:bar_chart: *Weekly AM Call Scorecard*\n_${repsData.length} reps · ${allCalls.length} calls scored · AM Scorecard v1 · Four Pillars · 5-Dimension Rubric_\n\n---\n\n*Rep Rankings*\n\n`;

  sorted.forEach((r, i) => {
    const best = allCalls.filter(c => c.rep === r.id).sort((a, b) => b.w - a.w)[0];
    msg += `${medals[i] || ""} *${r.name}* — ${r.n} calls — Avg *${r.avg}* — _${r.profile}_\n`;
  });

  msg += `\n---\n\n*Top Calls*\n\n`;
  topCalls.forEach((c, i) => {
    const rep = repsData.find(r => r.id === c.rep);
    msg += `${i + 1}. *${rep?.name || "Unknown"}* — <${c.url}|${c.title}> (*${c.w}*)\n`;
  });

  // Four Pillars team gaps
  const totalCalls = allCalls.length;
  const pillarCounts = { KDM: 0, CS: 0, AV: 0, PR: 0 };
  const pillarLabels = { KDM: "Key Decision Maker", CS: "Client Success", AV: "Additional Value", PR: "Product Roadmap" };
  allCalls.forEach(c => {
    ["KDM", "CS", "AV", "PR"].forEach(k => { if (c.p[k]) pillarCounts[k]++; });
  });

  msg += `\n---\n\n*Four Pillars Coverage*\n\n`;
  ["KDM", "CS", "AV", "PR"].forEach(k => {
    const pct = totalCalls > 0 ? Math.round((pillarCounts[k] / totalCalls) * 100) : 0;
    const bar = pct >= 70 ? ":large_green_circle:" : pct >= 30 ? ":large_yellow_circle:" : ":red_circle:";
    msg += `${bar} *${pillarLabels[k]}* — ${pillarCounts[k]}/${totalCalls} calls (${pct}%)\n`;
  });

  // Key Areas summary
  const areaCounts = { Retention: 0, Expansion: 0, Advocacy: 0 };
  allCalls.forEach(c => {
    (c.keyAreas || []).forEach(a => { if (areaCounts[a] !== undefined) areaCounts[a]++; });
  });

  msg += `\n*Key Areas*: Retention ${areaCounts.Retention} · Expansion ${areaCounts.Expansion} · Advocacy ${areaCounts.Advocacy}\n`;

  msg += `\n---\n\n:link: *<https://amacko-ocrolus.github.io/AM-scorecard/|Open Full Interactive Dashboard>* — works on desktop and mobile\n\n_Scored via AM Scorecard v1 · RQ 20% · CD 25% · VD 25% · SA 20% · CE 10%_`;

  return msg;
}

// ─── Main Pipeline ───────────────────────────────────────────────────────────

async function main() {
  console.log("Starting Weekly AM Scorecard...");

  // Calculate date range (last 7 days) with timezone offset per CLAUDE.md
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 7);

  // Format with timezone offset as required by Gong API
  const pad = (n) => String(n).padStart(2, "0");
  const formatDate = (d) => {
    const offset = -d.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const hh = pad(Math.floor(Math.abs(offset) / 60));
    const mm = pad(Math.abs(offset) % 60);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${hh}:${mm}`;
  };

  const fromDate = formatDate(from);
  const toDate = formatDate(now);
  console.log(`Date range: ${fromDate} to ${toDate}`);

  // Build week label for display
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weekLabel = `Week of ${monthNames[from.getMonth()]} ${from.getDate()}–${now.getDate()}, ${now.getFullYear()}`;

  // Step 1: Get all calls
  console.log("Fetching calls from Gong...");
  const allGongCalls = await getCalls(fromDate, toDate);
  console.log(`   Found ${allGongCalls.length} total calls`);

  // Diagnostic: log first call structure to verify field names
  if (allGongCalls.length > 0) {
    const sample = allGongCalls[0];
    console.log(`   Sample call keys: ${Object.keys(sample).join(", ")}`);
    console.log(`   Sample call: id=${sample.id}, primaryUserId=${sample.primaryUserId}, scope=${sample.scope}, direction=${sample.direction}, duration=${sample.duration}`);
    // If fields are nested under metaData, log that too
    if (sample.metaData) {
      console.log(`   metaData keys: ${Object.keys(sample.metaData).join(", ")}`);
      console.log(`   metaData: id=${sample.metaData.id}, primaryUserId=${sample.metaData.primaryUserId}, scope=${sample.metaData.scope}, direction=${sample.metaData.direction}, duration=${sample.metaData.duration}`);
    }
  } else {
    console.log("   WARNING: Gong API returned 0 calls for this date range and workspace.");
  }

  // Diagnostic: log unique scopes, directions, and user IDs in the results
  if (allGongCalls.length > 0) {
    const scopes = [...new Set(allGongCalls.map(c => c.scope || c.metaData?.scope))];
    const directions = [...new Set(allGongCalls.map(c => c.direction || c.metaData?.direction))];
    const userIds = [...new Set(allGongCalls.map(c => c.primaryUserId || c.metaData?.primaryUserId))];
    console.log(`   Unique scopes: ${JSON.stringify(scopes)}`);
    console.log(`   Unique directions: ${JSON.stringify(directions)}`);
    console.log(`   Unique primaryUserIds (${userIds.length}): ${userIds.slice(0, 10).join(", ")}${userIds.length > 10 ? "..." : ""}`);
    console.log(`   Rep gongIds we're looking for: ${REPS.map(r => r.gongId).join(", ")}`);

    // Check if calls might be nested under metaData
    const hasMetaData = allGongCalls[0].metaData != null;
    if (hasMetaData) {
      console.log("   NOTE: Call data is nested under metaData — normalizing...");
    }
  }

  // Normalize calls: if data is nested under metaData, flatten it
  const normalizedCalls = allGongCalls.map(c => {
    if (c.metaData) {
      return { ...c.metaData, parties: c.parties, content: c.content };
    }
    return c;
  });

  // Step 2: Filter and score for each rep
  const repResults = [];
  const client = new Anthropic();

  for (const rep of REPS) {
    console.log(`\nProcessing ${rep.name} (gongId: ${rep.gongId})...`);

    const byUser = normalizedCalls.filter(c => c.primaryUserId === rep.gongId);
    const afterBasic = byUser.filter(
      (c) =>
        c.scope === "External" &&
        c.direction === "Conference" &&
        c.duration >= MIN_DURATION
    );

    // Apply title-based exclusions and log what gets filtered
    const excluded = afterBasic.filter(c => EXCLUDE_TITLE_PATTERNS.test(c.title || ""));
    const repCalls = afterBasic.filter(c => !EXCLUDE_TITLE_PATTERNS.test(c.title || ""));

    if (excluded.length > 0) {
      console.log(`   Excluded ${excluded.length} call(s) by title:`);
      excluded.forEach(c => console.log(`      ✗ "${c.title}" (${Math.round(c.duration / 60)}m) — matched exclusion pattern`));
    }

    // Diagnostic: show why calls might be filtered out at the basic level
    if (byUser.length > 0 && afterBasic.length === 0) {
      console.log(`   Found ${byUser.length} calls for this user, but filtered out by scope/direction/duration:`);
      byUser.slice(0, 3).forEach(c => console.log(`      scope=${c.scope}, direction=${c.direction}, duration=${c.duration}s, title=${c.title}`));
    }

    console.log(`   ${repCalls.length} qualifying calls (${byUser.length} total, ${byUser.length - afterBasic.length} filtered by scope/direction/duration, ${excluded.length} excluded by title)`);

    const scoredCalls = [];

    for (const call of repCalls) {
      console.log(`   Scoring: ${call.title} (${Math.round(call.duration / 60)}m)`);

      // Pull transcript one at a time per CLAUDE.md
      const transcript = await getTranscript(call.id);
      if (!transcript) {
        console.log(`      No transcript available, skipping`);
        continue;
      }

      // Process transcript
      const processed = processTranscript(transcript);
      if (!processed) {
        console.log(`      Transcript processing failed, skipping`);
        continue;
      }

      // Score via Claude API
      const score = await scoreCall(client, call, processed);
      if (!score) {
        console.log(`      Scoring failed, skipping`);
        continue;
      }

      const d = new Date(call.started);
      const dateStr = `${dayNames[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;

      scoredCalls.push({
        title: call.title,
        date: dateStr,
        duration: call.duration,
        type: "Client Call",
        url: call.url,
        prospect: "Multiple stakeholders",
        score,
      });

      console.log(`      Score: ${score.weighted}`);

      // Rate limit: wait between API calls
      await new Promise((r) => setTimeout(r, 1000));
    }

    repResults.push({
      repId: rep.name.toLowerCase().split(" ")[0],
      name: rep.name,
      title: rep.title,
      calls: scoredCalls,
    });
  }

  // Step 3: Inject data into existing index.html
  console.log("\nInjecting data into dashboard...");
  const { html, repsData, allCalls } = await injectDashboardData(repResults, weekLabel, client);
  fs.writeFileSync("index.html", html);
  console.log("   index.html updated");

  // Step 4: Send Slack message
  if (process.env.SLACK_WEBHOOK_URL) {
    console.log("\nSending Slack message...");
    const slackMsg = buildSlackMessage(repsData, allCalls);
    await sendSlack(process.env.SLACK_WEBHOOK_URL, slackMsg);
    console.log("   Slack message sent");
  } else {
    console.log("\nNo SLACK_WEBHOOK_URL set, skipping Slack notification");
  }

  console.log("\nWeekly AM scorecard complete!");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
