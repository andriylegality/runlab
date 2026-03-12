import { useState, useEffect } from "react";

// ── CALC ──
const calcMaxHR = age => 220 - parseInt(age || 42);
const calcHRZ = (max, rest) => {
  const r = max - rest;
  return [
    { z: 1, n: "RECOVERY", min: rest, max: Math.round(rest + r * .50), c: "text-gray-400", bg: "bg-gray-400" },
    { z: 2, n: "AEROBIC", min: Math.round(rest + r * .50), max: Math.round(rest + r * .60), c: "text-emerald-300", bg: "bg-emerald-300" },
    { z: 3, n: "TEMPO", min: Math.round(rest + r * .60), max: Math.round(rest + r * .71), c: "text-amber-400", bg: "bg-amber-400" },
    { z: 4, n: "THRESHOLD", min: Math.round(rest + r * .71), max: Math.round(rest + r * .81), c: "text-orange-400", bg: "bg-orange-400" },
    { z: 5, n: "VO2MAX", min: Math.round(rest + r * .81), max: Math.round(rest + r * .93), c: "text-red-400", bg: "bg-red-400" },
    { z: 6, n: "MAX", min: Math.round(rest + r * .93), max: max, c: "text-rose-500", bg: "bg-rose-500" },
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
const rwProtocol = w => w < 10 ? "3 MIN LARI · 2 MIN JALAN" : w < 20 ? "4 MIN LARI · 1 MIN JALAN" : w < 35 ? "6 MIN LARI · 1 MIN JALAN" : "9 MIN LARI · 1 MIN JALAN";
const fmtP = p => { const m = Math.floor(p), s = Math.round((p - m) * 60); return `${m}'${s.toString().padStart(2, "0")}"`; };
const fmtT = m => { const h = Math.floor(m / 60), mn = Math.round(m % 60); return h > 0 ? `${h}H ${mn}M` : `${mn}M`; };
const addM = (t, m) => { const [h, mi] = (t || "23:30").split(":").map(Number), tot = h * 60 + mi + m; return `${Math.floor(tot / 60) % 24}:${(tot % 60).toString().padStart(2, "0")}`; };
const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

// ── LANG ──
const LANG = {
  ID: {
    nav: ["PROFIL", "PACING", "HIDRASI", "HASIL"],
    profile: { title: "PROFIL PELARI", name: "NAMA", age: "USIA", male: "LAKI-LAKI", female: "PEREMPUAN", weight: "BERAT KG", height: "TINGGI CM", restHR: "RESTING HR", maxHR: "MAX HR", vo2max: "VO2MAX", distance: "JARAK KM", startTime: "JAM START", next: "LANJUT", acts: "LATIHAN TERAKHIR", actDist: "JARAK", actPace: "PACE MIN/KM", actHR: "AVG HR", actDate: "TANGGAL", addAct: "+ TAMBAH LATIHAN" },
    pacing: { title: "PACING MANAGEMENT", segs: "SEGMEN RUTE", segName: "NAMA", segDist: "JARAK KM", segElev: "ELEVASI", flat: "FLAT", up: "TANJAKAN", down: "TURUNAN", addSeg: "+ SEGMEN", generate: "GENERATE PLAN", runwalk: "RUN-WALK PROTOCOL", result: "HASIL PACING" },
    hydration: { title: "HIDRASI", warning: "MINUM SEBELUM HAUS — HAUS = DEHIDRASI 2%", saltcaps: "SALT CAPS", gel: "ENERGY GEL", dates: "KURMA", isotonic: "ISOTONIC", water: "AIR PUTIH", unit: "BUTIR / BUAH / SACHET", generate: "GENERATE JADWAL", schedule: "JADWAL HIDRASI", reserve: "CADANGAN DARURAT" },
    results: { title: "RACE PLAN", finish: "EST FINISH", total: "TOTAL WAKTU", avg: "AVG PACE", pacing: "PACING PLAN", hydration: "HYDRATION PLAN", save: "SIMPAN / PRINT" },
  },
  EN: {
    nav: ["PROFILE", "PACING", "HYDRATION", "RESULTS"],
    profile: { title: "RUNNER PROFILE", name: "NAME", age: "AGE", male: "MALE", female: "FEMALE", weight: "WEIGHT KG", height: "HEIGHT CM", restHR: "RESTING HR", maxHR: "MAX HR", vo2max: "VO2MAX", distance: "DISTANCE KM", startTime: "START TIME", next: "NEXT", acts: "RECENT ACTIVITIES", actDist: "DISTANCE", actPace: "PACE MIN/KM", actHR: "AVG HR", actDate: "DATE", addAct: "+ ADD ACTIVITY" },
    pacing: { title: "PACING MANAGEMENT", segs: "ROUTE SEGMENTS", segName: "NAME", segDist: "DISTANCE KM", segElev: "ELEVATION", flat: "FLAT", up: "UPHILL", down: "DOWNHILL", addSeg: "+ SEGMENT", generate: "GENERATE PLAN", runwalk: "RUN-WALK PROTOCOL", result: "PACING RESULTS" },
    hydration: { title: "HYDRATION", warning: "DRINK BEFORE THIRST — THIRST = 2% DEHYDRATED", saltcaps: "SALT CAPS", gel: "ENERGY GEL", dates: "DATES", isotonic: "ISOTONIC", water: "WATER", unit: "PCS / SACHETS", generate: "GENERATE SCHEDULE", schedule: "HYDRATION SCHEDULE", reserve: "EMERGENCY RESERVE" },
    results: { title: "RACE PLAN", finish: "EST FINISH", total: "TOTAL TIME", avg: "AVG PACE", pacing: "PACING PLAN", hydration: "HYDRATION PLAN", save: "SAVE / PRINT" },
  }
};

// ── REUSABLE COMPONENTS ──
const Input = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div>
    <label className="block text-[10px] font-bold tracking-[0.25em] text-white/40 uppercase mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={type === "number" ? "decimal" : undefined}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-semibold text-base outline-none focus:border-orange-400/60 focus:bg-white/[0.07] transition placeholder:text-white/15"
    />
  </div>
);

const SectionHeader = ({ children, color = "text-orange-400" }) => (
  <div className="flex items-center gap-3 mt-8 mb-5">
    <div className="w-8 h-[2px] bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
    <h2 className={`text-xs font-bold tracking-[0.3em] uppercase ${color}`}>{children}</h2>
  </div>
);

const Card = ({ children, className = "", glow = "" }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 ${glow} ${className}`}>
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
    { name: "WARM UP", dist: "3", elev: "flat" },
    { name: "KARANG JATI HILL", dist: "4", elev: "up" },
    { name: "RECOVERY RUN", dist: "4", elev: "down" },
    { name: "CRUISE COASTAL", dist: "3", elev: "flat" },
    { name: "SURVIVE DAMAI", dist: "3", elev: "flat" },
    { name: "FINISH", dist: "2.18", elev: "flat" },
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
      const zt = seg.elev === "up" ? zones[2] : zones[1];
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

  const badgeColor = (type) => {
    const map = { pre: "bg-orange-500 text-black", salt: "bg-white text-black", gel: "bg-amber-400 text-black", water: "bg-white/10 text-white/60" };
    return map[type] || map.water;
  };

  const elevColor = (elev) => {
    if (elev === "up") return "border-orange-500/40 bg-orange-500/5";
    if (elev === "down") return "border-emerald-400/30 bg-emerald-400/5";
    return "border-white/10 bg-white/5";
  };

  const elevAccent = (elev) => {
    if (elev === "up") return "text-orange-400";
    if (elev === "down") return "text-emerald-300";
    return "text-white";
  };

  // ── HEADER ──
  const Header = () => (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl px-5 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition text-lg">←</button>
          )}
          <div>
            <div className="text-xl font-black tracking-[0.2em] leading-none">RUNLAB</div>
            <div className="text-[8px] tracking-[0.3em] text-white/30 mt-0.5">RACE INTELLIGENCE</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLang(l => l === "ID" ? "EN" : "ID")} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white/40 hover:text-white/70 hover:border-white/20 transition">
            {lang === "ID" ? "ID · EN" : "EN · ID"}
          </button>
          <div className="text-[10px] tracking-widest text-white/20 hidden sm:block">{new Date().toISOString().slice(0, 10)}</div>
        </div>
      </div>
      <div className="flex gap-1 mt-3">
        {[0, 1, 2, 3].map(s => (
          <div key={s} onClick={() => setStep(s)} className={`flex-1 h-1 rounded-full cursor-pointer transition-all duration-300 ${s <= step ? "bg-gradient-to-r from-orange-500 to-amber-400" : "bg-white/5"}`} />
        ))}
      </div>
    </div>
  );

  // ── NAV ──
  const Nav = () => (
    <div className="sticky top-[72px] z-40 flex border-b border-white/5 bg-black/80 backdrop-blur-xl">
      {T.nav.map((n, i) => (
        <button key={i} onClick={() => setStep(i)} className={`flex-1 py-3 text-[10px] font-bold tracking-[0.2em] transition-all duration-200 border-b-2 ${step === i ? "border-orange-400 text-orange-400" : "border-transparent text-white/20 hover:text-white/40"}`}>
          {n}
        </button>
      ))}
    </div>
  );

  // ── PAGE 0: PROFILE ──
  const PageProfile = () => (
    <div className="space-y-5">
      <SectionHeader>{T.profile.title}</SectionHeader>
      <Input label={T.profile.name} value={P.name} onChange={v => setP("name", v)} placeholder="ANDRI Y" />
      <div className="grid grid-cols-2 gap-4">
        <Input label={T.profile.age} value={P.age} onChange={v => setP("age", v)} type="number" placeholder="42" />
        <div>
          <label className="block text-[10px] font-bold tracking-[0.25em] text-white/40 uppercase mb-1.5">{T.profile.male} / {T.profile.female}</label>
          <div className="flex gap-2">
            {[["M", T.profile.male], ["F", T.profile.female]].map(([v, l]) => (
              <button key={v} onClick={() => setP("gender", v)} className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${P.gender === v ? "bg-gradient-to-r from-orange-500 to-amber-400 text-black shadow-lg shadow-orange-500/20" : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"}`}>{v}</button>
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

      <div className="h-px bg-gradient-to-r from-orange-500/40 to-transparent" />

      <SectionHeader color="text-emerald-400">{T.profile.acts}</SectionHeader>
      <p className="text-xs text-white/25 tracking-wide leading-relaxed">
        {lang === "ID" ? "ISI DATA LARI TERAKHIR UNTUK REKOMENDASI PACING YANG LEBIH AKURAT." : "FILL IN RECENT RUN DATA FOR MORE ACCURATE PACING RECOMMENDATIONS."}
      </p>

      {acts.map((act, i) => (
        <Card key={i} className="border-orange-500/20" glow="shadow-lg shadow-orange-500/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-[0.25em] text-orange-400">{lang === "ID" ? `LATIHAN ${i + 1}` : `ACTIVITY ${i + 1}`}</span>
            <button onClick={() => setActs(a => a.filter((_, j) => j !== i))} className="text-white/20 hover:text-red-400 transition text-lg leading-none">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={T.profile.actDist} value={act.dist || ""} onChange={v => setActs(a => a.map((x, j) => j === i ? { ...x, dist: v } : x))} type="number" placeholder="15" />
            <Input label={T.profile.actPace} value={act.pace || ""} onChange={v => setActs(a => a.map((x, j) => j === i ? { ...x, pace: v } : x))} type="number" placeholder="8.5" />
            <Input label={T.profile.actHR} value={act.hr || ""} onChange={v => setActs(a => a.map((x, j) => j === i ? { ...x, hr: v } : x))} type="number" placeholder="130" />
            <Input label={T.profile.actDate} value={act.date || ""} onChange={v => setActs(a => a.map((x, j) => j === i ? { ...x, date: v } : x))} placeholder="2026-03-10" />
          </div>
        </Card>
      ))}

      {acts.length < 3 && (
        <button onClick={() => setActs(a => [...a, { dist: "", pace: "", hr: "", date: "" }])} className="w-full rounded-xl border border-dashed border-white/10 py-3.5 text-xs font-bold tracking-[0.2em] text-white/30 hover:border-orange-400/30 hover:text-orange-400/60 transition">
          {T.profile.addAct}
        </button>
      )}
      <button onClick={() => setStep(1)} className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 py-4 text-sm font-black tracking-[0.2em] text-black shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all">
        {T.profile.next} →
      </button>
    </div>
  );

  // ── PAGE 1: PACING ──
  const PagePacing = () => (
    <div className="space-y-5">
      <SectionHeader>{T.pacing.title}</SectionHeader>

      <div className="grid grid-cols-4 gap-2">
        {[
          ["BASE", fmtP(base), "/KM", "from-orange-500 to-amber-400"],
          ["VO2MAX", P.vo2max || "—", "", "from-emerald-400 to-teal-300"],
          ["WEEKLY", weekly.toFixed(1), "KM", "from-cyan-400 to-blue-400"],
          ["MAX HR", String(maxHR), "BPM", "from-rose-500 to-pink-400"],
        ].map(([l, v, u, grad]) => (
          <div key={l} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <div className="text-[7px] font-bold tracking-[0.3em] text-white/25 mb-2">{l}</div>
            <div className={`text-lg font-black bg-gradient-to-r ${grad} bg-clip-text text-transparent leading-none`}>{v}</div>
            {u && <div className="text-[8px] text-white/20 mt-1">{u}</div>}
          </div>
        ))}
      </div>

      <SectionHeader color="text-rose-400">HR ZONES</SectionHeader>
      <Card>
        {zones.map((z, i) => (
          <div key={z.z} className={`flex items-center py-2.5 px-1 ${i < 5 ? "border-b border-white/5" : ""}`}>
            <div className={`w-2 h-2 rounded-full ${z.bg} mr-3 flex-shrink-0`} />
            <div className={`flex-1 text-[10px] font-bold tracking-[0.2em] ${i < 2 ? "text-white/30" : "text-white/80"}`}>Z{z.z} {z.n}</div>
            <div className={`font-black text-sm ${z.c}`}>{z.min}–{z.max} <span className="text-[9px] font-normal text-white/20">BPM</span></div>
          </div>
        ))}
      </Card>

      <SectionHeader color="text-amber-400">{T.pacing.segs}</SectionHeader>
      {segs.map((seg, i) => (
        <div key={i} className={`rounded-2xl border p-4 transition-all ${elevColor(seg.elev)}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-black tracking-[0.2em] ${elevAccent(seg.elev)} opacity-60`}>{String(i + 1).padStart(2, "0")}</span>
            <button onClick={() => setSegs(s => s.filter((_, j) => j !== i))} className="text-white/15 hover:text-red-400 transition text-sm">✕</button>
          </div>
          <Input label={T.pacing.segName} value={seg.name} onChange={v => setSegs(s => s.map((x, j) => j === i ? { ...x, name: v } : x))} />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Input label={T.pacing.segDist} value={seg.dist} onChange={v => setSegs(s => s.map((x, j) => j === i ? { ...x, dist: v } : x))} type="number" />
            <div>
              <label className="block text-[10px] font-bold tracking-[0.25em] text-white/40 uppercase mb-1.5">{T.pacing.segElev}</label>
              <div className="flex gap-2">
                {[["flat", "→", "bg-white/10 text-white border-white/20"], ["up", "↑", "bg-orange-500/20 text-orange-400 border-orange-500/40"], ["down", "↓", "bg-emerald-400/20 text-emerald-300 border-emerald-400/40"]].map(([v, ico, cls]) => (
                  <button key={v} onClick={() => setSegs(s => s.map((x, j) => j === i ? { ...x, elev: v } : x))} className={`flex-1 py-3 rounded-xl text-base font-bold transition-all border ${seg.elev === v ? cls : "bg-white/5 border-white/5 text-white/15"}`}>
                    {ico}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button onClick={() => setSegs(s => [...s, { name: `SEGMENT ${s.length + 1}`, dist: "3", elev: "flat" }])} className="w-full rounded-xl border border-dashed border-white/10 py-3.5 text-xs font-bold tracking-[0.2em] text-white/30 hover:border-amber-400/30 hover:text-amber-400/60 transition">
        {T.pacing.addSeg}
      </button>
      <button onClick={genPlan} className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 py-4 text-sm font-black tracking-[0.2em] text-black shadow-xl shadow-orange-500/25 hover:-translate-y-0.5 transition-all">
        ⚡ {T.pacing.generate}
      </button>

      {plan && (
        <>
          <div className="h-px bg-gradient-to-r from-orange-500/40 via-amber-400/20 to-transparent" />

          <SectionHeader color="text-orange-400">{T.pacing.runwalk}</SectionHeader>
          <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 p-[1px]">
            <div className="rounded-2xl bg-black p-5">
              <div className="text-lg font-black tracking-[0.15em] text-white">{rwProtocol(weekly)}</div>
              <div className="text-[10px] tracking-[0.2em] text-white/30 mt-1">WEEKLY MILEAGE: {weekly.toFixed(1)} KM</div>
            </div>
          </div>

          <SectionHeader color="text-emerald-400">{T.pacing.result}</SectionHeader>
          {plan.map((seg, i) => (
            <Card key={i} className={elevColor(seg.elev)}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[9px] tracking-[0.25em] text-white/25">{String(i + 1).padStart(2, "0")} · {seg.st}</div>
                  <div className="text-base font-black tracking-wide text-white mt-0.5">{seg.name}</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-black leading-none ${elevAccent(seg.elev)}`}>{fmtP(seg.pace)}</div>
                  <div className="text-[8px] tracking-[0.2em] text-white/25 mt-1">/KM</div>
                </div>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-[0.15em] border ${seg.elev === "up" ? "border-orange-400/30 text-orange-400" : seg.elev === "down" ? "border-emerald-400/30 text-emerald-300" : "border-white/10 text-white/40"}`}>{seg.elev.toUpperCase()} {seg.dist}KM</span>
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-[0.15em] border border-white/5 text-white/30">{fmtT(seg.time)}</span>
                <span className="text-[9px] tracking-[0.15em] text-white/20">Z{seg.zt?.z} {seg.zt?.n}</span>
              </div>
            </Card>
          ))}

          <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 p-[1px]">
            <div className="rounded-2xl bg-black p-5">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[9px] tracking-[0.25em] text-orange-400 mb-1">TOTAL · EST FINISH</div>
                  <div className="text-4xl font-black text-white">{addM(P.startTime, plan.reduce((s, seg) => s + seg.time, 0))}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] tracking-[0.25em] text-white/30 mb-1">AVG PACE</div>
                  <div className="text-xl font-black text-white">{fmtP(base)}/KM</div>
                  <div className="text-xs text-white/30 mt-0.5">{fmtT(plan.reduce((s, seg) => s + seg.time, 0))}</div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => setStep(2)} className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 py-4 text-sm font-black tracking-[0.2em] text-black shadow-xl shadow-emerald-500/25 hover:-translate-y-0.5 transition-all">
            {lang === "ID" ? "LANJUT KE HIDRASI →" : "NEXT: HYDRATION →"}
          </button>
        </>
      )}
    </div>
  );

  // ── PAGE 2: HYDRATION ──
  const PageHydration = () => (
    <div className="space-y-5">
      <SectionHeader color="text-cyan-400">{T.hydration.title}</SectionHeader>

      <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">💧</div>
          <p className="text-xs font-bold tracking-[0.15em] text-orange-300 leading-relaxed">{T.hydration.warning}</p>
        </div>
      </div>

      <SectionHeader color="text-amber-400">{lang === "ID" ? "INVENTORI NUTRISI" : "NUTRITION INVENTORY"}</SectionHeader>

      {[
        ["saltcaps", T.hydration.saltcaps, "🧂", "from-white to-gray-200"],
        ["gel", T.hydration.gel, "⚡", "from-amber-400 to-orange-400"],
        ["dates", T.hydration.dates, "🌴", "from-amber-700 to-amber-500"],
        ["isotonic", T.hydration.isotonic, "🥤", "from-cyan-400 to-blue-400"],
        ["water", T.hydration.water, "💧", "from-blue-300 to-blue-500"],
      ].map(([k, label, emoji, grad]) => (
        <div key={k} className="flex items-center justify-between py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-xl">{emoji}</span>
            <div>
              <div className="text-sm font-bold tracking-wide text-white">{label}</div>
              <div className="text-[8px] tracking-[0.2em] text-white/20 mt-0.5">{T.hydration.unit}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setAm(k, Math.max(0, (parseInt(ammo[k]) || 0) - 1))} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-bold flex items-center justify-center hover:bg-white/10 transition">−</button>
            <div className={`text-2xl font-black min-w-[32px] text-center bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{ammo[k] || 0}</div>
            <button onClick={() => setAm(k, (parseInt(ammo[k]) || 0) + 1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-bold flex items-center justify-center hover:bg-white/10 transition">+</button>
          </div>
        </div>
      ))}

      <button onClick={genHyd} className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 text-sm font-black tracking-[0.2em] text-black shadow-xl shadow-cyan-500/25 hover:-translate-y-0.5 transition-all">
        💧 {T.hydration.generate}
      </button>

      {hyd && (
        <>
          <div className="h-px bg-gradient-to-r from-cyan-400/40 to-transparent" />
          <SectionHeader color="text-cyan-400">{T.hydration.schedule}</SectionHeader>

          {hyd.map((cp, i) => (
            <Card key={i} className="border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[9px] tracking-[0.25em] text-white/25 mb-1">{cp.t}</div>
                  <div className="text-sm font-bold tracking-wide text-white leading-relaxed">{cp.action}</div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[9px] font-bold tracking-[0.15em] ${badgeColor(cp.type)}`}>{cp.badge}</span>
              </div>
              <div className="text-xs font-black tracking-[0.2em] text-orange-400 mt-2">{cp.km}</div>
            </Card>
          ))}

          <Card className="border-white/5">
            <div className="text-[9px] font-bold tracking-[0.3em] text-white/30 mb-3">{T.hydration.reserve}</div>
            <div className="space-y-2 text-sm text-white/50 leading-relaxed">
              {(lang === "ID"
                ? ["🧂 1 SALT CAP EXTRA DI SAKU", "⚡ 1 GEL DARURAT (simpan sampai KM 17)", "💧 MINUM AIR JIKA PUSING / KRAM"]
                : ["🧂 1 EXTRA SALT CAP IN POCKET", "⚡ 1 EMERGENCY GEL (keep until KM 17)", "💧 DRINK WATER IF DIZZY / CRAMPING"]
              ).map(item => <div key={item}>{item}</div>)}
            </div>
          </Card>

          <button onClick={() => setStep(3)} className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 py-4 text-sm font-black tracking-[0.2em] text-black shadow-xl shadow-orange-500/25 hover:-translate-y-0.5 transition-all">
            {lang === "ID" ? "LIHAT RACE PLAN →" : "VIEW RACE PLAN →"}
          </button>
        </>
      )}
    </div>
  );

  // ── PAGE 3: RESULTS ──
  const PageResults = () => {
    const totalTime = plan ? plan.reduce((s, seg) => s + seg.time, 0) : 0;
    const estFinish = plan ? addM(P.startTime, totalTime) : "—";
    return (
      <div className="space-y-5">
        <SectionHeader>{T.results.title}</SectionHeader>

        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 p-6">
            <div className="text-[8px] tracking-[0.3em] text-black/40 mb-2">RACE PLAN · {new Date().toISOString().slice(0, 10)}</div>
            <div className="text-3xl font-black text-black tracking-wide leading-none">{P.name || "RUNNER"}</div>
          </div>
          <div className="grid grid-cols-3 gap-[1px] bg-white/5">
            {[
              [T.results.finish, estFinish, "text-white"],
              [T.results.total, plan ? fmtT(totalTime) : "—", "text-orange-400"],
              [T.results.avg, plan ? `${fmtP(base)}/KM` : "—", "text-emerald-300"],
            ].map(([l, v, c]) => (
              <div key={l} className="bg-black/80 p-4 text-center">
                <div className="text-[7px] tracking-[0.3em] text-white/25 mb-2">{l}</div>
                <div className={`text-lg font-black ${c}`}>{v}</div>
              </div>
            ))}
          </div>
          <div className="bg-black/80 border-t border-dashed border-white/10 px-5 py-3 flex justify-between items-center">
            <div className="text-[9px] tracking-[0.2em] text-white/20">{totalDist.toFixed(2)} KM · START {P.startTime}</div>
            <div className="text-[9px] tracking-[0.3em] text-orange-400/60 font-bold">RUNLAB</div>
          </div>
        </div>

        {plan && (
          <>
            <SectionHeader color="text-amber-400">{T.results.pacing}</SectionHeader>
            {plan.map((seg, i) => (
              <div key={i} className="flex justify-between items-center py-3 px-1 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-7 rounded-full ${seg.elev === "up" ? "bg-orange-500" : seg.elev === "down" ? "bg-emerald-400" : "bg-white/10"}`} />
                  <div>
                    <div className="text-xs font-bold tracking-wide text-white">{seg.name}</div>
                    <div className="text-[9px] tracking-[0.15em] text-white/20">{seg.st} · {seg.dist}KM</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-base font-black ${elevAccent(seg.elev)}`}>{fmtP(seg.pace)}</div>
                  <div className="text-[9px] tracking-[0.15em] text-white/20">{fmtT(seg.time)}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {hyd && (
          <>
            <div className="h-px bg-gradient-to-r from-cyan-400/30 to-transparent" />
            <SectionHeader color="text-cyan-400">{T.results.hydration}</SectionHeader>
            {hyd.map((cp, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 px-1 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold tracking-wider ${badgeColor(cp.type)}`}>{cp.badge}</span>
                  <div className="text-xs font-semibold text-white/80">{cp.action}</div>
                </div>
                <div className="text-[9px] tracking-[0.15em] text-white/25 whitespace-nowrap ml-3">{cp.t}</div>
              </div>
            ))}
          </>
        )}

        {!plan && !hyd && (
          <div className="py-12 text-center">
            <div className="text-5xl mb-4">🏃</div>
            <p className="text-xs tracking-[0.2em] text-white/25 leading-loose whitespace-pre-line">
              {lang === "ID" ? "GENERATE PACING DAN HIDRASI TERLEBIH DAHULU\nUNTUK MELIHAT RACE PLAN LENGKAP." : "GENERATE PACING AND HYDRATION FIRST\nTO VIEW YOUR COMPLETE RACE PLAN."}
            </p>
            <button onClick={() => setStep(1)} className="mt-6 rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-xs font-bold tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/10 transition">
              {lang === "ID" ? "← KEMBALI KE PACING" : "← BACK TO PACING"}
            </button>
          </div>
        )}

        {(plan || hyd) && (
          <button onClick={() => window.print()} className="w-full rounded-2xl bg-white py-4 text-sm font-black tracking-[0.2em] text-black hover:scale-[1.01] transition-all">
            ⬇ {T.results.save}
          </button>
        )}

        <div className="pt-6 text-center">
          <div className="text-[8px] tracking-[0.3em] text-white/10">RUNLAB · TRAIN SMART. RACE SMARTER.</div>
          <div className="text-[7px] tracking-[0.2em] text-white/5 mt-1">andriylegality · Balikpapan, Indonesia</div>
        </div>
      </div>
    );
  };

  // ── RENDER ──
  return (
    <div className="min-h-screen bg-black text-white relative" style={{ fontFamily: "'Barlow', 'Barlow Condensed', sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/[0.06] rounded-full blur-[100px]" />
      </div>
      <div className="relative max-w-lg mx-auto pb-24">
        <Header />
        <Nav />
        <div className="px-5 pt-2">
          {step === 0 && <PageProfile />}
          {step === 1 && <PagePacing />}
          {step === 2 && <PageHydration />}
          {step === 3 && <PageResults />}
        </div>
      </div>
    </div>
  );
}
