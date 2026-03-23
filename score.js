#!/usr/bin/env node
/**
 * Weekly AE Call Scorecard - Automated Pipeline
 * 
 * Runs every Sunday at 2 PM ET via GitHub Actions.
 * 1. Pulls last 7 days of Gong calls for 3 reps
 * 2. Scores each call via Claude API using v7 methodology
 * 3. Generates interactive HTML dashboard (index.html)
 * 4. Sends Slack message to Sales Leadership
 * 
 * Required environment variables:
 *   GONG_ACCESS_KEY, GONG_ACCESS_KEY_SECRET - Gong API credentials
 *   ANTHROPIC_API_KEY - Claude API key
 *   SLACK_WEBHOOK_URL - Slack incoming webhook
 */

const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const https = require("https");
const http = require("http");

// ─── Configuration ───────────────────────────────────────────────────────────

const REPS = [
  { name: "Anjelica Purnell", title: "Account Manager", gongId: "REPLACE_WITH_GONG_ID" },
  { name: "Noah Jones", title: "Account Manager", gongId: "REPLACE_WITH_GONG_ID" },
  { name: "Elizabeth Spade", title: "Account Manager", gongId: "REPLACE_WITH_GONG_ID" },
];

const WORKSPACE_ID = "509723422617923879";
const MIN_DURATION = 600; // 10 minutes minimum

const SCORING_PROMPT = `You are an elite sales coach and call evaluator. Score this call transcript using these four frameworks:
- MEDDPICC (30% weight): Discovery depth, qualification rigor, deal mechanics
- Gap Selling (30% weight): Problem diagnosis, current/future state, business impact
- Challenger Sale (25% weight): Value delivery, commercial teaching, process control
- Never Split the Difference (15% weight): Tactical empathy, rapport, engagement, negotiation

Score on these 6 dimensions (1-10 scale):
- Rapport (10% weight)
- Discovery (30% weight)
- Value (15% weight)
- Advancement (20% weight)
- Control (10% weight)
- Engagement (15% weight)

Also evaluate MEDDPICC coverage (M, E, DC, DP, IP, Ch, Co - 1 for covered, 0 for not).

CRITICAL: The "coaching" field should be a rich, qualitative coaching paragraph (4-6 sentences) that:
1. References specific moments from the call and what the rep did well or missed
2. Naturally weaves in concepts from the 4 frameworks using real examples from the call
3. Provides a specific alternative phrase or question the rep could have used, drawn from one of the books
4. Teaches the rep something they can apply next week

Example coaching styles to emulate:
- MEDDPICC: "When the prospect mentioned their board needs to approve, that was the moment to map the Decision Process — 'Walk me through how a decision like this typically gets made internally. Who else weighs in?' Instead, the conversation moved to pricing without understanding the approval chain."
- Gap Selling: "The prospect described their current 5-day turn times, but the rep didn't dig into the downstream impact. Keenan would push here: 'What happens to your pipeline when a file sits for 5 days? How many deals fall through?' Connecting the current state pain to measurable business impact would have strengthened the urgency."
- Challenger: "The rep presented features but missed the chance to teach. A Challenger would reframe: 'Most lenders we work with don't realize the real cost isn't the manual process — it's the exceptions that break your workflow as volume scales. That's where the ROI compounds.'"
- Never Split the Difference: "When the prospect said 'we've been burned before by vendors,' that was a perfect moment for a Voss mirror: 'You've been burned before?' — just those four words would have opened up the real objection. Instead the rep moved past it."

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "scores": {"rapport": N, "discovery": N, "value": N, "advancement": N, "control": N, "engagement": N},
  "weighted": N.NN,
  "talkRatio": N,
  "meddpicc": {"M": 0or1, "E": 0or1, "DC": 0or1, "DP": 0or1, "IP": 0or1, "Ch": 0or1, "Co": 0or1},
  "profile": "Challenger|Relationship Builder|Hard Worker|Problem Solver|Lone Wolf",
  "strengths": ["specific strength with evidence from the call", "second strength with evidence"],
  "opportunities": ["specific gap with coaching suggestion", "second gap with coaching suggestion"],
  "keyQuote": "notable quote from the call or empty string",
  "narrative": "2-3 sentence factual summary of what happened on the call and where the deal stands",
  "coaching": "4-6 sentence qualitative coaching paragraph that references specific call moments, teaches framework concepts using real examples from this call, and provides alternative phrases the rep could use next time. This should read like advice from a world-class sales coach who watched the call.",
  "stage": "Initial Demo|POV Active|Pricing|Closing|etc"
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
  const result = await gongRequest("/calls", {
    filter: {
      fromDateTime: fromDate,
      toDateTime: toDate,
      workspaceId: WORKSPACE_ID,
    },
    cursor: "",
  });
  return result.calls || [];
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
  
  // Extract questions
  const questions = fullText
    .filter(s => s.text.includes("?"))
    .slice(0, 15)
    .map(s => s.text);
  
  return {
    speakerCount: sorted.length,
    topSpeakerRatio: Math.round((sorted[0]?.[1].words / totalWords) * 100),
    totalWords,
    opening: opening.slice(0, 1500),
    middle: middle.slice(0, 2000),
    closing: closing.slice(0, 1500),
    questions,
  };
}

// ─── Claude API Scoring ──────────────────────────────────────────────────────

async function scoreCall(client, callInfo, processedTranscript) {
  const prompt = `${SCORING_PROMPT}

