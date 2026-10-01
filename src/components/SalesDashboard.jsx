import React, { useEffect, useRef } from 'react'
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
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
import { Badge } from './ui/Badge'
import {
  TrendingUp,
  ArrowUpRight,
  Receipt,
  FileText,
  ShoppingBag,
  CreditCard,
  Wallet,
  Landmark,
  Clock,
} from './ui/Icons'
import { useLanguage } from '../context/LanguageContext'
import { formatCurrency } from '../utils/translations'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

export default function SalesDashboard({ sales = [], webOrders = [] }) {
  const { t, language, isRTL } = useLanguage()
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const now = new Date()

  // Standard time-based revenue calculations
  const dailySales = sales
    .filter((s) => new Date(s.date).toDateString() === now.toDateString())
    .reduce((sum, s) => sum + (s.total || 0), 0)

  const weeklySales = sales
    .filter(
      (s) =>
        (now.getTime() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24) <= 7,
    )
    .reduce((sum, s) => sum + (s.total || 0), 0)

  const monthlySales = sales
    .filter(
      (s) =>
        new Date(s.date).getMonth() === now.getMonth() &&
        new Date(s.date).getFullYear() === now.getFullYear(),
    )
    .reduce((sum, s) => sum + (s.total || 0), 0)

  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0)
  const totalOrders = sales.length

  // Channel breakdown (Omnichannel: POS Counter vs Live Web Store)
  const posSales = sales.filter(
    (s) => (s.orderOrigin || 'POS Counter') === 'POS Counter',
  )
  const posRevenue = posSales.reduce((sum, s) => sum + (s.total || 0), 0)
  const posPercentage =
    totalRevenue > 0 ? Math.round((posRevenue / totalRevenue) * 100) : 0

  const onlineSales = sales.filter((s) => s.orderOrigin === 'Online Website')
  const onlineRevenue = onlineSales.reduce((sum, s) => sum + (s.total || 0), 0)
  const onlinePercentage =
    totalRevenue > 0 ? Math.round((onlineRevenue / totalRevenue) * 100) : 0

  // Pending web orders in pipeline
  const pendingOrders = webOrders.filter((o) => o.status === 'Pending')
  const pendingPipelineRevenue = pendingOrders.reduce(
    (sum, o) => sum + (o.total || 0),
    0,
  )

  // Payment method breakdown (Cash vs JazzCash vs EasyPaisa vs Bank Transfer)
  const getMethodStats = (method) => {
    const matching = sales.filter((s) => {
      const sMethod = s.paymentMethod || 'Cash'
      return sMethod === method
    })
    const revenue = matching.reduce((sum, s) => sum + (s.total || 0), 0)
    const pct = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0
    return { count: matching.length, revenue, pct }
  }

  const cashStats = getMethodStats('Cash')
  const jazzCashStats = getMethodStats('JazzCash')
  const easyPaisaStats = getMethodStats('EasyPaisa')
  const bankStats = getMethodStats('Bank Transfer')

  const paymentMethods = [
    {
      id: 'Cash',
      label: t('methodCash') || t('payCash'),
      stats: cashStats,
      badgeVariant: 'success',
      icon: Wallet,
      barColor: 'bg-emerald-500',
    },
    {
      id: 'JazzCash',
      label: t('methodJazzCash') || t('payJazzCash'),
      stats: jazzCashStats,
      badgeVariant: 'warning',
      icon: CreditCard,
      barColor: 'bg-amber-500',
    },
    {
      id: 'EasyPaisa',
      label: t('methodEasyPaisa') || t('payEasyPaisa'),
      stats: easyPaisaStats,
      badgeVariant: 'info',
      icon: CreditCard,
      barColor: 'bg-teal-500',
    },
    {
      id: 'Bank Transfer',
      label: t('methodBankTransfer') || t('payBankTransfer'),
      stats: bankStats,
      badgeVariant: 'purple',
      icon: Landmark,
      barColor: 'bg-indigo-500',
    },
  ]

  // Render Chart.js
  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }
    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const labelToday = t('todayDaily')
    const labelWeekly = t('past7DaysWeekly')
    const labelMonth = t('thisMonth')
    const labelRevenue = t('amount')

    chartInstance.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: [labelToday, labelWeekly, labelMonth],
        datasets: [
          {
            label: labelRevenue,
            data: [dailySales, weeklySales, monthlySales],
            backgroundColor: [
              'rgba(14, 165, 233, 0.85)',
              'rgba(37, 99, 235, 0.85)',
              'rgba(16, 185, 129, 0.85)',
            ],
            borderColor: [
              'rgb(14, 165, 233)',
              'rgb(37, 99, 235)',
              'rgb(16, 185, 129)',
            ],
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 36,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { size: 12, weight: '600' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return formatCurrency(context.raw, language)
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 11 },
              color: '#64748b',
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9',
            },
            ticks: {
              font: { size: 11 },
              color: '#64748b',
              callback: function (value) {
                return 'PKR ' + Number(value).toLocaleString()
              },
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [dailySales, weeklySales, monthlySales, t, language])

  return (
    <div className='space-y-6'>
      {/* Title banner */}
      <div className='flex flex-wrap items-center justify-between gap-4 pb-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>
            {language === 'ur'
              ? 'مالیاتی جائزہ اور کاروباری کارکردگی'
              : 'Executive Financial Overview'}
          </h2>
          <p className='text-sm text-muted-foreground mt-0.5'>
            {language === 'ur'
              ? 'ریئل ٹائم آمدنی کا تخمینہ، طریقہ ہائے ادائیگی، اور ملٹی چینل سیلز کا باضابطہ ریکارڈ۔'
              : 'Real-time revenue metrics, payment method distributions, and omnichannel sales records in PKR.'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='px-3 py-1 font-mono text-xs'>
            {language === 'ur' ? 'لائیو لیجر' : 'Live Ledger'}
          </Badge>
          {pendingOrders.length > 0 && (
            <Badge variant='warning' className='px-2.5 py-1 text-xs flex items-center gap-1 font-medium'>
              <Clock className='w-3 h-3' />
              <span>
                {pendingOrders.length} {language === 'ur' ? 'زیرِ جائزہ ویب آرڈرز' : 'Pending Web Orders'}
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* 4 KPI Stats Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Daily */}
        <Card className='border-border/80'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('dailySales')}
            </CardTitle>
            <div className='w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-600 dark:text-sky-400'>
              <ArrowUpRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {formatCurrency(dailySales, language)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              {t('invoicesGeneratedToday')}
            </p>
          </CardContent>
        </Card>

        {/* Weekly */}
        <Card className='border-border/80'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('weeklySales')}
            </CardTitle>
            <div className='w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400'>
              <TrendingUp className={`w-4 h-4 ${isRTL ? 'scale-x-[-1]' : ''}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {formatCurrency(weeklySales, language)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              {t('rollingLast7Days')}
            </p>
          </CardContent>
        </Card>

        {/* Monthly */}
        <Card className='border-border/80'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('monthlySales')}
            </CardTitle>
            <div className='w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400'>
              <TrendingUp className={`w-4 h-4 ${isRTL ? 'scale-x-[-1]' : ''}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {formatCurrency(monthlySales, language)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              {t('currentMonthRevenue')}
            </p>
          </CardContent>
        </Card>

        {/* Total Lifetime Revenue */}
        <Card className='border-border/80'>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('totalRevenue')}
            </CardTitle>
            <div className='w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400'>
              <Receipt className='w-4 h-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-700 dark:text-purple-400'>
              {formatCurrency(totalRevenue, language)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              {t('acrossSettledOrders', { count: totalOrders })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Phase 3 Analytics: Omnichannel & Payment Methods Breakdown */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {/* Card 1: Omnichannel Sales Performance (Shop POS vs Online Web Store) */}
        <Card className='border-border/80'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-semibold text-foreground flex items-center justify-between'>
              <span>{t('salesByChannel')}</span>
              <Badge variant='outline' className='text-[10px] font-mono'>
                {totalOrders} {language === 'ur' ? 'آرڈرز' : 'Orders'}
              </Badge>
            </CardTitle>
            <CardDescription className='text-xs text-muted-foreground'>
              {t('salesByChannelDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* POS Counter Channel */}
            <div className='p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center'>
                    <Receipt className='w-3.5 h-3.5' />
                  </div>
                  <div>
                    <span className='font-semibold text-foreground'>{t('channelPos')}</span>
                    <span className='text-[11px] text-muted-foreground ml-1.5'>
                      ({posSales.length} {language === 'ur' ? 'سیلز' : 'bills'})
                    </span>
                  </div>
                </div>
                <div className='text-right'>
                  <span className='font-bold text-foreground font-mono'>
                    {formatCurrency(posRevenue, language)}
                  </span>
                  <span className='text-[11px] text-muted-foreground ml-1 font-mono'>
                    ({posPercentage}%)
                  </span>
                </div>
              </div>
              <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
                <div
                  className='bg-primary h-2 rounded-full transition-all duration-500'
                  style={{ width: `${Math.max(posPercentage, posRevenue > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>

            {/* Online Website Channel */}
            <div className='p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center'>
                    <ShoppingBag className='w-3.5 h-3.5' />
                  </div>
                  <div>
                    <span className='font-semibold text-foreground'>{t('channelOnline')}</span>
                    <span className='text-[11px] text-muted-foreground ml-1.5'>
                      ({onlineSales.length} {language === 'ur' ? 'آرڈرز' : 'settled'})
                    </span>
                  </div>
                </div>
                <div className='text-right'>
                  <span className='font-bold text-purple-700 dark:text-purple-400 font-mono'>
                    {formatCurrency(onlineRevenue, language)}
                  </span>
                  <span className='text-[11px] text-muted-foreground ml-1 font-mono'>
                    ({onlinePercentage}%)
                  </span>
                </div>
              </div>
              <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
                <div
                  className='bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all duration-500'
                  style={{ width: `${Math.max(onlinePercentage, onlineRevenue > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>

            {/* Pipeline Notice for Pending Web Orders */}
            {pendingPipelineRevenue > 0 && (
              <div className='p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 flex items-center justify-between text-xs'>
                <div className='flex items-center gap-2'>
                  <Clock className='w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0' />
                  <span className='text-amber-900 dark:text-amber-200 font-medium'>
                    {language === 'ur' ? 'زیرِ جائزہ ویب آرڈرز پائپ لائن:' : 'Pending Web Orders in Review:'}
                  </span>
                </div>
                <span className='font-bold font-mono text-amber-700 dark:text-amber-300'>
                  {formatCurrency(pendingPipelineRevenue, language)} ({pendingOrders.length})
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Payment Methods Distribution */}
        <Card className='border-border/80'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-semibold text-foreground flex items-center justify-between'>
              <span>{t('paymentMethodsBreakdown')}</span>
              <span className='text-xs font-normal text-muted-foreground'>
                {language === 'ur' ? 'کیش، جاز کیش، ایزی پیسہ، بینک' : 'Cash, JazzCash, EasyPaisa, Bank'}
              </span>
            </CardTitle>
            <CardDescription className='text-xs text-muted-foreground'>
              {t('paymentMethodsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid grid-cols-2 gap-2.5'>
              {paymentMethods.map((pm) => {
                const Icon = pm.icon
                return (
                  <div
                    key={pm.id}
                    className='p-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted/30 transition-colors flex flex-col justify-between'
                  >
                    <div className='flex items-center justify-between mb-1.5'>
                      <div className='flex items-center gap-1.5'>
                        <Icon className='w-3.5 h-3.5 text-muted-foreground' />
                        <span className='text-xs font-semibold text-foreground truncate'>
                          {pm.label}
                        </span>
                      </div>
                      <Badge variant={pm.badgeVariant} className='text-[9px] px-1.5 py-0 font-mono'>
                        {pm.stats.count}
                      </Badge>
                    </div>
                    <div>
                      <div className='text-sm font-bold text-foreground font-mono'>
                        {formatCurrency(pm.stats.revenue, language)}
                      </div>
                      <div className='w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden'>
                        <div
                          className={`${pm.barColor} h-1.5 rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(pm.stats.pct, pm.stats.revenue > 0 ? 5 : 0)}%` }}
                        />
                      </div>
                      <span className='text-[10px] text-muted-foreground font-mono mt-1 block text-right'>
                        {pm.stats.pct}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Visualizer */}
      <Card className='border-border/80'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base font-semibold text-foreground flex items-center justify-between'>
            <span>{t('salesTrendsTitle')}</span>
            <span className='text-xs font-normal text-muted-foreground'>{t('pkrCurrency')}</span>
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>
            {t('salesTrendsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-64 sm:h-72 w-full pt-4'>
            <canvas ref={chartRef} className='w-full h-full' />
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales Ledger */}
      <Card className='border-border/80'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-base font-semibold text-foreground'>
                {t('recentTransactions')}
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                {t('recentTransactionsDesc')}
              </CardDescription>
            </div>
            <Badge variant='secondary' className='text-xs font-medium'>
              <span className='font-mono mr-1'>{sales.length}</span>{' '}
              {language === 'ur' ? 'کل انوائسز' : 'Total Invoices'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {sales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('invoiceNo')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{language === 'ur' ? 'سیلز چینل' : 'Channel'}</TableHead>
                  <TableHead>{t('paymentMethod')}</TableHead>
                  <TableHead>{t('lineItems')}</TableHead>
                  <TableHead className={isRTL ? 'text-left' : 'text-right'}>
                    {t('amount')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales
                  .slice(-8)
                  .reverse()
                  .map((sale, i) => {
                    const isOnline = sale.orderOrigin === 'Online Website'
                    const pMethod = sale.paymentMethod || 'Cash'
                    const getBadgeVariant = (m) => {
                      switch (m) {
                        case 'JazzCash':
                          return 'warning'
                        case 'EasyPaisa':
                          return 'info'
                        case 'Bank Transfer':
                          return 'purple'
                        default:
                          return 'success'
                      }
                    }

                    return (
                      <TableRow key={sale.invoice || i}>
                        <TableCell
                          className='font-mono text-xs font-semibold text-primary'
                          dir='ltr'
                        >
                          {sale.invoice}
                          {sale.customerName && (
                            <span className='block font-sans text-[11px] font-normal text-muted-foreground'>
                              {sale.customerName}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className='text-xs text-muted-foreground'>
                          {new Date(sale.date).toLocaleDateString(
                            language === 'ur' ? 'ur-PK' : 'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            },
                          )}
                        </TableCell>
                        {/* Channel Badge */}
                        <TableCell className='text-xs'>
                          {isOnline ? (
                            <Badge
                              variant='purple'
                              className='text-[10px] font-medium inline-flex items-center gap-1'
                            >
                              <ShoppingBag className='w-3 h-3' />
                              <span>{t('channelOnline')}</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant='outline'
                              className='text-[10px] font-medium inline-flex items-center gap-1'
                            >
                              <Receipt className='w-3 h-3' />
                              <span>{t('channelPos')}</span>
                            </Badge>
                          )}
                        </TableCell>
                        {/* Payment Method Badge & Reference */}
                        <TableCell className='text-xs'>
                          <Badge
                            variant={getBadgeVariant(pMethod)}
                            className='text-[10px] font-medium'
                          >
                            {pMethod}
                          </Badge>
                          {sale.paymentReference && (
                            <span className='block text-[10px] text-muted-foreground font-mono mt-0.5 max-w-[140px] truncate' title={sale.paymentReference}>
                              {sale.paymentReference}
                            </span>
                          )}
                        </TableCell>
                        {/* Line Items */}
                        <TableCell className='text-xs'>
                          <span className='font-medium text-foreground'>
                            {sale.items.length}{' '}
                            {language === 'ur'
                              ? 'اشیاء'
                              : sale.items.length === 1
                              ? 'item'
                              : 'items'}
                          </span>
                          <span className='text-muted-foreground text-[11px] block truncate max-w-xs'>
                            {sale.items
                              .map((it) =>
                                language === 'ur' && it.urduName
                                  ? it.urduName
                                  : it.name,
                              )
                              .join('، ')}
                          </span>
                        </TableCell>
                        {/* Amount */}
                        <TableCell
                          className={`${
                            isRTL ? 'text-left' : 'text-right'
                          } font-semibold text-foreground text-sm`}
                        >
                          {formatCurrency(sale.total, language)}
                          {sale.discount > 0 && (
                            <span className='block text-[10px] text-muted-foreground font-normal'>
                              -{formatCurrency(sale.discount, language)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          ) : (
            <div className='p-8 text-center text-muted-foreground'>
              <FileText className='w-8 h-8 mx-auto text-muted-foreground/50 mb-2' />
              <p className='text-sm font-medium'>{t('noSalesYet')}</p>
              <p className='text-xs mt-1'>
                {language === 'ur'
                  ? 'انوائس تیار کرنے کے لیے بلنگ ٹیب کا استعمال کریں۔'
                  : 'Generate bills from the POS tab or complete website orders to view transaction history.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
