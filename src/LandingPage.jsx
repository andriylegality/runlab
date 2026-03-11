export default function LandingPage({ onLaunch }) {
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Barlow', 'Barlow Condensed', sans-serif" }}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,106,0,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(0,255,163,0.18),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-12">
          <nav className="mb-12 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div>
              <div className="text-2xl font-black tracking-[0.25em]">RUNLAB</div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/60">Personalized Race Intelligence</div>
            </div>
            <div className="hidden items-center gap-6 text-sm text-white/70 md:flex">
              <a href="#features" className="transition hover:text-white">Features</a>
              <a href="#planner" className="transition hover:text-white">Planner</a>
              <a href="#insights" className="transition hover:text-white">Insights</a>
              <button onClick={onLaunch} className="rounded-full bg-white px-5 py-2 font-semibold text-black transition hover:scale-105">Start Now</button>
            </div>
            {/* Mobile menu button */}
            <button onClick={onLaunch} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black md:hidden">Start</button>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-200">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                Race-Day Ready • Pace • Hydration • Strategy
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-none tracking-tight md:text-7xl">
                Sporty UI untuk
                <span className="block bg-gradient-to-r from-orange-400 via-white to-emerald-300 bg-clip-text text-transparent">
                  Pelari yang Mau Menang.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                RUNLAB membantu pelari mengatur pacing, strategi race, dan hydration plan dengan tampilan modern,
                agresif, dan mudah dipakai di mobile maupun desktop.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button onClick={onLaunch} className="rounded-2xl bg-orange-500 px-6 py-4 text-base font-bold text-black shadow-2xl shadow-orange-500/30 transition hover:-translate-y-0.5">
                  Launch Dashboard
                </button>
                <a href="#features" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10 inline-flex items-center">
                  Explore Features
                </a>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  ["5K–42K", "Distance Support"],
                  ["AI Pace", "Smart Recommendation"],
                  ["Hydration", "Race Fuel Guidance"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="text-2xl font-extrabold text-white">{value}</div>
                    <div className="mt-1 text-sm text-white/55">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-10 h-28 w-28 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="absolute -right-5 bottom-8 h-28 w-28 rounded-full bg-orange-500/20 blur-3xl" />
              <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[28px] border border-white/10 bg-neutral-950 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white/50">Race Dashboard</div>
                      <div className="text-2xl font-bold">Balikpapan Half Marathon</div>
                    </div>
                    <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                      Ready
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-300 p-[1px]">
                      <div className="h-full rounded-2xl bg-black p-4">
                        <div className="text-sm text-white/50">Target Finish</div>
                        <div className="mt-2 text-4xl font-black">1:48:20</div>
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                          <div className="h-2 w-4/5 rounded-full bg-gradient-to-r from-orange-400 to-amber-300" />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm text-white/50">Avg Pace</div>
                      <div className="mt-2 text-4xl font-black">5:08</div>
                      <div className="mt-1 text-sm text-white/55">min/km</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white/50">Hydration</div>
                          <div className="mt-2 text-2xl font-bold">650 ml / hour</div>
                        </div>
                        <div className="text-3xl">💧</div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white/50">Energy Gel</div>
                          <div className="mt-2 text-2xl font-bold">Every 35 min</div>
                        </div>
                        <div className="text-3xl">⚡</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/50">Pacing Bands</div>
                        <div className="text-lg font-semibold">Negative Split Strategy</div>
                      </div>
                      <div className="text-sm text-orange-300">Optimized</div>
                    </div>
                    <div className="space-y-3">
                      {[
                        ["KM 1–5", "5:15 /km", "Easy settle-in"],
                        ["KM 6–15", "5:08 /km", "Hold efficient rhythm"],
                        ["KM 16–21", "4:58 /km", "Strong final push"],
                      ].map(([range, pace, note]) => (
                        <div key={range} className="flex items-center justify-between rounded-xl bg-black/40 px-4 py-3">
                          <div>
                            <div className="font-semibold">{range}</div>
                            <div className="text-sm text-white/45">{note}</div>
                          </div>
                          <div className="text-lg font-bold text-orange-300">{pace}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-8 md:px-10 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-orange-300">Features</div>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">Sporty, Clean, dan Fokus ke Performance</h2>
          </div>
          <div className="max-w-xl text-white/60 md:text-right">
            Desain dibuat untuk terasa cepat, premium, dan kompetitif—dengan kontras tinggi dan visual yang kuat.
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Race Predictor", "Prediksi finish time dan optimal pace berdasarkan target race kamu."],
            ["Hydration Planner", "Rekomendasi cairan per jam berdasarkan cuaca, effort, dan durasi."],
            ["Fuel Strategy", "Pengingat gel, sodium, dan timing nutrisi sebelum dan saat race."],
            ["Mobile First", "Tampilan tajam, besar, dan nyaman dipakai cepat saat race briefing."],
          ].map(([title, desc]) => (
            <div key={title} className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-orange-400/40 hover:bg-white/10">
              <div className="mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500/80 to-amber-300/80" />
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-white/65">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="planner" className="mx-auto max-w-7xl px-6 py-8 md:px-10 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-[0.3em] text-emerald-300">Quick Planner</div>
            <h3 className="mt-3 text-3xl font-black">Build Your Race Plan</h3>
            <p className="mt-3 text-white/65">Input sederhana dengan hasil visual yang langsung kebaca.</p>

            <div className="mt-6 space-y-4">
              {[
                ["Target Distance", "Half Marathon"],
                ["Goal Time", "1:48:20"],
                ["Weather", "28°C / Humid"],
                ["Experience Level", "Intermediate"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-sm text-white/45">{label}</div>
                  <div className="mt-1 text-lg font-semibold">{value}</div>
                </div>
              ))}
            </div>

            <button onClick={onLaunch} className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-4 font-bold text-black transition hover:scale-[1.01]">
              Generate Recommendation
            </button>
          </div>

          <div id="insights" className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.3em] text-orange-300">Insights</div>
                <h3 className="mt-3 text-3xl font-black">Performance Overview</h3>
              </div>
              <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60">Live Preview</div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["Effort Score", "82", "+8%"],
                ["Heat Risk", "Moderate", "Watch hydration"],
                ["Best Window", "KM 16+", "Push phase"],
              ].map(([label, value, sub]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-sm text-white/45">{label}</div>
                  <div className="mt-2 text-2xl font-black">{value}</div>
                  <div className="mt-1 text-sm text-white/55">{sub}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-lg font-bold">Recommended Strategy</div>
                <div className="rounded-full bg-orange-500/10 px-3 py-1 text-sm text-orange-300">Race Smart</div>
              </div>
              <div className="space-y-4">
                {[
                  "Start conservative di 3 km pertama untuk menjaga efisiensi jantung dan suhu tubuh.",
                  "Masuk pace target setelah ritme stabil, lalu evaluasi effort di tengah race.",
                  "Naikkan intensitas di fase akhir jika hydration dan HR masih terkendali.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl bg-white/5 p-4">
                    <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-300" />
                    <p className="leading-7 text-white/70">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-12">
        <div className="rounded-[32px] border border-orange-400/20 bg-gradient-to-r from-orange-500/15 via-white/5 to-emerald-400/10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-orange-300">Ready to Launch</div>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">Race smarter. Finish stronger.</h2>
              <p className="mt-4 max-w-2xl text-white/70">
                Buat race plan personal kamu sekarang — gratis, tanpa login.
              </p>
            </div>
            <button onClick={onLaunch} className="rounded-2xl bg-white px-6 py-4 text-base font-bold text-black transition hover:scale-105 flex-shrink-0">
              Launch Dashboard →
            </button>
          </div>
        </div>

        <div className="mt-10 text-center">
          <div className="text-xs tracking-[0.3em] text-white/20">RUNLAB · TRAIN SMART. RACE SMARTER.</div>
          <div className="mt-2 text-xs tracking-[0.2em] text-white/10">andriylegality · Balikpapan, Indonesia</div>
        </div>
      </section>
    </div>
  );
}
