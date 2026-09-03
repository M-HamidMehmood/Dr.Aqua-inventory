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
import { Select } from '../ui/select'
import { Badge } from '../ui/badge'
import DrAquaLogo from '../ui/DrAquaLogo'
import { Printer, QrCode, Tag, Check, Copy } from 'lucide-react'

export default function BarcodeLabelModal({ isOpen, onClose, product }) {
  const [copies, setCopies] = useState(2)
  const [labelSize, setLabelSize] = useState('50x30')
  const [isPrinting, setIsPrinting] = useState(false)

  if (!product) return null

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      setIsPrinting(false)
      window.print()
      onClose()
    }, 400)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl border-border/80 shadow-2xl space-y-4">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider font-mono">
              Thermal Label Generator
            </span>
            <Badge variant="outline" className="text-[10px]">
              EAN-13 Standard
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold font-outfit text-foreground">
            Print Shelf & Cartridge Labels
          </DialogTitle>
          <DialogDescription className="text-xs">
            High-density thermal sticker for Xprinter / Zebra barcoding printers.
          </DialogDescription>
        </DialogHeader>

        {/* Realistic 50mm x 30mm Thermal Shelf Sticker Preview */}
        <div className="flex justify-center p-4 bg-muted/40 rounded-2xl border border-dashed border-border">
          <div
            id="printable-label"
            className="w-[280px] bg-white text-black p-3.5 rounded-lg border-2 border-black/80 shadow-md space-y-2 select-none font-sans"
          >
            {/* Sticker Top Header */}
            <div className="flex items-center justify-between border-b border-black/30 pb-1">
              <div className="flex items-center gap-1.5">
                <DrAquaLogo size="sm" />
                <span className="text-[9px] font-bold tracking-tight uppercase">Dr. Aqua Pure</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-black text-white px-1 rounded">
                {product.shelfLocation}
              </span>
            </div>

            {/* Product Name */}
            <div className="text-[11px] font-bold leading-tight line-clamp-2 text-black font-outfit">
              {product.name}
            </div>

            {/* Price Tag */}
            <div className="flex items-baseline justify-between">
              <span className="text-[9px] text-zinc-600 font-semibold uppercase">Retail POS:</span>
              <span className="text-base font-black font-outfit text-black tracking-tight">
                PKR {product.price?.toLocaleString()}
              </span>
            </div>

            {/* Vector Barcode + QR Pattern */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/20">
              <div className="flex-1 space-y-0.5">
                {/* Simulated crisp vector barcode lines */}
                <div className="h-9 w-full flex items-end justify-between px-1 bg-white">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2].map(
                    (w, idx) => (
                      <div
                        key={idx}
                        className="bg-black h-full"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    )
                  )}
                </div>
                <div className="text-center font-mono text-[9px] tracking-widest text-black font-bold">
                  {product.barcode || '896400010011'}
                </div>
              </div>

              {/* QR Code Graphic */}
              <div className="w-10 h-10 border border-black p-0.5 rounded flex items-center justify-center bg-white shrink-0">
                <QrCode className="w-full h-full text-black" />
              </div>
            </div>

            <div className="text-[8px] text-center font-mono text-zinc-600">
              SKU: {product.sku} • Model Town B, Bahawalpur
            </div>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Label Dimensions</Label>
            <Select value={labelSize} onChange={(e) => setLabelSize(e.target.value)}>
              <option value="50x30">50mm x 30mm (Shelf Standard)</option>
              <option value="40x25">40mm x 25mm (Cartridge Mini)</option>
              <option value="100x50">100mm x 50mm (Outer Carton)</option>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Number of Copies</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={copies}
              onChange={(e) => setCopies(parseInt(e.target.value, 10) || 1)}
              className="font-mono text-xs font-bold"
            />
          </div>
        </div>

        <DialogFooter className="pt-2 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            disabled={isPrinting}
            className="font-bold font-outfit gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>{isPrinting ? 'Sending to Spooler...' : `Print ${copies} Labels`}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
