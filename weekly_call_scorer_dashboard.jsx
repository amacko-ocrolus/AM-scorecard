import { useState } from "react";

const reps = [
  { id: "sam", name: "Sam Loomis", title: "Enterprise AE", profile: "Relationship Builder + Challenger", avgScore: 7.81 },
  { id: "kyle", name: "Kyle Swikoski", title: "Dir. Strategic Sales", profile: "Challenger + Problem Solver", avgScore: 8.24 }
];

const calls = [
  // SAM's calls
  { id: 1, rep: "sam", title: "HMA X Ocrolus", prospect: "Amy (Consultant)", date: "Tue Mar 10", duration: "44 min", type: "Demo/Discovery", stage: "Pricing Requested", scores: { rapport: 8, discovery: 9, value: 9, advancement: 9, control: 8, engagement: 9 }, weighted: 8.55, talkRatio: 46, meddpicc: { M: true, E: true, DC: true, DP: true, IP: true, Ch: true, Co: true }, strengths: ["Steph's transparency on LOX limitations built trust", "Amy volunteered internal ROI argument unprompted", "Pricing requested + follow-up booked ON the call"], opportunities: ["Probe partner approval process deeper", "Ask about competitive alternatives"], keyQuote: "I'll give you a 1-day turn if you use the tool.", url: "https://us-29990.app.gong.io/call?id=244902142835132322" },
  { id: 2, rep: "sam", title: "Superior Natl Bank - POV", prospect: "Bill, Nicole, Denise", date: "Tue Mar 10", duration: "25 min", type: "POV Check-in", stage: "Testing", scores: { rapport: 7, discovery: 7, value: 8, advancement: 7, control: 8, engagement: 8 }, weighted: 7.60, talkRatio: 55, meddpicc: { M: false, E: false, DC: false, DP: true, IP: true, Ch: true, Co: false }, strengths: ["Nicole validated self-employed calcs unprompted", "Transparent union borrower limitation handling", "Multiple participants actively engaged"], opportunities: ["Quantify ROI when errors found", "Probe AI policy timeline more aggressively"], keyQuote: "The ones I found appeared to be accurate.", url: "https://us-29990.app.gong.io/call?id=967853026113172916" },
  { id: 3, rep: "sam", title: "Republic Bank + Ocrolus", prospect: "Tim, Sonya", date: "Tue Mar 10", duration: "54 min", type: "First Demo", stage: "Early Evaluation", scores: { rapport: 7, discovery: 7, value: 7, advancement: 6, control: 7, engagement: 8 }, weighted: 7.20, talkRatio: 46, meddpicc: { M: false, E: false, DC: false, DP: true, IP: true, Ch: false, Co: false }, strengths: ["Humor landed authentically with prospects", "Steph transparent about audit log unknown", "Processing manager asked fraud detection questions"], opportunities: ["No pricing discussed — initiate for $7B bank", "Book follow-up live, not 'about a week'", "Probe competition"], keyQuote: "I work for a bank. So I think of crazy sh*t.", url: "https://us-29990.app.gong.io/call?id=8048322502833316181" },
  { id: 4, rep: "sam", title: "Shea Mortgage - Demo", prospect: "Kelly, Tim, Matt (CFO)", date: "Tue Mar 10", duration: "47 min", type: "Demo (2nd mtg)", stage: "Pricing Discussion", scores: { rapport: 8, discovery: 8, value: 8, advancement: 7, control: 8, engagement: 9 }, weighted: 7.85, talkRatio: 50, meddpicc: { M: false, E: true, DC: true, DP: true, IP: true, Ch: true, Co: false }, strengths: ["Kelly validated product to her own CFO", "Matt (CFO) highly engaged on tech stack", "Confident pricing positioning"], opportunities: ["Create urgency when prospect controls pace", "Quantify ROI with CFO present"], keyQuote: "I vote you keep her. She's good.", url: "https://us-29990.app.gong.io/call?id=1884016992800208423" },
  { id: 5, rep: "sam", title: "VanDyk X Ocrolus", prospect: "Jeanie, Lindsay", date: "Wed Mar 11", duration: "14 min", type: "Pricing Review", stage: "Board Approval", scores: { rapport: 8, discovery: 7, value: 7, advancement: 9, control: 8, engagement: 8 }, weighted: 7.85, talkRatio: 52, meddpicc: { M: false, E: false, DC: true, DP: true, IP: false, Ch: true, Co: false }, strengths: ["Andrew's direct close got verbal commit", "Pricing aligned — no sticker shock ($130K)", "ICE dinner + booth visit locked"], opportunities: ["Proactively outline SLA protections", "Ask what objections board might raise"], keyQuote: "You're front and center.", url: "https://us-29990.app.gong.io/call?id=5284007527972607206" },
  // KYLE's calls
  { id: 6, rep: "kyle", title: "Mission Mortgage Demo", prospect: "Multiple stakeholders", date: "Mon Mar 9", duration: "61 min", type: "Full Demo", stage: "Initial Demo", scores: { rapport: 7, discovery: 8, value: 8, advancement: 7, control: 8, engagement: 8 }, weighted: 7.75, talkRatio: 48, meddpicc: { M: false, E: false, DC: true, DP: true, IP: true, Ch: false, Co: false }, strengths: ["Comprehensive 61-min demo with full product coverage", "Strong positioning of Encompass integration value", "Good use of SE for technical deep-dives"], opportunities: ["Identify champion and economic buyer earlier", "Quantify business impact during demo"], keyQuote: "N/A — first demo, building foundation", url: "https://us-29990.app.gong.io/call?id=5012764401525604158" },
  { id: 7, rep: "kyle", title: "Gulf Coast Bank - Demo & POV", prospect: "Multiple stakeholders", date: "Mon Mar 9", duration: "56 min", type: "Refresher Demo + POV", stage: "POV Setup", scores: { rapport: 8, discovery: 8, value: 8, advancement: 8, control: 8, engagement: 8 }, weighted: 8.00, talkRatio: 45, meddpicc: { M: false, E: false, DC: true, DP: true, IP: true, Ch: true, Co: false }, strengths: ["Effective refresher demo tailored to bank context", "Smooth transition from demo to POV kickoff", "Strong agenda management across 56 minutes"], opportunities: ["Discuss ROI metrics specific to bank operations", "Probe competitive landscape"], keyQuote: "N/A — refresher + POV kickoff", url: "https://us-29990.app.gong.io/call?id=1018191465795230656" },
  { id: 8, rep: "kyle", title: "Mortgage Financial Svcs POV", prospect: "Kelly, Susan, Karen", date: "Mon Mar 9", duration: "34 min", type: "POV Test-Drive Kickoff", stage: "POV Active", scores: { rapport: 9, discovery: 8, value: 8, advancement: 9, control: 9, engagement: 9 }, weighted: 8.60, talkRatio: 44, meddpicc: { M: true, E: false, DC: true, DP: true, IP: true, Ch: true, Co: true }, strengths: ["Outstanding rapport — Waymo story, espresso martini promise, 'don't believe a word you say' rapport", "Kelly prepped 11 test files unprompted — champion fully activated", "Follow-up booked Friday with clear success criteria shared"], opportunities: ["Could have probed budget/economic buyer more directly", "Explicitly confirm decision timeline post-POV"], keyQuote: "Until I test it, I don't believe a damn word you say.", url: "https://us-29990.app.gong.io/call?id=5670717139300812606" },
  { id: 9, rep: "kyle", title: "HomeBridge NFTYDoor", prospect: "Noel, Frank, Erica", date: "Tue Mar 10", duration: "33 min", type: "Contract / Implementation", stage: "Closing", scores: { rapport: 9, discovery: 8, value: 8, advancement: 10, control: 9, engagement: 9 }, weighted: 8.90, talkRatio: 42, meddpicc: { M: true, E: true, DC: true, DP: true, IP: true, Ch: true, Co: true }, strengths: ["Deal closing on the call — 1-year contract, signature expected same day", "Kyle handled complex org change (NFTYDoor split) with perfect context", "Introduced Optima POS product as upsell — planted seed for phase 2"], opportunities: ["Could have pinned exact implementation kickoff date vs. 'March 19th probably'", "Proactively share change management resources for new UW team"], keyQuote: "Ocrolus is the giant double-island Viking fridge kitchen.", url: "https://us-29990.app.gong.io/call?id=7311205256574420592" },
  { id: 10, rep: "kyle", title: "TexasBank Test-Drive", prospect: "Multiple stakeholders", date: "Tue Mar 10", duration: "42 min", type: "POV Test-Drive", stage: "POV Active", scores: { rapport: 8, discovery: 8, value: 8, advancement: 8, control: 8, engagement: 8 }, weighted: 8.00, talkRatio: 47, meddpicc: { M: false, E: false, DC: true, DP: true, IP: true, Ch: true, Co: false }, strengths: ["Well-structured POV kickoff with clear test parameters", "Good team selling with SE handling product depth", "Encompass integration positioned as key differentiator"], opportunities: ["Quantify expected efficiency gains for the prospect", "Probe competitive evaluation status"], keyQuote: "N/A — POV kickoff execution", url: "https://us-29990.app.gong.io/call?id=564170903269650994" },
  { id: 11, rep: "kyle", title: "Steadfast Mortgage", prospect: "Multiple stakeholders", date: "Thu Mar 12", duration: "60 min", type: "Deep Demo", stage: "Active Evaluation", scores: { rapport: 8, discovery: 8, value: 9, advancement: 7, control: 8, engagement: 8 }, weighted: 8.00, talkRatio: 48, meddpicc: { M: false, E: false, DC: true, DP: true, IP: true, Ch: true, Co: false }, strengths: ["60-minute deep demo shows strong prospect engagement", "Comprehensive product coverage including conditioning", "Good discovery of current workflow pain points"], opportunities: ["Firmer next steps with specific follow-up date", "Identify and engage economic buyer"], keyQuote: "N/A — deep demo, relationship building", url: "https://us-29990.app.gong.io/call?id=6001985602965987747" },
  { id: 12, rep: "kyle", title: "Mega Capital - Proposal", prospect: "Multiple stakeholders", date: "Thu Mar 12", duration: "21 min", type: "Proposal & Next Steps", stage: "Pricing/Proposal", scores: { rapport: 8, discovery: 8, value: 8, advancement: 9, control: 9, engagement: 8 }, weighted: 8.45, talkRatio: 44, meddpicc: { M: true, E: true, DC: true, DP: true, IP: true, Ch: true, Co: false }, strengths: ["Proposal walkthrough — concise 21-min focused session", "Clear pricing structure presented", "Mutual next steps with timeline commitment"], opportunities: ["Probe competitive alternatives", "Confirm internal approval process and timeline"], keyQuote: "N/A — pricing/proposal review", url: "https://us-29990.app.gong.io/call?id=6210740012227288150" }
];

