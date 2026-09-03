import React, { useEffect, useRef, useState } from 'react'
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import WaterPurityTDSMap from './analytics/WaterPurityTDSMap'
import { mockMultiPeriodTrends } from '../data/mock/analytics.mock'
import {
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  Store,
  Droplet,
} from 'lucide-react'

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
)

export default function SalesDashboard({ sales = [] }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [period, setPeriod] = useState('weekly') // 'weekly' | 'monthly' | 'quarterly'

  // Calculations from real sales data
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0)
  const now = new Date()
  const todayStr = now.toDateString()

  const todaySales = sales
    .filter((s) => new Date(s.date).toDateString() === todayStr)
    .reduce((sum, s) => sum + (s.total || 0), 0)

  const activePlantsCount = 1226 // Aggregated from monitored telemetry
  const radarAccuracyRate = 92.4 // Percentage compliance

  // Render Multi-Period Revenue & Performance Chart
  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    const trendData = mockMultiPeriodTrends[period]

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: trendData.labels,
        datasets: [
          {
            type: 'bar',
            label: 'Revenue (PKR)',
            data: trendData.revenue,
            backgroundColor: '#0891b2', // Medical/Water-Tech Teal
            hoverBackgroundColor: '#0e7490',
            borderRadius: 8,
            borderSkipped: false,
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: 'Service Audits Completed',
            data: trendData.servicesCompleted.map((count) => count * 15000), // Scale to secondary axis visually
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            borderWidth: 2.5,
            pointBackgroundColor: '#0284c7',
            pointRadius: 4,
            tension: 0.35,
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              font: { family: 'Inter', size: 11, weight: '600' },
              color: '#64748b',
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Outfit', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 11 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                if (context.dataset.type === 'line') {
                  const actualCount = Math.round(context.raw / 15000)
                  return ` Audits Completed: ${actualCount} jobs`
                }
                return ` Revenue: PKR ${context.raw.toLocaleString()}`
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#64748b' },
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#64748b',
              callback: (val) => `Rs. ${(val / 1000).toFixed(0)}k`,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [period])

  return (
    <div className="space-y-6 font-sans text-left">
      {/* 4 Metric KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-outfit text-foreground tracking-tight">
            PKR {totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +14.8%
            </span>
            <span className="text-muted-foreground text-[11px]">vs last period</span>
          </div>
        </Card>

        {/* Card 2: Today's Sales */}
        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-outfit text-foreground tracking-tight">
            PKR {todaySales.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +8.2%
            </span>
            <span className="text-muted-foreground text-[11px]">Counter & Web Sync</span>
          </div>
        </Card>

        {/* Card 3: Active Filtration Units */}
        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Active Plants Monitored
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-outfit text-foreground tracking-tight">
            {activePlantsCount} Units
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-[10px] font-bold text-sky-700 bg-sky-500/15 px-1.5 py-0.5 rounded-full">
              96.2%
            </span>
            <span className="text-muted-foreground text-[11px]">Membrane Health Rate</span>
          </div>
        </Card>

        {/* Card 4: Service Radar Compliance */}
        <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Radar Compliance
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-outfit text-foreground tracking-tight">
            {radarAccuracyRate}%
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-500/15 px-1.5 py-0.5 rounded-full">
              On Schedule
            </span>
            <span className="text-muted-foreground text-[11px]">1M/2M Replacement Velocity</span>
          </div>
        </Card>
      </div>

      {/* Main Analytics: Multi-Period Chart & Channel Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Multi-Period Performance Chart (8 cols) */}
        <Card className="lg:col-span-8 rounded-2xl border-border/80 shadow-xs overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-bold font-outfit">
                Revenue & Service Audit Velocity
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Synchronized sales volume and scheduled field maintenance jobs across Bahawalpur.
              </CardDescription>
            </div>

            {/* Time Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl border border-border/60 text-xs">
              {[
                { id: 'weekly', label: '7 Days' },
                { id: 'monthly', label: '6 Months' },
                { id: 'quarterly', label: 'Quarterly' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPeriod(t.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    period === t.id
                      ? 'bg-background text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="h-64 w-full relative">
              <canvas ref={chartRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* Right: Omnichannel Distribution & Fast Health (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Channel Breakdown */}
          <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="font-bold text-xs font-outfit text-foreground flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-primary" />
                <span>Sales Channel Velocity</span>
              </div>
              <Badge variant="outline" className="text-[10px]">Real-time</Badge>
            </div>

            <div className="space-y-3 text-xs">
              {/* Counter POS */}
              <div className="space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <span>🏢 In-Store Counter POS</span>
                  </span>
                  <span className="font-bold text-foreground font-mono">68% (Rs. 248k)</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[68%]" />
                </div>
              </div>

              {/* Web Store */}
              <div className="space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <span>🌐 Online Web Store</span>
                  </span>
                  <span className="font-bold text-foreground font-mono">32% (Rs. 118k)</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full w-[32%]" />
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-muted/40 rounded-xl border border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Sync destination:</span>
              <span className="font-mono text-primary font-semibold">dr-aqua-project.vercel.app</span>
            </div>
          </Card>

          {/* Quick Service Dispatch Summary */}
          <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="font-bold text-xs font-outfit text-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Field Vans in Transit</span>
              </div>
              <Badge variant="warning" className="text-[10px]">3 Active</Badge>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Unit 1 (Ali Raza):</span>
                <strong className="text-foreground font-medium">Model Town B (Job 2/4)</strong>
              </div>
              <div className="flex justify-between">
                <span>Unit 2 (Usman Tariq):</span>
                <strong className="text-foreground font-medium">Industrial Estate (Skid Setup)</strong>
              </div>
              <div className="flex justify-between">
                <span>Unit 3 (Babar Khan):</span>
                <strong className="text-foreground font-medium">Cheema Town (Installation)</strong>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Screen 5: Bahawalpur Water Purity & TDS Intelligence Map */}
      <WaterPurityTDSMap />
    </div>
  )
}
