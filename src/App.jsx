import React, { useEffect, useState } from 'react'
import BillingManager from './components/BillingManager.jsx'
import CustomerManager from './components/CustomerManager.jsx'
import InventoryManager from './components/InventoryManager.jsx'
import SalesDashboard from './components/SalesDashboard.jsx'
import WebOrdersManager from './components/weborders/WebOrdersManager.jsx'
import DispatchBoardManager from './components/dispatch/DispatchBoardManager.jsx'
import SettingsManager from './components/settings/SettingsManager.jsx'
import AuthPortal from './components/auth/AuthPortal.jsx'
import DrAquaLogo from './components/ui/DrAquaLogo.jsx'
import NotificationsPopover from './components/analytics/NotificationsPopover.jsx'
import { Badge } from './components/ui/badge.jsx'
import { Button } from './components/ui/button.jsx'
import { initialMockRegistry } from './data/mock/index.js'
import { LogOut, User, Building2 } from 'lucide-react'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [inventory, setInventory] = useState([])
  const [customers, setCustomers] = useState([])
  const [sales, setSales] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('draqua-user')
      const savedInventory = localStorage.getItem('draqua-inventory')
      const savedCustomers = localStorage.getItem('draqua-customers')
      const savedSales = localStorage.getItem('draqua-sales')

      if (savedUser) setCurrentUser(JSON.parse(savedUser))
      setInventory(savedInventory ? JSON.parse(savedInventory) : initialMockRegistry.products)
      setCustomers(savedCustomers ? JSON.parse(savedCustomers) : initialMockRegistry.customers)
      setSales(savedSales ? JSON.parse(savedSales) : initialMockRegistry.sales)
    } catch (e) {
      console.error('Error loading localStorage state:', e)
      setInventory(initialMockRegistry.products)
      setCustomers(initialMockRegistry.customers)
      setSales(initialMockRegistry.sales)
    }

    setIsLoaded(true)
  }, [])

  // Save to localStorage when state changes
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

  const updateInventory = (newInventory) => setInventory(newInventory)
  const updateCustomers = (newCustomers) => setCustomers(newCustomers)
  const addSale = (sale) => setSales((prev) => [...prev, sale])

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    if (user.role === 'cashier') setActiveTab('billing')
    else if (user.role === 'technician') setActiveTab('customers')
    else setActiveTab('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('draqua-user')
    setCurrentUser(null)
  }

  // Base tabs
  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin'] },
    { id: 'inventory', label: 'Inventory', icon: '📦', roles: ['admin', 'cashier'] },
    { id: 'billing', label: 'POS Billing', icon: '🧾', roles: ['admin', 'cashier'] },
    { id: 'customers', label: 'Customers & Radar', icon: '👥', roles: ['admin', 'cashier', 'technician'] },
    { id: 'web_orders', label: 'Web Orders', icon: '🌐', roles: ['admin', 'cashier'] },
    { id: 'dispatch', label: 'Field Dispatch', icon: '🚐', roles: ['admin', 'technician'] },
    { id: 'settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
  ]

  const visibleTabs = allTabs.filter(
    (tab) => !currentUser || tab.roles.includes(currentUser.role)
  )

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-semibold text-muted-foreground font-outfit">Loading Dr. Aqua Hub...</div>
        </div>
      </div>
    )
  }

  // If not authenticated, render the Enterprise Split-Screen Auth Portal (Screens 1 & 2)
  if (!currentUser) {
    return <AuthPortal onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-card border-b border-border/80 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Company Title */}
            <div className="flex items-center gap-3">
              <DrAquaLogo size="sm" />
              <div className="border-l border-border pl-3 hidden sm:block">
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-cyan-600" />
                  <span>{currentUser.activeBranch || currentUser.branch}</span>
                </div>
              </div>
            </div>

            {/* User Profile & Notifications */}
            <div className="flex items-center gap-3">
              {/* Screen 4: Notifications Popover */}
              <NotificationsPopover
                onActionClick={(alert) => {
                  if (alert.type === 'low_stock') setActiveTab('inventory')
                  else if (alert.type === 'radar_due') setActiveTab('customers')
                  else if (alert.type === 'dispatch_delay') setActiveTab('customers')
                }}
              />

              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-foreground font-outfit">{currentUser.name}</span>
                <span className="text-[10px] text-muted-foreground">{currentUser.email}</span>
              </div>
              <Badge
                variant={currentUser.role === 'admin' ? 'default' : currentUser.role === 'cashier' ? 'accent' : 'warning'}
                className="capitalize text-[11px] font-bold"
              >
                {currentUser.role}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-card border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-semibold font-outfit transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'dashboard' && <SalesDashboard sales={sales} />}
        {activeTab === 'inventory' && (
          <InventoryManager
            inventory={inventory}
            updateInventory={updateInventory}
          />
        )}
        {activeTab === 'billing' && (
          <BillingManager
            inventory={inventory}
            updateInventory={updateInventory}
            customers={customers}
            updateCustomers={updateCustomers}
            addSale={addSale}
          />
        )}
        {activeTab === 'customers' && (
          <CustomerManager
            customers={customers}
            updateCustomers={updateCustomers}
          />
        )}
        {activeTab === 'web_orders' && <WebOrdersManager />}
        {activeTab === 'dispatch' && <DispatchBoardManager inventory={inventory} />}
        {activeTab === 'settings' && <SettingsManager />}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/60 py-3 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span>Dr. Aqua Omni-Management Hub • Bahawalpur Operations</span>
          <span className="text-muted-foreground">Local Session Encrypted (AES-256)</span>
        </div>
      </footer>
    </div>
  )
}

export default App
