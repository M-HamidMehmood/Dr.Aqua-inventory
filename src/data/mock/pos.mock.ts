export interface CartLineItem {
  id: number
  sku: string
  name: string
  category: string
  price: number
  qty: number
  warrantyPeriod?: string
}

export interface POSTransaction {
  invoice: string
  date: string
  customerId: number
  customerName: string
  sector: string
  items: CartLineItem[]
  subtotal: number
  technicianFee: number
  discount: number
  total: number
  paymentMethod: 'Raast Instant QR' | 'JazzCash' | 'EasyPaisa' | 'Cash at Counter'
  transactionRef: string
  cashierName: string
  status: 'Completed' | 'Refunded'
}

export const mockInitialCart: CartLineItem[] = [
  {
    id: 1,
    sku: 'RO-100-ST',
    name: 'R.O 100 Gallon Per Day Plant (With Heavy Iron Stand)',
    category: 'Residential RO',
    price: 28500,
    qty: 1,
    warrantyPeriod: '1 Year Full',
  },
  {
    id: 10,
    sku: 'SED-5MIC-10',
    name: 'Sediment Filter Cartridge 5 Micron (10" Standard Spun)',
    category: 'Filters & Cartridges',
    price: 450,
    qty: 2,
    warrantyPeriod: 'Disposable',
  },
  {
    id: 11,
    sku: 'CTO-10IN',
    name: 'Carbon Block CTO Cartridge (10" Coconut Shell)',
    category: 'Filters & Cartridges',
    price: 750,
    qty: 1,
    warrantyPeriod: 'Disposable',
  },
]

export const mockRecentTransactions: POSTransaction[] = [
  {
    invoice: 'INV-2023-9981',
    date: 'Today, 11:30 AM',
    customerId: 101,
    customerName: 'Fatima Ali',
    sector: 'Model Town B',
    items: [
      {
        id: 8,
        sku: 'MEM-DOW-75',
        name: 'Dow Filmtec 75 GPD Original RO Membrane',
        category: 'Membranes & Vessels',
        price: 4800,
        qty: 1,
      },
      {
        id: 10,
        sku: 'SED-5MIC-10',
        name: 'Sediment Filter Cartridge 5 Micron',
        category: 'Filters & Cartridges',
        price: 450,
        qty: 2,
      },
    ],
    subtotal: 5700,
    technicianFee: 1500,
    discount: 200,
    total: 7000,
    paymentMethod: 'Raast Instant QR',
    transactionRef: 'RST-99421038',
    cashierName: 'Bilal Cashier',
    status: 'Completed',
  },
  {
    invoice: 'INV-2023-9980',
    date: 'Today, 10:15 AM',
    customerId: 102,
    customerName: 'Enterprise Corp Ltd',
    sector: 'Industrial Estate',
    items: [
      {
        id: 6,
        sku: 'JMB-2STG-20',
        name: 'Jumbo Filter 2-Stage Whole House System',
        category: 'Filters & Cartridges',
        price: 48000,
        qty: 1,
      },
    ],
    subtotal: 48000,
    technicianFee: 3000,
    discount: 1000,
    total: 50000,
    paymentMethod: 'Cash at Counter',
    transactionRef: 'CSH-10822',
    cashierName: 'Bilal Cashier',
    status: 'Completed',
  },
  {
    invoice: 'INV-2023-9979',
    date: 'Yesterday, 05:45 PM',
    customerId: 103,
    customerName: 'Dr. Zafar Iqbal',
    sector: 'Satellite Town',
    items: [
      {
        id: 3,
        sku: 'ASP-100-GPD',
        name: 'Aspire 100 GPD Domestic RO System',
        category: 'Residential RO',
        price: 34000,
        qty: 1,
      },
    ],
    subtotal: 34000,
    technicianFee: 1500,
    discount: 500,
    total: 35000,
    paymentMethod: 'Raast Instant QR',
    transactionRef: 'RST-8812903',
    cashierName: 'Bilal Cashier',
    status: 'Completed',
  },
]

export const mockPaymentGateways = {
  raast: {
    name: 'State Bank Raast Instant P2M',
    merchantId: 'DRAQUA-BWP-01',
    iban: 'PK44MEZN000334707175901',
    alias: '03347071759',
    settlement: 'Instant 24/7 (0% Fee)',
  },
  jazzcash: {
    name: 'JazzCash Merchant QR',
    tillId: '778842',
    account: '03008684455',
    settlement: 'T+0 Real-time',
  },
  easypaisa: {
    name: 'EasyPaisa Business Wallet',
    tillId: '992104',
    account: '03347071759',
    settlement: 'T+0 Real-time',
  },
}
