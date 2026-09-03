import React, { useState, useEffect } from 'react'
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
import { Select } from '../ui/select'
import {
  PackageCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  Wrench,
  CheckCircle2,
  Clock,
  FileText,
  Boxes,
  ExternalLink,
  ShieldCheck,
  Tag,
} from 'lucide-react'

export default function FulfillmentDrawer({
  isOpen,
  onClose,
  order,
  onStatusChange,
  onConvertToTicket,
}) {
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'pending_verification')
  const [allocatedItems, setAllocatedItems] = useState({})
  const [assignedVan, setAssignedVan] = useState('VAN-01 (Ali Raza)')
  const [isConverting, setIsConverting] = useState(false)

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status)
      const initialChecked = {}
      order.items?.forEach((item) => {
        initialChecked[item.id] = true
      })
      setAllocatedItems(initialChecked)
    }
  }, [order, isOpen])

  if (!order) return null

  const handleToggleAllocation = (itemId) => {
    setAllocatedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const handleStatusUpdate = (newStatus) => {
    setCurrentStatus(newStatus)
    if (onStatusChange) {
      onStatusChange(order.id, newStatus, assignedVan)
    }
  }

  const handleConvertTicket = () => {
    setIsConverting(true)
    setTimeout(() => {
      setIsConverting(false)
      if (onConvertToTicket) {
        onConvertToTicket(order, assignedVan)
      }
      onClose()
    }, 450)
  }

  const isPrepaid = order.paymentMethod?.includes('Prepaid')

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col justify-between text-left font-sans">
        {/* Header Profile Plaque */}
        <SheetHeader className="p-6 border-b border-border/70 bg-muted/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-bold font-outfit text-foreground">
                  Order #{order.orderNumber}
                </SheetTitle>
                <Badge
                  variant={
                    order.status === 'completed'
                      ? 'success'
                      : order.status === 'out_for_delivery'
                      ? 'warning'
                      : 'default'
                  }
                  className="capitalize font-mono text-[10px]"
                >
                  {order.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <SheetDescription className="text-xs mt-0.5">
                Received via <strong className="text-primary">dr-aqua-project.vercel.app</strong> • {order.elapsedTime}
              </SheetDescription>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-muted-foreground uppercase">Order Total</span>
              <div className="text-base font-bold text-foreground font-outfit">
                PKR {order.total?.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Quick Client Summary */}
          <div className="grid grid-cols-2 gap-2 pt-4 text-xs">
            <div className="p-2 rounded-xl bg-background border border-border/60">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Client Name</div>
              <div className="font-bold text-foreground truncate">{order.customerName}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{order.customerPhone}</div>
            </div>
            <div className="p-2 rounded-xl bg-background border border-border/60">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Payment Status</div>
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isPrepaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{order.paymentMethod}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{order.paymentStatus}</div>
            </div>
          </div>
        </SheetHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Delivery Address & Special Instructions */}
          <div className="p-3.5 bg-muted/30 border border-border/70 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold font-outfit text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Destination Sector & Address</span>
              </span>
              <Badge variant="outline" className="text-[10px] font-semibold">
                {order.sector}
              </Badge>
            </div>
            <p className="text-foreground leading-relaxed pl-5 font-medium">
              {order.deliveryAddress}
            </p>

            {order.specialInstructions && (
              <div className="pt-2 border-t border-border/50 text-[11px] text-amber-800 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <strong>Delivery Note:</strong> {order.specialInstructions}
              </div>
            )}
          </div>

          {/* Stock Allocation & Warehouse Item Checklist */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold font-outfit text-foreground flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-primary" />
                <span>Warehouse Picking & Stock Allocation ({order.items?.length || 0})</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Verify shelf location</span>
            </div>

            <div className="divide-y divide-border/60 border border-border/70 rounded-2xl overflow-hidden bg-card">
              {order.items?.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={Boolean(allocatedItems[item.id])}
                      onChange={() => handleToggleAllocation(item.id)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-foreground font-outfit">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2">
                        <span>SKU: {item.sku}</span>
                        <span>•</span>
                        <span className="text-primary font-semibold">Location: {item.shelfLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="font-bold text-foreground">Qty: {item.qty}</div>
                    <div className="text-[10px] text-muted-foreground">Rs. {item.price?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Van Assignment & Pipeline Status */}
          <div className="p-4 bg-background border border-border/70 rounded-2xl space-y-3">
            <div className="font-bold text-xs font-outfit text-foreground flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary" />
              <span>Service Van & Delivery Status Controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Dispatch Van / Driver</label>
                <Select value={assignedVan} onChange={(e) => setAssignedVan(e.target.value)}>
                  <option value="VAN-01 (Ali Raza)">Van 01 — Ali Raza (North/Central)</option>
                  <option value="VAN-02 (Usman Tariq)">Van 02 — Usman Tariq (Industrial)</option>
                  <option value="VAN-03 (Babar Khan)">Van 03 — Babar Khan (Western/DHA)</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Update Pipeline State</label>
                <Select
                  value={currentStatus}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                >
                  <option value="pending_verification">1. Pending Verification</option>
                  <option value="stock_reserved">2. Stock Reserved</option>
                  <option value="out_for_delivery">3. Out for Delivery</option>
                  <option value="completed">4. Delivered & Completed</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Conversion to Field Service Ticket Box */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-primary font-outfit flex items-center gap-1.5">
                <Wrench className="w-4 h-4" />
                <span>On-Site Installation Service Ticket</span>
              </span>
              <Badge variant="outline" className="text-[10px]">
                Automated
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Customer requires on-site membrane fitting and booster pump calibration in {order.sector}. Instantly convert this order into an active technician ticket.
            </p>
            <Button
              size="sm"
              onClick={handleConvertTicket}
              disabled={isConverting}
              className="w-full h-9 text-xs font-bold font-outfit gap-1.5 rounded-xl mt-1"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isConverting ? 'Generating Ticket...' : 'Convert to Technician Dispatch Ticket'}</span>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="p-4 border-t border-border/70 bg-muted/20 flex items-center justify-between sm:justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              handleStatusUpdate('out_for_delivery')
              onClose()
            }}
            className="gap-1.5 font-bold font-outfit"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Mark Out for Delivery</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
