import React, { useEffect, useState } from 'react'
import AuthManager from './components/AuthManager.jsx'
import BillingManager from './components/BillingManager.jsx'
import CustomerManager from './components/CustomerManager.jsx'
import InventoryManager from './components/InventoryManager.jsx'
import SalesDashboard from './components/SalesDashboard.jsx'
import ServiceManager from './components/ServiceManager.jsx'
import WebOrdersManager from './components/WebOrdersManager.jsx'
import CloudSyncModal from './components/CloudSyncModal.jsx'
import { cloudSyncService } from './services/cloudSyncService.js'
import { PRODUCTS_CATALOG } from './data/productsCatalog.js'
import { INITIAL_WEB_ORDERS } from './data/initialWebOrders.js'
import { INITIAL_BOOKINGS } from './data/initialBookings.js'
import { getCurrentUser, saveCurrentUser } from './utils/auth'
import { Badge } from './components/ui/Badge'
import { Button } from './components/ui/Button'
import { LanguageSwitcher } from './components/ui/LanguageSwitcher'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import {
  LayoutDashboard,
  Receipt,
  Boxes,
  Users,
  Wrench,
  ShoppingBag,
  LogOut,
  Droplets,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Cloud,
} from './components/ui/Icons'

const INITIAL_INVENTORY = PRODUCTS_CATALOG

