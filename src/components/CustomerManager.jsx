import React, { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
  Users,
  Plus,
  Trash2,
  AlertCircle,
  MessageSquare,
  Clock,
  Phone,
  Wrench,
} from './ui/Icons'
import { useLanguage } from '../context/LanguageContext'
import { formatCurrency } from '../utils/translations'

export default function CustomerManager({ customers, updateCustomers }) {
  const { t, language, isRTL } = useLanguage()

  const [customer, setCustomer] = useState({ name: '', contact: '' })
  const [reminders, setReminders] = useState([])

  const addCustomer = (e) => {
    if (e) e.preventDefault()
    if (!customer.name.trim() || !customer.contact.trim()) {
      alert(language === 'ur' ? 'براہ کرم کسٹمر کا نام اور فون نمبر دونوں درج کریں۔' : 'Please fill in both customer name and contact number.')
      return
    }
    updateCustomers([
      ...customers,
      { ...customer, id: Date.now(), history: [] },
    ])
    setCustomer({ name: '', contact: '' })
  }

  const deleteCustomer = (id) => {
    if (window.confirm(t('deleteCustomerConfirm'))) {
      updateCustomers(customers.filter((c) => c.id !== id))
    }
  }

  // Format WhatsApp reminder link
  const getWhatsAppLink = (c, reminderType) => {
    const rawContact = (c.contact || '').replace(/[^0-9]/g, '')
    let formattedNumber = rawContact
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '92' + formattedNumber.slice(1)
    }

    const message =
      language === 'ur'
        ? reminderType === '2-month'
          ? `السلام علیکم ${c.name} صاحب، یہ ڈاکٹر ایکوا واٹر ٹیکنالوجی کی جانب سے سروس میسج ہے۔ آپ کے فلٹریشن سسٹم کے فلٹر کارٹریج کی تبدیلی کی میعاد مکمل ہو چکی ہے۔ سروس شیڈول کروانے کے لیے جواب دیں۔`
          : `السلام علیکم ${c.name} صاحب، یہ ڈاکٹر ایکوا واٹر ٹیکنالوجی کی جانب سے سروس میسج ہے۔ آپ کی واٹر فلٹریشن سروس کو 1 ماہ مکمل ہو چکا ہے۔ روٹین معائنہ اور ٹی ڈی ایس ٹیسٹنگ کے لیے رابطہ فرمائیں۔`
        : reminderType === '2-month'
          ? `Assalam-o-Alaikum ${c.name}, this is Dr. Aqua Services. Your water filtration unit is due for its periodic filter cartridge replacement. Please reply to schedule your maintenance visit.`
          : `Assalam-o-Alaikum ${c.name}, this is Dr. Aqua Services. It has been 1 month since your water filtration service. We would like to schedule a routine inspection and TDS check.`

    return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`
  }

  // Check for reminders
  useEffect(() => {
    const checkReminders = () => {
      const newReminders = []
      const now = new Date()

      customers.forEach((c) => {
        if (c.history && c.history.length > 0) {
          const lastSale = c.history[c.history.length - 1]
          if (!lastSale) return
          const lastPurchase = new Date(lastSale.date)
          const diffMs = now.getTime() - lastPurchase.getTime()
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
          const diffMonths = diffDays / 30

          if (diffMonths >= 1 && diffMonths < 2) {
            newReminders.push({
              customer: c,
              customerId: c.id,
              customerName: c.name,
              contact: c.contact,
              type: '1-month',
              days: diffDays,
              message: `${c.name} — 1 month service check due (${diffDays} days ago)`,
            })
          }
          if (diffMonths >= 2) {
            newReminders.push({
              customer: c,
              customerId: c.id,
              customerName: c.name,
              contact: c.contact,
              type: '2-month',
              days: diffDays,
              message: `${c.name} — 2 month filter replacement due (${diffDays} days ago)`,
            })
          }
        }
      })

      setReminders(newReminders)
    }

    checkReminders()
    const interval = setInterval(checkReminders, 60000)
    return () => clearInterval(interval)
  }, [customers])

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 pb-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>
            {t('customerCrmTitle')}
          </h2>
          <p className='text-sm text-muted-foreground mt-0.5'>
            {t('customerCrmDesc')}
          </p>
        </div>
        <Badge variant='outline' className='px-3 py-1 text-xs'>
          <span className='font-mono mr-1'>{customers.length}</span> {language === 'ur' ? 'صارفین کے ریکارڈز' : 'Client Profiles'}
        </Badge>
      </div>

      {/* Service Reminders Section */}
      {reminders.length > 0 && (
        <Card className='border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='w-4 h-4 text-amber-600' />
              <CardTitle className='text-sm font-semibold text-amber-900 dark:text-amber-200'>
                {t('activeServiceReminders')} ({reminders.length} {t('dueNow')})
              </CardTitle>
            </div>
            <CardDescription className='text-xs text-amber-700/80 dark:text-amber-300/80'>
              {t('remindersDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
              {reminders.map((r, i) => (
                <div
                  key={i}
                  className='p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200/80 flex items-center justify-between gap-3 shadow-subtle'
                >
                  <div>
                    <div className='flex items-center gap-1.5'>
                      <Badge
                        variant={r.type === '2-month' ? 'destructive' : 'warning'}
                        className='text-[10px] px-1.5 py-0'
                      >
                        {r.type === '2-month' ? t('filterReplacementDue') : t('serviceCheckDue')}
                      </Badge>
                      <span className='font-semibold text-xs text-foreground'>
                        {r.customerName}
                      </span>
                    </div>
                    <div className='text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1'>
                      <Clock className='w-3 h-3' />
                      <span>
                        {r.days} {language === 'ur' ? 'دن قبل خریداری ہوئی' : 'days since purchase'} • <span dir='ltr'>{r.contact}</span>
                      </span>
                    </div>
                  </div>

                  <a
                    href={getWhatsAppLink(r.customer, r.type)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer'
                  >
                    <MessageSquare className='w-3 h-3' />
                    <span>WhatsApp</span>
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Register Customer Card */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <Plus className='w-4 h-4 text-primary' />
            <span>{t('registerNewCustomer')}</span>
          </CardTitle>
          <CardDescription className='text-xs'>
            {language === 'ur'
              ? 'انوائسز، فون الرٹس، اور سروس ہسٹری لنک کرنے کے لیے نیا کسٹمر شامل کریں۔'
              : 'Enroll a new client to link invoices, phone notifications, and service history.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addCustomer} className='grid grid-cols-1 sm:grid-cols-12 gap-3'>
            <div className='sm:col-span-5'>
              <Input
                type='text'
                placeholder={t('customerFullName')}
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                required
              />
            </div>
            <div className='sm:col-span-5'>
              <Input
                type='text'
                placeholder={language === 'ur' ? 'موبائل / واٹس ایپ (مثلاً 03001234567)' : 'Mobile / WhatsApp (e.g. 03001234567)'}
                value={customer.contact}
                onChange={(e) => setCustomer({ ...customer, contact: e.target.value })}
                dir='ltr'
                required
              />
            </div>
            <div className='sm:col-span-2'>
              <Button type='submit' className='w-full cursor-pointer'>
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                <span>{t('registerClient')}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Customer Directory Table */}
      <Card>
        <CardHeader className='border-b border-border pb-3'>
          <CardTitle className='text-base font-semibold'>
            {t('clientDirectory')}
          </CardTitle>
          <CardDescription className='text-xs'>
            {language === 'ur' ? 'تمام رجسٹرڈ گاہک اور ان کی سابقہ خریداریوں کی فہرست۔' : 'Complete customer ledger with attached purchase history.'}
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('customerFullName')}</TableHead>
                <TableHead>{t('contactNumber')}</TableHead>
                <TableHead>{t('purchaseHistory')}</TableHead>
                <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className='font-semibold text-foreground text-sm flex items-center gap-2'>
                      <div className='w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold'>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{c.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                      <Phone className='w-3.5 h-3.5 text-muted-foreground' />
                      <span className='font-mono' dir='ltr'>{c.contact}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {c.history && c.history.length > 0 ? (
                      <div className='flex flex-wrap gap-1.5 items-center'>
                        {c.history.slice(-3).map((h, i) => (
                          <span
                            key={i}
                            className='inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-muted text-foreground border border-border'
                          >
                            <span className='text-primary font-bold'>{h.invoice}</span>
                            <span className='text-muted-foreground'>• {formatCurrency(h.total, language)}</span>
                          </span>
                        ))}
                        {c.history.length > 3 && (
                          <Badge variant='outline' className='text-[10px]'>
                            +{c.history.length - 3} {language === 'ur' ? 'مزید' : 'more'}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground'>{t('noPurchasesYet')}</span>
                    )}

                    {c.serviceHistory && c.serviceHistory.length > 0 && (
                      <div className='mt-1.5 flex flex-wrap gap-1 items-center'>
                        <span className='text-[10px] text-muted-foreground font-semibold'>
                          {language === 'ur' ? 'سروسز:' : 'Services:'}
                        </span>
                        {c.serviceHistory.slice(0, 2).map((srv, idx) => (
                          <span
                            key={idx}
                            className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20'
                          >
                            <Wrench className='w-2.5 h-2.5' />
                            <span>{srv.serviceType}</span>
                            {srv.partsUsed && srv.partsUsed.length > 0 && (
                              <span className='font-mono font-bold text-emerald-600'>({srv.partsUsed.length} parts)</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => deleteCustomer(c.id)}
                      className='text-muted-foreground hover:text-destructive h-8 px-2 cursor-pointer'
                      title={t('deleteAction')}
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className='py-12 text-center text-muted-foreground'>
                    <Users className='w-8 h-8 mx-auto text-muted-foreground/40 mb-2' />
                    <p className='text-sm font-semibold text-foreground'>{language === 'ur' ? 'کوئی کسٹمر رجسٹر نہیں ہے' : 'No customers recorded yet'}</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>{language === 'ur' ? 'اوپر دیے گئے فارم سے نیا کسٹمر رجسٹر کریں۔' : 'Register your first customer above.'}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
