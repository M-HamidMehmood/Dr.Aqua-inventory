import React, { useState } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import CustomerDetailDrawer from './customers/CustomerDetailDrawer'
import BulkWhatsAppModal from './customers/BulkWhatsAppModal'
import AddCustomerModal from './customers/AddCustomerModal'
import { mockCustomerRecords } from '../data/mock/customers.mock'
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  MoreVertical,
  MapPin,
  Calendar,
  Wrench,
  Droplet,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Phone,
} from 'lucide-react'

export default function CustomerManager({ customers = [], onUpdateCustomers }) {
  const [customerList, setCustomerList] = useState(() => {
    return mockCustomerRecords
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [urgencyTab, setUrgencyTab] = useState('all') // 'all' | 'overdue' | 'due_soon' | 'healthy'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Drawers / Modals
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)

  // Notification Toast
  const [toastMessage, setToastMessage] = useState('')
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Filter logic
  const filteredCustomers = customerList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact.includes(searchQuery) ||
      c.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSector =
      sectorFilter === 'all' || c.sector.toLowerCase().includes(sectorFilter.toLowerCase())

    const matchesUrgency =
      urgencyTab === 'all' || c.radarStatus === urgencyTab

    return matchesSearch && matchesSector && matchesUrgency
  })

  // Urgency counts for tabs
  const counts = {
    all: customerList.length,
    overdue: customerList.filter((c) => c.radarStatus === 'overdue').length,
    due_soon: customerList.filter((c) => c.radarStatus === 'due_soon').length,
    healthy: customerList.filter((c) => c.radarStatus === 'healthy').length,
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Handlers
  const handleSaveCustomer = (newCust) => {
    const updated = [newCust, ...customerList]
    setCustomerList(updated)
    if (onUpdateCustomers) onUpdateCustomers(updated)
    showToast(`Registered client: ${newCust.name} in ${newCust.sector}`)
  }

  const handleOpenDirectWhatsApp = (customer) => {
    const rawNumber = customer.contact.replace(/\D/g, '')
    const text = encodeURIComponent(
      `Assalam-o-Alaikum ${customer.name},\nThis is Dr. Aqua Pure Water Solutions Bahawalpur regarding your installed ${customer.installedUnit}.\nYour scheduled filter service is due. Would you like our service van to visit for your complimentary audit?`
    )
    window.open(`https://wa.me/${rawNumber}?text=${text}`, '_blank')
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

      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
        {/* Left: Search & Sector Filter */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search customer, phone, serial..."
              className="pl-9 h-9 text-xs rounded-xl bg-muted/20"
            />
          </div>

          <div className="w-48">
            <Select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="h-9 text-xs"
            >
              <option value="all">All Bahawalpur Sectors</option>
              <option value="Model Town">Model Town A & B</option>
              <option value="Satellite">Satellite Town & One Unit</option>
              <option value="Industrial">Industrial Estate</option>
              <option value="Cheema">Cheema Town & Gulberg</option>
              <option value="DHA">DHA Phase 5 & Cantt</option>
              <option value="Baghdad">Baghdad-ul-Jadeed (IUB)</option>
              <option value="Commercial">Commercial Market</option>
            </Select>
          </div>
        </div>

        {/* Right CTAs: Bulk WhatsApp & Add Customer */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="whatsapp"
            size="sm"
            onClick={() => setIsBulkWhatsAppOpen(true)}
            className="h-9 gap-1.5 text-xs font-bold font-outfit rounded-xl shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Bulk WhatsApp Radar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddCustomerOpen(true)}
            className="h-9 gap-1.5 text-xs font-bold font-outfit rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Urgency Status Tabs Strip */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-2xl border border-border/70 text-xs overflow-x-auto">
        {[
          { id: 'all', label: `All Clients (${counts.all})` },
          { id: 'overdue', label: `🚨 Overdue Service (${counts.overdue})`, badge: 'destructive' },
          { id: 'due_soon', label: `🟡 Due This Month (${counts.due_soon})`, badge: 'warning' },
          { id: 'healthy', label: `🟢 Healthy Calibration (${counts.healthy})`, badge: 'success' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setUrgencyTab(tab.id)
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer truncate ${
              urgencyTab === tab.id
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main High-Density Table */}
      <div className="flex-1 bg-card rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[200px] text-xs font-bold uppercase font-outfit">Customer / Contact</TableHead>
                <TableHead className="w-36 text-xs font-bold uppercase font-outfit">Sector</TableHead>
                <TableHead className="min-w-[220px] text-xs font-bold uppercase font-outfit">Installed Water Plant</TableHead>
                <TableHead className="w-32 text-center text-xs font-bold uppercase font-outfit">TDS Output</TableHead>
                <TableHead className="w-28 text-center text-xs font-bold uppercase font-outfit">Last Service</TableHead>
                <TableHead className="w-32 text-center text-xs font-bold uppercase font-outfit">Radar Health</TableHead>
                <TableHead className="w-12 text-right text-xs font-bold uppercase font-outfit"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border/60">
              {paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                    <div className="text-sm font-semibold">No customer records match this filter</div>
                    <div className="text-xs">Try selecting a different urgency tab or Bahawalpur sector.</div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((cust) => {
                  const isOverdue = cust.radarStatus === 'overdue'
                  const isDueSoon = cust.radarStatus === 'due_soon'

                  return (
                    <TableRow
                      key={cust.id}
                      className="hover:bg-muted/30 transition-colors group cursor-default"
                    >
                      {/* Name & Contact */}
                      <TableCell>
                        <div className="font-bold text-xs text-foreground font-outfit">
                          {cust.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-muted-foreground" />
                          <span>{cust.contact}</span>
                        </div>
                      </TableCell>

                      {/* Sector */}
                      <TableCell>
                        <div className="text-xs font-medium text-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">{cust.sector}</span>
                        </div>
                      </TableCell>

                      {/* Installed Unit & Serial */}
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground line-clamp-1">
                          {cust.installedUnit}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          SN: {cust.serialNumber}
                        </div>
                      </TableCell>

                      {/* TDS Metrics */}
                      <TableCell className="text-center font-mono">
                        <div className="text-xs font-bold text-emerald-600">
                          {cust.permeateTdsPpm} PPM
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Feed: {cust.feedTdsPpm} PPM
                        </div>
                      </TableCell>

                      {/* Last Service Date */}
                      <TableCell className="text-center font-mono">
                        <div className="text-xs font-medium text-foreground">
                          {cust.lastServiceDate}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {cust.daysSinceLastService}d ago
                        </div>
                      </TableCell>

                      {/* Radar Status Badge */}
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            isOverdue
                              ? 'destructive'
                              : isDueSoon
                              ? 'warning'
                              : 'success'
                          }
                          className="font-mono text-[10px] font-bold px-2 py-0.5"
                        >
                          {isOverdue ? 'Overdue Service' : isDueSoon ? 'Due Soon' : 'Healthy'}
                        </Badge>
                      </TableCell>

                      {/* Actions Menu */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCustomer(cust)
                                setIsDetailOpen(true)
                              }}
                              className="gap-2"
                            >
                              <Users className="w-3.5 h-3.5 text-primary" />
                              <span>View 360° Profile</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleOpenDirectWhatsApp(cust)}
                              className="gap-2 text-emerald-600 focus:text-emerald-600"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Direct WhatsApp</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCustomer(cust)
                                setIsDetailOpen(true)
                              }}
                              className="gap-2"
                            >
                              <Wrench className="w-3.5 h-3.5 text-amber-600" />
                              <span>Book Service Ticket</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-border/70 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium">
            <span>Showing</span>
            <strong className="text-foreground">
              {filteredCustomers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(currentPage * pageSize, filteredCustomers.length)}
            </strong>
            <span>of</span>
            <strong className="text-foreground">{filteredCustomers.length}</strong>
            <span>customers</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-mono text-xs font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Screen 12: Customer 360° Drawer */}
      <CustomerDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedCustomer(null)
        }}
        customer={selectedCustomer}
        onDispatchService={(cust) => {
          showToast(`Service Van assigned for ${cust.name} in ${cust.sector}`)
        }}
      />

      {/* Screen 13: Bulk WhatsApp Broadcast Center */}
      <BulkWhatsAppModal
        isOpen={isBulkWhatsAppOpen}
        onClose={() => setIsBulkWhatsAppOpen(false)}
        customers={customerList}
      />

      {/* Screen 14: Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSaveCustomer={handleSaveCustomer}
      />
    </div>
  )
}