const INITIAL_CUSTOMERS = [
  {
    id: 101,
    name: 'Muhammad Tariq',
    contact: '03001234567',
    history: [
      {
        invoice: 'INV-1001',
        customerId: 101,
        items: [
          {
            id: 1,
            name: 'RO Plant 100 GPD with Stand',
            urduName: 'آر او 100 گیلن فی دن (اسٹینڈ کے ساتھ)',
            quantity: 1,
            price: 38000,
            qty: 1,
          },
        ],
        total: 38000,
        date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 102,
    name: 'Zahid Mehmood',
    contact: '03219876543',
    history: [
      {
        invoice: 'INV-1002',
        customerId: 102,
        items: [
          {
            id: 2,
            name: 'Aspire 100 GPD Domestic RO',
            urduName: 'ایسپائر 100 گیلن فی دن',
            quantity: 1,
            price: 32000,
            qty: 1,
          },
        ],
        total: 32000,
        date: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
]

const INITIAL_SALES = [
  {
    invoice: 'INV-1001',
    customerId: 101,
    customerName: 'Muhammad Tariq',
    items: [
      {
        id: 1,
        name: 'RO Plant 100 GPD with Stand',
        urduName: 'آر او 100 گیلن فی دن (اسٹینڈ کے ساتھ)',
        quantity: 1,
        price: 38000,
        qty: 1,
      },
    ],
    subtotal: 38000,
    total: 38000,
    paymentMethod: 'Cash',
    orderOrigin: 'POS Counter',
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    invoice: 'INV-1002',
    customerId: 102,
    customerName: 'Zahid Mehmood',
    items: [
      {
        id: 2,
        name: 'Aspire 100 GPD Domestic RO',
        urduName: 'ایسپائر 100 گیلن فی دن',
        quantity: 1,
        price: 32000,
        qty: 1,
      },
    ],
    subtotal: 32000,
    total: 32000,
    paymentMethod: 'Bank Transfer',
    paymentReference: 'Meezan Bank - FT88921',
    orderOrigin: 'POS Counter',
    date: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    invoice: 'ORD-2026-104',
    customerId: 104,
    customerName: 'Usman Farooq',
    items: [
      {
        id: 1012,
        name: '3 Stage Filter 10"',
        urduName: '3 مرحلہ فلٹر 10 انچ',
        quantity: 1,
        price: 5500,
        qty: 1,
      },
    ],
    subtotal: 5500,
    total: 6200,
    paymentMethod: 'EasyPaisa',
    paymentReference: 'EP-44512903',
    orderOrigin: 'Online Website',
    date: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    notes: 'Delivered and verified by customer.',
  },
]

function AppContent() {
  const { t, language, isRTL } = useLanguage()
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [inventory, setInventory] = useState([])
  const [customers, setCustomers] = useState([])
  const [sales, setSales] = useState([])
  const [webOrders, setWebOrders] = useState([])
  const [bookings, setBookings] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [offlineQueueCount, setOfflineQueueCount] = useState(cloudSyncService.getOfflineQueue().length)
  const [lastSyncTime, setLastSyncTime] = useState(
    localStorage.getItem('draqua-last-cloud-sync') || null,
  )

  // Load state and auth from localStorage on mount
  useEffect(() => {
    const savedUser = getCurrentUser()
    if (savedUser) {
      setCurrentUser(savedUser)
    }

    const savedInventory = localStorage.getItem('draqua-inventory')
    const savedCustomers = localStorage.getItem('draqua-customers')
    const savedSales = localStorage.getItem('draqua-sales')

    if (savedInventory) {
      try {
        const parsed = JSON.parse(savedInventory)
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((p) => p.sku)) {
          // Merge newly added bilingual data and ensure Cloudinary CDN
          const upgraded = parsed.map((item) => {
            const catalogMatch = INITIAL_INVENTORY.find(
              (c) => c.id === item.id || c.sku === item.sku,
            )
            return catalogMatch
              ? {
                  ...item,
                  urduName: item.urduName || catalogMatch.urduName,
                  urduCategory: item.urduCategory || catalogMatch.urduCategory,
                  urduBrand: item.urduBrand || catalogMatch.urduBrand,
                  urduDescription: item.urduDescription || catalogMatch.urduDescription,
                  image: catalogMatch.image || item.image,
                  cloudinaryPublicId: catalogMatch.cloudinaryPublicId || item.cloudinaryPublicId,
                }
              : item
          })
          setInventory(upgraded)
        } else {
          setInventory(INITIAL_INVENTORY)
        }
      } catch (err) {
        console.error('Failed to parse inventory from localStorage:', err)
        setInventory(INITIAL_INVENTORY)
      }
    } else {
      setInventory(INITIAL_INVENTORY)
    }

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers))
    } else {
      setCustomers(INITIAL_CUSTOMERS)
    }

    if (savedSales) {
      setSales(JSON.parse(savedSales))
    } else {
      setSales(INITIAL_SALES)
    }

    const savedWebOrders = localStorage.getItem('draqua-web-orders')
    if (savedWebOrders) {
      try {
        setWebOrders(JSON.parse(savedWebOrders))
      } catch (err) {
        console.error('Failed to parse web orders from localStorage:', err)
        setWebOrders(INITIAL_WEB_ORDERS)
      }
    } else {
      setWebOrders(INITIAL_WEB_ORDERS)
    }

    const savedBookings = localStorage.getItem('draqua-service-bookings')
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings))
      } catch (err) {
        console.error('Failed to parse bookings from localStorage:', err)
        setBookings(INITIAL_BOOKINGS)
      }
    } else {
      setBookings(INITIAL_BOOKINGS)
    }

    setIsLoaded(true)
  }, [])

  // Synchronize state changes to localStorage
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('draqua-inventory', JSON.stringify(inventory))
  }, [inventory, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('draqua-customers', JSON.stringify(customers))
  }, [customers, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('draqua-sales', JSON.stringify(sales))
  }, [sales, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('draqua-web-orders', JSON.stringify(webOrders))
  }, [webOrders, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('draqua-service-bookings', JSON.stringify(bookings))
  }, [bookings, isLoaded])

  // Synchronize activeTab when role changes or user logs in
  useEffect(() => {
    if (!currentUser) return
    if (currentUser.role === 'admin') {
      if (!['dashboard', 'billing', 'weborders', 'inventory', 'customers', 'services'].includes(activeTab)) {
        setActiveTab('dashboard')
      }
    } else if (currentUser.role === 'cashier') {
      if (!['billing', 'weborders', 'inventory'].includes(activeTab)) {
        setActiveTab('billing')
      }
    } else if (currentUser.role === 'technician') {
      setActiveTab('services')
    }
  }, [currentUser, activeTab])

  const handleLogin = (user) => {
    setCurrentUser(user)
    saveCurrentUser(user)
    if (user.role === 'admin') setActiveTab('dashboard')
    else if (user.role === 'cashier') setActiveTab('billing')
    else if (user.role === 'technician') setActiveTab('services')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    saveCurrentUser(null)
  }

  const updateInventory = (newInventory) => setInventory(newInventory)
  const toggleProductOnline = (id) => {
    setInventory((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, onlineVisible: !p.onlineVisible } : p,
      ),
    )
  }
  const updateCustomers = (newCustomers) => setCustomers(newCustomers)
  const addSale = (sale) => setSales((prev) => [...prev, sale])
  const updateWebOrders = (newOrders) => setWebOrders(newOrders)
  const updateBookings = (newBookings) => setBookings(newBookings)

  // Cloud Synchronization: Listen to online/offline transitions & queue changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      cloudSyncService.drainOfflineQueue().then(() => {
        setOfflineQueueCount(cloudSyncService.getOfflineQueue().length)
      })
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const unsub = cloudSyncService.subscribe((event, data) => {
      if (event === 'queueUpdated' || event === 'queueDrained') {
        setOfflineQueueCount(cloudSyncService.getOfflineQueue().length)
      }
      if (event === 'syncCompleted') {
        setLastSyncTime(data?.timestamp || new Date().toISOString())
        setOfflineQueueCount(0)
      }
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      unsub()
    }
  }, [])

  // Auto-poll incoming storefront orders from Supabase every 15 seconds
  useEffect(() => {
    let isMounted = true
    const pollOrders = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return
      try {
        const remoteOrders = await cloudSyncService.fetchOrders()
        if (remoteOrders && remoteOrders.length > 0 && isMounted) {
          setWebOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o.id))
            const newOrders = remoteOrders.filter((ro) => !existingIds.has(ro.id))
            if (newOrders.length > 0) {
              return [...newOrders, ...prev]
            }
            return prev
          })
        }
      } catch (err) {
        // Silent polling error
      }
    }

    const interval = setInterval(pollOrders, 15000)
    pollOrders()

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const pendingWebOrdersCount = webOrders.filter((o) => o.status === 'Pending').length
  const activeBookingsCount = bookings.filter((b) => b.status === 'Scheduled' || b.status === 'In Progress').length

  if (!isLoaded) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center text-foreground'>
        <div className='flex items-center gap-3'>
          <div className='w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin' />
          <span className='text-sm font-medium text-muted-foreground'>
            {t('loading')}
          </span>
        </div>
      </div>
    )
  }

  // Not logged in -> Show Auth Screen
  if (!currentUser) {
    return <AuthManager onLogin={handleLogin} />
  }

  // Define tab navigation based on Role with localized labels
  const allTabs = [
    {
      id: 'dashboard',
      label: t('tabDashboard'),
      icon: LayoutDashboard,
      roles: ['admin'],
    },
    {
      id: 'billing',
      label: t('tabBilling'),
      icon: Receipt,
      roles: ['admin', 'cashier'],
      badge: 'POS',
    },
    {
      id: 'weborders',
      label: t('tabWebOrders'),
      icon: ShoppingBag,
      roles: ['admin', 'cashier'],
      badge: pendingWebOrdersCount > 0 ? pendingWebOrdersCount : null,
      badgeVariant: 'warning',
    },
    {
      id: 'inventory',
      label: currentUser.role === 'cashier' ? t('tabInventoryCashier') : t('tabInventoryAdmin'),
      icon: Boxes,
      roles: ['admin', 'cashier'],
      badge: inventory.length,
    },
    {
      id: 'customers',
      label: t('tabCustomers'),
      icon: Users,
      roles: ['admin'],
      badge: customers.length,
    },
    {
      id: 'services',
      label: t('tabServices'),
      icon: Wrench,
      roles: ['admin', 'technician'],
      badge: activeBookingsCount > 0 ? activeBookingsCount : null,
      badgeVariant: 'info',
    },
  ]

  const userTabs = allTabs.filter((tab) => tab.roles.includes(currentUser.role))

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'purple'
      case 'cashier':
        return 'info'
      case 'technician':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return t('admin')
      case 'cashier':
        return t('cashier')
      case 'technician':
        return t('technician')
      default:
        return role
    }
  }

  const getTabHeader = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: t('tabDashboard'),
          subtitle: language === 'ur' ? 'مالی تجزیہ، فروخت کے رجحانات اور لائیو آرڈرز' : 'Financial overview, revenue trends & orders',
        }
      case 'billing':
        return {
          title: t('tabBilling'),
          subtitle: language === 'ur' ? 'کسٹمر بلنگ، لائیو انوینٹری کٹوتی اور پی ڈی ایف رسید' : 'Point of sale billing, stock decrement & receipts',
        }
      case 'weborders':
        return {
          title: t('tabWebOrders'),
          subtitle: language === 'ur' ? 'ویب سائٹ سے موصولہ آرڈرز، ڈسپیچ کنٹرول اور لائیو اسٹاک انضمام' : 'Online storefront orders inbox, courier dispatch & stock deduction',
        }
      case 'inventory':
        return {
          title: currentUser.role === 'cashier' ? t('tabInventoryCashier') : t('tabInventoryAdmin'),
          subtitle: language === 'ur' ? 'گودام کے اسٹاک کی تعداد، پی او ایس ریٹس، اور آن لائن کیٹلاگ' : 'Warehouse stock counts, POS pricing & storefront sync',
        }
      case 'customers':
        return {
          title: t('tabCustomers'),
          subtitle: language === 'ur' ? 'گاہکوں کا ریکارڈ، فلٹر کی تاریخ اور سروس الرٹس' : 'Client purchase history, filter lifespan & service alerts',
        }
      case 'services':
        return {
          title: t('tabServices'),
          subtitle: language === 'ur' ? 'آر او پلانٹ اور سولر انسٹالیشن شیڈول، پرزہ جات کی کٹوتی، اور واٹس ایپ الرٹس' : 'RO plant & solar installation bookings, stock deduction & WhatsApp alerts',
        }
      default:
        return { title: '', subtitle: '' }
    }
  }

  const renderNavLinks = (onItemClick) => (
    <div className='space-y-1.5'>
      <div className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2'>
        {t('mainMenu')}
      </div>
      {userTabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              if (onItemClick) onItemClick()
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'bg-primary text-primary-foreground font-semibold shadow-subtle'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium'
            }`}
          >
            <div className='flex items-center gap-3'>
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              />
              <span className='truncate'>{tab.label}</span>
            </div>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : tab.badgeVariant === 'warning'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )

  const renderSidebarBottom = () => (
    <div className='p-3 border-t border-border space-y-3 bg-card/60'>
      {/* Language Switcher */}
      <div className='flex items-center justify-between gap-2 px-1'>
        <span className='text-[11px] text-muted-foreground font-medium'>
          {language === 'ur' ? 'زبان کا انتخاب' : 'Language'}
        </span>
        <LanguageSwitcher />
      </div>

      {/* User Card */}
      <div className='p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2.5 min-w-0'>
          <div className='w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0'>
            {currentUser.name.charAt(0)}
          </div>
          <div className='min-w-0'>
            <div className='text-xs font-semibold text-foreground truncate'>
              {currentUser.name}
            </div>
            <div className='flex items-center gap-1 mt-0.5'>
              <Badge variant={getRoleBadgeVariant(currentUser.role)} className='text-[9px] px-1.5 py-0 font-semibold'>
                {getRoleLabel(currentUser.role)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={handleLogout}
        className='w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 cursor-pointer justify-center'
        title={t('signOut')}
      >
        <LogOut className={`w-3.5 h-3.5 ${isRTL ? 'ml-1.5 rotate-180' : 'mr-1.5'}`} />
        <span>{t('signOut')}</span>
      </Button>
    </div>
  )

  const tabHeader = getTabHeader()

  return (
    <div className='h-screen max-h-screen h-[100dvh] max-h-[100dvh] bg-background text-foreground flex flex-col lg:flex-row font-sans antialiased overflow-hidden'>
      {/* Mobile Top Header */}
      <header className='lg:hidden flex-shrink-0 bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-subtle'>
        <div className='flex items-center gap-2.5'>
          <button
            type='button'
            onClick={() => setMobileMenuOpen(true)}
            className='p-2 rounded-lg bg-muted/60 hover:bg-muted text-foreground cursor-pointer'
            aria-label='Open Menu'
          >
            <Menu className='w-5 h-5' />
          </button>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center'>
              <Droplets className='w-4 h-4' />
            </div>
            <span className='font-black text-base text-foreground tracking-tight'>
              {t('brandTitle')}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* Cloud Sync Status Button */}
          <button
            type='button'
            onClick={() => setIsSyncModalOpen(true)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              !isOnline
                ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                : offlineQueueCount > 0
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
            }`}
            title={language === 'ur' ? 'کلاؤڈ سنک ہب' : 'Cloud Sync Hub'}
          >
            <Cloud className='w-3.5 h-3.5' />
            <span className='text-[10px]'>
              {!isOnline
                ? t('cloudOffline')
                : offlineQueueCount > 0
                ? t('offlineQueue', { count: offlineQueueCount })
                : t('cloudSynced')}
            </span>
          </button>
          <LanguageSwitcher />
          <Badge variant={getRoleBadgeVariant(currentUser.role)} className='text-[10px] px-2 py-0.5'>
            {getRoleLabel(currentUser.role)}
          </Badge>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className='fixed inset-0 z-50 lg:hidden flex'>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity'
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Surface */}
          <div className='relative w-72 max-w-[85vw] bg-card border-r rtl:border-r-0 rtl:border-l border-border h-full max-h-[100dvh] flex flex-col shadow-2xl z-10 overflow-hidden'>
            {/* Drawer Header */}
            <div className='flex-shrink-0 p-4 border-b border-border flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center'>
                  <Droplets className='w-5 h-5' />
                </div>
                <div>
                  <div className='font-black text-base text-foreground tracking-tight'>
                    {t('brandTitle')}
                  </div>
                  <div className='text-[10px] text-muted-foreground'>
                    {t('brandTagline')}
                  </div>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setMobileMenuOpen(false)}
                className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Drawer Links */}
            <div className='flex-1 p-3 overflow-y-auto overscroll-contain min-h-0'>
              {renderNavLinks(() => setMobileMenuOpen(false))}
            </div>

            {/* Drawer Footer */}
            <div className='flex-shrink-0 mt-auto'>
              {renderSidebarBottom()}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar (Locked to Viewport) */}
      <aside className='hidden lg:flex w-64 flex-col border-r rtl:border-r-0 rtl:border-l border-border bg-card h-full max-h-screen flex-shrink-0 select-none z-20 overflow-hidden'>
        {/* Brand Header */}
        <div className='flex-shrink-0 p-4 border-b border-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0'>
              <Droplets className='w-5 h-5' />
            </div>
            <div className='min-w-0'>
              <div className='font-black text-lg text-foreground tracking-tight truncate'>
                {t('brandTitle')}
              </div>
              <div className='text-[11px] text-muted-foreground truncate'>
                {t('waterPurificationSystem')}
              </div>
            </div>
          </div>

          {/* System Online Status Banner */}
          <div className='mt-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium'>
            <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0' />
            <span className='truncate'>{t('systemOnline')}</span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className='flex-1 p-3 overflow-y-auto overscroll-contain scrollbar-none min-h-0'>
          {renderNavLinks()}
        </div>

        {/* Sidebar Footer */}
        <div className='flex-shrink-0 mt-auto'>
          {renderSidebarBottom()}
        </div>
      </aside>

      {/* Main Content Workspace (Independent Scroll Container) */}
      <div className='flex-1 flex flex-col min-w-0 h-full max-h-screen overflow-hidden bg-background'>
        {/* Top Context Bar (Pinned) */}
        <header className='hidden lg:flex h-16 flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-md px-6 lg:px-8 items-center justify-between z-10 shadow-subtle'>
          <div>
            <h1 className='text-base font-bold text-foreground'>
              {tabHeader.title}
            </h1>
            <p className='text-xs text-muted-foreground'>
              {tabHeader.subtitle}
            </p>
          </div>

          <div className='flex items-center gap-3'>
            {/* Cloud Sync Status Pill Button */}
            <button
              type='button'
              onClick={() => setIsSyncModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                !isOnline
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                  : offlineQueueCount > 0
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
              title={
                language === 'ur'
                  ? 'کلاؤڈ ڈیٹا بیس اور ویب سائٹ آرڈرز سنک'
                  : 'Cloud Database & Website Orders Sync'
              }
            >
              <div className='relative flex items-center justify-center'>
                <Cloud className='w-4 h-4' />
                <span
                  className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                    !isOnline
                      ? 'bg-rose-500'
                      : offlineQueueCount > 0
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
              <span>
                {!isOnline
                  ? t('cloudOffline')
                  : offlineQueueCount > 0
                  ? t('offlineQueue', { count: offlineQueueCount })
                  : t('cloudSynced')}
              </span>
              <span className='text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono'>
                {t('syncDatabase')}
              </span>
            </button>

            {/* Quick Context Metrics */}
            <div className='flex items-center gap-3 text-xs text-muted-foreground font-medium bg-muted/40 px-3.5 py-1.5 rounded-lg border border-border'>
            {currentUser.role === 'admin' && (
              <>
                <span>
                  {t('catalogSummary')}: <strong className='text-foreground font-mono'>{inventory.length}</strong> {t('skus')}
                </span>
                <span className='text-border'>•</span>
                <span>
                  {t('clients')}: <strong className='text-foreground font-mono'>{customers.length}</strong>
                </span>
                <span className='text-border'>•</span>
                <span>
                  {t('orders')}: <strong className='text-foreground font-mono'>{sales.length}</strong>
                </span>
                {pendingWebOrdersCount > 0 && (
                  <>
                    <span className='text-border'>•</span>
                    <span className='text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5'>
                      <span className='w-2 h-2 rounded-full bg-amber-500 animate-pulse'></span>
                      <strong className='font-mono'>{pendingWebOrdersCount}</strong> {language === 'ur' ? 'نئے ویب آرڈرز' : 'Web Orders'}
                    </span>
                  </>
                )}
                {activeBookingsCount > 0 && (
                  <>
                    <span className='text-border'>•</span>
                    <span className='text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1'>
                      <strong className='font-mono'>{activeBookingsCount}</strong> {language === 'ur' ? 'فعال سروسز' : 'Services'}
                    </span>
                  </>
                )}
              </>
            )}
            {currentUser.role === 'cashier' && (
              <>
                <span>
                  {t('productsInStock')}: <strong className='text-foreground font-mono'>{inventory.filter((p) => p.quantity > 0).length}</strong>
                </span>
                <span className='text-border'>•</span>
                <span className='text-emerald-600 font-medium'>
                  {t('posTerminalReady')}
                </span>
                {pendingWebOrdersCount > 0 && (
                  <>
                    <span className='text-border'>•</span>
                    <span className='text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5'>
                      <span className='w-2 h-2 rounded-full bg-amber-500 animate-pulse'></span>
                      <strong className='font-mono'>{pendingWebOrdersCount}</strong> {language === 'ur' ? 'نئے آرڈرز' : 'New Orders'}
                    </span>
                  </>
                )}
              </>
            )}
            {currentUser.role === 'technician' && (
              <>
                <span>{t('fieldDispatchActive')}</span>
                <span className='text-border'>•</span>
                <span className='text-amber-600 font-medium flex items-center gap-1.5'>
                  <strong className='font-mono'>{activeBookingsCount}</strong> {language === 'ur' ? 'فعال فیلڈ وزٹس' : 'Active Visits'}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

        {/* Main Body (Dedicated Scroll Container) */}
        <main className='flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overscroll-contain'>
          {/* Admin Only: Financial Dashboard */}
          {activeTab === 'dashboard' &&
            (currentUser.role === 'admin' ? (
              <SalesDashboard sales={sales} webOrders={webOrders} />
            ) : (
              <div className='p-8 bg-destructive/10 border border-destructive/20 rounded-xl text-center text-destructive font-semibold'>
                Access Denied: Financial revenue and analytics require Administrator privileges.
              </div>
            ))}

          {/* Admin and Cashier: Billing */}
          {activeTab === 'billing' &&
            (['admin', 'cashier'].includes(currentUser.role) ? (
              <BillingManager
                inventory={inventory}
                updateInventory={updateInventory}
                customers={customers}
                updateCustomers={updateCustomers}
                addSale={addSale}
              />
            ) : (
              <div className='p-8 bg-destructive/10 border border-destructive/20 rounded-xl text-center text-destructive font-semibold'>
                Access Denied: Billing terminal is restricted to Cashiers and Administrators.
              </div>
            ))}

          {/* Admin and Cashier: Web Orders Inbox */}
          {activeTab === 'weborders' &&
            (['admin', 'cashier'].includes(currentUser.role) ? (
              <WebOrdersManager
                webOrders={webOrders}
                updateWebOrders={updateWebOrders}
                inventory={inventory}
                updateInventory={updateInventory}
                customers={customers}
                updateCustomers={updateCustomers}
                addSale={addSale}
              />
            ) : (
              <div className='p-8 bg-destructive/10 border border-destructive/20 rounded-xl text-center text-destructive font-semibold'>
                Access Denied: Web Orders Inbox is restricted to Cashiers and Administrators.
              </div>
            ))}

          {/* Admin and Cashier: Inventory */}
          {activeTab === 'inventory' &&
            (['admin', 'cashier'].includes(currentUser.role) ? (
              <InventoryManager
                inventory={inventory}
                updateInventory={updateInventory}
                toggleProductOnline={toggleProductOnline}
                userRole={currentUser.role}
              />
            ) : (
              <div className='p-8 bg-destructive/10 border border-destructive/20 rounded-xl text-center text-destructive font-semibold'>
                Access Denied: Inventory access is restricted.
              </div>
            ))}

          {/* Admin Only: Customer Directory */}
          {activeTab === 'customers' &&
            (currentUser.role === 'admin' ? (
              <CustomerManager
                customers={customers}
                updateCustomers={updateCustomers}
              />
            ) : (
              <div className='p-8 bg-destructive/10 border border-destructive/20 rounded-xl text-center text-destructive font-semibold'>
                Access Denied: Full Customer CRM is restricted to Administrators.
              </div>
            ))}

          {/* Admin and Technician: Service & Installation Engine */}
          {activeTab === 'services' &&
            (['admin', 'technician'].includes(currentUser.role) ? (
              <ServiceManager
                bookings={bookings}
                updateBookings={updateBookings}
                inventory={inventory}
                updateInventory={updateInventory}
                customers={customers}
                updateCustomers={updateCustomers}
                userRole={currentUser.role}
              />
            ) : (
              <div className='p-8 bg-destructive/10 border border-destructive/20 rounded-xl text-center text-destructive font-semibold'>
                Access Denied: Service & Installation management is reserved for Technicians and Administrators.
              </div>
            ))}
        </main>

        {/* Footer */}
        <footer className='bg-card border-t border-border mt-auto py-3 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2'>
            <div className='flex items-center gap-2'>
              <span className='font-semibold text-foreground'>{t('brandTitle')}</span>
              <span className='text-border'>•</span>
              <span>{t('brandTagline')}</span>
              <span className='text-border'>•</span>
              <span>{currentUser.name}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='inline-block w-2 h-2 rounded-full bg-emerald-500'></span>
              <span>{t('systemOnline')}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Cloud Sync & Storefront Hub Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        inventory={inventory}
        updateInventory={updateInventory}
        webOrders={webOrders}
        updateWebOrders={updateWebOrders}
        customers={customers}
        updateCustomers={updateCustomers}
        bookings={bookings}
        updateBookings={updateBookings}
        sales={sales}
      />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
