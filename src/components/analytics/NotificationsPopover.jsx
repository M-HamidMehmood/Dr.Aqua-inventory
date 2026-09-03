import React, { useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { mockOperationalAlerts } from '../../data/mock/analytics.mock'
import {
  Bell,
  AlertTriangle,
  CalendarClock,
  Truck,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Package,
} from 'lucide-react'

export default function NotificationsPopover({ onActionClick }) {
  const [alerts, setAlerts] = useState(mockOperationalAlerts)
  const [activeSegment, setActiveSegment] = useState('all') // 'all' | 'low_stock' | 'radar_due' | 'dispatch_delay'

  const filteredAlerts = alerts.filter((a) => {
    if (activeSegment === 'all') return true
    return a.type === activeSegment
  })

  const countByType = {
    all: alerts.length,
    low_stock: alerts.filter((a) => a.type === 'low_stock').length,
    radar_due: alerts.filter((a) => a.type === 'radar_due').length,
    dispatch_delay: alerts.filter((a) => a.type === 'dispatch_delay').length,
  }

  const handleDismiss = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative p-2 rounded-xl border border-border/80 bg-card text-foreground hover:bg-muted/60 transition-colors cursor-pointer shadow-xs"
          title="Operational Notifications"
        >
          <Bell className="w-4 h-4 text-foreground" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
              {alerts.length}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0 shadow-2xl rounded-2xl border border-border/80 overflow-hidden bg-card text-card-foreground">
        {/* Header */}
        <div className="p-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-outfit font-bold text-sm text-foreground">Operational Alerts</span>
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-mono">
              {alerts.length} Active
            </Badge>
          </div>
          <button
            type="button"
            onClick={() => setAlerts([])}
            className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Segmented Filter Bar */}
        <div className="grid grid-cols-4 p-1.5 bg-muted/20 border-b border-border/60 gap-1 text-[11px]">
          {[
            { id: 'all', label: `All (${countByType.all})` },
            { id: 'low_stock', label: `Stock (${countByType.low_stock})` },
            { id: 'radar_due', label: `Radar (${countByType.radar_due})` },
            { id: 'dispatch_delay', label: `Transit (${countByType.dispatch_delay})` },
          ].map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setActiveSegment(seg.id)}
              className={`py-1 px-1 rounded-lg font-semibold text-center truncate transition-all cursor-pointer ${
                activeSegment === seg.id
                  ? 'bg-background text-primary shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>

        {/* Alert Items List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border/50 text-left">
          {filteredAlerts.length === 0 ? (
            <div className="py-10 text-center space-y-2 text-muted-foreground">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 opacity-80" />
              <div className="text-xs font-medium">All clear! No pending alerts in this category.</div>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 hover:bg-muted/30 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        alert.type === 'low_stock'
                          ? 'bg-rose-500/10 text-rose-600'
                          : alert.type === 'radar_due'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-indigo-500/10 text-indigo-600'
                      }`}
                    >
                      {alert.type === 'low_stock' && <AlertTriangle className="w-3.5 h-3.5" />}
                      {alert.type === 'radar_due' && <CalendarClock className="w-3.5 h-3.5" />}
                      {alert.type === 'dispatch_delay' && <Truck className="w-3.5 h-3.5" />}
                    </div>
                    <div className="font-semibold text-xs text-foreground tracking-tight line-clamp-1">
                      {alert.title}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed pl-8">
                  {alert.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pl-8 pt-0.5">
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${
                      alert.urgency === 'critical'
                        ? 'bg-rose-500/15 text-rose-600'
                        : alert.urgency === 'high'
                        ? 'bg-amber-500/15 text-amber-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {alert.urgency}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant={alert.actionType === 'send_whatsapp' ? 'whatsapp' : 'default'}
                      onClick={() => {
                        if (alert.actionType === 'send_whatsapp' && alert.metadata.customerPhone) {
                          const phone = alert.metadata.customerPhone.replace(/\D/g, '')
                          window.open(`https://wa.me/${phone}`, '_blank')
                        } else if (onActionClick) {
                          onActionClick(alert)
                        }
                        handleDismiss(alert.id)
                      }}
                      className="h-6 px-2 text-[10px] gap-1 font-outfit font-bold rounded-md"
                    >
                      {alert.actionType === 'send_whatsapp' && <MessageSquare className="w-2.5 h-2.5" />}
                      {alert.actionType === 'order_stock' && <Package className="w-2.5 h-2.5" />}
                      {alert.actionType === 'dispatch_tech' && <Truck className="w-2.5 h-2.5" />}
                      <span>{alert.actionLabel}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-muted/30 border-t border-border/70 text-center">
          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <span>Automated alert sync with Vercel & Bahawalpur Radar</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
