import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent } from './Dialog'
import { Badge } from './Badge'
import { Button } from './Button'
import { X, Droplets, Globe, Store, Copy, Check } from './Icons'
import { useLanguage } from '../../context/LanguageContext'
import { formatCurrency, getLocalizedCategory, getLocalizedBrand } from '../../utils/translations'
import { getOptimizedCloudinaryUrl } from '../../utils/cloudinary'

export default function ImagePreviewModal({ isOpen, onClose, product }) {
  const { language, isRTL } = useLanguage()
  const [zoomLevel, setZoomLevel] = useState(1)
  const [copiedSku, setCopiedSku] = useState(false)

  // Reset zoom whenever modal opens with a new product
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1)
      setCopiedSku(false)
    }
  }, [isOpen, product])

  if (!product) return null

  const isUrdu = language === 'ur'
  const primaryTitle = isUrdu ? (product.urduName || product.name) : product.name
  const secondaryTitle = isUrdu ? product.name : product.urduName

  const isCloudinary = product.image && product.image.includes('res.cloudinary.com')
  // Request higher resolution for the preview modal (e.g., 800px)
  const highResImage = isCloudinary
    ? getOptimizedCloudinaryUrl(product.image, { width: 800, height: 800, crop: 'fit' })
    : product.image

  const handleCopySku = () => {
    if (product.sku) {
      navigator.clipboard.writeText(product.sku)
      setCopiedSku(true)
      setTimeout(() => setCopiedSku(false), 2000)
    }
  }

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2.5))
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75))
  const handleResetZoom = () => setZoomLevel(1)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} size='lg'>
      <DialogContent className='p-0 overflow-hidden max-w-3xl bg-card border-border shadow-2xl rounded-2xl'>
        {/* Modal Top Bar */}
        <div className='px-5 py-3.5 border-b border-border bg-muted/40 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
              <Droplets className='w-4 h-4' />
            </div>
            <div className='min-w-0'>
              <h3 className='font-bold text-sm text-foreground truncate'>
                {primaryTitle}
              </h3>
              {secondaryTitle && (
                <p className='text-xs text-muted-foreground truncate'>
                  {secondaryTitle}
                </p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            {product.sku && (
              <button
                type='button'
                onClick={handleCopySku}
                className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-background border border-border hover:bg-muted text-foreground transition-colors cursor-pointer'
                title={isUrdu ? 'ایس کے یو کاپی کریں' : 'Copy SKU code'}
                dir='ltr'
              >
                <span>{product.sku}</span>
                {copiedSku ? (
                  <Check className='w-3 h-3 text-emerald-600' />
                ) : (
                  <Copy className='w-3 h-3 text-muted-foreground' />
                )}
              </button>
            )}

            <button
              type='button'
              onClick={onClose}
              className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer'
              aria-label='Close'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>

        {/* Modal Center: Large Image Display with Zoom Controls */}
        <div className='relative bg-black/5 dark:bg-black/40 min-h-[320px] max-h-[500px] flex items-center justify-center overflow-hidden p-6 select-none'>
          {highResImage ? (
            <div
              className='relative transition-transform duration-200 ease-out flex items-center justify-center'
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={highResImage}
                alt={product.name}
                className='max-w-full max-h-[420px] object-contain rounded-xl shadow-lg border border-border/40 bg-white'
                onError={(e) => {
                  e.currentTarget.src = product.image
                }}
              />
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center text-muted-foreground py-16 gap-3'>
              <Droplets className='w-16 h-16 opacity-30 animate-pulse' />
              <p className='text-xs font-medium'>
                {isUrdu ? 'اس پروڈکٹ کی تصویر دستیاب نہیں ہے' : 'No photo uploaded for this product'}
              </p>
            </div>
          )}

          {/* Floating Zoom Bar */}
          {highResImage && (
            <div className='absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md border border-border rounded-full px-3 py-1 shadow-md flex items-center gap-2 text-xs'>
              <button
                type='button'
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.75}
                className='w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                title='Zoom Out (-)'
              >
                -
              </button>
              <button
                type='button'
                onClick={handleResetZoom}
                className='px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground cursor-pointer'
                title='Reset Zoom (100%)'
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type='button'
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.5}
                className='w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                title='Zoom In (+)'
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Modal Bottom: Comprehensive Product Specs & Storefront Details */}
        <div className='p-5 border-t border-border bg-card'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs'>
            {/* Price */}
            <div className='p-2.5 rounded-xl bg-muted/40 border border-border/80'>
              <div className='text-muted-foreground text-[11px] font-medium'>
                {isUrdu ? 'پی او ایس ریٹ' : 'POS Retail Price'}
              </div>
              <div className='text-base font-bold font-mono text-primary mt-0.5'>
                {formatCurrency(product.price, language)}
              </div>
            </div>

            {/* Warehouse Stock */}
            <div className='p-2.5 rounded-xl bg-muted/40 border border-border/80'>
              <div className='text-muted-foreground text-[11px] font-medium'>
                {isUrdu ? 'گودام کا اسٹاک' : 'Warehouse Stock'}
              </div>
              <div className='text-base font-bold font-mono text-foreground mt-0.5 flex items-center gap-1.5'>
                <span>{product.quantity ?? 0}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                  (product.quantity ?? 0) <= 5
                    ? 'bg-rose-500/10 text-rose-600'
                    : 'bg-emerald-500/10 text-emerald-600'
                }`}>
                  {(product.quantity ?? 0) <= 5 ? (isUrdu ? 'کم اسٹاک' : 'Low') : (isUrdu ? 'دستیاب' : 'In Stock')}
                </span>
              </div>
            </div>

            {/* Category */}
            <div className='p-2.5 rounded-xl bg-muted/40 border border-border/80'>
              <div className='text-muted-foreground text-[11px] font-medium'>
                {isUrdu ? 'کیٹیگری' : 'Category'}
              </div>
              <div className='font-semibold text-foreground mt-1 truncate'>
                {getLocalizedCategory(product.category, language)}
              </div>
            </div>

            {/* Storefront Channel */}
            <div className='p-2.5 rounded-xl bg-muted/40 border border-border/80'>
              <div className='text-muted-foreground text-[11px] font-medium'>
                {isUrdu ? 'ویب سائٹ حیثیت' : 'Online Store'}
              </div>
              <div className='mt-1 flex items-center gap-1.5 font-semibold text-xs'>
                {product.onlineVisible !== false ? (
                  <>
                    <Globe className='w-3.5 h-3.5 text-emerald-600' />
                    <span className='text-emerald-700 dark:text-emerald-400'>
                      {isUrdu ? 'آن لائن فعال' : 'Live Online'}
                    </span>
                  </>
                ) : (
                  <>
                    <Store className='w-3.5 h-3.5 text-amber-600' />
                    <span className='text-amber-700 dark:text-amber-400'>
                      {isUrdu ? 'صرف دکان' : 'Shop Only'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description if present */}
          {(product.urduDescription || product.description) && (
            <div className='mt-3.5 p-3 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground leading-relaxed'>
              {isUrdu ? (product.urduDescription || product.description) : (product.description || product.urduDescription)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
