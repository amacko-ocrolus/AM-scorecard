import { useState } from "react";

const reps = [
  { id: "sam", name: "Sam Loomis", title: "Enterprise AE", profile: "Relationship Builder", avg: 7.81, calls: 5 },
  { id: "kyle", name: "Kyle Swikoski", title: "Dir. Strategic Sales", profile: "Challenger", avg: 8.24, calls: 7 },
  { id: "charlie", name: "Charlie Allen", title: "Enterprise AE", profile: "Hard Worker", avg: 7.67, calls: 3 }
];

const calls = [
  // SAM
  { id: 1, rep: "sam", title: "HMA X Ocrolus", prospect: "Amy (Consultant)", date: "Tue 3/10", dur: "44m", type: "Demo", stage: "Pricing", s: { r: 8, d: 9, v: 9, a: 9, c: 8, e: 9 }, w: 8.55, tr: 46, m: { M:1,E:1,DC:1,DP:1,IP:1,Ch:1,Co:1 }, str: ["Steph's transparency built trust","Amy volunteered ROI argument","Pricing + follow-up booked on call"], opp: ["Probe partner approval deeper","Ask about competition"], q: "I'll give you a 1-day turn if you use the tool.", url: "https://us-29990.app.gong.io/call?id=244902142835132322" },
  { id: 2, rep: "sam", title: "Superior Natl Bank POV", prospect: "Bill, Nicole, Denise", date: "Tue 3/10", dur: "25m", type: "POV Check-in", stage: "Testing", s: { r: 7, d: 7, v: 8, a: 7, c: 8, e: 8 }, w: 7.60, tr: 55, m: { M:0,E:0,DC:0,DP:1,IP:1,Ch:1,Co:0 }, str: ["Nicole validated self-employed calcs","Transparent union borrower handling","Multiple participants engaged"], opp: ["Quantify ROI from errors found","Probe AI policy timeline"], q: "The ones I found appeared to be accurate.", url: "https://us-29990.app.gong.io/call?id=967853026113172916" },
  { id: 3, rep: "sam", title: "Republic Bank", prospect: "Tim, Sonya", date: "Tue 3/10", dur: "54m", type: "First Demo", stage: "Early Eval", s: { r: 7, d: 7, v: 7, a: 6, c: 7, e: 8 }, w: 7.20, tr: 46, m: { M:0,E:0,DC:0,DP:1,IP:1,Ch:0,Co:0 }, str: ["Authentic humor landed well","Steph transparent on unknowns","Processing mgr asked fraud questions"], opp: ["Initiate pricing for $7B bank","Book follow-up live","Probe competition"], q: "I work for a bank. So I think of crazy sh*t.", url: "https://us-29990.app.gong.io/call?id=8048322502833316181" },
  { id: 4, rep: "sam", title: "Shea Mortgage Demo", prospect: "Kelly, Tim, Matt (CFO)", date: "Tue 3/10", dur: "47m", type: "Demo (2nd)", stage: "Pricing", s: { r: 8, d: 8, v: 8, a: 7, c: 8, e: 9 }, w: 7.85, tr: 50, m: { M:0,E:1,DC:1,DP:1,IP:1,Ch:1,Co:0 }, str: ["Kelly validated product to own CFO","CFO highly engaged on tech","Confident pricing positioning"], opp: ["Create urgency when prospect stalls","Quantify ROI with CFO present"], q: "I vote you keep her. She's good.", url: "https://us-29990.app.gong.io/call?id=1884016992800208423" },
  { id: 5, rep: "sam", title: "VanDyk Pricing Review", prospect: "Jeanie, Lindsay", date: "Wed 3/11", dur: "14m", type: "Pricing", stage: "Board Approval", s: { r: 8, d: 7, v: 7, a: 9, c: 8, e: 8 }, w: 7.85, tr: 52, m: { M:0,E:0,DC:1,DP:1,IP:0,Ch:1,Co:0 }, str: ["Andrew's close got verbal commit","No sticker shock on $130K","ICE dinner + booth locked"], opp: ["Outline SLA protections proactively","Ask what objections board may raise"], q: "You're front and center.", url: "https://us-29990.app.gong.io/call?id=5284007527972607206" },
  // KYLE
  { id: 6, rep: "kyle", title: "Mission Mortgage Demo", prospect: "Multiple stakeholders", date: "Mon 3/9", dur: "61m", type: "Full Demo", stage: "Initial Demo", s: { r: 7, d: 8, v: 8, a: 7, c: 8, e: 8 }, w: 7.75, tr: 48, m: { M:0,E:0,DC:1,DP:1,IP:1,Ch:0,Co:0 }, str: ["Comprehensive 61-min full product demo","Strong Encompass integration positioning","Good SE utilization"], opp: ["ID champion and econ buyer earlier","Quantify business impact during demo"], q: "", url: "https://us-29990.app.gong.io/call?id=5012764401525604158" },
  { id: 7, rep: "kyle", title: "Gulf Coast Bank POV", prospect: "Multiple stakeholders", date: "Mon 3/9", dur: "56m", type: "Refresher + POV", stage: "POV Setup", s: { r: 8, d: 8, v: 8, a: 8, c: 8, e: 8 }, w: 8.00, tr: 45, m: { M:0,E:0,DC:1,DP:1,IP:1,Ch:1,Co:0 }, str: ["Effective refresher tailored to bank","Smooth demo-to-POV transition","Strong 56-min agenda control"], opp: ["Discuss bank-specific ROI metrics","Probe competitive landscape"], q: "", url: "https://us-29990.app.gong.io/call?id=1018191465795230656" },
  { id: 8, rep: "kyle", title: "Mortgage Fin Svcs POV", prospect: "Kelly, Susan, Karen", date: "Mon 3/9", dur: "34m", type: "POV Kickoff", stage: "POV Active", s: { r: 9, d: 8, v: 8, a: 9, c: 9, e: 9 }, w: 8.60, tr: 44, m: { M:1,E:0,DC:1,DP:1,IP:1,Ch:1,Co:1 }, str: ["Outstanding rapport — Waymo story, espresso martini promise","Kelly prepped 11 files unprompted — champion activated","Follow-up booked with success criteria shared"], opp: ["Probe budget/economic buyer","Confirm decision timeline post-POV"], q: "Until I test it, I don't believe a damn word you say.", url: "https://us-29990.app.gong.io/call?id=5670717139300812606" },
  { id: 9, rep: "kyle", title: "HomeBridge NFTYDoor", prospect: "Noel, Frank, Erica", date: "Tue 3/10", dur: "33m", type: "Contract Close", stage: "Closing", s: { r: 9, d: 8, v: 8, a: 10, c: 9, e: 9 }, w: 8.90, tr: 42, m: { M:1,E:1,DC:1,DP:1,IP:1,Ch:1,Co:1 }, str: ["Deal closed on the call — 1yr contract, same-day signature","Navigated NFTYDoor split with perfect context","Planted Optima POS upsell seed for phase 2"], opp: ["Pin exact implementation kickoff date","Share change mgmt resources proactively"], q: "Ocrolus is the giant double-island Viking fridge kitchen.", url: "https://us-29990.app.gong.io/call?id=7311205256574420592" },
  { id: 10, rep: "kyle", title: "TexasBank Test-Drive", prospect: "Multiple stakeholders", date: "Tue 3/10", dur: "42m", type: "POV Test-Drive", stage: "POV Active", s: { r: 8, d: 8, v: 8, a: 8, c: 8, e: 8 }, w: 8.00, tr: 47, m: { M:0,E:0,DC:1,DP:1,IP:1,Ch:1,Co:0 }, str: ["Structured POV with clear test params","Good SE team selling","Encompass integration as key differentiator"], opp: ["Quantify expected efficiency gains","Probe competitive evaluation"], q: "", url: "https://us-29990.app.gong.io/call?id=564170903269650994" },
  { id: 11, rep: "kyle", title: "Steadfast Mortgage", prospect: "Multiple stakeholders", date: "Thu 3/12", dur: "60m", type: "Deep Demo", stage: "Active Eval", s: { r: 8, d: 8, v: 9, a: 7, c: 8, e: 8 }, w: 8.00, tr: 48, m: { M:0,E:0,DC:1,DP:1,IP:1,Ch:1,Co:0 }, str: ["60-min demo shows strong engagement","Comprehensive product + conditioning coverage","Good workflow pain discovery"], opp: ["Firmer next steps with date","ID and engage economic buyer"], q: "", url: "https://us-29990.app.gong.io/call?id=6001985602965987747" },
  { id: 12, rep: "kyle", title: "Mega Capital Proposal", prospect: "Multiple stakeholders", date: "Thu 3/12", dur: "21m", type: "Proposal", stage: "Pricing", s: { r: 8, d: 8, v: 8, a: 9, c: 9, e: 8 }, w: 8.45, tr: 44, m: { M:1,E:1,DC:1,DP:1,IP:1,Ch:1,Co:0 }, str: ["Concise 21-min pricing walkthrough","Clear structure presented","Mutual next steps with timeline"], opp: ["Probe competitive alternatives","Confirm internal approval process"], q: "", url: "https://us-29990.app.gong.io/call?id=6210740012227288150" },
  // CHARLIE
  { id: 13, rep: "charlie", title: "WR Exec Debrief Planning", prospect: "Julie & team", date: "Mon 3/9", dur: "49m", type: "Strategy/Planning", stage: "Active Client", s: { r: 7, d: 7, v: 8, a: 7, c: 8, e: 7 }, w: 7.30, tr: 50, m: { M:0,E:0,DC:1,DP:1,IP:1,Ch:1,Co:0 }, str: ["Strategic exec debrief planning shows account depth","Good cross-functional coordination","49-min invested in relationship expansion"], opp: ["Quantify expansion ROI for exec audience","Identify additional stakeholders to involve"], q: "", url: "https://us-29990.app.gong.io/call?id=7846082633042693952" },
  { id: 14, rep: "charlie", title: "NH Mutual Demo (Encompass)", prospect: "Multiple stakeholders", date: "Mon 3/9", dur: "64m", type: "Full Demo", stage: "Initial Demo", s: { r: 7, d: 8, v: 8, a: 7, c: 7, e: 8 }, w: 7.60, tr: 52, m: { M:0,E:0,DC:1,DP:1,IP:1,Ch:0,Co:0 }, str: ["Thorough 64-min Encompass demo","Covered full product suite","Strong prospect question engagement"], opp: ["64 min is long — tighten to 45","Build champion explicitly","Probe competition and timeline"], q: "", url: "https://us-29990.app.gong.io/call?id=6974865037967602683" },
  { id: 15, rep: "charlie", title: "LendSure ROI Sync", prospect: "Multiple stakeholders", date: "Tue 3/10", dur: "35m", type: "ROI Review", stage: "ROI/Expansion", s: { r: 8, d: 8, v: 8, a: 8, c: 8, e: 8 }, w: 8.10, tr: 48, m: { M:1,E:0,DC:1,DP:1,IP:1,Ch:1,Co:0 }, str: ["ROI-focused conversation — metrics driven","35 min well-structured review","Existing client expansion opportunity"], opp: ["Identify economic buyer for expansion","Probe competitive alternatives for upsell"], q: "", url: "https://us-29990.app.gong.io/call?id=9121896233413914421" },
];

