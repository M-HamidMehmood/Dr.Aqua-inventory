import React, { useState } from 'react'
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
} from './ui/Icons'
import { useLanguage } from '../context/LanguageContext'
import { formatCurrency } from '../utils/translations'

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

  const [activeFilter, setActiveFilter] = useState('All') // 'All' | 'Pending' | 'Dispatched' | 'Completed' | 'Cancelled'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [notification, setNotification] = useState(null)

  // Dispatch Dialog State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  const [dispatchOrderTarget, setDispatchOrderTarget] = useState(null)
  const [courierName, setCourierName] = useState('Shop Delivery Rider')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [dispatchNotes, setDispatchNotes] = useState('')

  // Completion Dialog State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [completeOrderTarget, setCompleteOrderTarget] = useState(null)

  const showNotice = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 4500)
  }

  // Filter and search
  const filteredOrders = webOrders.filter((order) => {
    const matchesFilter =
      activeFilter === 'All' ? true : order.status.toLowerCase() === activeFilter.toLowerCase()

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerPhone.includes(searchQuery) ||
          order.city.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  // Counters
  const pendingCount = webOrders.filter((o) => o.status === 'Pending').length
  const dispatchedCount = webOrders.filter((o) => o.status === 'Dispatched').length
  const completedCount = webOrders.filter((o) => o.status === 'Completed').length

  // Open Dispatch Modal
  const handleOpenDispatch = (order) => {
    // Check if sufficient stock is available before dispatching
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

  // Confirm Dispatch & Deduct Inventory
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

    showNotice(
      language === 'ur'
        ? `آرڈر ${dispatchOrderTarget.id} کامیابی سے ڈسپیچ ہو گیا اور سامان اسٹاک سے منہا ہو گیا۔`
        : `Order ${dispatchOrderTarget.id} dispatched! Inventory stock automatically deducted.`,
      'success',
    )

    setIsDispatchModalOpen(false)
    setDispatchOrderTarget(null)
  }

  // Open Complete Modal
  const handleOpenComplete = (order) => {
    setCompleteOrderTarget(order)
    setIsCompleteModalOpen(true)
  }

  // Confirm Complete Order & Log to Sales & Customers
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
      customerId: Date.now(), // Generate or link customer ID
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

    // 3. Link or update Customer in Customer CRM
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

    // If order was dispatched, restore the deducted stock
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
  }

  // Generate & Download Delivery Dispatch Slip
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
      pdf.text('Website: dr-aqua-project.vercel.app  •  UAN / WhatsApp: 0334 7071759', pageWidth / 2, 33, {
        align: 'center',
      })

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
        pdf.text(`Assigned Carrier: ${order.courierName}  ${order.trackingNumber ? `| Tracking: ${order.trackingNumber}` : ''}`, 14, y)
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

  // Quick WhatsApp link
  const getWhatsAppLink = (order) => {
    const cleanPhone = order.customerPhone.replace(/\D/g, '')
    const targetPhone = cleanPhone.startsWith('92')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? `92${cleanPhone.substring(1)}`
      : `92${cleanPhone}`

    let msg = ''
    if (order.status === 'Pending') {
      msg =
        language === 'ur'
          ? `السلام علیکم ${order.customerName}، ڈاکٹر ایکوا سے رابطہ کر رہے ہیں۔ آپ کا آرڈر (${order.id}) موصول ہو چکا ہے۔ ہم اسے جلد از جلد روانہ کر رہے ہیں۔ کل رقم: PKR ${order.total.toLocaleString()}۔`
          : `Assalam-o-Alaikum ${order.customerName}, Dr. Aqua here. We have received your web order ${order.id} for PKR ${order.total.toLocaleString()}. It is currently under review for dispatch.`
    } else if (order.status === 'Dispatched') {
      msg =
        language === 'ur'
          ? `السلام علیکم ${order.customerName}، آپ کا ڈاکٹر ایکوا آرڈر (${order.id}) روانہ کر دیا گیا ہے۔ کورئیر/رائڈر: ${order.courierName || 'Shop Rider'}${order.trackingNumber ? `، ٹریکنگ نمبر: ${order.trackingNumber}` : ''}۔ شکریہ!`
          : `Assalam-o-Alaikum ${order.customerName}, your Dr. Aqua order ${order.id} has been dispatched via ${order.courierName || 'Shop Rider'}${order.trackingNumber ? ` (Tracking: ${order.trackingNumber})` : ''}. Thank you!`
    } else {
      msg =
        language === 'ur'
          ? `السلام علیکم ${order.customerName}، امید ہے آپ کو ڈاکٹر ایکوا سے موصول شدہ سامان پسند آیا ہوگا۔ کسی بھی سروس یا فلٹر سپورٹ کے لیے ہم حاضر ہیں۔`
          : `Assalam-o-Alaikum ${order.customerName}, we hope you are satisfied with your Dr. Aqua products. Reach out to us anytime for warranty or filter support.`
    }

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className='space-y-6'>
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

      {/* Header and KPI Summary */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
              <ShoppingBag className='w-4 h-4' />
            </div>
            <span>{t('webOrdersTitle')}</span>
          </h2>
          <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
            {t('webOrdersDesc')}
          </p>
        </div>

        <div className='flex items-center gap-2 self-start md:self-auto'>
          <Badge variant='outline' className='px-3 py-1.5 text-xs font-mono gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
            <span>dr-aqua-project.vercel.app</span>
          </Badge>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        <Card className='p-3.5 border-border shadow-subtle'>
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

        <Card className='p-3.5 border-amber-500/20 bg-amber-500/5 shadow-subtle'>
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

        <Card className='p-3.5 border-blue-500/20 bg-blue-500/5 shadow-subtle'>
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

        <Card className='p-3.5 border-emerald-500/20 bg-emerald-500/5 shadow-subtle'>
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

      {/* Filter Tabs & Search Controls */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
        {/* Status Filter Pills */}
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0'>
          {[
            { id: 'All', label: t('allOrders'), count: webOrders.length },
            { id: 'Pending', label: t('pendingOrders'), count: pendingCount, variant: 'warning' },
            { id: 'Dispatched', label: t('dispatchedOrders'), count: dispatchedCount, variant: 'info' },
            { id: 'Completed', label: t('completedOrders'), count: completedCount, variant: 'success' },
          ].map((tab) => {
            const isActive = activeFilter.toLowerCase() === tab.id.toLowerCase()
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
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

        {/* Search Bar */}
        <div className='relative w-full sm:w-72'>
          <Search
            className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-muted-foreground ${
              isRTL ? 'right-3' : 'left-3'
            }`}
          />
          <Input
            type='text'
            placeholder={t('searchOrdersPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`h-9 text-xs shadow-subtle ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${
                isRTL ? 'left-2.5' : 'right-2.5'
              }`}
            >
              <X className='w-3 h-3' />
            </button>
          )}
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className='space-y-4'>
        {filteredOrders.length === 0 ? (
          <Card className='p-12 text-center border-dashed border-border'>
            <ShoppingBag className='w-12 h-12 mx-auto text-muted-foreground/30 mb-3' />
            <p className='text-sm font-semibold text-foreground'>{t('noOrdersFound')}</p>
            <p className='text-xs text-muted-foreground mt-1'>
              {language === 'ur'
                ? 'ویب سائٹ سے نئے آرڈرز یہاں ظاہر ہوں گے۔'
                : 'Customer orders placed on dr-aqua-project will automatically appear here.'}
            </p>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const isPending = order.status === 'Pending'
            const isDispatched = order.status === 'Dispatched'
            const isCompleted = order.status === 'Completed'
            const isCancelled = order.status === 'Cancelled'

            return (
              <Card
                key={order.id}
                className='overflow-hidden border-border/80 shadow-subtle hover:shadow-elevated transition-shadow'
              >
                {/* Order Top Ribbon */}
                <div className='bg-muted/30 px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3'>
                  <div className='flex items-center gap-2.5'>
                    <Badge variant='outline' className='font-mono font-semibold text-xs px-2.5 py-0.5' dir='ltr'>
                      {order.id}
                    </Badge>

                    {/* Status Badge */}
                    {isPending && (
                      <Badge variant='warning' className='text-xs gap-1'>
                        <Clock className='w-3 h-3' />
                        <span>{t('pendingOrders')}</span>
                      </Badge>
                    )}
                    {isDispatched && (
                      <Badge variant='info' className='text-xs gap-1'>
                        <Truck className='w-3 h-3' />
                        <span>{t('dispatchedOrders')}</span>
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant='success' className='text-xs gap-1'>
                        <CheckCircle2 className='w-3 h-3' />
                        <span>{t('completedOrders')}</span>
                      </Badge>
                    )}
                    {isCancelled && (
                      <Badge variant='destructive' className='text-xs gap-1'>
                        <X className='w-3 h-3' />
                        <span>{t('cancelledOrders')}</span>
                      </Badge>
                    )}

                    {/* Channel Tag */}
                    <Badge variant='secondary' className='text-[10px] hidden sm:inline-flex'>
                      {t('channelOnline')}
                    </Badge>
                  </div>

                  {/* Payment Details & Timestamp */}
                  <div className='flex items-center gap-2 text-xs'>
                    {/* Payment Method Badge */}
                    <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-[11px] font-medium'>
                      {order.paymentMethod === 'Cash' && <Wallet className='w-3.5 h-3.5 text-emerald-600' />}
                      {(order.paymentMethod === 'JazzCash' || order.paymentMethod === 'EasyPaisa') && (
                        <CreditCard className='w-3.5 h-3.5 text-amber-600' />
                      )}
                      {order.paymentMethod === 'Bank Transfer' && (
                        <Landmark className='w-3.5 h-3.5 text-blue-600' />
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
                      {order.paymentReference && (
                        <span className='font-mono text-[10px] text-muted-foreground' dir='ltr'>
                          ({order.paymentReference})
                        </span>
                      )}
                    </div>

                    <span className='text-[11px] text-muted-foreground font-mono'>
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Order Details Body */}
                <CardContent className='p-4'>
                  <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
                    {/* Left: Customer & Address Information */}
                    <div className='lg:col-span-4 space-y-3 border-b lg:border-b-0 lg:border-r border-border pb-4 lg:pb-0 lg:pr-4'>
                      <div>
                        <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1'>
                          {t('customerAndPhone')}
                        </div>
                        <div className='font-bold text-foreground text-sm flex items-center gap-1.5'>
                          <span>{order.customerName}</span>
                        </div>
                        <div className='text-xs text-muted-foreground mt-0.5 flex items-center gap-1' dir='ltr'>
                          <Phone className='w-3 h-3' />
                          <span>{order.customerPhone}</span>
                        </div>
                      </div>

                      <div>
                        <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1'>
                          {t('deliveryAddress')}
                        </div>
                        <div className='text-xs text-foreground flex items-start gap-1.5'>
                          <MapPin className='w-3.5 h-3.5 text-primary shrink-0 mt-0.5' />
                          <span>
                            {order.deliveryAddress}, <strong className='text-foreground'>{order.city}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Courier info if dispatched */}
                      {order.courierName && (
                        <div className='p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/15 text-xs space-y-1'>
                          <div className='font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5'>
                            <Truck className='w-3.5 h-3.5' />
                            <span>{order.courierName}</span>
                          </div>
                          {order.trackingNumber && (
                            <div className='text-[11px] text-muted-foreground font-mono' dir='ltr'>
                              Tracking: {order.trackingNumber}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Customer Notes */}
                      {order.notes && (
                        <div className='p-2 rounded bg-muted/30 text-[11px] text-muted-foreground italic border border-border/60'>
                          &ldquo;{order.notes}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Right: Ordered Line Items & Grand Total */}
                    <div className='lg:col-span-8 flex flex-col justify-between'>
                      {/* Items table */}
                      <div className='overflow-x-auto'>
                        <table className='w-full text-xs'>
                          <thead>
                            <tr className='text-muted-foreground border-b border-border/60'>
                              <th className={`py-1.5 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('productAndMedia')}
                              </th>
                              <th className='py-1.5 text-center font-medium'>{t('quantity')}</th>
                              <th className={`py-1.5 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                                {t('unitPrice')}
                              </th>
                              <th className={`py-1.5 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                                {t('total')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-border/40'>
                            {order.items.map((item, idx) => {
                              const displayName =
                                language === 'ur' && item.urduName ? item.urduName : item.name
                              return (
                                <tr key={idx} className='hover:bg-muted/20'>
                                  <td className='py-2 flex items-center gap-2'>
                                    {item.image && (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className='w-7 h-7 rounded object-cover border border-border/60 shrink-0'
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                        }}
                                      />
                                    )}
                                    <div>
                                      <div className='font-medium text-foreground text-xs'>
                                        {displayName}
                                      </div>
                                      <span className='font-mono text-[10px] text-muted-foreground' dir='ltr'>
                                        {item.sku}
                                      </span>
                                    </div>
                                  </td>
                                  <td className='py-2 text-center font-mono font-semibold'>
                                    {item.qty}
                                  </td>
                                  <td className={`py-2 font-mono text-muted-foreground ${isRTL ? 'text-left' : 'text-right'}`}>
                                    {formatCurrency(item.price, language)}
                                  </td>
                                  <td className={`py-2 font-mono font-semibold text-foreground ${isRTL ? 'text-left' : 'text-right'}`}>
                                    {formatCurrency(item.price * item.qty, language)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Calculations Bar */}
                      <div className='mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs'>
                        <div className='flex items-center gap-4 text-muted-foreground'>
                          <span>
                            {t('subtotal')}:{' '}
                            <strong className='text-foreground font-mono'>
                              {formatCurrency(order.subtotal, language)}
                            </strong>
                          </span>
                          <span>
                            {t('deliveryFee')}:{' '}
                            <strong className='text-foreground font-mono'>
                              {formatCurrency(order.deliveryFee, language)}
                            </strong>
                          </span>
                        </div>

                        <div className='flex items-center gap-2'>
                          <span className='font-semibold text-foreground text-sm'>
                            {t('grandTotal')}:
                          </span>
                          <span className='text-base font-bold font-mono text-primary'>
                            {formatCurrency(order.total, language)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Order Action Footer */}
                <CardFooter className='bg-muted/20 px-4 py-2.5 border-t border-border flex flex-wrap items-center justify-between gap-2.5'>
                  {/* Left: Quick Contact & Print Slip */}
                  <div className='flex items-center gap-2'>
                    <a
                      href={getWhatsAppLink(order)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-subtle'
                    >
                      <MessageSquare className='w-3.5 h-3.5' />
                      <span>WhatsApp</span>
                    </a>

                    <Button
                      onClick={() => handlePrintDeliverySlip(order)}
                      variant='outline'
                      size='sm'
                      className='h-8 text-xs cursor-pointer gap-1.5'
                    >
                      <Printer className='w-3.5 h-3.5' />
                      <span>{language === 'ur' ? 'ڈسپیچ سلپ' : 'Dispatch Slip'}</span>
                    </Button>
                  </div>

                  {/* Right: Status Advance Buttons */}
                  <div className='flex items-center gap-2'>
                    {/* Stage 1: Pending -> Dispatch */}
                    {isPending && (
                      <Button
                        onClick={() => handleOpenDispatch(order)}
                        className='h-8 text-xs font-semibold cursor-pointer gap-1.5 bg-blue-600 hover:bg-blue-700 text-white'
                      >
                        <Truck className='w-3.5 h-3.5' />
                        <span>{t('markDispatched')}</span>
                      </Button>
                    )}

                    {/* Stage 2: Dispatched -> Completed */}
                    {isDispatched && (
                      <Button
                        onClick={() => handleOpenComplete(order)}
                        className='h-8 text-xs font-semibold cursor-pointer gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white'
                      >
                        <CheckCircle2 className='w-3.5 h-3.5' />
                        <span>{t('markCompleted')}</span>
                      </Button>
                    )}

                    {/* Cancel Button if not completed */}
                    {!isCompleted && !isCancelled && (
                      <Button
                        onClick={() => handleCancelOrder(order)}
                        variant='ghost'
                        size='sm'
                        className='h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer'
                      >
                        <X className='w-3.5 h-3.5 mr-1' />
                        <span>{t('cancelOrder')}</span>
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>

      {/* Dispatch Order Modal */}
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
                <span className='font-semibold text-foreground'>{dispatchOrderTarget.customerName}</span>
                <span className='font-mono font-semibold text-primary'>{dispatchOrderTarget.id}</span>
              </div>
              <div className='text-muted-foreground'>
                {dispatchOrderTarget.deliveryAddress}, {dispatchOrderTarget.city}
              </div>
              <div className='text-muted-foreground flex justify-between pt-1 border-t border-border/60'>
                <span>{dispatchOrderTarget.items.length} {t('itemsCount')}</span>
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
                <span>{language === 'ur' ? 'ڈسپیچ کریں اور اسٹاک منہا کریں' : 'Confirm Dispatch & Deduct Stock'}</span>
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Complete Order Modal */}
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
              <div className='font-semibold text-foreground'>{completeOrderTarget.customerName}</div>
              <div className='text-muted-foreground'>Order: <span className='font-mono font-bold'>{completeOrderTarget.id}</span></div>
              <div className='text-muted-foreground'>
                Total to Collect/Settle: <strong className='font-mono text-primary'>{formatCurrency(completeOrderTarget.total, language)}</strong>
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
                <span>{language === 'ur' ? 'مکمل اور رقم وصول کریں' : 'Confirm Delivered & Settle'}</span>
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
