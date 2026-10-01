import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/Dialog'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Input } from './ui/Input'
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Database,
  ArrowRight,
  Boxes,
  Zap,
  Clock,
  Wifi,
  WifiOff,
  X,
  Plus,
} from './ui/Icons'
import { useLanguage } from '../context/LanguageContext'
import { cloudSyncService, SUPABASE_CONFIG } from '../services/cloudSyncService'
import { formatCurrency } from '../utils/translations'

export default function CloudSyncModal({
  isOpen,
  onClose,
  inventory,
  updateInventory,
  webOrders,
  updateWebOrders,
  customers,
  updateCustomers,
  bookings,
  updateBookings,
  sales,
}) {
  const { t, language, isRTL } = useLanguage()

  const [isSyncing, setIsSyncing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('checking') // 'connected' | 'offline' | 'checking'
  const [lastSyncTime, setLastSyncTime] = useState(
    localStorage.getItem('draqua-last-cloud-sync') || null,
  )
  const [offlineQueue, setOfflineQueue] = useState(cloudSyncService.getOfflineQueue())
  const [notice, setNotice] = useState(null)

  // Simulation State
  const [simCustomerName, setSimCustomerName] = useState('Bilal Tariq')
  const [simPhone, setSimPhone] = useState('03125556677')
  const [simCity, setSimCity] = useState('Lahore')
  const [simAddress, setSimAddress] = useState('House 82, Sector Y, DHA Phase 3')
  const [simProductId, setSimProductId] = useState('1001')
  const [simPaymentMethod, setSimPaymentMethod] = useState('JazzCash')

  useEffect(() => {
    const checkConn = async () => {
      if (!navigator.onLine) {
        setConnectionStatus('offline')
        return
      }
      const res = await cloudSyncService.testConnection()
      setConnectionStatus(res.ok ? 'connected' : 'offline')
    }

    if (isOpen) {
      checkConn()
      setOfflineQueue(cloudSyncService.getOfflineQueue())
    }
  }, [isOpen])

  // Subscribe to queue updates
  useEffect(() => {
    const unsub = cloudSyncService.subscribe((event, data) => {
      if (event === 'queueUpdated' || event === 'queueDrained') {
        setOfflineQueue(cloudSyncService.getOfflineQueue())
      }
    })
    return () => unsub()
  }, [])

  const showToast = (message, type = 'success') => {
    setNotice({ message, type })
    setTimeout(() => setNotice(null), 4000)
  }

  // Trigger Master Sync
  const handleMasterSync = async () => {
    setIsSyncing(true)
    const result = await cloudSyncService.syncAll({
      inventory,
      webOrders,
      customers,
      bookings,
      sales,
    })
    setIsSyncing(false)

    if (result.ok) {
      setLastSyncTime(result.timestamp)
      setOfflineQueue(cloudSyncService.getOfflineQueue())

      // If remote orders pulled, merge with local web orders
      if (result.remoteOrders && result.remoteOrders.length > 0) {
        const merged = [...result.remoteOrders]
        webOrders.forEach((localOrder) => {
          if (!merged.some((r) => r.id === localOrder.id)) {
            merged.push(localOrder)
          }
        })
        updateWebOrders(merged)
      }

      showToast(
        language === 'ur'
          ? 'تمام ڈیٹا کلاؤڈ ڈیٹا بیس کے ساتھ کامیابی سے ہم آہنگ ہو گیا!'
          : 'All data successfully synchronized with Cloud Database!',
        'success',
      )
    } else {
      showToast(result.error || 'Failed to sync with cloud.', 'error')
    }
  }

  // Drain Queue
  const handleDrainQueue = async () => {
    setIsSyncing(true)
    const res = await cloudSyncService.drainOfflineQueue()
    setIsSyncing(false)
    setOfflineQueue(cloudSyncService.getOfflineQueue())
    showToast(
      language === 'ur'
        ? `آف لائن قطار سے ${res.processed} تبدیلیاں کلاؤڈ پر منتقل ہو گئیں۔`
        : `Processed ${res.processed} pending items from offline queue.`,
      'info',
    )
  }

  // Clear Queue
  const handleClearQueue = () => {
    if (window.confirm(language === 'ur' ? 'کیا آپ تمام زیر التواء کیو حذف کرنا چاہتے ہیں؟' : 'Clear all queued offline changes?')) {
      cloudSyncService.clearOfflineQueue()
      setOfflineQueue([])
      showToast('Offline queue cleared.', 'info')
    }
  }

  // Simulate Online E-Commerce Storefront Order
  const handleSimulateOnlineOrder = async () => {
    const selectedProduct = inventory.find((p) => p.id === Number(simProductId)) || inventory[0]
    if (!selectedProduct) return

    const newOrderId = `ORD-VERCEL-${Date.now().toString().slice(-4)}`
    const subtotal = selectedProduct.price
    const deliveryFee = 600
    const total = subtotal + deliveryFee

    const newOrder = {
      id: newOrderId,
      customerName: simCustomerName,
      customerPhone: simPhone,
      customerEmail: `${simCustomerName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      deliveryAddress: simAddress,
      city: simCity,
      items: [
        {
          productId: selectedProduct.id,
          sku: selectedProduct.sku,
          name: selectedProduct.name,
          urduName: selectedProduct.urduName,
          price: selectedProduct.price,
          qty: 1,
          image: selectedProduct.image,
        },
      ],
      subtotal,
      deliveryFee,
      total,
      paymentMethod: simPaymentMethod,
      paymentReference: simPaymentMethod === 'Cash' ? undefined : `TXN-${Date.now().toString().slice(-6)}`,
      paymentStatus: simPaymentMethod === 'Cash' ? 'Unpaid (COD)' : 'Paid',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      notes: 'Placed via live storefront (dr-aqua-project.vercel.app)',
    }

    // 1. Send to Cloud
    await cloudSyncService.syncOrder(newOrder)

    // 2. Add to Dashboard local state
    updateWebOrders([newOrder, ...webOrders])

    showToast(
      language === 'ur'
        ? `آن لائن آرڈر ${newOrderId} وصول ہو گیا! ان باکس میں چیک کریں۔`
        : `Online Storefront order ${newOrderId} received! Check Orders Inbox.`,
      'success',
    )
  }

  const formatLastSync = (iso) => {
    if (!iso) return language === 'ur' ? 'ابھی تک نہیں' : 'Not yet synced'
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch (e) {
      return iso
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto p-0'>
        {/* Modal Header */}
        <div className='p-4 border-b border-border bg-card flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
              <Cloud className='w-5 h-5' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold'>
                {language === 'ur' ? 'کلاؤڈ سنکرونائزیشن اور ای کامرس انضمام' : 'Cloud Sync & Storefront Integration'}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                {language === 'ur'
                  ? 'ڈاکٹر ایکوا آن لائن اسٹور اور فزیکل شاپ ڈیش بورڈ کا ریئل ٹائم کلاؤڈ کنکشن۔'
                  : 'Real-time two-way synchronization between Vercel storefront and shop dashboard.'}
              </DialogDescription>
            </div>
          </div>
          <button onClick={onClose} className='text-muted-foreground hover:text-foreground cursor-pointer'>
            <X className='w-4 h-4' />
          </button>
        </div>

        <div className='p-5 space-y-4 text-xs'>
          {/* Toast Notice */}
          {notice && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                notice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                  : 'bg-primary/10 border-primary/20 text-primary'
              }`}
            >
              <div className='flex items-center gap-1.5 font-semibold'>
                <CheckCircle2 className='w-4 h-4 text-emerald-600' />
                <span>{notice.message}</span>
              </div>
              <button onClick={() => setNotice(null)} className='text-xs opacity-70'>✕</button>
            </div>
          )}

          {/* Cloud Database Status Card */}
          <div className='p-4 rounded-xl bg-card border border-border shadow-subtle space-y-3'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <Database className='w-4 h-4 text-primary' />
                <span className='font-bold text-sm text-foreground'>
                  {language === 'ur' ? 'کلاؤڈ ڈیٹا بیس (Supabase PostgreSQL)' : 'Cloud Database (Supabase PostgreSQL)'}
                </span>
              </div>

              {connectionStatus === 'connected' ? (
                <Badge variant='success' className='gap-1 px-2 py-0.5 text-[10px]'>
                  <Wifi className='w-3 h-3' />
                  <span>{language === 'ur' ? 'آن لائن اور منسلک ہے' : 'Online & Connected'}</span>
                </Badge>
              ) : (
                <Badge variant='warning' className='gap-1 px-2 py-0.5 text-[10px]'>
                  <WifiOff className='w-3 h-3' />
                  <span>{language === 'ur' ? 'آف لائن فال بیک فعال ہے' : 'Offline Fallback Active'}</span>
                </Badge>
              )}
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]'>
              <div className='p-2 rounded-lg bg-muted/30 border border-border/60'>
                <span className='text-muted-foreground block'>{language === 'ur' ? 'کلاؤڈ اینڈ پوائنٹ:' : 'Cloud Host:'}</span>
                <span className='font-mono font-semibold text-foreground truncate block'>ivfvxnwciuqicqqnlbtx</span>
              </div>
              <div className='p-2 rounded-lg bg-muted/30 border border-border/60'>
                <span className='text-muted-foreground block'>{language === 'ur' ? 'آخری ہم آہنگی:' : 'Last Synced:'}</span>
                <span className='font-mono font-bold text-foreground block'>{formatLastSync(lastSyncTime)}</span>
              </div>
              <div className='p-2 rounded-lg bg-muted/30 border border-border/60'>
                <span className='text-muted-foreground block'>{language === 'ur' ? 'آف لائن قطار:' : 'Offline Queue:'}</span>
                <span className='font-mono font-bold text-foreground block'>
                  {offlineQueue.length} {language === 'ur' ? 'تبدیلیاں' : 'pending changes'}
                </span>
              </div>
            </div>

            {/* Offline Queue Actions if not empty */}
            {offlineQueue.length > 0 && (
              <div className='p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2'>
                <span className='text-amber-800 dark:text-amber-300 font-medium'>
                  {language === 'ur'
                    ? `${offlineQueue.length} ٹرانزیکشنز مقامی طور پر محفوظ ہیں جو انٹرنیٹ بحال ہونے پر اپ لوڈ ہوں گی۔`
                    : `${offlineQueue.length} changes queued locally while in offline mode.`}
                </span>
                <div className='flex gap-1.5'>
                  <Button variant='outline' size='sm' onClick={handleDrainQueue} className='h-7 text-[10px] cursor-pointer'>
                    {language === 'ur' ? 'ابھی سنک کریں' : 'Sync Now'}
                  </Button>
                  <Button variant='ghost' size='sm' onClick={handleClearQueue} className='h-7 text-[10px] text-destructive hover:bg-destructive/10 cursor-pointer'>
                    {language === 'ur' ? 'خالی کریں' : 'Clear'}
                  </Button>
                </div>
              </div>
            )}

            {/* Master Two-Way Sync Button */}
            <Button
              variant='default'
              size='sm'
              onClick={handleMasterSync}
              disabled={isSyncing}
              className='w-full h-9 text-xs font-bold gap-2 cursor-pointer shadow-subtle'
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? language === 'ur' ? 'کلاؤڈ ہم آہنگی جاری ہے...' : 'Synchronizing with Cloud...'
                  : language === 'ur' ? 'تمام انوینٹری اور آرڈرز کلاؤڈ پر ہم آہنگ کریں' : 'Sync All Inventory & Orders to Cloud'}
              </span>
            </Button>
          </div>

          {/* Real-Time E-Commerce Order Simulator (Phase 5.2) */}
          <div className='p-4 rounded-xl bg-card border border-border shadow-subtle space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Zap className='w-4 h-4 text-amber-500' />
                <span className='font-bold text-sm text-foreground'>
                  {language === 'ur' ? 'لائیو ویب سائٹ آرڈر سمیلیشن (Vercel Storefront)' : 'Live Storefront Order Simulator (Vercel)'}
                </span>
              </div>
              <Badge variant='outline' className='text-[10px] font-mono'>
                dr-aqua-project.vercel.app
              </Badge>
            </div>

            <p className='text-muted-foreground text-[11px] leading-relaxed'>
              {language === 'ur'
                ? 'جب کسٹمر ویب سائٹ پر آرڈر دیتا ہے، یہ ریئل ٹائم میں ڈیش بورڈ کے ان باکس میں پہنچتا ہے۔ فوری ٹیسٹ کے لیے نیچے دیے گئے بٹن سے آرڈر بھیجیں۔'
                : 'Simulate an authentic e-commerce customer checkout to test instant arrival into the Orders Inbox.'}
            </p>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-muted/20 border border-border/70'>
              <div className='space-y-1'>
                <label className='font-medium text-foreground'>{t('customerFullName')}</label>
                <Input
                  type='text'
                  value={simCustomerName}
                  onChange={(e) => setSimCustomerName(e.target.value)}
                  className='h-8 text-xs'
                />
              </div>

              <div className='space-y-1'>
                <label className='font-medium text-foreground'>{t('contactNumber')}</label>
                <Input
                  type='text'
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className='h-8 text-xs font-mono'
                  dir='ltr'
                />
              </div>

              <div className='space-y-1'>
                <label className='font-medium text-foreground'>{language === 'ur' ? 'شہر' : 'City'}</label>
                <select
                  value={simCity}
                  onChange={(e) => setSimCity(e.target.value)}
                  className='w-full h-8 px-2 rounded-lg border border-input bg-card text-xs text-foreground cursor-pointer'
                >
                  <option value='Lahore'>Lahore</option>
                  <option value='Islamabad'>Islamabad</option>
                  <option value='Rawalpindi'>Rawalpindi</option>
                  <option value='Karachi'>Karachi</option>
                </select>
              </div>

              <div className='space-y-1'>
                <label className='font-medium text-foreground'>{t('paymentMethod')}</label>
                <select
                  value={simPaymentMethod}
                  onChange={(e) => setSimPaymentMethod(e.target.value)}
                  className='w-full h-8 px-2 rounded-lg border border-input bg-card text-xs text-foreground cursor-pointer'
                >
                  <option value='Cash'>Cash on Delivery (COD)</option>
                  <option value='JazzCash'>JazzCash</option>
                  <option value='EasyPaisa'>EasyPaisa</option>
                  <option value='Bank Transfer'>Bank Transfer</option>
                </select>
              </div>

              <div className='sm:col-span-2 space-y-1'>
                <label className='font-medium text-foreground'>{language === 'ur' ? 'خریداری کا پروڈکٹ' : 'Product Ordered'}</label>
                <select
                  value={simProductId}
                  onChange={(e) => setSimProductId(e.target.value)}
                  className='w-full h-8 px-2 rounded-lg border border-input bg-card text-xs text-foreground cursor-pointer'
                >
                  {inventory.slice(0, 8).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price, language)} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              variant='success'
              size='sm'
              onClick={handleSimulateOnlineOrder}
              className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs gap-1.5 cursor-pointer shadow-subtle'
            >
              <ShoppingBag className='w-4 h-4' />
              <span>
                {language === 'ur'
                  ? 'ویب سائٹ سے ٹیسٹ آرڈر ارسال کریں (Simulate Order)'
                  : 'Transmit Test Web Order to Inbox'}
              </span>
            </Button>
          </div>
        </div>

        <DialogFooter className='p-4 border-t border-border bg-card/60 flex items-center justify-end'>
          <Button variant='outline' size='sm' onClick={onClose} className='cursor-pointer text-xs'>
            {language === 'ur' ? 'بند کریں' : 'Close Hub'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
