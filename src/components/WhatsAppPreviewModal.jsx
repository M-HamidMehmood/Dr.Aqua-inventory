import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import {
  MessageSquare,
  Copy,
  Check,
  X,
  Phone,
  CheckCheck,
  Calendar,
  Wrench,
  Droplets,
  ShieldCheck,
  Truck,
  ShoppingBag,
  CheckCircle2,
} from './ui/Icons'
import { useLanguage } from '../context/LanguageContext'

export default function WhatsAppPreviewModal({
  isOpen,
  onClose,
  recipientName = '',
  recipientPhone = '',
  contextType = 'service', // 'service' | 'order' | 'customer'
  defaultTemplate,
  contextData = {},
}) {
  const { t, language, isRTL } = useLanguage()

  // Determine initial template based on contextType if defaultTemplate is not provided
  const getInitialTemplate = () => {
    if (defaultTemplate) return defaultTemplate
    if (contextType === 'order') {
      if (contextData.status === 'Dispatched') return 'order-dispatched'
      if (contextData.status === 'Completed') return 'order-completed'
      return 'order-confirmation'
    }
    if (contextType === 'customer') {
      return contextData.reminderType || '1-month'
    }
    return 'booking'
  }

  const [activeTemplate, setActiveTemplate] = useState(getInitialTemplate())
  const [msgLang, setMsgLang] = useState(language || 'ur')
  const [customText, setCustomText] = useState('')
  const [copied, setCopied] = useState(false)

  // Sync template if default or context changes
  useEffect(() => {
    setActiveTemplate(getInitialTemplate())
  }, [defaultTemplate, contextType, contextData.status, isOpen])

  // Sync message language with app language initially
  useEffect(() => {
    setMsgLang(language)
  }, [language, isOpen])

  // Format Pakistani phone number to standard international wa.me format: 923xxxxxxxxx
  const formatWhatsAppNumber = (phone) => {
    const raw = (phone || '').replace(/[^0-9]/g, '')
    if (raw.startsWith('0')) {
      return '92' + raw.slice(1)
    }
    if (raw.startsWith('92')) {
      return raw
    }
    return '92' + raw
  }

  // Generate templates based on active template, language, and context
  const getTemplateText = (tpl, lang) => {
    const name = recipientName || (lang === 'ur' ? 'معزز کسٹمر' : 'Customer')
    
    // Service context parameters
    const serviceType = contextData.serviceType || (lang === 'ur' ? 'واٹر فلٹریشن سروس' : 'Water Filtration Service')
    const date = contextData.scheduledDate || new Date().toISOString().split('T')[0]
    const timeSlot = contextData.timeSlot || '09:00 AM - 12:00 PM'
    const techName = contextData.technicianName || 'Farhan Technician'
    const techPhone = contextData.technicianPhone || '03015551234'
    const address = contextData.address
      ? `${contextData.address}, ${contextData.city || ''}`
      : contextData.deliveryAddress
      ? `${contextData.deliveryAddress}, ${contextData.city || ''}`
      : ''

    const tdsBefore = contextData.tdsReadingBefore ?? '520'
    const tdsAfter = contextData.tdsReadingAfter ?? '38'
    const partsList =
      contextData.partsUsed && contextData.partsUsed.length > 0
        ? contextData.partsUsed
            .map((p) => `${p.qty}x ${lang === 'ur' && p.urduName ? p.urduName : p.name}`)
            .join('، ')
        : (lang === 'ur' ? 'معمول کی صفائی اور فلش' : 'Routine Inspection & Flush')

    const totalBill = contextData.totalCharges ? `PKR ${Number(contextData.totalCharges).toLocaleString()}` : ''

    // Order context parameters
    const orderId = contextData.orderId || contextData.id || 'ORD-2026-101'
    const orderTotal = contextData.total ? `PKR ${Number(contextData.total).toLocaleString()}` : 'PKR 0'
    const courier = contextData.courierName || (lang === 'ur' ? 'شاپ رائڈر' : 'Shop Delivery Rider')
    const tracking = contextData.trackingNumber || ''
    const paymentMethod = contextData.paymentMethod || 'Cash'
    const paymentStatus = contextData.paymentStatus || (lang === 'ur' ? 'ادا شدہ' : 'Paid')

    const orderItems =
      contextData.items && contextData.items.length > 0
        ? contextData.items
            .map((it) => `${it.qty}x ${lang === 'ur' && it.urduName ? it.urduName : it.name}`)
            .join('، ')
        : (lang === 'ur' ? 'فلٹریشن ہارڈویئر' : 'Filtration Hardware')

    if (lang === 'ur') {
      switch (tpl) {
        // --- Web Order Templates ---
        case 'order-confirmation':
          return `السلام علیکم *${name}* صاحب! 🛍️\n\nڈاکٹر ایکوا آن لائن اسٹور (*dr-aqua-project.vercel.app*) پر آپ کا آرڈر کامیابی سے موصول ہو گیا ہے:\n• آرڈر نمبر: *${orderId}*\n• اشیاء: *${orderItems}*\n• کل رقم: *${orderTotal}*\n• طریقہ ادائیگی: *${paymentMethod}*\n${address ? `• ڈیلیوری ایڈریس: *${address}*\n` : ''}\nآپ کا آرڈر فی الوقت پیکنگ اور ویری فکیشن کے مراحل میں ہے۔ جلد از جلد روانہ کر دیا جائے گا۔\nشکریہ!\n*ڈاکٹر ایکوا واٹر سسٹمز* 🇵🇰`

        case 'order-dispatched':
          return `السلام علیکم *${name}* صاحب! 🚚\n\nخوشخبری! آپ کا ڈاکٹر ایکوا آرڈر (*${orderId}*) روانہ کر دیا گیا ہے:\n• کورئیر / رائڈر: *${courier}*\n${tracking ? `• ٹریکنگ نمبر: *${tracking}*\n` : ''}• کل واجب الادا رقم: *${orderTotal}* (${paymentStatus})\n${address ? `• ایڈریس: *${address}*\n` : ''}\nپارسل جلد آپ کی دہلیز پر پہنچ جائے گا۔ کسی بھی رہنمائی کے لیے اس واٹس ایپ پر رابطہ فرمائیں۔\nشکریہ!\n*ڈاکٹر ایکوا ڈسپیچ و لاجسٹکس* 📦`

        case 'order-completed':
          return `السلام علیکم *${name}* صاحب! ✅\n\nڈاکٹر ایکوا سے موصولہ آرڈر (*${orderId}*) کی ترسیل مکمل ہو چکی ہے۔\nہم امید کرتے ہیں کہ پروڈکٹ کی کوالٹی آپ کے معیار پر پوری اتری ہوگی۔\n\nوارنٹی رہنمائی، فلٹر کی باقاعدہ تبدیلی، یا نئے آرڈر کے لیے ہم 24/7 دستیاب ہیں۔\nڈاکٹر ایکوا پر اعتماد کا تہہ دل سے شکریہ! 💧\n*ڈاکٹر ایکوا واٹر سسٹمز* 🇵🇰`

        // --- Service & Booking Templates ---
        case 'booking':
          return `السلام علیکم *${name}* صاحب! 💧\n\nڈاکٹر ایکوا واٹر ٹیکنالوجی کی جانب سے آپ کی فیلڈ اپائنٹمنٹ کنفرم ہو چکی ہے:\n• سروس کی قسم: *${serviceType}*\n• تاریخ: *${date}*\n• وقت: *${timeSlot}*\n• سروس ٹیکنیشن: *${techName}* (${techPhone})\n${address ? `• پتہ: *${address}*\n` : ''}\nہمارا ٹیکنیشن مقررہ وقت پر آپ کی دہلیز پر پہنچ جائے گا۔ شکریہ!\n*ڈاکٹر ایکوا سروس ڈیپارٹمنٹ* 🇵🇰`

        case '1-month':
          return `السلام علیکم *${name}* صاحب! 💧\n\nامید ہے آپ کا واٹر پیوریفائر بہترین کام کر رہا ہے۔ آپ کی تنصیب کو 1 ماہ مکمل ہو چکا ہے۔\nڈاکٹر ایکوا کی طرف سے معمول کے معائنے، پانی کے ٹی ڈی ایس (TDS) ٹیسٹ اور پریشر چیک کی مفت سہولت دستیاب ہے۔\nکیا ہم اس ہفتے وزٹ شیڈول کر لیں؟\n\nشکریہ،\n*ڈاکٹر ایکوا کسٹمر کیئر* 📞`

        case '2-month':
          return `السلام علیکم *${name}* صاحب! ⚠️\n\nڈاکٹر ایکوا کی طرف سے اہم سروس الرٹ:\nآپ کے واٹر فلٹریشن سسٹم کے پی پی سیڈیمینٹ اور کاربن کارٹریج کی متوقع میعاد (2 ماہ / 60 دن) مکمل ہو چکی ہے۔\nبیکٹیریا سے پاک شفاف پینے کے پانی کی فراہمی اور میمبرین کے تحفظ کے لیے فلٹر تبدیلی کا وقت مقرر فرمائیں۔\n\nشکریہ،\n*ڈاکٹر ایکوا مینٹیننس ٹیم* 💧`

        case 'report':
          return `السلام علیکم *${name}* صاحب! ✅\n\nآپ کی *${serviceType}* سروس بحسن و خوبی مکمل ہو گئی ہے۔\n\n📊 *واٹر کوالٹی اور ٹی ڈی ایس رپورٹ:*\n• سروس سے پہلے خام TDS: *${tdsBefore} ppm*\n• سروس کے بعد خالص TDS: *${tdsAfter} ppm* (100% شفاف و محفوظ)\n• تبدیل شدہ اسپیئر پارٹس: *${partsList}*\n${totalBill ? `• کل سروس بل: *${totalBill}*\n` : ''}\nڈاکٹر ایکوا پر اعتماد کرنے کا شکریہ! 💧\n*ڈاکٹر ایکوا واٹر ٹیکنالوجی* 🇵🇰`

        case 'routine':
          return `السلام علیکم *${name}* صاحب! 💧\n\nڈاکٹر ایکوا کی طرف سے معمول کی دیکھ بھال کا پیغام: آپ کے واٹر فلٹریشن یونٹ کا معمول کا سالانہ/ششماہی معائنہ اور صفائی مقرر ہے۔\nبہترین معیار کے پانی کے لیے ہمارے ٹیکنیشن کے وزٹ کا وقت طے کریں۔\n\nشکریہ،\n*ڈاکٹر ایکوا سروسز* 📞`

        default:
          return `السلام علیکم *${name}* صاحب! یہ ڈاکٹر ایکوا واٹر سسٹمز کی جانب سے کسٹمر سپورٹ میسج ہے۔ ہم سے رابطہ کرنے کا شکریہ۔`
      }
    } else {
      // English Templates
      switch (tpl) {
        // --- Web Order Templates ---
        case 'order-confirmation':
          return `Assalam-o-Alaikum *${name}*! 🛍️\n\nThank you for ordering with Dr. Aqua Online Store (*dr-aqua-project.vercel.app*):\n• Order ID: *${orderId}*\n• Items: *${orderItems}*\n• Total Amount: *${orderTotal}*\n• Payment Method: *${paymentMethod}*\n${address ? `• Shipping Address: *${address}*\n` : ''}\nYour order is currently being prepared and verified. We will notify you once dispatched.\nThank you!\n*Dr. Aqua Water Systems* 🇵🇰`

        case 'order-dispatched':
          return `Assalam-o-Alaikum *${name}*! 🚚\n\nGreat news! Your Dr. Aqua order (*${orderId}*) has been dispatched:\n• Carrier / Rider: *${courier}*\n${tracking ? `• Tracking Number: *${tracking}*\n` : ''}• Amount Due: *${orderTotal}* (${paymentStatus})\n${address ? `• Delivery Address: *${address}*\n` : ''}\nYour shipment will arrive shortly. Please inspect the parcel upon delivery.\nThank you!\n*Dr. Aqua Logistics* 📦`

        case 'order-completed':
          return `Assalam-o-Alaikum *${name}*! ✅\n\nYour Dr. Aqua order (*${orderId}*) has been successfully delivered and completed.\nWe hope our water purification equipment exceeds your expectations.\n\nFor warranty, replacement filter cartridges, or maintenance support, feel free to message us anytime.\nThank you for choosing Dr. Aqua! 💧\n*Dr. Aqua Water Systems* 🇵🇰`

        // --- Service & Booking Templates ---
        case 'booking':
          return `Assalam-o-Alaikum *${name}*! 💧\n\nYour appointment with Dr. Aqua Water Systems is confirmed:\n• Service: *${serviceType}*\n• Scheduled Date: *${date}*\n• Time Slot: *${timeSlot}*\n• Assigned Technician: *${techName}* (${techPhone})\n${address ? `• Site Address: *${address}*\n` : ''}\nOur technician will arrive promptly at the designated time slot. Thank you!\n*Dr. Aqua Water Systems* 🇵🇰`

        case '1-month':
          return `Assalam-o-Alaikum *${name}*! 💧\n\nIt has been 1 month since your water filtration system installation. We hope you are enjoying pure, refreshing water!\nOur field technician is available for your complimentary 1-month routine inspection and TDS water test. Please reply with your preferred day and time for our visit.\n\nBest regards,\n*Dr. Aqua Service Team* 📞`

        case '2-month':
          return `Assalam-o-Alaikum *${name}*! ⚠️\n\nThis is a priority maintenance reminder from Dr. Aqua. Your water purification system is due for its periodic filter cartridge replacement (PP Sediment & Carbon 2-month lifespan) to maintain optimal filtration efficiency and membrane life. Please let us know when our technician may visit your premises.\n\n*Dr. Aqua Water Purification Systems* 💧`

        case 'report':
          return `Assalam-o-Alaikum *${name}*! ✅\n\nYour *${serviceType}* has been successfully completed by technician *${techName}*.\n\n📊 *Water Purity & TDS Test Report:*\n• Raw TDS Before Service: *${tdsBefore} ppm*\n• Purified TDS After Service: *${tdsAfter} ppm* (100% safe WHO standard)\n• Replaced Hardware: *${partsList}*\n${totalBill ? `• Total Service Charges: *${totalBill}*\n` : ''}\nThank you for choosing Dr. Aqua Water Systems! 💧\n*Dr. Aqua Water Systems* 🇵🇰`

        case 'routine':
          return `Assalam-o-Alaikum *${name}*! 💧\n\nThis is a routine service reminder from Dr. Aqua. Your water filtration plant is due for periodic maintenance and sanitation. Please reply to schedule your visit.\n\nThank you,\n*Dr. Aqua Services* 📞`

        default:
          return `Assalam-o-Alaikum *${name}*, this is Dr. Aqua Water Systems regarding your inquiry.`
      }
    }
  }

  // Update text when template or language changes
  useEffect(() => {
    setCustomText(getTemplateText(activeTemplate, msgLang))
    setCopied(false)
  }, [activeTemplate, msgLang, recipientName, contextData])

  const handleCopy = () => {
    navigator.clipboard.writeText(customText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleLaunchWhatsApp = () => {
    const waNumber = formatWhatsAppNumber(recipientPhone)
    const encoded = encodeURIComponent(customText)
    const url = `https://wa.me/${waNumber}?text=${encoded}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Define template pills based on contextType
  const getAvailableTemplates = () => {
    if (contextType === 'order') {
      return [
        { id: 'order-confirmation', label: t('templateOrderConfirmation'), icon: ShoppingBag },
        { id: 'order-dispatched', label: t('templateOrderDispatched'), icon: Truck },
        { id: 'order-completed', label: t('templateOrderCompleted'), icon: CheckCircle2 },
      ]
    }
    if (contextType === 'customer') {
      return [
        { id: '1-month', label: t('template1Month'), icon: Droplets },
        { id: '2-month', label: t('template2Month'), icon: Wrench },
        { id: 'routine', label: t('templateRoutineCheck'), icon: Calendar },
      ]
    }
    // Default service templates
    return [
      { id: 'booking', label: t('templateBooking'), icon: Calendar },
      { id: '1-month', label: t('template1Month'), icon: Droplets },
      { id: '2-month', label: t('template2Month'), icon: Wrench },
      { id: 'report', label: t('templateReport'), icon: ShieldCheck },
    ]
  }

  const availableTemplates = getAvailableTemplates()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} size='lg'>
      <DialogContent className='max-w-2xl p-0 overflow-hidden bg-background border border-border shadow-2xl rounded-2xl'>
        {/* Top Header */}
        <div className='p-4 border-b border-border bg-card flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0'>
              <MessageSquare className='w-5 h-5' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground'>
                {t('whatsAppPreviewTitle')}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                {t('whatsAppPreviewDesc')}
              </DialogDescription>
            </div>
          </div>

          <button
            onClick={onClose}
            className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors'
            aria-label='Close'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        <div className='p-5 space-y-4 max-h-[78vh] overflow-y-auto'>
          {/* Recipient Details & Language Toggle */}
          <div className='flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/40 border border-border'>
            <div className='flex items-center gap-2 text-xs'>
              <span className='text-muted-foreground'>{language === 'ur' ? 'وصول کنندہ:' : 'Recipient:'}</span>
              <strong className='text-foreground font-semibold'>{recipientName || 'Customer'}</strong>
              <span className='text-muted-foreground'>•</span>
              <div className='flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-semibold' dir='ltr'>
                <Phone className='w-3 h-3' />
                <span>{recipientPhone || 'No phone'}</span>
              </div>
            </div>

            {/* Language Switcher for message */}
            <div className='flex items-center gap-1 bg-background p-1 rounded-lg border border-border'>
              <button
                type='button'
                onClick={() => setMsgLang('ur')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  msgLang === 'ur'
                    ? 'bg-emerald-600 text-white shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                اردو
              </button>
              <button
                type='button'
                onClick={() => setMsgLang('en')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  msgLang === 'en'
                    ? 'bg-emerald-600 text-white shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Template Selection Pills */}
          <div>
            <label className='block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2'>
              {language === 'ur' ? 'پیغام کا ٹیمپلیٹ منتخب کریں:' : 'Select Message Template:'}
            </label>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
              {availableTemplates.map((tpl) => {
                const Icon = tpl.icon
                const isSelected = activeTemplate === tpl.id
                return (
                  <button
                    key={tpl.id}
                    type='button'
                    onClick={() => setActiveTemplate(tpl.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-card text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground'
                    }`}
                  >
                    <Icon className='w-4 h-4 shrink-0' />
                    <span className='truncate text-[11px]'>{tpl.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Authentic WhatsApp Chat Mockup */}
          <div className='rounded-2xl overflow-hidden border border-border shadow-inner bg-[#efeae2] dark:bg-[#0b141a]'>
            {/* WhatsApp App Bar */}
            <div className='bg-[#075e54] dark:bg-[#202c33] text-white px-4 py-2.5 flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs'>
                  {recipientName ? recipientName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <div className='text-xs font-bold leading-tight'>{recipientName || 'Customer'}</div>
                  <div className='text-[10px] text-emerald-200 dark:text-emerald-400'>
                    {language === 'ur' ? 'آن لائن • ڈاکٹر ایکوا بزنس چیٹ' : 'Online • Dr. Aqua Business Chat'}
                  </div>
                </div>
              </div>
              <Badge variant='outline' className='text-[10px] bg-black/20 text-white border-white/20 px-2 py-0.5'>
                WhatsApp Web
              </Badge>
            </div>

            {/* Chat Conversation Area */}
            <div
              className='p-4 min-h-[170px] flex flex-col justify-end bg-repeat'
              style={{
                backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            >
              {/* Message Bubble (Outgoing) */}
              <div
                className='max-w-[92%] self-end bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-2xl rounded-tr-none px-4 py-3 shadow-sm text-xs space-y-1 relative border border-emerald-300/40 dark:border-emerald-700/40'
                dir={msgLang === 'ur' ? 'rtl' : 'ltr'}
              >
                <div className='whitespace-pre-wrap leading-relaxed select-text font-sans'>
                  {customText}
                </div>
                <div className='flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground/80 dark:text-emerald-200/70 pt-1' dir='ltr'>
                  <span>{nowFormatted}</span>
                  <CheckCheck className='w-3.5 h-3.5 text-[#53bdeb]' />
                </div>
              </div>
            </div>
          </div>

          {/* Editable Text Field */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <label className='text-xs font-semibold text-foreground'>
                {language === 'ur' ? 'پیغام میں ترمیم کریں (اختیاری):' : 'Customize Message Before Sending:'}
              </label>
              <button
                type='button'
                onClick={handleCopy}
                className='text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 rounded hover:bg-muted'
              >
                {copied ? <Check className='w-3.5 h-3.5 text-emerald-600' /> : <Copy className='w-3.5 h-3.5' />}
                <span>{copied ? t('messageCopied') : t('copyMessage')}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className='w-full p-3.5 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-subtle leading-relaxed'
              dir={msgLang === 'ur' ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className='p-4 border-t border-border bg-card/60 flex items-center justify-between gap-3'>
          <Button variant='outline' size='sm' onClick={onClose} className='cursor-pointer text-xs'>
            {t('cancel')}
          </Button>

          <Button
            variant='success'
            size='sm'
            onClick={handleLaunchWhatsApp}
            className='bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-xs font-bold shadow-md gap-2 px-5'
          >
            <MessageSquare className='w-4 h-4' />
            <span>{t('sendViaWhatsApp')} (wa.me)</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
