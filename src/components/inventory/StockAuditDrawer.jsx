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
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  User,
  FileText,
  Boxes,
  Calendar,
  Layers,
} from 'lucide-react'

export default function StockAuditDrawer({ isOpen, onClose, product }) {
  if (!product) return null

  const logs = product.auditTrail || []

  // Calculate quick stats from audit logs
  const positiveDelta = logs
    .filter((l) => l.delta > 0)
    .reduce((sum, l) => sum + l.delta, 0)
  const negativeDelta = Math.abs(
    logs.filter((l) => l.delta < 0).reduce((sum, l) => sum + l.delta, 0)
  )

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col justify-between">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-border/70 bg-muted/20 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-bold font-outfit">
                  Stock Movement & Audit Trail
                </SheetTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {product.sku}
                </Badge>
              </div>
              <SheetDescription className="text-xs line-clamp-1">
                {product.name}
              </SheetDescription>
            </div>
          </div>

          {/* Quick Ledger Stats */}
          <div className="grid grid-cols-3 gap-2 pt-3">
            <div className="p-2 rounded-xl bg-background border border-border/60 text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">In-Stock</div>
              <div className="text-base font-bold font-mono text-primary">{product.quantity}</div>
            </div>
            <div className="p-2 rounded-xl bg-background border border-border/60 text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Inflow</div>
              <div className="text-base font-bold font-mono text-emerald-600">+{positiveDelta}</div>
            </div>
            <div className="p-2 rounded-xl bg-background border border-border/60 text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Outflow</div>
              <div className="text-base font-bold font-mono text-rose-600">-{negativeDelta}</div>
            </div>
          </div>
        </SheetHeader>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <Boxes className="w-8 h-8 mx-auto opacity-50" />
              <div className="text-xs">No historical stock movements logged yet.</div>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
              {logs.map((log) => (
                <div key={log.id} className="relative space-y-1.5">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold ${
                      log.delta > 0
                        ? 'bg-emerald-500 text-white'
                        : log.delta < 0
                        ? 'bg-rose-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {log.delta > 0 ? '+' : '-'}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-card border border-border/70 hover:border-border transition-colors space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground font-outfit">
                        {log.reason}
                      </span>
                      <span
                        className={`text-xs font-mono font-black ${
                          log.delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {log.delta > 0 ? `+${log.delta}` : log.delta} Units
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-muted-foreground/80" />
                        <span>{log.operator}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <Calendar className="w-3 h-3" />
                        <span>{log.timestamp}</span>
                      </div>
                    </div>

                    {/* Previous vs New Stock Footnote */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                      <span>
                        Stock: {log.previousStock} → <strong className="text-foreground">{log.newStock}</strong>
                      </span>
                      {log.documentRef && (
                        <div className="flex items-center gap-1 font-mono text-primary font-semibold">
                          <FileText className="w-2.5 h-2.5" />
                          <span>{log.documentRef}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="p-4 border-t border-border/70 bg-muted/20 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Audit Log
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
