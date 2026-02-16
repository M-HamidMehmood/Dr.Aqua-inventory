import React, { useEffect, useState } from 'react'
import BillingManager from './components/BillingManager.jsx'
import CustomerManager from './components/CustomerManager.jsx'
import InventoryManager from './components/InventoryManager.jsx'
import SalesDashboard from './components/SalesDashboard.jsx'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [inventory, setInventory] = useState([])
  const [customers, setCustomers] = useState([])
  const [sales, setSales] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedInventory = localStorage.getItem('draqua-inventory')
    const savedCustomers = localStorage.getItem('draqua-customers')
    const savedSales = localStorage.getItem('draqua-sales')

    if (savedInventory) setInventory(JSON.parse(savedInventory))
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers))
    if (savedSales) setSales(JSON.parse(savedSales))

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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'billing', label: 'Billing', icon: '🧾' },
    { id: 'customers', label: 'Customers', icon: '👥' },
  ]

  if (!isLoaded) {
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='text-gray-600'>Loading...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <header className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-4'>
              <img
                src='/images/logo.png'
                alt='Dr. Aqua Logo'
                className='h-12 w-auto'
              />
              <span className='text-gray-400'>|</span>
              <h1 className='text-lg font-semibold text-gray-900'>
                Business Management
              </h1>
            </div>
            <div className='flex items-center gap-4 text-sm text-gray-600'>
              <span>Products: {inventory.length}</span>
              <span>•</span>
              <span>Customers: {customers.length}</span>
              <span>•</span>
              <span>Orders: {sales.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex space-x-1'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className='mr-2'>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
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
      </main>

      {/* Footer */}
      <footer className='bg-white border-t border-gray-200 mt-auto'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <p className='text-center text-sm text-gray-500'>
            Dr. Aqua Business Management System • Data stored locally in browser
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
