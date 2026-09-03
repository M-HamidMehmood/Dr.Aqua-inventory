import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import {
  Lock,
  Printer,
  DollarSign,
  Smartphone,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react'

export default function RegisterClosingModal({
  isOpen,
  onClose,
  cashSales = 0,
  digitalSales = 0,
  totalOrdersCount = 0,
  cashierName = 'Current Cashier',
}) {
  const openingFloat = 10000 // Standard PKR 10,000 opening float
  const expectedCashInDrawer = openingFloat + cashSales

  const [actualCashCounted, setActualCashCounted] = useState(String(expectedCashInDrawer))
  const [closingNotes, setClosingNotes] = useState('')
  const [isLocked, setIsLocked] = useState(false)

  const counted = parseFloat(actualCashCounted) || 0
  const variance = counted - expectedCashInDrawer

  const handleCloseRegister = () => {
    setIsLocked(true)
    setTimeout(() => {
      window.print()
      alert('End-of-day register closed successfully. Shift Z-Report generated.')
      onClose()
    }, 450)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl border-border/80 shadow-2xl space-y-4 text-left font-sans">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider font-mono">
              End-of-Day Terminal Closing
            </span>
            <Badge variant="outline" className="text-[10px]">
              Shift Z-Report
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold font-outfit text-foreground">
            Cash Drawer Balancing & Z-Report
          </DialogTitle>
          <DialogDescription className="text-xs">
            Reconciles physical counter cash against Raast digital settlements for shift handover.
          </DialogDescription>
        </DialogHeader>

        {/* Financial Balancing Card */}
        <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-2.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Opening Cash Float:</span>
            <strong className="font-mono text-foreground">PKR {openingFloat.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Counter Cash Sales:</span>
            <strong className="font-mono text-emerald-600">+ PKR {cashSales.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Digital / Raast Sales:</span>
            <strong className="font-mono text-cyan-600">+ PKR {digitalSales.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Total Orders Settled:</span>
            <strong className="font-mono text-foreground">{totalOrdersCount} Invoices</strong>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-baseline justify-between">
            <span className="font-bold text-foreground">Expected Drawer Cash:</span>
            <span className="text-base font-bold font-mono text-foreground font-outfit">
              PKR {expectedCashInDrawer.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actual Physical Cash Counted Input */}
        <div className="space-y-1 text-xs">
          <Label className="text-xs font-semibold">Physical Cash Counted in Drawer (PKR)</Label>
          <Input
            type="number"
            min="0"
            value={actualCashCounted}
            onChange={(e) => setActualCashCounted(e.target.value)}
            className="font-mono text-base font-bold text-foreground"
          />
        </div>

        {/* Cash Variance Pill */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            variance === 0
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700'
              : variance > 0
              ? 'bg-primary/10 border-primary/20 text-primary'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-700'
          }`}
        >
          <span className="font-semibold">Cash Drawer Variance:</span>
          <span className="font-mono font-bold text-sm">
            {variance === 0
              ? 'Exact Match (Rs. 0)'
              : variance > 0
              ? `+ PKR ${variance.toLocaleString()} (Overage)`
              : `- PKR ${Math.abs(variance).toLocaleString()} (Shortage)`}
          </span>
        </div>

        {/* Handover Sign-off */}
        <div className="space-y-1 text-xs">
          <Label className="text-xs font-semibold">Shift Notes & Handover Tag</Label>
          <Input
            value={closingNotes}
            onChange={(e) => setClosingNotes(e.target.value)}
            placeholder="e.g. Handed over key to evening shift supervisor Babar Khan."
            className="text-xs"
          />
        </div>

        <DialogFooter className="pt-2 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLocked}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCloseRegister}
            disabled={isLocked}
            className="font-bold font-outfit gap-1.5 shadow-md"
          >
            <Lock className="w-4 h-4" />
            <span>{isLocked ? 'Locking Register...' : 'Lock Drawer & Print Z-Report'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
