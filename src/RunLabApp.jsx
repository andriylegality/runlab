import { useState, useEffect } from "react";

// ── GRAIN TEXTURE via SVG ──
const GrainOverlay = () => (
  <svg style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:999,opacity:0.04,mixBlendMode:"overlay"}} xmlns="http://www.w3.org/2000/svg">
    <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
    <rect width="100%" height="100%" filter="url(#noise)"/>
  </svg>
);

// ── BARCODE SVG ──
const Barcode = ({width=120,height=24}) => {
  const bars = [3,1,2,1,3,2,1,3,1,2,1,1,3,1,2,3,1,1,2,1,3,1,2,1,1,3,2,1,1,2];
  let x = 0;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${bars.reduce((s,b)=>s+b,0)+bars.length} ${height}`}>
      {bars.map((w,i) => { const rx=x; x+=w+1; return i%2===0 ? <rect key={i} x={rx} y={0} width={w} height={height} fill="currentColor"/> : null; })}
    </svg>
  );
};

// ── LANG ──
const LANG = {
  ID: {
    nav:["PROFIL","PACING","HIDRASI","HASIL"],
    profile:{title:"PROFIL PELARI",name:"NAMA",age:"USIA",male:"LAKI-LAKI",female:"PEREMPUAN",weight:"BERAT KG",height:"TINGGI CM",restHR:"RESTING HR",maxHR:"MAX HR",vo2max:"VO2MAX",distance:"JARAK KM",startTime:"JAM START",next:"LANJUT",acts:"LATIHAN TERAKHIR",actDist:"JARAK",actPace:"PACE MIN/KM",actHR:"AVG HR",actDate:"TANGGAL",addAct:"+ TAMBAH LATIHAN"},
    pacing:{title:"PACING MANAGEMENT",segs:"SEGMEN RUTE",segName:"NAMA",segDist:"JARAK KM",segElev:"ELEVASI",flat:"FLAT",up:"TANJAKAN",down:"TURUNAN",addSeg:"+ SEGMEN",generate:"GENERATE PLAN",runwalk:"RUN-WALK PROTOCOL",result:"HASIL PACING"},
    hydration:{title:"HIDRASI",warning:"MINUM SEBELUM HAUS — HAUS = DEHIDRASI 2%",saltcaps:"SALT CAPS",gel:"ENERGY GEL",dates:"KURMA",isotonic:"ISOTONIC",water:"AIR PUTIH",unit:"BUTIR / BUAH / SACHET",generate:"GENERATE JADWAL",schedule:"JADWAL HIDRASI",reserve:"CADANGAN DARURAT"},
    results:{title:"RACE PLAN",finish:"EST FINISH",total:"TOTAL WAKTU",avg:"AVG PACE",pacing:"PACING PLAN",hydration:"HYDRATION PLAN",save:"SIMPAN / PRINT"},
  },
  EN: {
    nav:["PROFILE","PACING","HYDRATION","RESULTS"],
    profile:{title:"RUNNER PROFILE",name:"NAME",age:"AGE",male:"MALE",female:"FEMALE",weight:"WEIGHT KG",height:"HEIGHT CM",restHR:"RESTING HR",maxHR:"MAX HR",vo2max:"VO2MAX",distance:"DISTANCE KM",startTime:"START TIME",next:"NEXT",acts:"RECENT ACTIVITIES",actDist:"DISTANCE",actPace:"PACE MIN/KM",actHR:"AVG HR",actDate:"DATE",addAct:"+ ADD ACTIVITY"},
    pacing:{title:"PACING MANAGEMENT",segs:"ROUTE SEGMENTS",segName:"NAME",segDist:"DISTANCE KM",segElev:"ELEVATION",flat:"FLAT",up:"UPHILL",down:"DOWNHILL",addSeg:"+ SEGMENT",generate:"GENERATE PLAN",runwalk:"RUN-WALK PROTOCOL",result:"PACING RESULTS"},
    hydration:{title:"HYDRATION",warning:"DRINK BEFORE THIRST — THIRST = 2% DEHYDRATED",saltcaps:"SALT CAPS",gel:"ENERGY GEL",dates:"DATES",isotonic:"ISOTONIC",water:"WATER",unit:"PCS / SACHETS",generate:"GENERATE SCHEDULE",schedule:"HYDRATION SCHEDULE",reserve:"EMERGENCY RESERVE"},
    results:{title:"RACE PLAN",finish:"EST FINISH",total:"TOTAL TIME",avg:"AVG PACE",pacing:"PACING PLAN",hydration:"HYDRATION PLAN",save:"SAVE / PRINT"},
  }
};

// ── CALC ──
const calcMaxHR = age => 220 - parseInt(age||42);
const calcHRZ = (max,rest) => {
  const r = max-rest;
  return [
    {z:1,n:"RECOVERY",min:rest,max:Math.round(rest+r*.50),c:"#9CA3AF"},
    {z:2,n:"AEROBIC",min:Math.round(rest+r*.50),max:Math.round(rest+r*.60),c:"#fff"},
    {z:3,n:"TEMPO",min:Math.round(rest+r*.60),max:Math.round(rest+r*.71),c:"#E63946"},
    {z:4,n:"THRESHOLD",min:Math.round(rest+r*.71),max:Math.round(rest+r*.81),c:"#E63946"},
    {z:5,n:"VO2MAX",min:Math.round(rest+r*.81),max:Math.round(rest+r*.93),c:"#E63946"},
    {z:6,n:"MAX",min:Math.round(rest+r*.93),max:max,c:"#E63946"},
  ];
};
const calcBase = (acts,vo2,age,gender) => {
  let b = acts.filter(a=>a.pace).length>0 ? acts.filter(a=>parseFloat(a.pace)>0).reduce((s,a)=>s+parseFloat(a.pace),0)/acts.filter(a=>parseFloat(a.pace)>0).length : 8.5;
  if(vo2) b = Math.max(4.5, b-(parseFloat(vo2)-35)*0.04);
  if(gender==="F") b+=0.3;
  if(parseInt(age)>50) b+=0.2;
  return b;
};
const segPace = (base,elev) => elev==="up"?base*1.4:elev==="down"?base*0.88:base;
const rwProtocol = w => w<10?"3 MIN LARI · 2 MIN JALAN":w<20?"4 MIN LARI · 1 MIN JALAN":w<35?"6 MIN LARI · 1 MIN JALAN":"9 MIN LARI · 1 MIN JALAN";
const fmtP = p => { const m=Math.floor(p),s=Math.round((p-m)*60); return `${m}'${s.toString().padStart(2,"0")}"`; };
const fmtT = m => { const h=Math.floor(m/60),mn=Math.round(m%60); return h>0?`${h}H ${mn}M`:`${mn}M`; };
const addM = (t,m) => { const [h,mi]=(t||"23:30").split(":").map(Number),tot=h*60+mi+m; return `${Math.floor(tot/60)%24}:${(tot%60).toString().padStart(2,"0")}`; };
const ld = (k,d) => { try{return JSON.parse(localStorage.getItem(k))??d;}catch{return d;} };

// ── UI ATOMS ──
const css = {
  root: {background:"#000",minHeight:"100vh",color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:100,position:"relative"},
  label: {fontSize:9,fontWeight:700,letterSpacing:4,color:"#444",display:"block",marginBottom:5,textTransform:"uppercase"},
  input: {width:"100%",background:"#000",border:"none",borderBottom:"1px solid #222",padding:"10px 0",color:"#fff",fontSize:16,fontWeight:600,outline:"none",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,boxSizing:"border-box",caretColor:"#E63946"},
  divider: {height:1,background:"linear-gradient(90deg,#E63946,transparent)",margin:"20px 0",opacity:0.4},
  sectionHead: {fontSize:11,fontWeight:700,letterSpacing:5,color:"#E63946",textTransform:"uppercase",marginBottom:16,marginTop:28,display:"flex",alignItems:"center",gap:10},
  card: (hl) => ({background:"#000",border:"1px solid #1a1a1a",borderLeft:`2px solid ${hl||"#222"}`,padding:"14px 16px",marginBottom:10,position:"relative"}),
  tag: (c="#E63946") => ({background:"transparent",border:`1px solid ${c}`,color:c,fontSize:9,fontWeight:700,letterSpacing:3,padding:"3px 8px",fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase"}),
  bigNum: {fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:42,lineHeight:1,letterSpacing:-1},
  btn: (v="p") => ({
    background:v==="p"?"#E63946":v==="w"?"#fff":"transparent",
    border:v==="g"?"1px solid #333":"none",
    color:v==="w"?"#000":"#fff",
    padding:"14px 20px",width:"100%",marginTop:10,
    fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:13,letterSpacing:4,
    textTransform:"uppercase",cursor:"pointer",
    display:"flex",alignItems:"center",justifyContent:"center",gap:8,
  }),
};

const Inp = ({label,value,onChange,type="text",placeholder=""}) => (
  <div style={{marginBottom:18}}>
    <label style={css.label}>{label}</label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={css.input} inputMode={type==="number"?"decimal":undefined}/>
  </div>
);

const SH = ({children}) => (
  <div style={css.sectionHead}>
    <div style={{width:16,height:1,background:"#E63946",flexShrink:0}}/>
    {children}
  </div>
);

// ── MAIN ──
export default function RunLabApp({ onBack }) {
  const [lang,setLang]=useState("ID");
  const T=LANG[lang];
  const [step,setStep]=useState(0);

  const [P,setP_]=useState(()=>ld("rl_p",{name:"",age:"",gender:"M",weight:"",height:"",restHR:"50",maxHR:"",vo2max:"",distance:"19.18",startTime:"23:30"}));
  const [acts,setActs]=useState(()=>ld("rl_a",[]));
  const [segs,setSegs]=useState(()=>ld("rl_s",[
    {name:"WARM UP",dist:"3",elev:"flat"},
    {name:"KARANG JATI HILL",dist:"4",elev:"up"},
    {name:"RECOVERY RUN",dist:"4",elev:"down"},
    {name:"CRUISE COASTAL",dist:"3",elev:"flat"},
    {name:"SURVIVE DAMAI",dist:"3",elev:"flat"},
    {name:"FINISH",dist:"2.18",elev:"flat"},
  ]));
  const [ammo,setAmmo_]=useState(()=>ld("rl_ammo",{saltcaps:0,gel:0,dates:0,isotonic:0,water:1}));
  const [plan,setPlan]=useState(null);
  const [hyd,setHyd]=useState(null);

  const setP=(k,v)=>setP_(p=>({...p,[k]:v}));
  const setAm=(k,v)=>setAmmo_(a=>({...a,[k]:v}));

  useEffect(()=>{localStorage.setItem("rl_p",JSON.stringify(P));},[P]);
  useEffect(()=>{localStorage.setItem("rl_a",JSON.stringify(acts));},[acts]);
  useEffect(()=>{localStorage.setItem("rl_s",JSON.stringify(segs));},[segs]);
  useEffect(()=>{localStorage.setItem("rl_ammo",JSON.stringify(ammo));},[ammo]);

  const maxHR=parseInt(P.maxHR)||calcMaxHR(P.age);
  const restHR=parseInt(P.restHR)||50;
  const zones=calcHRZ(maxHR,restHR);
  const weekly=acts.reduce((s,a)=>s+parseFloat(a.dist||0),0);
  const base=calcBase(acts,P.vo2max,P.age,P.gender);
  const totalDist=segs.reduce((s,g)=>s+parseFloat(g.dist||0),0);

  const genPlan=()=>{
    let elapsed=0;
    setPlan(segs.map(seg=>{
      const pace=segPace(base,seg.elev);
      const dist=parseFloat(seg.dist||0);
      const time=pace*dist;
      const st=addM(P.startTime,elapsed);
      elapsed+=time;
      const zt=seg.elev==="up"?zones[2]:zones[1];
      return {...seg,pace,dist,time,st,zt};
    }));
  };

  const genHyd=()=>{
    const cps=[];
    cps.push({km:"PRE",t:addM(P.startTime,-10),action:ammo.saltcaps>0?"150ML AIR + 1 SALT CAP":"150-200ML AIR PUTIH",badge:"PRE",c:"#E63946"});
    let su=ammo.saltcaps>0?1:0;
    const dist=totalDist||parseFloat(P.distance)||19;
    for(let km=3;km<dist;km+=3){
      const t=addM(P.startTime,km*base);
      let action="100–150ML AIR", badge="AIR", c="#444";
      if([6,12,15].includes(km)&&su<ammo.saltcaps){su++;action=ammo.isotonic>0&&km===6?"200ML ISOTONIC + 1 SALT CAP":"200ML AIR + 1 SALT CAP";badge="SALT";c="#fff";}
      if(km===15&&ammo.gel>0){action+=" + 1 GEL";badge="GEL";c="#E63946";}
      if(km>=9&&km<=12&&ammo.dates>=2){action+=" + 2 KURMA";}
      if(km===6&&ammo.isotonic>0&&!action.includes("ISOTONIC"))action="200ML ISOTONIC";
      cps.push({km:`KM ${km}`,t,action,badge,c});
    }
    setHyd(cps);
  };

  // ── HEADER ──
  const Header=()=>(
    <div style={{background:"#000",borderBottom:"1px solid #111",padding:"12px 18px",position:"sticky",top:0,zIndex:200}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {onBack && (
              <button onClick={onBack} style={{background:"none",border:"1px solid #222",color:"#555",padding:"4px 8px",fontSize:14,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,lineHeight:1}}>←</button>
            )}
            <div>
              <div style={{fontSize:28,fontWeight:900,letterSpacing:6,color:"#fff",lineHeight:1}}>RUNLAB</div>
              <div style={{fontSize:8,letterSpacing:4,color:"#333",marginTop:2}}>PERSONALIZED RACE INTELLIGENCE</div>
            </div>
          </div>
          <div style={{marginTop:6,color:"#E63946",opacity:0.7}}><Barcode width={80} height={12}/></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
          <button onClick={()=>setLang(l=>l==="ID"?"EN":"ID")} style={{background:"none",border:"1px solid #222",color:"#444",padding:"4px 10px",fontSize:9,letterSpacing:3,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>
            {lang==="ID"?"ID · EN":"EN · ID"}
          </button>
          <div style={{fontSize:9,letterSpacing:2,color:"#333"}}>{new Date().toISOString().slice(0,10)}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:2,marginTop:10}}>
        {[0,1,2,3].map(s=>(
          <div key={s} onClick={()=>setStep(s)} style={{flex:1,height:2,background:s<=step?"#E63946":"#111",cursor:"pointer",transition:"background 0.3s"}}/>
        ))}
      </div>
    </div>
  );

  // ── NAV ──
  const Nav=()=>(
    <div style={{display:"flex",borderBottom:"1px solid #111",background:"#000",position:"sticky",top:88,zIndex:199}}>
      {T.nav.map((n,i)=>(
        <button key={i} onClick={()=>setStep(i)} style={{flex:1,padding:"11px 2px",background:"none",border:"none",borderBottom:`1px solid ${step===i?"#E63946":"transparent"}`,color:step===i?"#E63946":"#2a2a2a",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:9,letterSpacing:2,cursor:"pointer",textTransform:"uppercase",transition:"all 0.2s"}}>
          {n}
        </button>
      ))}
    </div>
  );

  // ── PAGE 0: PROFILE ──
  const P0=()=>(
    <div>
      <SH>{T.profile.title}</SH>
      <Inp label={T.profile.name} value={P.name} onChange={v=>setP("name",v)} placeholder="ANDRI Y"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Inp label={T.profile.age} value={P.age} onChange={v=>setP("age",v)} type="number" placeholder="42"/>
        <div>
          <label style={css.label}>{T.profile.male} / {T.profile.female}</label>
          <div style={{display:"flex",gap:6,marginTop:5}}>
            {[["M",T.profile.male],["F",T.profile.female]].map(([v,l])=>(
              <button key={v} onClick={()=>setP("gender",v)} style={{flex:1,padding:"10px 0",border:`1px solid ${P.gender===v?"#E63946":"#111"}`,background:P.gender===v?"#E63946":"#000",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2}}>{v}</button>
            ))}
          </div>
        </div>
        <Inp label={T.profile.weight} value={P.weight} onChange={v=>setP("weight",v)} type="number" placeholder="71.1"/>
        <Inp label={T.profile.height} value={P.height} onChange={v=>setP("height",v)} type="number" placeholder="168"/>
        <Inp label={T.profile.restHR} value={P.restHR} onChange={v=>setP("restHR",v)} type="number" placeholder="50"/>
        <Inp label={T.profile.maxHR} value={P.maxHR} onChange={v=>setP("maxHR",v)} type="number" placeholder={calcMaxHR(P.age||42)}/>
        <Inp label={T.profile.vo2max} value={P.vo2max} onChange={v=>setP("vo2max",v)} type="number" placeholder="41"/>
        <Inp label={T.profile.distance} value={P.distance} onChange={v=>setP("distance",v)} type="number" placeholder="19.18"/>
      </div>
      <Inp label={T.profile.startTime} value={P.startTime} onChange={v=>setP("startTime",v)} placeholder="23:30"/>

      <div style={css.divider}/>
      <SH>{T.profile.acts}</SH>
      <div style={{fontSize:10,color:"#333",marginBottom:14,letterSpacing:1,lineHeight:1.7}}>
        {lang==="ID"?"ISI DATA LARI TERAKHIR UNTUK REKOMENDASI PACING YANG LEBIH AKURAT.":"FILL IN RECENT RUN DATA FOR MORE ACCURATE PACING RECOMMENDATIONS."}
      </div>

      {acts.map((act,i)=>(
        <div key={i} style={css.card("#E63946")}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:3,color:"#E63946"}}>{lang==="ID"?`LATIHAN ${i+1}`:`ACTIVITY ${i+1}`}</span>
            <button onClick={()=>setActs(a=>a.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:16,padding:0}}>✕</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label={T.profile.actDist} value={act.dist||""} onChange={v=>setActs(a=>a.map((x,j)=>j===i?{...x,dist:v}:x))} type="number" placeholder="15"/>
            <Inp label={T.profile.actPace} value={act.pace||""} onChange={v=>setActs(a=>a.map((x,j)=>j===i?{...x,pace:v}:x))} type="number" placeholder="8.5"/>
            <Inp label={T.profile.actHR} value={act.hr||""} onChange={v=>setActs(a=>a.map((x,j)=>j===i?{...x,hr:v}:x))} type="number" placeholder="130"/>
            <Inp label={T.profile.actDate} value={act.date||""} onChange={v=>setActs(a=>a.map((x,j)=>j===i?{...x,date:v}:x))} placeholder="2026-03-10"/>
          </div>
        </div>
      ))}
      {acts.length<3&&(
        <button onClick={()=>setActs(a=>[...a,{dist:"",pace:"",hr:"",date:""}])} style={{...css.btn("g"),marginTop:0,marginBottom:8}}>
          {T.profile.addAct}
        </button>
      )}
      <button style={css.btn()} onClick={()=>setStep(1)}>
        {T.profile.next} <span style={{fontSize:16}}>→</span>
      </button>
    </div>
  );

  // ── PAGE 1: PACING ──
  const P1=()=>(
    <div>
      <SH>{T.pacing.title}</SH>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,marginBottom:20}}>
        {[
          ["BASE PACE",`${fmtP(base)}/KM`,"#fff"],
          ["VO2MAX",P.vo2max||"—","#E63946"],
          ["WEEKLY",`${weekly.toFixed(1)}KM`,"#fff"],
          ["MAX HR",`${maxHR}`,"#E63946"],
        ].map(([l,v,c])=>(
          <div key={l} style={{background:"#080808",padding:"10px 8px",textAlign:"center",border:"1px solid #111"}}>
            <div style={{fontSize:7,letterSpacing:3,color:"#333",marginBottom:4}}>{l}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:15,color:c,letterSpacing:1}}>{v}</div>
          </div>
        ))}
      </div>

      <SH>HR ZONES</SH>
      <div style={{border:"1px solid #111",marginBottom:20}}>
        {zones.map((z,i)=>(
          <div key={z.z} style={{display:"flex",alignItems:"center",padding:"9px 14px",borderBottom:i<5?"1px solid #0a0a0a":"none"}}>
            <div style={{width:4,height:4,borderRadius:0,background:z.c,marginRight:12,flexShrink:0}}/>
            <div style={{flex:1,fontSize:10,fontWeight:700,letterSpacing:3,color:i<2?"#333":"#fff"}}>Z{z.z} {z.n}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:14,color:z.c,letterSpacing:1}}>{z.min}–{z.max}<span style={{fontSize:9,fontWeight:400,color:"#444"}}> BPM</span></div>
          </div>
        ))}
      </div>

      <SH>{T.pacing.segs}</SH>
      {segs.map((seg,i)=>(
        <div key={i} style={css.card(seg.elev==="up"?"#E63946":seg.elev==="down"?"#666":"#222")}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:3,color:"#555"}}>{String(i+1).padStart(2,"0")}</span>
            <button onClick={()=>setSegs(s=>s.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:14,padding:0}}>✕</button>
          </div>
          <Inp label={T.pacing.segName} value={seg.name} onChange={v=>setSegs(s=>s.map((x,j)=>j===i?{...x,name:v}:x))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label={T.pacing.segDist} value={seg.dist} onChange={v=>setSegs(s=>s.map((x,j)=>j===i?{...x,dist:v}:x))} type="number"/>
            <div>
              <label style={css.label}>{T.pacing.segElev}</label>
              <div style={{display:"flex",gap:4,marginTop:5}}>
                {[["flat","→","#444"],["up","↑","#E63946"],["down","↓","#888"]].map(([v,ico,c])=>(
                  <button key={v} onClick={()=>setSegs(s=>s.map((x,j)=>j===i?{...x,elev:v}:x))} style={{flex:1,padding:"8px 2px",border:`1px solid ${seg.elev===v?c:"#111"}`,background:seg.elev===v?"#0d0d0d":"#000",color:seg.elev===v?c:"#222",fontSize:14,cursor:"pointer",fontWeight:700}}>
                    {ico}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      <button onClick={()=>setSegs(s=>[...s,{name:`SEGMENT ${s.length+1}`,dist:"3",elev:"flat"}])} style={{...css.btn("g"),marginBottom:0}}>
        {T.pacing.addSeg}
      </button>
      <button style={css.btn()} onClick={()=>{genPlan();}}>
        {T.pacing.generate}
      </button>

      {plan&&(
        <>
          <div style={css.divider}/>
          <SH>{T.pacing.runwalk}</SH>
          <div style={{...css.card("#E63946"),padding:"16px 18px"}}>
            <div style={{fontSize:18,fontWeight:900,letterSpacing:3,color:"#fff",marginBottom:4}}>{rwProtocol(weekly)}</div>
            <div style={{fontSize:9,letterSpacing:2,color:"#444"}}>WEEKLY MILEAGE: {weekly.toFixed(1)} KM</div>
          </div>

          <SH>{T.pacing.result}</SH>
          {plan.map((seg,i)=>(
            <div key={i} style={css.card(seg.elev==="up"?"#E63946":seg.elev==="down"?"#555":"#222")}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:3,color:"#444",marginBottom:2}}>{String(i+1).padStart(2,"0")} · {seg.st}</div>
                  <div style={{fontSize:14,fontWeight:900,letterSpacing:2,color:"#fff"}}>{seg.name}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:20,color:seg.elev==="up"?"#E63946":"#fff",lineHeight:1}}>{fmtP(seg.pace)}</div>
                  <div style={{fontSize:8,letterSpacing:2,color:"#444"}}>/KM</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={css.tag(seg.elev==="up"?"#E63946":seg.elev==="down"?"#888":"#444")}>{seg.elev.toUpperCase()} {seg.dist}KM</span>
                <span style={css.tag("#333")}>{fmtT(seg.time)}</span>
                <span style={{fontSize:9,letterSpacing:2,color:"#333"}}>Z{seg.zt?.z} {seg.zt?.n}</span>
              </div>
            </div>
          ))}

          <div style={{...css.card("#E63946"),marginTop:4,padding:"16px 18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:9,letterSpacing:3,color:"#E63946",marginBottom:4}}>TOTAL · EST FINISH</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:28,color:"#fff"}}>
                  {addM(P.startTime, plan.reduce((s,seg)=>s+seg.time,0))}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:9,letterSpacing:3,color:"#444",marginBottom:4}}>AVG PACE</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:20,color:"#fff"}}>{fmtP(base)}/KM</div>
                <div style={{fontSize:9,color:"#444"}}>{fmtT(plan.reduce((s,seg)=>s+seg.time,0))}</div>
              </div>
            </div>
          </div>

          <button style={{...css.btn(),marginTop:16}} onClick={()=>setStep(2)}>
            {lang==="ID"?"LANJUT KE HIDRASI →":"NEXT: HYDRATION →"}
          </button>
        </>
      )}
    </div>
  );

  // ── PAGE 2: HYDRATION ──
  const P2=()=>(
    <div>
      <SH>{T.hydration.title}</SH>
      <div style={{background:"#0d0000",border:"1px solid #E63946",borderLeft:"3px solid #E63946",padding:"12px 16px",marginBottom:20}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:"#E63946",lineHeight:1.6}}>{T.hydration.warning}</div>
      </div>

      <SH>{lang==="ID"?"INVENTORI NUTRISI":"NUTRITION INVENTORY"}</SH>
      {[
        ["saltcaps",T.hydration.saltcaps,"#fff"],
        ["gel",T.hydration.gel,"#E63946"],
        ["dates",T.hydration.dates,"#888"],
        ["isotonic",T.hydration.isotonic,"#fff"],
        ["water",T.hydration.water,"#444"],
      ].map(([k,label,c])=>(
        <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #0d0d0d"}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:c}}>{label}</div>
            <div style={{fontSize:8,letterSpacing:2,color:"#333",marginTop:2}}>{T.hydration.unit}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setAm(k,Math.max(0,(parseInt(ammo[k])||0)-1))} style={{width:32,height:32,background:"#0d0d0d",border:"1px solid #222",color:"#fff",fontSize:18,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900}}>−</button>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:22,color:"#fff",minWidth:28,textAlign:"center"}}>{ammo[k]||0}</div>
            <button onClick={()=>setAm(k,(parseInt(ammo[k])||0)+1)} style={{width:32,height:32,background:"#0d0d0d",border:"1px solid #222",color:"#fff",fontSize:18,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900}}>+</button>
          </div>
        </div>
      ))}

      <button style={css.btn()} onClick={genHyd}>{T.hydration.generate}</button>

      {hyd&&(
        <>
          <div style={css.divider}/>
          <SH>{T.hydration.schedule}</SH>
          {hyd.map((cp,i)=>(
            <div key={i} style={css.card(cp.c)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:3,color:"#444",marginBottom:3}}>{cp.t}</div>
                  <div style={{fontSize:12,fontWeight:700,letterSpacing:2,color:"#fff",lineHeight:1.5}}>{cp.action}</div>
                </div>
                <span style={css.tag(cp.c)}>{cp.badge}</span>
              </div>
              <div style={{fontSize:11,fontWeight:900,letterSpacing:3,color:cp.c,marginTop:6}}>{cp.km}</div>
            </div>
          ))}

          <div style={{...css.card("#333"),marginTop:8,padding:"14px 16px"}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:4,color:"#555",marginBottom:8}}>{T.hydration.reserve}</div>
            <div style={{fontSize:11,color:"#444",letterSpacing:1,lineHeight:1.8,whiteSpace:"pre-line"}}>
              {lang==="ID"
                ?"· 1 SALT CAP EXTRA DI SAKU\n· 1 GEL DARURAT (simpan sampai KM 17)\n· MINUM AIR JIKA PUSING / KRAM"
                :"· 1 EXTRA SALT CAP IN POCKET\n· 1 EMERGENCY GEL (keep until KM 17)\n· DRINK WATER IF DIZZY / CRAMPING"}
            </div>
          </div>

          <button style={{...css.btn(),marginTop:16}} onClick={()=>setStep(3)}>
            {lang==="ID"?"LIHAT RACE PLAN →":"VIEW RACE PLAN →"}
          </button>
        </>
      )}
    </div>
  );

  // ── PAGE 3: RESULTS ──
  const P3=()=>{
    const totalTime=plan?plan.reduce((s,seg)=>s+seg.time,0):0;
    const estFinish=plan?addM(P.startTime,totalTime):"—";
    return (
      <div>
        <SH>{T.results.title}</SH>

        {/* Ticket header */}
        <div style={{border:"1px solid #1a1a1a",marginBottom:20,overflow:"hidden"}}>
          <div style={{background:"#E63946",padding:"14px 18px"}}>
            <div style={{fontSize:8,letterSpacing:4,color:"rgba(255,255,255,0.6)",marginBottom:4}}>RACE PLAN · {new Date().toISOString().slice(0,10)}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:32,color:"#fff",letterSpacing:2,lineHeight:1}}>{P.name||"RUNNER"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:"#111"}}>
            {[
              [T.results.finish, estFinish, "#fff"],
              [T.results.total, plan?fmtT(totalTime):"—", "#E63946"],
              [T.results.avg, plan?`${fmtP(base)}/KM`:"—", "#fff"],
            ].map(([l,v,c])=>(
              <div key={l} style={{background:"#000",padding:"14px 12px",textAlign:"center"}}>
                <div style={{fontSize:7,letterSpacing:3,color:"#333",marginBottom:6}}>{l}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:18,color:c,letterSpacing:1}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{padding:"10px 18px",borderTop:"1px dashed #111",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:9,letterSpacing:2,color:"#333"}}>{totalDist.toFixed(2)} KM · START {P.startTime}</div>
            <Barcode width={60} height={10}/>
          </div>
        </div>

        {/* Pacing summary */}
        {plan&&(
          <>
            <SH>{T.results.pacing}</SH>
            {plan.map((seg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:"1px solid #0a0a0a"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:2,height:28,background:seg.elev==="up"?"#E63946":seg.elev==="down"?"#555":"#222",flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:"#fff"}}>{seg.name}</div>
                    <div style={{fontSize:8,letterSpacing:2,color:"#333"}}>{seg.st} · {seg.dist}KM</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:16,color:seg.elev==="up"?"#E63946":"#fff"}}>{fmtP(seg.pace)}</div>
                  <div style={{fontSize:8,letterSpacing:2,color:"#333"}}>{fmtT(seg.time)}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Hydration summary */}
        {hyd&&(
          <>
            <div style={css.divider}/>
            <SH>{T.results.hydration}</SH>
            {hyd.map((cp,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",borderBottom:"1px solid #0a0a0a"}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={css.tag(cp.c)}>{cp.badge}</span>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1,color:"#fff"}}>{cp.action}</div>
                </div>
                <div style={{fontSize:9,letterSpacing:2,color:"#444",whiteSpace:"nowrap",marginLeft:8}}>{cp.t}</div>
              </div>
            ))}
          </>
        )}

        {!plan&&!hyd&&(
          <div style={{padding:"40px 20px",textAlign:"center"}}>
            <div style={{fontSize:10,letterSpacing:3,color:"#333",lineHeight:2,whiteSpace:"pre-line"}}>
              {lang==="ID"
                ?"GENERATE PACING DAN HIDRASI TERLEBIH DAHULU\nUNTUK MELIHAT RACE PLAN LENGKAP."
                :"GENERATE PACING AND HYDRATION FIRST\nTO VIEW YOUR COMPLETE RACE PLAN."}
            </div>
            <button style={{...css.btn("g"),marginTop:20,width:"auto",padding:"12px 28px"}} onClick={()=>setStep(1)}>
              {lang==="ID"?"← KEMBALI KE PACING":"← BACK TO PACING"}
            </button>
          </div>
        )}

        {(plan||hyd)&&(
          <button style={{...css.btn("w"),marginTop:20}} onClick={()=>window.print()}>
            ⬇ {T.results.save}
          </button>
        )}

        <div style={{padding:"24px 0 0",textAlign:"center"}}>
          <div style={{fontSize:8,letterSpacing:3,color:"#222"}}>RUNLAB · TRAIN SMART. RACE SMARTER.</div>
          <div style={{fontSize:7,letterSpacing:2,color:"#1a1a1a",marginTop:4}}>andriylegality · Balikpapan, Indonesia</div>
        </div>
      </div>
    );
  };

  // ── RENDER ──
  return (
    <div style={css.root}>
      <GrainOverlay/>
      <Header/>
      <Nav/>
      <div style={{padding:"0 18px 20px"}}>
        {step===0&&<P0/>}
        {step===1&&<P1/>}
        {step===2&&<P2/>}
        {step===3&&<P3/>}
      </div>
    </div>
  );
}
