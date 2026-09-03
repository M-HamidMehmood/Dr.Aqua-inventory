import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../ui/sheet'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  Droplet,
  ShieldCheck,
  MessageSquare,
  History,
  Activity,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'

export default function CustomerDetailDrawer({
  isOpen,
  onClose,
  customer,
  onDispatchService,
}) {
  if (!customer) return null

  const isOverdue = customer.radarStatus === 'overdue'
  const isDueSoon = customer.radarStatus === 'due_soon'

  // Service cycle calculation (assumes 60-day standard cycle)
  const daysInCycle = 60
  const daysProgress = Math.min(100, Math.round((customer.daysSinceLastService / daysInCycle) * 100))

  const handleOpenWhatsApp = () => {
    const rawNumber = customer.contact.replace(/\D/g, '')
    const text = encodeURIComponent(
      `Assalam-o-Alaikum ${customer.name},\nThis is Dr. Aqua Pure Water Solutions Bahawalpur regarding your installed ${customer.installedUnit}.\n\nOur telemetry indicates your scheduled service is due. Last recorded output was ${customer.permeateTdsPpm} PPM.\nWould you like our service van to visit tomorrow morning for your complimentary audit?`
    )
    window.open(`https://wa.me/${rawNumber}?text=${text}`, '_blank')
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col justify-between text-left">
        {/* Header Profile Plaque */}
        <SheetHeader className="p-6 border-b border-border/70 bg-muted/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg font-outfit shadow-xs">
                {customer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base font-bold font-outfit text-foreground">
                    {customer.name}
                  </SheetTitle>
                  <Badge
                    variant={
                      isOverdue
                        ? 'destructive'
                        : isDueSoon
                        ? 'warning'
                        : 'success'
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {isOverdue ? 'Overdue Service' : isDueSoon ? 'Service Due' : 'Healthy'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{customer.sector}</span>
                </div>
              </div>
            </div>

            <Button
              variant="whatsapp"
              size="sm"
              onClick={handleOpenWhatsApp}
              className="gap-1.5 text-xs font-outfit font-bold rounded-xl shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </Button>
          </div>

          {/* Contact Details Pill Strip */}
          <div className="grid grid-cols-2 gap-2 pt-4 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-background border border-border/60">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-mono text-foreground font-semibold">{customer.contact}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-background border border-border/60 truncate">
              <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-foreground truncate">{customer.email}</span>
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground pt-2 flex items-center gap-1.5">
            <span className="font-semibold text-foreground">Address:</span>
            <span>{customer.address}</span>
          </div>
        </SheetHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Equipment & Telemetry Card */}
          <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold font-outfit text-foreground flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-primary" />
                <span>Installed Purification Unit</span>
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                SN: {customer.serialNumber}
              </Badge>
            </div>

            <div className="font-bold text-xs text-foreground font-outfit">
              {customer.installedUnit}
            </div>

            {/* TDS Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-background border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Feed TDS</span>
                <div className="text-base font-bold font-mono text-rose-600 font-outfit">
                  {customer.feedTdsPpm} PPM
                </div>
                <div className="text-[9px] text-muted-foreground">Municipal Ground</div>
              </div>

              <div className="p-2 rounded-xl bg-background border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Permeate TDS</span>
                <div className="text-base font-bold font-mono text-emerald-600 font-outfit">
                  {customer.permeateTdsPpm} PPM
                </div>
                <div className="text-[9px] text-muted-foreground">Pure RO Output</div>
              </div>

              <div className="p-2 rounded-xl bg-background border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Rejection</span>
                <div className="text-base font-bold font-mono text-primary font-outfit">
                  {customer.membraneRejectionRate}%
                </div>
                <div className="text-[9px] text-muted-foreground">Salt Rejection</div>
              </div>
            </div>
          </div>

          {/* Service Radar Progress */}
          <div className="p-4 bg-background border border-border/70 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold font-outfit text-foreground flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>Filter Replacement Cycle Decay</span>
              </span>
              <span className="font-mono font-bold text-muted-foreground">
                {customer.daysSinceLastService}d / 60d
              </span>
            </div>

            <Progress
              value={daysProgress}
              className="h-2"
              indicatorClassName={
                isOverdue ? 'bg-rose-500' : isDueSoon ? 'bg-amber-500' : 'bg-emerald-500'
              }
            />

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Last service: {customer.lastServiceDate}</span>
              <span className="font-semibold text-foreground">
                Next due: {customer.nextServiceDue}
              </span>
            </div>
          </div>

          {/* Chronological Visit Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold font-outfit text-foreground flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-primary" />
                <span>Technician Visit Timeline ({customer.serviceHistory?.length || 0})</span>
              </span>
            </div>

            {(!customer.serviceHistory || customer.serviceHistory.length === 0) ? (
              <div className="p-6 text-center text-muted-foreground rounded-2xl bg-muted/20 border border-border/60">
                Initial installation scheduled. No follow-up service recorded yet.
              </div>
            ) : (
              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
                {customer.serviceHistory.map((visit) => (
                  <div key={visit.id} className="relative space-y-1">
                    <div className="absolute -left-5 top-1.5 w-4 h-4 rounded-full bg-primary border-2 border-background flex items-center justify-center text-[8px] text-white">
                      ✓
                    </div>

                    <div className="p-3 bg-card rounded-xl border border-border/70 space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-outfit text-foreground">{visit.serviceType}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {visit.date}
                        </Badge>
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        Technician: <strong className="text-foreground">{visit.technician}</strong>
                      </div>

                      {visit.partsReplaced && visit.partsReplaced.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {visit.partsReplaced.map((part, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium"
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                        <span>Output: {visit.permeateTds} PPM</span>
                        <span className="font-mono font-bold text-foreground">
                          PKR {visit.costPkr?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer CTAs */}
        <SheetFooter className="p-4 border-t border-border/70 bg-muted/20 flex items-center justify-between sm:justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (onDispatchService) onDispatchService(customer)
              onClose()
            }}
            className="gap-1.5 font-bold font-outfit"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Book Service Van Ticket</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
