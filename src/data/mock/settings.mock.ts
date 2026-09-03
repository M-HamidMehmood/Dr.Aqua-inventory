export interface StoreSettings {
  storeName: string
  branchName: string
  address: string
  phone: string
  email: string
  ntn: string
  strn: string
  currency: string
  currencySymbol: string
  gstRate: number
  invoicePrefix: string
  invoiceFooterUrdu: string
  warrantyClause: string
}

export interface WhatsAppTemplate {
  id: string
  name: string
  triggerEvent: string
  enabled: boolean
  messageText: string
  variables: string[]
}

export interface StaffAccount {
  id: string
  name: string
  email: string
  role: 'admin' | 'cashier' | 'inventory_manager' | 'technician'
  branch: string
  lastActive: string
  status: 'Active' | 'Suspended'
}

export interface PermissionRow {
  module: string
  admin: { view: boolean; create_edit: boolean; delete: boolean; override: boolean }
  cashier: { view: boolean; create_edit: boolean; delete: boolean; override: boolean }
  inventory_manager: { view: boolean; create_edit: boolean; delete: boolean; override: boolean }
  technician: { view: boolean; create_edit: boolean; delete: boolean; override: boolean }
}

export interface SyncAuditLog {
  id: string
  timestamp: string
  type: 'Vercel E-Commerce Sync' | 'Local Database Backup' | 'CSV Export' | 'Inventory Reconcile'
  status: 'Success' | 'Warning' | 'Failed'
  recordsCount: number
  durationMs: number
}

export const mockGeneralSettings: StoreSettings = {
  storeName: 'Dr. Aqua Pure Water Solutions & Engineering Hub',
  branchName: 'Main Flagship Branch — Bahawalpur',
  address: 'Model Town B, Circular Road, Bahawalpur, Punjab, Pakistan',
  phone: '+92 334 7071759',
  email: 'contact@draqua.pk',
  ntn: '8942103-7',
  strn: '32-77-8761-229-19',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  gstRate: 0,
  invoicePrefix: 'INV-',
  invoiceFooterUrdu: 'صاف اور شفاف پانی، صحت مند زندگی کی ضمانت — شکریہ!',
  warrantyClause: '1-Month complimentary TDS audit & 12-month original membrane seal warranty included.',
}

export const mockWhatsAppTemplates: WhatsAppTemplate[] = [
  {
    id: 'tpl-1',
    name: '1-Month Complimentary TDS Inspection',
    triggerEvent: 'Automated 30-Day Service Radar',
    enabled: true,
    messageText:
      'Assalam-o-Alaikum {CustomerName}, this is Dr. Aqua Bahawalpur! Your RO system is due for its complimentary 1-month TDS purity audit (Last reading: {TDS_Value} PPM). Please reply to this message to confirm your free technician visit slot.',
    variables: ['{CustomerName}', '{TDS_Value}', '{Sector}'],
  },
  {
    id: 'tpl-2',
    name: '2-Month Sediment & Carbon Filter Replacement',
    triggerEvent: 'Automated 60-Day Service Radar',
    enabled: true,
    messageText:
      'Assalam-o-Alaikum {CustomerName}, your pre-treatment filter cartridges have reached their 60-day operational cycle ({DueDate}). To protect your Dow Filmtec membrane from scale, our mobile van can replace them today for PKR 1,200. Reply YES to dispatch.',
    variables: ['{CustomerName}', '{DueDate}', '{Sector}'],
  },
  {
    id: 'tpl-3',
    name: 'Technician Van En Route Alert',
    triggerEvent: 'Service Ticket Dispatched',
    enabled: true,
    messageText:
      'Dear {CustomerName}, our technician {TechnicianName} is en route to your premises in {Sector}. Estimated arrival time: {TimeSlot}. For emergencies please call +92 334 7071759.',
    variables: ['{CustomerName}', '{TechnicianName}', '{Sector}', '{TimeSlot}'],
  },
  {
    id: 'tpl-4',
    name: 'POS Tax Invoice & Digital Receipt',
    triggerEvent: 'POS Sale Completed',
    enabled: true,
    messageText:
      'Thank you for trusting Dr. Aqua, {CustomerName}! Your Tax Invoice #{InvoiceNumber} for PKR {TotalAmount} has been settled via {PaymentMethod}. 1-Month service warranty is now active.',
    variables: ['{CustomerName}', '{InvoiceNumber}', '{TotalAmount}', '{PaymentMethod}'],
  },
]

