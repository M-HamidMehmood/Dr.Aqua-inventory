import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './ui/Card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/Dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './ui/Table'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Badge } from './ui/Badge'
import {
  Wrench,
  MessageSquare,
  Phone,
  Check,
  Search,
  Clock,
  AlertCircle,
  X,
  Plus,
  Calendar,
  Sun,
  Droplets,
  CheckCheck,
  CheckCircle2,
  Boxes,
  MapPin,
  Trash2,
  ShieldCheck,
} from './ui/Icons'
import { useLanguage } from '../context/LanguageContext'
import { formatCurrency } from '../utils/translations'
import WhatsAppPreviewModal from './WhatsAppPreviewModal'
import {
  TECHNICIANS_LIST,
  TIME_SLOTS,
  SERVICE_TYPES,
} from '../data/initialBookings'

export default function ServiceManager({
  bookings,
  updateBookings,
  inventory,
  updateInventory,
  customers,
  updateCustomers,
  userRole = 'admin',
}) {
  const { t, language, isRTL } = useLanguage()

  // Active view: 'bookings' | 'intervals'
  const [activeTab, setActiveTab] = useState('bookings')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState(null)

  // WhatsApp Modal State
  const [whatsAppModal, setWhatsAppModal] = useState({
    isOpen: false,
    recipientName: '',
    recipientPhone: '',
    defaultTemplate: 'booking',
    contextData: {},
  })

  // Schedule New Booking Modal State
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [bookingAddress, setBookingAddress] = useState('')
  const [bookingCity, setBookingCity] = useState('Islamabad')
  const [bookingServiceType, setBookingServiceType] = useState('RO Plant Installation')
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  )
  const [bookingTimeSlot, setBookingTimeSlot] = useState('09:00 AM - 12:00 PM')
  const [bookingTech, setBookingTech] = useState(TECHNICIANS_LIST[0].name)
  const [bookingLabor, setBookingLabor] = useState('3500')
  const [bookingNotes, setBookingNotes] = useState('')

  // Completion & Parts Deduction Modal State
  const [completeJobTarget, setCompleteJobTarget] = useState(null)
  const [tdsBefore, setTdsBefore] = useState('')
  const [tdsAfter, setTdsAfter] = useState('')
  const [settlementLabor, setSettlementLabor] = useState(0)
  const [selectedPartsList, setSelectedPartsList] = useState([])
  const [partToAddId, setPartToAddId] = useState('')
  const [partToAddQty, setPartToAddQty] = useState(1)
  const [settlementNotes, setSettlementNotes] = useState('')

  const showNotice = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4500)
  }

  // --- AUTOMATED ROUTINE SERVICE INTERVALS (1-month & 2-month checks from purchase history) ---
  const now = new Date()
  const routineVisits = []

  customers.forEach((c) => {
    if (c.history && c.history.length > 0) {
      const lastSale = c.history[c.history.length - 1]
      if (!lastSale) return
      const lastPurchase = new Date(lastSale.date)
      const diffMs = now.getTime() - lastPurchase.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffMonths = diffDays / 30

      if (diffMonths >= 1) {
        const isTwoMonth = diffMonths >= 2
        routineVisits.push({
          customerId: c.id,
          customerName: c.name,
          customerContact: c.contact,
          type: isTwoMonth ? '2-month' : '1-month',
          serviceType: isTwoMonth
            ? (language === 'ur' ? '2 ماہ کا فلٹر تبدیل' : '2-Month Filter Replacement')
            : (language === 'ur' ? '1 ماہ کی روٹین سروس' : '1-Month Maintenance Check'),
          diffDays,
          lastPurchaseDate: lastPurchase.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US'),
          installedItems: lastSale.items || [],
        })
      }
    }
  })

  // Open WhatsApp Modal for a booking or routine visit
  const handleOpenWhatsApp = (recipientName, recipientPhone, defaultTemplate, contextData = {}) => {
    setWhatsAppModal({
      isOpen: true,
      recipientName,
      recipientPhone,
      defaultTemplate,
      contextData,
    })
  }

  // Open Settle Job & Deduct Parts Modal
  const handleOpenCompleteModal = (booking) => {
    setCompleteJobTarget(booking)
    setTdsBefore(booking.tdsReadingBefore || '')
    setTdsAfter(booking.tdsReadingAfter || '')
    setSettlementLabor(booking.laborFee || 1500)
    setSelectedPartsList(booking.partsUsed ? [...booking.partsUsed] : [])
    setPartToAddId('')
    setPartToAddQty(1)
    setSettlementNotes(booking.notes || '')
  }

  // Add Part to Job Modal Draft
  const handleAddPartToJob = () => {
    if (!partToAddId) return
    const product = inventory.find((p) => p.id === Number(partToAddId))
    if (!product) return

    const qty = Math.max(1, Number(partToAddQty) || 1)
    if (qty > product.quantity) {
      alert(
        language === 'ur'
          ? `ناکافی اسٹاک! صرف ${product.quantity} یونٹس دستیاب ہیں۔`
          : `Insufficient stock! Only ${product.quantity} units available.`,
      )
      return
    }

    // Check if already in list
    const existingIndex = selectedPartsList.findIndex((p) => p.productId === product.id)
    if (existingIndex >= 0) {
      const updated = [...selectedPartsList]
      const newQty = updated[existingIndex].qty + qty
      if (newQty > product.quantity) {
        alert(
          language === 'ur'
            ? `مجموعی تعداد دستیاب اسٹاک (${product.quantity}) سے زیادہ ہے۔`
            : `Total requested quantity exceeds stock (${product.quantity}).`,
        )
        return
      }
      updated[existingIndex].qty = newQty
      updated[existingIndex].total = newQty * updated[existingIndex].unitPrice
      setSelectedPartsList(updated)
    } else {
      setSelectedPartsList([
        ...selectedPartsList,
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          urduName: product.urduName,
          qty,
          unitPrice: product.price,
          total: qty * product.price,
        },
      ])
    }

    setPartToAddId('')
    setPartToAddQty(1)
  }

  const handleRemovePartFromJob = (index) => {
    setSelectedPartsList((prev) => prev.filter((_, i) => i !== index))
  }

  // Confirm Completion & Atomically Deduct Parts from Inventory
  const handleConfirmCompletion = () => {
    if (!completeJobTarget) return

    // Verify inventory quantities
    for (const part of selectedPartsList) {
      const product = inventory.find((p) => p.id === part.productId)
      if (!product || product.quantity < part.qty) {
        alert(
          language === 'ur'
            ? `اسٹاک کی کمی: ${part.name} دستیاب نہیں ہے۔`
            : `Stock deficit: ${part.name} does not have enough inventory.`,
        )
        return
      }
    }

    // 1. Atomically deduct parts from inventory
    if (selectedPartsList.length > 0) {
      const updatedInventory = inventory.map((product) => {
        const used = selectedPartsList.find((p) => p.productId === product.id)
        if (used) {
          return {
            ...product,
            quantity: Math.max(0, product.quantity - used.qty),
          }
        }
        return product
      })
      updateInventory(updatedInventory)
    }

    const partsTotal = selectedPartsList.reduce((sum, p) => sum + p.total, 0)
    const labor = Math.max(0, Number(settlementLabor) || 0)
    const totalCharges = partsTotal + labor

    const completedBookingData = {
      ...completeJobTarget,
      status: 'Completed',
      partsUsed: selectedPartsList,
      tdsReadingBefore: tdsBefore ? Number(tdsBefore) : undefined,
      tdsReadingAfter: tdsAfter ? Number(tdsAfter) : undefined,
      laborFee: labor,
      partsTotal,
      totalCharges,
      notes: settlementNotes,
      completedAt: new Date().toISOString(),
    }

    // 2. Update Bookings State
    const updatedBookings = bookings.map((b) =>
      b.id === completeJobTarget.id ? completedBookingData : b,
    )
    updateBookings(updatedBookings)

    // 3. Register service history in Customer profile
    if (completeJobTarget.customerId) {
      const updatedCustomers = customers.map((c) => {
        if (c.id === completeJobTarget.customerId) {
          const prevHistory = c.serviceHistory || []
          return {
            ...c,
            serviceHistory: [completedBookingData, ...prevHistory],
          }
        }
        return c
      })
      updateCustomers(updatedCustomers)
    }

    const targetCustomerName = completeJobTarget.customerName
    const targetCustomerPhone = completeJobTarget.customerContact

    setCompleteJobTarget(null)
    showNotice(t('serviceCompletedSuccess'), 'success')

    // 4. Offer instant WhatsApp TDS report
    setTimeout(() => {
      handleOpenWhatsApp(targetCustomerName, targetCustomerPhone, 'report', completedBookingData)
    }, 400)
  }

  // Handle New Booking Creation
  const handleCreateBooking = (e) => {
    e.preventDefault()

    let custName = newCustomerName.trim()
    let custPhone = newCustomerPhone.trim()
    let custId = selectedCustomerId ? Number(selectedCustomerId) : null

    if (selectedCustomerId) {
      const found = customers.find((c) => c.id === Number(selectedCustomerId))
      if (found) {
        custName = found.name
        custPhone = found.contact
        custId = found.id
      }
    }

    if (!custName || !custPhone) {
      alert(language === 'ur' ? 'براہ کرم کسٹمر کا نام اور فون درج کریں۔' : 'Please provide customer name and phone.')
      return
    }

    // If new customer, auto-register in CRM
    if (!custId) {
      custId = Date.now()
      const newCust = {
        id: custId,
        name: custName,
        contact: custPhone,
        history: [],
        serviceHistory: [],
      }
      updateCustomers([...customers, newCust])
    }

    const techObj = TECHNICIANS_LIST.find((t) => t.name === bookingTech)
    const labor = Math.max(0, Number(bookingLabor) || 0)

    const newBooking = {
      id: `BK-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      customerId: custId,
      customerName: custName,
      customerContact: custPhone,
      address: bookingAddress,
      city: bookingCity,
      serviceType: bookingServiceType,
      scheduledDate: bookingDate,
      timeSlot: bookingTimeSlot,
      technicianName: bookingTech,
      technicianPhone: techObj ? techObj.phone : '',
      status: 'Scheduled',
      partsUsed: [],
      laborFee: labor,
      partsTotal: 0,
      totalCharges: labor,
      notes: bookingNotes,
      createdAt: new Date().toISOString(),
    }

    updateBookings([newBooking, ...bookings])
    setIsNewBookingModalOpen(false)

    // Reset inputs
    setSelectedCustomerId('')
    setNewCustomerName('')
    setNewCustomerPhone('')
    setBookingAddress('')
    setBookingNotes('')

    showNotice(
      language === 'ur'
        ? `بکنگ ${newBooking.id} کامیابی سے شیڈول ہو گئی!`
        : `Booking ${newBooking.id} scheduled successfully!`,
      'success',
    )

    // Prompt WhatsApp booking confirmation
    setTimeout(() => {
      handleOpenWhatsApp(custName, custPhone, 'booking', newBooking)
    }, 300)
  }

  // Update Status directly (e.g. In Progress, Cancelled)
  const handleUpdateStatus = (bookingId, nextStatus) => {
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b))
    updateBookings(updated)
    showNotice(
      language === 'ur'
        ? `بکنگ کی حالت ${nextStatus} میں تبدیل کر دی گئی۔`
        : `Booking status changed to ${nextStatus}.`,
      'info',
    )
  }

  // Delete booking
  const handleDeleteBooking = (bookingId) => {
    if (window.confirm(language === 'ur' ? 'کیا آپ واقعی اس سروس بکنگ کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this service booking?')) {
      updateBookings(bookings.filter((b) => b.id !== bookingId))
    }
  }

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      statusFilter === 'all' ? true : b.status.toLowerCase() === statusFilter.toLowerCase()

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.customerContact.includes(searchQuery) ||
          b.technicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.city && b.city.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStatus && matchesSearch
  })

  // Counters
  const scheduledCount = bookings.filter((b) => b.status === 'Scheduled').length
  const inProgressCount = bookings.filter((b) => b.status === 'In Progress').length
  const completedCount = bookings.filter((b) => b.status === 'Completed').length

  const getServiceTypeBadge = (type) => {
    if (type.includes('RO Plant')) return { variant: 'info', icon: Droplets }
    if (type.includes('Solar')) return { variant: 'warning', icon: Sun }
    if (type.includes('TDS')) return { variant: 'purple', icon: ShieldCheck }
    return { variant: 'secondary', icon: Wrench }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return { variant: 'info', label: t('statusScheduled') }
      case 'In Progress':
        return { variant: 'warning', label: t('statusInProgress') }
      case 'Completed':
        return { variant: 'success', label: t('statusCompleted') }
      case 'Cancelled':
        return { variant: 'destructive', label: t('statusCancelled') }
      default:
        return { variant: 'secondary', label: status }
    }
  }

  // Calculate live parts cost in settlement modal
  const modalPartsCost = selectedPartsList.reduce((sum, p) => sum + p.total, 0)
  const modalGrandTotal = modalPartsCost + (Number(settlementLabor) || 0)

  return (
    <div className='space-y-6'>
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-lg animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-primary/10 border-primary/20 text-primary'
          }`}
        >
          <div className='flex items-center gap-2 text-xs font-semibold'>
            <CheckCircle2 className='w-4 h-4 text-emerald-600' />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className='text-xs opacity-70 hover:opacity-100 cursor-pointer'
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner & Stats */}
      <Card className='border-border bg-gradient-to-br from-primary/5 via-card to-card'>
        <CardHeader className='pb-4'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <Badge variant='purple' className='text-[10px] uppercase font-bold tracking-wider'>
                  <Wrench className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {language === 'ur' ? 'فیز 4: سروس اور تنصیبات' : 'Phase 4: Field Engineering & Service'}
                </Badge>
              </div>
              <CardTitle className='text-xl font-bold'>{t('servicesTitle')}</CardTitle>
              <CardDescription className='text-xs max-w-xl'>{t('servicesDesc')}</CardDescription>
            </div>

            <div className='flex flex-wrap items-center gap-2.5'>
              <Button
                variant='success'
                size='sm'
                onClick={() => setIsNewBookingModalOpen(true)}
                className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-subtle cursor-pointer'
              >
                <Plus className='w-4 h-4' />
                <span>{t('scheduleNewService')}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* 4 KPI Cards */}
        <CardContent className='pt-0 border-t border-border/60'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3'>
            <div className='bg-card p-3 rounded-xl border border-border shadow-subtle text-center'>
              <div className='text-xs text-muted-foreground uppercase font-semibold'>{t('filterAllBookings')}</div>
              <div className='text-2xl font-black text-foreground font-mono mt-0.5'>{bookings.length}</div>
            </div>
            <div className='bg-card p-3 rounded-xl border border-border shadow-subtle text-center'>
              <div className='text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold'>{t('statusScheduled')}</div>
              <div className='text-2xl font-black text-blue-600 font-mono mt-0.5'>{scheduledCount}</div>
            </div>
            <div className='bg-card p-3 rounded-xl border border-border shadow-subtle text-center'>
              <div className='text-xs text-amber-600 dark:text-amber-400 uppercase font-semibold'>{t('statusInProgress')}</div>
              <div className='text-2xl font-black text-amber-600 font-mono mt-0.5'>{inProgressCount}</div>
            </div>
            <div className='bg-card p-3 rounded-xl border border-border shadow-subtle text-center'>
              <div className='text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold'>{t('statusCompleted')}</div>
              <div className='text-2xl font-black text-emerald-600 font-mono mt-0.5'>{completedCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs Navigation: Scheduled Bookings vs Routine Maintenance Lifespans */}
      <div className='flex border-b border-border gap-2'>
        <button
          type='button'
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 cursor-pointer transition-all ${
            activeTab === 'bookings'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className='w-4 h-4' />
          <span>{t('scheduledJobsTab')}</span>
          <span className='px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-mono'>
            {bookings.length}
          </span>
        </button>

        <button
          type='button'
          onClick={() => setActiveTab('intervals')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 cursor-pointer transition-all ${
            activeTab === 'intervals'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className='w-4 h-4' />
          <span>{t('routineIntervalsTab')}</span>
          {routineVisits.length > 0 && (
            <span className='px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold'>
              {routineVisits.length}
            </span>
          )}
        </button>
      </div>

      {/* ================= VIEW 1: SCHEDULED BOOKINGS & INSTALLATIONS ================= */}
      {activeTab === 'bookings' && (
        <div className='space-y-4'>
          {/* Filter Pills and Search */}
          <Card>
            <CardContent className='p-3.5 flex flex-wrap items-center justify-between gap-3'>
              <div className='flex flex-wrap gap-1.5'>
                {[
                  { id: 'all', label: t('filterAllBookings'), count: bookings.length },
                  { id: 'Scheduled', label: t('statusScheduled'), count: scheduledCount },
                  { id: 'In Progress', label: t('statusInProgress'), count: inProgressCount },
                  { id: 'Completed', label: t('statusCompleted'), count: completedCount },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      statusFilter === f.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-subtle'
                        : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {f.label} (<span className='font-mono'>{f.count}</span>)
                  </button>
                ))}
              </div>

              <div className='w-full sm:w-64 relative'>
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 w-4 h-4 text-muted-foreground`} />
                <Input
                  type='text'
                  placeholder={language === 'ur' ? 'بکنگ نمبر، کسٹمر، شہر، ٹیکنیشن...' : 'Search booking, client, city...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isRTL ? 'pr-9 pl-8' : 'pl-9 pr-8'} h-9 text-xs`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute ${isRTL ? 'left-2.5' : 'right-2.5'} top-2.5 text-muted-foreground hover:text-foreground cursor-pointer`}
                  >
                    <X className='w-3.5 h-3.5' />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bookings Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {filteredBookings.map((b) => {
              const typeBadge = getServiceTypeBadge(b.serviceType)
              const statusBadge = getStatusBadge(b.status)
              const TypeIcon = typeBadge.icon

              return (
                <Card
                  key={b.id}
                  className={`flex flex-col justify-between border transition-all shadow-subtle ${
                    b.status === 'Completed'
                      ? 'border-emerald-200/80 bg-emerald-50/5 dark:border-emerald-900/50'
                      : b.status === 'In Progress'
                      ? 'border-amber-300 dark:border-amber-900/70 bg-amber-50/10'
                      : 'border-border'
                  }`}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='font-mono font-bold text-xs text-primary'>{b.id}</span>
                          <Badge variant={typeBadge.variant} className='text-[10px] gap-1 px-1.5 py-0'>
                            <TypeIcon className='w-3 h-3' />
                            <span>{b.serviceType}</span>
                          </Badge>
                        </div>
                        <CardTitle className='text-base font-bold text-foreground mt-1'>
                          {b.customerName}
                        </CardTitle>
                      </div>

                      <Badge variant={statusBadge.variant} className='text-[10px] font-semibold'>
                        {statusBadge.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className='space-y-3 pb-3 text-xs'>
                    {/* Schedule & Location */}
                    <div className='p-3 bg-muted/40 rounded-xl space-y-1.5 border border-border/80'>
                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground flex items-center gap-1.5'>
                          <Calendar className='w-3.5 h-3.5 text-primary' />
                          <span>{t('serviceDate')}:</span>
                        </span>
                        <strong className='text-foreground font-mono'>
                          {b.scheduledDate} ({b.timeSlot})
                        </strong>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground flex items-center gap-1.5'>
                          <Phone className='w-3.5 h-3.5 text-emerald-600' />
                          <span>{t('contactNumber')}:</span>
                        </span>
                        <span className='font-mono font-medium text-foreground' dir='ltr'>
                          {b.customerContact}
                        </span>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground flex items-center gap-1.5'>
                          <MapPin className='w-3.5 h-3.5 text-muted-foreground' />
                          <span>{t('clientAddress')}:</span>
                        </span>
                        <span className='font-medium text-foreground truncate max-w-[220px]' title={b.address}>
                          {b.address}, {b.city}
                        </span>
                      </div>

                      <div className='flex items-center justify-between pt-1 border-t border-border/60'>
                        <span className='text-muted-foreground flex items-center gap-1.5'>
                          <Wrench className='w-3.5 h-3.5 text-primary' />
                          <span>{t('assignedTechnician')}:</span>
                        </span>
                        <Badge variant='outline' className='text-[10px] font-semibold'>
                          {b.technicianName}
                        </Badge>
                      </div>
                    </div>

                    {/* Replaced Parts (Auto-deducted from Stock) */}
                    {b.partsUsed && b.partsUsed.length > 0 && (
                      <div className='p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-[11px]'>
                        <div className='font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between'>
                          <span className='flex items-center gap-1'>
                            <Boxes className='w-3.5 h-3.5' />
                            <span>{t('partsUsedLabel')} ({b.partsUsed.length})</span>
                          </span>
                          <span className='font-mono'>{formatCurrency(b.partsTotal, language)}</span>
                        </div>
                        <div className='space-y-0.5 text-muted-foreground'>
                          {b.partsUsed.map((p, idx) => (
                            <div key={idx} className='flex justify-between'>
                              <span>• {p.qty}x {language === 'ur' && p.urduName ? p.urduName : p.name}</span>
                              <span className='font-mono'>{formatCurrency(p.total, language)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Water TDS Readings if Completed */}
                    {b.status === 'Completed' && (b.tdsReadingBefore || b.tdsReadingAfter) && (
                      <div className='grid grid-cols-2 gap-2 text-center p-2 rounded-lg bg-card border border-border'>
                        <div className='p-1 rounded bg-muted/50'>
                          <div className='text-[10px] text-muted-foreground'>{language === 'ur' ? 'پہلے TDS' : 'TDS Before'}</div>
                          <div className='text-sm font-bold font-mono text-destructive'>{b.tdsReadingBefore ?? '—'} ppm</div>
                        </div>
                        <div className='p-1 rounded bg-emerald-500/10 border border-emerald-500/20'>
                          <div className='text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold'>{language === 'ur' ? 'بعد میں TDS' : 'TDS After'}</div>
                          <div className='text-sm font-bold font-mono text-emerald-600'>{b.tdsReadingAfter ?? '—'} ppm</div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {b.notes && (
                      <div className='text-[11px] text-muted-foreground italic bg-muted/20 p-2 rounded border border-border/40'>
                        "{b.notes}"
                      </div>
                    )}

                    {/* Financial charges summary */}
                    <div className='flex items-center justify-between pt-1 border-t border-border'>
                      <span className='text-muted-foreground text-[11px]'>{t('totalServiceBill')}:</span>
                      <span className='text-sm font-bold text-foreground font-mono'>
                        {formatCurrency(b.totalCharges || b.laborFee, language)}
                      </span>
                    </div>
                  </CardContent>

                  {/* Actions & WhatsApp 1-Click Button */}
                  <CardFooter className='pt-3 border-t border-border bg-muted/10 flex flex-col gap-2'>
                    <div className='grid grid-cols-2 gap-2 w-full'>
                      {/* WhatsApp 1-Click Button with Preview */}
                      <Button
                        variant='success'
                        size='sm'
                        onClick={() =>
                          handleOpenWhatsApp(
                            b.customerName,
                            b.customerContact,
                            b.status === 'Completed' ? 'report' : 'booking',
                            b,
                          )
                        }
                        className='bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 cursor-pointer shadow-subtle gap-1.5'
                      >
                        <MessageSquare className='w-3.5 h-3.5' />
                        <span>WhatsApp (wa.me)</span>
                      </Button>

                      {/* Call Client */}
                      <a
                        href={`tel:${b.customerContact}`}
                        className='inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer'
                      >
                        <Phone className='w-3.5 h-3.5' />
                        <span>{t('callClient')}</span>
                      </a>
                    </div>

                    {/* Status Modifiers */}
                    <div className='flex items-center gap-2 w-full'>
                      {b.status === 'Scheduled' && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleUpdateStatus(b.id, 'In Progress')}
                          className='flex-1 h-8 text-xs cursor-pointer border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        >
                          <Clock className={`w-3.5 h-3.5 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          <span>{language === 'ur' ? 'کام شروع کریں' : 'Start Job'}</span>
                        </Button>
                      )}

                      {b.status !== 'Completed' && (
                        <Button
                          variant='default'
                          size='sm'
                          onClick={() => handleOpenCompleteModal(b)}
                          className='flex-1 h-8 text-xs cursor-pointer font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5'
                        >
                          <Check className='w-3.5 h-3.5' />
                          <span>{t('completeAndDeductParts')}</span>
                        </Button>
                      )}

                      {userRole === 'admin' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteBooking(b.id)}
                          className='h-8 px-2 text-muted-foreground hover:text-destructive cursor-pointer'
                          title={t('deleteAction')}
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              )
            })}

            {filteredBookings.length === 0 && (
              <div className='col-span-full py-16 text-center bg-card rounded-2xl border border-border p-8'>
                <Calendar className='w-12 h-12 mx-auto text-muted-foreground/30 mb-2' />
                <h3 className='text-base font-semibold text-foreground'>
                  {language === 'ur' ? 'کوئی سروس بکنگ نہیں ملی' : 'No Service Bookings Found'}
                </h3>
                <p className='text-xs text-muted-foreground mt-1 max-w-sm mx-auto'>
                  {searchQuery
                    ? (language === 'ur' ? 'تلاش کے معیار کے مطابق کوئی ریکارڈ نہیں ہے۔' : 'No bookings matched your search query.')
                    : (language === 'ur' ? 'نئی آر او یا سولر انسٹالیشن بک کرنے کے لیے اوپر دیے گئے بٹن پر کلک کریں۔' : 'Click the button above to schedule your first service or installation appointment.')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 2: ROUTINE MAINTENANCE LIFESPANS (1-month & 2-month checks) ================= */}
      {activeTab === 'intervals' && (
        <div className='space-y-4'>
          <Card className='border-amber-200/80 bg-amber-50/20 dark:bg-amber-950/20'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-2'>
                <AlertCircle className='w-4 h-4 text-amber-600' />
                <CardTitle className='text-sm font-semibold text-amber-900 dark:text-amber-200'>
                  {t('activeServiceReminders')} ({routineVisits.length} {t('dueNow')})
                </CardTitle>
              </div>
              <CardDescription className='text-xs text-amber-800/80 dark:text-amber-300/80'>
                {t('remindersDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {routineVisits.map((v, i) => (
              <Card
                key={i}
                className={`flex flex-col justify-between border ${
                  v.type === '2-month'
                    ? isRTL ? 'border-r-4 border-r-destructive' : 'border-l-4 border-l-destructive'
                    : isRTL ? 'border-r-4 border-r-amber-500' : 'border-l-4 border-l-amber-500'
                }`}
              >
                <CardHeader className='pb-2'>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <CardTitle className='text-base font-bold text-foreground'>{v.customerName}</CardTitle>
                      <div className='text-xs text-muted-foreground flex items-center gap-1 font-mono mt-0.5' dir='ltr'>
                        <Phone className='w-3 h-3 text-muted-foreground' />
                        <span>{v.customerContact}</span>
                      </div>
                    </div>
                    <Badge variant={v.type === '2-month' ? 'destructive' : 'warning'} className='text-[10px]'>
                      {v.serviceType}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className='space-y-2 pb-3 text-xs'>
                  <div className='p-2.5 bg-muted/40 rounded-lg space-y-1 border border-border'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('lastPurchase')}:</span>
                      <span className='font-mono font-semibold'>{v.lastPurchaseDate}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('daysElapsed')}:</span>
                      <strong className='text-foreground font-mono'>{v.diffDays} {language === 'ur' ? 'دن' : 'days'}</strong>
                    </div>
                    {v.installedItems.length > 0 && (
                      <div className='pt-1 border-t border-border text-[11px]'>
                        <span className='text-muted-foreground block'>{t('installedHardware')}</span>
                        <span className='font-medium text-foreground'>
                          {v.installedItems.map((item) => (language === 'ur' && item.urduName ? item.urduName : item.name)).join('، ')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className='pt-3 border-t border-border bg-muted/10 grid grid-cols-2 gap-2'>
                  <Button
                    variant='success'
                    size='sm'
                    onClick={() =>
                      handleOpenWhatsApp(
                        v.customerName,
                        v.customerContact,
                        v.type === '2-month' ? '2-month' : '1-month',
                        v,
                      )
                    }
                    className='bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 cursor-pointer gap-1.5'
                  >
                    <MessageSquare className='w-3.5 h-3.5' />
                    <span>WhatsApp</span>
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      // Schedule inline appointment from this reminder
                      setSelectedCustomerId(v.customerId.toString())
                      setBookingServiceType(
                        v.type === '2-month'
                          ? 'Periodic Maintenance & Filter Replacement'
                          : 'TDS Inspection & Membrane Flush',
                      )
                      setIsNewBookingModalOpen(true)
                    }}
                    className='h-8 text-xs cursor-pointer font-medium'
                  >
                    <Calendar className={`w-3.5 h-3.5 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    <span>{language === 'ur' ? 'وزٹ شیڈول کریں' : 'Schedule Visit'}</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {routineVisits.length === 0 && (
              <div className='col-span-full py-12 text-center bg-card rounded-xl border border-border p-6'>
                <CheckCircle2 className='w-10 h-10 mx-auto text-emerald-500 mb-2' />
                <h4 className='text-sm font-semibold text-foreground'>
                  {language === 'ur' ? 'تمام کلائنٹس کے فلٹرز اپ ڈیٹ ہیں' : 'All Customer Filters Are Up To Date'}
                </h4>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {language === 'ur' ? 'فی الوقت کسی بھی کسٹمر کا روٹین چیک یا فلٹر کی تبدیلی واجب الادا نہیں ہے۔' : 'No periodic maintenance or replacement visits are due at this moment.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 1: SCHEDULE NEW INSTALLATION / SERVICE ================= */}
      <Dialog open={isNewBookingModalOpen} onOpenChange={setIsNewBookingModalOpen}>
        <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto p-0'>
          <form onSubmit={handleCreateBooking}>
            <div className='p-4 border-b border-border bg-card flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center'>
                  <Calendar className='w-4 h-4' />
                </div>
                <div>
                  <DialogTitle className='text-base font-bold'>{t('scheduleNewService')}</DialogTitle>
                  <DialogDescription className='text-xs text-muted-foreground'>
                    {language === 'ur' ? 'آر او پلانٹ، سولر سسٹم یا روٹین فلٹر سروس کا نیا شیڈول تیار کریں۔' : 'Book RO plant, solar system, or periodic filter maintenance appointment.'}
                  </DialogDescription>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setIsNewBookingModalOpen(false)}
                className='text-muted-foreground hover:text-foreground cursor-pointer'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            <div className='p-5 space-y-4 text-xs'>
              {/* Customer Selector or Inline Entry */}
              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>{t('selectCustomer')}</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className='w-full p-2.5 rounded-lg border border-input bg-card text-xs text-foreground cursor-pointer focus:ring-2 focus:ring-primary'
                >
                  <option value=''>-- {language === 'ur' ? 'یا نیا کسٹمر نیچے درج کریں' : 'Choose Existing Client or Enter Below'} --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.contact})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedCustomerId && (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/30 border border-border'>
                  <div className='space-y-1'>
                    <label className='font-medium text-foreground'>{t('customerFullName')}</label>
                    <Input
                      type='text'
                      placeholder='e.g. Tariq Mehmood'
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      required={!selectedCustomerId}
                      className='h-8 text-xs'
                    />
                  </div>
                  <div className='space-y-1'>
                    <label className='font-medium text-foreground'>{t('contactNumber')}</label>
                    <Input
                      type='text'
                      placeholder='03001234567'
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      required={!selectedCustomerId}
                      className='h-8 text-xs font-mono'
                      dir='ltr'
                    />
                  </div>
                </div>
              )}

              {/* Service Type Selection */}
              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>{t('serviceType')}</label>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {SERVICE_TYPES.map((st) => {
                    const isSelected = bookingServiceType === st.id
                    return (
                      <button
                        key={st.id}
                        type='button'
                        onClick={() => {
                          setBookingServiceType(st.id)
                          setBookingLabor(st.defaultLabor.toString())
                        }}
                        className={`p-2.5 rounded-xl border text-left rtl:text-right transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-subtle'
                            : 'bg-card text-foreground border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className='min-w-0 flex-1'>
                          <div className='font-bold text-xs truncate'>{language === 'ur' ? st.ur : st.en}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {language === 'ur' ? 'معیاری فیس:' : 'Base labor:'} PKR {st.defaultLabor.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Schedule Date & Time Slot */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='space-y-1'>
                  <label className='font-semibold text-foreground'>{t('serviceDate')}</label>
                  <Input
                    type='date'
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className='h-9 text-xs font-mono'
                  />
                </div>

                <div className='space-y-1'>
                  <label className='font-semibold text-foreground'>{t('timeSlot')}</label>
                  <select
                    value={bookingTimeSlot}
                    onChange={(e) => setBookingTimeSlot(e.target.value)}
                    className='w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground cursor-pointer focus:ring-2 focus:ring-primary'
                  >
                    {TIME_SLOTS.map((ts) => (
                      <option key={ts} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Technician Assignment & Labor Fee */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='space-y-1'>
                  <label className='font-semibold text-foreground'>{t('assignedTechnician')}</label>
                  <select
                    value={bookingTech}
                    onChange={(e) => setBookingTech(e.target.value)}
                    className='w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground cursor-pointer focus:ring-2 focus:ring-primary'
                  >
                    {TECHNICIANS_LIST.map((tech) => (
                      <option key={tech.id} value={tech.name}>
                        {tech.name} — {language === 'ur' ? tech.urduTitle : tech.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='space-y-1'>
                  <label className='font-semibold text-foreground'>{t('laborServiceFee')} (PKR)</label>
                  <Input
                    type='number'
                    min='0'
                    value={bookingLabor}
                    onChange={(e) => setBookingLabor(e.target.value)}
                    className='h-9 text-xs font-mono'
                  />
                </div>
              </div>

              {/* Address & City */}
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <div className='sm:col-span-2 space-y-1'>
                  <label className='font-semibold text-foreground'>{t('clientAddress')}</label>
                  <Input
                    type='text'
                    placeholder='House / Street / Sector / Commercial Plaza'
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    required
                    className='h-9 text-xs'
                  />
                </div>

                <div className='space-y-1'>
                  <label className='font-semibold text-foreground'>{language === 'ur' ? 'شہر' : 'City'}</label>
                  <select
                    value={bookingCity}
                    onChange={(e) => setBookingCity(e.target.value)}
                    className='w-full h-9 px-2.5 rounded-lg border border-input bg-card text-xs text-foreground cursor-pointer'
                  >
                    <option value='Islamabad'>Islamabad</option>
                    <option value='Rawalpindi'>Rawalpindi</option>
                    <option value='Lahore'>Lahore</option>
                    <option value='Karachi'>Karachi</option>
                    <option value='Peshawar'>Peshawar</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className='space-y-1'>
                <label className='font-semibold text-foreground'>{language === 'ur' ? 'خصوصی ہدایات / ریمارکس' : 'Job Instructions / Notes'}</label>
                <textarea
                  rows={2}
                  placeholder='e.g. Check low pressure cutoff, verify 100 GPD membrane and tank fitting.'
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className='w-full p-2.5 rounded-lg border border-input bg-card text-xs text-foreground focus:ring-2 focus:ring-primary'
                />
              </div>
            </div>

            <DialogFooter className='p-4 border-t border-border bg-card/60 flex items-center justify-between'>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsNewBookingModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type='submit' variant='success' size='sm' className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5'>
                <Check className='w-4 h-4' />
                <span>{language === 'ur' ? 'شیڈول محفوظ کریں' : 'Confirm & Schedule Appointment'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 2: COMPLETE JOB & ATOMICALLY DEDUCT REPLACEMENT PARTS ================= */}
      <Dialog open={!!completeJobTarget} onOpenChange={(open) => !open && setCompleteJobTarget(null)}>
        {completeJobTarget && (
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto p-0'>
            <div className='p-4 border-b border-border bg-card flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center'>
                  <Wrench className='w-4 h-4' />
                </div>
                <div>
                  <DialogTitle className='text-base font-bold'>{t('settleServiceModalTitle')}</DialogTitle>
                  <DialogDescription className='text-xs text-muted-foreground'>
                    {t('settleServiceModalDesc')}
                  </DialogDescription>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setCompleteJobTarget(null)}
                className='text-muted-foreground hover:text-foreground cursor-pointer'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            <div className='p-5 space-y-4 text-xs'>
              {/* Summary of Job */}
              <div className='p-3 bg-muted/40 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-border'>
                <div>
                  <span className='text-muted-foreground'>{t('client')}:</span>{' '}
                  <strong className='text-foreground'>{completeJobTarget.customerName}</strong> (<span dir='ltr'>{completeJobTarget.customerContact}</span>)
                </div>
                <Badge variant='outline' className='text-[10px]'>
                  {completeJobTarget.serviceType}
                </Badge>
              </div>

              {/* Water TDS Readings Before & After */}
              <div className='grid grid-cols-2 gap-3 p-3 rounded-xl bg-card border border-border shadow-subtle'>
                <div className='space-y-1'>
                  <label className='font-semibold text-foreground flex items-center gap-1'>
                    <span className='w-2 h-2 rounded-full bg-destructive inline-block' />
                    <span>{t('tdsBefore')}</span>
                  </label>
                  <Input
                    type='number'
                    placeholder='e.g. 580'
                    value={tdsBefore}
                    onChange={(e) => setTdsBefore(e.target.value)}
                    className='h-8 text-xs font-mono'
                  />
                  <span className='text-[10px] text-muted-foreground'>{language === 'ur' ? 'پانی کا قدرتی خام ٹی ڈی ایس' : 'Raw input water TDS'}</span>
                </div>

                <div className='space-y-1'>
                  <label className='font-semibold text-foreground flex items-center gap-1'>
                    <span className='w-2 h-2 rounded-full bg-emerald-500 inline-block' />
                    <span>{t('tdsAfter')}</span>
                  </label>
                  <Input
                    type='number'
                    placeholder='e.g. 38'
                    value={tdsAfter}
                    onChange={(e) => setTdsAfter(e.target.value)}
                    className='h-8 text-xs font-mono text-emerald-600 font-bold'
                  />
                  <span className='text-[10px] text-muted-foreground'>{language === 'ur' ? 'فلٹریشن کے بعد محفوظ ریڈنگ' : 'Purified drinking water reading'}</span>
                </div>
              </div>

              {/* Spare Parts Deducted Selector */}
              <div className='space-y-2 p-3.5 rounded-xl border border-border bg-card'>
                <div className='flex items-center justify-between'>
                  <label className='font-bold text-foreground flex items-center gap-1.5'>
                    <Boxes className='w-4 h-4 text-primary' />
                    <span>{t('selectPartsUsed')}</span>
                  </label>
                  <span className='text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold'>
                    {language === 'ur' ? 'اسٹاک سے خودکار کٹوتی ہو گی' : 'Auto-deducted from warehouse stock'}
                  </span>
                </div>

                {/* Part Dropdown & Add */}
                <div className='flex flex-wrap items-center gap-2'>
                  <select
                    value={partToAddId}
                    onChange={(e) => setPartToAddId(e.target.value)}
                    className='flex-1 min-w-[240px] h-9 px-2.5 rounded-lg border border-input bg-card text-xs text-foreground cursor-pointer'
                  >
                    <option value=''>-- {language === 'ur' ? 'اسپیئر پارٹ / فلٹر منتخب کریں' : 'Choose Spare Part / Cartridge'} --</option>
                    {inventory
                      .filter((item) => item.quantity > 0)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} [{item.sku}] — {formatCurrency(item.price, language)} ({item.quantity} in stock)
                        </option>
                      ))}
                  </select>

                  <Input
                    type='number'
                    min='1'
                    value={partToAddQty}
                    onChange={(e) => setPartToAddQty(e.target.value)}
                    className='w-16 h-9 text-xs text-center font-mono'
                    title='Quantity'
                  />

                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleAddPartToJob}
                    disabled={!partToAddId}
                    className='h-9 text-xs font-semibold cursor-pointer gap-1'
                  >
                    <Plus className='w-3.5 h-3.5' />
                    <span>{t('addPartToJob')}</span>
                  </Button>
                </div>

                {/* List of Replaced Parts for this job */}
                <div className='mt-2 border rounded-lg overflow-hidden border-border'>
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-muted/40'>
                        <TableHead className='py-2 text-[11px]'>{t('itemDescription') || 'Part'}</TableHead>
                        <TableHead className='py-2 text-[11px] text-center'>{t('quantity')}</TableHead>
                        <TableHead className='py-2 text-[11px] text-right'>{t('unitPrice')}</TableHead>
                        <TableHead className='py-2 text-[11px] text-right'>{t('total')}</TableHead>
                        <TableHead className='py-2 text-[11px] w-8'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPartsList.map((p, idx) => (
                        <TableRow key={idx}>
                          <TableCell className='py-2 font-medium text-foreground'>
                            {language === 'ur' && p.urduName ? p.urduName : p.name}
                            <span className='block text-[10px] text-muted-foreground font-mono'>{p.sku}</span>
                          </TableCell>
                          <TableCell className='py-2 text-center font-mono font-bold'>{p.qty}</TableCell>
                          <TableCell className='py-2 text-right font-mono'>{formatCurrency(p.unitPrice, language)}</TableCell>
                          <TableCell className='py-2 text-right font-mono font-bold text-foreground'>{formatCurrency(p.total, language)}</TableCell>
                          <TableCell className='py-2 text-center'>
                            <button
                              type='button'
                              onClick={() => handleRemovePartFromJob(idx)}
                              className='text-muted-foreground hover:text-destructive cursor-pointer'
                            >
                              <X className='w-3.5 h-3.5' />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {selectedPartsList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className='py-4 text-center text-muted-foreground text-xs'>
                            {t('noPartsDeducted')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Labor Fee & Totals */}
              <div className='p-3.5 rounded-xl bg-muted/30 border border-border space-y-2'>
                <div className='flex items-center justify-between'>
                  <label className='font-semibold text-foreground'>{t('laborServiceFee')} (PKR):</label>
                  <Input
                    type='number'
                    min='0'
                    value={settlementLabor}
                    onChange={(e) => setSettlementLabor(e.target.value)}
                    className='w-32 h-8 text-right font-mono text-xs'
                  />
                </div>

                <div className='flex justify-between text-muted-foreground pt-1 border-t border-border/60'>
                  <span>{t('partsCost')}:</span>
                  <span className='font-mono font-semibold text-foreground'>{formatCurrency(modalPartsCost, language)}</span>
                </div>

                <div className='flex justify-between items-center pt-1 border-t border-border'>
                  <span className='font-bold text-sm text-foreground'>{t('totalServiceBill')}:</span>
                  <span className='font-mono text-base font-black text-primary'>{formatCurrency(modalGrandTotal, language)}</span>
                </div>
              </div>

              {/* Final Notes */}
              <div className='space-y-1'>
                <label className='font-semibold text-foreground'>{t('logTechnicianNotes')}</label>
                <textarea
                  rows={2}
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  placeholder={t('logNotesPlaceholder')}
                  className='w-full p-2.5 rounded-lg border border-input bg-card text-xs text-foreground focus:ring-2 focus:ring-primary'
                />
              </div>
            </div>

            <DialogFooter className='p-4 border-t border-border bg-card/60 flex items-center justify-between'>
              <Button type='button' variant='outline' size='sm' onClick={() => setCompleteJobTarget(null)}>
                {t('cancel')}
              </Button>
              <Button
                type='button'
                variant='success'
                size='sm'
                onClick={handleConfirmCompletion}
                className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5'
              >
                <Check className='w-4 h-4' />
                <span>{t('confirmServiceCompletion')}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ================= MODAL 3: 1-CLICK WHATSAPP PREVIEW & TEMPLATE DISPATCHER ================= */}
      <WhatsAppPreviewModal
        isOpen={whatsAppModal.isOpen}
        onClose={() => setWhatsAppModal((prev) => ({ ...prev, isOpen: false }))}
        recipientName={whatsAppModal.recipientName}
        recipientPhone={whatsAppModal.recipientPhone}
        defaultTemplate={whatsAppModal.defaultTemplate}
        contextData={whatsAppModal.contextData}
      />
    </div>
  )
}
