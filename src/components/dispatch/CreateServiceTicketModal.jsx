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
import { Checkbox } from '../ui/checkbox'
import { mockTechnicians } from '../../data/mock/technicians.mock'
import { mockInventoryRecords } from '../../data/mock/inventory.mock'
import {
  Wrench,
  User,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Boxes,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react'

export default function CreateServiceTicketModal({
  isOpen,
  onClose,
  inventory = [],
  onCreateTicket,
  prefilledOrder,
}) {
  const catalog = inventory && inventory.length > 0 ? inventory : mockInventoryRecords

  // Form states
  const [technicianId, setTechnicianId] = useState('tech-1')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [sector, setSector] = useState('Model Town B')
  const [streetAddress, setStreetAddress] = useState('')
  const [jobType, setJobType] = useState('New RO Installation')
  const [priority, setPriority] = useState('high')
  const [timeSlot, setTimeSlot] = useState('02:00 PM - 03:30 PM')
  const [symptoms, setSymptoms] = useState('')
  const [visitFee, setVisitFee] = useState('1500')

  // Parts allocation checklist state: array of { productId, qty }
  const [allocatedParts, setAllocatedParts] = useState([
    { productId: 8, qty: 1 }, // Dow Filmtec Membrane
    { productId: 10, qty: 2 }, // Sediment Cartridge
  ])

  // Handle part selection change
  const handleAddPart = () => {
    setAllocatedParts([...allocatedParts, { productId: 11, qty: 1 }])
  }

  const handleUpdatePart = (index, field, value) => {
    const updated = [...allocatedParts]
    updated[index] = { ...updated[index], [field]: Number(value) }
    setAllocatedParts(updated)
  }

  const handleRemovePart = (index) => {
    setAllocatedParts(allocatedParts.filter((_, i) => i !== index))
  }

  // Calculate estimated total
  const partsTotal = allocatedParts.reduce((sum, p) => {
    const prod = catalog.find((item) => item.id === p.productId)
    return sum + (prod ? prod.price * p.qty : 0)
  }, 0)

  const grandTotal = partsTotal + (parseFloat(visitFee) || 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customerName || !streetAddress) {
      alert('Please fill out customer name and street address.')
      return
    }

    const assignedTech = mockTechnicians.find((t) => t.id === technicianId)
    const detailedParts = allocatedParts.map((p) => {
      const prod = catalog.find((item) => item.id === p.productId)
      return {
        id: p.productId,
        sku: prod?.sku || 'SKU-GEN',
        name: prod?.name || 'Part item',
        qty: p.qty,
        price: prod?.price || 0,
        inStock: prod?.quantity || 10,
      }
    })

    const newTicket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      ticketNumber: `TKT-${Date.now().toString().slice(-4)}`,
      customerName,
      customerPhone: customerPhone || '+92 334 7071759',
      sector,
      streetAddress,
      timeSlot,
      jobType,
      priority,
      status: 'assigned',
      technicianId,
      technicianName: assignedTech?.name || 'Hamza Abbasi',
      allocatedParts: detailedParts,
      symptoms: symptoms || 'Scheduled on-site service call.',
      feePkr: parseFloat(visitFee) || 1500,
    }

    if (onCreateTicket) {
      onCreateTicket(newTicket)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl border-border/80 shadow-2xl space-y-4 text-left font-sans">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider font-mono">
              Technician Field Operations
            </span>
            <Badge variant="outline" className="text-[10px]">
              Bahawalpur Field Fleet
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold font-outfit text-foreground">
            Create Service Ticket & Allocate Parts
          </DialogTitle>
          <DialogDescription className="text-xs">
            Schedule a service visit, assign van fleet, and reserve stock parts directly from the inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Technician & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-muted/30 border border-border/70 rounded-2xl">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Assign Technician & Van</Label>
              <Select value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}>
                {mockTechnicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} • {t.van.split(' ')[0]} ({t.activeJobsCount}/{t.maxDailyCapacity} Jobs)
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Job Urgency Priority</Label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="normal">Normal (Routine Check)</option>
                <option value="high">High (Installation/Replacement)</option>
                <option value="urgent">Urgent (Emergency Leak / Breakdown)</option>
              </Select>
            </div>
          </div>

          {/* Customer & Location */}
          <div className="p-3.5 bg-card border border-border/70 rounded-2xl space-y-3">
            <span className="font-bold text-xs font-outfit text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Customer Information & Job Address</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Customer Full Name</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Dr. Zafar Iqbal"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Contact Phone (WhatsApp)</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+92 334 7071759"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Municipal Sector</Label>
                <Select value={sector} onChange={(e) => setSector(e.target.value)}>
                  <option value="Model Town A">Model Town A</option>
                  <option value="Model Town B">Model Town B</option>
                  <option value="Satellite Town">Satellite Town</option>
                  <option value="Cheema Town & Gulberg">Cheema Town & Gulberg</option>
                  <option value="Industrial Estate">Industrial Estate</option>
                  <option value="DHA Phase 5 & Cantt">DHA Phase 5 & Cantt</option>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Street & House Address</Label>
                <Input
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. House 42, Street 3"
                  required
                />
              </div>
            </div>
          </div>

          {/* Job Type & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Service Job Type</Label>
              <Select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="New RO Installation">New RO Installation</option>
                <option value="Membrane Replacement">Membrane Replacement</option>
                <option value="Emergency Leak">Emergency Leak</option>
                <option value="TDS Inspection & Cartridge Swap">TDS Inspection & Cartridge Swap</option>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Scheduled Time Slot</Label>
              <Select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option value="09:30 AM - 11:00 AM">09:30 AM - 11:00 AM (Morning)</option>
                <option value="11:30 AM - 01:30 PM">11:30 AM - 01:30 PM (Midday)</option>
                <option value="02:00 PM - 03:30 PM">02:00 PM - 03:30 PM (Afternoon)</option>
                <option value="04:00 PM - 05:30 PM">04:00 PM - 05:30 PM (Evening)</option>
              </Select>
            </div>
          </div>

          {/* Interactive Spare Parts Allocation Checklist */}
          <div className="p-3.5 bg-muted/20 border border-border/70 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs font-outfit text-foreground flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-primary" />
                <span>Van Spare Parts Allocation Checklist</span>
              </span>
              <button
                type="button"
                onClick={handleAddPart}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Part
              </button>
            </div>

            <div className="space-y-2">
              {allocatedParts.map((part, index) => {
                const prod = catalog.find((p) => p.id === part.productId)
                return (
                  <div key={index} className="flex items-center gap-2 bg-background p-2 rounded-xl border border-border/60">
                    <div className="flex-1">
                      <Select
                        value={part.productId}
                        onChange={(e) => handleUpdatePart(index, 'productId', e.target.value)}
                        className="h-8 text-xs"
                      >
                        {catalog.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.quantity} in stock • Rs. {item.price})
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="w-16">
                      <Input
                        type="number"
                        min="1"
                        max={prod?.quantity || 10}
                        value={part.qty}
                        onChange={(e) => handleUpdatePart(index, 'qty', e.target.value)}
                        className="h-8 text-center text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="w-20 text-right font-mono font-bold text-xs text-foreground">
                      Rs. {((prod?.price || 0) * part.qty).toLocaleString()}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePart(index)}
                      className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Estimated Cost Summary */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Service Fee (PKR):</span>
                <Input
                  type="number"
                  value={visitFee}
                  onChange={(e) => setVisitFee(e.target.value)}
                  className="w-20 h-7 text-xs font-mono"
                />
              </div>
              <div className="text-right">
                <span className="text-muted-foreground mr-1">Estimated Total:</span>
                <strong className="font-mono text-primary font-bold text-sm">
                  PKR {grandTotal.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Symptoms & Diagnostic Notes */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">Technician Symptoms & Field Instructions</Label>
            <Input
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Check raw water TDS before installing 75 GPD membrane."
            />
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit" className="font-bold font-outfit gap-1.5 shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dispatch Ticket to Van</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