Call Info:
- Title: ${callInfo.title}
- Duration: ${Math.round(callInfo.duration / 60)} minutes
- Type: ${callInfo.direction}
- Speakers: ${processedTranscript.speakerCount}
- Top speaker talk ratio: ${processedTranscript.topSpeakerRatio}%

Transcript Summary:
OPENING: ${processedTranscript.opening}

MIDDLE: ${processedTranscript.middle}

CLOSING: ${processedTranscript.closing}

KEY QUESTIONS ASKED:
${processedTranscript.questions.join("\n")}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
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

// ─── Dashboard Generation ────────────────────────────────────────────────────

function generateDashboard(repResults) {
  // Build the calls and reps data arrays for the HTML
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
      type: c.score?.stage || "Call",
      stage: c.score?.stage || "Unknown",
      s: c.score?.scores || {r:5,d:5,v:5,a:5,c:5,e:5},
      w: c.score?.weighted || 5.0,
      tr: c.score?.talkRatio || 50,
      m: c.score?.meddpicc || {M:0,E:0,DC:0,DP:0,IP:0,Ch:0,Co:0},
      str: c.score?.strengths || ["No data"],
      opp: c.score?.opportunities || ["No data"],
      q: c.score?.keyQuote || "",
      coach: c.score?.coaching || "",
      url: c.url,
    }));
    
    allCalls.push(...repCalls);
    
    const avg = repCalls.length > 0 
      ? (repCalls.reduce((a, c) => a + c.w, 0) / repCalls.length).toFixed(2) 
      : 0;
    
    // Generate rep narrative from Claude scores
    const narratives = repCalls.map(c => c.score?.narrative).filter(Boolean);
    
    repsData.push({
      id: rep.repId,
      name: rep.name,
      title: rep.title,
      profile: repCalls[0]?.score?.profile || "Unknown",
      avg: parseFloat(avg),
      n: repCalls.length,
    });
  }
  
  // Sort reps by avg score
  repsData.sort((a, b) => b.avg - a.avg);
  
  // Generate the HTML (same template as the working dashboard)
  const html = buildHTML(repsData, allCalls, repResults);
  return html;
}

