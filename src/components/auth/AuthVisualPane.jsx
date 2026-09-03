import React from 'react'
import DrAquaLogo from '../ui/DrAquaLogo'
import {
  Factory,
  Home,
  Activity,
  MapPin,
  CheckCircle2,
  Gauge,
  Sparkles,
} from 'lucide-react'

export default function AuthVisualPane() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-12 overflow-hidden bg-gradient-to-br from-[#0b1329] via-[#081a2e] to-[#04243a] text-white select-none border-r border-slate-800/80">
      {/* Ambient background glow & water mesh effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Branding Section with Official Logo */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg inline-flex items-center">
            <DrAquaLogo size="default" useImage={false} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ops Hub v2.5.0</span>
          </div>
        </div>
      </div>

      {/* Main Content: Industrial & Domestic Water Intelligence Section */}
      <div className="relative z-10 space-y-6 my-auto py-6 max-w-xl">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold font-outfit uppercase tracking-wider text-cyan-400">
            <Activity className="w-4 h-4" />
            <span>Industrial & Domestic Water Intelligence</span>
          </div>
          <h2 className="text-2xl xl:text-3xl font-extrabold font-outfit tracking-tight text-slate-100 leading-snug">
            Engineered Water Purity, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-teal-300">
              Commercial & Domestic Command.
            </span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Centralized intelligence platform tracking groundwater salinity, automated service schedules, POS counter transactions, and field service deployments across Bahawalpur.
          </p>
        </div>

        {/* Dual Domain Columns: Industrial vs. Domestic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Industrial Systems Card */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm space-y-2 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs font-outfit">
                <Factory className="w-4 h-4 text-cyan-400" />
                <span>Industrial Plants</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                500–2,000 GPD
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>Commercial SS304 skid RO plants</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>20" Jumbo Big Blue 2-stage filtration</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>Factory & school heavy TDS rejection</span>
              </li>
            </ul>
          </div>

          {/* Domestic Filtration Card */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm space-y-2 hover:border-sky-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-xs font-outfit">
                <Home className="w-4 h-4 text-sky-400" />
                <span>Domestic Systems</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                100 GPD / 5-Stage
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>Residential RO with iron stand & booster</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>Under-sink modular systems (Aspire series)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>3-Stage sediment & carbon block pre-filters</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Live Territorial Water Hardness Telemetry (Bahawalpur) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-950/90 border border-cyan-500/20 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-bold font-outfit">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>Bahawalpur Municipal Groundwater Hardness</span>
            </div>
            <span className="text-[10px] text-cyan-300 font-mono">Real-time Readings</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-slate-400 font-medium truncate">Model Town</div>
              <div className="text-amber-400 font-bold font-mono text-xs">340 ppm</div>
              <div className="text-[9px] text-slate-400">Moderate</div>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-slate-400 font-medium truncate">DHA Phase 5</div>
              <div className="text-emerald-400 font-bold font-mono text-xs">180 ppm</div>
              <div className="text-[9px] text-slate-400">Optimal</div>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-slate-400 font-medium truncate">Satellite Town</div>
              <div className="text-rose-400 font-bold font-mono text-xs">580 ppm</div>
              <div className="text-[9px] text-slate-400">High Hard</div>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-slate-400 font-medium truncate">Industrial Est.</div>
              <div className="text-rose-500 font-bold font-mono text-xs">890 ppm</div>
              <div className="text-[9px] text-slate-400">Severe</div>
            </div>
          </div>
        </div>

        {/* Live Operational Metrics Ribbon */}
        <div className="flex items-center justify-between text-xs pt-1 text-slate-300">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Membrane Rejection: <strong className="text-white">96.4%</strong></span>
          </div>
          <span className="text-slate-600">•</span>
          <div>Purified Volume: <strong className="text-white">4.8M Liters</strong></div>
          <span className="text-slate-600">•</span>
          <div>Active Plants: <strong className="text-white">1,226 Units</strong></div>
        </div>
      </div>

      {/* Bottom Territorial Ops Badge */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-200 font-medium">Head Office & Central Warehouse</span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Model Town B, Bahawalpur</span>
        </div>
      </div>
    </div>
  )
}