export const mockStaffAccounts: StaffAccount[] = [
  {
    id: 'staff-1',
    name: 'M. Hamid Mehmood',
    email: 'admin@draqua.pk',
    role: 'admin',
    branch: 'Headquarters (All Branches)',
    lastActive: 'Just now',
    status: 'Active',
  },
  {
    id: 'staff-2',
    name: 'Bilal Cashier',
    email: 'bilal.cashier@draqua.pk',
    role: 'cashier',
    branch: 'Main Branch POS Terminal 01',
    lastActive: '12m ago',
    status: 'Active',
  },
  {
    id: 'staff-3',
    name: 'Tariq Mehmood',
    email: 'warehouse@draqua.pk',
    role: 'inventory_manager',
    branch: 'Industrial Estate Central Godown',
    lastActive: '1h ago',
    status: 'Active',
  },
  {
    id: 'staff-4',
    name: 'Hamza Abbasi',
    email: 'hamza.tech@draqua.pk',
    role: 'technician',
    branch: 'Mobile Van 01 (Model Town)',
    lastActive: '45m ago',
    status: 'Active',
  },
]

export const mockRBACMatrix: PermissionRow[] = [
  {
    module: 'Executive Sales Analytics',
    admin: { view: true, create_edit: true, delete: true, override: true },
    cashier: { view: false, create_edit: false, delete: false, override: false },
    inventory_manager: { view: false, create_edit: false, delete: false, override: false },
    technician: { view: false, create_edit: false, delete: false, override: false },
  },
  {
    module: 'Omnichannel Inventory Control',
    admin: { view: true, create_edit: true, delete: true, override: true },
    cashier: { view: true, create_edit: false, delete: false, override: false },
    inventory_manager: { view: true, create_edit: true, delete: true, override: true },
    technician: { view: true, create_edit: false, delete: false, override: false },
  },
  {
    module: 'POS Billing & Invoicing Terminal',
    admin: { view: true, create_edit: true, delete: true, override: true },
    cashier: { view: true, create_edit: true, delete: false, override: true },
    inventory_manager: { view: true, create_edit: false, delete: false, override: false },
    technician: { view: false, create_edit: false, delete: false, override: false },
  },
  {
    module: 'Customer CRM & Service Radar',
    admin: { view: true, create_edit: true, delete: true, override: true },
    cashier: { view: true, create_edit: true, delete: false, override: false },
    inventory_manager: { view: true, create_edit: false, delete: false, override: false },
    technician: { view: true, create_edit: true, delete: false, override: false },
  },
  {
    module: 'Web Orders Sync & Fulfillment',
    admin: { view: true, create_edit: true, delete: true, override: true },
    cashier: { view: true, create_edit: true, delete: false, override: false },
    inventory_manager: { view: true, create_edit: true, delete: false, override: false },
    technician: { view: true, create_edit: false, delete: false, override: false },
  },
  {
    module: 'Field Technician Dispatch & Work Orders',
    admin: { view: true, create_edit: true, delete: true, override: true },
    cashier: { view: true, create_edit: true, delete: false, override: false },
    inventory_manager: { view: true, create_edit: false, delete: false, override: false },
    technician: { view: true, create_edit: true, delete: false, override: false },
  },
  {
    module: 'System Settings, RBAC & Cloud Backup',
    admin: { view: true, create_edit: true, delete: true, override: true },
    cashier: { view: false, create_edit: false, delete: false, override: false },
    inventory_manager: { view: false, create_edit: false, delete: false, override: false },
    technician: { view: false, create_edit: false, delete: false, override: false },
  },
]

export const mockSyncAuditLogs: SyncAuditLog[] = [
  {
    id: 'log-1',
    timestamp: 'Today, 12:15 PM',
    type: 'Vercel E-Commerce Sync',
    status: 'Success',
    recordsCount: 8,
    durationMs: 412,
  },
  {
    id: 'log-2',
    timestamp: 'Today, 10:00 AM',
    type: 'Local Database Backup',
    status: 'Success',
    recordsCount: 142,
    durationMs: 185,
  },
  {
    id: 'log-3',
    timestamp: 'Yesterday, 06:30 PM',
    type: 'Inventory Reconcile',
    status: 'Success',
    recordsCount: 24,
    durationMs: 320,
  },
  {
    id: 'log-4',
    timestamp: '2 days ago',
    type: 'CSV Export',
    status: 'Success',
    recordsCount: 48,
    durationMs: 95,
  },
]
