# Project Context & Coding Rules

- **Application**: Dr. Aqua Business Management Dashboard
- **State Pattern**: All core entities (`inventory`, `customers`, `sales`) are managed centrally in `src/App.jsx` and persisted to `localStorage`.
- **LocalStorage Keys**:
  - `draqua-inventory`: Products list
  - `draqua-customers`: Customers list with purchase history
  - `draqua-sales`: Sales invoices
- **Conventions**:
  - Currency: `PKR`
  - Invoices formatted as `INV-${Date.now()}`
  - Service reminder thresholds: 1 month (`>= 1 && < 2`), 2 months (`>= 2`)
  - Low stock warning threshold: `< 10`
  - Maintain synchronization between `inventory`, `customers`, and `sales` during bill generation.
