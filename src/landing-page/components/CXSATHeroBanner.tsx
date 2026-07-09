/**
 * CXSATHeroBanner — Dashboard preview animé (remplace les SVG Open SaaS)
 * Un tableau de bord CXSAT simplifié, illustrant KPIs + graphique + alertes.
 */
export function CXSATHeroBanner() {
  return (
    <div
      className="
        w-full max-w-5xl overflow-hidden rounded-2xl
        border border-slate-200 bg-white shadow-2xl
        ring-1 ring-slate-900/5
        dark:border-slate-700 dark:bg-slate-900
      "
      aria-label="Aperçu du tableau de bord CXSAT"
    >
      {/* Barre de titre simulée (macOS style) */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-red-400" />
          <div className="size-3 rounded-full bg-yellow-400" />
          <div className="size-3 rounded-full bg-green-400" />
        </div>
        <div className="mx-auto flex items-center gap-2 text-xs text-slate-500">
          <svg className="size-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z"/>
          </svg>
          <span className="font-medium">cxsat.ci/dashboard</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-48 shrink-0 border-r border-slate-200 bg-slate-50 p-4 md:block dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500">
              <svg className="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">CXSAT</span>
          </div>
          {[
            { label: "Tableau de bord", active: true },
            { label: "Guichets", active: false },
            { label: "Planning", active: false },
            { label: "Personnel", active: false },
            { label: "Alertes & Tâches", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`mb-1 rounded-lg px-3 py-2 text-[11px] font-medium ${
                item.active
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {item.label}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-5 space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Satisfaction", value: "87%", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "😊" },
              { label: "Total Avis", value: "1 248", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", icon: "💬" },
              { label: "Note Moy.", value: "4.2/5", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", icon: "⭐" },
              { label: "Alertes", value: "3", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", icon: "🚨" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className={`rounded-xl border border-slate-200 ${kpi.bg} p-3 dark:border-slate-700`}
              >
                <div className="text-lg">{kpi.icon}</div>
                <div className={`mt-1 text-lg font-black ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Chart area (faux graphique barres) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Évolution mensuelle</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">12 mois</span>
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {[60, 72, 65, 80, 75, 90, 85, 92, 78, 88, 95, 87].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${h}%`,
                    background: i === 11
                      ? "linear-gradient(to top, hsl(32,100%,37%), hsl(33,74%,62%))"
                      : "hsl(220,13%,91%)",
                  }}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-slate-400">
              <span>Jan</span><span>Avr</span><span>Juil</span><span>Oct</span><span>Déc</span>
            </div>
          </div>

          {/* Alertes row */}
          <div className="grid gap-2">
            {[
              { guichet: "Caisse 3 — Marcory", message: "Note critique : 1/5 reçue", time: "il y a 4 min", color: "border-l-red-400" },
              { guichet: "Accueil — Plateau", message: "Note critique : 2/5 reçue", time: "il y a 28 min", color: "border-l-orange-400" },
            ].map((alert, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-lg border border-slate-200 border-l-4 ${alert.color} bg-white px-3 py-2 text-[11px] dark:border-slate-700 dark:bg-slate-800`}
              >
                <div>
                  <div className="font-semibold text-slate-700 dark:text-slate-200">{alert.guichet}</div>
                  <div className="text-slate-500">{alert.message}</div>
                </div>
                <span className="shrink-0 text-slate-400">{alert.time}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
