# Dr. Aqua Dashboard — Standalone React App

A complete, role-governed business management system for Dr. Aqua water filtration and purification operations.

---

## 📌 Features

- 🔐 **Role-Based Authentication** — Secure login supporting **Admin**, **Cashier**, and **Technician** roles with strictly guarded views. *(See [AUTH.md](file:///Users/laptopchoice/Desktop/Dr.Aqua-inventory/AUTH.md))*.
- 📊 **Sales & Financial Dashboard** — Real-time revenue analytics, daily/weekly/monthly breakdown, and Chart.js visualizations (Admin only).
- 📦 **Inventory Management & Stock Lookup** — Full product catalog CRUD for Admin; fast stock search and availability lookup for Cashiers with low-stock alerts.
- 🧾 **POS Billing & PDF Receipts** — Multi-item bill creation, automatic stock deduction, and downloadable branded A4 PDF receipts.
- 👥 **Customer Directory & CRM** — Customer database with complete purchase history.
- 🔧 **Technician Field Portal** — 1-month maintenance checks, 2-month filter replacements, 1-click WhatsApp (`wa.me`) alerts, phone dialing, and service log tracking.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will launch on `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

### Build for Production

```bash
npm run build
```

---

## 🔑 Default Credentials

| Role | Username / Email | Password | Allowed Workspace |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` *(or `admin@draqua.pk`)* | `admin123` | Full access (Revenue, Inventory, Billing, Customers, Services) |
| **Cashier** | `cashier` *(or `cashier@draqua.pk`)* | `cashier123` | POS Billing & Check Stock |
| **Technician** | `tech` *(or `tech@draqua.pk`)* | `tech123` | Customer Service Visits & WhatsApp reminders |

---

## 🗺️ Roadmap & Documentation

- [AUTH.md](file:///Users/laptopchoice/Desktop/Dr.Aqua-inventory/AUTH.md) — Authentication architecture, session persistence, and RBAC matrix.
- [TODO.md](file:///Users/laptopchoice/Desktop/Dr.Aqua-inventory/TODO.md) — Master phased implementation roadmap.
- [AGENTS.md](file:///Users/laptopchoice/Desktop/Dr.Aqua-inventory/AGENTS.md) — Directives and architecture quick reference.
