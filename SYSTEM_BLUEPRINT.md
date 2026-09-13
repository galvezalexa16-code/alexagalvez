# System Architecture Blueprint
## Cafe/Restaurant POS and Management System

> **Stack:** TypeScript - Next.js 15 - Tailwind CSS - shadcn/ui - MySQL (Aiven) - Uploadthing - Vercel

---

## Table of Contents

1. System Overview
2. User Roles and Access Levels
3. Application Modules
4. Technical Architecture
5. Database Schema
6. API Routes
7. Authentication and Authorization
8. File Structure
9. Key UI Components
10. Deployment and DevOps
11. Screens Inventory

---

## 1. System Overview

A **dual-interface restaurant management system** consisting of:

| Interface | Audience | Access Method |
|-----------|----------|---------------|
| **Customer Web App** | Walk-in and dine-in customers | Mobile browser via QR Code |
| **Staff Dashboard** | Admin, Owner, Supervisor | Desktop browser (login) |

**Core Business Flows:**

`
Customer scans QR -> Browses Menu -> Adds to Cart -> Places Order
        |
        v
Staff processes payment -> Transaction logged -> Reports updated
`

---

## 2. User Roles and Access Levels

| Role | Dashboard | Orders | Menu | Users | Inventory | Reports | Transactions |
|------|-----------|--------|------|-------|-----------|---------|--------------|
| **Owner** | Full | View | View | View | View | Full | View |
| **Admin** | Full | View | Manage | Manage | No | Full | No |
| **Supervisor** | Full | View | Manage | View | Manage | View | View |
| **Customer** | No | Place | Browse | No | No | No | No |

### Role-Specific Sidebar Navigation

`
Owner:          Dashboard | Orders | Users | Menu | Inventory | Reports
Admin:          Dashboard | Users | Menu | Reports
Supervisor:     Dashboard | Orders | Users | Menu | Inventory | Reports
`

---

## 3. Application Modules

### 3.1 Customer-Facing Module (Mobile)

#### Landing / Menu Screen
- Promotional banner with featured items
- Category tabs: All, Rice Meals, Pasta, Pica-Pica/Snacks, Cakes, Coffee/Iced Drinks, Sweet Drinks
- Product cards with image, name, price
- Floating cart button with item count badge
- "Recommendations" section on landing

#### Item Detail Screen
- Full product image
- Item name and price
- Variation/size selector (e.g., Hot / Iced)
- Quantity selector
- "Add to Cart" button

#### Cart Screen
- Item list with quantity and subtotal
- Empty state with CTA to browse menu
- Order summary (total)
- "Place Order" button

#### QR Code Screens
- **Order QR**: Generated after order placement (links order to table/customer)
- **Counter QR**: Static QR displayed at counter for walk-in customers to scan and start ordering

---

### 3.2 Staff Dashboard Module (Desktop)

