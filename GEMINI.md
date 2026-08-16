# GEMINI.md — Project Awareness & Agent Context

## 1. Project Overview
- **Name**: Dr. Aqua Business Management Dashboard
- **Type**: Standalone Single Page React App (SPA)
- **Domain**: Water filtration & purification business management (Inventory, Billing, Customers, Sales Analytics)
- **Primary Currency**: `PKR` (Pakistani Rupee)

---

## 2. Tech Stack & Commands
- **Framework**: React 18 (`react-dom`, `react-scripts` 5.0.1)
- **Styling**: Tailwind CSS (CDN loaded via `public/index.html`)
- **Visuals / PDF**: `chart.js` (Bar charts), `jspdf` (Receipt generation)
- **Storage**: Client-side `localStorage` (No backend server required)

### Essential Commands
| Command | Action |
| :--- | :--- |
| `npm start` | Run development server on `http://localhost:3000` |
| `npm run build` | Generate production build into `build/` |
| `npm test` | Run test suite via `react-scripts` |

---

## 3. Directory & File Map
```
Dr.Aqua-inventory/
├── public/
│   ├── index.html            # Loads Tailwind CSS CDN & root mount div
│   └── images/               # Static assets (logo.png)
├── src/
│   ├── index.jsx / index.js  # React DOM root render
│   ├── index.css             # Base CSS styles
│   ├── App.jsx               # Root state holder & tab navigation
│   ├── types.ts              # Core TypeScript data interfaces
│   └── components/
│       ├── SalesDashboard.jsx   # Sales metrics & Chart.js visualizer
│       ├── InventoryManager.jsx # Product CRUD & stock in/out
│       ├── BillingManager.jsx   # Bill calculation & PDF receipt generation
│       └── CustomerManager.jsx  # Customer records & service reminder engine
├── package.json              # Dependencies and run scripts
└── GEMINI.md                 # Agent context & awareness file
```

---

## 4. State Management & Data Schema

### Root State (`src/App.jsx`)
- State lifted to `App.jsx` and synchronized via `useEffect` to `localStorage`.
- Handlers:
  - `updateInventory(newInventory)`
  - `updateCustomers(newCustomers)`
  - `addSale(sale)`

### `localStorage` Keys & Interfaces (`src/types.ts`)
| Key | Schema / Interface | Description |
| :--- | :--- | :--- |
| `draqua-inventory` | `Product[]` | `{ id: number, name: string, quantity: number, price: number }` |
| `draqua-customers` | `Customer[]` | `{ id: number, name: string, contact: string, history: Sale[] }` |
| `draqua-sales` | `Sale[]` | `{ invoice: string, customerId: number, items: (Product & { qty: number })[], total: number, date: Date \| string }` |

---

## 5. Key Component Responsibilities & Logic

### `src/components/SalesDashboard.jsx`
- Computes metrics: `dailySales`, `weeklySales` (<=7 days), `monthlySales` (same month/year), `totalRevenue`, `totalOrders`.
- Canvas bar chart using `Chart.js` with auto-cleanup on unmount (`chartInstance.current.destroy()`).
- Shows recent 5 sales invoices in reverse chronological order.

### `src/components/InventoryManager.jsx`
- Form handles both Add and Edit (`editingId` state).
- Stock quick actions: `+10` (Stock In) and `-5` (Stock Out with `Math.max(0, ...)` guard).
- Alert indicator: `Low Stock!` banner displayed when `product.quantity < 10`.

### `src/components/BillingManager.jsx`
- Select customer + select in-stock product + quantity.
- Generates invoice number with format: `INV-${Date.now()}`.
- Atomic commit on bill generation:
  1. `addSale(sale)`
  2. `updateInventory(...)` (decrements stock)
  3. `updateCustomers(...)` (appends `sale` to customer history)
- PDF generation via `jsPDF` (`new jsPDF('p', 'mm', 'a4')`), downloads `receipt-INV-<timestamp>.pdf`.

### `src/components/CustomerManager.jsx`
- Customer registration (`id: Date.now()`, empty `history: []`).
- Automated reminder interval (runs every 60s):
  - **1-month service check**: `diffMonths >= 1 && diffMonths < 2`
  - **2-month filter replacement**: `diffMonths >= 2`
- Displays last 3 purchases per customer with badge for remaining history.

---

## 6. Development Rules & Token-Efficiency Guidelines

1. **Avoid Unnecessary Searches**: Use the file map in Section 3 directly.
2. **Preserve State Synchronization**: Always pass state updates through `updateInventory`, `updateCustomers`, and `addSale` in `App.jsx` so `localStorage` stays in sync.
3. **Date Deserialization**: Stored `localStorage` dates deserialize as strings; always wrap with `new Date(sale.date)` before arithmetic or formatting.
4. **Styling Consistency**: Use Tailwind CSS utility classes; avoid inline CSS or incompatible CSS frameworks.
5. **Types Integrity**: When modifying data structures, update `src/types.ts` and ensure all 4 components stay compatible.
