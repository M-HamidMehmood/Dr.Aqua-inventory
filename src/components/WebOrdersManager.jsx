import React, { useState, useMemo } from 'react'
import jsPDF from 'jspdf'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './ui/Card'
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
import { Dialog } from './ui/Dialog'
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Search,
  Check,
  X,
  CreditCard,
  Wallet,
  Landmark,
  Printer,
  AlertCircle,
  MessageSquare,
  FileText,
  Boxes,
  Eye,
  Copy,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Filter,
} from './ui/Icons'
import { useLanguage } from '../context/LanguageContext'
import { formatCurrency } from '../utils/translations'
import ImagePreviewModal from './ui/ImagePreviewModal'
import WhatsAppPreviewModal from './WhatsAppPreviewModal'

export default function WebOrdersManager({
  webOrders,
  updateWebOrders,
  inventory,
  updateInventory,
  customers,
  updateCustomers,
  addSale,
}) {
  const { t, language, isRTL } = useLanguage()

  // Filters, Search, Sorting, and View Mode
  const [activeFilter, setActiveFilter] = useState('All') // 'All' | 'Pending' | 'Dispatched' | 'Completed' | 'Cancelled'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('All')
  const [sortBy, setSortBy] = useState('newest') // 'newest' | 'oldest' | 'amount-desc' | 'amount-asc'
  const [viewMode, setViewMode] = useState('table') // 'table' | 'cards'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Copy Feedback State
  const [copiedOrderId, setCopiedOrderId] = useState(null)
  const [copiedTracking, setCopiedTracking] = useState(null)

  // Modals State
  const [notification, setNotification] = useState(null)
  const [detailModalOrder, setDetailModalOrder] = useState(null)

  // Dispatch Dialog State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  const [dispatchOrderTarget, setDispatchOrderTarget] = useState(null)
  const [courierName, setCourierName] = useState('Shop Delivery Rider')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [dispatchNotes, setDispatchNotes] = useState('')

  // Completion Dialog State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [completeOrderTarget, setCompleteOrderTarget] = useState(null)

  // Preview & WhatsApp Dialog States
  const [previewProduct, setPreviewProduct] = useState(null)
  const [whatsAppModalData, setWhatsAppModalData] = useState(null)

  const showNotice = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 4500)
  }

  const handleCopyText = (text, type = 'orderId') => {
    if (!text) return
    navigator.clipboard.writeText(text)
    if (type === 'orderId') {
      setCopiedOrderId(text)
      setTimeout(() => setCopiedOrderId(null), 2000)
    } else {
      setCopiedTracking(text)
      setTimeout(() => setCopiedTracking(null), 2000)
    }
  }

  // Derive unique cities
  const availableCities = useMemo(() => {
    const citySet = new Set()
    webOrders.forEach((o) => {
      if (o.city && o.city.trim()) {
        citySet.add(o.city.trim())
      }
    })
    return ['All', ...Array.from(citySet).sort()]
  }, [webOrders])

  // Filter and Sort Pipeline
  const filteredAndSortedOrders = useMemo(() => {
    const filtered = webOrders.filter((order) => {
      const matchesFilter =
        activeFilter === 'All' ? true : order.status.toLowerCase() === activeFilter.toLowerCase()

      const matchesCity =
        selectedCity === 'All'
          ? true
          : (order.city || '').toLowerCase() === selectedCity.toLowerCase()

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        q === ''
          ? true
          : order.id.toLowerCase().includes(q) ||
            order.customerName.toLowerCase().includes(q) ||
            order.customerPhone.includes(q) ||
            (order.city && order.city.toLowerCase().includes(q)) ||
            (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(q)) ||
            (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q)) ||
            order.items.some(
              (it) =>
                it.name.toLowerCase().includes(q) ||
                (it.urduName && it.urduName.includes(q)) ||
                (it.sku && it.sku.toLowerCase().includes(q)),
            )

      return matchesFilter && matchesCity && matchesSearch
    })

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      }
      if (sortBy === 'amount-desc') {
        return (b.total || 0) - (a.total || 0)
      }
      if (sortBy === 'amount-asc') {
        return (a.total || 0) - (b.total || 0)
      }
      return 0
    })
  }, [webOrders, activeFilter, selectedCity, searchQuery, sortBy])

  // Pagination Calculations
  const totalItems = filteredAndSortedOrders.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const pagedOrders = filteredAndSortedOrders.slice(startIndex, endIndex)

  // Counters for Top KPI Row
  const pendingCount = webOrders.filter((o) => o.status === 'Pending').length
  const dispatchedCount = webOrders.filter((o) => o.status === 'Dispatched').length
  const completedCount = webOrders.filter((o) => o.status === 'Completed').length

  // Handlers for Dispatch Modal
  const handleOpenDispatch = (order) => {
    // Check inventory availability
    const missingStockItems = []
    order.items.forEach((item) => {
      const invProduct = inventory.find((p) => p.id === item.productId || p.sku === item.sku)
      if (!invProduct || invProduct.quantity < item.qty) {
        missingStockItems.push({
          name: item.name,
          needed: item.qty,
          available: invProduct ? invProduct.quantity : 0,
        })
      }
    })

    if (missingStockItems.length > 0) {
      const itemDetails = missingStockItems
        .map((m) => `${m.name} (Need: ${m.needed}, In Stock: ${m.available})`)
        .join(', ')
      showNotice(
        language === 'ur'
          ? `ڈسپیچ نہیں ہو سکتا، اسٹاک کم ہے: ${itemDetails}`
          : `Cannot dispatch order, insufficient inventory: ${itemDetails}`,
        'error',
      )
      return
    }

    setDispatchOrderTarget(order)
    setCourierName('Shop Delivery Rider')
    setTrackingNumber('')
    setDispatchNotes('')
    setIsDispatchModalOpen(true)
  }

  const handleConfirmDispatch = () => {
    if (!dispatchOrderTarget) return

    // 1. Auto-deduct inventory
    const updatedInventory = inventory.map((product) => {
      const ordered = dispatchOrderTarget.items.find(
        (it) => it.productId === product.id || it.sku === product.sku,
      )
      if (ordered) {
        return {
          ...product,
          quantity: Math.max(0, product.quantity - ordered.qty),
        }
      }
      return product
    })
    updateInventory(updatedInventory)

    // 2. Update order status
    const updatedOrders = webOrders.map((o) => {
      if (o.id === dispatchOrderTarget.id) {
        return {
          ...o,
          status: 'Dispatched',
          dispatchedAt: new Date().toISOString(),
          courierName: courierName || 'Shop Rider',
          trackingNumber: trackingNumber || undefined,
          notes: dispatchNotes
            ? `${o.notes || ''} [Dispatch: ${dispatchNotes}]`.trim()
            : o.notes,
        }
      }
      return o
    })
    updateWebOrders(updatedOrders)

    // Update detailModalOrder if opened
    if (detailModalOrder && detailModalOrder.id === dispatchOrderTarget.id) {
      setDetailModalOrder({
        ...detailModalOrder,
        status: 'Dispatched',
        dispatchedAt: new Date().toISOString(),
        courierName: courierName || 'Shop Rider',
        trackingNumber: trackingNumber || undefined,
      })
    }

    showNotice(
      language === 'ur'
        ? `آرڈر ${dispatchOrderTarget.id} کامیابی سے ڈسپیچ ہو گیا اور سامان اسٹاک سے منہا ہو گیا۔`
        : `Order ${dispatchOrderTarget.id} dispatched! Inventory stock automatically deducted.`,
      'success',
    )

    setIsDispatchModalOpen(false)
    setDispatchOrderTarget(null)
  }

  // Handlers for Complete/Settle Modal
  const handleOpenComplete = (order) => {
    setCompleteOrderTarget(order)
    setIsCompleteModalOpen(true)
  }

  const handleConfirmComplete = () => {
    if (!completeOrderTarget) return

    // 1. Update order status to Completed & Paid
    const updatedOrders = webOrders.map((o) => {
      if (o.id === completeOrderTarget.id) {
        return {
          ...o,
          status: 'Completed',
          paymentStatus: 'Paid',
          completedAt: new Date().toISOString(),
        }
      }
      return o
    })
    updateWebOrders(updatedOrders)

    // 2. Record sale into Financial Analytics
    const newSale = {
      invoice: completeOrderTarget.id,
      customerId: Date.now(),
      customerName: completeOrderTarget.customerName,
      items: completeOrderTarget.items.map((it) => ({
        id: it.productId,
        name: it.name,
        urduName: it.urduName,
        price: it.price,
        quantity: it.qty,
        qty: it.qty,
      })),
      subtotal: completeOrderTarget.subtotal,
      total: completeOrderTarget.total,
      paymentMethod: completeOrderTarget.paymentMethod,
      paymentReference: completeOrderTarget.paymentReference,
      orderOrigin: 'Online Website',
      date: new Date().toISOString(),
      notes: completeOrderTarget.notes,
    }
    addSale(newSale)

    // 3. Update Customer CRM
    const existingCustomerIndex = customers.findIndex(
      (c) =>
        c.contact.replace(/\D/g, '') ===
        completeOrderTarget.customerPhone.replace(/\D/g, ''),
    )

    if (existingCustomerIndex > -1) {
      const updatedCustomers = [...customers]
      updatedCustomers[existingCustomerIndex].history = [
        ...(updatedCustomers[existingCustomerIndex].history || []),
        newSale,
      ]
      updateCustomers(updatedCustomers)
    } else {
      const newCustomer = {
        id: Date.now(),
        name: completeOrderTarget.customerName,
        contact: completeOrderTarget.customerPhone,
        history: [newSale],
      }
      updateCustomers([...customers, newCustomer])
    }

    // Update detailModalOrder if opened
    if (detailModalOrder && detailModalOrder.id === completeOrderTarget.id) {
      setDetailModalOrder({
        ...detailModalOrder,
        status: 'Completed',
        paymentStatus: 'Paid',
        completedAt: new Date().toISOString(),
      })
    }

    showNotice(
      language === 'ur'
        ? `آرڈر ${completeOrderTarget.id} مکمل ہو گیا! آمدنی میں اضافہ اور کسٹمر ریکارڈ محفوظ ہو گیا۔`
        : `Order ${completeOrderTarget.id} completed! Added to sales revenue and customer ledger.`,
      'success',
    )

    setIsCompleteModalOpen(false)
    setCompleteOrderTarget(null)
  }

  // Cancel Order (with stock restore if was dispatched)
  const handleCancelOrder = (order) => {
    const confirmMsg =
      language === 'ur'
        ? `کیا آپ واقعی آرڈر ${order.id} کو منسوخ کرنا چاہتے ہیں؟`
        : `Are you sure you want to cancel order ${order.id}?`

    if (!window.confirm(confirmMsg)) return

    if (order.status === 'Dispatched') {
      const restoredInventory = inventory.map((product) => {
        const item = order.items.find(
          (it) => it.productId === product.id || it.sku === product.sku,
        )
        if (item) {
          return { ...product, quantity: product.quantity + item.qty }
        }
        return product
      })
      updateInventory(restoredInventory)
      showNotice(
        language === 'ur'
          ? `آرڈر منسوخ ہوا۔ اشیاء گودام کے اسٹاک میں واپس بحال کر دی گئیں۔`
          : `Order cancelled. Stock returned to warehouse inventory.`,
        'warning',
      )
    } else {
      showNotice(
        language === 'ur' ? `آرڈر ${order.id} منسوخ کر دیا گیا۔` : `Order ${order.id} cancelled.`,
        'info',
      )
    }

    const updatedOrders = webOrders.map((o) => {
      if (o.id === order.id) {
        return { ...o, status: 'Cancelled' }
      }
      return o
    })
    updateWebOrders(updatedOrders)

    if (detailModalOrder && detailModalOrder.id === order.id) {
      setDetailModalOrder({
        ...detailModalOrder,
        status: 'Cancelled',
      })
    }
  }

  // Generate & Download Delivery Dispatch Slip (PDF)
  const handlePrintDeliverySlip = (order) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()

      // Header
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('DR. AQUA WATER SYSTEMS', pageWidth / 2, 22, { align: 'center' })

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('E-Commerce Delivery Dispatch & Packing Slip', pageWidth / 2, 28, {
        align: 'center',
      })
      pdf.text(
        'Website: dr-aqua-project.vercel.app  •  UAN / WhatsApp: 0334 7071759',
        pageWidth / 2,
        33,
        { align: 'center' },
      )

      // Divider line
      pdf.setLineWidth(0.4)
      pdf.setDrawColor(200, 200, 200)
      pdf.line(14, 38, pageWidth - 14, 38)

      // Order & Customer Meta Block
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ORDER DETAILS', 14, 45)
      pdf.text('CONSIGNEE (DELIVER TO):', pageWidth / 2, 45)

      pdf.setFont('helvetica', 'normal')
      pdf.text(`Order Number: ${order.id}`, 14, 52)
      pdf.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 58)
      pdf.text(`Status: ${order.status.toUpperCase()}`, 14, 64)
      pdf.text(`Payment Mode: ${order.paymentMethod}`, 14, 70)
      if (order.paymentReference) {
        pdf.text(`Ref / Slip: ${order.paymentReference}`, 14, 76)
      }

      pdf.text(`Name: ${order.customerName}`, pageWidth / 2, 52)
      pdf.text(`Contact: ${order.customerPhone}`, pageWidth / 2, 58)
      pdf.text(`City: ${order.city}`, pageWidth / 2, 64)
      pdf.text(`Address: ${order.deliveryAddress}`, pageWidth / 2, 70, {
        maxWidth: 80,
      })

      // Table Header
      let y = 88
      pdf.setFillColor(245, 247, 250)
      pdf.rect(14, y, pageWidth - 28, 8, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.text('SKU', 16, y + 5.5)
      pdf.text('Item Description', 45, y + 5.5)
      pdf.text('Qty', 125, y + 5.5, { align: 'center' })
      pdf.text('Unit (PKR)', 150, y + 5.5, { align: 'right' })
      pdf.text('Total (PKR)', pageWidth - 16, y + 5.5, { align: 'right' })

      // Items
      pdf.setFont('helvetica', 'normal')
      order.items.forEach((item) => {
        y += 8
        pdf.text(item.sku || 'N/A', 16, y + 5.5)
        pdf.text(item.name.substring(0, 38), 45, y + 5.5)
        pdf.text(String(item.qty), 125, y + 5.5, { align: 'center' })
        pdf.text(item.price.toLocaleString(), 150, y + 5.5, { align: 'right' })
        pdf.text((item.price * item.qty).toLocaleString(), pageWidth - 16, y + 5.5, {
          align: 'right',
        })
      })

      // Subtotal & Grand Total
      y += 14
      pdf.line(14, y, pageWidth - 14, y)
      y += 6
      pdf.setFont('helvetica', 'normal')
      pdf.text('Subtotal:', 140, y)
      pdf.text(`PKR ${order.subtotal.toLocaleString()}`, pageWidth - 16, y, { align: 'right' })

      y += 6
      pdf.text('Delivery Charges:', 140, y)
      pdf.text(`PKR ${order.deliveryFee.toLocaleString()}`, pageWidth - 16, y, { align: 'right' })

      y += 8
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11)
      pdf.text('Grand Total:', 140, y)
      pdf.text(`PKR ${order.total.toLocaleString()}`, pageWidth - 16, y, { align: 'right' })

      // Courier & Delivery Instructions
      y += 16
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'italic')
      if (order.courierName) {
        pdf.text(
          `Assigned Carrier: ${order.courierName}  ${order.trackingNumber ? `| Tracking: ${order.trackingNumber}` : ''}`,
          14,
          y,
        )
        y += 5
      }
      if (order.notes) {
        pdf.text(`Delivery Instructions: ${order.notes}`, 14, y)
      }

      // Footer
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(
        'Thank you for trusting Dr. Aqua. For technical support, filter warranty, or installation inquiries, please contact our helpline.',
        pageWidth / 2,
        280,
        { align: 'center' },
      )

      pdf.save(`${order.id}-Dispatch-Slip.pdf`)
      showNotice(
        language === 'ur'
          ? `آرڈر ${order.id} کی ڈسپیچ سلپ ڈاؤنلوڈ ہو گئی۔`
          : `Downloaded dispatch slip for ${order.id}`,
        'success',
      )
    } catch (err) {
      console.error('PDF generation error:', err)
      showNotice('Failed to generate PDF slip.', 'error')
    }
  }

  // Status Badge Component
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge variant='warning' className='text-xs gap-1 py-0.5 px-2 font-medium'>
            <Clock className='w-3 h-3' />
            <span>{t('pendingOrders')}</span>
          </Badge>
        )
      case 'Dispatched':
        return (
          <Badge variant='info' className='text-xs gap-1 py-0.5 px-2 font-medium'>
            <Truck className='w-3 h-3' />
            <span>{t('dispatchedOrders')}</span>
          </Badge>
        )
      case 'Completed':
        return (
          <Badge variant='success' className='text-xs gap-1 py-0.5 px-2 font-medium'>
            <CheckCircle2 className='w-3 h-3' />
            <span>{t('completedOrders')}</span>
          </Badge>
        )
      case 'Cancelled':
        return (
          <Badge variant='destructive' className='text-xs gap-1 py-0.5 px-2 font-medium'>
            <X className='w-3 h-3' />
            <span>{t('cancelledOrders')}</span>
          </Badge>
        )
      default:
        return <Badge variant='secondary'>{status}</Badge>
    }
  }

  // Payment Method Pill Component
  const renderPaymentBadge = (order) => {
    const isPaid = order.paymentStatus === 'Paid'
    return (
      <div className='flex flex-col gap-1'>
        <div className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/60 border border-border/80 text-[11px] font-medium text-foreground w-fit'>
          {order.paymentMethod === 'Cash' && <Wallet className='w-3 h-3 text-emerald-600' />}
          {(order.paymentMethod === 'JazzCash' || order.paymentMethod === 'EasyPaisa') && (
            <CreditCard className='w-3 h-3 text-amber-600' />
          )}
          {order.paymentMethod === 'Bank Transfer' && (
            <Landmark className='w-3 h-3 text-blue-600' />
          )}
          <span>
            {order.paymentMethod === 'Cash'
              ? t('payCash')
              : order.paymentMethod === 'JazzCash'
              ? t('payJazzCash')
              : order.paymentMethod === 'EasyPaisa'
              ? t('payEasyPaisa')
              : t('payBankTransfer')}
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
              isPaid
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
            }`}
          >
            {isPaid ? t('paid') : t('unpaidCod')}
          </span>
          {order.paymentReference && (
            <span className='font-mono text-[10px] text-muted-foreground' dir='ltr'>
              Ref: {order.paymentReference}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium flex items-center justify-between shadow-elevated border animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'error'
              ? 'bg-destructive/10 text-destructive border-destructive/20'
              : notification.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
              : notification.type === 'warning'
              ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400'
              : 'bg-primary/10 text-primary border-primary/20'
          }`}
        >
          <div className='flex items-center gap-2'>
            {notification.type === 'error' ? (
              <AlertCircle className='w-4 h-4 shrink-0' />
            ) : (
              <Check className='w-4 h-4 shrink-0' />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className='hover:opacity-75 cursor-pointer ml-2'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        </div>
      )}

      {/* Top Header & Storefront Status */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-subtle'>
              <ShoppingBag className='w-4 h-4' />
            </div>
            <span>{t('webOrdersTitle')}</span>
          </h2>
          <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
            {t('webOrdersDesc')}
          </p>
        </div>

        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Badge
            variant='outline'
            className='px-3 py-1 text-xs font-mono gap-1.5 bg-background shadow-subtle'
          >
            <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
            <span>dr-aqua-project.vercel.app</span>
          </Badge>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        <Card
          onClick={() => {
            setActiveFilter('All')
            setCurrentPage(1)
          }}
          className={`p-3.5 cursor-pointer transition-all border ${
            activeFilter === 'All'
              ? 'ring-2 ring-primary border-primary shadow-elevated bg-primary/5'
              : 'border-border shadow-subtle hover:border-primary/40'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-muted-foreground'>{t('allOrders')}</span>
            <ShoppingBag className='w-4 h-4 text-muted-foreground' />
          </div>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-2xl font-bold font-mono text-foreground'>
              {webOrders.length}
            </span>
            <span className='text-[11px] text-muted-foreground'>{t('orders')}</span>
          </div>
        </Card>

        <Card
          onClick={() => {
            setActiveFilter('Pending')
            setCurrentPage(1)
          }}
          className={`p-3.5 cursor-pointer transition-all border ${
            activeFilter === 'Pending'
              ? 'ring-2 ring-amber-500 border-amber-500 shadow-elevated bg-amber-500/10'
              : 'border-amber-500/20 bg-amber-500/5 shadow-subtle hover:border-amber-500/40'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-amber-700 dark:text-amber-400'>
              {t('pendingOrders')}
            </span>
            <Clock className='w-4 h-4 text-amber-500' />
          </div>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-2xl font-bold font-mono text-amber-600 dark:text-amber-400'>
              {pendingCount}
            </span>
            <span className='text-[11px] text-amber-700/70 dark:text-amber-400/70'>
              {language === 'ur' ? 'کارروائی کے منتظر' : 'Awaiting review'}
            </span>
          </div>
        </Card>

        <Card
          onClick={() => {
            setActiveFilter('Dispatched')
            setCurrentPage(1)
          }}
          className={`p-3.5 cursor-pointer transition-all border ${
            activeFilter === 'Dispatched'
              ? 'ring-2 ring-blue-500 border-blue-500 shadow-elevated bg-blue-500/10'
              : 'border-blue-500/20 bg-blue-500/5 shadow-subtle hover:border-blue-500/40'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-blue-700 dark:text-blue-400'>
              {t('dispatchedOrders')}
            </span>
            <Truck className='w-4 h-4 text-blue-500' />
          </div>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-2xl font-bold font-mono text-blue-600 dark:text-blue-400'>
              {dispatchedCount}
            </span>
            <span className='text-[11px] text-blue-700/70 dark:text-blue-400/70'>
              {language === 'ur' ? 'راستے میں ہے' : 'In transit'}
            </span>
          </div>
        </Card>

        <Card
          onClick={() => {
            setActiveFilter('Completed')
            setCurrentPage(1)
          }}
          className={`p-3.5 cursor-pointer transition-all border ${
            activeFilter === 'Completed'
              ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-elevated bg-emerald-500/10'
              : 'border-emerald-500/20 bg-emerald-500/5 shadow-subtle hover:border-emerald-500/40'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-emerald-700 dark:text-emerald-400'>
              {t('completedOrders')}
            </span>
            <CheckCircle2 className='w-4 h-4 text-emerald-500' />
          </div>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400'>
              {completedCount}
            </span>
            <span className='text-[11px] text-emerald-700/70 dark:text-emerald-400/70'>
              {language === 'ur' ? 'کامیاب وصولی' : 'Delivered & paid'}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Control Toolbar: Status Pills, City, Sort, Search, and View Mode Switcher */}
      <Card className='p-3 sm:p-4 border-border shadow-subtle bg-card/60 backdrop-blur-sm'>
        <div className='flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3'>
          {/* Status Tabs */}
          <div className='flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0'>
            {[
              { id: 'All', label: t('allOrders'), count: webOrders.length },
              { id: 'Pending', label: t('pendingOrders'), count: pendingCount },
              { id: 'Dispatched', label: t('dispatchedOrders'), count: dispatchedCount },
              { id: 'Completed', label: t('completedOrders'), count: completedCount },
            ].map((tab) => {
              const isActive = activeFilter.toLowerCase() === tab.id.toLowerCase()
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveFilter(tab.id)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-subtle font-semibold'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-background text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right Toolbar: City filter, Sort dropdown, Search input & View switcher */}
          <div className='flex flex-wrap items-center gap-2'>
            {/* City Filter */}
            <div className='flex items-center gap-1.5 bg-muted/40 rounded-lg px-2 py-1 border border-border/60 text-xs'>
              <MapPin className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value)
                  setCurrentPage(1)
                }}
                className='bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer pr-1'
              >
                <option value='All' className='bg-popover text-foreground'>
                  {t('allCities')}
                </option>
                {availableCities
                  .filter((c) => c !== 'All')
                  .map((c) => (
                    <option key={c} value={c} className='bg-popover text-foreground'>
                      {c}
                    </option>
                  ))}
              </select>
            </div>

            {/* Sorting Dropdown */}
            <div className='flex items-center gap-1.5 bg-muted/40 rounded-lg px-2 py-1 border border-border/60 text-xs'>
              <ArrowUpDown className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer pr-1'
              >
                <option value='newest' className='bg-popover text-foreground'>
                  {t('sortNewest')}
                </option>
                <option value='oldest' className='bg-popover text-foreground'>
                  {t('sortOldest')}
                </option>
                <option value='amount-desc' className='bg-popover text-foreground'>
                  {t('sortAmountHigh')}
                </option>
                <option value='amount-asc' className='bg-popover text-foreground'>
                  {t('sortAmountLow')}
                </option>
              </select>
            </div>

            {/* Search Input */}
            <div className='relative flex-1 sm:w-60 min-w-[160px]'>
              <Search
                className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-muted-foreground ${
                  isRTL ? 'right-2.5' : 'left-2.5'
                }`}
              />
              <Input
                type='text'
                placeholder={t('searchOrdersPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className={`h-8 text-xs shadow-subtle ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${
                    isRTL ? 'left-2' : 'right-2'
                  }`}
                >
                  <X className='w-3 h-3' />
                </button>
              )}
            </div>

            {/* View Mode Switcher (Table vs Cards) */}
            <div className='flex items-center bg-muted/50 p-0.5 rounded-lg border border-border shrink-0'>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 text-xs font-medium ${
                  viewMode === 'table'
                    ? 'bg-background text-foreground shadow-subtle font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title={t('viewAsTable')}
              >
                <List className='w-3.5 h-3.5' />
                <span className='hidden sm:inline'>{t('viewAsTable')}</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 text-xs font-medium ${
                  viewMode === 'cards'
                    ? 'bg-background text-foreground shadow-subtle font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title={t('viewAsCards')}
              >
                <LayoutGrid className='w-3.5 h-3.5' />
                <span className='hidden sm:inline'>{t('viewAsCards')}</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Area: Table View OR Modern Card View */}
      {filteredAndSortedOrders.length === 0 ? (
        <Card className='p-12 text-center border-dashed border-border bg-card/40'>
          <ShoppingBag className='w-12 h-12 mx-auto text-muted-foreground/30 mb-3' />
          <p className='text-sm font-semibold text-foreground'>{t('noOrdersFound')}</p>
          <p className='text-xs text-muted-foreground mt-1'>
            {language === 'ur'
              ? 'ویب سائٹ سے نئے آرڈرز یہاں ظاہر ہوں گے۔ فلٹرز یا تلاش تبدیل کر کے دیکھیں۔'
              : 'Customer orders placed on dr-aqua-project will automatically appear here.'}
          </p>
        </Card>
      ) : viewMode === 'table' ? (
        /* ================== TABLE VIEW ================== */
        <Card className='overflow-hidden border-border shadow-subtle'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/40 hover:bg-muted/40 text-xs font-semibold'>
                  <TableHead className='w-[140px]'>{t('orderId')}</TableHead>
                  <TableHead className='min-w-[180px]'>{t('customerAndPhone')}</TableHead>
                  <TableHead className='min-w-[200px]'>{t('orderedItems')}</TableHead>
                  <TableHead className='min-w-[150px]'>{t('paymentMethod')}</TableHead>
                  <TableHead className='w-[120px] text-right'>{t('grandTotal')}</TableHead>
                  <TableHead className='w-[130px]'>{t('orderStatus')}</TableHead>
                  <TableHead className='w-[160px] text-center'>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className='divide-y divide-border/60 text-xs'>
                {pagedOrders.map((order) => {
                  const isPending = order.status === 'Pending'
                  const isDispatched = order.status === 'Dispatched'
                  const isCompleted = order.status === 'Completed'
                  const isCancelled = order.status === 'Cancelled'
                  const isCopied = copiedOrderId === order.id

                  return (
                    <TableRow
                      key={order.id}
                      className='hover:bg-muted/30 transition-colors group'
                    >
                      {/* Order ID & Time */}
                      <TableCell className='align-top py-3 font-mono'>
                        <div className='flex items-center gap-1.5'>
                          <span
                            onClick={() => setDetailModalOrder(order)}
                            className='font-bold text-primary hover:underline cursor-pointer'
                            dir='ltr'
                          >
                            {order.id}
                          </span>
                          <button
                            onClick={() => handleCopyText(order.id, 'orderId')}
                            className='p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
                            title={t('copyOrderId')}
                          >
                            {isCopied ? (
                              <Check className='w-3 h-3 text-emerald-600' />
                            ) : (
                              <Copy className='w-3 h-3' />
                            )}
                          </button>
                        </div>
                        <div className='text-[10px] text-muted-foreground mt-0.5 font-sans'>
                          {new Date(order.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          •{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <span className='inline-block text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 bg-muted rounded text-muted-foreground mt-1'>
                          {t('channelOnline')}
                        </span>
                      </TableCell>

                      {/* Customer & Address */}
                      <TableCell className='align-top py-3'>
                        <div className='font-semibold text-foreground text-xs'>
                          {order.customerName}
                        </div>
                        <div
                          className='text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 font-mono'
                          dir='ltr'
                        >
                          <Phone className='w-3 h-3 shrink-0' />
                          <span>{order.customerPhone}</span>
                        </div>
                        <div className='text-[11px] text-muted-foreground flex items-center gap-1 mt-1 truncate max-w-[200px]'>
                          <MapPin className='w-3 h-3 text-primary shrink-0' />
                          <span className='truncate'>{order.deliveryAddress}</span>
                        </div>
                        <span className='inline-block text-[10px] font-medium px-1.5 py-0.2 bg-primary/10 text-primary rounded mt-1'>
                          {order.city}
                        </span>
                      </TableCell>

                      {/* Ordered Items Preview Stack */}
                      <TableCell className='align-top py-3'>
                        <div className='flex items-center gap-2'>
                          <div className='flex -space-x-2 overflow-hidden py-0.5'>
                            {order.items.slice(0, 3).map((item, idx) => {
                              const productForPreview = inventory?.find(
                                (p) => p.sku === item.sku || p.id === item.productId,
                              ) || {
                                name: item.name,
                                urduName: item.urduName,
                                sku: item.sku,
                                image: item.image,
                                price: item.price,
                                stock: item.stock ?? 'N/A',
                                category: item.category || 'General',
                              }
                              return (
                                <div
                                  key={idx}
                                  onClick={() => setPreviewProduct(productForPreview)}
                                  className='relative w-8 h-8 rounded-md overflow-hidden border-2 border-background shrink-0 cursor-zoom-in bg-muted/60 hover:scale-110 hover:z-10 transition-transform shadow-subtle'
                                  title={`${item.name} (${item.qty}x)`}
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className='w-full h-full object-cover'
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                  ) : (
                                    <div className='w-full h-full flex items-center justify-center bg-muted text-[9px] font-mono'>
                                      {item.qty}x
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          {order.items.length > 3 && (
                            <span className='text-[10px] font-medium text-muted-foreground font-mono'>
                              +{order.items.length - 3}
                            </span>
                          )}
                        </div>
                        <div className='mt-1 text-[11px] text-foreground font-medium truncate max-w-[220px]'>
                          {language === 'ur' && order.items[0]?.urduName
                            ? order.items[0].urduName
                            : order.items[0]?.name}
                          {order.items.length > 1 && (
                            <span className='text-muted-foreground font-normal'>
                              {' '}
                              +{order.items.length - 1} more
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setDetailModalOrder(order)}
                          className='text-[10px] text-primary hover:underline cursor-pointer mt-0.5 block'
                        >
                          {t('viewOrder')} ({order.items.length} {t('itemsCount')})
                        </button>
                      </TableCell>

                      {/* Payment */}
                      <TableCell className='align-top py-3'>
                        {renderPaymentBadge(order)}
                      </TableCell>

                      {/* Total */}
                      <TableCell className='align-top py-3 text-right'>
                        <div className='font-bold text-foreground text-sm font-mono'>
                          {formatCurrency(order.total, language)}
                        </div>
                        <div className='text-[10px] text-muted-foreground font-mono mt-0.5'>
                          Sub: {formatCurrency(order.subtotal, language)}
                        </div>
                        {order.deliveryFee > 0 && (
                          <div className='text-[9px] text-muted-foreground font-mono'>
                            Ship: +{formatCurrency(order.deliveryFee, language)}
                          </div>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className='align-top py-3'>
                        {renderStatusBadge(order.status)}
                        {order.courierName && (
                          <div className='mt-1 text-[10px] text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1'>
                            <Truck className='w-3 h-3 shrink-0' />
                            <span className='truncate max-w-[110px]'>{order.courierName}</span>
                          </div>
                        )}
                        {order.trackingNumber && (
                          <div
                            className='text-[9px] text-muted-foreground font-mono truncate max-w-[110px]'
                            dir='ltr'
                          >
                            #{order.trackingNumber}
                          </div>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className='align-top py-3 text-center'>
                        <div className='flex items-center justify-center gap-1'>
                          {/* View Details */}
                          <Button
                            onClick={() => setDetailModalOrder(order)}
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground'
                            title={t('viewOrder')}
                          >
                            <Eye className='w-3.5 h-3.5' />
                          </Button>

                          {/* WhatsApp */}
                          <Button
                            onClick={() => setWhatsAppModalData(order)}
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0 cursor-pointer text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            title='WhatsApp'
                          >
                            <MessageSquare className='w-3.5 h-3.5' />
                          </Button>

                          {/* Print Slip */}
                          <Button
                            onClick={() => handlePrintDeliverySlip(order)}
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground'
                            title={t('printSlip')}
                          >
                            <Printer className='w-3.5 h-3.5' />
                          </Button>

                          {/* Quick Stage Advance */}
                          {isPending && (
                            <Button
                              onClick={() => handleOpenDispatch(order)}
                              size='sm'
                              className='h-7 px-2 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer gap-1'
                              title={t('markDispatched')}
                            >
                              <Truck className='w-3 h-3' />
                              <span className='hidden xl:inline'>{t('quickDispatch')}</span>
                            </Button>
                          )}

                          {isDispatched && (
                            <Button
                              onClick={() => handleOpenComplete(order)}
                              size='sm'
                              className='h-7 px-2 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1'
                              title={t('markCompleted')}
                            >
                              <CheckCircle2 className='w-3 h-3' />
                              <span className='hidden xl:inline'>{t('quickSettle')}</span>
                            </Button>
                          )}

                          {/* Cancel Order */}
                          {!isCompleted && !isCancelled && (
                            <Button
                              onClick={() => handleCancelOrder(order)}
                              variant='ghost'
                              size='sm'
                              className='h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer'
                              title={t('cancelOrder')}
                            >
                              <X className='w-3 h-3' />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* ================== MODERN CARD VIEW ================== */
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
          {pagedOrders.map((order) => {
            const isPending = order.status === 'Pending'
            const isDispatched = order.status === 'Dispatched'
            const isCompleted = order.status === 'Completed'
            const isCancelled = order.status === 'Cancelled'
            const isCopied = copiedOrderId === order.id

            return (
              <Card
                key={order.id}
                className='border-border/80 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between overflow-hidden bg-card'
              >
                {/* Card Top Ribbon */}
                <div className='bg-muted/30 px-3.5 py-2.5 border-b border-border flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-1.5'>
                    <Badge
                      variant='outline'
                      className='font-mono font-semibold text-xs px-2 py-0.5 gap-1 bg-background'
                      dir='ltr'
                    >
                      <span>{order.id}</span>
                      <button
                        onClick={() => handleCopyText(order.id, 'orderId')}
                        className='hover:text-primary cursor-pointer'
                        title={t('copyOrderId')}
                      >
                        {isCopied ? (
                          <Check className='w-2.5 h-2.5 text-emerald-600' />
                        ) : (
                          <Copy className='w-2.5 h-2.5 text-muted-foreground' />
                        )}
                      </button>
                    </Badge>
                    <span className='text-[10px] text-muted-foreground font-mono'>
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className='flex items-center gap-1.5'>
                    {renderStatusBadge(order.status)}
                  </div>
                </div>

                {/* Card Content Body */}
                <CardContent className='p-3.5 space-y-3 flex-1'>
                  {/* Customer Info */}
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <div className='font-bold text-sm text-foreground'>
                        {order.customerName}
                      </div>
                      <div
                        className='text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono'
                        dir='ltr'
                      >
                        <Phone className='w-3 h-3 text-muted-foreground' />
                        <span>{order.customerPhone}</span>
                      </div>
                    </div>
                    <Badge variant='secondary' className='text-[11px] font-medium shrink-0'>
                      {order.city}
                    </Badge>
                  </div>

                  {/* Delivery Address */}
                  <div className='text-xs text-muted-foreground flex items-start gap-1.5 bg-muted/20 p-2 rounded-md border border-border/40'>
                    <MapPin className='w-3.5 h-3.5 text-primary shrink-0 mt-0.5' />
                    <span className='line-clamp-2'>{order.deliveryAddress}</span>
                  </div>

                  {/* Courier Info (if dispatched) */}
                  {order.courierName && (
                    <div className='p-2 rounded-md bg-blue-500/5 border border-blue-500/15 text-xs flex items-center justify-between'>
                      <div className='flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-medium'>
                        <Truck className='w-3.5 h-3.5 shrink-0' />
                        <span>{order.courierName}</span>
                      </div>
                      {order.trackingNumber && (
                        <div className='flex items-center gap-1 font-mono text-[10px] text-muted-foreground' dir='ltr'>
                          <span>{order.trackingNumber}</span>
                          <button
                            onClick={() => handleCopyText(order.trackingNumber, 'tracking')}
                            className='hover:text-foreground cursor-pointer'
                            title={t('copyTracking')}
                          >
                            {copiedTracking === order.trackingNumber ? (
                              <Check className='w-2.5 h-2.5 text-emerald-600' />
                            ) : (
                              <Copy className='w-2.5 h-2.5' />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Line Items Preview */}
                  <div className='space-y-1.5 pt-1'>
                    <div className='flex items-center justify-between text-[11px] font-semibold text-muted-foreground'>
                      <span>{t('orderedItems')}</span>
                      <button
                        onClick={() => setDetailModalOrder(order)}
                        className='text-primary hover:underline cursor-pointer text-[10px]'
                      >
                        {t('viewOrder')} ({order.items.length})
                      </button>
                    </div>

                    <div className='space-y-1 bg-muted/10 p-2 rounded-lg border border-border/50 divide-y divide-border/30'>
                      {order.items.slice(0, 2).map((item, idx) => {
                        const displayName =
                          language === 'ur' && item.urduName ? item.urduName : item.name
                        const productForPreview = inventory?.find(
                          (p) => p.sku === item.sku || p.id === item.productId,
                        ) || {
                          name: item.name,
                          urduName: item.urduName,
                          sku: item.sku,
                          image: item.image,
                          price: item.price,
                          stock: item.stock ?? 'N/A',
                          category: item.category || 'General',
                        }
                        return (
                          <div
                            key={idx}
                            className='flex items-center justify-between gap-2 py-1 first:pt-0 last:pb-0'
                          >
                            <div className='flex items-center gap-2 min-w-0'>
                              {item.image && (
                                <div
                                  onClick={() => setPreviewProduct(productForPreview)}
                                  className='w-7 h-7 rounded border border-border/80 overflow-hidden shrink-0 cursor-zoom-in'
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className='w-full h-full object-cover'
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                </div>
                              )}
                              <div className='min-w-0'>
                                <div className='text-xs font-medium text-foreground truncate'>
                                  {displayName}
                                </div>
                                <div className='text-[10px] text-muted-foreground font-mono'>
                                  {item.qty} × {formatCurrency(item.price, language)}
                                </div>
                              </div>
                            </div>
                            <span className='font-mono font-semibold text-xs text-foreground shrink-0'>
                              {formatCurrency(item.price * item.qty, language)}
                            </span>
                          </div>
                        )
                      })}

                      {order.items.length > 2 && (
                        <div
                          onClick={() => setDetailModalOrder(order)}
                          className='text-center pt-1.5 text-[10px] text-primary hover:underline cursor-pointer'
                        >
                          +{order.items.length - 2} more items...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {order.notes && (
                    <div className='text-[11px] text-muted-foreground italic bg-muted/30 p-2 rounded border border-border/40'>
                      &ldquo;{order.notes}&rdquo;
                    </div>
                  )}

                  {/* Total & Payment Row */}
                  <div className='pt-2 border-t border-border flex items-center justify-between'>
                    <div>
                      {renderPaymentBadge(order)}
                    </div>
                    <div className='text-right'>
                      <div className='text-[10px] text-muted-foreground uppercase font-semibold'>
                        {t('grandTotal')}
                      </div>
                      <div className='text-base font-bold font-mono text-primary'>
                        {formatCurrency(order.total, language)}
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Card Action Footer */}
                <CardFooter className='bg-muted/20 px-3.5 py-2.5 border-t border-border flex items-center justify-between gap-1.5'>
                  {/* Left: Communication & Details */}
                  <div className='flex items-center gap-1.5'>
                    <Button
                      onClick={() => setDetailModalOrder(order)}
                      variant='outline'
                      size='sm'
                      className='h-8 text-xs cursor-pointer gap-1 px-2'
                      title={t('viewOrder')}
                    >
                      <Eye className='w-3.5 h-3.5' />
                      <span>{t('viewOrder')}</span>
                    </Button>

                    <Button
                      onClick={() => setWhatsAppModalData(order)}
                      variant='outline'
                      size='sm'
                      className='h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer border-emerald-500/30'
                      title='WhatsApp'
                    >
                      <MessageSquare className='w-3.5 h-3.5' />
                    </Button>

                    <Button
                      onClick={() => handlePrintDeliverySlip(order)}
                      variant='outline'
                      size='sm'
                      className='h-8 w-8 p-0 cursor-pointer'
                      title={t('printSlip')}
                    >
                      <Printer className='w-3.5 h-3.5' />
                    </Button>
                  </div>

                  {/* Right: State Progression */}
                  <div className='flex items-center gap-1.5'>
                    {isPending && (
                      <Button
                        onClick={() => handleOpenDispatch(order)}
                        size='sm'
                        className='h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer gap-1 px-2.5'
                      >
                        <Truck className='w-3.5 h-3.5' />
                        <span>{t('markDispatched')}</span>
                      </Button>
                    )}

                    {isDispatched && (
                      <Button
                        onClick={() => handleOpenComplete(order)}
                        size='sm'
                        className='h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1 px-2.5'
                      >
                        <CheckCircle2 className='w-3.5 h-3.5' />
                        <span>{t('markCompleted')}</span>
                      </Button>
                    )}

                    {!isCompleted && !isCancelled && (
                      <Button
                        onClick={() => handleCancelOrder(order)}
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer'
                        title={t('cancelOrder')}
                      >
                        <X className='w-3.5 h-3.5' />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* ================== PAGINATION BAR ================== */}
      {filteredAndSortedOrders.length > 0 && (
        <Card className='p-3 sm:p-4 border-border shadow-subtle bg-card/60 backdrop-blur-sm'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-3 text-xs'>
            {/* Left: Range and Count Indicator */}
            <div className='text-muted-foreground'>
              {language === 'ur'
                ? `${totalItems} میں سے ${startIndex + 1} تا ${endIndex} آرڈرز`
                : `Showing ${startIndex + 1}–${endIndex} of ${totalItems} orders`}
            </div>

            {/* Right: Items Per Page Selector & Page Navigation */}
            <div className='flex items-center gap-3'>
              {/* Page Size Selector */}
              <div className='flex items-center gap-1.5 text-muted-foreground'>
                <span>{t('itemsPerPage')}:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className='bg-muted/40 border border-border/80 rounded px-2 py-1 text-xs text-foreground font-medium focus:outline-none cursor-pointer'
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Navigation Chevrons & Numbers */}
              <div className='flex items-center gap-1'>
                <Button
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  variant='outline'
                  size='sm'
                  className='h-8 w-8 p-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                  title='First Page'
                >
                  <ChevronsLeft className='w-3.5 h-3.5' />
                </Button>

                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  variant='outline'
                  size='sm'
                  className='h-8 w-8 p-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                  title={t('previousPage')}
                >
                  <ChevronLeft className='w-3.5 h-3.5' />
                </Button>

                {/* Page Number Pills */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((pageNum) => {
                    // Show current page, first, last, and immediate neighbors
                    return (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - safeCurrentPage) <= 1
                    )
                  })
                  .map((pageNum, idx, arr) => {
                    const prev = arr[idx - 1]
                    const showEllipsis = prev && pageNum - prev > 1

                    return (
                      <React.Fragment key={pageNum}>
                        {showEllipsis && (
                          <span className='px-1 text-muted-foreground font-mono'>...</span>
                        )}
                        <Button
                          onClick={() => setCurrentPage(pageNum)}
                          variant={safeCurrentPage === pageNum ? 'default' : 'outline'}
                          size='sm'
                          className={`h-8 w-8 p-0 text-xs font-mono cursor-pointer ${
                            safeCurrentPage === pageNum
                              ? 'bg-primary text-primary-foreground font-bold shadow-subtle'
                              : 'text-foreground'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      </React.Fragment>
                    )
                  })}

                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  variant='outline'
                  size='sm'
                  className='h-8 w-8 p-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                  title={t('nextPage')}
                >
                  <ChevronRight className='w-3.5 h-3.5' />
                </Button>

                <Button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  variant='outline'
                  size='sm'
                  className='h-8 w-8 p-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                  title='Last Page'
                >
                  <ChevronsRight className='w-3.5 h-3.5' />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ================== ORDER DETAILS MODAL ================== */}
      <Dialog
        isOpen={!!detailModalOrder}
        onClose={() => setDetailModalOrder(null)}
        title={
          detailModalOrder
            ? `${t('orderDetails')}: ${detailModalOrder.id}`
            : t('orderDetails')
        }
        description={
          detailModalOrder
            ? `${t('placedOn')} ${new Date(detailModalOrder.createdAt).toLocaleDateString()} at ${new Date(
                detailModalOrder.createdAt,
              ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : ''
        }
        size='lg'
      >
        {detailModalOrder && (
          <div className='space-y-4 py-1 text-xs'>
            {/* Top Status & Meta Row */}
            <div className='flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/40 rounded-lg border border-border'>
              <div className='flex items-center gap-2'>
                {renderStatusBadge(detailModalOrder.status)}
                <Badge variant='outline' className='font-mono font-semibold' dir='ltr'>
                  {detailModalOrder.id}
                </Badge>
                <button
                  onClick={() => handleCopyText(detailModalOrder.id, 'orderId')}
                  className='p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer'
                  title={t('copyOrderId')}
                >
                  {copiedOrderId === detailModalOrder.id ? (
                    <Check className='w-3 h-3 text-emerald-600' />
                  ) : (
                    <Copy className='w-3 h-3' />
                  )}
                </button>
              </div>

              <div>{renderPaymentBadge(detailModalOrder)}</div>
            </div>

            {/* 2-Column Info Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Customer & Delivery */}
              <div className='p-3.5 rounded-lg border border-border bg-card space-y-2.5'>
                <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                  {t('customerAndPhone')}
                </div>
                <div className='space-y-1'>
                  <div className='font-bold text-foreground text-sm'>
                    {detailModalOrder.customerName}
                  </div>
                  <div
                    className='text-xs text-muted-foreground flex items-center gap-1.5 font-mono'
                    dir='ltr'
                  >
                    <Phone className='w-3.5 h-3.5 text-primary' />
                    <span>{detailModalOrder.customerPhone}</span>
                  </div>
                </div>

                <div className='pt-2 border-t border-border/60 space-y-1'>
                  <div className='text-[11px] font-semibold text-muted-foreground'>
                    {t('deliveryAddress')}:
                  </div>
                  <div className='text-xs text-foreground flex items-start gap-1.5'>
                    <MapPin className='w-3.5 h-3.5 text-primary shrink-0 mt-0.5' />
                    <span>
                      {detailModalOrder.deliveryAddress},{' '}
                      <strong className='text-foreground'>{detailModalOrder.city}</strong>
                    </span>
                  </div>
                </div>

                {detailModalOrder.notes && (
                  <div className='pt-2 border-t border-border/60'>
                    <div className='text-[11px] font-semibold text-muted-foreground mb-1'>
                      {t('customerNotes')}:
                    </div>
                    <div className='text-[11px] text-muted-foreground italic bg-muted/30 p-2 rounded border border-border/50'>
                      &ldquo;{detailModalOrder.notes}&rdquo;
                    </div>
                  </div>
                )}
              </div>

              {/* Logistics & Fulfillment */}
              <div className='p-3.5 rounded-lg border border-border bg-card space-y-2.5'>
                <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                  {t('assignedCourier')}
                </div>

                {detailModalOrder.courierName ? (
                  <div className='space-y-2'>
                    <div className='p-2.5 rounded bg-blue-500/10 border border-blue-500/20 text-xs'>
                      <div className='font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5'>
                        <Truck className='w-4 h-4' />
                        <span>{detailModalOrder.courierName}</span>
                      </div>
                      {detailModalOrder.trackingNumber && (
                        <div
                          className='mt-1 text-[11px] font-mono text-foreground flex items-center gap-1.5'
                          dir='ltr'
                        >
                          <span className='text-muted-foreground'>{t('trackingNumber')}:</span>
                          <span className='font-bold'>{detailModalOrder.trackingNumber}</span>
                          <button
                            onClick={() =>
                              handleCopyText(detailModalOrder.trackingNumber, 'tracking')
                            }
                            className='hover:text-primary cursor-pointer'
                            title={t('copyTracking')}
                          >
                            {copiedTracking === detailModalOrder.trackingNumber ? (
                              <Check className='w-3 h-3 text-emerald-600' />
                            ) : (
                              <Copy className='w-3 h-3' />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {detailModalOrder.dispatchedAt && (
                      <div className='text-[11px] text-muted-foreground font-mono'>
                        Dispatched:{' '}
                        {new Date(detailModalOrder.dispatchedAt).toLocaleString()}
                      </div>
                    )}
                    {detailModalOrder.completedAt && (
                      <div className='text-[11px] text-emerald-600 dark:text-emerald-400 font-mono'>
                        Completed:{' '}
                        {new Date(detailModalOrder.completedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='p-3 rounded bg-muted/40 border border-dashed border-border text-center text-muted-foreground'>
                    <Truck className='w-5 h-5 mx-auto opacity-40 mb-1' />
                    <span>Awaiting courier assignment upon dispatch</span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className='space-y-2'>
              <div className='font-semibold text-foreground text-xs'>
                {t('orderedItems')} ({detailModalOrder.items.length})
              </div>
              <div className='border border-border rounded-lg overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted/40 text-[11px]'>
                      <TableHead>{t('productAndMedia')}</TableHead>
                      <TableHead className='text-center'>{t('quantity')}</TableHead>
                      <TableHead className='text-right'>{t('unitPrice')}</TableHead>
                      <TableHead className='text-right'>{t('total')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className='divide-y divide-border/60 text-xs'>
                    {detailModalOrder.items.map((item, idx) => {
                      const displayName =
                        language === 'ur' && item.urduName ? item.urduName : item.name
                      const productForPreview = inventory?.find(
                        (p) => p.sku === item.sku || p.id === item.productId,
                      ) || {
                        name: item.name,
                        urduName: item.urduName,
                        sku: item.sku,
                        image: item.image,
                        price: item.price,
                        stock: item.stock ?? 'N/A',
                        category: item.category || 'General',
                      }

                      return (
                        <TableRow key={idx} className='hover:bg-muted/20'>
                          <TableCell className='py-2.5 flex items-center gap-2.5'>
                            {item.image && (
                              <div
                                onClick={() => setPreviewProduct(productForPreview)}
                                className='w-10 h-10 rounded-md overflow-hidden border border-border shrink-0 cursor-zoom-in bg-muted/40 hover:ring-2 hover:ring-primary/60 transition-all'
                                title='Click to enlarge'
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className='w-full h-full object-cover'
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                            <div>
                              <div className='font-medium text-foreground'>{displayName}</div>
                              <span className='font-mono text-[10px] text-muted-foreground' dir='ltr'>
                                {item.sku}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='py-2.5 text-center font-mono font-bold'>
                            {item.qty}
                          </TableCell>
                          <TableCell className='py-2.5 text-right font-mono text-muted-foreground'>
                            {formatCurrency(item.price, language)}
                          </TableCell>
                          <TableCell className='py-2.5 text-right font-mono font-bold text-foreground'>
                            {formatCurrency(item.price * item.qty, language)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className='p-3 bg-muted/30 rounded-lg border border-border flex flex-col items-end gap-1 font-mono text-xs'>
              <div className='flex justify-between w-48 text-muted-foreground'>
                <span>{t('subtotal')}:</span>
                <span>{formatCurrency(detailModalOrder.subtotal, language)}</span>
              </div>
              <div className='flex justify-between w-48 text-muted-foreground'>
                <span>{t('deliveryFee')}:</span>
                <span>{formatCurrency(detailModalOrder.deliveryFee, language)}</span>
              </div>
              <div className='flex justify-between w-48 pt-1.5 border-t border-border font-bold text-sm text-foreground'>
                <span>{t('grandTotal')}:</span>
                <span className='text-primary'>
                  {formatCurrency(detailModalOrder.total, language)}
                </span>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className='flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border'>
              <div className='flex items-center gap-2'>
                <Button
                  onClick={() => setWhatsAppModalData(detailModalOrder)}
                  variant='outline'
                  size='sm'
                  className='h-8 text-xs cursor-pointer gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                >
                  <MessageSquare className='w-3.5 h-3.5 text-emerald-600' />
                  <span>WhatsApp</span>
                </Button>

                <Button
                  onClick={() => handlePrintDeliverySlip(detailModalOrder)}
                  variant='outline'
                  size='sm'
                  className='h-8 text-xs cursor-pointer gap-1.5'
                >
                  <Printer className='w-3.5 h-3.5' />
                  <span>{t('printSlip')}</span>
                </Button>
              </div>

              <div className='flex items-center gap-2'>
                {detailModalOrder.status === 'Pending' && (
                  <Button
                    onClick={() => {
                      const tgt = detailModalOrder
                      setDetailModalOrder(null)
                      handleOpenDispatch(tgt)
                    }}
                    size='sm'
                    className='h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer gap-1.5'
                  >
                    <Truck className='w-3.5 h-3.5' />
                    <span>{t('markDispatched')}</span>
                  </Button>
                )}

                {detailModalOrder.status === 'Dispatched' && (
                  <Button
                    onClick={() => {
                      const tgt = detailModalOrder
                      setDetailModalOrder(null)
                      handleOpenComplete(tgt)
                    }}
                    size='sm'
                    className='h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1.5'
                  >
                    <CheckCircle2 className='w-3.5 h-3.5' />
                    <span>{t('markCompleted')}</span>
                  </Button>
                )}

                {!['Completed', 'Cancelled'].includes(detailModalOrder.status) && (
                  <Button
                    onClick={() => {
                      const tgt = detailModalOrder
                      handleCancelOrder(tgt)
                    }}
                    variant='ghost'
                    size='sm'
                    className='h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer'
                  >
                    <X className='w-3.5 h-3.5 mr-1' />
                    <span>{t('cancelOrder')}</span>
                  </Button>
                )}

                <Button
                  variant='outline'
                  onClick={() => setDetailModalOrder(null)}
                  className='h-8 text-xs cursor-pointer'
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* ================== DISPATCH MODAL ================== */}
      <Dialog
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title={t('dispatchDialogTitle')}
        description={t('dispatchDialogDesc')}
        size='md'
      >
        {dispatchOrderTarget && (
          <div className='space-y-4 py-2'>
            <div className='p-3 bg-muted/40 rounded-lg text-xs space-y-1.5 border border-border'>
              <div className='flex justify-between'>
                <span className='font-semibold text-foreground'>
                  {dispatchOrderTarget.customerName}
                </span>
                <span className='font-mono font-semibold text-primary' dir='ltr'>
                  {dispatchOrderTarget.id}
                </span>
              </div>
              <div className='text-muted-foreground'>
                {dispatchOrderTarget.deliveryAddress}, {dispatchOrderTarget.city}
              </div>
              <div className='text-muted-foreground flex justify-between pt-1 border-t border-border/60'>
                <span>
                  {dispatchOrderTarget.items.length} {t('itemsCount')}
                </span>
                <span className='font-bold text-foreground font-mono'>
                  {formatCurrency(dispatchOrderTarget.total, language)}
                </span>
              </div>
            </div>

            <div className='p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2'>
              <Boxes className='w-4 h-4 shrink-0 mt-0.5 text-amber-600' />
              <span>
                {language === 'ur'
                  ? 'ڈسپیچ کی تصدیق پر آرڈر کی اشیاء خودکار طور پر دکان کے انوینٹری اسٹاک سے منہا ہو جائیں گی۔'
                  : 'Confirming dispatch will automatically decrement the ordered items from your active shop inventory.'}
              </span>
            </div>

            <div className='space-y-3 text-xs'>
              <div className='space-y-1'>
                <label className='font-medium text-foreground'>{t('courierRider')}</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-subtle'
                >
                  <option value='Shop Delivery Rider'>Shop Delivery Rider (Local Area)</option>
                  <option value='TCS Express'>TCS Express</option>
                  <option value='Leopards Courier'>Leopards Courier</option>
                  <option value='M&P Courier'>M&P Courier</option>
                  <option value='PostEx'>PostEx (COD Delivery)</option>
                  <option value='Customer Self-Pickup'>Customer Self-Pickup at Shop</option>
                </select>
              </div>

              <div className='space-y-1'>
                <label className='font-medium text-foreground'>{t('trackingNumber')}</label>
                <Input
                  type='text'
                  placeholder='e.g., TCS-928174 or Rider Phone'
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className='h-9 text-xs'
                />
              </div>

              <div className='space-y-1'>
                <label className='font-medium text-foreground'>
                  {language === 'ur' ? 'ڈسپیچ نوٹس (اختیاری)' : 'Dispatch Notes (Optional)'}
                </label>
                <Input
                  type='text'
                  placeholder='e.g., Package inspected, fragile label attached'
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className='h-9 text-xs'
                />
              </div>
            </div>

            <div className='flex justify-end gap-2.5 pt-3 border-t border-border'>
              <Button
                variant='outline'
                onClick={() => setIsDispatchModalOpen(false)}
                className='h-9 text-xs cursor-pointer'
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleConfirmDispatch}
                className='h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              >
                <Truck className='w-3.5 h-3.5 mr-1.5' />
                <span>
                  {language === 'ur'
                    ? 'ڈسپیچ کریں اور اسٹاک منہا کریں'
                    : 'Confirm Dispatch & Deduct Stock'}
                </span>
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ================== COMPLETE ORDER MODAL ================== */}
      <Dialog
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title={t('completeDialogTitle')}
        description={t('completeDialogDesc')}
        size='sm'
      >
        {completeOrderTarget && (
          <div className='space-y-4 py-2 text-xs'>
            <div className='p-3 bg-muted/40 rounded-lg space-y-1.5 border border-border'>
              <div className='font-semibold text-foreground'>
                {completeOrderTarget.customerName}
              </div>
              <div className='text-muted-foreground'>
                Order: <span className='font-mono font-bold' dir='ltr'>{completeOrderTarget.id}</span>
              </div>
              <div className='text-muted-foreground'>
                Total to Collect/Settle:{' '}
                <strong className='font-mono text-primary'>
                  {formatCurrency(completeOrderTarget.total, language)}
                </strong>
              </div>
              <div className='text-[11px] text-muted-foreground'>
                Payment Method: <span className='font-semibold'>{completeOrderTarget.paymentMethod}</span>
              </div>
            </div>

            <p className='text-muted-foreground'>
              {language === 'ur'
                ? 'کیا آپ تصدیق کرتے ہیں کہ کسٹمر کو سامان مل چکا ہے اور رقم وصول ہو گئی ہے؟ یہ آرڈر آپ کے کل مالیاتی محصولات اور کسٹمر لیجر میں شامل کر دیا جائے گا۔'
                : 'Confirm customer has received the parcel and full payment has been collected. This transaction will be logged to your Financial Analytics and Customer Ledger.'}
            </p>

            <div className='flex justify-end gap-2.5 pt-3 border-t border-border'>
              <Button
                variant='outline'
                onClick={() => setIsCompleteModalOpen(false)}
                className='h-9 text-xs cursor-pointer'
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleConfirmComplete}
                className='h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
              >
                <CheckCircle2 className='w-3.5 h-3.5 mr-1.5' />
                <span>
                  {language === 'ur' ? 'مکمل اور رقم وصول کریں' : 'Confirm Delivered & Settle'}
                </span>
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ================== HIGH-RESOLUTION IMAGE MODAL ================== */}
      <ImagePreviewModal
        isOpen={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
        product={previewProduct}
      />

      {/* ================== WHATSAPP PREVIEW MODAL ================== */}
      {whatsAppModalData && (
        <WhatsAppPreviewModal
          isOpen={!!whatsAppModalData}
          onClose={() => setWhatsAppModalData(null)}
          recipientName={whatsAppModalData.customerName}
          recipientPhone={whatsAppModalData.customerPhone}
          contextType='order'
          contextData={whatsAppModalData}
        />
      )}
    </div>
  )
}
