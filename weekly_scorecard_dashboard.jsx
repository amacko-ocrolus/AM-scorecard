import { useState } from "react";

const reps = [
  { id: "anjelica", name: "Anjelica Purnell", title: "Account Manager", profile: "", avg: 0, calls: 0 },
  { id: "noah", name: "Noah Jones", title: "Account Manager", profile: "", avg: 0, calls: 0 },
  { id: "elizabeth", name: "Elizabeth Spade", title: "Account Manager", profile: "", avg: 0, calls: 0 }
];

const calls = [
  // Calls will be populated weekly by the automated scoring pipeline (score.js)
  // ANJELICA
  // NOAH
  // ELIZABETH
];

const D = ["r","d","v","a","c","e"];
const DL = { r:"Rapport",d:"Discovery",v:"Value",a:"Advancement",c:"Control",e:"Engagement" };
const DW = { r:"10%",d:"25%",v:"20%",a:"25%",c:"10%",e:"10%" };
const MK = ["M","E","DC","DP","IP","Ch","Co"];
const ML = { M:"Metrics",E:"Econ Buyer",DC:"Decision Criteria",DP:"Decision Process",IP:"Identify Pain",Ch:"Champion",Co:"Competition" };

const coaching = {
  anjelica: { keep: "", start: "", stop: "" },
  noah: { keep: "", start: "", stop: "" },
  elizabeth: { keep: "", start: "", stop: "" }
};

function B({s}){const bg=s>=8?"#10b981":s>=7?"#f59e0b":"#ef4444";return<div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:90,height:4,background:"#1e293b",borderRadius:2,overflow:"hidden"}}><div style={{width:`${s*10}%`,height:"100%",background:bg,borderRadius:2}}/></div><span style={{fontSize:11,fontWeight:600,color:bg,minWidth:20}}>{s}</span></div>}

export default function App(){
  const[rep,setRep]=useState("anjelica");
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
