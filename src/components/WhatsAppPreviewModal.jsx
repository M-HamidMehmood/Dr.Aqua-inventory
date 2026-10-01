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
  Sun,
} from './ui/Icons'
import { useLanguage } from '../context/LanguageContext'

export default function WhatsAppPreviewModal({
  isOpen,
  onClose,
  recipientName = '',
  recipientPhone = '',
  defaultTemplate = 'booking',
  contextData = {},
}) {
  const { t, language, isRTL } = useLanguage()

  const [activeTemplate, setActiveTemplate] = useState(defaultTemplate)
  const [msgLang, setMsgLang] = useState(language || 'en')
  const [customText, setCustomText] = useState('')
  const [copied, setCopied] = useState(false)

  // Sync template if default changes
  useEffect(() => {
    setActiveTemplate(defaultTemplate)
  }, [defaultTemplate, isOpen])

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
    const name = recipientName || (lang === 'ur' ? 'کسٹمر' : 'Customer')
    const serviceType = contextData.serviceType || (lang === 'ur' ? 'واٹر فلٹریشن سروس' : 'Water Filtration Service')
    const date = contextData.scheduledDate || new Date().toISOString().split('T')[0]
    const timeSlot = contextData.timeSlot || '09:00 AM - 12:00 PM'
    const techName = contextData.technicianName || 'Farhan Technician'
    const techPhone = contextData.technicianPhone || '03015551234'
    const address = contextData.address ? `${contextData.address}, ${contextData.city || ''}` : ''

    const tdsBefore = contextData.tdsReadingBefore ?? '520'
    const tdsAfter = contextData.tdsReadingAfter ?? '38'
    const partsList =
      contextData.partsUsed && contextData.partsUsed.length > 0
        ? contextData.partsUsed
            .map((p) => `${p.qty}x ${lang === 'ur' && p.urduName ? p.urduName : p.name}`)
            .join('، ')
        : (lang === 'ur' ? 'معمول کی صفائی اور فلش' : 'Routine Inspection & Flush')

    const totalBill = contextData.totalCharges ? `PKR ${Number(contextData.totalCharges).toLocaleString()}` : ''

    if (lang === 'ur') {
      switch (tpl) {
        case 'booking':
          return `السلام علیکم ${name} صاحب! 💧\n\nڈاکٹر ایکوا واٹر ٹیکنالوجی کی جانب سے آپ کی بکنگ کنفرم کر دی گئی ہے:\n• سروس: ${serviceType}\n• تاریخ: ${date}\n• وقت: ${timeSlot}\n• ٹیکنیشن: ${techName} (${techPhone})${address ? `\n• ایڈریس: ${address}` : ''}\n\nہمارا نمائندہ مقررہ وقت پر آپ کی دہلیز پر حاضر ہو گا۔ شکریہ!\nڈاکٹر ایکوا واٹر سسٹمز 🇵🇰`

        case '1-month':
          return `السلام علیکم ${name} صاحب! 💧\n\nامید ہے آپ کا واٹر فلٹریشن سسٹم بہترین کام کر رہا ہے۔ آپ کی تنصیب کو 1 ماہ مکمل ہو چکا ہے۔\nڈاکٹر ایکوا کے فیلڈ ٹیکنیشن معمول کے ٹی ڈی ایس معائنہ اور سسٹم پریشر چیک کے لیے دستیاب ہیں۔ کیا ہم اس ہفتے کے لیے مناسب وقت شیڈول کر لیں؟\n\nشکریہ،\nڈاکٹر ایکوا سروس ٹیم 📞`

        case '2-month':
          return `السلام علیکم ${name} صاحب! ⚠️\n\nڈاکٹر ایکوا کی طرف سے یاد دہانی: آپ کے فلٹریشن سسٹم کے پی پی سیڈیمینٹ اور کاربن کارٹریج کی متوقع میعاد (2 ماہ) مکمل ہو چکی ہے۔ شفاف اور بیکٹیریا سے پاک پینے کے پانی کی مسلسل فراہمی کے لیے نئے اوریجنل فلٹرز کی تبدیلی کا وقت بتائیں۔\n\nڈاکٹر ایکوا واٹر پیوریفیکیشن سسٹم`

        case 'report':
          return `السلام علیکم ${name} صاحب! ✅\n\nآپ کی ${serviceType} سروس کامیابی سے مکمل ہو گئی ہے۔\n\n📊 واٹر کوالٹی (TDS) رپورٹ:\n• سروس سے پہلے TDS: ${tdsBefore} ppm\n• سروس کے بعد TDS: ${tdsAfter} ppm (100% محفوظ و معیاری)\n• تبدیل شدہ اسپیئر پارٹس: ${partsList}${totalBill ? `\n• کل رقم: ${totalBill}` : ''}\n\nڈاکٹر ایکوا پر اعتماد کرنے کا شکریہ! 💧`

        default:
          return `السلام علیکم ${name} صاحب، یہ ڈاکٹر ایکوا واٹر سسٹمز کی جانب سے سروس میسج ہے۔`
      }
    } else {
      switch (tpl) {
        case 'booking':
          return `Assalam-o-Alaikum ${name}! 💧\n\nYour appointment with Dr. Aqua Water Systems is confirmed:\n• Service: ${serviceType}\n• Scheduled Date: ${date}\n• Time Slot: ${timeSlot}\n• Assigned Technician: ${techName} (${techPhone})${address ? `\n• Site Address: ${address}` : ''}\n\nOur technician will arrive promptly at the designated time slot. Thank you!\nDr. Aqua Water Systems 🇵🇰`

        case '1-month':
          return `Assalam-o-Alaikum ${name}! 💧\n\nIt has been 1 month since your water filtration system installation. We hope you are enjoying pure, refreshing water!\nOur field technician is available for your complimentary 1-month routine inspection and TDS water test. Please reply with your preferred day and time for our visit.\n\nBest regards,\nDr. Aqua Service Team 📞`

        case '2-month':
          return `Assalam-o-Alaikum ${name}! ⚠️\n\nThis is a priority maintenance reminder from Dr. Aqua. Your water purification system is due for its periodic filter cartridge replacement (Stage 1 & 2) to maintain optimal filtration efficiency and membrane life. Please let us know when our technician may visit your premises.\n\nDr. Aqua Water Purification Systems`

        case 'report':
          return `Assalam-o-Alaikum ${name}! ✅\n\nYour ${serviceType} has been successfully completed by technician ${techName}.\n\n📊 Water Purity & TDS Test Report:\n• Raw TDS Before Service: ${tdsBefore} ppm\n• Purified TDS After Service: ${tdsAfter} ppm (100% safe WHO standard)\n• Replaced Hardware: ${partsList}${totalBill ? `\n• Total Charges: ${totalBill}` : ''}\n\nThank you for choosing Dr. Aqua Water Systems! 💧`

        default:
          return `Assalam-o-Alaikum ${name}, this is Dr. Aqua Water Systems regarding your service.`
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-xl p-0 overflow-hidden bg-background border border-border shadow-2xl rounded-2xl'>
        {/* Top Header */}
        <div className='p-4 border-b border-border bg-card flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center'>
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
            className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        <div className='p-5 space-y-4 max-h-[80vh] overflow-y-auto'>
          {/* Recipient Details & Language Toggle */}
          <div className='flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border border-border'>
            <div className='flex items-center gap-2 text-xs'>
              <span className='text-muted-foreground'>{language === 'ur' ? 'وصول کنندہ:' : 'To:'}</span>
              <strong className='text-foreground'>{recipientName}</strong>
              <span className='text-muted-foreground'>•</span>
              <div className='flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-semibold' dir='ltr'>
                <Phone className='w-3 h-3' />
                <span>{recipientPhone}</span>
              </div>
            </div>

            {/* Language Switcher for message */}
            <div className='flex items-center gap-1 bg-background p-1 rounded-lg border border-border'>
              <button
                type='button'
                onClick={() => setMsgLang('ur')}
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
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
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
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
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
              {[
                { id: 'booking', label: t('templateBooking'), icon: Calendar },
                { id: '1-month', label: t('template1Month'), icon: Droplets },
                { id: '2-month', label: t('template2Month'), icon: Wrench },
                { id: 'report', label: t('templateReport'), icon: ShieldCheck },
              ].map((tpl) => {
                const Icon = tpl.icon
                const isSelected = activeTemplate === tpl.id
                return (
                  <button
                    key={tpl.id}
                    type='button'
                    onClick={() => setActiveTemplate(tpl.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-card text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground'
                    }`}
                  >
                    <Icon className='w-4 h-4 mb-1' />
                    <span className='truncate text-[11px]'>{tpl.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Authentic WhatsApp Chat Mockup */}
          <div className='rounded-2xl overflow-hidden border border-border shadow-inner bg-[#efeae2] dark:bg-[#0b141a]'>
            {/* WhatsApp App Bar */}
            <div className='bg-[#075e54] dark:bg-[#202c33] text-white px-3.5 py-2.5 flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs'>
                  {recipientName ? recipientName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <div className='text-xs font-bold leading-tight'>{recipientName}</div>
                  <div className='text-[10px] text-emerald-200 dark:text-emerald-400'>
                    {language === 'ur' ? 'آن لائن • ڈاکٹر ایکوا سروس چیٹ' : 'Online • Dr. Aqua Service Chat'}
                  </div>
                </div>
              </div>
              <Badge variant='outline' className='text-[9px] bg-black/20 text-white border-white/20 px-1.5 py-0'>
                WhatsApp Web
              </Badge>
            </div>

            {/* Chat Conversation Area */}
            <div className='p-4 min-h-[160px] flex flex-col justify-end bg-repeat' style={{
              backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }}>
              {/* Message Bubble (Outgoing) */}
              <div
                className={`max-w-[90%] self-end bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-2xl rounded-tr-none px-3.5 py-2.5 shadow-sm text-xs space-y-1 relative border border-emerald-300/40 dark:border-emerald-700/40`}
                dir={msgLang === 'ur' ? 'rtl' : 'ltr'}
              >
                <div className='whitespace-pre-wrap leading-relaxed select-text font-sans'>
                  {customText}
                </div>
                <div className='flex items-center justify-end gap-1 text-[10px] text-muted-foreground/80 dark:text-emerald-200/70 pt-0.5' dir='ltr'>
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
                className='text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors'
              >
                {copied ? <Check className='w-3.5 h-3.5 text-emerald-600' /> : <Copy className='w-3.5 h-3.5' />}
                <span>{copied ? t('messageCopied') : t('copyMessage')}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className='w-full p-3 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-subtle'
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
