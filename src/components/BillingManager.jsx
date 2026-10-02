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
import {
  Receipt,
  Plus,
  Trash2,
  Download,
  Check,
  AlertCircle,
  Users,
  Boxes,
  FileText,
  Wallet,
  CreditCard,
  Landmark,
  Eye,
  MessageSquare,
} from './ui/Icons'
import { useLanguage } from '../context/LanguageContext'
import { formatCurrency } from '../utils/translations'
import ImagePreviewModal from './ui/ImagePreviewModal'
import WhatsAppPreviewModal from './WhatsAppPreviewModal'

export default function BillingManager({
  inventory,
  updateInventory,
  customers,
  updateCustomers,
  addSale,
}) {
  const { t, language, isRTL } = useLanguage()

  const [bill, setBill] = useState({
    customerId: '',
    items: [],
  })
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [notification, setNotification] = useState(null)

  // Phase 3: Payment Options & Order Modifiers
  const [paymentMethod, setPaymentMethod] = useState('Cash') // 'Cash' | 'JazzCash' | 'EasyPaisa' | 'Bank Transfer'
  const [paymentReference, setPaymentReference] = useState('')
  const [bankName, setBankName] = useState('Meezan Bank')
  const [discount, setDiscount] = useState(0)
  const [orderNotes, setOrderNotes] = useState('')

  // Preview & WhatsApp Dialog States
  const [previewProduct, setPreviewProduct] = useState(null)
  const [whatsAppModalData, setWhatsAppModalData] = useState(null)
  const [lastSettledSale, setLastSettledSale] = useState(null)


  const showNotice = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  const addItem = () => {
    if (!selectedProduct) {
      showNotice(t('selectProductFirstNotice'), 'error')
      return
    }

    const product = inventory.find((p) => p.id === Number(selectedProduct))
    if (!product) {
      showNotice(language === 'ur' ? 'پروڈکٹ نہیں ملی۔' : 'Product not found.', 'error')
      return
    }

    if (product.quantity < quantity) {
      showNotice(t('insufficientStockNotice', { stock: product.quantity }), 'error')
      return
    }

    // Check if already in bill
    const existingIndex = bill.items.findIndex((it) => it.id === product.id)
    if (existingIndex > -1) {
      const currentQty = bill.items[existingIndex].qty
      const newQty = currentQty + quantity
      if (newQty > product.quantity) {
        showNotice(t('insufficientStockNotice', { stock: product.quantity }), 'error')
        return
      }
      const updatedItems = [...bill.items]
      updatedItems[existingIndex].qty = newQty
      setBill({ ...bill, items: updatedItems })
    } else {
      setBill({
        ...bill,
        items: [...bill.items, { ...product, qty: quantity }],
      })
    }

    const prodName = language === 'ur' && product.urduName ? product.urduName : product.name
    setSelectedProduct('')
    setQuantity(1)
    showNotice(
      language === 'ur' ? `${prodName} بل میں شامل کر دیا گیا۔` : `Added ${product.name} to bill.`,
      'success',
    )
  }

  const removeItem = (index) => {
    setBill({ ...bill, items: bill.items.filter((_, i) => i !== index) })
  }

  const generateBill = () => {
    if (!bill.customerId) {
      showNotice(language === 'ur' ? 'براہ کرم بل کے لیے کسٹمر منتخب کریں۔' : 'Please select a customer for this invoice.', 'error')
      return
    }
    if (bill.items.length === 0) {
      showNotice(language === 'ur' ? 'براہ کرم کم از کم ایک پروڈکٹ شامل کریں۔' : 'Please add at least one product to the invoice.', 'error')
      return
    }

    const subtotal = bill.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    )
    const discountAmount = Math.max(0, Number(discount) || 0)
    const total = Math.max(0, subtotal - discountAmount)

    const invoice = `INV-${Date.now()}`
    const sale = {
      invoice,
      customerId: Number(bill.customerId),
      customerName: selectedCustomerObj ? selectedCustomerObj.name : '',
      items: bill.items,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      paymentReference:
        paymentMethod === 'Bank Transfer'
          ? `${bankName}${paymentReference ? ` - ${paymentReference}` : ''}`
          : paymentReference || undefined,
      orderOrigin: 'POS Counter',
      date: new Date(),
      notes: orderNotes || undefined,
    }

    addSale(sale)

    // Update inventory
    updateInventory(
      inventory.map((p) => {
        const sold = bill.items.find((i) => i.id === p.id)
        return sold ? { ...p, quantity: p.quantity - sold.qty } : p
      }),
    )

    // Update customer history
    updateCustomers(
      customers.map((c) =>
        c.id === Number(bill.customerId)
          ? { ...c, history: [...c.history, sale] }
          : c,
      ),
    )

    showNotice(t('billSettledSuccess', { invoice }), 'success')
    setLastSettledSale(sale)
    setBill({ customerId: '', items: [] })
    setPaymentReference('')
    setDiscount(0)
    setOrderNotes('')
  }

  const downloadPDF = () => {
    if (bill.items.length === 0) {
      showNotice(language === 'ur' ? 'رسید کے لیے پہلے آئٹمز شامل کریں۔' : 'Please add items to the bill before downloading receipt.', 'error')
      return
    }

    const customer = customers.find((c) => c.id === Number(bill.customerId))
    const subtotal = bill.items.reduce((sum, item) => sum + item.price * item.qty, 0)
    const discountAmount = Math.max(0, Number(discount) || 0)
    const total = Math.max(0, subtotal - discountAmount)
    const invoiceNo = `INV-${Date.now()}`

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()

      // Header
      pdf.setFontSize(22)
      pdf.setFont('helvetica', 'bold')
      pdf.text('DR. AQUA', pageWidth / 2, 22, { align: 'center' })

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Water Filtration & Purification Systems', pageWidth / 2, 29, {
        align: 'center',
      })

      // Divider line
      pdf.setLineWidth(0.4)
      pdf.line(20, 35, pageWidth - 20, 35)

      // Receipt Title
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('SALES INVOICE & RECEIPT', pageWidth / 2, 45, { align: 'center' })

      // Metadata
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Invoice No: ${invoiceNo}`, 20, 55)
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 60, 55)

      if (customer) {
        pdf.text(`Customer Name: ${customer.name}`, 20, 62)
        pdf.text(`Contact: ${customer.contact}`, 20, 68)
      }

      // Payment Method Info in PDF header
      pdf.setFont('helvetica', 'bold')
      pdf.text('Payment Mode:', pageWidth - 80, 62)
      pdf.setFont('helvetica', 'normal')
      pdf.text(paymentMethod, pageWidth - 45, 62)

      if (paymentReference) {
        pdf.setFont('helvetica', 'bold')
        pdf.text(paymentMethod === 'Bank Transfer' ? 'Bank / Slip:' : 'Trans Ref:', pageWidth - 80, 68)
        pdf.setFont('helvetica', 'normal')
        pdf.text(
          paymentMethod === 'Bank Transfer'
            ? `${bankName} (${paymentReference})`.substring(0, 24)
            : paymentReference.substring(0, 24),
          pageWidth - 45,
          68,
        )
      }

      // Items Table Header
      let yPos = 82
      pdf.setFillColor(243, 244, 246)
      pdf.rect(20, yPos - 6, pageWidth - 40, 10, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.text('Item Description', 25, yPos)
      pdf.text('Qty', 105, yPos)
      pdf.text('Unit Price', 130, yPos)
      pdf.text('Total (PKR)', 165, yPos)

      // Rows
      pdf.setFont('helvetica', 'normal')
      yPos += 10

      bill.items.forEach((item) => {
        pdf.text(item.name.substring(0, 32), 25, yPos)
        pdf.text(item.qty.toString(), 105, yPos)
        pdf.text(`PKR ${Number(item.price).toLocaleString()}`, 130, yPos)
        pdf.text(`PKR ${Number(item.price * item.qty).toLocaleString()}`, 165, yPos)
        yPos += 8
      })

      // Total divider
      yPos += 4
      pdf.line(20, yPos, pageWidth - 20, yPos)
      yPos += 8

      // Subtotal & Discount rows if discount applied
      if (discountAmount > 0) {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Subtotal:', pageWidth - 85, yPos)
        pdf.text(`PKR ${Number(subtotal).toLocaleString()}`, pageWidth - 45, yPos)
        yPos += 6

        pdf.text('Discount:', pageWidth - 85, yPos)
        pdf.text(`- PKR ${Number(discountAmount).toLocaleString()}`, pageWidth - 45, yPos)
        yPos += 7
      }

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(13)
      pdf.text(`Grand Total: PKR ${Number(total).toLocaleString()}`, pageWidth - 85, yPos)

      // Order Notes on PDF
      if (orderNotes) {
        yPos += 12
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'italic')
        pdf.text(`Notes: ${orderNotes}`, 20, yPos)
      }

      // Footer
      yPos += 22
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Thank you for choosing Dr. Aqua!', pageWidth / 2, yPos, {
        align: 'center',
      })
      pdf.text('For warranty and filter service support, contact Dr. Aqua Helpline.', pageWidth / 2, yPos + 6, {
        align: 'center',
      })

      pdf.save(`receipt-${invoiceNo}.pdf`)
      showNotice(t('pdfDownloadedNotice', { invoice: invoiceNo }), 'success')
    } catch (error) {
      console.error('Error generating PDF:', error)
      showNotice('Error generating PDF: ' + error.message, 'error')
    }
  }

  const subtotal = bill.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discountAmount = Math.max(0, Number(discount) || 0)
  const total = Math.max(0, subtotal - discountAmount)
  const selectedCustomerObj = customers.find((c) => c.id === Number(bill.customerId))

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 pb-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>
            {t('posBillingTitle')}
          </h2>
          <p className='text-sm text-muted-foreground mt-0.5'>
            {t('posBillingDesc')}
          </p>
        </div>
        <Badge variant='success' className='px-3 py-1 text-xs'>
          {language === 'ur' ? 'آن لائن پی او ایس فعال' : 'POS Online'}
        </Badge>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            notification.type === 'error'
              ? 'bg-destructive/10 border-destructive/30 text-destructive font-medium'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className='w-4 h-4 flex-shrink-0' />
          ) : (
            <Check className='w-4 h-4 flex-shrink-0' />
          )}
          <span>{notification.message}</span>
          {lastSettledSale && notification.type !== 'error' && (
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => setWhatsAppModalData(lastSettledSale)}
              className={`h-7 text-xs font-semibold gap-1.5 text-emerald-800 dark:text-emerald-300 bg-white/90 dark:bg-emerald-900/40 border-emerald-300 hover:bg-emerald-100 ${
                isRTL ? 'mr-auto' : 'ml-auto'
              } cursor-pointer`}
            >
              <MessageSquare className='w-3.5 h-3.5 text-emerald-600' />
              <span>{language === 'ur' ? 'واٹس ایپ رسید' : 'WhatsApp Receipt'}</span>
            </Button>
          )}
        </div>
      )}

      {/* 2-Column POS Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left Column: Selector & Item Adding */}
        <div className='lg:col-span-5 space-y-6'>
          {/* Customer Selection Card */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold flex items-center gap-2'>
                <Users className='w-4 h-4 text-primary' />
                <span>1. {t('selectCustomer')}</span>
              </CardTitle>
              <CardDescription className='text-xs'>
                {language === 'ur'
                  ? 'سروس اور فلٹر ٹریکنگ کے لیے بل کو کسٹمر پروفائل سے منسلک کریں۔'
                  : 'Attach invoice to existing customer profile for maintenance tracking.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <select
                value={bill.customerId}
                onChange={(e) => setBill({ ...bill, customerId: e.target.value })}
                className='flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground'
              >
                <option value=''>{t('chooseExistingCustomer')}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.contact})
                  </option>
                ))}
              </select>

              {selectedCustomerObj && (
                <div className='mt-3 p-3 bg-muted/40 rounded-lg text-xs space-y-1 border border-border'>
                  <div className='font-semibold text-foreground'>{selectedCustomerObj.name}</div>
                  <div className='text-muted-foreground'>{t('contactNumber')}: <span dir='ltr'>{selectedCustomerObj.contact}</span></div>
                  <div className='text-[11px] text-muted-foreground'>
                    {t('purchaseHistory')}: <span className='font-mono font-semibold'>{selectedCustomerObj.history?.length || 0}</span> {t('invoices')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Picker Card */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold flex items-center gap-2'>
                <Boxes className='w-4 h-4 text-primary' />
                <span>2. {t('selectProduct')}</span>
              </CardTitle>
              <CardDescription className='text-xs'>
                {language === 'ur'
                  ? 'گودام میں دستیاب اسٹاک میں سے پروڈکٹ منتخب کریں۔'
                  : 'Choose from available in-stock warehouse inventory.'}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-foreground'>
                  {t('catalogSummary')}
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className='flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground'
                >
                  <option value=''>{t('chooseProductFromStock')}</option>
                  {inventory
                    .filter((p) => p.quantity > 0)
                    .map((p) => {
                      const displayName = language === 'ur' && p.urduName ? p.urduName : p.name
                      return (
                        <option key={p.id} value={p.id}>
                          {p.sku ? `[${p.sku}] ` : ''}{displayName} ({t('warehouseStock')}: {p.quantity}) — {formatCurrency(p.price, language)}
                        </option>
                      )
                    })}
                </select>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-foreground'>
                    {t('quantity')}
                  </label>
                  <Input
                    type='number'
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, +e.target.value))}
                    min='1'
                    dir='ltr'
                    className='h-10 text-center font-semibold font-mono'
                  />
                </div>

                <div className='flex items-end'>
                  <Button
                    onClick={addItem}
                    className='w-full h-10 shadow-subtle cursor-pointer'
                  >
                    <Plus className={`w-4 h-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                    <span>{t('addItemToBill')}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase 3: Payment Method & Order Modifiers Card */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold flex items-center gap-2'>
                <CreditCard className='w-4 h-4 text-primary' />
                <span>3. {t('choosePaymentMethod')}</span>
              </CardTitle>
              <CardDescription className='text-xs'>
                {t('posPaymentNotice')}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3.5'>
              {/* Payment Method Selector Grid */}
              <div className='grid grid-cols-2 gap-2'>
                {[
                  { id: 'Cash', label: t('payCash'), icon: Wallet },
                  { id: 'JazzCash', label: t('payJazzCash'), icon: CreditCard },
                  { id: 'EasyPaisa', label: t('payEasyPaisa'), icon: CreditCard },
                  { id: 'Bank Transfer', label: t('payBankTransfer'), icon: Landmark },
                ].map((item) => {
                  const Icon = item.icon
                  const isSelected = paymentMethod === item.id
                  return (
                    <button
                      key={item.id}
                      type='button'
                      onClick={() => setPaymentMethod(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-subtle'
                          : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                      }`}
                    >
                      <Icon className='w-3.5 h-3.5 shrink-0' />
                      <span className='truncate'>{item.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Conditional Inputs for Mobile Wallets */}
              {(paymentMethod === 'JazzCash' || paymentMethod === 'EasyPaisa') && (
                <div className='space-y-1.5 animate-in fade-in duration-200'>
                  <label className='text-xs font-medium text-foreground'>
                    {paymentMethod} {t('paymentReference')}
                  </label>
                  <Input
                    type='text'
                    placeholder='e.g., TID-98127361'
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className='h-9 text-xs font-mono'
                    dir='ltr'
                  />
                </div>
              )}

              {/* Conditional Inputs for Bank Transfer */}
              {paymentMethod === 'Bank Transfer' && (
                <div className='grid grid-cols-2 gap-2 animate-in fade-in duration-200'>
                  <div className='space-y-1'>
                    <label className='text-[11px] font-medium text-foreground'>
                      {t('bankName')}
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className='flex h-9 w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground shadow-subtle'
                    >
                      <option value='Meezan Bank'>Meezan Bank</option>
                      <option value='HBL'>Habib Bank Limited (HBL)</option>
                      <option value='Bank Alfalah'>Bank Alfalah</option>
                      <option value='Allied Bank'>Allied Bank (ABL)</option>
                      <option value='Faysal Bank'>Faysal Bank</option>
                      <option value='UBL'>United Bank Limited (UBL)</option>
                    </select>
                  </div>
                  <div className='space-y-1'>
                    <label className='text-[11px] font-medium text-foreground'>
                      {t('depositSlip')}
                    </label>
                    <Input
                      type='text'
                      placeholder='e.g., 90182741'
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className='h-9 text-xs font-mono'
                      dir='ltr'
                    />
                  </div>
                </div>
              )}

              {/* Discount & Order Notes */}
              <div className='grid grid-cols-2 gap-2 pt-1 border-t border-border/60'>
                <div className='space-y-1'>
                  <label className='text-[11px] font-medium text-muted-foreground'>
                    {t('discount')} (PKR)
                  </label>
                  <Input
                    type='number'
                    min='0'
                    placeholder='0'
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, +e.target.value))}
                    className='h-8 text-xs font-mono'
                    dir='ltr'
                  />
                </div>
                <div className='space-y-1'>
                  <label className='text-[11px] font-medium text-muted-foreground'>
                    {language === 'ur' ? 'آرڈر نوٹس' : 'Order Notes'}
                  </label>
                  <Input
                    type='text'
                    placeholder={language === 'ur' ? 'اختیاری ریمارکس' : 'Optional notes'}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className='h-8 text-xs'
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Bill Preview & Action Center */}
        <div className='lg:col-span-7 space-y-6'>
          <Card className='flex flex-col h-full border-border/90 shadow-elevated'>
            <CardHeader className='border-b border-border pb-3 bg-muted/20'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
                    <Receipt className='w-4 h-4' />
                  </div>
                  <div>
                    <CardTitle className='text-base font-semibold'>
                      {t('invoiceDraft')}
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      {selectedCustomerObj
                        ? `${t('client')}: ${selectedCustomerObj.name}`
                        : (language === 'ur' ? 'کسٹمر منتخب نہیں کیا گیا' : 'No customer selected')}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant='outline' className='text-xs font-medium'>
                  <span className='font-mono mr-1'>{bill.items.length}</span> {t('itemsCount')}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className='flex-1 p-0 overflow-hidden flex flex-col min-h-0'>
              {bill.items.length === 0 ? (
                <div className='p-8 text-center text-muted-foreground'>
                  <FileText className='w-10 h-10 mx-auto text-muted-foreground/40 mb-2' />
                  <p className='text-sm font-medium'>{t('noItemsInBill')}</p>
                </div>
              ) : (
                <div className='overflow-y-auto max-h-[360px] lg:max-h-[calc(100vh-440px)] min-h-[140px] overscroll-contain'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('productAndMedia')}</TableHead>
                        <TableHead className='text-center'>{t('quantity')}</TableHead>
                        <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('unitPrice')}</TableHead>
                        <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('total')}</TableHead>
                        <TableHead className='w-10'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bill.items.map((item, idx) => {
                        const itemName = language === 'ur' && item.urduName ? item.urduName : item.name
                        return (
                          <TableRow key={idx}>
                            <TableCell>
                              <div className='flex items-center gap-2.5'>
                                {item.image && (
                                  <div
                                    onClick={() => setPreviewProduct(item)}
                                    className='relative group w-8 h-8 rounded-md overflow-hidden border border-border/80 shrink-0 cursor-zoom-in bg-muted/40 hover:ring-2 hover:ring-primary/60 transition-all'
                                    title={language === 'ur' ? 'بڑی تصویر دیکھیں' : 'Click to enlarge image'}
                                  >
                                    <img
                                      src={item.image}
                                      alt={itemName}
                                      className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-200'
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white'>
                                      <Eye className='w-3 h-3' />
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <div className='font-medium text-foreground text-xs'>
                                    {itemName}
                                  </div>
                                  <span className='font-mono text-[10px] text-muted-foreground' dir='ltr'>
                                    {item.sku || `DA-${item.id}`}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className='text-center font-mono font-semibold text-xs'>
                              {item.qty}
                            </TableCell>
                            <TableCell className={`${isRTL ? 'text-left' : 'text-right'} font-mono text-xs text-muted-foreground`}>
                              {formatCurrency(item.price, language)}
                            </TableCell>
                            <TableCell className={`${isRTL ? 'text-left' : 'text-right'} font-mono font-semibold text-xs text-foreground`}>
                              {formatCurrency(item.price * item.qty, language)}
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={() => removeItem(idx)}
                                className='text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer'
                                title='Remove'
                              >
                                <Trash2 className='w-3.5 h-3.5' />
                              </button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>

            <CardFooter className='flex-shrink-0 border-t border-border pt-4 flex flex-col gap-4 bg-muted/10 mt-auto'>
              {/* Calculations summary */}
              <div className='w-full space-y-2 text-xs'>
                <div className='flex justify-between text-muted-foreground'>
                  <span>{t('subtotal')}</span>
                  <span className='font-mono font-semibold'>{formatCurrency(subtotal, language)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className='flex justify-between text-destructive'>
                    <span>{t('discount')}</span>
                    <span className='font-mono font-semibold'>- {formatCurrency(discountAmount, language)}</span>
                  </div>
                )}
                <div className='flex justify-between items-center text-muted-foreground pt-1'>
                  <span>{t('paymentMethod')}:</span>
                  <Badge variant='outline' className='text-[11px] gap-1 font-medium'>
                    {paymentMethod === 'Cash' && <Wallet className='w-3 h-3 text-emerald-600' />}
                    {(paymentMethod === 'JazzCash' || paymentMethod === 'EasyPaisa') && <CreditCard className='w-3 h-3 text-amber-600' />}
                    {paymentMethod === 'Bank Transfer' && <Landmark className='w-3 h-3 text-blue-600' />}
                    <span>{paymentMethod}</span>
                  </Badge>
                </div>
                <div className='flex justify-between text-base font-bold text-foreground border-t border-border pt-2'>
                  <span>{t('grandTotal')}</span>
                  <span className='text-primary font-mono'>{formatCurrency(total, language)}</span>
                </div>
              </div>

              {/* Persistent Last Settled Sale Action Banner */}
              {lastSettledSale && (
                <div className='w-full p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 animate-in fade-in'>
                  <div className='flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300'>
                    <Check className='w-4 h-4 text-emerald-600 flex-shrink-0' />
                    <span className='font-semibold'>
                      {language === 'ur'
                        ? `بل ${lastSettledSale.invoice} ادا ہو گیا`
                        : `Invoice ${lastSettledSale.invoice} Settled`}
                    </span>
                  </div>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setWhatsAppModalData(lastSettledSale)}
                    className='h-7 text-xs font-semibold gap-1.5 text-emerald-800 dark:text-emerald-300 bg-white dark:bg-emerald-900/50 border-emerald-300 hover:bg-emerald-100 cursor-pointer shadow-subtle flex-shrink-0'
                  >
                    <MessageSquare className='w-3.5 h-3.5 text-emerald-600' />
                    <span>{language === 'ur' ? 'واٹس ایپ رسید' : 'WhatsApp Receipt'}</span>
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className='grid grid-cols-2 gap-3 w-full'>
                <Button
                  onClick={downloadPDF}
                  variant='outline'
                  disabled={bill.items.length === 0}
                  className='h-10 text-xs font-semibold cursor-pointer'
                >
                  <Download className={`w-3.5 h-3.5 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                  <span>{t('downloadPdfReceipt')}</span>
                </Button>

                <Button
                  onClick={generateBill}
                  disabled={bill.items.length === 0 || !bill.customerId}
                  className='h-10 text-xs font-semibold cursor-pointer'
                >
                  <Check className={`w-3.5 h-3.5 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                  <span>{t('completeAndSettle')}</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* High-Resolution Product Preview Modal */}
      <ImagePreviewModal
        isOpen={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
        product={previewProduct}
      />

      {/* Interactive WhatsApp Preview Modal */}
      {whatsAppModalData && (
        <WhatsAppPreviewModal
          isOpen={!!whatsAppModalData}
          onClose={() => setWhatsAppModalData(null)}
          recipientName={whatsAppModalData.customerName}
          recipientPhone={
            customers.find((c) => c.id === whatsAppModalData.customerId)?.contact || ''
          }
          contextType='order'
          contextData={{
            ...whatsAppModalData,
            status: 'Completed',
          }}
        />
      )}
    </div>
  )
}
