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
import { Textarea } from '../ui/textarea'
import { UserPlus, Sparkles, Droplet, Calendar, Check } from 'lucide-react'

export default function AddCustomerModal({ isOpen, onClose, onSaveCustomer }) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [email, setEmail] = useState('')
  const [sector, setSector] = useState('Model Town B')
  const [address, setAddress] = useState('')
  const [installedUnit, setInstalledUnit] = useState('R.O 100 Gallon Per Day Plant (With Heavy Iron Stand)')
  const [serialNumber, setSerialNumber] = useState(`DRA-2023-RO-${Math.floor(100 + Math.random() * 900)}`)
  const [feedTds, setFeedTds] = useState('380')
  const [permeateTds, setPermeateTds] = useState('22')
  const [cycleDays, setCycleDays] = useState('60')
  const [notes, setNotes] = useState('')

  const handleAutoGenerateSerial = () => {
    setSerialNumber(`DRA-2023-RO-${Math.floor(100 + Math.random() * 900)}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const feed = parseInt(feedTds, 10) || 400
    const perm = parseInt(permeateTds, 10) || 20
    const rejection = feed > 0 ? (((feed - perm) / feed) * 100).toFixed(1) : 95

    const newCustomer = {
      id: Date.now(),
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@client.pk`,
      sector,
      address: address.trim() || `${sector}, Bahawalpur`,
      installedUnit,
      serialNumber,
      installDate: new Date().toISOString().slice(0, 10),
      daysSinceLastService: 0,
      lastServiceDate: new Date().toISOString().slice(0, 10),
      nextServiceDue: new Date(Date.now() + parseInt(cycleDays, 10) * 86400000).toISOString().slice(0, 10),
      radarStatus: 'healthy',
      feedTdsPpm: feed,
      permeateTdsPpm: perm,
      membraneRejectionRate: parseFloat(rejection),
      totalVisitsCount: 1,
      notes,
      serviceHistory: [
        {
          id: `SRV-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          technician: 'Senior Field Engineer',
          serviceType: 'Initial Installation',
          partsReplaced: [installedUnit],
          feedTds: feed,
          permeateTds: perm,
          costPkr: 28500,
          status: 'Completed',
          technicianNotes: 'Installation commissioned and calibrated successfully.',
        },
      ],
    }

    onSaveCustomer(newCustomer)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6 rounded-3xl border-border/80 shadow-2xl space-y-4">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold font-outfit text-foreground">
                Register Customer & Activate Service Radar
              </DialogTitle>
              <DialogDescription className="text-xs">
                Creates customer 360° telemetry record and schedules automated 1M/2M radar alerts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Customer Full Name</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Salman Farooq"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">WhatsApp Mobile (+92)</Label>
              <Input
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Sector & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Bahawalpur Sector</Label>
              <Select value={sector} onChange={(e) => setSector(e.target.value)}>
                <option value="Model Town A">Model Town A</option>
                <option value="Model Town B">Model Town B</option>
                <option value="Satellite Town">Satellite Town & One Unit</option>
                <option value="Cheema Town & Gulberg">Cheema Town & Gulberg</option>
                <option value="DHA Phase 5 & Cantt">DHA Phase 5 & Cantt</option>
                <option value="Industrial Estate">Industrial Estate (Small & Large)</option>
                <option value="Baghdad-ul-Jadeed">Baghdad-ul-Jadeed (IUB Sector)</option>
                <option value="Commercial Market">Commercial Market & Old Gates</option>
                <option value="Trust Colony & Shadman">Trust Colony & Shadman</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Street / House Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House #, Street #, Colony"
                className="text-xs"
              />
            </div>
          </div>

          {/* Installed Equipment & Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Installed Water Plant</Label>
              <Select value={installedUnit} onChange={(e) => setInstalledUnit(e.target.value)}>
                <option value="R.O 100 Gallon Per Day Plant (With Heavy Iron Stand)">
                  R.O 100 GPD Plant (Heavy Iron Stand)
                </option>
                <option value="R.O Water Master 100 GPD (Without Stand, Under-Sink)">
                  R.O Water Master 100 GPD (Under-Sink)
                </option>
                <option value="Aspire 100 GPD Domestic RO System (Luxury Series)">
                  Aspire 100 GPD Domestic RO (Luxury)
                </option>
                <option value="Commercial RO Plant 500 GPD (SS304 Stainless Skid)">
                  Commercial 500 GPD Skid System
                </option>
                <option value="Jumbo Filter 2-Stage Whole House System (20' Big Blue)">
                  Jumbo 2-Stage 20" Whole House Filter
                </option>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Machine Serial Number</Label>
                <button
                  type="button"
                  onClick={handleAutoGenerateSerial}
                  className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                >
                  Regen
                </button>
              </div>
              <Input
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="font-mono text-xs font-bold uppercase"
              />
            </div>
          </div>

          {/* TDS Telemetry & Radar Cycle */}
          <div className="p-3.5 bg-muted/30 border border-border/70 rounded-2xl space-y-2">
            <div className="font-bold text-xs text-foreground font-outfit flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-primary" />
              <span>Initial TDS Water Quality & Service Radar</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Raw Feed TDS (PPM)</Label>
                <Input
                  type="number"
                  value={feedTds}
                  onChange={(e) => setFeedTds(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Permeate TDS (PPM)</Label>
                <Input
                  type="number"
                  value={permeateTds}
                  onChange={(e) => setPermeateTds(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Radar Audit Interval</Label>
                <Select value={cycleDays} onChange={(e) => setCycleDays(e.target.value)}>
                  <option value="30">30 Days (High Salinity)</option>
                  <option value="60">60 Days (Standard 2M)</option>
                  <option value="90">90 Days (Pre-Filter Only)</option>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold font-outfit gap-1.5">
              <Check className="w-4 h-4" />
              <span>Register & Start Radar</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
