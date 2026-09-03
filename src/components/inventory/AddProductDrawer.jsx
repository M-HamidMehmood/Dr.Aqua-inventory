import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../ui/sheet'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import { Badge } from '../ui/badge'
import {
  Sparkles,
  PackagePlus,
  Percent,
  Globe,
  Tag,
  Save,
  CheckCircle2,
  Boxes,
} from 'lucide-react'

export default function AddProductDrawer({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
}) {
  const isEditing = Boolean(productToEdit)

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Residential RO')
  const [costPrice, setCostPrice] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [shopStock, setShopStock] = useState('')
  const [webStock, setWebStock] = useState('')
  const [minThreshold, setMinThreshold] = useState('10')
  const [shelfLocation, setShelfLocation] = useState('Bay A1')
  const [barcode, setBarcode] = useState('')
  const [supplier, setSupplier] = useState('Dr. Aqua Engineering')
  const [isOnline, setIsOnline] = useState(true)
  const [description, setDescription] = useState('')

  // Prefill when editing or reset when adding
  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku || '')
      setName(productToEdit.name || '')
      setCategory(productToEdit.category || 'Residential RO')
      setCostPrice(String(productToEdit.costPrice || ''))
      setPrice(String(productToEdit.price || ''))
      setQuantity(String(productToEdit.quantity ?? ''))
      setShopStock(String(productToEdit.shopStock ?? ''))
      setWebStock(String(productToEdit.webStock ?? ''))
      setMinThreshold(String(productToEdit.minThreshold ?? '10'))
      setShelfLocation(productToEdit.shelfLocation || 'Bay A1')
      setBarcode(productToEdit.barcode || '')
      setSupplier(productToEdit.supplier || 'Dr. Aqua Engineering')
      setIsOnline(productToEdit.isOnline ?? true)
      setDescription(productToEdit.description || '')
    } else {
      handleAutoGenerateSku('Residential RO')
      setName('')
      setCostPrice('')
      setPrice('')
      setQuantity('10')
      setShopStock('8')
      setWebStock('2')
      setMinThreshold('10')
      setShelfLocation('Bay A1')
      setSupplier('Dr. Aqua Engineering')
      setIsOnline(true)
      setDescription('')
    }
  }, [productToEdit, isOpen])

  // Auto SKU Generator
  const handleAutoGenerateSku = (cat = category) => {
    const prefixMap = {
      'Residential RO': 'RO',
      'Commercial Plants': 'COM',
      'Filters & Cartridges': 'FLT',
      'Spare Parts': 'PRT',
      'Membranes & Vessels': 'MEM',
    }
    const prefix = prefixMap[cat] || 'PRD'
    const randomCode = Math.floor(100 + Math.random() * 900)
    const newSku = `${prefix}-${randomCode}-BAH`
    setSku(newSku)
    setBarcode(`8964000${Math.floor(10000 + Math.random() * 90000)}`)
  }

  // Margin calculation
  const cost = parseFloat(costPrice) || 0
  const retail = parseFloat(price) || 0
  const profitMargin = retail > 0 ? (((retail - cost) / retail) * 100).toFixed(1) : 0
  const netProfitPkr = retail - cost

  const handleSubmit = (e) => {
    e.preventDefault()
    const productPayload = {
      id: productToEdit ? productToEdit.id : Date.now(),
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      costPrice: cost,
      price: retail,
      quantity: parseInt(quantity, 10) || 0,
      shopStock: parseInt(shopStock, 10) || 0,
      webStock: parseInt(webStock, 10) || 0,
      minThreshold: parseInt(minThreshold, 10) || 10,
      shelfLocation,
      barcode: barcode || `8964000${Date.now().toString().slice(-5)}`,
      supplier,
      isOnline,
      description,
      warrantyPeriod: productToEdit?.warrantyPeriod || '1 Year Standard',
      auditTrail: productToEdit?.auditTrail || [
        {
          id: `LOG-${Date.now()}`,
          timestamp: 'Just now',
          operator: 'Admin',
          delta: parseInt(quantity, 10) || 0,
          previousStock: 0,
          newStock: parseInt(quantity, 10) || 0,
          reason: 'Restock / Supplier Receipt',
        },
      ],
    }

    onSaveProduct(productPayload)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col justify-between">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold font-outfit">
                {isEditing ? 'Edit Product Specifications' : 'New Omnichannel Product Registration'}
              </SheetTitle>
              <SheetDescription className="text-xs">
                Synchronized with Bahawalpur physical warehouse & Vercel e-commerce storefront.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Form Body */}
        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left text-xs">
          {/* Category & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Product Category</Label>
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  if (!isEditing) handleAutoGenerateSku(e.target.value)
                }}
              >
                <option value="Residential RO">Residential RO Plants</option>
                <option value="Commercial Plants">Commercial Plants (500-2000 GPD)</option>
                <option value="Filters & Cartridges">Filters & Replacement Cartridges</option>
                <option value="Membranes & Vessels">Membranes & FRP Pressure Vessels</option>
                <option value="Spare Parts">Booster Pumps & Spare Parts</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">SKU Identifier</Label>
                <button
                  type="button"
                  onClick={() => handleAutoGenerateSku(category)}
                  className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5" /> Auto-Gen
                </button>
              </div>
              <Input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. RO-100-ST"
                className="font-mono text-xs font-bold uppercase"
              />
            </div>
          </div>

          {/* Product Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Full Commercial Name</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. R.O 100 Gallon Per Day Plant (With Heavy Iron Stand)"
              className="text-xs"
            />
          </div>

          {/* Pricing & Profit Margin Preview */}
          <div className="p-3.5 bg-muted/30 border border-border/70 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold font-outfit text-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>Financial Pricing & Real-Time Margin</span>
              </span>
              <Badge
                variant={profitMargin >= 25 ? 'success' : profitMargin > 0 ? 'warning' : 'destructive'}
                className="text-[10px] font-mono font-bold"
              >
                {profitMargin}% Margin
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Cost Price (PKR)</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="21000"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Retail POS Price (PKR)</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="28500"
                  className="font-mono text-xs font-bold text-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
              <span>Gross Profit per unit:</span>
              <span className="font-mono font-bold text-foreground">
                PKR {netProfitPkr.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stock Quantities & Allocation */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Total Stock</Label>
              <Input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0
                  setQuantity(e.target.value)
                  setShopStock(String(Math.round(val * 0.75)))
                  setWebStock(String(Math.round(val * 0.25)))
                }}
                className="font-mono text-xs font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Shop Floor</Label>
              <Input
                type="number"
                min="0"
                value={shopStock}
                onChange={(e) => setShopStock(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Web Stock</Label>
              <Input
                type="number"
                min="0"
                value={webStock}
                onChange={(e) => setWebStock(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Shelf Location, Threshold & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Shelf Location</Label>
              <Input
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Bay A1"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Min Stock Alert</Label>
              <Input
                type="number"
                min="1"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Barcode / EAN</Label>
              <Input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="896400010011"
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Authorized Supplier / Importer</Label>
            <Select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
              <option value="Dr. Aqua Engineering (Lahore Workshop)">Dr. Aqua Engineering (Lahore Workshop)</option>
              <option value="Dow Filmtec USA (Authorized Import)">Dow Filmtec USA (Authorized Import)</option>
              <option value="Vontron Membrane Co.">Vontron Membrane Co.</option>
              <option value="AquaFilter Poland">AquaFilter Poland</option>
              <option value="Aspire Water Systems Taiwan">Aspire Water Systems Taiwan</option>
              <option value="Local Fabrication Lahore">Local Fabrication Lahore</option>
            </Select>
          </div>

          {/* Vercel Live Publish Toggle */}
          <div className="p-3 bg-muted/40 rounded-2xl border border-border/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className={`w-4 h-4 ${isOnline ? 'text-cyan-600' : 'text-muted-foreground'}`} />
              <div>
                <div className="font-semibold text-xs text-foreground">
                  Publish to dr-aqua-project.vercel.app
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Real-time synchronization with online customer storefront.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
            />
          </div>
        </form>

        {/* Footer */}
        <SheetFooter className="p-4 border-t border-border/70 bg-muted/20 flex items-center justify-between sm:justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" size="sm" className="gap-1.5 font-bold font-outfit">
            <Save className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Save Changes' : 'Register Product'}</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
