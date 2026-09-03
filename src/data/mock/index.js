// Central Mock Registry - Dr. Aqua Omni-Management Hub
export * from './sectors'
export * from './inventory'
export * from './customers'
export * from './sales'
export * from './webOrders'
export * from './services'
export * from './staff'

import { mockSectors } from './sectors'
import { mockProducts } from './inventory'
import { mockCustomers } from './customers'
import { mockSales } from './sales'
import { mockWebOrders } from './webOrders'
import { mockServiceTickets } from './services'
import { mockStaff } from './staff'

export const initialMockRegistry = {
  sectors: mockSectors,
  products: mockProducts,
  customers: mockCustomers,
  sales: mockSales,
  webOrders: mockWebOrders,
  serviceTickets: mockServiceTickets,
  staff: mockStaff,
}

export default initialMockRegistry
