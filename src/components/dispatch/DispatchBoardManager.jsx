import React, { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { ScrollArea } from '../ui/scroll-area'
import CreateServiceTicketModal from './CreateServiceTicketModal'
import { mockTechnicians, mockServiceTickets } from '../../data/mock/technicians.mock'
import { mockInventoryRecords } from '../../data/mock/inventory.mock'
import {
  Truck,
  Wrench,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Boxes,
  ShieldCheck,
  Filter,
} from 'lucide-react'

export default function DispatchBoardManager({ inventory = [] }) {
  const [technicians, setTechnicians] = useState(mockTechnicians)
  const [tickets, setTickets] = useState(mockServiceTickets)
  const [selectedSector, setSelectedSector] = useState('all')
  const [selectedDateFilter, setSelectedDateFilter] = useState('today') // 'today' | 'tomorrow'
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('')
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSector =
      selectedSector === 'all' || ticket.sector.toLowerCase().includes(selectedSector.toLowerCase())
    return matchesSector
  })

  const handleCreateTicket = (newTicket) => {
    setTickets([newTicket, ...tickets])
    // Update technician count
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id === newTicket.technicianId) {
          return { ...t, activeJobsCount: Math.min(t.maxDailyCapacity, t.activeJobsCount + 1) }
        }
        return t
      })
    )
    showToast(`Service ticket ${newTicket.ticketNumber} dispatched to ${newTicket.technicianName}!`)
  }

  const handleToggleStatus = (ticketId) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const nextStatus = t.status === 'assigned' ? 'in_progress' : t.status === 'in_progress' ? 'completed' : 'assigned'
          return { ...t, status: nextStatus }
        }
        return t
      })
    )
    showToast('Work order status updated.')
  }

  const getJobBadge = (jobType) => {
    switch (jobType) {
      case 'New RO Installation':
        return 'bg-cyan-500/15 text-cyan-800 border-cyan-500/30'
      case 'Membrane Replacement':
        return 'bg-indigo-500/15 text-indigo-800 border-indigo-500/30'
      case 'Emergency Leak':
        return 'bg-rose-500/15 text-rose-800 border-rose-500/30'
      default:
        return 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[640px] space-y-4 font-sans text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base font-outfit text-foreground">
              Field Technician Dispatch & Fleet Operations
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-800 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>4 Mobile Vans Active</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Real-time schedule allocation, Bahawalpur municipal zone routing, and spare parts depletion tracking.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Selector Toggle */}
          <div className="flex items-center bg-muted/50 p-0.5 rounded-xl border border-border/70 text-xs">
            <button
              type="button"
              onClick={() => setSelectedDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedDateFilter === 'today'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Today (Nov 03)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDateFilter('tomorrow')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedDateFilter === 'tomorrow'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tomorrow
            </button>
          </div>

          {/* Sector Filter Dropdown */}
          <div className="w-36">
            <Select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="h-9 text-xs"
            >
              <option value="all">All Sectors</option>
              <option value="Model Town">Model Town</option>
              <option value="Satellite Town">Satellite Town</option>
              <option value="Industrial">Industrial</option>
              <option value="DHA">DHA & Cantt</option>
            </Select>
          </div>

          <Button
            size="sm"
            onClick={() => setIsTicketModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-bold font-outfit rounded-xl shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Service Ticket</span>
          </Button>
        </div>
      </div>

      {/* Multi-Column Technician Board (4 Columns) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 overflow-hidden">
        {technicians.map((tech) => {
          const techTickets = filteredTickets.filter((t) => t.technicianId === tech.id)
          const capacityPercent = Math.round((tech.activeJobsCount / tech.maxDailyCapacity) * 100)

          return (
            <div
              key={tech.id}
              className="bg-card border border-border/70 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs"
            >
              {/* Technician Column Header Plaque */}
              <div className="p-3.5 bg-muted/30 border-b border-border/60 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs font-outfit">
                      {tech.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-xs font-outfit text-foreground leading-tight">
                        {tech.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{tech.van}</div>
                    </div>
                  </div>

                  <Badge
                    variant={tech.status === 'Active on Route' ? 'success' : 'outline'}
                    className="text-[9px] font-semibold"
                  >
                    {tech.status}
                  </Badge>
                </div>

                {/* Capacity & Zone */}
                <div className="pt-1 text-[10px] text-muted-foreground flex items-center justify-between border-t border-border/40">
                  <span className="truncate max-w-[150px]">{tech.assignedZone}</span>
                  <strong className="font-mono text-foreground font-semibold">
                    {techTickets.length}/{tech.maxDailyCapacity} Jobs
                  </strong>
                </div>
              </div>

              {/* Work Order Cards Stream */}
              <ScrollArea className="flex-1 p-2.5 space-y-2.5">
                {techTickets.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground/60 text-xs">
                    No tickets scheduled for this route
                  </div>
                ) : (
                  techTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3 bg-muted/20 hover:bg-muted/40 border border-border/60 rounded-2xl space-y-2 select-none transition-all"
                    >
                      {/* Card Header: Time Slot & Job Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>{ticket.timeSlot}</span>
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-semibold border ${getJobBadge(ticket.jobType)}`}
                        >
                          {ticket.jobType}
                        </Badge>
                      </div>

                      {/* Customer Details */}
                      <div>
                        <div className="font-bold text-xs text-foreground font-outfit truncate">
                          {ticket.customerName}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
                          <span className="truncate">{ticket.sector} • {ticket.streetAddress}</span>
                        </div>
                      </div>

                      {/* Allocated Parts Pills */}
                      {ticket.allocatedParts && ticket.allocatedParts.length > 0 && (
                        <div className="p-1.5 bg-background rounded-xl border border-border/50 text-[10px] text-muted-foreground space-y-0.5">
                          <div className="font-semibold text-[9px] uppercase text-muted-foreground flex items-center gap-1">
                            <Boxes className="w-2.5 h-2.5 text-primary" />
                            <span>Allocated Parts:</span>
                          </div>
                          {ticket.allocatedParts.map((p, idx) => (
                            <div key={idx} className="truncate font-mono text-foreground">
                              • {p.name} (x{p.qty})
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Symptoms */}
                      <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
                        "{ticket.symptoms}"
                      </p>

                      {/* Footer: Fee & Status Toggle */}
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-foreground">
                          PKR {ticket.feePkr?.toLocaleString()}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(ticket.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                            ticket.status === 'completed'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700'
                              : ticket.status === 'in_progress'
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-700'
                              : 'bg-background border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {ticket.status === 'completed'
                            ? '✓ Completed'
                            : ticket.status === 'in_progress'
                            ? '⚡ In Progress'
                            : 'Mark Active'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          )
        })}
      </div>

      {/* Screen 22: Create Service Ticket Modal */}
      <CreateServiceTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        inventory={inventory}
        onCreateTicket={handleCreateTicket}
      />
    </div>
  )
}