const D = ["r","d","v","a","c","e"];
const DL = { r:"Rapport",d:"Discovery",v:"Value",a:"Advancement",c:"Control",e:"Engagement" };
const DW = { r:"10%",d:"25%",v:"20%",a:"25%",c:"10%",e:"10%" };
const MK = ["M","E","DC","DP","IP","Ch","Co"];
const ML = { M:"Metrics",E:"Econ Buyer",DC:"Decision Criteria",DP:"Decision Process",IP:"Identify Pain",Ch:"Champion",Co:"Competition" };

const coaching = {
  sam: { keep: "Team selling with Steph. Transparency on limitations. Natural humor.", start: "Quantify ROI every call (Metrics 1/5). Probe competition (1/5). Book meetings live.", stop: "Letting prospects control follow-up pace." },
  kyle: { keep: "Exceptional deal control — HomeBridge closed same day. POV success criteria shared upfront. Strong rapport.", start: "Probe competition more (1/7). ID economic buyer earlier. Quantify ROI in first meetings.", stop: "60+ min demos without time checks." },
  charlie: { keep: "ROI-focused approach on LendSure call. Thorough product coverage in demos. Good account depth.", start: "Tighten demos to 45 min max. Build champions explicitly. Probe competition in every call.", stop: "Running 64-min demos without interactivity checkpoints." }
};

