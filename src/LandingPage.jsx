import { useState, useEffect } from 'react';

const stats = [
  { value: "5K–42K", label: "Distance Range", icon: "🏃" },
  { value: "AI", label: "Pace Engine", icon: "⚡" },
  { value: "Real-time", label: "Hydration Plan", icon: "💧" },
  { value: "6 Zones", label: "HR Training", icon: "❤️" },
];

const features = [
  { title: "Race Predictor", desc: "Prediksi finish time dan optimal pace berdasarkan VO2Max, HR zones, dan data latihan terakhir kamu.", icon: "🎯", color: "from-[#00FF87] to-[#00D4FF]" },
  { title: "Hydration Engine", desc: "Jadwal minum otomatis berdasarkan jarak, cuaca, dan inventori nutrisi — salt caps, gel, isotonic.", icon: "💧", color: "from-[#00D4FF] to-[#7B61FF]" },
  { title: "Segment Pacing", desc: "Atur pace per-segmen rute. Tanjakan, turunan, flat — masing-masing diperhitungkan secara presisi.", icon: "📊", color: "from-[#FF6B00] to-[#FF2D78]" },
  { title: "Mobile Cockpit", desc: "Tampilan tajam di HP, tablet, dan desktop. Bisa diakses saat race briefing tanpa ribet.", icon: "📱", color: "from-[#FF2D78] to-[#FF6B00]" },
];

const pacingBands = [
  { range: "KM 1–5", pace: "5:15", note: "Easy settle-in", pct: 60 },
  { range: "KM 6–15", pace: "5:08", note: "Hold rhythm", pct: 75 },
  { range: "KM 16–21", pace: "4:58", note: "Final push", pct: 90 },
];

