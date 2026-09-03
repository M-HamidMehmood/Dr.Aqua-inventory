# Dr. Aqua Inventory & Management Dashboard — Master Roadmap

> **Vision**: Unify the physical shop inventory & POS system with the live customer-facing e-commerce portal ([dr-aqua-project.vercel.app](https://dr-aqua-project.vercel.app/)) into a synchronized, secure, omnichannel management platform.
> **Design Canvas**: [Google Stitch Project: Dr. Aqua Omni-Management Hub (4923791565326592961)](https://stitch.withgoogle.com/projects/4923791565326592961?pli=1)  
> **Design Theme**: **Hydraulic Precision** (`Outfit` Headlines, `Inter` Tabular Numbers, `#0369A1` Royal Blue, `#0EA5E9` Cyan Accent, `#0F172A` Slate Dark Sidebar, `#F8FAFC` Ice Slate Background)

---

## 📌 Project Status Overview

| Area | UI/UX Design (Stitch) | Code Implementation | Target State |
| :--- | :---: | :---: | :--- |
| **Design System & UI Suite** | ✅ **100% COMPLETE (24 Screens)** | ⏳ Pending (Specs Ready) | Full Stitch Design Specs Locked |
| **Authentication & RBAC** | ✅ Login + Forgot Password + 2FA | ⏳ Pending Phase 1 | Role-Based Access (Admin / Cashier / Field Tech) |
| **Executive Analytics** | ✅ Dashboard + Alerts + TDS Map | ⚠️ Basic Chart.js | Multi-period analytics & water hardness metrics |
| **Inventory & Catalog** | ✅ Table + Drawer + Restock + Barcode | ⚠️ Basic (`id`, `name`, `qty`, `price`) | 85%+ Viewport table, SKU generator, audit trail |
| **POS Billing & Invoicing** | ✅ Dual-Pane + A4 Receipt + QR + Z-Report | ⚠️ Basic Counter Form | Dual-pane visual catalog, A4 PDF receipts, Z-Report |
| **Customer CRM & Radar** | ✅ Table + 360° Drawer + WhatsApp Blast | ⚠️ Basic Reminder Math | Smart Radar urgency tabs, live WhatsApp templates |
| **Web Orders Sync** | ✅ Pipeline Board + Fulfillment Drawer | ⏳ Pending Phase 3 | Real-time sync with dr-aqua-project.vercel.app |
| **Technician Dispatch** | ✅ Dispatch Schedule + Work Order Modal | ⏳ Pending Phase 4 | Field tech dispatch & warehouse parts deduction |
| **System Settings** | ✅ Store, WhatsApp, Staff RBAC, Cloud Backup | ⏳ Pending Phase 5 | Central store & automated reminder configuration |

---

## 🎨 Phase 0: Master UI/UX Design Suite (Stitch Canvas: `4923791565326592961`) — [COMPLETED ✅]

All 24 screen artboards, companion drawers, modal dialogs, and interactive popovers have been designed, validated, and aligned on the Stitch infinite canvas:

### 1. 🔐 Authentication & Security Suite
- [x] **[Screen 1] Login & Role-Based Access Portal**: Split-screen with Dr. Aqua branding, technical highlights, and 3 role selection cards (`👑 Admin / Owner`, `🧾 POS Cashier`, `🛠️ Field Technician`).
- [x] **[Screen 2] Forgot Password & 6-Digit OTP Recovery**: Email/SMS OTP verification with countdown timer, password strength meter, and recovery confirmation.

### 2. 📊 Executive Analytics & Territorial Intelligence
- [x] **[Screen 3] Executive Sales Analytics Dashboard**: Real-time KPIs in PKR, multi-period Chart.js trends (7-Day, Weekly, Monthly), and urgent low-stock & radar due cards.
- [x] **[Screen 4] Top Segmented Notifications Popover**: Floating 360px alert center under the bell icon with `[ All ]`, `[ 🚨 Low Stock ]`, and `[ 📅 Service Due ]` tabs.
- [x] **[Screen 5] Bahawalpur Water Purity & TDS Intelligence Map**: Sector-by-sector ground water hardness tracker (Model Town, DHA Phase 5, Satellite Town, Industrial Estate) with membrane rejection metrics.

### 3. 📦 Omnichannel Inventory Management
- [x] **[Screen 6] Omnichannel Inventory Base View**: High-density table occupying **85%+ of screen height** (12–15 rows visible), 48px header with inline metric badges (`248 SKUs`, `Rs. 3.45M Value`, `4 Low Stock`), and pagination footer.
- [x] **[Screen 7] `+ Add / Edit Product` Slide-Over Drawer**: 540px drawer with SKU auto-generator, cost vs. selling price profit margin badge (`+35.7%`), stock alert threshold, and Vercel store toggle (`Live 🟢` vs `Draft`).
- [x] **[Screen 8] `Quick Restock (+10 / -5)` Stepper Modal**: 460px centered modal with 1-click stepper chips (`+5`, `+10`, `+25`, `+50`), stock preview (`3 ➔ 13 units`), and adjustment reason selector.
- [x] **[Screen 9] Barcode & Thermal Shelf Label Print Modal**: 500px modal with realistic 50mm x 30mm thermal label preview, barcode generator, and copies stepper.
- [x] **[Screen 10] Stock Movement & Audit Trail Log Drawer**: 580px ledger drawer recording all stock movements (Counter sales, tech allocations, supplier shipments, damaged write-offs).

### 4. 👥 Customer CRM & Smart Service Radar
- [x] **[Screen 11] Customer CRM Base View**: Unified table with machine model, install dates, and Smart Radar urgency tabs (`[ All (4,289) ]`, `[ 🚨 Overdue (12) ]`, `[ 🟡 Due This Week (21) ]`, `[ 🟢 Healthy ]`).
- [x] **[Screen 12] Customer 360° Detail & Service History Drawer**: 580px drawer showing installed machine card (`EcoFlow 300`), warranty status, 3-step service history timeline, and live green WhatsApp message bubble preview.
- [x] **[Screen 13] Bulk WhatsApp Service Reminder Broadcast Center**: Batch dispatch queue with customer checkmarks, dynamic variable tags (`{CustomerName}`, `{MachineModel}`), and anti-spam rate limiting.
- [x] **[Screen 14] `+ Add New Customer & Register Radar` Modal**: 460px quick customer registration modal with plant model, contact, and address.

### 5. 🧾 POS Billing & Counter Operations
- [x] **[Screen 15] POS Billing Hub (Base View)**: Dual-pane layout (left: visual catalog grid with search and category chips; right: dynamic checkout cart with customer selector & inline quick add).
- [x] **[Screen 16] A4 PDF Receipt & Print Preview Modal**: 680px modal with Dr. Aqua emblem, invoice `#INV-2023-8842`, itemized bill, total in PKR (`Rs. 28,500`), and Print / Download / WhatsApp actions.
- [x] **[Screen 17] Raast / JazzCash / EasyPaisa QR Digital Checkout Dialog**: 480px modal with dynamic QR code, merchant name, and real-time payment listener status.
- [x] **[Screen 18] End-of-Day Shift Closing & Cash Drawer (Z-Report) Modal**: Daily reconciliation modal showing expected cash, physical count input, variance indicator, and Z-report thermal print action.

### 6. 🛒 Omnichannel Web Orders Sync
- [x] **[Screen 19] Web Orders Inbox (Base View)**: Pipeline Kanban/Table board synced with [dr-aqua-project.vercel.app](https://dr-aqua-project.vercel.app/) (`New`, `Confirmed`, `In Assembly`, `Dispatched`, `Completed`).
- [x] **[Screen 20] Online Order Detail & Fulfillment Drawer**: 560px drawer with delivery address, warehouse stock reservation check, technician assignment dropdown, and packing slip printer.

### 7. 🛠️ Technician Dispatch & Work Orders
- [x] **[Screen 21] Field Technician Dispatch Board (Base View)**: Calendar and work order schedule board for filter installations and solar setups.
- [x] **[Screen 22] Create Service Ticket & Parts Allocation Modal**: 540px modal with customer site address, certified technician selector, and warehouse spare parts checklist.

### 8. ⚙️ System Settings & Configuration Suite
- [x] **[Screen 23] Settings: General Store, Branch & Invoicing**: Business identity, Bahawalpur branch address, currency PKR, invoice prefix `INV-`, and thermal receipt width.
- [x] **[Screen 24] Settings: WhatsApp Automation & Template Builder**: Live WhatsApp gateway connection status, automated trigger toggles, and chat template editor with live phone preview.
- [x] **[Screen 25] Settings: Staff Accounts & Role Permissions (RBAC) Matrix**: Staff accounts table and full permissions matrix across Admin, Cashier, and Field Technician.
- [x] **[Screen 26] Settings: Cloud Sync, Data Backup & JSON/CSV Export**: Automated cloud backup health, export center (Inventory CSV, Customers Excel, Sales Ledger), and system restore.

---

## 🗺️ Engineering & Code Implementation Roadmap

### 🔐 Phase 1: Authentication & Role-Based Access Control (RBAC)
- [ ] **1.1 Auth Manager Component (`src/components/AuthManager.jsx`)**
  - [ ] Implement login modal / portal matching Screen 1 design.
  - [ ] Implement Forgot Password / OTP modal matching Screen 2 design.
  - [ ] Role switcher: `Admin / Owner`, `POS Cashier`, `Field Technician`.
- [ ] **1.2 Protected Navigation & Permissions**
  - [ ] Cashier mode: Lock to POS Billing, Inventory lookup, and shift closing.
  - [ ] Technician mode: Lock to Service Radar and Work Tickets.
  - [ ] Admin mode: Unrestricted access across all modules and settings.

---

### 📦 Phase 2: Omnichannel Inventory Manager Upgrade
- [ ] **2.1 High-Density Data Grid (`src/components/InventoryManager.jsx`)**
  - [ ] Maximize table viewport to 85%+ of screen height.
  - [ ] Compact 48px header with inline metric pills (`SKUs`, `Value`, `Low Stock`).
  - [ ] Full bottom pagination (`< Prev [1] [2] ... Next >` with rows per page selector).
- [ ] **2.2 Slide-Over `+ Add Product` Drawer**
  - [ ] SKU auto-generator, cost vs. sell price profit margin calculation.
  - [ ] E-Commerce visibility toggle (`Live on Store` vs `Draft`).
- [ ] **2.3 Quick Restock & Audit Log**
  - [ ] Stepper modal with `+5`, `+10`, `+25`, `+50` quick chips.
  - [ ] Stock movement history ledger.

---

### 👥 Phase 3: Customer CRM & Smart Service Radar
- [ ] **3.1 High-Density Customer Table (`src/components/CustomerManager.jsx`)**
  - [ ] Smart Radar urgency filter tabs (`All`, `🚨 Overdue`, `🟡 Due Today`, `🟢 Healthy`).
  - [ ] Inline urgency badges and quick WhatsApp action buttons.
- [ ] **3.2 Customer 360° Detail Slide-Over Drawer**
  - [ ] Installed machine specs card and warranty validity.
  - [ ] Interactive 3-step service history timeline (Installation ➔ TDS Audit ➔ Filter Renewal).
- [ ] **3.3 Bulk WhatsApp Reminder Broadcast Center**
  - [ ] Multi-customer broadcast queue with customized templates.

---

### 🧾 Phase 4: POS Billing Hub & A4 PDF Invoicing
- [ ] **4.1 Dual-Pane POS Interface (`src/components/BillingManager.jsx`)**
  - [ ] Left pane: Visual product picker grid with stock status tags.
  - [ ] Right pane: Dynamic cart drawer with inline `+ Quick Add Customer` popover.
- [ ] **4.2 Instant A4 PDF Receipt Generation (`jsPDF`)**
  - [ ] Official Dr. Aqua emblem, invoice number, itemized table in PKR, and warranty terms.
  - [ ] 1-Click **Download PDF** and **Send to WhatsApp** actions.
- [ ] **4.3 Payment Methods & End-of-Day Z-Report**
  - [ ] Cash with tendered change calculation, JazzCash/EasyPaisa QR scan dialog.
  - [ ] Shift closing Z-Report calculation and cash reconciliation.

---

### 🛒 Phase 5: Web Orders Inbox & Technician Dispatch
- [ ] **5.1 Web Orders Pipeline (`src/components/WebOrdersManager.jsx`)**
  - [ ] Status lifecycle: `New` ➔ `Confirmed` ➔ `In Assembly` ➔ `Dispatched` ➔ `Completed`.
  - [ ] Sync with [dr-aqua-project.vercel.app](https://dr-aqua-project.vercel.app/).
- [ ] **5.2 Field Technician Dispatch Board (`src/components/ServiceManager.jsx`)**
  - [ ] Calendar schedule for filter and solar plant installations.
  - [ ] Service ticket creation modal with warehouse spare parts deduction on job completion.

---

### ⚙️ Phase 6: Settings Suite & Data Management
- [ ] **6.1 Store Profile & Invoicing Settings (`src/components/SettingsManager.jsx`)**
  - [ ] Company address, helpline, invoice prefix, and thermal print width.
- [ ] **6.2 WhatsApp Automation Builder**
  - [ ] 1-Month and 2-Month automated reminder templates with dynamic tags.
- [ ] **6.3 Cloud Backup & Data Export**
  - [ ] 1-Click export to CSV (Inventory, Customers, Sales ledger) and JSON snapshot restore.

---

## 🗂️ Master Component Map

```
Dr.Aqua-inventory/
├── TODO.md                             # Master Project Roadmap & Design Index
├── GEMINI.md                           # Core Project Directives & AI Agent Awareness
├── AGENTS.md                           # Quick Agent Lookup Index
├── public/
│   ├── index.html                      # Root HTML, Google Fonts (Outfit & Inter), Tailwind
│   └── images/logo.png                 # Dr. Aqua Official Droplet Logo
├── src/
│   ├── types.ts                        # Master TypeScript Data Interfaces
│   ├── App.jsx                         # Root State, Routing & LocalStorage Sync
│   ├── data/
│   │   └── mockData.js                 # Seed Data Synced with dr-aqua-project.vercel.app
│   └── components/
│       ├── Sidebar.jsx                 # 240px Fixed Dark Slate Sidebar (#0F172A)
│       ├── Navbar.jsx                  # Header with Global Search & Alerts Popover
│       ├── AuthManager.jsx             # Login, Forgot Password & Role Switcher
│       ├── SalesDashboard.jsx          # Executive Analytics, Chart.js & TDS Map
│       ├── InventoryManager.jsx        # 85%+ Viewport Table, Drawer & Restock Modal
│       ├── CustomerManager.jsx         # Customer CRM, Radar Tabs & WhatsApp Drawer
│       ├── BillingManager.jsx          # Dual-Pane POS, A4 Receipt & QR Modal
│       ├── WebOrdersManager.jsx        # E-Commerce Web Orders Pipeline
│       ├── ServiceManager.jsx          # Technician Dispatch & Spare Parts Tracking
│       └── SettingsManager.jsx         # Store Profile, WhatsApp & RBAC Settings
```