function buildHTML(repsData, calls, repResults) {
  // Build coaching data from Claude's analysis
  const coaching = {};
  for (const rep of repResults) {
    const strengths = rep.calls.flatMap(c => c.score?.strengths || []);
    const opps = rep.calls.flatMap(c => c.score?.opportunities || []);
    const narratives = rep.calls.map(c => c.score?.narrative || "").filter(Boolean);
    const coachingNotes = rep.calls.map(c => c.score?.coaching || "").filter(Boolean);
    
    // Build a rich Week in Review that combines narrative context with framework-grounded coaching
    const weekNarrative = narratives.join(" ");
    const weekCoaching = coachingNotes.join(" ");
    
    coaching[rep.repId] = {
      narrative: weekNarrative 
        ? `${weekNarrative}<br><br><strong style="color:#93c5fd">Coaching Notes:</strong> ${weekCoaching || "No specific coaching notes this week."}`
        : `${rep.name} had ${rep.calls.length} qualifying calls this week.`,
      keep: strengths.slice(0, 3).join(". ") || "No data this week.",
      start: opps.slice(0, 3).join(". ") || "No data this week.",
      stop: opps.length > 3 ? opps.slice(3, 5).join(". ") : "Review needed.",
    };
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ocrolus Weekly Call Scorecard</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'IBM Plex Sans',sans-serif;background:#0a0f1a;color:#e2e8f0;padding:24px 20px;max-width:960px;margin:0 auto}
.mono{font-family:'IBM Plex Mono',monospace}
.tag{font-size:9px;padding:2px 6px;border-radius:3px;font-weight:500;letter-spacing:.5px}
.card{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:16px;margin-bottom:10px}
.bar{height:4px;background:#1e293b;border-radius:2px;overflow:hidden;width:90px}
.fill{height:100%;border-radius:2px}
.dot{width:7px;height:7px;border-radius:50%;display:inline-block}
.dot-on{background:#10b981}.dot-off{background:#334155}
button{cursor:pointer;font-family:inherit;border:none;outline:none}
.tab{padding:8px 16px;border-radius:7px;background:transparent;border:1px solid #1e293b;text-align:left;transition:all .15s}
.tab.active{border-color:#3b82f6;background:#1e293b}
.tab .name{font-size:13px;font-weight:600}.tab .sub{font-size:10px;color:#475569}
.vtab{padding:4px 10px;font-size:10px;border-radius:4px;border:1px solid #1e293b;background:transparent;color:#475569;text-transform:uppercase;letter-spacing:.5px}
.vtab.active{border-color:#3b82f6;background:#1e293b;color:#93c5fd}
.call-row{border-left:3px solid;padding:10px 14px;cursor:pointer;transition:background .15s}
.call-row:hover{background:#1e293b}
a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}
table{width:100%;border-collapse:collapse}
th,td{padding:6px 8px;border-bottom:1px solid #1e293b;font-size:11px}
th{color:#475569;font-weight:500;text-align:left}
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:16px}
.kpi{padding:12px 14px}.kpi .label{font-size:10px;color:#475569;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px}
.coaching-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.strength{padding-left:8px;border-left:2px solid #10b981;margin-bottom:5px;font-size:11px;color:#94a3b8;line-height:1.5}
.opp{padding-left:8px;border-left:2px solid #f59e0b;margin-bottom:5px;font-size:11px;color:#94a3b8;line-height:1.5}
@media(max-width:640px){
body{padding:14px 10px}
h1{font-size:18px!important}
.tab{padding:6px 10px;min-width:0!important;flex:1 1 calc(50% - 4px)!important}
.tab .name{font-size:12px}.tab .sub{font-size:9px}
.kpi-grid{grid-template-columns:repeat(2,1fr)!important;gap:6px}
.coaching-grid{grid-template-columns:1fr!important}
.call-row{padding:10px 10px;min-height:44px}
.dots-wrap{display:none!important}
table{font-size:10px;display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}
th,td{padding:4px 5px;font-size:10px;white-space:nowrap}
.detail-grid{grid-template-columns:1fr!important}
.bar{width:60px}
.vtab{padding:5px 10px;font-size:9px;min-height:36px}
.card{padding:12px}
}
</style>
</head>
<body>
<div style="margin-bottom:20px">
<div class="mono" style="font-size:10px;color:#475569;letter-spacing:2px;text-transform:uppercase">Ocrolus · Gong Call Scorer v7</div>
<h1 style="font-size:22px;font-weight:700;margin:4px 0 0">Weekly Call Scorecard</h1>
<div style="font-size:11px;color:#475569;margin-top:2px">${repsData.length} reps · ${calls.length} calls · MEDDPICC · Gap Selling · Challenger · Never Split the Difference</div>
</div>
<div id="app"></div>
<script>
const reps=${JSON.stringify(repsData)};
const calls=${JSON.stringify(calls)};
const coaching=${JSON.stringify(coaching)};
const MK=["M","E","DC","DP","IP","Ch","Co"];
const ML={M:"Metrics",E:"Econ Buyer",DC:"Decision Criteria",DP:"Decision Process",IP:"Identify Pain",Ch:"Champion",Co:"Competition"};
const DK=["r","d","v","a","c","e"];
const DL={r:"Rapport",d:"Discovery",v:"Value",a:"Advancement",c:"Control",e:"Engagement"};
const DW={r:"10%",d:"30%",v:"15%",a:"20%",c:"10%",e:"15%"};
let st={rep:reps[0]?.id||"",sel:null,view:"overview"};
function sc(s){return s>=8.5?"#10b981":s>=7.5?"#3b82f6":"#f59e0b"}
function render(){
const el=document.getElementById("app");
const f=calls.filter(c=>c.rep===st.rep);
const rd=reps.find(r=>r.id===st.rep);
if(!rd||!f.length){el.innerHTML="<p>No data available.</p>";return}
const avg=(f.reduce((a,c)=>a+c.w,0)/f.length).toFixed(2);
const best=f.reduce((a,c)=>c.w>a.w?c:a,f[0]);
const det=st.sel?calls.find(c=>c.id===st.sel):null;
const co=coaching[st.rep]||{narrative:"",keep:"",start:"",stop:""};
let h="";
h+='<div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">';
reps.forEach(r=>{h+='<button class="tab '+(st.rep===r.id?"active":"")+'" onclick="st.rep=\\''+r.id+"\\';st.sel=null;st.view='overview';render()\\"><div style=\\"display:flex;justify-content:space-between;align-items:center;gap:12px\\"><div><div class=\\"name\\" style=\\"color:'+(st.rep===r.id?'#e2e8f0':'#64748b')+'\\">'+ r.name+'</div><div class=\\"sub\\">'+ r.title+' · '+ r.n+' calls</div></div><div style=\\"font-size:18px;font-weight:700;color:'+sc(r.avg)+'\\">'+ r.avg+'</div></div></button>'});
h+="</div>";
h+='<div style="display:flex;gap:6px;margin-bottom:14px">';
["overview","meddpicc","compare"].forEach(v=>{h+='<button class="vtab mono '+(st.view===v?"active":"")+'" onclick="st.view=\\''+v+"\\';st.sel=null;render()\\">"+v+"</button>"});
h+="</div>";
h+='<div class="kpi-grid">';
h+='<div class="card kpi"><div class="label mono">Avg Score</div><div style="font-size:24px;font-weight:700;color:'+sc(parseFloat(avg))+'">'+avg+"</div></div>";
h+='<div class="card kpi"><div class="label mono">Best Call</div><div style="font-size:24px;font-weight:700;color:#3b82f6">'+best.w+"</div></div>";
h+='<div class="card kpi"><div class="label mono">Calls</div><div style="font-size:24px;font-weight:700;color:#8b5cf6">'+f.length+"</div></div>";
h+='<div class="card kpi"><div class="label mono">Profile</div><div style="font-size:15px;font-weight:700;color:#f59e0b">'+(rd.profile||"")+"</div></div>";
h+="</div>";
if(st.view==="overview"&&!det){
h+='<div class="card" style="margin-bottom:14px;border-left:3px solid #3b82f6"><div class="mono" style="font-size:10px;font-weight:600;color:#93c5fd;margin-bottom:8px;letter-spacing:1px;text-transform:uppercase">Week in Review: '+rd.name+"</div><div style=\\"font-size:12px;color:#94a3b8;line-height:1.7\\">"+co.narrative+"</div></div>";
f.forEach(c=>{h+='<div class="card call-row" style="border-left-color:'+sc(c.w)+'" onclick="st.sel='+c.id+';render()"><div style="display:flex;justify-content:space-between;align-items:center;gap:6px"><div style="flex:1;min-width:160px"><div style="font-size:13px;font-weight:600">'+c.title+'</div><div style="font-size:10px;color:#64748b">'+c.prospect+" · "+c.date+" · "+c.dur+'</div></div><div style="display:flex;gap:2px" class="dots-wrap">';MK.forEach(k=>{h+='<span class="dot '+(c.m[k]?"dot-on":"dot-off")+'"></span>'});h+='</div><div style="font-size:18px;font-weight:700;color:'+sc(c.w)+';min-width:36px;text-align:right">'+c.w+'</div><div style="color:#475569">›</div></div></div>'});
h+='<div class="card" style="margin-top:14px"><div class="mono" style="font-size:10px;font-weight:600;color:#93c5fd;margin-bottom:8px;letter-spacing:1px;text-transform:uppercase">Coaching: '+rd.name+'</div><div class="coaching-grid"><div><div style="font-size:10px;font-weight:600;color:#10b981;margin-bottom:3px">✦ KEEP</div><div style="font-size:11px;color:#94a3b8;line-height:1.5">'+co.keep+'</div></div><div><div style="font-size:10px;font-weight:600;color:#f59e0b;margin-bottom:3px">▲ START</div><div style="font-size:11px;color:#94a3b8;line-height:1.5">'+co.start+'</div></div><div><div style="font-size:10px;font-weight:600;color:#ef4444;margin-bottom:3px">■ STOP</div><div style="font-size:11px;color:#94a3b8;line-height:1.5">'+co.stop+"</div></div></div></div>"}
if(det){h+='<button class="vtab mono" onclick="st.sel=null;render()" style="margin-bottom:10px">← Back</button>';h+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:14px"><div><h2 style="font-size:16px;font-weight:700"><a href="'+det.url+'" target="_blank" style="color:#e2e8f0;text-decoration:none;border-bottom:1px solid #3b82f6;padding-bottom:1px">'+det.title+' ↗</a></h2><div style="font-size:11px;color:#64748b;margin-top:2px">'+det.prospect+" · "+det.date+" · "+det.dur+" · "+det.type+'</div></div><div style="text-align:center"><div style="font-size:28px;font-weight:700;color:'+sc(det.w)+'">'+det.w+'</div><div class="mono" style="font-size:9px;color:#475569">WEIGHTED</div></div></div>';DK.forEach(d=>{const s=det.s[d];const bg=s>=8?"#10b981":s>=7?"#f59e0b":"#ef4444";h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0"><span style="font-size:11px;color:#94a3b8;min-width:110px">'+DL[d]+' <span style="color:#475569;font-size:9px">('+DW[d]+')</span></span><div style="display:flex;align-items:center;gap:6px"><div class="bar"><div class="fill" style="width:'+s*10+"%;background:"+bg+'"></div></div><span style="font-size:11px;font-weight:600;color:'+bg+';min-width:20px">'+s+"</span></div></div>"});h+='<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:10px">';MK.forEach(k=>{h+='<div class="tag mono" style="background:'+(det.m[k]?"rgba(16,185,129,0.12)":"rgba(100,116,139,0.06)")+";color:"+(det.m[k]?"#10b981":"#475569")+";border:1px solid "+(det.m[k]?"rgba(16,185,129,0.25)":"#1e293b")+'">'+k+"</div>"});h+="</div></div>";h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0" class="detail-grid"><div class="card"><div class="mono" style="font-size:10px;font-weight:600;color:#10b981;margin-bottom:6px">STRENGTHS</div>';det.str.forEach(s=>{h+='<div class="strength">'+s+"</div>"});h+='</div><div class="card"><div class="mono" style="font-size:10px;font-weight:600;color:#f59e0b;margin-bottom:6px">OPPORTUNITIES</div>';det.opp.forEach(o=>{h+='<div class="opp">'+o+"</div>"});h+="</div></div>";if(det.coach){h+='<div class="card" style="border-left:3px solid #3b82f6"><div class="mono" style="font-size:10px;font-weight:600;color:#93c5fd;margin-bottom:6px">COACHING</div><div style="font-size:12px;color:#94a3b8;line-height:1.7">'+det.coach+"</div></div>"}if(det.q){h+='<div class="card"><div class="mono" style="font-size:10px;font-weight:600;color:#8b5cf6;margin-bottom:4px">KEY QUOTE</div><div style="font-size:13px;color:#e2e8f0;font-style:italic;border-left:3px solid #8b5cf6;padding-left:10px">"'+det.q+'"</div></div>'}h+='<a href="'+det.url+'" target="_blank" class="mono" style="font-size:10px;display:inline-block;margin-top:8px">View in Gong →</a>'}
el.innerHTML=h}
render();
</script>
</body></html>`;
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
  const medals = ["🥇", "🥈", "🥉", "4️⃣"];
  
  const topCalls = [...allCalls].sort((a, b) => b.w - a.w).slice(0, 3);
  
  let msg = `📊 *Weekly Call Scorecard*\n_${repsData.length} reps · ${allCalls.length} calls scored · MEDDPICC · Gap Selling · Challenger · Never Split the Difference_\n\n---\n\n*Rep Rankings*\n\n| Rep | Calls | Avg | Best Call | Profile |\n|---|---|---|---|---|\n`;
  
  sorted.forEach((r, i) => {
    const best = allCalls.filter(c => c.rep === r.id).sort((a, b) => b.w - a.w)[0];
    msg += `| ${medals[i] || ""} ${r.name} | ${r.n} | *${r.avg}* | ${best?.title || "N/A"} (${best?.w || "N/A"}) | ${r.profile} |\n`;
  });
  
  msg += `\n---\n\n*🔥 Top 3 Calls*\n\n`;
  topCalls.forEach((c, i) => {
    const rep = repsData.find(r => r.id === c.rep);
    msg += `${i + 1}. *${rep?.name || "Unknown"} — <${c.url}|${c.title}> (${c.w})* — ${c.str?.[0] || "Strong execution"}\n\n`;
  });
  
  // MEDDPICC gaps
  const totalCalls = allCalls.length;
  const mGaps = {};
  ["M", "E", "DC", "DP", "IP", "Ch", "Co"].forEach(k => {
    mGaps[k] = allCalls.filter(c => c.m[k]).length;
  });
  
  msg += `---\n\n*⚠️ Team-Wide Gaps*\n\n`;
  if (mGaps.Co < totalCalls * 0.5) msg += `• *Competition* — Probed in only ${mGaps.Co} of ${totalCalls} calls.\n`;
  if (mGaps.M < totalCalls * 0.5) msg += `• *Metrics* — ROI quantified in only ${mGaps.M} of ${totalCalls} calls.\n`;
  if (mGaps.E < totalCalls * 0.5) msg += `• *Economic Buyer* — Identified in only ${mGaps.E} of ${totalCalls} calls.\n`;
  
  msg += `\n---\n\n🔗 *<https://vdua-ocrolus.github.io/AE-scorecard/|Open Full Interactive Dashboard>* — works on desktop and mobile\n\n_Scored via Gong Call Scorer v7 · 6-Dimension Rubric · 4 frameworks_`;
  
  return msg;
}

// ─── Main Pipeline ───────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting Weekly AE Scorecard...");
  
  // Calculate date range (last 7 days)
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 7);
  
  const fromDate = from.toISOString();
  const toDate = now.toISOString();
  console.log(`📅 Date range: ${fromDate} to ${toDate}`);
  
  // Step 1: Get all calls
  console.log("📞 Fetching calls from Gong...");
  const allGongCalls = await getCalls(fromDate, toDate);
  console.log(`   Found ${allGongCalls.length} total calls`);
  
  // Step 2: Filter for our reps
  const repResults = [];
  const client = new Anthropic();
  
  for (const rep of REPS) {
    console.log(`\n👤 Processing ${rep.name}...`);
    
    const repCalls = allGongCalls.filter(
      (c) =>
        c.primaryUserId === rep.gongId &&
        c.scope === "External" &&
        c.direction === "Conference" &&
        c.duration >= MIN_DURATION
    );
    
    console.log(`   ${repCalls.length} qualifying calls`);
    
    const scoredCalls = [];
    
    for (const call of repCalls) {
      console.log(`   📝 Scoring: ${call.title} (${Math.round(call.duration / 60)}m)`);
      
      // Pull transcript
      const transcript = await getTranscript(call.id);
      if (!transcript) {
        console.log(`      ⚠️ No transcript available, skipping`);
        continue;
      }
      
      // Process transcript
      const processed = processTranscript(transcript);
      if (!processed) {
        console.log(`      ⚠️ Transcript processing failed, skipping`);
        continue;
      }
      
      // Score via Claude API
      const score = await scoreCall(client, call, processed);
      if (!score) {
        console.log(`      ⚠️ Scoring failed, skipping`);
        continue;
      }
      
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const d = new Date(call.started);
      const dateStr = `${dayNames[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
      
      scoredCalls.push({
        title: call.title,
        date: dateStr,
        duration: call.duration,
        url: call.url,
        prospect: "Multiple stakeholders",
        score,
      });
      
      console.log(`      ✅ Score: ${score.weighted}`);
      
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
  
  // Step 3: Generate HTML dashboard
  console.log("\n📊 Generating dashboard...");
  const html = generateDashboard(repResults);
  fs.writeFileSync("index.html", html);
  console.log("   ✅ index.html written");
  
  // Step 4: Build rep data for Slack
  const repsData = repResults.map(r => ({
    id: r.repId,
    name: r.name,
    title: r.title,
    profile: r.calls[0]?.score?.profile || "Unknown",
    avg: r.calls.length > 0
      ? parseFloat((r.calls.reduce((a, c) => a + (c.score?.weighted || 0), 0) / r.calls.length).toFixed(2))
      : 0,
    n: r.calls.length,
  }));
  
  const allScoredCalls = repResults.flatMap(r =>
    r.calls.map(c => ({
      rep: r.repId,
      title: c.title,
      url: c.url,
      w: c.score?.weighted || 0,
      m: c.score?.meddpicc || {},
      str: c.score?.strengths || [],
    }))
  );
  
  // Step 5: Send Slack message
  if (process.env.SLACK_WEBHOOK_URL) {
    console.log("\n💬 Sending Slack message...");
    const slackMsg = buildSlackMessage(repsData, allScoredCalls);
    await sendSlack(process.env.SLACK_WEBHOOK_URL, slackMsg);
    console.log("   ✅ Slack message sent");
  } else {
    console.log("\n⚠️ No SLACK_WEBHOOK_URL set, skipping Slack notification");
  }
  
  console.log("\n🎉 Weekly scorecard complete!");
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