#### Authentication
- Role selection screen (selects which role's login form to show)
- Separate login views per role (Admin, Supervisor, Owner)
- JWT-based session with role-encoded claims

---

#### Dashboards

**Admin Dashboard**
- Inventory status cards (Low Stock / In Stock / Out of Stock)
- Top Selling Items bar chart
- Decision Support Insights panel:
  - Restock Recommendation
  - Consumption Trend
  - Fast-Moving Items
  - Stock Prediction

**Owner Dashboard** (same as Admin + wider nav)
- All Admin Dashboard widgets
- Additional: Most Used Ingredients (horizontal bar chart)
- Stock Level Distribution (donut chart)
- Usage Insights (text analysis)
- Inventory Restocking recommendations


#### Menu Management

- Category filter tabs: Pasta, Rice Meals, Pica-Pica/Snacks, Cakes, Coffee/Iced Drinks, Sweet Drinks
- Menu item cards: image, name, price, category badge, ingredients list
- Actions per card: Edit, Archive
- Top bar: Search, Add Category, Add Items, Archived
- Archived view to restore deleted items

Roles with access: Admin (no Inventory), Supervisor (with Inventory), Owner (full)

---

#### User Management

**Active Users View**
- Table: Name, Role, Status, Last Active, Action
- Status badges: Active (green), Archived (orange)
- Actions: View, Archived link
- Top bar: Search, Add User, Archived

**Archived Users View**
- Same table structure
- Action: Restored link
- Top bar: Search, View Active

Role badges: Admin (purple), Supervisor (blue)

---

#### Inventory Monitoring

- Category filter tabs: Pasta, Diary, Syrups, Powders, Baking, Sweetners, Meat
- Ingredients table: Ingredient, Category, Stock, Supplier, Expiry, Status, Updated by
- Status badges: Good (green), Low (yellow)
- Top bar: Search, Add Category, Add Stock

Roles with access: Supervisor, Owner

---

#### Reports

- Period selector: Day, Week, Month, Year
- Stat cards: Total Revenue, Total Expenses, Net Profit, Total Orders
- Revenue vs Expenses: grouped bar chart (by date)
- Profit Trend: line chart
- Top Menu Items: ranked list with revenue and order count
- Export: Print, Download CSV

Roles with access: Admin, Supervisor (view), Owner (full)

---

## 4. Technical Architecture

`
+-------------------------------------------------------------------+
|                         VERCEL (Hosting)                          |
|                                                                   |
|  +-------------------------------------------------------------+  |
|  |                     Next.js 15 App                          |  |
|  |                                                             |  |
|  |  +-----------------+    +------------------------------+   |  |
|  |  |  Customer App   |    |     Staff Dashboard           |   |  |
|  |  |  /menu (mobile) |    |  /dashboard (desktop)         |   |  |
|  |  |  React Server   |    |  React Server Components      |   |  |
|  |  |  Components     |    |  + Client Islands             |   |  |
|  |  +--------+--------+    +--------------+---------------+   |  |
|  |           |                            |                    |  |
|  |           +------------+---------------+                    |  |
|  |                        |                                    |  |
|  |              +---------v----------+                         |  |
|  |              |   Next.js API      |                         |  |
|  |              |   Route Handlers   |                         |  |
|  |              |  /api/...          |                         |  |
|  |              +---------+----------+                         |  |
|  +------------------------+-----------------------------------------+
|                           |                                    |
+---------------------------+------------------------------------+
                            |
           +----------------+-----------------+
           |                |                 |
   +-------+------+  +------+------+  +------+------+
   |  Aiven MySQL  |  | Uploadthing |  |  NextAuth   |
   |  (Cloud DB)   |  |  (Images)   |  |  (Sessions) |
   +---------------+  +-------------+  +-------------+
`

### Tech Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | Full-stack React, SSR, API routes |
| Language | TypeScript | Type safety across frontend and backend |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| UI Components | shadcn/ui | Pre-built accessible components |
| Database | MySQL via Aiven | Cloud-managed relational DB |
| ORM | Prisma | Type-safe DB queries, migrations |
| Auth | NextAuth.js v5 | Session management, role-based access |
| File Storage | Uploadthing | Menu item image uploads |
| Charts | Recharts | Revenue, profit, inventory charts |
| Deployment | Vercel | Serverless hosting, CI/CD |
| QR Code | qrcode npm | Order QR generation |

---

## 5. Database Schema (Prisma / MySQL)

`prisma
model User {
  id         Int       @id @default(autoincrement())
  name       String
  email      String    @unique
  password   String
  role       Role
  status     UserStatus @default(ACTIVE)
  lastActive DateTime?
  createdAt  DateTime  @default(now())

  updatedInventory InventoryItem[]
  transactions     Transaction[]
  expenses         Expense[]
}

enum Role {
  OWNER
  ADMIN
  SUPERVISOR
}

enum UserStatus {
  ACTIVE
  ARCHIVED
}

model MenuCategory {
  id    Int        @id @default(autoincrement())
  name  String
  slug  String     @unique
  items MenuItem[]
}

model MenuItem {
  id          Int           @id @default(autoincrement())
  categoryId  Int
  category    MenuCategory  @relation(fields: [categoryId], references: [id])
  name        String
  price       Decimal       @db.Decimal(10, 2)
  imageUrl    String
  isArchived  Boolean       @default(false)
  createdAt   DateTime      @default(now())
  variations  MenuItemVariation[]
  ingredients MenuItemIngredient[]
  orderItems  OrderItem[]
}

model MenuItemVariation {
  id         Int      @id @default(autoincrement())
  menuItemId Int
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id])
  name       String
  priceMod   Decimal  @db.Decimal(10, 2) @default(0)
}

model InventoryCategory {
  id    Int             @id @default(autoincrement())
  name  String
  items InventoryItem[]
}

model InventoryItem {
  id            Int               @id @default(autoincrement())
  categoryId    Int
  category      InventoryCategory @relation(fields: [categoryId], references: [id])
  name          String
  stockQuantity Decimal           @db.Decimal(10, 3)
  unit          String
  supplier      String
  expiryDate    DateTime?
  status        StockStatus       @default(GOOD)
  updatedById   Int
  updatedBy     User              @relation(fields: [updatedById], references: [id])
  updatedAt     DateTime          @updatedAt
  menuIngredients MenuItemIngredient[]
}

enum StockStatus {
  GOOD
  LOW
  OUT_OF_STOCK
}

model MenuItemIngredient {
  id              Int           @id @default(autoincrement())
  menuItemId      Int
  menuItem        MenuItem      @relation(fields: [menuItemId], references: [id])
  ingredientId    Int
  ingredient      InventoryItem @relation(fields: [ingredientId], references: [id])
  quantityNeeded  Decimal       @db.Decimal(10, 3)
  unit            String
}

model RestaurantTable {
  id      Int     @id @default(autoincrement())
  name    String
  qrCode  String  @unique
  orders  Order[]
}

model Order {
  id          Int             @id @default(autoincrement())
  tableId     Int?
  table       RestaurantTable? @relation(fields: [tableId], references: [id])
  orderType   OrderType
  status      OrderStatus     @default(PENDING)
  totalAmount Decimal         @db.Decimal(10, 2)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  items       OrderItem[]
  transaction Transaction?
}

enum OrderType {
  DINE_IN
  TAKE_OUT
}

enum OrderStatus {
  PENDING
  PREPARING
  READY
  COMPLETED
  CANCELLED
}

model OrderItem {
  id            Int                @id @default(autoincrement())
  orderId       Int
  order         Order              @relation(fields: [orderId], references: [id])
  menuItemId    Int
  menuItem      MenuItem           @relation(fields: [menuItemId], references: [id])
  variationId   Int?
  variation     MenuItemVariation? @relation(fields: [variationId], references: [id])
  quantity      Int
  unitPrice     Decimal            @db.Decimal(10, 2)
}

model Transaction {
  id            Int           @id @default(autoincrement())
  orderId       Int           @unique
  order         Order         @relation(fields: [orderId], references: [id])
  staffId       Int
  staff         User          @relation(fields: [staffId], references: [id])
  amountPaid    Decimal       @db.Decimal(10, 2)
  paymentMethod PaymentMethod
  status        PaymentStatus @default(PAID)
  createdAt     DateTime      @default(now())
}

enum PaymentMethod {
  CASH
  CARD
  QRPH
}

enum PaymentStatus {
  PAID
  REFUNDED
}

model Expense {
  id          Int      @id @default(autoincrement())
  description String
  amount      Decimal  @db.Decimal(10, 2)
  recordedById Int
  recordedBy  User     @relation(fields: [recordedById], references: [id])
  createdAt   DateTime @default(now())
}
`

---

## 6. API Routes

### Authentication
`
POST   /api/auth/[...nextauth]    -- NextAuth credential login/logout
GET    /api/auth/session          -- Current session info
`

### Customer-Facing (Public)
`
GET    /api/menu                  -- All active menu items
GET    /api/menu/[id]             -- Single item with variations
GET    /api/tables/[qrCode]       -- Resolve QR code to table
POST   /api/orders                -- Place order (creates order + items)
GET    /api/orders/[id]           -- Get order status (customer polling)
`

### Orders (Staff - Protected)
`
GET    /api/orders                -- All orders (filterable by status)
PATCH  /api/orders/[id]/status    -- Update status (PENDING->PREPARING->READY)
`

### Menu Management (Admin / Supervisor / Owner)
`
GET    /api/menu/categories       -- List all categories
POST   /api/menu/categories       -- Create category
GET    /api/menu/items            -- List items (archived filter)
POST   /api/menu/items            -- Create item + Uploadthing image
PATCH  /api/menu/items/[id]       -- Update item
PATCH  /api/menu/items/[id]/archive  -- Toggle archive
`

### User Management (Admin / Owner)
`
GET    /api/users                 -- List users (active/archived)
POST   /api/users                 -- Create user (hashed password)
PATCH  /api/users/[id]            -- Update user info/role
PATCH  /api/users/[id]/archive    -- Toggle archive/restore
`

### Inventory (Supervisor / Owner)
`
GET    /api/inventory             -- All ingredients by category
GET    /api/inventory/categories  -- Inventory categories
POST   /api/inventory/categories  -- Add category
POST   /api/inventory             -- Add ingredient/stock
PATCH  /api/inventory/[id]        -- Update stock quantity/status
`

### Transactions and Reports
`
GET    /api/transactions          -- List transaction records
POST   /api/transactions          -- Record payment
GET    /api/transactions/export   -- Download CSV
GET    /api/reports/summary       -- Revenue, expenses, profit, orders
GET    /api/reports/top-items     -- Top selling items ranked
GET    /api/reports/charts        -- Chart data by period (day/week/month/year)
`

---

## 7. Authentication and Authorization

### Strategy: NextAuth.js v5 with Credentials Provider

`	ypescript
// types/next-auth.d.ts
interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'SUPERVISOR';
}
`

### Route Protection (middleware.ts)

`	ypescript
// Public: /menu, /cart, /order/*, /qr/*, /login, /api/menu (GET), /api/orders (POST)
// Protected: /dashboard/*, /api/users/*, /api/inventory/*, etc.
// Role check: enforced inside each API route handler
`

### Role Guard Pattern

`	ypescript
// lib/auth-guard.ts
export function requireRole(session: Session, allowed: Role[]): void {
  if (!session?.user || !allowed.includes(session.user.role as Role)) {
    throw new Error('Forbidden');
  }
}

// Usage in API route:
const session = await getServerSession();
requireRole(session, ['ADMIN', 'OWNER']);
`

---

## 8. File Structure

`
/
+-- app/
|   +-- (customer)/
|   |   +-- menu/
|   |   |   +-- page.tsx              # Menu landing
|   |   |   +-- [itemId]/page.tsx     # Item detail
|   |   +-- cart/page.tsx
|   |   +-- order/[orderId]/page.tsx  # Post-order QR
|   |   +-- qr/[tableId]/page.tsx     # Table QR entry
|   |
|   +-- (staff)/
|   |   +-- login/page.tsx            # Role selector + login
|   |   +-- dashboard/
|   |   |   +-- page.tsx              # Role-aware dashboard
|   |   |   +-- orders/page.tsx
|   |   |   +-- menu/page.tsx
|   |   |   +-- users/page.tsx
|   |   |   +-- inventory/page.tsx
|   |   |   +-- reports/page.tsx
|   |   |   +-- transactions/page.tsx
|   |
|   +-- api/
|   |   +-- auth/[...nextauth]/route.ts
|   |   +-- menu/route.ts
|   |   +-- menu/[id]/route.ts
|   |   +-- menu/categories/route.ts
|   |   +-- orders/route.ts
|   |   +-- orders/[id]/route.ts
|   |   +-- orders/[id]/status/route.ts
|   |   +-- users/route.ts
|   |   +-- users/[id]/route.ts
|   |   +-- inventory/route.ts
|   |   +-- inventory/[id]/route.ts
|   |   +-- transactions/route.ts
|   |   +-- reports/route.ts
|   |   +-- uploadthing/route.ts
|   |
|   +-- layout.tsx
|   +-- globals.css
|
+-- components/
|   +-- customer/
|   |   +-- MenuGrid.tsx
|   |   +-- ItemCard.tsx
|   |   +-- ItemDetail.tsx
|   |   +-- CartSheet.tsx
|   |   +-- CategoryTabs.tsx
|   |   +-- QRDisplay.tsx
|   |
|   +-- staff/
|   |   +-- layout/
|   |   |   +-- Sidebar.tsx           # Role-aware sidebar
|   |   |   +-- TopBar.tsx
|   |   |   +-- DashboardLayout.tsx
|   |   +-- dashboard/
|   |   |   +-- StatCard.tsx
|   |   |   +-- RevenueChart.tsx
|   |   |   +-- ProfitTrendChart.tsx
|   |   |   +-- TopItemsList.tsx
|   |   |   +-- InventoryStatusCard.tsx
|   |   |   +-- DecisionInsights.tsx
|   |   |   +-- IngredientUsageChart.tsx
|   |   |   +-- StockDistributionChart.tsx
|   |   +-- orders/
|   |   |   +-- OrderTable.tsx
|   |   |   +-- OrderStatusBadge.tsx
|   |   +-- menu/
|   |   |   +-- MenuItemCard.tsx
|   |   |   +-- MenuItemForm.tsx
|   |   |   +-- MenuCategoryTabs.tsx
|   |   +-- users/
|   |   |   +-- UserTable.tsx
|   |   |   +-- UserForm.tsx
|   |   |   +-- RoleBadge.tsx
|   |   +-- inventory/
|   |       +-- InventoryTable.tsx
|   |       +-- StockForm.tsx
|   |       +-- StockStatusBadge.tsx
|   |
|   +-- ui/                           # shadcn/ui (auto-generated)
|
+-- lib/
|   +-- auth.ts                       # NextAuth.js config
|   +-- auth-guard.ts                 # Role guard helpers
|   +-- db.ts                         # Prisma singleton
|   +-- uploadthing.ts                # Uploadthing config
|   +-- utils.ts                      # cn() and shared helpers
|
+-- prisma/
|   +-- schema.prisma
|   +-- migrations/
|   +-- seed.ts                       # Seed initial data
|
+-- types/
|   +-- index.ts                      # Shared TypeScript types/enums
|
+-- middleware.ts                      # Route auth protection
+-- next.config.ts
+-- tailwind.config.ts
+-- components.json                    # shadcn/ui config
+-- .env.local
+-- .env.example
`

---

## 9. Key UI Components (shadcn/ui Mapping)

| Feature | shadcn/ui Components |
|---------|---------------------|
| Data tables (orders, users, inventory) | Table, TableHeader, TableRow, Badge |
| Forms (login, add user, add item) | Form, Input, Select, Label, Button |
| Modal dialogs (add/edit records) | Dialog, DialogContent, DialogHeader |
| Category / period filter tabs | Tabs, TabsList, TabsTrigger, TabsContent |
| Dropdown actions | DropdownMenu, DropdownMenuItem |
| Search bars | Input + Lucide Search icon |
| Staff sidebar navigation | Sheet (collapsed), custom Sidebar |
| Notifications and toasts | Sonner |
| Stat cards | Card, CardContent, CardHeader, CardTitle |
| Revenue/profit charts | Recharts inside Card |
| Image upload | Uploadthing UploadButton |
| Mobile cart slide-over | Sheet, SheetContent |
| QR Code display | Custom component (qrcode library) |
| Avatar (staff profile) | Avatar, AvatarFallback |
| Confirmation prompts | AlertDialog |
| Loading skeletons | Skeleton |

---

## 10. Deployment and DevOps

### Environment Variables (.env.local)

`env
# Aiven MySQL Database
DATABASE_URL="mysql://user:password@host:port/dbname?ssl-mode=required"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Uploadthing
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"

# App
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
`

### Vercel Deployment

- **Production branch:** main
- **Preview branches:** dev, feature/*
- All env vars configured in Vercel project settings
- postbuild script runs: prisma migrate deploy

### Aiven MySQL Setup

- Cloud-managed MySQL cluster (Aiven)
- SSL required: use CA cert from Aiven dashboard
- Prisma datasource: provider = "mysql" with SSL URL
- Automated daily backups via Aiven

### Uploadthing Configuration

- Menu item images stored in Uploadthing CDN
- Max file size: 4MB per image
- Accepted formats: image/jpeg, image/png, image/webp
- File router defined at pp/api/uploadthing/route.ts

### CI/CD Flow

`
Developer push
    |
    v
GitHub repository
    |
    v
Vercel auto-build (preview URL per PR)
    |
    v
PR approved + merged to main
    |
    v
Vercel production deploy
    |
    v
prisma migrate deploy (postbuild)
`

---

## 11. Screens Inventory

### Customer Web (Mobile) - 17 Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Landing / Menu | /menu | Full menu with recommendations |
| Menu (Category filtered) | /menu?cat=iced-drinks | Filtered by category |
| Menu (with cart badge) | /menu | Cart item count shown |
| Menu (Americano promo) | /menu | Promo highlighted item |
| Item Detail - Americano | /menu/[id] | With Hot/Iced variations |
| Item Detail - Chicken Alfredo | /menu/[id] | Food item detail |
| Item Detail - Filipino Breakfast | /menu/[id] | Food item detail |
| Cart (empty) | /cart | Empty state with CTA |
| Cart (1 item) | /cart | Order summary |
| QR Code - Order | /order/[orderId] | Post-order confirmation QR |
| QR Code - Counter | /qr/[tableId] | Static counter QR |

### Staff Dashboard (Desktop) - 44 Screens

| Screen | Route | Roles |
|--------|-------|-------|
| Role Selection | /login | Public |
| Login - Generic | /login | Public |
| Login - Admin | /login?role=admin | Public |
| Login - Supervisor | /login?role=supervisor | Public |
| Login - Owner | /login?role=owner | Public |
| Admin Dashboard | /dashboard | ADMIN |
| Owner Dashboard | /dashboard | OWNER |
| Owner All Orders | /dashboard/orders | OWNER |
| Supervisor Transactions | /dashboard/transactions | SUPERVISOR |
| Admin User Management | /dashboard/users | ADMIN |
| Owner User Management | /dashboard/users | OWNER |
| Admin Archived Users | /dashboard/users/archived | ADMIN |
| Owner Archived Users | /dashboard/users/archived | OWNER |
| Owner Inventory (Pasta) | /dashboard/inventory | OWNER |
| Supervisor Inventory (Dairy) | /dashboard/inventory | SUPERVISOR |
| Supervisor Inventory (Powders) | /dashboard/inventory | SUPERVISOR |
| Supervisor Inventory (Baking) | /dashboard/inventory | SUPERVISOR |
| Supervisor Inventory (Sweeteners) | /dashboard/inventory | SUPERVISOR |
| Supervisor Inventory (Syrups) | /dashboard/inventory | SUPERVISOR |
| Admin Menu (Pasta) | /dashboard/menu | ADMIN |
| Supervisor Menu (Breakfast) | /dashboard/menu | SUPERVISOR |
| Supervisor Menu (Fries) | /dashboard/menu | SUPERVISOR |
| Supervisor Menu (Cake) | /dashboard/menu | SUPERVISOR |
| Supervisor Menu (Spanish Latte) | /dashboard/menu | SUPERVISOR |
| Supervisor Menu (Frappe) | /dashboard/menu | SUPERVISOR |
| Owner Menu (Pasta) | /dashboard/menu | OWNER |
| Owner Menu (Breakfast) | /dashboard/menu | OWNER |
| Owner Menu (Fries) | /dashboard/menu | OWNER |
| Owner Menu (Cake) | /dashboard/menu | OWNER |
| Owner Menu (Spanish Latte) | /dashboard/menu | OWNER |
| Owner Menu (Frappe) | /dashboard/menu | OWNER |
| Admin Reports | /dashboard/reports | ADMIN |
| Owner Reports | /dashboard/reports | OWNER |

---

*Generated from Figma export analysis - Customer Web (17 screens) and Staff/Admin Capstone (44 screens)*
*Stack: TypeScript - Next.js 15 - Tailwind CSS - shadcn/ui - Prisma - MySQL (Aiven) - Uploadthing - Vercel*
