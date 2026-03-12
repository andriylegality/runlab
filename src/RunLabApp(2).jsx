import { useState, useEffect } from "react";

// ── CALC ──
const calcMaxHR = age => 220 - parseInt(age || 42);
const calcHRZ = (max, rest) => {
  const r = max - rest;
  return [
    { z: 1, n: "RECOVERY", min: rest, max: Math.round(rest + r * .50), color: "#6B7280", neon: false },
    { z: 2, n: "AEROBIC", min: Math.round(rest + r * .50), max: Math.round(rest + r * .60), color: "#00FF87", neon: true },
    { z: 3, n: "TEMPO", min: Math.round(rest + r * .60), max: Math.round(rest + r * .71), color: "#00D4FF", neon: true },
    { z: 4, n: "THRESHOLD", min: Math.round(rest + r * .71), max: Math.round(rest + r * .81), color: "#FF6B00", neon: true },
    { z: 5, n: "VO2MAX", min: Math.round(rest + r * .81), max: Math.round(rest + r * .93), color: "#FF2D78", neon: true },
    { z: 6, n: "MAX", min: Math.round(rest + r * .93), max: max, color: "#FF0040", neon: true },
  ];
};
const calcBase = (acts, vo2, age, gender) => {
  let b = acts.filter(a => a.pace).length > 0 ? acts.filter(a => parseFloat(a.pace) > 0).reduce((s, a) => s + parseFloat(a.pace), 0) / acts.filter(a => parseFloat(a.pace) > 0).length : 8.5;
  if (vo2) b = Math.max(4.5, b - (parseFloat(vo2) - 35) * 0.04);
  if (gender === "F") b += 0.3;
  if (parseInt(age) > 50) b += 0.2;
  return b;
};
const segPace = (base, elev) => elev === "up" ? base * 1.4 : elev === "down" ? base * 0.88 : base;
const rwProtocol = w => w < 10 ? "3 MIN RUN · 2 MIN WALK" : w < 20 ? "4 MIN RUN · 1 MIN WALK" : w < 35 ? "6 MIN RUN · 1 MIN WALK" : "9 MIN RUN · 1 MIN WALK";
const fmtP = p => { const m = Math.floor(p), s = Math.round((p - m) * 60); return `${m}'${s.toString().padStart(2, "0")}"`; };
const fmtT = m => { const h = Math.floor(m / 60), mn = Math.round(m % 60); return h > 0 ? `${h}H ${mn}M` : `${mn}M`; };
const addM = (t, m) => { const [h, mi] = (t || "23:30").split(":").map(Number), tot = h * 60 + mi + m; return `${Math.floor(tot / 60) % 24}:${(tot % 60).toString().padStart(2, "0")}`; };
const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

const LANG = {
  ID: {
    nav: ["PROFIL", "PACING", "HIDRASI", "HASIL"],
    profile: { title: "PROFIL PELARI", name: "NAMA", age: "USIA", male: "LAKI-LAKI", female: "PEREMPUAN", weight: "BERAT KG", height: "TINGGI CM", restHR: "RESTING HR", maxHR: "MAX HR", vo2max: "VO2MAX", distance: "JARAK KM", startTime: "JAM START", next: "LANJUT", acts: "LATIHAN TERAKHIR", actDist: "JARAK", actPace: "PACE MIN/KM", actHR: "AVG HR", actDate: "TANGGAL", addAct: "+ TAMBAH LATIHAN" },
    pacing: { title: "PACING MANAGEMENT", segs: "SEGMEN RUTE", segName: "NAMA", segDist: "JARAK KM", segElev: "ELEVASI", addSeg: "+ SEGMEN", generate: "GENERATE PLAN", runwalk: "RUN-WALK PROTOCOL", result: "HASIL PACING" },
    hydration: { title: "HIDRASI", warning: "MINUM SEBELUM HAUS — HAUS = DEHIDRASI 2%", saltcaps: "SALT CAPS", gel: "ENERGY GEL", dates: "KURMA", isotonic: "ISOTONIC", water: "AIR PUTIH", unit: "BUTIR / BUAH / SACHET", generate: "GENERATE JADWAL", schedule: "JADWAL HIDRASI", reserve: "CADANGAN DARURAT" },
    results: { title: "RACE PLAN", finish: "EST FINISH", total: "TOTAL WAKTU", avg: "AVG PACE", pacing: "PACING PLAN", hydration: "HYDRATION PLAN", save: "SIMPAN / PRINT" },
  },
  EN: {
    nav: ["PROFILE", "PACING", "HYDRATION", "RESULTS"],
    profile: { title: "RUNNER PROFILE", name: "NAME", age: "AGE", male: "MALE", female: "FEMALE", weight: "WEIGHT KG", height: "HEIGHT CM", restHR: "RESTING HR", maxHR: "MAX HR", vo2max: "VO2MAX", distance: "DISTANCE KM", startTime: "START TIME", next: "NEXT", acts: "RECENT ACTIVITIES", actDist: "DISTANCE", actPace: "PACE MIN/KM", actHR: "AVG HR", actDate: "DATE", addAct: "+ ADD ACTIVITY" },
    pacing: { title: "PACING MANAGEMENT", segs: "ROUTE SEGMENTS", segName: "NAME", segDist: "DISTANCE KM", segElev: "ELEVATION", addSeg: "+ SEGMENT", generate: "GENERATE PLAN", runwalk: "RUN-WALK PROTOCOL", result: "PACING RESULTS" },
    hydration: { title: "HYDRATION", warning: "DRINK BEFORE THIRST — THIRST = 2% DEHYDRATED", saltcaps: "SALT CAPS", gel: "ENERGY GEL", dates: "DATES", isotonic: "ISOTONIC", water: "WATER", unit: "PCS / SACHETS", generate: "GENERATE SCHEDULE", schedule: "HYDRATION SCHEDULE", reserve: "EMERGENCY RESERVE" },
    results: { title: "RACE PLAN", finish: "EST FINISH", total: "TOTAL TIME", avg: "AVG PACE", pacing: "PACING PLAN", hydration: "HYDRATION PLAN", save: "SAVE / PRINT" },
  }
};

