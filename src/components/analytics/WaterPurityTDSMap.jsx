import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { mockBahawalpurSectors } from '../../data/mock/analytics.mock'
import {
  Gauge,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Info,
  Calendar,
  Send,
  Droplet,
  ArrowUpRight,
} from 'lucide-react'

export default function WaterPurityTDSMap() {
  const [selectedSector, setSelectedSector] = useState(mockBahawalpurSectors[0])
  const [filterPurity, setFilterPurity] = useState('all') // 'all' | 'severe' | 'moderate' | 'optimal'

  const filteredSectors = mockBahawalpurSectors.filter((s) => {
    if (filterPurity === 'all') return true
    if (filterPurity === 'severe') return s.purityCategory.includes('Severe') || s.purityCategory.includes('High')
    if (filterPurity === 'moderate') return s.purityCategory === 'Moderate'
    if (filterPurity === 'optimal') return s.purityCategory === 'Optimal'
    return true
  })

  // City-wide aggregated stats
  const cityAvgTds = Math.round(
    mockBahawalpurSectors.reduce((sum, s) => sum + s.avgTdsPpm, 0) / mockBahawalpurSectors.length
  )
  const totalMonitoredPlants = mockBahawalpurSectors.reduce((sum, s) => sum + s.activePlants, 0)

  return (
    <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden text-left font-sans">
      <CardHeader className="p-5 pb-4 border-b border-border/60 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold font-outfit">
                Bahawalpur Water Purity & TDS Intelligence Map
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Sector-by-sector municipal ground water hardness tracking, filter life decay rates, and plant density.
            </CardDescription>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border border-border/60 text-xs">
            {[
              { id: 'all', label: 'All Sectors' },
              { id: 'severe', label: '🚨 Hardness Risk' },
              { id: 'moderate', label: '🟡 Moderate' },
              { id: 'optimal', label: '🟢 Optimal' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterPurity(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterPurity === tab.id
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* City Overview KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          <div className="p-2.5 bg-background rounded-xl border border-border/60 space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">City Average TDS</span>
            <div className="text-base font-bold font-mono text-amber-600 font-outfit">{cityAvgTds} PPM</div>
            <div className="text-[10px] text-muted-foreground">Groundwater Hardness</div>
          </div>
          <div className="p-2.5 bg-background rounded-xl border border-border/60 space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Active Units</span>
            <div className="text-base font-bold font-mono text-primary font-outfit">{totalMonitoredPlants} Plants</div>
            <div className="text-[10px] text-muted-foreground">Installed & Monitored</div>
          </div>
          <div className="p-2.5 bg-background rounded-xl border border-border/60 space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Highest Hardness</span>
            <div className="text-base font-bold font-mono text-rose-600 font-outfit">1,420 PPM</div>
            <div className="text-[10px] text-muted-foreground">Industrial Estate Corridor</div>
          </div>
          <div className="p-2.5 bg-background rounded-xl border border-border/60 space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">RO Output Purity</span>
            <div className="text-base font-bold font-mono text-emerald-600 font-outfit">28 PPM</div>
            <div className="text-[10px] text-muted-foreground">96.4% Salt Rejection</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Main Grid: Sector Matrix on Left + Active Sector Deep-Dive on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Sector Matrix Grid (8 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredSectors.map((sector) => {
              const isSelected = selectedSector.id === sector.id
              return (
                <div
                  key={sector.id}
                  onClick={() => setSelectedSector(sector)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 relative ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                      : 'border-border/70 bg-card hover:bg-muted/30 hover:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs font-outfit text-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{sector.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{sector.zone}</span>
                    </div>
                    <Badge
                      variant={
                        sector.badgeVariant === 'success'
                          ? 'success'
                          : sector.badgeVariant === 'warning'
                          ? 'warning'
                          : 'destructive'
                      }
                      className="text-[10px] font-mono px-2 py-0.5"
                    >
                      {sector.avgTdsPpm} PPM
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground border-t border-border/50">
                    <span>{sector.activePlants} active units</span>
                    <span className="font-semibold text-foreground">
                      Cycle: ~{sector.avgFilterLifeDays}d
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Detailed Sector Inspection Panel (5 cols) */}
          <div className="lg:col-span-5 p-4.5 rounded-2xl bg-muted/30 border border-border/80 space-y-4">
            <div className="space-y-1 pb-3 border-b border-border/70">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Inspecting Sector:
                </span>
                <Badge
                  variant={
                    selectedSector.badgeVariant === 'success'
                      ? 'success'
                      : selectedSector.badgeVariant === 'warning'
                      ? 'warning'
                      : 'destructive'
                  }
                  className="text-[10px] font-bold uppercase"
                >
                  {selectedSector.purityCategory}
                </Badge>
              </div>
              <h3 className="text-lg font-bold font-outfit text-foreground flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{selectedSector.name}</span>
              </h3>
              <p className="text-xs text-muted-foreground">{selectedSector.zone} • Bahawalpur</p>
            </div>

            {/* Metric Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/60">
                <span className="text-muted-foreground">Groundwater Hardness</span>
                <span className="font-bold font-mono text-sm text-foreground">{selectedSector.avgTdsPpm} PPM</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/60">
                <span className="text-muted-foreground">Filter Life Expectancy</span>
                <span className="font-bold text-foreground">{selectedSector.avgFilterLifeDays} Days</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/60">
                <span className="text-muted-foreground">Customer Retention Rate</span>
                <span className="font-bold text-emerald-600">{selectedSector.retentionRate}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/60">
                <span className="text-muted-foreground">Active Filtration Units</span>
                <span className="font-bold text-foreground">{selectedSector.activePlants} Units</span>
              </div>
            </div>

            {/* Recommended Technical Equipment */}
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                Prescribed Engineering Configuration:
              </span>
              <div className="text-xs font-bold text-foreground font-outfit">
                {selectedSector.recommendedTech}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Groundwater parameters require reinforced booster pump seals and high-iodine CTO carbon block stages.
              </p>
            </div>

            {/* Actions for this sector */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                className="flex-1 text-xs font-bold font-outfit rounded-xl gap-1.5"
                onClick={() => alert(`Service Van allocated for ${selectedSector.name}`)}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Deploy Service Van</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Legend Ribbon */}
        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-foreground">Hardness Index:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Optimal (&lt;300 PPM)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Moderate (300–500 PPM)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Severe (&gt;500 PPM)</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            Sensor sync: Model Town B Laboratory • Updated every 24 hrs
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
