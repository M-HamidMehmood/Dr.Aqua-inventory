import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import DigitalCheckoutModal from './pos/DigitalCheckoutModal'
import ReceiptPreviewModal from './pos/ReceiptPreviewModal'
import RegisterClosingModal from './pos/RegisterClosingModal'
import { mockInventoryRecords } from '../data/mock/inventory.mock'
import { mockCustomerRecords } from '../data/mock/customers.mock'
import { mockInitialCart } from '../data/mock/pos.mock'
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Barcode,
  QrCode,
  DollarSign,
  User,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Droplet,
  Tag,
  Receipt,
  RotateCcw,
  Wrench,
} from 'lucide-react'

export default function BillingManager({
  inventory = [],
  updateInventory,
  customers = [],
  updateCustomers,
  addSale,
}) {
  // Use inventory/customers with fallback to rich mock data
  const productCatalog = inventory && inventory.length > 0 ? inventory : mockInventoryRecords
  const customerList = customers && customers.length > 0 ? customers : mockCustomerRecords

  // POS State (prepopulated with 3 realistic water purification items)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('101') // Pre-select Fatima Ali
  const [cartItems, setCartItems] = useState(mockInitialCart)
  const [discountAmount, setDiscountAmount] = useState(0)

  // Technician Service Fee Toggle (+ PKR 1,500)
  const [includeTechnicianFee, setIncludeTechnicianFee] = useState(true)
  const technicianFeeAmount = includeTechnicianFee ? 1500 : 0

  // Modals state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false)
  const [lastCompletedSale, setLastCompletedSale] = useState(null)

  // Shift financial totals
  const [shiftCashSales, setShiftCashSales] = useState(48500)
  const [shiftDigitalSales, setShiftDigitalSales] = useState(86000)
  const [shiftOrdersCount, setShiftOrdersCount] = useState(6)

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('')
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Filter Catalog
  const filteredProducts = productCatalog.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchQuery))
    return matchesCategory && matchesSearch
  })

  // Cart operations
  const handleAddToCart = (product) => {
    if (product.quantity <= 0) {
      alert('This item is currently out of stock!')
      return
    }

    const existingIndex = cartItems.findIndex((item) => item.id === product.id)
    if (existingIndex >= 0) {
      const existing = cartItems[existingIndex]
      if (existing.qty + 1 > product.quantity) {
        alert(`Cannot add more. Only ${product.quantity} units in stock.`)
        return
      }
      const updated = [...cartItems]
      updated[existingIndex] = { ...existing, qty: existing.qty + 1 }
      setCartItems(updated)
    } else {
      setCartItems([...cartItems, { ...product, qty: 1 }])
    }
  }

  const handleUpdateQty = (productId, delta) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === productId) {
          const newQty = item.qty + delta
          if (newQty <= 0) return null
          const prod = productCatalog.find((p) => p.id === productId)
          if (prod && newQty > prod.quantity) {
            alert(`Maximum available stock is ${prod.quantity} units.`)
            return item
          }
          return { ...item, qty: newQty }
        }
        return item
      })
      .filter(Boolean)
    setCartItems(updated)
  }

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter((i) => i.id !== productId))
  }

  const handleClearCart = () => {
    if (window.confirm('Clear all items from current cart?')) {
      setCartItems([])
      setDiscountAmount(0)
    }
  }

  // Financial Calculations
  const itemsSubtotal = cartItems.reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0)
  const subtotalWithFee = itemsSubtotal + technicianFeeAmount
  const discount = Math.min(subtotalWithFee, Math.max(0, parseFloat(discountAmount) || 0))
  const grandTotal = Math.max(0, subtotalWithFee - discount)

  // Selected customer object
  const activeCustomer =
    customerList.find((c) => c.id === Number(selectedCustomerId)) || null

  // Process Completed Payment
  const handlePaymentSuccess = (paymentDetails) => {
    const invoiceNum = `INV-${Date.now()}`
    const salePayload = {
      invoice: invoiceNum,
      customerId: selectedCustomerId ? Number(selectedCustomerId) : 0,
      customerName: activeCustomer ? activeCustomer.name : 'Walk-in Retail Client',
      items: cartItems,
      subtotal: itemsSubtotal,
      technicianFee: technicianFeeAmount,
      discount,
      total: grandTotal,
      paymentMethod: paymentDetails.method === 'cash' ? 'Cash at Counter' : 'Raast Instant QR',
      transactionRef: paymentDetails.transactionRef,
      cashReceived: paymentDetails.cashReceived,
      changeDue: paymentDetails.changeDue,
      date: new Date().toISOString(),
    }

    // 1. Commit Sale to Root State
    if (addSale) addSale(salePayload)

    // 2. Decrement Inventory in Root State
    if (updateInventory) {
      const updatedInventory = productCatalog.map((prod) => {
        const cartMatch = cartItems.find((ci) => ci.id === prod.id)
        if (cartMatch) {
          const remaining = Math.max(0, prod.quantity - cartMatch.qty)
          return {
            ...prod,
            quantity: remaining,
            shopStock: Math.round(remaining * 0.75),
            webStock: Math.round(remaining * 0.25),
          }
        }
        return prod
      })
      updateInventory(updatedInventory)
    }

    // 3. Update Customer History in Root State
    if (updateCustomers && selectedCustomerId) {
      const updatedCustomers = customerList.map((cust) => {
        if (cust.id === Number(selectedCustomerId)) {
          return {
            ...cust,
            daysSinceLastService: 0,
            lastServiceDate: new Date().toISOString().slice(0, 10),
            serviceHistory: [
              {
                id: `SRV-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                technician: 'POS Counter Team',
                serviceType: 'POS Counter Sale',
                partsReplaced: cartItems.map((ci) => ci.name),
                feedTds: cust.feedTdsPpm || 400,
                permeateTds: cust.permeateTdsPpm || 24,
                costPkr: grandTotal,
                status: 'Completed',
              },
              ...(cust.serviceHistory || []),
            ],
          }
        }
        return cust
      })
      updateCustomers(updatedCustomers)
    }

    // Update Shift Totals
    if (paymentDetails.method === 'cash') {
      setShiftCashSales((prev) => prev + grandTotal)
    } else {
      setShiftDigitalSales((prev) => prev + grandTotal)
    }
    setShiftOrdersCount((prev) => prev + 1)

    // Open Receipt Preview and clear cart
    setLastCompletedSale(salePayload)
    setIsReceiptModalOpen(true)
    setCartItems([])
    setDiscountAmount(0)
    showToast(`Invoice ${invoiceNum} generated successfully!`)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[640px] space-y-4 font-sans text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base font-outfit text-foreground">
              Point of Sale (POS) Billing & Invoicing Terminal
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              Terminal 01 • Main Branch
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Fast barcode catalog scanning, instant Raast QR payments, and official A4 / thermal receipts.
          </p>
        </div>

        {/* Shift Z-Report Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsClosingModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-bold font-outfit rounded-xl hover:border-border"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Shift Z-Report</span>
          </Button>
        </div>
      </div>

      {/* Main Dual-Pane POS Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Pane: Visual Product Catalog (7 cols) */}
        <div className="lg:col-span-7 bg-card rounded-2xl border border-border/80 shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          {/* Catalog Toolbar: Search & Barcode Scan */}
          <div className="space-y-3 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Scan barcode, enter SKU, or product title..."
                  className="pl-9 h-9 text-xs rounded-xl bg-muted/20 font-sans"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs gap-1.5 rounded-xl text-muted-foreground font-mono"
                title="Barcode Scanner Mode Active"
              >
                <Barcode className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Scan</span>
              </Button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'Residential RO', label: 'Residential RO' },
                { id: 'Commercial Plants', label: 'Commercial' },
                { id: 'Filters & Cartridges', label: 'Cartridges' },
                { id: 'Membranes & Vessels', label: 'Membranes' },
                { id: 'Spare Parts', label: 'Pumps & Parts' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap text-xs ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <ScrollArea className="flex-1 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredProducts.map((product) => {
                const inStock = product.quantity > 0
                const isLow = product.quantity < (product.minThreshold || 10) && inStock

                return (
                  <div
                    key={product.id}
                    onClick={() => inStock && handleAddToCart(product)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                      !inStock
                        ? 'opacity-60 bg-muted/20 border-border/40 cursor-not-allowed'
                        : 'bg-card hover:bg-muted/30 hover:border-primary/40 hover:shadow-sm border-border/70'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-muted-foreground font-bold">
                          {product.sku}
                        </span>
                        <Badge
                          variant={!inStock ? 'destructive' : isLow ? 'warning' : 'outline'}
                          className="text-[9px] font-mono font-bold px-1.5 py-0"
                        >
                          {!inStock ? '0 Left' : `${product.quantity} Avail`}
                        </Badge>
                      </div>

                      <div className="font-bold text-xs text-foreground font-outfit line-clamp-2 leading-tight">
                        {product.name}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <div className="font-mono font-bold text-xs text-foreground">
                        Rs. {product.price?.toLocaleString()}
                      </div>
                      <Button
                        size="sm"
                        disabled={!inStock}
                        className="h-6 px-2 text-[10px] font-bold rounded-lg gap-1"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          {/* Catalog Footer Stats */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Showing {filteredProducts.length} catalogue items</span>
            <span className="font-mono">Sync: dr-aqua-project.vercel.app</span>
          </div>
        </div>

        {/* Right Pane: Sticky Dynamic Cart (5 cols) */}
        <div className="lg:col-span-5 bg-card rounded-2xl border border-border/80 shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          {/* Cart Header & Customer Selector */}
          <div className="space-y-3 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm font-outfit text-foreground">
                  Order Cart ({cartItems.length})
                </span>
              </div>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Customer Picker */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <User className="w-3 h-3" /> Billed Customer:
                </span>
                {activeCustomer && (
                  <span className="text-[10px] text-primary font-mono font-semibold">
                    {activeCustomer.sector}
                  </span>
                )}
              </div>
              <Select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="">Walk-in Retail Client (Anonymous)</option>
                {customerList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.sector} • {c.contact})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Cart Items List */}
          <ScrollArea className="flex-1 py-2 divide-y divide-border/50">
            {cartItems.length === 0 ? (
              <div className="py-14 text-center text-muted-foreground space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <div className="text-xs font-semibold">Cart is currently empty</div>
                <div className="text-[11px]">Click items from the catalog on the left to begin billing.</div>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground font-outfit truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Rs. {item.price?.toLocaleString()} each
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-0.5 border border-border/60">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, -1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-foreground text-xs">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Item Total */}
                  <div className="w-20 text-right font-mono font-bold text-foreground">
                    Rs. {(item.price * item.qty).toLocaleString()}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </ScrollArea>

          {/* Cart Pricing Summary & Checkout Actions */}
          <div className="pt-3 border-t border-border/70 space-y-3">
            {/* Technician Fee Toggle */}
            <div className="p-2.5 bg-muted/30 rounded-xl border border-border/60 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeTechnicianFee}
                  onChange={(e) => setIncludeTechnicianFee(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-primary" />
                  <span>Installation / Service Visit Fee:</span>
                </span>
              </label>
              <span className="font-mono font-bold text-foreground">
                {includeTechnicianFee ? '+ PKR 1,500' : 'PKR 0'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono text-foreground font-semibold">
                  PKR {itemsSubtotal.toLocaleString()}
                </span>
              </div>

              {/* Discount Input Row */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-muted-foreground" />
                  <span>Discount (PKR):</span>
                </span>
                <Input
                  type="number"
                  min="0"
                  max={subtotalWithFee}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-24 h-7 text-right font-mono text-xs"
                />
              </div>

              <div className="flex justify-between">
                <span>GST Tax (Exempted):</span>
                <span className="font-mono text-foreground">Rs. 0</span>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-baseline justify-between text-foreground">
                <span className="text-sm font-bold font-outfit">Payable Total:</span>
                <span className="text-xl font-bold font-mono text-cyan-700 font-outfit">
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Big Checkout CTAs */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                disabled={cartItems.length === 0}
                onClick={() => setIsCheckoutModalOpen(true)}
                className="h-11 rounded-xl text-xs font-bold font-outfit gap-1.5"
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Cash Counter</span>
              </Button>

              <Button
                disabled={cartItems.length === 0}
                onClick={() => setIsCheckoutModalOpen(true)}
                className="h-11 rounded-xl text-xs font-bold font-outfit gap-1.5 shadow-md"
              >
                <QrCode className="w-4 h-4" />
                <span>Raast / Digital QR</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Screen 17: Digital QR Checkout Modal */}
      <DigitalCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        totalAmount={grandTotal}
        customer={activeCustomer}
        onConfirmPayment={handlePaymentSuccess}
      />

      {/* Screen 16: Receipt & A4 PDF Preview Modal */}
      <ReceiptPreviewModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        sale={lastCompletedSale}
        customer={activeCustomer}
      />

      {/* Screen 18: Shift Register Closing Modal */}
      <RegisterClosingModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        cashSales={shiftCashSales}
        digitalSales={shiftDigitalSales}
        totalOrdersCount={shiftOrdersCount}
      />
    </div>
  )
}
