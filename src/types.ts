// Dashboard Management Types

export type ProductCategory = 'Residential' | 'Commercial' | 'Filters' | 'Spare Parts';

export interface Product {
  id: number;
  sku: string;
  name: string;
  urduName?: string;
  category: ProductCategory;
  urduCategory?: string;
  subcategory?: string;
  brand?: string;
  urduBrand?: string;
  quantity: number;
  price: number;              // POS unit billing price in PKR
  onlinePriceRange?: string;  // E-commerce display price or "Consult us"
  onlineVisible: boolean;     // Switch: true = online & shop, false = shop only
  inStock?: boolean;
  featured?: boolean;
  image?: string;
  cloudinaryPublicId?: string;
  slug?: string;
  description?: string;
  urduDescription?: string;
  specifications?: Record<string, string>;
}

export type PaymentMethod = 'Cash' | 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';

export type OrderOrigin = 'POS Counter' | 'Online Website' | 'Phone / WhatsApp';

export interface Sale {
  invoice: string;
  customerId: number;
  customerName?: string;
  items: (Product & { qty: number })[];
  subtotal?: number;
  discount?: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  orderOrigin?: OrderOrigin;
  date: Date | string;
  notes?: string;
}

export type OrderStatus = 'Pending' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface WebOrderItem {
  productId: number;
  sku: string;
  name: string;
  urduName?: string;
  price: number;
  qty: number;
  image?: string;
}

export interface WebOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  city: string;
  items: WebOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentStatus: 'Unpaid (COD)' | 'Paid' | 'Verification Pending';
  status: OrderStatus;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  courierName?: string;
  trackingNumber?: string;
  notes?: string;
}

export interface ServicePartUsed {
  productId: number;
  sku: string;
  name: string;
  urduName?: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export type ServiceType =
  | 'RO Plant Installation'
  | 'Solar System Installation'
  | 'Periodic Maintenance & Filter Replacement'
  | 'TDS Inspection & Membrane Flush';

export type ServiceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface ServiceBooking {
  id: string;
  customerId: number;
  customerName: string;
  customerContact: string;
  address: string;
  city: string;
  serviceType: ServiceType;
  scheduledDate: string;
  timeSlot: string;
  technicianName: string;
  technicianPhone?: string;
  status: ServiceStatus;
  partsUsed: ServicePartUsed[];
  tdsReadingBefore?: number;
  tdsReadingAfter?: number;
  laborFee: number;
  partsTotal: number;
  totalCharges: number;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  contact: string;
  history: Sale[];
  serviceHistory?: ServiceBooking[];
}

export type UserRole = 'admin' | 'cashier' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface ServiceRecord {
  id: string;
  customerId: number;
  customerName: string;
  customerContact: string;
  type: '1-month' | '2-month' | 'custom';
  status: 'due' | 'completed';
  dueDate: string;
  completedDate?: string;
  notes?: string;
}