const dims = ["rapport","discovery","value","advancement","control","engagement"];
const dimLabels = { rapport: "Rapport", discovery: "Discovery", value: "Value", advancement: "Advancement", control: "Control", engagement: "Engagement" };
const dimWeights = { rapport: "10%", discovery: "25%", value: "20%", advancement: "25%", control: "10%", engagement: "10%" };
const mLabels = { M: "Metrics", E: "Econ Buyer", DC: "Decision Criteria", DP: "Decision Process", IP: "Identify Pain", Ch: "Champion", Co: "Competition" };

function Bar({ score }) {
  const bg = score >= 8 ? "#10b981" : score >= 7 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 100, height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${score * 10}%`, height: "100%", background: bg, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: bg, minWidth: 24 }}>{score}</span>
    </div>
  );
}

export default function Dashboard() {
  const [rep, setRep] = useState("sam");
  const [sel, setSel] = useState(null);
  const [view, setView] = useState("overview");
  const filtered = calls.filter(c => c.rep === rep);
  const repData = reps.find(r => r.id === rep);
  const best = filtered.reduce((a, c) => c.weighted > a.weighted ? c : a, filtered[0]);
  const avg = (filtered.reduce((a, c) => a + c.weighted, 0) / filtered.length).toFixed(2);
  const totalMin = filtered.reduce((a, c) => a + parseInt(c.duration), 0);
  const detail = sel !== null ? calls.find(c => c.id === sel) : null;
  const mKeys = Object.keys(mLabels);
  const mFreq = mKeys.map(k => ({ k, l: mLabels[k], n: filtered.filter(c => c.meddpicc[k]).length, f: filtered.filter(c => c.meddpicc[k]).length >= Math.ceil(filtered.length * 0.7) ? "Always" : filtered.filter(c => c.meddpicc[k]).length >= Math.ceil(filtered.length * 0.3) ? "Sometimes" : "Rarely" }));

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', -apple-system, sans-serif", background: "#0a0f1a", color: "#e2e8f0", minHeight: "100vh", padding: "20px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: "#475569", letterSpacing: 2, textTransform: "uppercase" }}>Gong Call Scorer · Week of Mar 9–12, 2026</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "4px 0 0", color: "#e2e8f0" }}>Sales Call Scorecard</h1>
      </div>

      {/* Rep Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {reps.map(r => (
          <button key={r.id} onClick={() => { setRep(r.id); setSel(null); setView("overview"); }}
            style={{ padding: "8px 16px", borderRadius: 8, border: rep === r.id ? "1px solid #3b82f6" : "1px solid #1e293b", background: rep === r.id ? "#1e293b" : "transparent", cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: rep === r.id ? "#e2e8f0" : "#64748b" }}>{r.name}</div>
            <div style={{ fontSize: 11, color: "#475569" }}>{r.title} · Avg: {r.avgScore}</div>
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {["overview", "meddpicc"].map(v => (
            <button key={v} onClick={() => { setView(v); setSel(null); }}
              style={{ padding: "5px 12px", fontSize: 11, borderRadius: 5, border: view === v ? "1px solid #3b82f6" : "1px solid #1e293b", background: view === v ? "#1e293b" : "transparent", color: view === v ? "#93c5fd" : "#475569", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase" }}>
              {v === "meddpicc" ? "MEDDPICC" : v}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
        {[
          { l: "Avg Score", v: avg, c: parseFloat(avg) >= 8 ? "#10b981" : "#f59e0b" },
          { l: "Best Call", v: best?.weighted, c: "#3b82f6" },
          { l: "Calls", v: filtered.length, c: "#8b5cf6" },
          { l: "Profile", v: repData?.profile?.split("+")[0]?.trim(), c: "#f59e0b", s: true }
        ].map((k, i) => (
          <div key={i} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "#475569", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{k.l}</div>
            <span style={{ fontSize: k.s ? 15 : 24, fontWeight: 700, color: k.c }}>{k.v}</span>
          </div>
        ))}
      </div>

      {view === "overview" && !detail && (
        <>
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSel(c.id)}
              style={{ background: "#111827", border: "1px solid #1e293b", borderLeft: `3px solid ${c.weighted >= 8.5 ? "#10b981" : c.weighted >= 7.5 ? "#3b82f6" : "#f59e0b"}`, borderRadius: 8, padding: "12px 16px", marginBottom: 8, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e293b"} onMouseLeave={e => e.currentTarget.style.background = "#111827"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{c.prospect} · {c.date} · {c.duration}</div>
                </div>
                <div style={{ display: "flex", gap: 2 }}>{mKeys.map(k => <div key={k} style={{ width: 8, height: 8, borderRadius: "50%", background: c.meddpicc[k] ? "#10b981" : "#334155" }} />)}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: c.weighted >= 8.5 ? "#10b981" : c.weighted >= 7.5 ? "#3b82f6" : "#f59e0b", minWidth: 40, textAlign: "right" }}>{c.weighted}</div>
                <div style={{ color: "#475569" }}>›</div>
              </div>
            </div>
          ))}
          {/* Coaching */}
          <div style={{ marginTop: 16, background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#93c5fd", marginBottom: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>Coaching: {repData?.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {rep === "sam" ? (<>
                <div><div style={{ fontSize: 11, fontWeight: 600, color: "#10b981", marginBottom: 4 }}>✦ KEEP</div><div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>Team selling with Steph. Transparency on limitations. Natural rapport and humor.</div></div>
                <div><div style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b", marginBottom: 4 }}>▲ START</div><div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>Quantify ROI every call (Metrics 1/5). Probe competition (1/5). Lock next steps tighter.</div></div>
                <div><div style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", marginBottom: 4 }}>■ STOP</div><div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>Letting prospects control follow-up pace. Always propose a specific date.</div></div>
              </>) : (<>
                <div><div style={{ fontSize: 11, fontWeight: 600, color: "#10b981", marginBottom: 4 }}>✦ KEEP</div><div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>Exceptional deal control — HomeBridge closed same day. POV success criteria shared upfront. Strong rapport building across all calls.</div></div>
                <div><div style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b", marginBottom: 4 }}>▲ START</div><div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>Probe competition more consistently (1/7). Identify economic buyer earlier in demo cycles. Quantify ROI in first meetings.</div></div>
                <div><div style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", marginBottom: 4 }}>■ STOP</div><div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>Running 60+ min demos without explicit time checks. Shorter, more focused sessions drive faster decisions.</div></div>
              </>)}
            </div>
          </div>
        </>
      )}

      {view === "meddpicc" && !detail && (
        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "16px 18px", overflowX: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#93c5fd", marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>MEDDPICC — {repData?.name} ({filtered.length} calls)</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "#475569", borderBottom: "1px solid #1e293b", fontWeight: 500 }}>Element</th>
              {filtered.map(c => <th key={c.id} style={{ textAlign: "center", padding: "6px 4px", color: "#475569", borderBottom: "1px solid #1e293b", fontWeight: 500, fontSize: 10, maxWidth: 80 }}>{c.title.split(" ")[0]}</th>)}
              <th style={{ textAlign: "center", padding: "6px 8px", color: "#475569", borderBottom: "1px solid #1e293b", fontWeight: 500 }}>Freq</th>
            </tr></thead>
            <tbody>{mFreq.map(m => (
              <tr key={m.k}>
                <td style={{ padding: "8px 8px", borderBottom: "1px solid #1e293b" }}>
                  <span style={{ color: "#93c5fd", fontFamily: "'IBM Plex Mono', monospace", marginRight: 4, fontSize: 11 }}>{m.k}</span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{m.l}</span>
                </td>
                {filtered.map(c => (
                  <td key={c.id} style={{ textAlign: "center", padding: "8px 4px", borderBottom: "1px solid #1e293b" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: c.meddpicc[m.k] ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.08)", color: c.meddpicc[m.k] ? "#10b981" : "#475569", fontSize: 12, fontWeight: 600 }}>{c.meddpicc[m.k] ? "✓" : "—"}</div>
                  </td>
                ))}
                <td style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid #1e293b" }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, background: m.f === "Always" ? "rgba(16,185,129,0.15)" : m.f === "Sometimes" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.12)", color: m.f === "Always" ? "#10b981" : m.f === "Sometimes" ? "#f59e0b" : "#ef4444" }}>{m.f}</span>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {detail && (
        <div>
          <button onClick={() => setSel(null)} style={{ background: "none", border: "1px solid #1e293b", color: "#94a3b8", padding: "5px 12px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 12 }}>← Back</button>
          <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "18px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{detail.title}</h2>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{detail.prospect} · {detail.date} · {detail.duration} · {detail.type}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Stage: {detail.stage} · Talk: <span style={{ color: detail.talkRatio <= 60 ? "#10b981" : "#f59e0b" }}>{detail.talkRatio}%</span></div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: detail.weighted >= 8.5 ? "#10b981" : detail.weighted >= 7.5 ? "#3b82f6" : "#f59e0b" }}>{detail.weighted}</div>
                <div style={{ fontSize: 10, color: "#475569", fontFamily: "'IBM Plex Mono', monospace" }}>WEIGHTED</div>
              </div>
            </div>
            {dims.map(d => (
              <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
                <span style={{ fontSize: 12, color: "#94a3b8", minWidth: 120 }}>{dimLabels[d]} <span style={{ color: "#475569", fontSize: 10 }}>({dimWeights[d]})</span></span>
                <Bar score={detail.scores[d]} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
              {mKeys.map(k => (
                <div key={k} style={{ padding: "3px 8px", borderRadius: 3, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", background: detail.meddpicc[k] ? "rgba(16,185,129,0.12)" : "rgba(100,116,139,0.08)", color: detail.meddpicc[k] ? "#10b981" : "#475569", border: `1px solid ${detail.meddpicc[k] ? "rgba(16,185,129,0.25)" : "#1e293b"}` }}>
                  {k}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "14px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#10b981", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>STRENGTHS</div>
              {detail.strengths.map((s, i) => <div key={i} style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, marginBottom: 6, paddingLeft: 10, borderLeft: "2px solid #10b981" }}>{s}</div>)}
            </div>
            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "14px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>OPPORTUNITIES</div>
              {detail.opportunities.map((o, i) => <div key={i} style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, marginBottom: 6, paddingLeft: 10, borderLeft: "2px solid #f59e0b" }}>{o}</div>)}
            </div>
          </div>
          {detail.keyQuote !== "N/A" && !detail.keyQuote.startsWith("N/A") && (
            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "14px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8b5cf6", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>KEY QUOTE</div>
              <div style={{ fontSize: 14, color: "#e2e8f0", fontStyle: "italic", borderLeft: "3px solid #8b5cf6", paddingLeft: 12 }}>"{detail.keyQuote}"</div>
            </div>
          )}
          <a href={detail.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 11, color: "#3b82f6", fontFamily: "'IBM Plex Mono', monospace", textDecoration: "none" }}>View in Gong →</a>
        </div>
      )}

      <div style={{ marginTop: 20, textAlign: "center", fontSize: 10, color: "#1e293b", fontFamily: "'IBM Plex Mono', monospace" }}>
        6-dimension rubric · MEDDPICC · Challenger methodology · 12 calls scored
      </div>
    </div>
  );
}