function B({s}){const bg=s>=8?"#10b981":s>=7?"#f59e0b":"#ef4444";return<div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:90,height:4,background:"#1e293b",borderRadius:2,overflow:"hidden"}}><div style={{width:`${s*10}%`,height:"100%",background:bg,borderRadius:2}}/></div><span style={{fontSize:11,fontWeight:600,color:bg,minWidth:20}}>{s}</span></div>}

export default function App(){
  const[rep,setRep]=useState("sam");
  const[sel,setSel]=useState(null);
  const[view,setView]=useState("overview");
  const f=calls.filter(c=>c.rep===rep);
  const rd=reps.find(r=>r.id===rep);
  const avg=(f.reduce((a,c)=>a+c.w,0)/f.length).toFixed(2);
  const best=f.reduce((a,c)=>c.w>a.w?c:a,f[0]);
  const det=sel?calls.find(c=>c.id===sel):null;
  const mf=MK.map(k=>({k,l:ML[k],n:f.filter(c=>c.m[k]).length,f:f.filter(c=>c.m[k]).length>=Math.ceil(f.length*.7)?"Always":f.filter(c=>c.m[k]).length>=Math.ceil(f.length*.3)?"Sometimes":"Rarely"}));
  const co=coaching[rep];

  return(
  <div style={{fontFamily:"'IBM Plex Sans',-apple-system,sans-serif",background:"#0a0f1a",color:"#e2e8f0",minHeight:"100vh",padding:"20px 16px",maxWidth:900,margin:"0 auto"}}>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>

  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:8}}>
    <div>
      <div style={{fontSize:10,fontFamily:"'IBM Plex Mono',monospace",color:"#475569",letterSpacing:2,textTransform:"uppercase"}}>Ocrolus · Gong Call Scorer</div>
      <h1 style={{fontSize:20,fontWeight:700,margin:"2px 0 0",color:"#e2e8f0"}}>Weekly Scorecard · Mar 9–12, 2026</h1>
      <div style={{fontSize:11,color:"#475569",marginTop:2}}>3 reps · {calls.length} calls scored · Powered by MEDDPICC + Challenger</div>
    </div>
  </div>

  {/* Rep tabs */}
  <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
    {reps.map(r=>(
      <button key={r.id} onClick={()=>{setRep(r.id);setSel(null);setView("overview")}}
        style={{padding:"7px 14px",borderRadius:7,border:rep===r.id?"1px solid #3b82f6":"1px solid #1e293b",background:rep===r.id?"#1e293b":"transparent",cursor:"pointer",textAlign:"left",flex:"1 1 0",minWidth:140}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:rep===r.id?"#e2e8f0":"#64748b"}}>{r.name}</div>
            <div style={{fontSize:10,color:"#475569"}}>{r.title} · {r.calls} calls</div>
          </div>
          <div style={{fontSize:18,fontWeight:700,color:r.avg>=8?"#10b981":r.avg>=7.5?"#3b82f6":"#f59e0b"}}>{r.avg}</div>
        </div>
      </button>
    ))}
  </div>

  {/* View toggle */}
  <div style={{display:"flex",gap:6,marginBottom:14}}>
    {["overview","meddpicc","compare"].map(v=>(
      <button key={v} onClick={()=>{setView(v);setSel(null)}}
        style={{padding:"4px 10px",fontSize:10,borderRadius:4,border:view===v?"1px solid #3b82f6":"1px solid #1e293b",background:view===v?"#1e293b":"transparent",color:view===v?"#93c5fd":"#475569",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",textTransform:"uppercase"}}>
        {v}
      </button>
    ))}
  </div>

  {/* COMPARE VIEW */}
  {view==="compare"&&!det&&(
    <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:8,padding:"16px 18px"}}>
      <div style={{fontSize:11,fontWeight:600,color:"#93c5fd",marginBottom:12,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>REP COMPARISON — WEEK OF MAR 9</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr>
          <th style={{textAlign:"left",padding:"8px",color:"#475569",borderBottom:"1px solid #1e293b"}}>Metric</th>
          {reps.map(r=><th key={r.id} style={{textAlign:"center",padding:"8px",color:"#475569",borderBottom:"1px solid #1e293b"}}>{r.name.split(" ")[0]}</th>)}
        </tr></thead>
        <tbody>
          {[
            {l:"Avg Score",f:r=>{const a=calls.filter(c=>c.rep===r.id);return(a.reduce((s,c)=>s+c.w,0)/a.length).toFixed(2)}},
            {l:"Calls",f:r=>calls.filter(c=>c.rep===r.id).length},
            {l:"Best Call",f:r=>calls.filter(c=>c.rep===r.id).reduce((a,c)=>c.w>a.w?c:a,calls.filter(c=>c.rep===r.id)[0])?.w},
            {l:"Avg Talk %",f:r=>{const a=calls.filter(c=>c.rep===r.id);return Math.round(a.reduce((s,c)=>s+c.tr,0)/a.length)+"%"}},
            {l:"MEDDPICC Hit Rate",f:r=>{const a=calls.filter(c=>c.rep===r.id);const total=a.length*7;const hits=a.reduce((s,c)=>s+MK.filter(k=>c.m[k]).length,0);return Math.round(hits/total*100)+"%"}},
            {l:"Profile",f:r=>r.profile},
          ].map((row,i)=>(
            <tr key={i}><td style={{padding:"8px",borderBottom:"1px solid #1e293b",color:"#94a3b8"}}>{row.l}</td>
            {reps.map(r=>{const v=row.f(r);const isNum=typeof v==="number"||(!isNaN(parseFloat(v))&&!v.includes("%")&&!v.includes(" "));
              return<td key={r.id} style={{textAlign:"center",padding:"8px",borderBottom:"1px solid #1e293b",fontWeight:isNum?700:400,color:isNum?(parseFloat(v)>=8?"#10b981":parseFloat(v)>=7.5?"#3b82f6":"#f59e0b"):"#94a3b8"}}>{v}</td>})}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{marginTop:14,fontSize:11,color:"#64748b",lineHeight:1.6}}>
        <strong style={{color:"#94a3b8"}}>Key insight:</strong> Kyle leads on deal control (HomeBridge closed same day) and avg score. Sam excels at rapport but needs tighter next steps. Charlie is methodical but demos run long. All three share a competition blind spot — worth addressing at the team level.
      </div>
    </div>
  )}

  {/* OVERVIEW */}
  {view==="overview"&&!det&&(<>
    {f.map(c=>(
      <div key={c.id} onClick={()=>setSel(c.id)}
        style={{background:"#111827",border:"1px solid #1e293b",borderLeft:`3px solid ${c.w>=8.5?"#10b981":c.w>=7.5?"#3b82f6":"#f59e0b"}`,borderRadius:8,padding:"10px 14px",marginBottom:7,cursor:"pointer"}}
        onMouseEnter={e=>e.currentTarget.style.background="#1e293b"} onMouseLeave={e=>e.currentTarget.style.background="#111827"}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6}}>
          <div style={{flex:1,minWidth:160}}>
            <div style={{fontSize:13,fontWeight:600}}>{c.title}</div>
            <div style={{fontSize:10,color:"#64748b"}}>{c.prospect} · {c.date} · {c.dur}</div>
          </div>
          <div style={{display:"flex",gap:2}}>{MK.map(k=><div key={k} style={{width:7,height:7,borderRadius:"50%",background:c.m[k]?"#10b981":"#334155"}}/>)}</div>
          <div style={{fontSize:18,fontWeight:700,color:c.w>=8.5?"#10b981":c.w>=7.5?"#3b82f6":"#f59e0b",minWidth:36,textAlign:"right"}}>{c.w}</div>
          <div style={{color:"#475569",fontSize:14}}>›</div>
        </div>
      </div>
    ))}
    <div style={{marginTop:14,background:"#111827",border:"1px solid #1e293b",borderRadius:8,padding:"14px 16px"}}>
      <div style={{fontSize:10,fontWeight:600,color:"#93c5fd",marginBottom:8,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1,textTransform:"uppercase"}}>Coaching: {rd?.name}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
        <div><div style={{fontSize:10,fontWeight:600,color:"#10b981",marginBottom:3}}>✦ KEEP</div><div style={{fontSize:11,color:"#94a3b8",lineHeight:1.5}}>{co.keep}</div></div>
        <div><div style={{fontSize:10,fontWeight:600,color:"#f59e0b",marginBottom:3}}>▲ START</div><div style={{fontSize:11,color:"#94a3b8",lineHeight:1.5}}>{co.start}</div></div>
        <div><div style={{fontSize:10,fontWeight:600,color:"#ef4444",marginBottom:3}}>■ STOP</div><div style={{fontSize:11,color:"#94a3b8",lineHeight:1.5}}>{co.stop}</div></div>
      </div>
    </div>
  </>)}

  {/* MEDDPICC */}
  {view==="meddpicc"&&!det&&(
    <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:8,padding:"14px 16px",overflowX:"auto"}}>
      <div style={{fontSize:10,fontWeight:600,color:"#93c5fd",marginBottom:10,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>MEDDPICC — {rd?.name} ({f.length} calls)</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr>
          <th style={{textAlign:"left",padding:"6px",color:"#475569",borderBottom:"1px solid #1e293b",fontSize:10}}>Element</th>
          {f.map(c=><th key={c.id} style={{textAlign:"center",padding:"6px 3px",color:"#475569",borderBottom:"1px solid #1e293b",fontSize:9,maxWidth:70}}>{c.title.split(" ")[0]}</th>)}
          <th style={{textAlign:"center",padding:"6px",color:"#475569",borderBottom:"1px solid #1e293b",fontSize:10}}>Freq</th>
        </tr></thead>
        <tbody>{mf.map(m=>(
          <tr key={m.k}><td style={{padding:"6px",borderBottom:"1px solid #1e293b"}}><span style={{color:"#93c5fd",fontFamily:"'IBM Plex Mono',monospace",marginRight:3,fontSize:10}}>{m.k}</span><span style={{color:"#94a3b8",fontSize:11}}>{m.l}</span></td>
          {f.map(c=><td key={c.id} style={{textAlign:"center",padding:"6px 3px",borderBottom:"1px solid #1e293b"}}><div style={{width:18,height:18,borderRadius:3,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",background:c.m[m.k]?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.06)",color:c.m[m.k]?"#10b981":"#475569",fontSize:11,fontWeight:600}}>{c.m[m.k]?"✓":"—"}</div></td>)}
          <td style={{textAlign:"center",padding:"6px",borderBottom:"1px solid #1e293b"}}><span style={{fontSize:9,padding:"2px 5px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",background:m.f==="Always"?"rgba(16,185,129,0.15)":m.f==="Sometimes"?"rgba(245,158,11,0.15)":"rgba(239,68,68,0.1)",color:m.f==="Always"?"#10b981":m.f==="Sometimes"?"#f59e0b":"#ef4444"}}>{m.f}</span></td></tr>
        ))}</tbody>
      </table>
    </div>
  )}

  {/* DETAIL */}
  {det&&(<div>
    <button onClick={()=>setSel(null)} style={{background:"none",border:"1px solid #1e293b",color:"#94a3b8",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"'IBM Plex Mono',monospace",marginBottom:10}}>← Back</button>
    <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:8,padding:"16px",marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:14}}>
        <div><h2 style={{fontSize:16,fontWeight:700,margin:0}}>{det.title}</h2><div style={{fontSize:11,color:"#64748b",marginTop:2}}>{det.prospect} · {det.date} · {det.dur} · {det.type}</div><div style={{fontSize:10,color:"#475569"}}>Stage: {det.stage} · Talk: <span style={{color:det.tr<=60?"#10b981":"#f59e0b"}}>{det.tr}%</span></div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:28,fontWeight:700,color:det.w>=8.5?"#10b981":det.w>=7.5?"#3b82f6":"#f59e0b"}}>{det.w}</div><div style={{fontSize:9,color:"#475569",fontFamily:"'IBM Plex Mono',monospace"}}>WEIGHTED</div></div>
      </div>
      {D.map(d=><div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}><span style={{fontSize:11,color:"#94a3b8",minWidth:110}}>{DL[d]} <span style={{color:"#475569",fontSize:9}}>({DW[d]})</span></span><B s={det.s[d]}/></div>)}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:10}}>{MK.map(k=><div key={k} style={{padding:"2px 7px",borderRadius:3,fontSize:9,fontFamily:"'IBM Plex Mono',monospace",background:det.m[k]?"rgba(16,185,129,0.12)":"rgba(100,116,139,0.06)",color:det.m[k]?"#10b981":"#475569",border:`1px solid ${det.m[k]?"rgba(16,185,129,0.25)":"#1e293b"}`}}>{k}</div>)}</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
      <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:8,padding:"12px"}}><div style={{fontSize:10,fontWeight:600,color:"#10b981",marginBottom:6,fontFamily:"'IBM Plex Mono',monospace"}}>STRENGTHS</div>{det.str.map((s,i)=><div key={i} style={{fontSize:11,color:"#94a3b8",lineHeight:1.5,marginBottom:5,paddingLeft:8,borderLeft:"2px solid #10b981"}}>{s}</div>)}</div>
      <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:8,padding:"12px"}}><div style={{fontSize:10,fontWeight:600,color:"#f59e0b",marginBottom:6,fontFamily:"'IBM Plex Mono',monospace"}}>OPPORTUNITIES</div>{det.opp.map((o,i)=><div key={i} style={{fontSize:11,color:"#94a3b8",lineHeight:1.5,marginBottom:5,paddingLeft:8,borderLeft:"2px solid #f59e0b"}}>{o}</div>)}</div>
    </div>
    {det.q&&<div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:8,padding:"12px",marginBottom:10}}><div style={{fontSize:10,fontWeight:600,color:"#8b5cf6",marginBottom:4,fontFamily:"'IBM Plex Mono',monospace"}}>KEY QUOTE</div><div style={{fontSize:13,color:"#e2e8f0",fontStyle:"italic",borderLeft:"3px solid #8b5cf6",paddingLeft:10}}>"{det.q}"</div></div>}
    <a href={det.url} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:"#3b82f6",fontFamily:"'IBM Plex Mono',monospace",textDecoration:"none"}}>View in Gong →</a>
  </div>)}

  <div style={{marginTop:18,textAlign:"center",fontSize:9,color:"#1e293b",fontFamily:"'IBM Plex Mono',monospace"}}>
    6-dimension rubric · MEDDPICC · Challenger · {calls.length} calls · 3 reps
  </div>
  </div>);
}
