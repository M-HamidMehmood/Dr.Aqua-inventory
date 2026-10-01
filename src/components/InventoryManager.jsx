import React, { useState, useRef } from 'react'
import {
  uploadToCloudinary,
  getOptimizedCloudinaryUrl,
  CLOUDINARY_CONFIG,
} from '../utils/cloudinary'
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
  Search,
  Plus,
  Cloud,
  Globe,
  Store,
  Edit3,
  Trash2,
  AlertCircle,
  UploadCloud,
  Check,
  X,
  Droplets,
  Eye,
} from './ui/Icons'
import ImagePreviewModal from './ui/ImagePreviewModal'
import { useLanguage } from '../context/LanguageContext'
import {
  getLocalizedCategory,
  getLocalizedBrand,
  formatCurrency,
} from '../utils/translations'

export default function InventoryManager({
  inventory,
  updateInventory,
  toggleProductOnline,
  userRole = 'admin',
}) {
  const { t, language, isRTL } = useLanguage()

  const [product, setProduct] = useState({
    name: '',
    urduName: '',
    sku: '',
    category: 'Residential',
    urduCategory: 'رہائشی',
    subcategory: '',
    brand: 'Aqua',
    urduBrand: 'آکوا',
    quantity: 0,
    price: 0,
    onlinePriceRange: 'Consult us',
    onlineVisible: true,
    image: '',
    cloudinaryPublicId: '',
    description: '',
    urduDescription: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [previewProduct, setPreviewProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Cloudinary upload states
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [showManualUrlInput, setShowManualUrlInput] = useState(false)
  const fileInputRef = useRef(null)

  const isAdmin = userRole === 'admin'

  // Categories list
  const rawCategories = ['All', 'Residential', 'Commercial', 'Filters', 'Shop Only']

  // Category counts
  const counts = {
    All: inventory.length,
    Residential: inventory.filter((p) => p.category === 'Residential').length,
    Commercial: inventory.filter((p) => p.category === 'Commercial').length,
    Filters: inventory.filter((p) => p.category === 'Filters').length,
    'Shop Only': inventory.filter((p) => !p.onlineVisible).length,
  }

  // Filtered Inventory
  const filteredInventory = inventory.filter((p) => {
    // Category match
    if (selectedCategory === 'Shop Only') {
      if (p.onlineVisible) return false
    } else if (selectedCategory !== 'All') {
      if (p.category !== selectedCategory) return false
    }

    // Search query match (name, urduName, sku, brand, category)
    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.urduName && p.urduName.includes(searchTerm)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.urduBrand && p.urduBrand.includes(searchTerm)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.urduCategory && p.urduCategory.includes(searchTerm))
    )
  })

  // Handlers
  const handleSave = (e) => {
    if (e) e.preventDefault()
    if (!isAdmin) return

    // Auto-generate SKU if blank
    const generatedSku =
      product.sku.trim() ||
      `DA-${(product.category || 'GEN').substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`

    const enrichedProduct = {
      ...product,
      sku: generatedSku,
      urduCategory: getLocalizedCategory(product.category, 'ur'),
      urduBrand: getLocalizedBrand(product.brand, 'ur'),
    }

    if (editingId) {
      updateInventory(
        inventory.map((p) =>
          p.id === editingId ? { ...p, ...enrichedProduct } : p,
        ),
      )
    } else {
      updateInventory([
        {
          ...enrichedProduct,
          id: Date.now(),
        },
        ...inventory,
      ])
    }

    closeDialog()
  }

  const handleEditClick = (p) => {
    setProduct({
      name: p.name || '',
      urduName: p.urduName || '',
      sku: p.sku || '',
      category: p.category || 'Residential',
      urduCategory: p.urduCategory || getLocalizedCategory(p.category, 'ur'),
      subcategory: p.subcategory || '',
      brand: p.brand || 'Aqua',
      urduBrand: p.urduBrand || getLocalizedBrand(p.brand, 'ur'),
      quantity: p.quantity || 0,
      price: p.price || 0,
      onlinePriceRange: p.onlinePriceRange || 'Consult us',
      onlineVisible: p.onlineVisible !== undefined ? p.onlineVisible : true,
      image: p.image || '',
      cloudinaryPublicId: p.cloudinaryPublicId || '',
      description: p.description || '',
      urduDescription: p.urduDescription || '',
    })
    setEditingId(p.id)
    setIsDialogOpen(true)
    setUploadError(null)
    setUploadSuccess(false)
  }

  const handleAddNewClick = () => {
    setProduct({
      name: '',
      urduName: '',
      sku: '',
      category: 'Residential',
      urduCategory: 'رہائشی',
      subcategory: '',
      brand: 'Aqua',
      urduBrand: 'آکوا',
      quantity: 0,
      price: 0,
      onlinePriceRange: 'Consult us',
      onlineVisible: true,
      image: '',
      cloudinaryPublicId: '',
      description: '',
      urduDescription: '',
    })
    setEditingId(null)
    setIsDialogOpen(true)
    setUploadError(null)
    setUploadSuccess(false)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingId(null)
    setIsUploading(false)
    setUploadError(null)
    setUploadSuccess(false)
    setShowManualUrlInput(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = (id) => {
    if (!isAdmin) return
    if (window.confirm(t('deleteConfirm'))) {
      updateInventory(inventory.filter((p) => p.id !== id))
    }
  }

  const handleStockIn = (id, qty) => {
    updateInventory(
      inventory.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + qty } : p,
      ),
    )
  }

  const handleStockOut = (id, qty) => {
    updateInventory(
      inventory.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(0, p.quantity - qty) } : p,
      ),
    )
  }

  const handleToggleOnline = (id) => {
    if (!isAdmin) return
    if (toggleProductOnline) {
      toggleProductOnline(id)
    } else {
      updateInventory(
        inventory.map((p) =>
          p.id === id ? { ...p, onlineVisible: !p.onlineVisible } : p,
        ),
      )
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      const publicId = product.sku
        ? `prod_${product.sku.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`
        : `prod_${Date.now()}`

      const res = await uploadToCloudinary(file, {
        public_id: publicId,
        folder: 'dr-aqua/products',
      })

      setProduct((prev) => ({
        ...prev,
        image: res.secure_url,
        cloudinaryPublicId: res.public_id,
      }))
      setUploadSuccess(true)
    } catch (err) {
      console.error('Cloudinary upload failed:', err)
      setUploadError(err.message || 'Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const getCategoryBadgeVariant = (cat) => {
    switch (cat) {
      case 'Residential':
        return 'info'
      case 'Commercial':
        return 'purple'
      case 'Filters':
        return 'success'
      default:
        return 'secondary'
    }
  }

  return (
    <div className='space-y-6'>
      {/* 4 Summary Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('totalCatalogSkus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground font-mono'>
              {inventory.length}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>{t('activeSkus')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between'>
              <span>{t('inStock')}</span>
              <Droplets className='w-4 h-4 text-sky-500' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono'>
              {inventory.filter((p) => p.quantity > 0).length}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>{t('inStockUnits')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between'>
              <span>{t('onlineStorefront')}</span>
              <Globe className='w-4 h-4 text-emerald-500' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono'>
              {inventory.filter((p) => p.onlineVisible).length}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>{t('drAquaProjectSync')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between'>
              <span>{t('lowStockAlert')}</span>
              <AlertCircle className='w-4 h-4 text-destructive' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-destructive font-mono'>
              {inventory.filter((p) => p.quantity < 10).length}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>{t('below10Units')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        {/* Header Bar */}
        <CardHeader className='border-b border-border pb-4'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <div className='flex items-center gap-2.5'>
                <CardTitle className='text-xl font-bold text-foreground'>
                  {isAdmin ? t('inventoryTitleAdmin') : t('inventoryTitleCashier')}
                </CardTitle>
                <Badge variant={isAdmin ? 'purple' : 'info'}>
                  {isAdmin ? t('admin') : t('cashier')}
                </Badge>
              </div>
              <CardDescription className='text-xs text-muted-foreground mt-1'>
                {t('inventoryDesc')}
              </CardDescription>
            </div>

            {isAdmin && (
              <Button onClick={handleAddNewClick} className='shadow-subtle cursor-pointer'>
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                <span>{t('addProduct')}</span>
              </Button>
            )}
          </div>

          {/* Filter tabs & Search Bar */}
          <div className='flex flex-wrap items-center justify-between gap-3 pt-4'>
            {/* Category Pills */}
            <div className='flex flex-wrap gap-1.5'>
              {rawCategories.map((cat) => {
                const isActive = selectedCategory === cat
                const localizedCat = getLocalizedCategory(cat, language)
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-subtle'
                        : 'bg-muted/50 text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{localizedCat}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold font-mono ${
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-background text-muted-foreground'
                      }`}
                    >
                      {counts[cat]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Search Input */}
            <div className='w-full sm:w-72 relative'>
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 w-4 h-4 text-muted-foreground`} />
              <Input
                type='text'
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isRTL ? 'pr-9 pl-8' : 'pl-9 pr-8'} h-9 text-xs`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={`absolute ${isRTL ? 'left-2.5' : 'right-2.5'} top-2.5 text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer`}
                >
                  <X className='w-3.5 h-3.5' />
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Cashier Notice */}
        {!isAdmin && (
          <div className='m-4 p-3 bg-muted/40 border border-border rounded-lg flex items-center justify-between text-xs text-muted-foreground'>
            <span>{t('cashierStockModeNotice')}</span>
            <Badge variant='outline'>
              <span className='font-mono mr-1'>{filteredInventory.length}</span> {t('available')}
            </Badge>
          </div>
        )}

        {/* Master Table */}
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[320px]'>{t('productAndMedia')}</TableHead>
                <TableHead>{t('skuAndCategory')}</TableHead>
                <TableHead className='text-center'>{t('storefrontStatus')}</TableHead>
                <TableHead>{t('warehouseStock')}</TableHead>
                <TableHead>{t('posPrice')}</TableHead>
                <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((p) => {
                const isOnline = p.onlineVisible !== false
                const isCloudinary = p.image && p.image.includes('res.cloudinary.com')
                const displayImage = isCloudinary
                  ? getOptimizedCloudinaryUrl(p.image, { width: 96, height: 96, crop: 'fill' })
                  : p.image

                // Bilingual Name Presentation
                const isUrduLang = language === 'ur'
                const primaryTitle = isUrduLang ? (p.urduName || p.name) : p.name
                const secondaryTitle = isUrduLang ? p.name : p.urduName

                return (
                  <TableRow key={p.id}>
                    {/* Product & Media */}
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <div
                          onClick={() => setPreviewProduct(p)}
                          className='group relative w-12 h-12 rounded-xl bg-muted border border-border flex-shrink-0 flex items-center justify-center overflow-hidden cursor-zoom-in hover:border-primary hover:shadow-md transition-all'
                          title={language === 'ur' ? 'تصویر بڑی کر کے دیکھیں' : 'Click to enlarge image preview'}
                        >
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={p.name}
                              className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-200'
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <Droplets className='w-5 h-5 text-muted-foreground' />
                          )}
                          <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity'>
                            <Eye className='w-4 h-4 drop-shadow' />
                          </div>
                        </div>

                        <div className='min-w-0'>
                          <div className='font-semibold text-foreground text-sm flex items-center gap-1.5'>
                            <span className='truncate'>{primaryTitle}</span>
                            {p.featured && (
                              <Badge variant='warning' className='text-[9px] px-1.5 py-0'>
                                {t('featured')}
                              </Badge>
                            )}
                          </div>
                          {secondaryTitle && (
                            <div className='text-xs text-muted-foreground font-medium truncate'>
                              {secondaryTitle}
                            </div>
                          )}
                          <div className='text-[11px] text-muted-foreground'>
                            {t('brand')}: <span className='text-foreground font-medium'>{getLocalizedBrand(p.brand, language)}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* SKU & Category */}
                    <TableCell>
                      <div className='flex flex-col gap-1 items-start'>
                        <span className='px-1.5 py-0.5 font-mono text-[11px] font-semibold bg-muted text-foreground rounded border border-border' dir='ltr'>
                          {p.sku || `DA-${p.id}`}
                        </span>
                        <Badge variant={getCategoryBadgeVariant(p.category)} className='text-[10px]'>
                          {getLocalizedCategory(p.category, language)}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Online vs Shop Switch */}
                    <TableCell className='text-center'>
                      {isAdmin ? (
                        <button
                          type='button'
                          onClick={() => handleToggleOnline(p.id)}
                          title={`Click to switch to ${isOnline ? t('shopOnly') : t('onlineAndShop')}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            isOnline
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {isOnline ? (
                            <>
                              <Globe className='w-3 h-3 text-emerald-600' />
                              <span>{t('onlineAndShop')}</span>
                            </>
                          ) : (
                            <>
                              <Store className='w-3 h-3 text-amber-600' />
                              <span>{t('shopOnly')}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            isOnline
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {isOnline ? t('onlineAndShop') : t('shopOnly')}
                        </span>
                      )}
                      <div className='text-[10px] text-muted-foreground mt-0.5'>
                        {isOnline ? (language === 'ur' ? 'آن لائن دستیاب' : 'Storefront active') : (language === 'ur' ? 'کاؤنٹر سیلز' : 'Counter sales')}
                      </div>
                    </TableCell>

                    {/* Available Stock */}
                    <TableCell>
                      <div className='flex items-center gap-1.5'>
                        <span className='font-bold text-foreground text-sm font-mono'>
                          {p.quantity}
                        </span>
                        <span className='text-xs text-muted-foreground'>{t('unitsInStock')}</span>
                        {p.quantity < 10 && (
                          <Badge variant='destructive' className='text-[10px] px-1.5 py-0'>
                            {t('lowStockAlert')}
                          </Badge>
                        )}
                      </div>

                      {isAdmin && (
                        <div className='flex items-center gap-1 mt-1'>
                          <button
                            onClick={() => handleStockIn(p.id, 10)}
                            title='Add 10 units'
                            className='px-1.5 py-0.5 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded cursor-pointer font-mono'
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleStockOut(p.id, 5)}
                            title='Deduct 5 units'
                            className='px-1.5 py-0.5 text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded cursor-pointer font-mono'
                          >
                            -5
                          </button>
                        </div>
                      )}
                    </TableCell>

                    {/* POS Price */}
                    <TableCell>
                      <div className='font-semibold text-foreground text-sm'>
                        {formatCurrency(p.price, language)}
                      </div>
                      <div className='text-[10px] text-muted-foreground'>
                        {p.onlinePriceRange ? p.onlinePriceRange : 'Standard POS'}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className={`${isRTL ? 'text-left' : 'text-right'} whitespace-nowrap`}>
                      {isAdmin ? (
                        <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-1.5`}>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEditClick(p)}
                            className='h-7 px-2.5 text-xs cursor-pointer'
                          >
                            <Edit3 className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'} text-muted-foreground`} />
                            <span>{t('editAction')}</span>
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => handleDelete(p.id)}
                            className='h-7 w-7 p-0 cursor-pointer'
                            title={t('deleteAction')}
                          >
                            <Trash2 className='w-3 h-3' />
                          </Button>
                        </div>
                      ) : (
                        <span className='text-xs text-muted-foreground font-medium'>
                          {language === 'ur' ? 'صرف مشاہدہ' : 'View only'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}

              {filteredInventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className='py-12 text-center text-muted-foreground'>
                    <Search className='w-8 h-8 mx-auto text-muted-foreground/40 mb-2' />
                    <div className='text-sm font-semibold text-foreground'>
                      {t('noProductsFound')}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for Add / Edit Product */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <form onSubmit={handleSave}>
            <DialogHeader>
              <div className='flex items-center justify-between'>
                <DialogTitle>
                  {editingId ? t('editProductDetails') : t('addNewProduct')}
                </DialogTitle>
                <button
                  type='button'
                  onClick={closeDialog}
                  className='text-muted-foreground hover:text-foreground text-sm cursor-pointer'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
              <DialogDescription>
                {t('productModalDesc')}
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 py-4'>
              {/* Product Name English */}
              <div className='space-y-1.5 sm:col-span-2'>
                <label className='text-xs font-semibold text-foreground uppercase tracking-wider'>
                  {t('productNameEnglish')} *
                </label>
                <Input
                  type='text'
                  placeholder='e.g., RO 2 Stage'
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  required
                />
              </div>

              {/* Urdu Name */}
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground uppercase tracking-wider'>
                  {t('productNameUrdu')}
                </label>
                <Input
                  type='text'
                  dir='rtl'
                  placeholder='آر او 2 مرحلے'
                  value={product.urduName}
                  onChange={(e) => setProduct({ ...product, urduName: e.target.value })}
                />
              </div>

              {/* SKU */}
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground uppercase tracking-wider'>
                  {t('skuCode')}
                </label>
                <Input
                  type='text'
                  placeholder='e.g., DA-RO-2S'
                  value={product.sku}
                  onChange={(e) => setProduct({ ...product, sku: e.target.value.toUpperCase() })}
                  dir='ltr'
                  className='font-mono uppercase'
                />
              </div>

              {/* Category */}
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground uppercase tracking-wider'>
                  {t('categoryLabel')} *
                </label>
                <select
                  value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })}
                  className='flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground'
                >
                  <option value='Residential'>{getLocalizedCategory('Residential', language)}</option>
                  <option value='Commercial'>{getLocalizedCategory('Commercial', language)}</option>
                  <option value='Filters'>{getLocalizedCategory('Filters', language)}</option>
                  <option value='Spare Parts'>{language === 'ur' ? 'اسپیئر پارٹس' : 'Spare Parts'}</option>
                </select>
              </div>

              {/* Brand */}
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground uppercase tracking-wider'>
                  {t('brandLabel')}
                </label>
                <Input
                  type='text'
                  placeholder='e.g., Aqua, Water Master'
                  value={product.brand}
                  onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                />
              </div>

              {/* Quantity */}
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground uppercase tracking-wider'>
                  {t('initialStock')} *
                </label>
                <Input
                  type='number'
                  placeholder='0'
                  value={product.quantity || ''}
                  onChange={(e) => setProduct({ ...product, quantity: +e.target.value })}
                  required
                  min='0'
                  dir='ltr'
                  className='font-mono'
                />
              </div>

              {/* POS Price */}
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-foreground uppercase tracking-wider'>
                  {t('posPricePkr')} *
                </label>
                <Input
                  type='number'
                  placeholder='0'
                  value={product.price || ''}
                  onChange={(e) => setProduct({ ...product, price: +e.target.value })}
                  required
                  min='0'
                  dir='ltr'
                  className='font-mono'
                />
              </div>

              {/* Online Price Range */}
              <div className='space-y-1.5 sm:col-span-2'>
                <label className='text-xs font-semibold text-foreground uppercase tracking-wider'>
                  {t('onlinePriceRangeLabel')}
                </label>
                <Input
                  type='text'
                  placeholder='e.g., PKR 10,000 - 15,000 or Consult us'
                  value={product.onlinePriceRange}
                  onChange={(e) => setProduct({ ...product, onlinePriceRange: e.target.value })}
                />
              </div>

              {/* Product Photo Upload Section */}
              <div className='sm:col-span-2 p-3.5 rounded-lg border border-border bg-muted/30 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1.5 text-xs font-semibold text-foreground'>
                    <UploadCloud className='w-4 h-4 text-primary' />
                    <span>{t('productPhoto')}</span>
                  </div>
                  <button
                    type='button'
                    onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                    className='text-[11px] text-primary hover:underline font-medium cursor-pointer'
                  >
                    {showManualUrlInput ? (language === 'ur' ? 'لنک چھپائیں' : 'Hide URL input') : t('orProvideImageUrl')}
                  </button>
                </div>

                <div className='flex flex-wrap items-center gap-3'>
                  <div className='flex-1 min-w-[200px]'>
                    <input
                      type='file'
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept='image/*'
                      disabled={isUploading}
                      className='block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer disabled:opacity-50'
                    />
                  </div>

                  {isUploading && (
                    <div className='flex items-center gap-1.5 text-xs text-primary'>
                      <div className='w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                      <span>{t('uploadingPhoto')}</span>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className='flex items-center gap-1 text-xs text-emerald-600 font-medium'>
                      <Check className='w-3.5 h-3.5' />
                      <span>{t('uploadSuccessNotice')}</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className='text-xs text-destructive flex items-center gap-1'>
                      <AlertCircle className='w-3.5 h-3.5' />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Thumbnail */}
                  {product.image && (
                    <div className='flex items-center gap-2 p-1.5 bg-background rounded-md border border-border'>
                      <img
                        src={getOptimizedCloudinaryUrl(product.image, { width: 64, height: 64 })}
                        alt='Thumb'
                        className='w-8 h-8 rounded object-cover'
                      />
                      <span className='text-[10px] text-muted-foreground max-w-[120px] truncate font-mono' dir='ltr'>
                        {product.image}
                      </span>
                      <button
                        type='button'
                        onClick={() =>
                          setProduct((prev) => ({
                            ...prev,
                            image: '',
                            cloudinaryPublicId: '',
                          }))
                        }
                        className='text-muted-foreground hover:text-destructive cursor-pointer'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </div>
                  )}
                </div>

                {showManualUrlInput && (
                  <Input
                    type='text'
                    placeholder={t('imageUrlPlaceholder')}
                    value={product.image}
                    onChange={(e) => setProduct({ ...product, image: e.target.value })}
                    dir='ltr'
                    className='text-xs h-8 font-mono'
                  />
                )}
              </div>

              {/* Online toggle */}
              <div className='sm:col-span-2 pt-2 border-t border-border flex items-center justify-between'>
                <label className='flex items-center gap-2.5 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={product.onlineVisible}
                    onChange={(e) => setProduct({ ...product, onlineVisible: e.target.checked })}
                    className='w-4 h-4 rounded border-border text-primary focus:ring-primary'
                  />
                  <div>
                    <span className='text-xs font-semibold text-foreground block'>
                      {t('storefrontVisibility')}
                    </span>
                    <span className='text-[11px] text-muted-foreground'>
                      {product.onlineVisible ? t('visibleOnWebsite') : t('shopOnlyDesc')}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={closeDialog} className='cursor-pointer'>
                {t('cancel')}
              </Button>
              <Button type='submit' className='cursor-pointer'>
                {editingId ? t('updateProduct') : t('saveProduct')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* High-Resolution Image Preview Lightbox */}
      <ImagePreviewModal
        isOpen={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
        product={previewProduct}
      />
    </div>
  )
}
