©# Dr. Aqua Inventory & Management Dashboard — Master Roadmap

> **Vision**: Unify the physical shop inventory & POS system with the live customer-facing e-commerce portal ([dr-aqua-project.vercel.app](https://dr-aqua-project.vercel.app/)) into a synchronized, secure, omnichannel management platform.

---

## 📌 Project Status Overview

| Area | Current State | Target State |
| :--- | :--- | :--- |
| **Authentication** | ✅ Role-Based Login & RBAC | 🔒 Role-Based Login (Admin, Cashier, Technician) |
| **Storage & Sync** | ✅ Cloud DB (Supabase) + Offline-first Queue | ☁️ Cloud DB (Real-time sync with Vercel) |
| **Catalog** | ✅ 15 SKUs + Bilingual + Cloudinary CDN | 📦 Rich (Categories, SKU, Images, Visibility) |
| **Orders & POS** | ✅ Omnichannel (Shop POS + Web Orders Inbox) | 🛒 Omnichannel (Shop POS + Web Orders Inbox) |
| **Services & Reminders** | ✅ WhatsApp Engine, Appointments & Parts Deduction | 📲 Customer Service Reminders & WhatsApp Alerts |
| **Analytics** | ✅ Omnichannel Revenue, Channels & Payment Methods | 📈 Omnichannel Sales, Profit & Stock Velocity |

---

## 🗺️ Phased Implementation Plan

### 🔐 Phase 1: Authentication & Role-Based Access Control (RBAC)
*Essential foundational security for the administrative and financial dashboard.*

- [x] **1.1 Authentication Provider Setup**
  - [x] Implement secure login screen (`src/components/AuthManager.jsx`).
  - [x] Session management (persistent secure sessions via `localStorage` with `src/utils/auth.js`).
  - [x] Quick role demo profiles for testing and validation.
- [x] **1.2 Role-Based Permissions (RBAC)**
  - [x] **Admin Role**: Full access (Financial analytics, delete inventory, alter product base prices, manage users, service visits).
  - [x] **Staff / Cashier Role**: Restricted access (Create POS bills, view and search stock; cannot view revenue, cannot delete/alter product prices).
  - [x] **Technician Role**: Service visits view only (Field view, WhatsApp reminders, mark maintenance completed).
- [x] **1.3 Protected Routes & Navigation**
  - [x] Guard all dashboard tabs behind authentication.
  - [x] Role-sensitive UI elements & dynamic tab navigation.
  - [x] Fast role-switching header selector for pair programming and testing.

---

### 📦 Phase 2: Product Catalog & Schema Upgrade (E-Commerce Alignment)
*Bridge the data structure between the Vercel store and the inventory system.*

- [x] **2.1 Extended Data Model in `src/types.ts`**
  - [x] Added `category`: `Residential` | `Commercial` | `Filters` | `Spare Parts`.
  - [x] Added `sku`, `urduName`, `brand`, `image`, `onlinePriceRange`, `onlineVisible`, and `specifications`.
  - [x] Added `onlineVisible`: `true` (Online & Shop) vs. `false` (Shop Only).
- [x] **2.2 Inventory Manager UI Refresh (`src/components/InventoryManager.jsx`)**
  - [x] Added Category Filter tabs: `All`, `Residential`, `Commercial`, `Filters`, `Shop Only`.
  - [x] Added interactive "Online vs. Shop-Only" toggle switch button for every product.
  - [x] Quick search by Product Name, Urdu Name, SKU code, or Brand.
  - [x] Dynamic stock indicators and quick adjustment buttons (+10 / -5) for Admin.
  - [x] Product images thumbnail with fallback and rich metadata display.
- [x] **2.3 Seed Catalog with Live Website Products**
  - [x] Scraped and synchronized all 15 authentic products from `dr-aqua-project.vercel.app`.
  - [x] Assigned standard SKU codes (e.g., `DA-RO-2S`, `DA-RO-100G-ST`, `DA-CT-PP5M`).
  - [x] Created `src/data/productsCatalog.js` and comprehensive catalog documentation in `PRODUCTS_CATALOG.md`.
  - [x] Backward-compatible inventory migration in `src/App.jsx`.

---

### 🛒 Phase 3: Omnichannel Order Management & POS Upgrades
*Bridge online e-commerce website orders with in-shop counter billing.*

- [x] **3.1 Web Orders Inbox Module (`src/components/WebOrdersManager.jsx`)**
  - [x] Dedicated sidebar tab for Orders Inbox with unread/pending badge counter.
  - [x] Receive orders placed online from `dr-aqua-project` (Customer Name, Contact, Address, SKUs, Totals).
  - [x] Filter by statuses: `All`, `Pending`, `Dispatched`, `Completed`.
- [x] **3.2 Order Status Lifecycle Progression**
  - [x] Three-stage status progression: `Pending` ➔ `Dispatched` ➔ `Completed`.
  - [x] Stock decrement: Moving to `Dispatched` atomically reserves/deducts items from shop stock.
  - [x] Record completed orders directly into Financial Analytics and Customer CRM.
- [x] **3.3 Multi-Method Payment Options**
  - [x] Available across both Web Orders and POS Billing:
    - 💵 **Cash** (Counter Cash / Cash on Delivery - COD)
    - 📱 **JazzCash / EasyPaisa** (With optional Transaction ID / Reference #)
    - 🏦 **Bank Transfer** (With Bank Name & Reference / Slip #)
  - [x] Reflect payment method on PDF receipts and revenue breakdown.

---

### 🛠️ Phase 4: Service & Installation Engine
*Schedule RO plant and solar installations, auto-deduct spare parts upon repair, and dispatch WhatsApp alerts.*

- [x] **4.1 Booking & Scheduling Module (`src/components/ServiceManager.jsx`)**
  - [x] Dedicated sidebar tab for Service & Bookings.
  - [x] Schedule appointments for:
    - 💧 **RO Plant Installation** (Commercial / Residential)
    - ☀️ **Solar System Installation**
    - 🔧 **Periodic Maintenance & Filter Replacement**
    - 🧪 **Water TDS Inspection & Membrane Flushing**
  - [x] Date picker, time slot, customer location, and assigned technician (`Farhan Technician`, etc.).
  - [x] Booking statuses: `Scheduled` ➔ `In Progress` ➔ `Completed` ➔ `Cancelled`.
- [x] **4.2 Auto-Deduct Replacement Filter Parts upon Repair**
  - [x] When settling or completing a repair/service job, technician selects spare parts/cartridges used (Sediment filters, CTO carbon, RO membrane).
  - [x] Automatically deducts replacement parts from warehouse inventory stock.
  - [x] Logs replaced parts and date into customer's maintenance history.
- [x] **4.3 1-Click WhatsApp Button (`wa.me`) with Interactive Message Preview**
  - [x] WhatsApp dialog/modal showing a realistic **WhatsApp chat message bubble preview**.
  - [x] Editable text before sending (Bilingual: Urdu Nastaliq & English).
  - [x] Templates for:
    - 📅 Service booking & technician assignment confirmation.
    - 🔔 1-month routine maintenance reminder.
    - 🔄 2-month filter cartridge replacement reminder.
    - ✅ Service completion & water TDS test report.

---

### ☁️ Phase 5: Cloud Synchronization & Vercel Store Integration
*Connect the Vercel Next.js frontend and this React Inventory Dashboard to a single shared backend.*

- [x] **5.1 Database Layer Migration**
  - [x] Provisioned Supabase PostgreSQL schema with RLS: `draqua_products`, `draqua_orders`, `draqua_customers`, `draqua_bookings`, `draqua_sales`.
  - [x] Seeded authentic product catalog and initial orders into cloud database.
  - [x] Offline-first resilience: local changes queue to `draqua-offline-queue` when disconnected and automatically drain upon internet reconnection.
- [x] **5.2 API & Real-Time Sync between Web & Dashboard**
  - [x] Connected Next.js storefront checkout (`dr-aqua-project/src/app/checkout/page.tsx`) to push web orders to Supabase `draqua_orders`.
  - [x] Periodic background polling (15s) and auto-reconciliation in dashboard (`src/App.jsx`).
  - [x] Visual Cloud Sync status indicator (`🟢 Cloud Synced` / `🟡 X Queued` / `🔴 Offline`) in top context bar and mobile header.
  - [x] Interactive `CloudSyncModal.jsx` featuring master two-way sync and live Vercel order simulation.

---

### 🧪 Phase 6: Testing, Polish & Deployment
- [x] Production build verification (`npm run build` compiled cleanly).
- [x] Visual and functional validation using Chrome DevTools MCP automation across English and Urdu Nastaliq RTL.
- [x] Mobile/Tablet responsive header and slide-over navigation.

---

## 🗂️ Key Component & Directory Map

```
Dr.Aqua-inventory/
├── TODO.md                             # 📍 THIS FILE (Master Project Roadmap)
├── GEMINI.md                           # Core Project Directives & AI Agent Awareness
├── AGENTS.md                           # Quick Agent Lookup Index
├── src/
│   ├── types.ts                        # Master TypeScript Data Interfaces
│   ├── App.jsx                         # Root State, Routing, Cloud Polling & Navigation
│   ├── context/
│   │   └── LanguageContext.jsx         # Bilingual Provider (English / Urdu Nastaliq RTL)
│   ├── services/
│   │   └── cloudSyncService.js         # Offline-first Supabase Cloud Synchronization Service
│   └── components/
│       ├── AuthManager.jsx             # [Phase 1] Login & Role-Based Auth
│       ├── SalesDashboard.jsx          # [Phase 3] Analytics, Channel Revenue & Payment Breakdown
│       ├── InventoryManager.jsx        # [Phase 2] Product Catalog, Stock Adjustments & CDN Photos
│       ├── BillingManager.jsx          # [Phase 3] POS Billing, Multi-Method Payments & PDF Receipts
│       ├── WebOrdersManager.jsx        # [Phase 3] Online Orders Inbox, Dispatch & Packing Slips
│       ├── CustomerManager.jsx         # [Phase 4] Customer CRM & Maintenance Histories
│       ├── ServiceManager.jsx          # [Phase 4] RO & Solar Installation Scheduling & Parts Auto-Deduct
│       ├── WhatsAppPreviewModal.jsx    # [Phase 4] WhatsApp Bubble Preview & 1-Click wa.me Dispatch
│       └── CloudSyncModal.jsx          # [Phase 5] Cloud Sync Hub & Vercel Storefront Simulator
```
