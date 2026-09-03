import React, { useState, useEffect } from 'react'
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
import { Select } from '../ui/select'
import { Badge } from '../ui/badge'
import { Boxes, ArrowRight, Plus, Minus, History, Check } from 'lucide-react'

export default function QuickRestockModal({
  isOpen,
  onClose,
  product,
  onConfirmRestock,
}) {
  const [delta, setDelta] = useState(10)
  const [reason, setReason] = useState('Restock / Supplier Receipt')
  const [documentRef, setDocumentRef] = useState('')
  const [operator, setOperator] = useState('Current Cashier')

  useEffect(() => {
    if (isOpen) {
      setDelta(10)
      setReason('Restock / Supplier Receipt')
      setDocumentRef(`PO-${Math.floor(1000 + Math.random() * 9000)}`)
    }
  }, [isOpen])

  if (!product) return null

  const currentStock = product.quantity || 0
  const resultingStock = Math.max(0, currentStock + delta)

  const handleApplyPreset = (amt) => {
    setDelta((prev) => {
      const next = prev + amt
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (delta === 0) {
      alert('Please specify a non-zero adjustment delta.')
      return
    }

    const logEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: 'Just now',
      operator: operator || 'Admin',
      delta,
      previousStock: currentStock,
      newStock: resultingStock,
      reason,
      documentRef: documentRef || undefined,
    }

    onConfirmRestock(product.id, resultingStock, logEntry)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl border-border/80 shadow-2xl space-y-4">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider font-mono">
              SKU: {product.sku}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {product.shelfLocation}
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold font-outfit text-foreground">
            Quick Stock Stepper Adjustment
          </DialogTitle>
          <DialogDescription className="text-xs">
            {product.name}
          </DialogDescription>
        </DialogHeader>

        {/* Stock Delta Visualizer Card */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Current Stock</div>
            <div className="text-xl font-bold font-mono text-foreground">{currentStock}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/60" />
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Adjustment</div>
            <div
              className={`text-xl font-bold font-mono ${
                delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-muted-foreground'
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/60" />
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">New Total</div>
            <div className="text-xl font-bold font-mono text-primary">{resultingStock}</div>
          </div>
        </div>

        {/* Quick Delta Stepper Buttons */}
        <div className="space-y-1.5 text-left">
          <Label className="text-xs font-semibold">Quick Adjustment Chips</Label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset(-5)}
              className="py-1.5 px-2 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-600 text-xs font-bold hover:bg-rose-500/15 transition-all cursor-pointer"
            >
              -5 Write-off
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(10)}
              className="py-1.5 px-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 text-xs font-bold hover:bg-emerald-500/15 transition-all cursor-pointer"
            >
              +10 Restock
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(50)}
              className="py-1.5 px-2 rounded-xl border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/15 transition-all cursor-pointer"
            >
              +50 Carton
            </button>
            <button
              type="button"
              onClick={() => setDelta(0)}
              className="py-1.5 px-2 rounded-xl border border-border/80 bg-muted/40 text-muted-foreground text-xs font-semibold hover:bg-muted transition-all cursor-pointer"
            >
              Reset 0
            </button>
          </div>
        </div>

        {/* Adjustment Delta Input */}
        <div className="space-y-1.5 text-left">
          <Label htmlFor="adj-delta" className="text-xs font-semibold">
            Custom Adjustment Quantity (+ or -)
          </Label>
          <Input
            id="adj-delta"
            type="number"
            value={delta}
            onChange={(e) => setDelta(parseInt(e.target.value, 10) || 0)}
            className="font-mono text-sm font-bold"
          />
        </div>

        {/* Reason Code Dropdown */}
        <div className="space-y-1.5 text-left">
          <Label className="text-xs font-semibold">Audit Reason Code</Label>
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="Restock / Supplier Receipt">Restock / Supplier Delivery</option>
            <option value="Field Service Allocation">Field Service Van Allocation</option>
            <option value="POS Counter Sale Adjustment">Counter Sale Correction</option>
            <option value="Damaged / Broken Cartridge Write-Off">Damaged / Seal Broken Write-Off</option>
            <option value="Physical Stock Count Reconciliation">Physical Count Reconciliation</option>
          </Select>
        </div>

        {/* Reference Number */}
        <div className="space-y-1.5 text-left">
          <Label className="text-xs font-semibold">PO / Delivery Reference #</Label>
          <Input
            value={documentRef}
            onChange={(e) => setDocumentRef(e.target.value)}
            placeholder="e.g. PO-9912 or GRN-202"
            className="font-mono text-xs"
          />
        </div>

        <DialogFooter className="pt-2 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} className="font-bold font-outfit gap-1.5">
            <Check className="w-4 h-4" />
            <span>Commit Stock Change</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
