# Dr. Aqua Dashboard — Authentication & Role-Based Access Control (RBAC)

## 📌 Overview
The Dr. Aqua Business Management Dashboard is secured with an authentication and authorization layer. Access to tabs, financial metrics, and operational actions is strictly governed by the user's authenticated role.

---

## 🔐 Authentication Architecture

1. **Standard Sign-In UX**:
   - The user enters their **Work Email Address** (or username) and **Password**.
   - No pre-login role selectors or buttons are present.
   - Upon form submission, the authentication service validates credentials and resolves the user's profile and assigned role (`admin`, `cashier`, or `technician`).

2. **Session Persistence**:
   - The active session is stored in browser `localStorage` under `draqua-current-user`.
   - On page refresh, the session is rehydrated automatically.
   - Clicking **Sign Out** clears the session token and redirects to the sign-in screen.

---

## 🔑 Default Accounts & Credentials

| Role | Username / Email | Password | Assigned Permissions |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin` *(or `admin@draqua.pk`)* | `admin123` | **Full Access**: Financial analytics, full inventory CRUD, price edits, POS billing, customer CRM, and service visits. |
| 🧾 **Cashier** | `cashier` *(or `cashier@draqua.pk`)* | `cashier123` | **POS & Stock Lookup Only**: Can bill orders and check inventory quantities. Cannot view revenue, edit prices, or delete items. |
| 🔧 **Technician** | `tech` *(or `tech@draqua.pk`)* | `tech123` | **Field Service Visits Only**: Dedicated view of 1-month checks and 2-month filter replacements, 1-click WhatsApp alerts, phone calls, and completion logs. |

---

## 🛡️ Role-Based Access Matrix

| Feature / Workspace | Admin (`admin`) | Cashier (`cashier`) | Technician (`tech`) |
| :--- | :---: | :---: | :---: |
| **Financial Dashboard** (`SalesDashboard.jsx`)<br>• Revenue cards, daily/weekly/monthly charts | ✅ Full Access | ❌ Hidden & Guarded | ❌ Hidden & Guarded |
| **POS Billing Terminal** (`BillingManager.jsx`)<br>• Create invoices, stock deduction, PDF receipts | ✅ Full Access | ✅ Full Access | ❌ Hidden & Guarded |
| **Stock Lookup & Search** (`InventoryManager.jsx`)<br>• Search items, check quantity, low-stock alerts | ✅ Full Access | ✅ Allowed | ❌ Hidden & Guarded |
| **Product Catalog Management** (`InventoryManager.jsx`)<br>• Add product, edit price, delete item, stock in/out | ✅ Full Access | ❌ Restricted | ❌ Hidden & Guarded |
| **Customer Directory & CRM** (`CustomerManager.jsx`)<br>• Customer registry & full purchase logs | ✅ Full Access | ❌ Hidden & Guarded | ❌ Hidden & Guarded |
| **Service & Maintenance Visits** (`TechnicianView.jsx`)<br>• Due service checks, WhatsApp alerts, call button | ✅ Full Access | ❌ Hidden & Guarded | ✅ Dedicated Portal |

---

## 📁 Source Implementation Map

- **Data Models**: [src/types.ts](file:///Users/laptopchoice/Desktop/Dr.Aqua-inventory/src/types.ts) — Defines `UserRole`, `User`, and `ServiceRecord` interfaces.
- **Auth Engine & Storage**: [src/utils/auth.js](file:///Users/laptopchoice/Desktop/Dr.Aqua-inventory/src/utils/auth.js) — Credential validation, username/email parsing, and session persistence.
- **Login Component**: [src/components/AuthManager.jsx](file:///Users/laptopchoice/Desktop/Dr.Aqua-inventory/src/components/AuthManager.jsx) — Form with password visibility toggle and error validation.
- **Technician Field Portal**: [src/components/TechnicianView.jsx](file:///Users/laptopchoice/Desktop/Dr.Aqua-inventory/src/components/TechnicianView.jsx) — Maintenance intervals, 1-click WhatsApp (`wa.me`) messages, and service completion logs.
- **Guarded Navigation & State**: [src/App.jsx](file:///Users/laptopchoice/Desktop/Dr.Aqua-inventory/src/App.jsx) — Dynamic role tabs, top navigation header with user identity badge, and route protection.

---

## 🚀 Running on Localhost

```bash
# Start development server
npm start
```

If port 3000 is occupied by another application, the system automatically runs on:
👉 **`http://localhost:3001`**
