import React, { useEffect, useState } from 'react'
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
} from './ui/Icons'
import { useLanguage } from '../context/LanguageContext'

export default function TechnicianView({ customers }) {
  const { t, language, isRTL } = useLanguage()

  const [filterType, setFilterType] = useState('all') // 'all', '1-month', '2-month', 'completed'
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceLogs, setServiceLogs] = useState([])
  const [selectedCustomerForLog, setSelectedCustomerForLog] = useState(null)
  const [logNotes, setLogNotes] = useState('')

  // Load completed service logs from localStorage
  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem('draqua-service-logs')
      if (savedLogs) setServiceLogs(JSON.parse(savedLogs))
    } catch (e) {
      console.error('Failed to load service logs', e)
    }
  }, [])

  const saveLogs = (newLogs) => {
    setServiceLogs(newLogs)
    localStorage.setItem('draqua-service-logs', JSON.stringify(newLogs))
  }

  // Calculate due visits from customers
  const now = new Date()
  const activeVisits = []

  customers.forEach((c) => {
    if (c.history && c.history.length > 0) {
      const lastSale = c.history[c.history.length - 1]
      if (!lastSale) return

      const lastPurchase = new Date(lastSale.date)
      const diffMs = now.getTime() - lastPurchase.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffMonths = diffDays / 30

      // Check if already completed recently (within last 15 days)
      const recentLog = serviceLogs.find(
        (log) =>
          log.customerId === c.id &&
          (now.getTime() - new Date(log.completedAt).getTime()) /
            (1000 * 60 * 60 * 24) <
            15,
      )

      if (diffMonths >= 1) {
        const isTwoMonth = diffMonths >= 2
        activeVisits.push({
          customerId: c.id,
          customerName: c.name,
          contact: c.contact,
          type: isTwoMonth ? '2-month' : '1-month',
          title: isTwoMonth
            ? (language === 'ur' ? '2 ماہ کا فلٹر تبدیل' : '2-Month Filter Replacement')
            : (language === 'ur' ? '1 ماہ کی روٹین سروس' : '1-Month Maintenance Check'),
          diffDays,
          lastPurchaseDate: lastPurchase.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US'),
          installedItems: lastSale.items || [],
          isCompleted: !!recentLog,
          completedAt: recentLog ? recentLog.completedAt : null,
          completedNotes: recentLog ? recentLog.notes : '',
        })
      }
    }
  })

  // Format WhatsApp Link
  const getWhatsAppLink = (visit) => {
    const rawContact = (visit.contact || '').replace(/[^0-9]/g, '')
    let formattedNumber = rawContact
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '92' + formattedNumber.slice(1)
    }

    const message =
      language === 'ur'
        ? visit.type === '2-month'
          ? `السلام علیکم ${visit.customerName} صاحب، یہ ڈاکٹر ایکوا واٹر ٹیکنالوجی کی جانب سے سروس میسج ہے۔ آپ کے واٹر فلٹریشن یونٹ کے فلٹر کی تبدیلی کا وقت ہو گیا ہے۔ ٹیکنیشن کے وزٹ کے لیے اپنا مناسب وقت بتائیں۔`
          : `السلام علیکم ${visit.customerName} صاحب، یہ ڈاکٹر ایکوا واٹر ٹیکنالوجی کی جانب سے سروس میسج ہے۔ آپ کے فلٹریشن سسٹم کی روٹین سروس اور ٹی ڈی ایس ٹیسٹ کا وقت ہو گیا ہے۔ براہ کرم وزٹ کا وقت بتائیں۔`
        : visit.type === '2-month'
          ? `Assalam-o-Alaikum ${visit.customerName}, this is Dr. Aqua Services. Your water filtration unit is due for its periodic filter replacement. Please let us know your preferred time for our technician visit.`
          : `Assalam-o-Alaikum ${visit.customerName}, this is Dr. Aqua Services. It has been 1 month since your water filter maintenance check. We would like to schedule a quick TDS test and routine inspection.`

    return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`
  }

  const handleMarkCompleted = (visit) => {
    const newLog = {
      id: `SRV-${Date.now()}`,
      customerId: visit.customerId,
      customerName: visit.customerName,
      type: visit.type,
      completedAt: new Date().toISOString(),
      notes: logNotes || (language === 'ur' ? 'معمول کی سروس اور معائنہ مکمل ہوا۔' : 'Routine service inspection completed.'),
    }
    const updated = [newLog, ...serviceLogs]
    saveLogs(updated)
    setSelectedCustomerForLog(null)
    setLogNotes('')
  }

  // Filter visits
  const filteredVisits = activeVisits.filter((v) => {
    const matchesSearch =
      v.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contact.includes(searchQuery)

    if (!matchesSearch) return false

    if (filterType === '1-month') return v.type === '1-month' && !v.isCompleted
    if (filterType === '2-month') return v.type === '2-month' && !v.isCompleted
    if (filterType === 'completed') return v.isCompleted
    if (filterType === 'all') return true
    return true
  })

  const pendingCount = activeVisits.filter((v) => !v.isCompleted).length
  const completedCount = activeVisits.filter((v) => v.isCompleted).length

  return (
    <div className='space-y-6'>
      {/* Top Banner with Stats */}
      <Card className='border-border bg-gradient-to-br from-primary/5 via-card to-card'>
        <CardHeader className='pb-3'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <Badge variant='warning' className='text-[10px] uppercase font-bold tracking-wider'>
                  <Wrench className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {language === 'ur' ? 'ٹیکنیشن آپریشنز' : 'Technician Operations'}
                </Badge>
              </div>
              <CardTitle className='text-xl font-bold'>
                {t('fieldOpsTitle')}
              </CardTitle>
              <CardDescription className='text-xs'>
                {t('fieldOpsDesc')}
              </CardDescription>
            </div>

            <div className='flex gap-3'>
              <div className='bg-card px-4 py-2.5 rounded-xl border border-border shadow-subtle text-center min-w-[90px]'>
                <div className='text-xl font-bold text-foreground font-mono'>{pendingCount}</div>
                <div className='text-[10px] text-amber-600 font-semibold uppercase'>{t('pendingDispatches')}</div>
              </div>
              <div className='bg-card px-4 py-2.5 rounded-xl border border-border shadow-subtle text-center min-w-[90px]'>
                <div className='text-xl font-bold text-emerald-600 font-mono'>{completedCount}</div>
                <div className='text-[10px] text-muted-foreground font-semibold uppercase'>{t('completedToday')}</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className='p-4 flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap gap-1.5'>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                filterType === 'all'
                  ? 'bg-primary text-primary-foreground border-primary shadow-subtle'
                  : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {t('filterAll')} (<span className='font-mono'>{activeVisits.length}</span>)
            </button>
            <button
              onClick={() => setFilterType('1-month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                filterType === '1-month'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-subtle'
                  : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {t('filter1Month')}
            </button>
            <button
              onClick={() => setFilterType('2-month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                filterType === '2-month'
                  ? 'bg-destructive text-white border-destructive shadow-subtle'
                  : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {t('filter2Month')}
            </button>
            <button
              onClick={() => setFilterType('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                filterType === 'completed'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-subtle'
                  : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {t('filterCompleted')} (<span className='font-mono'>{completedCount}</span>)
            </button>
          </div>

          <div className='w-full sm:w-64 relative'>
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 w-4 h-4 text-muted-foreground`} />
            <Input
              type='text'
              placeholder={language === 'ur' ? 'کسٹمر کا نام یا فون...' : 'Search customer or phone...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? 'pr-9 pl-8' : 'pl-9 pr-8'} h-9 text-xs`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute ${isRTL ? 'left-2.5' : 'right-2.5'} top-2.5 text-muted-foreground hover:text-foreground text-xs cursor-pointer`}
              >
                <X className='w-3.5 h-3.5' />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visits Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredVisits.map((visit) => {
          const isFilterChange = visit.type === '2-month'
          return (
            <Card
              key={`${visit.customerId}-${visit.type}`}
              className={`flex flex-col justify-between transition-all ${
                visit.isCompleted
                  ? 'border-emerald-200/80 bg-emerald-50/10'
                  : isFilterChange
                  ? isRTL ? 'border-r-4 border-r-destructive border-border' : 'border-l-4 border-l-destructive border-border'
                  : isRTL ? 'border-r-4 border-r-amber-500 border-border' : 'border-l-4 border-l-amber-500 border-border'
              }`}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <CardTitle className='text-base font-semibold text-foreground'>
                      {visit.customerName}
                    </CardTitle>
                    <div className='text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5'>
                      <Phone className='w-3 h-3 text-muted-foreground' />
                      <span className='font-mono' dir='ltr'>{visit.contact}</span>
                    </div>
                  </div>

                  {visit.isCompleted ? (
                    <Badge variant='success' className='text-[10px]'>
                      <Check className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t('serviceCompletedBadge')}
                    </Badge>
                  ) : (
                    <Badge
                      variant={isFilterChange ? 'destructive' : 'warning'}
                      className='text-[10px]'
                    >
                      {visit.title}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className='space-y-3 pb-4'>
                <div className='p-3 bg-muted/40 rounded-lg text-xs space-y-1.5 border border-border'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>{t('lastServiceDate')}</span>
                    <span className='font-medium text-foreground'>{visit.lastPurchaseDate}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>{t('daysElapsed')}</span>
                    <span className='font-bold text-foreground'>
                      <span className='font-mono'>{visit.diffDays}</span> {language === 'ur' ? 'دن قبل' : 'days ago'}
                    </span>
                  </div>
                  {visit.installedItems.length > 0 && (
                    <div className='pt-1.5 border-t border-border mt-1'>
                      <span className='text-muted-foreground block text-[11px] mb-0.5'>{t('installedHardware')}</span>
                      <span className='font-medium text-foreground text-xs'>
                        {visit.installedItems.map((i) => (language === 'ur' && i.urduName ? i.urduName : i.name)).join('، ')}
                      </span>
                    </div>
                  )}
                  {visit.isCompleted && visit.completedNotes && (
                    <div className='pt-1.5 border-t border-emerald-200 text-emerald-700 text-xs font-medium'>
                      {language === 'ur' ? 'رپورٹ نوٹس:' : 'Notes:'} {visit.completedNotes}
                    </div>
                  )}
                </div>
              </CardContent>

              {/* Action Buttons */}
              <CardFooter className='flex-col items-stretch gap-2 pt-3 border-t border-border bg-muted/10'>
                <div className='grid grid-cols-2 gap-2'>
                  <a
                    href={getWhatsAppLink(visit)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer'
                  >
                    <MessageSquare className='w-3.5 h-3.5' />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${visit.contact}`}
                    className='inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer'
                  >
                    <Phone className='w-3.5 h-3.5' />
                    <span>{t('callClient')}</span>
                  </a>
                </div>

                {!visit.isCompleted && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setSelectedCustomerForLog(visit)}
                    className='w-full h-8 text-xs cursor-pointer'
                  >
                    <Check className={`w-3.5 h-3.5 ${isRTL ? 'ml-1' : 'mr-1'} text-emerald-600`} />
                    <span>{t('markAsCompleted')}</span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}

        {filteredVisits.length === 0 && (
          <div className='col-span-full py-16 text-center bg-card rounded-xl border border-border p-8'>
            <Wrench className='w-10 h-10 mx-auto text-muted-foreground/40 mb-2' />
            <h3 className='text-base font-semibold text-foreground'>{language === 'ur' ? 'کوئی سروس وزٹ موجود نہیں' : 'No Service Visits Found'}</h3>
            <p className='text-xs text-muted-foreground mt-1 max-w-sm mx-auto'>
              {searchQuery
                ? (language === 'ur' ? 'تلاش کے مطابق کوئی کسٹمر نہیں ملا۔' : 'No customer matched your search criteria.')
                : (language === 'ur' ? 'تمام صارفین کی سروس مکمل اور اپ ڈیٹ ہے۔' : 'All customers are up-to-date with maintenance intervals.')}
            </p>
          </div>
        )}
      </div>

      {/* Modal for recording service completion */}
      <Dialog open={!!selectedCustomerForLog} onOpenChange={(open) => !open && setSelectedCustomerForLog(null)}>
        {selectedCustomerForLog && (
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <div className='flex items-center justify-between'>
                <DialogTitle>{language === 'ur' ? 'سروس وزٹ مکمل درج کریں' : 'Complete Service Visit'}</DialogTitle>
                <button
                  type='button'
                  onClick={() => setSelectedCustomerForLog(null)}
                  className='text-muted-foreground hover:text-foreground cursor-pointer'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
              <DialogDescription>
                {t('client')}: <strong>{selectedCustomerForLog.customerName}</strong> (<span dir='ltr'>{selectedCustomerForLog.contact}</span>)
              </DialogDescription>
            </DialogHeader>

            <div className='py-4 space-y-3'>
              <label className='block text-xs font-semibold text-foreground uppercase tracking-wider'>
                {t('logTechnicianNotes')}
              </label>
              <textarea
                rows={3}
                placeholder={t('logNotesPlaceholder')}
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                className='flex w-full rounded-lg border border-input bg-background p-3 text-xs shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground'
              />
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setSelectedCustomerForLog(null)}
                className='cursor-pointer'
              >
                {t('cancel')}
              </Button>
              <Button
                variant='success'
                onClick={() => handleMarkCompleted(selectedCustomerForLog)}
                className='cursor-pointer'
              >
                {t('saveServiceRecord')}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