// ── UI Components ──
const Input = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div className="animate-fade-up" style={{ animationFillMode: 'both' }}>
    <label className="block text-[9px] font-bold tracking-[0.3em] text-white/25 uppercase mb-2">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      inputMode={type === "number" ? "decimal" : undefined}
      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 text-white font-semibold text-base outline-none transition placeholder:text-white/10 hover:border-white/10" />
  </div>
);

const SH = ({ children, color = "text-neon-green" }) => (
  <div className="flex items-center gap-3 mt-10 mb-5 animate-fade-up" style={{ animationFillMode: 'both' }}>
    <div className="w-10 h-[2px] rounded-full" style={{ background: color === "text-neon-green" ? "#00FF87" : color === "text-neon-blue" ? "#00D4FF" : color === "text-neon-orange" ? "#FF6B00" : color === "text-neon-pink" ? "#FF2D78" : "#00FF87" }} />
    <h2 className={`text-[11px] font-bold tracking-[0.35em] uppercase ${color}`}>{children}</h2>
  </div>
);

const GlassCard = ({ children, className = "", glow = "" }) => (
  <div className={`rounded-2xl glass p-4 animate-fade-up ${glow} ${className}`} style={{ animationFillMode: 'both' }}>
    {children}
  </div>
);

// ── MAIN APP ──
export default function RunLabApp({ onBack }) {
  const [lang, setLang] = useState("ID");
  const T = LANG[lang];
  const [step, setStep] = useState(0);

  const [P, setP_] = useState(() => ld("rl_p", { name: "", age: "", gender: "M", weight: "", height: "", restHR: "50", maxHR: "", vo2max: "", distance: "19.18", startTime: "23:30" }));
  const [acts, setActs] = useState(() => ld("rl_a", []));
  const [segs, setSegs] = useState(() => ld("rl_s", [
    { name: "WARM UP", dist: "3", elev: "flat" }, { name: "KARANG JATI HILL", dist: "4", elev: "up" },
    { name: "RECOVERY RUN", dist: "4", elev: "down" }, { name: "CRUISE COASTAL", dist: "3", elev: "flat" },
    { name: "SURVIVE DAMAI", dist: "3", elev: "flat" }, { name: "FINISH", dist: "2.18", elev: "flat" },
  ]));
  const [ammo, setAmmo_] = useState(() => ld("rl_ammo", { saltcaps: 0, gel: 0, dates: 0, isotonic: 0, water: 1 }));
  const [plan, setPlan] = useState(null);
  const [hyd, setHyd] = useState(null);

  const setP = (k, v) => setP_(p => ({ ...p, [k]: v }));
  const setAm = (k, v) => setAmmo_(a => ({ ...a, [k]: v }));

  useEffect(() => { localStorage.setItem("rl_p", JSON.stringify(P)); }, [P]);
  useEffect(() => { localStorage.setItem("rl_a", JSON.stringify(acts)); }, [acts]);
  useEffect(() => { localStorage.setItem("rl_s", JSON.stringify(segs)); }, [segs]);
  useEffect(() => { localStorage.setItem("rl_ammo", JSON.stringify(ammo)); }, [ammo]);

  const maxHR = parseInt(P.maxHR) || calcMaxHR(P.age);
  const restHR = parseInt(P.restHR) || 50;
  const zones = calcHRZ(maxHR, restHR);
  const weekly = acts.reduce((s, a) => s + parseFloat(a.dist || 0), 0);
  const base = calcBase(acts, P.vo2max, P.age, P.gender);
  const totalDist = segs.reduce((s, g) => s + parseFloat(g.dist || 0), 0);

  const genPlan = () => {
    let elapsed = 0;
    setPlan(segs.map(seg => {
      const pace = segPace(base, seg.elev);
      const dist = parseFloat(seg.dist || 0);
      const time = pace * dist;
      const st = addM(P.startTime, elapsed);
      elapsed += time;
      const zt = seg.elev === "up" ? zones[3] : zones[1];
      return { ...seg, pace, dist, time, st, zt };
    }));
  };

  const genHyd = () => {
    const cps = [];
    cps.push({ km: "PRE", t: addM(P.startTime, -10), action: ammo.saltcaps > 0 ? "150ML AIR + 1 SALT CAP" : "150-200ML AIR PUTIH", badge: "PRE", type: "pre" });
    let su = ammo.saltcaps > 0 ? 1 : 0;
    const dist = totalDist || parseFloat(P.distance) || 19;
    for (let km = 3; km < dist; km += 3) {
      const t = addM(P.startTime, km * base);
      let action = "100–150ML AIR", badge = "AIR", type = "water";
      if ([6, 12, 15].includes(km) && su < ammo.saltcaps) { su++; action = ammo.isotonic > 0 && km === 6 ? "200ML ISOTONIC + 1 SALT CAP" : "200ML AIR + 1 SALT CAP"; badge = "SALT"; type = "salt"; }
      if (km === 15 && ammo.gel > 0) { action += " + 1 GEL"; badge = "GEL"; type = "gel"; }
      if (km >= 9 && km <= 12 && ammo.dates >= 2) { action += " + 2 KURMA"; }
      if (km === 6 && ammo.isotonic > 0 && !action.includes("ISOTONIC")) action = "200ML ISOTONIC";
      cps.push({ km: `KM ${km}`, t, action, badge, type });
    }
    setHyd(cps);
  };

  const elevStyle = (e) => e === "up" ? { border: "border-[#FF6B00]/20", bg: "bg-[#FF6B00]/5", text: "text-neon-orange", icon: "↑" } : e === "down" ? { border: "border-[#00D4FF]/20", bg: "bg-[#00D4FF]/5", text: "text-neon-blue", icon: "↓" } : { border: "border-white/[0.06]", bg: "bg-white/[0.02]", text: "text-white", icon: "→" };
  const badgeStyle = (t) => ({ pre: "bg-[#FF6B00] text-black", salt: "bg-white text-black", gel: "bg-[#00FF87] text-black", water: "bg-white/10 text-white/50" }[t] || "bg-white/10 text-white/50");

  // ── HEADER ──
  const Header = () => (
    <div className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#0A0A0F]/90 backdrop-blur-2xl px-5 md:px-8 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && <button onClick={onBack} className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition text-lg">←</button>}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00FF87] to-[#00D4FF] flex items-center justify-center"><span className="text-black text-[10px] font-black">R</span></div>
            <div>
              <div className="text-base font-black tracking-[0.15em] leading-none">RUNLAB</div>
              <div className="text-[7px] tracking-[0.3em] text-white/20">RACE INTELLIGENCE</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLang(l => l === "ID" ? "EN" : "ID")} className="px-3 py-1.5 rounded-lg glass text-[9px] font-bold tracking-[0.2em] text-white/30 hover:text-white/60 transition">{lang === "ID" ? "ID · EN" : "EN · ID"}</button>
          <div className="text-[9px] tracking-[0.2em] text-white/15 hidden sm:block font-mono-num">{new Date().toISOString().slice(0, 10)}</div>
        </div>
      </div>
      <div className="flex gap-1 mt-3">
        {[0, 1, 2, 3].map(s => (
          <div key={s} onClick={() => setStep(s)} className={`flex-1 h-1 rounded-full cursor-pointer transition-all duration-500 ${s <= step ? "bg-gradient-to-r from-[#00FF87] to-[#00D4FF] glow-green" : "bg-white/[0.04]"}`} />
        ))}
      </div>
    </div>
  );

  const Nav = () => (
    <div className="sticky top-[68px] z-40 flex border-b border-white/[0.04] bg-[#0A0A0F]/80 backdrop-blur-xl">
      {T.nav.map((n, i) => (
        <button key={i} onClick={() => setStep(i)} className={`flex-1 py-3 text-[9px] font-bold tracking-[0.25em] transition-all duration-300 border-b-2 ${step === i ? "border-[#00FF87] text-neon-green" : "border-transparent text-white/15 hover:text-white/30"}`}>{n}</button>
      ))}
    </div>
  );

  // ── PROFILE ──
  const P0 = () => (
    <div className="space-y-4" key="profile">
      <SH>{T.profile.title}</SH>
      <Input label={T.profile.name} value={P.name} onChange={v => setP("name", v)} placeholder="ANDRI Y" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Input label={T.profile.age} value={P.age} onChange={v => setP("age", v)} type="number" placeholder="42" />
        <div className="animate-fade-up" style={{ animationFillMode: 'both' }}>
          <label className="block text-[9px] font-bold tracking-[0.3em] text-white/25 uppercase mb-2">{T.profile.male} / {T.profile.female}</label>
          <div className="flex gap-2">
            {[["M", T.profile.male], ["F", T.profile.female]].map(([v]) => (
              <button key={v} onClick={() => setP("gender", v)} className={`flex-1 py-3.5 rounded-xl text-xs font-bold tracking-[0.2em] transition-all duration-300 ${P.gender === v ? "bg-gradient-to-r from-[#00FF87] to-[#00D4FF] text-black glow-green" : "glass text-white/25 hover:text-white/50"}`}>{v}</button>
            ))}
          </div>
        </div>
        <Input label={T.profile.weight} value={P.weight} onChange={v => setP("weight", v)} type="number" placeholder="71.1" />
        <Input label={T.profile.height} value={P.height} onChange={v => setP("height", v)} type="number" placeholder="168" />
        <Input label={T.profile.restHR} value={P.restHR} onChange={v => setP("restHR", v)} type="number" placeholder="50" />
        <Input label={T.profile.maxHR} value={P.maxHR} onChange={v => setP("maxHR", v)} type="number" placeholder={String(calcMaxHR(P.age || 42))} />
        <Input label={T.profile.vo2max} value={P.vo2max} onChange={v => setP("vo2max", v)} type="number" placeholder="41" />
        <Input label={T.profile.distance} value={P.distance} onChange={v => setP("distance", v)} type="number" placeholder="19.18" />
      </div>
      <Input label={T.profile.startTime} value={P.startTime} onChange={v => setP("startTime", v)} placeholder="23:30" />
      <div className="h-px bg-gradient-to-r from-[#00FF87]/30 to-transparent" />
      <SH color="text-neon-blue">{T.profile.acts}</SH>
      <p className="text-[10px] text-white/20 tracking-wide">{lang === "ID" ? "ISI DATA LARI TERAKHIR UNTUK REKOMENDASI PACING LEBIH AKURAT." : "FILL RECENT RUNS FOR BETTER PACING."}</p>
      {acts.map((act, i) => (
        <GlassCard key={i} className="border-[#FF6B00]/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold tracking-[0.3em] text-neon-orange">{lang === "ID" ? `LATIHAN ${i + 1}` : `ACTIVITY ${i + 1}`}</span>
            <button onClick={() => setActs(a => a.filter((_, j) => j !== i))} className="text-white/15 hover:text-[#FF2D78] transition text-lg">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={T.profile.actDist} value={act.dist || ""} onChange={v => setActs(a => a.map((x, j) => j === i ? { ...x, dist: v } : x))} type="number" placeholder="15" />
            <Input label={T.profile.actPace} value={act.pace || ""} onChange={v => setActs(a => a.map((x, j) => j === i ? { ...x, pace: v } : x))} type="number" placeholder="8.5" />
            <Input label={T.profile.actHR} value={act.hr || ""} onChange={v => setActs(a => a.map((x, j) => j === i ? { ...x, hr: v } : x))} type="number" placeholder="130" />
            <Input label={T.profile.actDate} value={act.date || ""} onChange={v => setActs(a => a.map((x, j) => j === i ? { ...x, date: v } : x))} placeholder="2026-03-12" />
          </div>
        </GlassCard>
      ))}
      {acts.length < 3 && <button onClick={() => setActs(a => [...a, { dist: "", pace: "", hr: "", date: "" }])} className="w-full rounded-xl border border-dashed border-white/[0.06] py-3.5 text-[10px] font-bold tracking-[0.25em] text-white/20 hover:border-[#00FF87]/20 hover:text-[#00FF87]/40 transition">{T.profile.addAct}</button>}
      <button onClick={() => setStep(1)} className="w-full rounded-2xl bg-gradient-to-r from-[#00FF87] to-[#00D4FF] py-4 text-sm font-black tracking-[0.2em] text-black shadow-2xl shadow-[#00FF87]/15 hover:-translate-y-0.5 transition-all glow-green">{T.profile.next} →</button>
    </div>
  );

  // ── PACING ──
  const P1 = () => (
    <div className="space-y-4" key="pacing">
      <SH>{T.pacing.title}</SH>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[["BASE", fmtP(base), "/KM", "#00FF87"], ["VO2MAX", P.vo2max || "—", "", "#00D4FF"], ["WEEKLY", weekly.toFixed(1), "KM", "#FF6B00"], ["MAX HR", String(maxHR), "BPM", "#FF2D78"]].map(([l, v, u, c]) => (
          <div key={l} className="glass rounded-2xl p-4 text-center group hover:bg-white/[0.04] transition">
            <div className="text-[7px] font-bold tracking-[0.35em] text-white/20 mb-2">{l}</div>
            <div className="text-2xl font-black font-mono-num leading-none" style={{ color: c }}>{v}</div>
            {u && <div className="text-[8px] text-white/15 mt-1.5 tracking-wide">{u}</div>}
          </div>
        ))}
      </div>
      <SH color="text-neon-pink">HR ZONES</SH>
      <GlassCard>
        {zones.map((z, i) => (
          <div key={z.z} className={`flex items-center py-3 px-2 ${i < 5 ? "border-b border-white/[0.03]" : ""} group hover:bg-white/[0.02] transition rounded-lg`}>
            <div className="w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0 transition-transform group-hover:scale-125" style={{ background: z.color, boxShadow: z.neon ? `0 0 8px ${z.color}40` : 'none' }} />
            <div className={`flex-1 text-[10px] font-bold tracking-[0.2em] ${z.neon ? "text-white/70" : "text-white/25"}`}>Z{z.z} {z.n}</div>
            <div className="font-black text-sm font-mono-num" style={{ color: z.color }}>{z.min}–{z.max} <span className="text-[8px] font-normal text-white/15">BPM</span></div>
          </div>
        ))}
      </GlassCard>
      <SH color="text-neon-orange">{T.pacing.segs}</SH>
      {segs.map((seg, i) => { const es = elevStyle(seg.elev); return (
        <div key={i} className={`rounded-2xl border ${es.border} ${es.bg} p-4 transition-all hover:bg-white/[0.03] animate-fade-up`} style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-black ${es.text}`}>{es.icon}</span>
              <span className="text-[10px] font-black tracking-[0.25em] text-white/20">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <button onClick={() => setSegs(s => s.filter((_, j) => j !== i))} className="text-white/10 hover:text-[#FF2D78] transition text-sm">✕</button>
          </div>
          <Input label={T.pacing.segName} value={seg.name} onChange={v => setSegs(s => s.map((x, j) => j === i ? { ...x, name: v } : x))} />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Input label={T.pacing.segDist} value={seg.dist} onChange={v => setSegs(s => s.map((x, j) => j === i ? { ...x, dist: v } : x))} type="number" />
            <div className="animate-fade-up" style={{ animationFillMode: 'both' }}>
              <label className="block text-[9px] font-bold tracking-[0.3em] text-white/25 uppercase mb-2">{T.pacing.segElev}</label>
              <div className="flex gap-2">
                {[["flat", "→", "#6B7280"], ["up", "↑", "#FF6B00"], ["down", "↓", "#00D4FF"]].map(([v, ico, c]) => (
                  <button key={v} onClick={() => setSegs(s => s.map((x, j) => j === i ? { ...x, elev: v } : x))} className={`flex-1 py-3 rounded-xl text-base font-bold transition-all border ${seg.elev === v ? `border-[${c}]/30 text-white` : "border-white/[0.04] text-white/10"}`} style={seg.elev === v ? { color: c, borderColor: c + '30', background: c + '10' } : {}}>{ico}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ); })}
      <button onClick={() => setSegs(s => [...s, { name: `SEGMENT ${s.length + 1}`, dist: "3", elev: "flat" }])} className="w-full rounded-xl border border-dashed border-white/[0.06] py-3.5 text-[10px] font-bold tracking-[0.25em] text-white/20 hover:border-[#FF6B00]/20 hover:text-[#FF6B00]/40 transition">{T.pacing.addSeg}</button>
      <button onClick={genPlan} className="w-full rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#FF2D78] py-4 text-sm font-black tracking-[0.2em] text-white shadow-2xl shadow-[#FF6B00]/15 hover:-translate-y-0.5 transition-all glow-orange">⚡ {T.pacing.generate}</button>

      {plan && (<>
        <div className="h-px bg-gradient-to-r from-[#00FF87]/30 via-[#00D4FF]/15 to-transparent" />
        <SH>{T.pacing.runwalk}</SH>
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-[#00FF87] to-[#00D4FF]">
          <div className="rounded-2xl bg-[#0A0A0F] p-5">
            <div className="text-lg font-black tracking-[0.1em] text-white font-mono-num">{rwProtocol(weekly)}</div>
            <div className="text-[9px] tracking-[0.25em] text-white/20 mt-1">WEEKLY: {weekly.toFixed(1)} KM</div>
          </div>
        </div>
        <SH color="text-neon-blue">{T.pacing.result}</SH>
        {plan.map((seg, i) => { const es = elevStyle(seg.elev); return (
          <GlassCard key={i} className={es.border}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[8px] tracking-[0.3em] text-white/15 font-mono-num">{String(i + 1).padStart(2, "0")} · {seg.st}</div>
                <div className="text-base font-black text-white mt-0.5">{seg.name}</div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-black font-mono-num leading-none ${es.text}`}>{fmtP(seg.pace)}</div>
                <div className="text-[7px] tracking-[0.25em] text-white/15 mt-1">/KM</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-lg text-[8px] font-bold tracking-[0.15em] border ${es.border} ${es.text}`}>{seg.elev.toUpperCase()} {seg.dist}KM</span>
              <span className="px-2.5 py-1 rounded-lg text-[8px] font-bold tracking-[0.15em] glass text-white/25">{fmtT(seg.time)}</span>
              <span className="text-[8px] tracking-[0.15em] text-white/15 flex items-center">Z{seg.zt?.z} {seg.zt?.n}</span>
            </div>
          </GlassCard>
        ); })}
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-[#00FF87] to-[#00D4FF]">
          <div className="rounded-2xl bg-[#0A0A0F] p-5">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[8px] tracking-[0.3em] text-neon-green mb-1">TOTAL · EST FINISH</div>
                <div className="text-4xl font-black font-mono-num text-white">{addM(P.startTime, plan.reduce((s, seg) => s + seg.time, 0))}</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] tracking-[0.3em] text-white/20 mb-1">AVG PACE</div>
                <div className="text-xl font-black font-mono-num text-white">{fmtP(base)}/KM</div>
                <div className="text-xs text-white/20 font-mono-num">{fmtT(plan.reduce((s, seg) => s + seg.time, 0))}</div>
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => setStep(2)} className="w-full rounded-2xl bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] py-4 text-sm font-black tracking-[0.2em] text-black shadow-2xl shadow-[#00D4FF]/15 hover:-translate-y-0.5 transition-all glow-blue">{lang === "ID" ? "LANJUT KE HIDRASI →" : "NEXT: HYDRATION →"}</button>
      </>)}
    </div>
  );

  // ── HYDRATION ──
  const P2 = () => (
    <div className="space-y-4" key="hydration">
      <SH color="text-neon-blue">{T.hydration.title}</SH>
      <div className="rounded-2xl border border-[#FF6B00]/20 bg-[#FF6B00]/5 p-4 flex items-center gap-3">
        <span className="text-2xl animate-float">💧</span>
        <p className="text-[10px] font-bold tracking-[0.15em] text-neon-orange leading-relaxed">{T.hydration.warning}</p>
      </div>
      <SH color="text-neon-orange">{lang === "ID" ? "INVENTORI NUTRISI" : "NUTRITION INVENTORY"}</SH>
      {[["saltcaps", T.hydration.saltcaps, "🧂", "#FFFFFF"], ["gel", T.hydration.gel, "⚡", "#00FF87"], ["dates", T.hydration.dates, "🌴", "#FF6B00"], ["isotonic", T.hydration.isotonic, "🥤", "#00D4FF"], ["water", T.hydration.water, "💧", "#7B61FF"]].map(([k, label, emoji, c]) => (
        <div key={k} className="flex items-center justify-between py-3.5 border-b border-white/[0.03] group">
          <div className="flex items-center gap-3">
            <span className="text-xl group-hover:scale-110 transition-transform">{emoji}</span>
            <div>
              <div className="text-sm font-bold text-white/80">{label}</div>
              <div className="text-[7px] tracking-[0.25em] text-white/15 mt-0.5">{T.hydration.unit}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setAm(k, Math.max(0, (parseInt(ammo[k]) || 0) - 1))} className="w-10 h-10 rounded-xl glass text-white text-lg font-bold flex items-center justify-center hover:bg-white/[0.06] transition">−</button>
            <div className="text-2xl font-black font-mono-num min-w-[32px] text-center" style={{ color: c }}>{ammo[k] || 0}</div>
            <button onClick={() => setAm(k, (parseInt(ammo[k]) || 0) + 1)} className="w-10 h-10 rounded-xl glass text-white text-lg font-bold flex items-center justify-center hover:bg-white/[0.06] transition">+</button>
          </div>
        </div>
      ))}
      <button onClick={genHyd} className="w-full rounded-2xl bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] py-4 text-sm font-black tracking-[0.2em] text-black shadow-2xl shadow-[#00D4FF]/15 hover:-translate-y-0.5 transition-all glow-blue">💧 {T.hydration.generate}</button>

      {hyd && (<>
        <div className="h-px bg-gradient-to-r from-[#00D4FF]/30 to-transparent" />
        <SH color="text-neon-blue">{T.hydration.schedule}</SH>
        {hyd.map((cp, i) => (
          <GlassCard key={i}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[8px] tracking-[0.3em] text-white/15 font-mono-num mb-1">{cp.t}</div>
                <div className="text-sm font-bold text-white/80 leading-relaxed">{cp.action}</div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[8px] font-bold tracking-[0.2em] ${badgeStyle(cp.type)}`}>{cp.badge}</span>
            </div>
            <div className="text-xs font-black tracking-[0.25em] text-neon-orange mt-2 font-mono-num">{cp.km}</div>
          </GlassCard>
        ))}
        <GlassCard>
          <div className="text-[8px] font-bold tracking-[0.35em] text-white/20 mb-3">{T.hydration.reserve}</div>
          {(lang === "ID" ? ["🧂 1 SALT CAP EXTRA DI SAKU", "⚡ 1 GEL DARURAT (simpan sampai KM 17)", "💧 MINUM AIR JIKA PUSING / KRAM"] : ["🧂 1 EXTRA SALT CAP IN POCKET", "⚡ 1 EMERGENCY GEL (keep until KM 17)", "💧 DRINK WATER IF DIZZY / CRAMPING"]).map(t => <div key={t} className="text-sm text-white/35 leading-relaxed py-1">{t}</div>)}
        </GlassCard>
        <button onClick={() => setStep(3)} className="w-full rounded-2xl bg-gradient-to-r from-[#00FF87] to-[#00D4FF] py-4 text-sm font-black tracking-[0.2em] text-black shadow-2xl shadow-[#00FF87]/15 hover:-translate-y-0.5 transition-all glow-green">{lang === "ID" ? "LIHAT RACE PLAN →" : "VIEW RACE PLAN →"}</button>
      </>)}
    </div>
  );

  // ── RESULTS ──
  const P3 = () => {
    const totalTime = plan ? plan.reduce((s, seg) => s + seg.time, 0) : 0;
    const estFinish = plan ? addM(P.startTime, totalTime) : "—";
    return (
      <div className="space-y-4" key="results">
        <SH>{T.results.title}</SH>
        {/* Race Ticket */}
        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-[#00FF87]/5 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <div className="bg-gradient-to-r from-[#00FF87] via-[#00D4FF] to-[#7B61FF] p-6">
            <div className="text-[7px] tracking-[0.35em] text-black/40 font-bold">RACE PLAN · {new Date().toISOString().slice(0, 10)}</div>
            <div className="text-3xl md:text-4xl font-black text-black tracking-wide leading-none mt-2">{P.name || "RUNNER"}</div>
          </div>
          <div className="grid grid-cols-3 gap-[1px] bg-white/[0.03]">
            {[[T.results.finish, estFinish, "#00FF87"], [T.results.total, plan ? fmtT(totalTime) : "—", "#FF6B00"], [T.results.avg, plan ? `${fmtP(base)}/KM` : "—", "#00D4FF"]].map(([l, v, c]) => (
              <div key={l} className="bg-[#0A0A0F] p-4 text-center">
                <div className="text-[7px] tracking-[0.35em] text-white/15 mb-2">{l}</div>
                <div className="text-lg font-black font-mono-num" style={{ color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="bg-[#0A0A0F] border-t border-dashed border-white/[0.06] px-5 py-3 flex justify-between items-center">
            <div className="text-[8px] tracking-[0.2em] text-white/15 font-mono-num">{totalDist.toFixed(2)} KM · START {P.startTime}</div>
            <div className="text-[8px] tracking-[0.3em] text-neon-green/40 font-bold">RUNLAB</div>
          </div>
        </div>

        {plan && (<>
          <SH color="text-neon-orange">{T.results.pacing}</SH>
          {plan.map((seg, i) => { const es = elevStyle(seg.elev); return (
            <div key={i} className="flex justify-between items-center py-3 px-2 border-b border-white/[0.03] hover:bg-white/[0.02] transition rounded-lg animate-fade-up" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}>
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 rounded-full" style={{ background: es.text === "text-neon-orange" ? "#FF6B00" : es.text === "text-neon-blue" ? "#00D4FF" : "rgba(255,255,255,0.06)" }} />
                <div><div className="text-xs font-bold text-white/70">{seg.name}</div><div className="text-[8px] tracking-[0.15em] text-white/15 font-mono-num">{seg.st} · {seg.dist}KM</div></div>
              </div>
              <div className="text-right"><div className={`text-base font-black font-mono-num ${es.text}`}>{fmtP(seg.pace)}</div><div className="text-[8px] tracking-[0.15em] text-white/15 font-mono-num">{fmtT(seg.time)}</div></div>
            </div>
          ); })}
        </>)}

        {hyd && (<>
          <div className="h-px bg-gradient-to-r from-[#00D4FF]/20 to-transparent" />
          <SH color="text-neon-blue">{T.results.hydration}</SH>
          {hyd.map((cp, i) => (
            <div key={i} className="flex justify-between items-center py-2.5 px-2 border-b border-white/[0.03] rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-md text-[7px] font-bold tracking-[0.2em] ${badgeStyle(cp.type)}`}>{cp.badge}</span>
                <div className="text-xs font-semibold text-white/60">{cp.action}</div>
              </div>
              <div className="text-[8px] tracking-[0.15em] text-white/15 font-mono-num ml-3">{cp.t}</div>
            </div>
          ))}
        </>)}

        {!plan && !hyd && (
          <div className="py-16 text-center"><div className="text-5xl mb-4">🏃</div><p className="text-[10px] tracking-[0.25em] text-white/15 leading-loose whitespace-pre-line">{lang === "ID" ? "GENERATE PACING DAN HIDRASI\nUNTUK MELIHAT RACE PLAN." : "GENERATE PACING AND HYDRATION\nTO VIEW RACE PLAN."}</p><button onClick={() => setStep(1)} className="mt-6 rounded-xl glass px-8 py-3 text-[10px] font-bold tracking-[0.25em] text-white/25 hover:text-white hover:bg-white/[0.06] transition">{lang === "ID" ? "← KE PACING" : "← TO PACING"}</button></div>
        )}

        {(plan || hyd) && <button onClick={() => window.print()} className="w-full rounded-2xl bg-white py-4 text-sm font-black tracking-[0.2em] text-black hover:scale-[1.01] transition-all">⬇ {T.results.save}</button>}
        <div className="pt-8 text-center"><div className="text-[7px] tracking-[0.4em] text-white/[0.06]">RUNLAB · TRAIN SMART. RACE SMARTER.</div><div className="text-[6px] tracking-[0.3em] text-white/[0.03] mt-1">andriylegality · Balikpapan, Indonesia</div></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00FF87]/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00D4FF]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-[50%] right-[20%] w-[200px] h-[200px] bg-[#FF6B00]/[0.03] rounded-full blur-[80px]" />
      </div>
      <div className="relative max-w-3xl mx-auto pb-24">
        <Header />
        <Nav />
        <div className="px-5 md:px-8 pt-2">
          {step === 0 && <P0 />}
          {step === 1 && <P1 />}
          {step === 2 && <P2 />}
          {step === 3 && <P3 />}
        </div>
      </div>
    </div>
  );
}
