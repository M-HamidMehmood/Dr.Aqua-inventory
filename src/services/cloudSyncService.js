// Cloud Synchronization & Database Engine for Dr. Aqua
// Connects Dr. Aqua Inventory Dashboard with Supabase Cloud & Next.js Storefront

export const SUPABASE_CONFIG = {
  url: 'https://ivfvxnwciuqicqqnlbtx.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZnZ4bndjaXVxaWNxcW5sYnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODU3MDAsImV4cCI6MjA3ODE2MTcwMH0.c-PfjifYWi5_lxK0VGXKRmUo8zhoXHz7NYR4zV6Usmg',
}

const OFFLINE_QUEUE_KEY = 'draqua-offline-queue'
const LAST_SYNC_KEY = 'draqua-last-cloud-sync'

class CloudSyncService {
  constructor() {
    this.url = SUPABASE_CONFIG.url
    this.key = SUPABASE_CONFIG.anonKey
    this.listeners = new Set()
  }

  // Event listener subscription for sync state updates
  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notify(event, data) {
    this.listeners.forEach((cb) => {
      try {
        cb(event, data)
      } catch (err) {
        console.error('Error in sync listener:', err)
      }
    })
  }

  // Network check
  isOnline() {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  // Supabase REST Headers
  getHeaders() {
    return {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates',
    }
  }

  // Test live connection to Supabase
  async testConnection() {
    if (!this.isOnline()) return { ok: false, error: 'Offline (No internet connection)' }
    try {
      const res = await fetch(`${this.url}/rest/v1/draqua_products?select=id&limit=1`, {
        headers: this.getHeaders(),
      })
      if (res.ok) {
        return { ok: true, status: 'Connected' }
      }
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  // --- OFFLINE QUEUE MANAGEMENT ---
  getOfflineQueue() {
    try {
      const saved = localStorage.getItem(OFFLINE_QUEUE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  }

  addToOfflineQueue(action, payload) {
    const queue = this.getOfflineQueue()
    const item = {
      id: `QUEUE-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      payload,
      timestamp: new Date().toISOString(),
    }
    const updated = [...queue, item]
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated))
    this.notify('queueUpdated', updated)
    return item
  }

  clearOfflineQueue() {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([]))
    this.notify('queueUpdated', [])
  }

  // Drain offline queue when internet is restored
  async drainOfflineQueue() {
    if (!this.isOnline()) return { success: false, remaining: this.getOfflineQueue().length }

    const queue = this.getOfflineQueue()
    if (queue.length === 0) return { success: true, processed: 0 }

    const remaining = []
    let processedCount = 0

    for (const item of queue) {
      try {
        let success = false
        if (item.action === 'syncProduct') {
          success = await this.pushProductDirect(item.payload)
        } else if (item.action === 'syncOrder') {
          success = await this.pushOrderDirect(item.payload)
        } else if (item.action === 'syncCustomer') {
          success = await this.pushCustomerDirect(item.payload)
        } else if (item.action === 'syncBooking') {
          success = await this.pushBookingDirect(item.payload)
        } else if (item.action === 'recordSale') {
          success = await this.recordSaleDirect(item.payload)
        }

        if (success) {
          processedCount++
        } else {
          remaining.push(item)
        }
      } catch (err) {
        remaining.push(item)
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining))
    this.notify('queueDrained', { processedCount, remaining: remaining.length })
    return { success: true, processed: processedCount, remaining: remaining.length }
  }

  // --- PRODUCTS SYNC ---
  async pushProductDirect(p) {
    try {
      const payload = {
        id: p.id,
        sku: p.sku || `SKU-${p.id}`,
        name: p.name,
        urdu_name: p.urduName || null,
        category: p.category || 'Filters',
        price: p.price,
        quantity: p.quantity,
        online_visible: p.onlineVisible !== false,
        image: p.image || null,
        description: p.description || null,
        urdu_description: p.urduDescription || null,
        updated_at: new Date().toISOString(),
      }
      const res = await fetch(`${this.url}/rest/v1/draqua_products`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })
      return res.ok
    } catch (e) {
      return false
    }
  }

  async syncProduct(product) {
    if (!this.isOnline()) {
      this.addToOfflineQueue('syncProduct', product)
      return { offline: true }
    }
    const ok = await this.pushProductDirect(product)
    if (!ok) {
      this.addToOfflineQueue('syncProduct', product)
      return { queued: true }
    }
    return { ok: true }
  }

  async batchSyncProducts(products) {
    if (!this.isOnline()) {
      products.forEach((p) => this.addToOfflineQueue('syncProduct', p))
      return { offline: true, count: products.length }
    }
    try {
      const mapped = products.map((p) => ({
        id: p.id,
        sku: p.sku || `SKU-${p.id}`,
        name: p.name,
        urdu_name: p.urduName || null,
        category: p.category || 'Filters',
        price: p.price,
        quantity: p.quantity,
        online_visible: p.onlineVisible !== false,
        image: p.image || null,
        description: p.description || null,
        urdu_description: p.urduDescription || null,
        updated_at: new Date().toISOString(),
      }))

      const res = await fetch(`${this.url}/rest/v1/draqua_products`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(mapped),
      })
      return { ok: res.ok }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }

  async fetchProducts() {
    if (!this.isOnline()) return null
    try {
      const res = await fetch(`${this.url}/rest/v1/draqua_products?select=*`, {
        headers: this.getHeaders(),
      })
      if (!res.ok) return null
      const rows = await res.json()
      return rows.map((r) => ({
        id: Number(r.id),
        sku: r.sku,
        name: r.name,
        urduName: r.urdu_name,
        category: r.category,
        price: Number(r.price),
        quantity: Number(r.quantity),
        onlineVisible: r.online_visible,
        image: r.image,
        description: r.description,
        urduDescription: r.urdu_description,
      }))
    } catch (e) {
      return null
    }
  }

  // --- ORDERS SYNC ---
  async pushOrderDirect(order) {
    try {
      const payload = {
        id: order.id,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        delivery_address: order.deliveryAddress,
        city: order.city,
        items: order.items,
        subtotal: order.subtotal,
        delivery_fee: order.deliveryFee || 0,
        total: order.total,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus || 'Unpaid (COD)',
        status: order.status,
        courier_name: order.courierName || null,
        tracking_number: order.trackingNumber || null,
        notes: order.notes || null,
        created_at: order.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const res = await fetch(`${this.url}/rest/v1/draqua_orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })
      return res.ok
    } catch (e) {
      return false
    }
  }

  async syncOrder(order) {
    if (!this.isOnline()) {
      this.addToOfflineQueue('syncOrder', order)
      return { offline: true }
    }
    const ok = await this.pushOrderDirect(order)
    if (!ok) {
      this.addToOfflineQueue('syncOrder', order)
      return { queued: true }
    }
    return { ok: true }
  }

  async fetchOrders() {
    if (!this.isOnline()) return null
    try {
      const res = await fetch(
        `${this.url}/rest/v1/draqua_orders?select=*&order=created_at.desc`,
        {
          headers: this.getHeaders(),
        },
      )
      if (!res.ok) return null
      const rows = await res.json()
      return rows.map((r) => ({
        id: r.id,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        deliveryAddress: r.delivery_address,
        city: r.city,
        items: r.items || [],
        subtotal: Number(r.subtotal),
        deliveryFee: Number(r.delivery_fee),
        total: Number(r.total),
        paymentMethod: r.payment_method,
        paymentStatus: r.payment_status,
        status: r.status,
        courierName: r.courier_name,
        trackingNumber: r.tracking_number,
        notes: r.notes,
        createdAt: r.created_at,
      }))
    } catch (e) {
      return null
    }
  }

  // --- CUSTOMERS SYNC ---
  async pushCustomerDirect(c) {
    try {
      const payload = {
        id: c.id,
        name: c.name,
        contact: c.contact,
        history: c.history || [],
        service_history: c.serviceHistory || [],
        updated_at: new Date().toISOString(),
      }
      const res = await fetch(`${this.url}/rest/v1/draqua_customers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })
      return res.ok
    } catch (e) {
      return false
    }
  }

  async syncCustomer(customer) {
    if (!this.isOnline()) {
      this.addToOfflineQueue('syncCustomer', customer)
      return { offline: true }
    }
    const ok = await this.pushCustomerDirect(customer)
    if (!ok) {
      this.addToOfflineQueue('syncCustomer', customer)
    }
    return { ok }
  }

  // --- BOOKINGS SYNC ---
  async pushBookingDirect(b) {
    try {
      const payload = {
        id: b.id,
        customer_id: b.customerId || null,
        customer_name: b.customerName,
        customer_contact: b.customerContact,
        address: b.address,
        city: b.city,
        service_type: b.serviceType,
        scheduled_date: b.scheduledDate,
        time_slot: b.timeSlot,
        technician_name: b.technicianName,
        technician_phone: b.technicianPhone || null,
        status: b.status,
        parts_used: b.partsUsed || [],
        tds_reading_before: b.tdsReadingBefore || null,
        tds_reading_after: b.tdsReadingAfter || null,
        labor_fee: b.laborFee || 0,
        parts_total: b.partsTotal || 0,
        total_charges: b.totalCharges || 0,
        notes: b.notes || null,
        completed_at: b.completedAt || null,
        created_at: b.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const res = await fetch(`${this.url}/rest/v1/draqua_bookings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })
      return res.ok
    } catch (e) {
      return false
    }
  }

  async syncBooking(booking) {
    if (!this.isOnline()) {
      this.addToOfflineQueue('syncBooking', booking)
      return { offline: true }
    }
    const ok = await this.pushBookingDirect(booking)
    if (!ok) {
      this.addToOfflineQueue('syncBooking', booking)
    }
    return { ok }
  }

  // --- SALES RECORD SYNC ---
  async recordSaleDirect(s) {
    try {
      const payload = {
        invoice: s.invoice,
        customer_id: s.customerId || null,
        customer_name: s.customerName || null,
        items: s.items || [],
        subtotal: s.subtotal || null,
        discount: s.discount || null,
        total: s.total,
        payment_method: s.paymentMethod,
        payment_reference: s.paymentReference || null,
        order_origin: s.orderOrigin || 'POS Counter',
        notes: s.notes || null,
        date: s.date || new Date().toISOString(),
      }
      const res = await fetch(`${this.url}/rest/v1/draqua_sales`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })
      return res.ok
    } catch (e) {
      return false
    }
  }

  async recordSale(sale) {
    if (!this.isOnline()) {
      this.addToOfflineQueue('recordSale', sale)
      return { offline: true }
    }
    const ok = await this.recordSaleDirect(sale)
    if (!ok) {
      this.addToOfflineQueue('recordSale', sale)
    }
    return { ok }
  }

  // --- MASTER TWO-WAY RECONCILIATION ---
  async syncAll({ inventory, webOrders, customers, bookings, sales }) {
    if (!this.isOnline()) {
      return {
        ok: false,
        error: 'Offline mode active. Changes queued locally.',
        offline: true,
      }
    }

    try {
      this.notify('syncStarted')

      // 1. Drain offline queue first
      await this.drainOfflineQueue()

      // 2. Push products to cloud
      if (inventory && inventory.length > 0) {
        await this.batchSyncProducts(inventory)
      }

      // 3. Push orders to cloud
      if (webOrders && webOrders.length > 0) {
        for (const order of webOrders) {
          await this.pushOrderDirect(order)
        }
      }

      // 4. Push customers
      if (customers && customers.length > 0) {
        for (const cust of customers) {
          await this.pushCustomerDirect(cust)
        }
      }

      // 5. Push bookings
      if (bookings && bookings.length > 0) {
        for (const bk of bookings) {
          await this.pushBookingDirect(bk)
        }
      }

      // 6. Push sales
      if (sales && sales.length > 0) {
        for (const sl of sales) {
          await this.recordSaleDirect(sl)
        }
      }

      // 7. Pull any newly placed storefront orders from cloud
      const remoteOrders = await this.fetchOrders()

      const now = new Date().toISOString()
      localStorage.setItem(LAST_SYNC_KEY, now)

      this.notify('syncCompleted', {
        timestamp: now,
        remoteOrders,
      })

      return {
        ok: true,
        timestamp: now,
        remoteOrders,
      }
    } catch (err) {
      this.notify('syncError', err.message)
      return { ok: false, error: err.message }
    }
  }
}

export const cloudSyncService = new CloudSyncService()