export default function LandingPage({ onLaunch }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#00FF87]/[0.07] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#00D4FF]/[0.05] rounded-full blur-[130px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-[#FF6B00]/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* NAV */}
      <nav className={`relative z-50 mx-auto max-w-7xl px-6 py-5 md:px-10 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
        <div className="flex items-center justify-between rounded-2xl glass-strong px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FF87] to-[#00D4FF] flex items-center justify-center">
              <span className="text-black text-xs font-black">R</span>
            </div>
            <div>
              <div className="text-lg font-black tracking-[0.15em] leading-none">RUNLAB</div>
              <div className="text-[8px] tracking-[0.3em] text-white/30">RACE INTELLIGENCE</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/50 hover:text-white transition">Features</a>
            <a href="#dashboard" className="text-sm text-white/50 hover:text-white transition">Dashboard</a>
            <a href="#strategy" className="text-sm text-white/50 hover:text-white transition">Strategy</a>
            <button onClick={onLaunch} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00FF87] to-[#00D4FF] text-black text-sm font-bold hover:scale-105 transition-transform glow-green">
              Start Now
            </button>
          </div>
          <button onClick={onLaunch} className="md:hidden px-4 py-2 rounded-lg bg-[#00FF87] text-black text-xs font-bold">Start</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 pt-8 md:pt-16 pb-16">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <div>
            <div className={`transition-all duration-700 delay-100 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse-neon" />
                <span className="text-xs tracking-[0.15em] text-white/60">RACE-DAY READY • PACE • HYDRATE • WIN</span>
              </div>
            </div>

            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <span className="text-white">RUN</span>
              <span className="gradient-text-neon">LAB</span>
              <span className="block text-3xl md:text-5xl lg:text-6xl mt-2 text-white/80 font-extrabold">Race Intelligence</span>
              <span className="block text-3xl md:text-5xl lg:text-6xl gradient-text-fire font-extrabold">for Serious Runners.</span>
            </h1>

            <p className={`mt-6 text-base md:text-lg text-white/40 max-w-xl leading-relaxed transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              Personalized pacing, hydration strategy, dan HR zone management — semua dalam satu cockpit yang didesain untuk race day.
            </p>

            <div className={`mt-8 flex flex-wrap gap-4 transition-all duration-700 delay-[400ms] ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <button onClick={onLaunch} className="group px-7 py-4 rounded-2xl bg-gradient-to-r from-[#00FF87] to-[#00D4FF] text-black font-bold text-sm tracking-wide shadow-2xl shadow-[#00FF87]/20 hover:shadow-[#00FF87]/40 hover:-translate-y-1 transition-all">
                Launch Dashboard
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <a href="#features" className="px-7 py-4 rounded-2xl glass text-white/70 font-semibold text-sm hover:bg-white/[0.06] transition">
                Explore Features
              </a>
            </div>

            {/* Mini stats */}
            <div className={`mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              {stats.map((s, i) => (
                <div key={s.label} className="glass rounded-2xl p-4 hover:bg-white/[0.05] transition group">
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-xl font-black text-neon-green font-mono-num">{s.value}</div>
                  <div className="text-[10px] tracking-[0.15em] text-white/30 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard preview card */}
          <div className={`relative transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
            <div className="absolute -inset-4 bg-gradient-to-br from-[#00FF87]/10 to-[#00D4FF]/5 rounded-[40px] blur-xl" />
            <div className="relative rounded-[28px] glass-strong p-5 glow-green">
              <div className="rounded-[22px] bg-[#0A0A0F] border border-white/5 p-5">
                {/* Dashboard header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[10px] tracking-[0.25em] text-white/30">RACE DASHBOARD</div>
                    <div className="text-xl font-bold mt-1">Balikpapan Half</div>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/20 text-[#00FF87] text-xs font-bold tracking-wide animate-pulse-neon">● READY</div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-[#00FF87]/10 to-[#00D4FF]/5 border border-[#00FF87]/20 p-4">
                    <div className="text-[9px] tracking-[0.2em] text-white/30">TARGET FINISH</div>
                    <div className="text-3xl font-black font-mono-num text-neon-green mt-1">1:48:20</div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#00FF87] to-[#00D4FF]" />
                    </div>
                  </div>
                  <div className="rounded-xl glass p-4">
                    <div className="text-[9px] tracking-[0.2em] text-white/30">AVG PACE</div>
                    <div className="text-3xl font-black font-mono-num text-white mt-1">5:08</div>
                    <div className="text-xs text-white/30 mt-1">min/km</div>
                  </div>
                  <div className="rounded-xl glass p-4">
                    <div className="text-[9px] tracking-[0.2em] text-white/30">HYDRATION</div>
                    <div className="text-xl font-bold text-neon-blue mt-1">650<span className="text-sm font-normal text-white/30"> ml/hr</span></div>
                  </div>
                  <div className="rounded-xl glass p-4">
                    <div className="text-[9px] tracking-[0.2em] text-white/30">ENERGY GEL</div>
                    <div className="text-xl font-bold text-neon-orange mt-1">Every<span className="text-sm font-normal text-white/30"> 35m</span></div>
                  </div>
                </div>

                {/* Pacing bands */}
                <div className="mt-4 rounded-xl glass p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold tracking-[0.1em] text-white/60">PACING BANDS</div>
                    <div className="text-[10px] text-neon-green tracking-wide font-bold">NEGATIVE SPLIT</div>
                  </div>
                  <div className="space-y-2">
                    {pacingBands.map(b => (
                      <div key={b.range} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-bold text-white/70">{b.range}</span>
                            <span className="text-xs font-bold font-mono-num text-neon-green">{b.pace}</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#00FF87] to-[#00D4FF] transition-all duration-1000" style={{ width: `${b.pct}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 py-16">
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-[0.4em] text-neon-green font-bold mb-3">FEATURES</div>
          <h2 className="text-3xl md:text-5xl font-black">Built for <span className="gradient-text-neon">Performance</span></h2>
          <p className="mt-4 text-white/30 max-w-lg mx-auto">Setiap fitur dirancang untuk satu tujuan: membantumu finish lebih kuat.</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={f.title} className="group glass rounded-3xl p-6 hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section id="dashboard" className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 py-16">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
          <div className="glass rounded-3xl p-6 md:p-8">
            <div className="text-[10px] tracking-[0.4em] text-neon-blue font-bold mb-2">QUICK PLANNER</div>
            <h3 className="text-2xl md:text-3xl font-black mb-2">Build Your Race Plan</h3>
            <p className="text-white/35 text-sm mb-6">Input sederhana, hasil visual yang langsung kebaca.</p>

            {[
              ["Target Distance", "Half Marathon (21.1 km)"],
              ["Goal Time", "1:48:20"],
              ["Weather", "28°C / Humid"],
              ["Experience", "Intermediate"],
            ].map(([label, value]) => (
              <div key={label} className="glass rounded-xl p-4 mb-3">
                <div className="text-[9px] tracking-[0.2em] text-white/25">{label}</div>
                <div className="text-base font-bold mt-1">{value}</div>
              </div>
            ))}

            <button onClick={onLaunch} className="mt-4 w-full py-4 rounded-2xl bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] text-black font-bold text-sm glow-blue hover:scale-[1.01] transition-transform">
              Generate Recommendation →
            </button>
          </div>

          <div id="strategy" className="glass rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[10px] tracking-[0.4em] text-neon-orange font-bold mb-2">INSIGHTS</div>
                <h3 className="text-2xl md:text-3xl font-black">Performance Overview</h3>
              </div>
              <div className="px-3 py-1.5 rounded-full glass text-xs text-white/40">Live Preview</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                ["Effort Score", "82", "+8%", "text-neon-green"],
                ["Heat Risk", "Moderate", "Watch it", "text-neon-orange"],
                ["Best Window", "KM 16+", "Push", "text-neon-blue"],
              ].map(([label, value, sub, color]) => (
                <div key={label} className="glass rounded-xl p-4">
                  <div className="text-[9px] tracking-[0.2em] text-white/25">{label}</div>
                  <div className={`text-xl font-black mt-1 ${color}`}>{value}</div>
                  <div className="text-[10px] text-white/25 mt-1">{sub}</div>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold">Recommended Strategy</div>
                <div className="px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-neon-orange text-[10px] font-bold tracking-wide">RACE SMART</div>
              </div>
              {[
                "Start conservative di 3 km pertama untuk jaga efisiensi jantung dan suhu tubuh.",
                "Masuk pace target setelah ritme stabil, evaluasi effort di tengah race.",
                "Naikkan intensitas di fase akhir jika hydration dan HR masih terkendali.",
              ].map((text, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] mb-2 last:mb-0">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-[#00FF87] flex-shrink-0" />
                  <p className="text-sm text-white/50 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 py-16">
        <div className="rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00FF87]/10 via-[#00D4FF]/5 to-[#FF6B00]/10" />
          <div className="absolute inset-0 glass" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-12">
            <div>
              <div className="text-[10px] tracking-[0.4em] text-neon-green font-bold mb-2">READY TO LAUNCH</div>
              <h2 className="text-3xl md:text-5xl font-black">Race smarter.<br /><span className="gradient-text-neon">Finish stronger.</span></h2>
              <p className="mt-3 text-white/35 max-w-md">Buat race plan personal kamu sekarang — gratis, tanpa login.</p>
            </div>
            <button onClick={onLaunch} className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm hover:scale-105 transition-transform flex-shrink-0 shadow-2xl">
              Launch Dashboard →
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="text-[8px] tracking-[0.4em] text-white/10">RUNLAB · TRAIN SMART. RACE SMARTER.</div>
          <div className="text-[7px] tracking-[0.3em] text-white/5 mt-2">andriylegality · Balikpapan, Indonesia</div>
        </div>
      </section>
    </div>
  );
}
