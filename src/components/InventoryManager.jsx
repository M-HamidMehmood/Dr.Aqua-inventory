import React, { useState } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import AddProductDrawer from './inventory/AddProductDrawer'
import QuickRestockModal from './inventory/QuickRestockModal'
import BarcodeLabelModal from './inventory/BarcodeLabelModal'
import StockAuditDrawer from './inventory/StockAuditDrawer'
import { mockInventoryRecords } from '../data/mock/inventory.mock'
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Boxes,
  Zap,
  Printer,
  History,
  Edit2,
  Trash2,
  Globe,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
} from 'lucide-react'

export default function InventoryManager({ inventory = [], onUpdateInventory }) {
  // Use inventory from props or fallback to complete mock list
  const [items, setItems] = useState(() => {
    if (inventory && inventory.length > 0) {
      // Merge mock enrichment with local items if available
      return mockInventoryRecords
    }
    return mockInventoryRecords
  })

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal / Drawer Active States
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
  const [restockProduct, setRestockProduct] = useState(null)

  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false)
  const [labelProduct, setLabelProduct] = useState(null)

  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false)
  const [auditProduct, setAuditProduct] = useState(null)

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'critical' && item.quantity < item.minThreshold && item.quantity > 0) ||
      (statusFilter === 'depleted' && item.quantity === 0) ||
      (statusFilter === 'in_stock' && item.quantity >= item.minThreshold)

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Handlers for Add/Edit
  const handleSaveProduct = (savedProduct) => {
    const exists = items.some((i) => i.id === savedProduct.id)
    let updatedList
    if (exists) {
      updatedList = items.map((i) => (i.id === savedProduct.id ? savedProduct : i))
      showToast(`Updated product specifications: ${savedProduct.sku}`)
    } else {
      updatedList = [savedProduct, ...items]
      showToast(`Registered new product: ${savedProduct.sku}`)
    }
    setItems(updatedList)
    if (onUpdateInventory) onUpdateInventory(updatedList)
  }

  // Handler for Quick Restock
  const handleConfirmRestock = (productId, newTotal, logEntry) => {
    const updatedList = items.map((i) => {
      if (i.id === productId) {
        return {
          ...i,
          quantity: newTotal,
          shopStock: Math.round(newTotal * 0.75),
          webStock: Math.round(newTotal * 0.25),
          auditTrail: [logEntry, ...(i.auditTrail || [])],
        }
      }
      return i
    })
    setItems(updatedList)
    if (onUpdateInventory) onUpdateInventory(updatedList)
    showToast(`Stock updated: ${newTotal} units available`)
  }

  // Handler for Delete
  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to remove this product from inventory?')) {
      const updatedList = items.filter((i) => i.id !== productId)
      setItems(updatedList)
      if (onUpdateInventory) onUpdateInventory(updatedList)
      showToast('Product removed from inventory.')
    }
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

      {/* Top Controls & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
        {/* Left: Search & Filter Chips */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search SKU, name, or bay..."
              className="pl-9 h-9 text-xs rounded-xl bg-muted/20"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-44">
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="h-9 text-xs"
            >
              <option value="all">All Categories</option>
              <option value="Residential RO">Residential RO</option>
              <option value="Commercial Plants">Commercial Plants</option>
              <option value="Filters & Cartridges">Filters & Cartridges</option>
              <option value="Membranes & Vessels">Membranes & Vessels</option>
              <option value="Spare Parts">Booster Pumps & Parts</option>
            </Select>
          </div>

          {/* Status Dropdown */}
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="h-9 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="critical">🚨 Low Stock (&lt;10)</option>
              <option value="depleted">❌ Depleted (0)</option>
              <option value="in_stock">🟢 In Stock</option>
            </Select>
          </div>
        </div>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csv = items
                .map((i) => `${i.sku},"${i.name}",${i.price},${i.quantity}`)
                .join('\n')
              const blob = new Blob([`SKU,Name,Price,Stock\n${csv}`], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `inventory-report-${Date.now()}.csv`
              a.click()
            }}
            className="h-9 gap-1.5 text-xs rounded-xl"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingProduct(null)
              setIsAddDrawerOpen(true)
            }}
            className="h-9 gap-1.5 text-xs font-bold font-outfit rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Main 85vh Data Table Grid */}
      <div className="flex-1 bg-card rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-28 text-xs font-bold uppercase font-outfit">SKU</TableHead>
                <TableHead className="min-w-[240px] text-xs font-bold uppercase font-outfit">Product Details</TableHead>
                <TableHead className="w-36 text-xs font-bold uppercase font-outfit">Category</TableHead>
                <TableHead className="w-28 text-right text-xs font-bold uppercase font-outfit">Price (PKR)</TableHead>
                <TableHead className="w-32 text-center text-xs font-bold uppercase font-outfit">Stock Level</TableHead>
                <TableHead className="w-24 text-center text-xs font-bold uppercase font-outfit">Omnichannel</TableHead>
                <TableHead className="w-28 text-center text-xs font-bold uppercase font-outfit">Vercel Sync</TableHead>
                <TableHead className="w-12 text-right text-xs font-bold uppercase font-outfit"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border/60">
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                    <Boxes className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                    <div className="text-sm font-semibold">No inventory products found</div>
                    <div className="text-xs">Adjust your search criteria or register a new item.</div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => {
                  const isLowStock = item.quantity < item.minThreshold && item.quantity > 0
                  const isDepleted = item.quantity === 0
                  const margin =
                    item.price > 0
                      ? Math.round(((item.price - (item.costPrice || 0)) / item.price) * 100)
                      : 0

                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors group cursor-default"
                    >
                      {/* SKU & Shelf Bay */}
                      <TableCell className="font-mono text-xs font-bold">
                        <div className="text-foreground tracking-tight">{item.sku}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">
                          {item.shelfLocation}
                        </div>
                      </TableCell>

                      {/* Name & Supplier */}
                      <TableCell>
                        <div className="font-bold text-xs text-foreground font-outfit line-clamp-1">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                          {item.supplier}
                        </div>
                      </TableCell>

                      {/* Category Badge */}
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {item.category}
                        </Badge>
                      </TableCell>

                      {/* Price & Margin */}
                      <TableCell className="text-right font-mono">
                        <div className="text-xs font-bold text-foreground">
                          Rs. {item.price?.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Margin: <span className="font-semibold text-emerald-600">{margin}%</span>
                        </div>
                      </TableCell>

                      {/* Stock Level Status */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge
                            variant={
                              isDepleted
                                ? 'destructive'
                                : isLowStock
                                ? 'warning'
                                : 'success'
                            }
                            className="font-mono text-[10px] font-bold px-2 py-0.5"
                          >
                            {isDepleted
                              ? 'Depleted (0)'
                              : isLowStock
                              ? `Low Stock (${item.quantity})`
                              : `${item.quantity} In Stock`}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Omnichannel Allocation */}
                      <TableCell className="text-center font-mono text-[11px] text-muted-foreground">
                        <span>{item.shopStock || Math.round(item.quantity * 0.75)} Shop</span>
                        <span className="text-border mx-1">|</span>
                        <span>{item.webStock || Math.round(item.quantity * 0.25)} Web</span>
                      </TableCell>

                      {/* Vercel Live Sync Status */}
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 border border-cyan-400/20">
                          <Globe className="w-2.5 h-2.5" />
                          <span>Live Sync</span>
                        </div>
                      </TableCell>

                      {/* Dropdown Menu Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setRestockProduct(item)
                                setIsRestockModalOpen(true)
                              }}
                              className="gap-2"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span>Quick Restock (+/-)</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                setLabelProduct(item)
                                setIsLabelModalOpen(true)
                              }}
                              className="gap-2"
                            >
                              <Printer className="w-3.5 h-3.5 text-primary" />
                              <span>Print Thermal Label</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                setAuditProduct(item)
                                setIsAuditDrawerOpen(true)
                              }}
                              className="gap-2"
                            >
                              <History className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Stock Audit Log</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setEditingProduct(item)
                                setIsAddDrawerOpen(true)
                              }}
                              className="gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Edit Specifications</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(item.id)}
                              className="gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Product</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-border/70 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium">
            <span>Showing</span>
            <strong className="text-foreground">
              {filteredItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(currentPage * pageSize, filteredItems.length)}
            </strong>
            <span>of</span>
            <strong className="text-foreground">{filteredItems.length}</strong>
            <span>products</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-mono text-xs font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Screen 7: Add / Edit Product Drawer */}
      <AddProductDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => {
          setIsAddDrawerOpen(false)
          setEditingProduct(null)
        }}
        productToEdit={editingProduct}
        onSaveProduct={handleSaveProduct}
      />

      {/* Screen 8: Quick Restock Modal */}
      <QuickRestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false)
          setRestockProduct(null)
        }}
        product={restockProduct}
        onConfirmRestock={handleConfirmRestock}
      />

      {/* Screen 9: Barcode & Thermal Shelf Label Printing Modal */}
      <BarcodeLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => {
          setIsLabelModalOpen(false)
          setLabelProduct(null)
        }}
        product={labelProduct}
      />

      {/* Screen 10: Stock Movement & Audit Trail Drawer */}
      <StockAuditDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => {
          setIsAuditDrawerOpen(false)
          setAuditProduct(null)
        }}
        product={auditProduct}
      />
    </div>
  )
}
