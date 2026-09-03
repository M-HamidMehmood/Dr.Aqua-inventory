import React, { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { ScrollArea } from '../ui/scroll-area'
import FulfillmentDrawer from './FulfillmentDrawer'
import { mockWebOrders } from '../../data/mock/weborders.mock'
import {
  Globe,
  RefreshCw,
  Search,
  Package,
  Clock,
  ArrowRight,
  Truck,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Phone,
  Filter,
  Check,
  Wrench,
} from 'lucide-react'

export default function WebOrdersManager() {
  const [orders, setOrders] = useState(mockWebOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all') // 'all' | 'cod' | 'prepaid'
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('')
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery)

    const matchesPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'cod' && order.paymentMethod === 'COD') ||
      (paymentFilter === 'prepaid' && order.paymentMethod.includes('Prepaid'))

    return matchesSearch && matchesPayment
  })

  // Group into 4 Kanban stages
  const columns = [
    {
      id: 'pending_verification',
      title: 'Pending Verification',
      badgeColor: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
      dotColor: 'bg-amber-500',
    },
    {
      id: 'stock_reserved',
      title: 'Stock Reserved',
      badgeColor: 'bg-cyan-500/15 text-cyan-700 border-cyan-500/30',
      dotColor: 'bg-cyan-500',
    },
    {
      id: 'out_for_delivery',
      title: 'Out for Delivery',
      badgeColor: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30',
      dotColor: 'bg-indigo-500',
    },
    {
      id: 'completed',
      title: 'Delivered & Completed',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
      dotColor: 'bg-emerald-500',
    },
  ]

  // Advance Order to next stage
  const handleAdvanceStage = (orderId, e) => {
    if (e) e.stopPropagation()
    const stageSequence = ['pending_verification', 'stock_reserved', 'out_for_delivery', 'completed']

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const currentIndex = stageSequence.indexOf(o.status)
          const nextStage = stageSequence[Math.min(stageSequence.length - 1, currentIndex + 1)]
          return { ...o, status: nextStage }
        }
        return o
      })
    )
    showToast('Order moved to next fulfillment stage!')
  }

  // Update status from drawer
  const handleDrawerStatusChange = (orderId, newStatus, van) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return { ...o, status: newStatus, assignedTechnician: van }
        }
        return o
      })
    )
    showToast(`Order status updated to ${newStatus.replace(/_/g, ' ')}`)
  }

  const handleConvertToTicket = (order, van) => {
    showToast(`Dispatched technician ticket for ${order.customerName} on ${van}!`)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Synced latest web orders from dr-aqua-project.vercel.app')
    }, 600)
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

      {/* Header Bar & Vercel Live Sync Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base font-outfit text-foreground">
              Omnichannel Web Orders Pipeline
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-800 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Vercel Store Sync</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>Destination:</span>
            <a
              href="https://dr-aqua-project.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline font-mono inline-flex items-center gap-1"
            >
              <span>dr-aqua-project.vercel.app</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>• 8 Orders Active</span>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, name..."
              className="pl-8 h-9 text-xs rounded-xl bg-muted/20"
            />
          </div>

          <div className="w-32">
            <Select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-9 text-xs"
            >
              <option value="all">All Payments</option>
              <option value="cod">COD Only</option>
              <option value="prepaid">Prepaid Only</option>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 gap-1.5 text-xs rounded-xl"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </Button>
        </div>
      </div>

      {/* 4-Column Kanban Board Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 overflow-hidden">
        {columns.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.status === col.id)

          return (
            <div
              key={col.id}
              className="bg-muted/30 border border-border/70 rounded-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-3 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="font-bold text-xs font-outfit text-foreground truncate">
                    {col.title}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono font-bold px-2 py-0 border ${col.badgeColor}`}
                >
                  {colOrders.length}
                </Badge>
              </div>

              {/* Column Cards Container */}
              <ScrollArea className="flex-1 p-2.5 space-y-2.5">
                {colOrders.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground/60 text-xs">
                    No orders in this stage
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const isPrepaid = order.paymentMethod.includes('Prepaid')

                    return (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedOrder(order)
                          setIsDrawerOpen(true)
                        }}
                        className="p-3.5 bg-card hover:bg-muted/30 border border-border/70 hover:border-border rounded-2xl shadow-xs transition-all cursor-pointer space-y-2.5 select-none"
                      >
                        {/* Card Header: Order # & Time */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-primary">
                            #{order.orderNumber}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{order.elapsedTime}</span>
                          </span>
                        </div>

                        {/* Customer & Sector */}
                        <div>
                          <div className="font-bold text-xs text-foreground font-outfit truncate">
                            {order.customerName}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-primary shrink-0" />
                            <span className="truncate">{order.sector}</span>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="p-2 bg-muted/40 rounded-xl border border-border/50 text-[11px] text-muted-foreground space-y-0.5">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="truncate">
                              • {item.name} <strong className="text-foreground">(x{item.qty})</strong>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-[10px] text-primary font-semibold">
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>

                        {/* Price & Payment Badge */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/50">
                          <span className="font-mono font-bold text-xs text-foreground">
                            PKR {order.total.toLocaleString()}
                          </span>

                          <Badge
                            variant={isPrepaid ? 'success' : 'outline'}
                            className="text-[9px] font-semibold"
                          >
                            {isPrepaid ? 'Prepaid' : 'COD'}
                          </Badge>
                        </div>

                        {/* Advance Action Button */}
                        {col.id !== 'completed' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => handleAdvanceStage(order.id, e)}
                            className="w-full h-7 text-[11px] font-bold font-outfit rounded-xl gap-1"
                          >
                            <span>Move to Next Stage</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )
                  })
                )}
              </ScrollArea>
            </div>
          )
        })}
      </div>

      {/* Screen 20: Fulfillment Slide-Over Drawer */}
      <FulfillmentDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        onStatusChange={handleDrawerStatusChange}
        onConvertToTicket={handleConvertToTicket}
      />
    </div>
  )
}
