# System Blueprint - Local Setup Guide

A complete cafe/restaurant POS and management system with dual interfaces (customer mobile + staff dashboard).

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **MySQL** (local or Docker)
- **.env.local** file configured (see below)

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` with your database connection:

```env
DATABASE_URL="mysql://root:password@localhost:3306/ericahticos_db"
NEXTAUTH_SECRET="generate-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
UPLOADTHING_SECRET="sk_test_xxx"
UPLOADTHING_APP_ID="your_app_id"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Setup Database

```bash
# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 Demo Access

### Staff Dashboard

**Login:** http://localhost:3000/login

Credentials:
- **Owner:** owner@ericahticos.com / password123
- **Admin:** admin@ericahticos.com / password123
- **Supervisor:** supervisor@ericahticos.com / password123

### Customer Menu

**Direct Access:** http://localhost:3000/menu

**Via Counter QR:** http://localhost:3000/qr/6 (auto-redirects to menu with table context)

---

## 🎯 Feature Walkthrough

### Customer Flow

1. **Access Menu** → http://localhost:3000/menu
2. **Browse Items** - Filter by category, search by name
3. **Add to Cart** - Click item → Select variations/size → Pick quantity → Add
4. **Checkout** - View cart → Select order type (Dine In / Take Out) → Place Order
5. **Order Status** - Get order QR → See real-time status updates → Receive notifications

### Staff Dashboard

**Navigation:**
- Dashboard (Revenue, Orders, Inventory Status, Insights)
- Orders (View pending, Update status PENDING→PREPARING→READY→COMPLETED)
- Inventory (View stock, Add items, Update quantities, See low-stock alerts)
- Reports (Revenue trends, Profit charts, Top items, By period)

**Key Actions:**
- Dashboard: View summary stats and decision support alerts
- Orders: Filter by status, click "Next" to progress order
- Inventory: Add items, edit quantities, auto-status calculation
- Reports: Select period (Day/Week/Month/Year), view analytics

---

## 🗄️ Database Schema

### Key Tables

- **User** - Staff accounts (Owner/Admin/Supervisor)
- **MenuItem** - Menu items with variations
- **Order** - Customer orders with items
- **Transaction** - Payment records
- **InventoryItem** - Ingredient stock tracking
- **RestaurantTable** - Dine-in table mappings
- **Expense** - Cost records for profit calculation

### Status Values

**Order Status:** PENDING → PREPARING → READY → COMPLETED

**Inventory Status:** 
- GOOD (qty ≥ 20)
- LOW (qty < 20)
- OUT_OF_STOCK (qty = 0)

---

## 📊 Analytics & Reporting

### Dashboard Insights

Real-time alerts for:
- Low stock items
- Best-selling items
- Stock depletion predictions

### Reports Page Features

- **Period Selector** - Day, Week, Month, Year
- **Summary Stats** - Revenue, Expenses, Profit, Order count
- **Charts** - Revenue vs Expenses (bar), Profit Trend (line)
- **Top Items** - Ranked by revenue

---

## 🔄 API Overview

### Customer APIs
- `GET /api/menu` - Browse menu items
- `POST /api/orders` - Place order
- `GET /api/orders/[id]` - Order status
- `GET /api/orders/[id]/qr` - Generate QR code
- `POST /api/transactions` - Record payment

### Staff APIs
- `GET /api/orders` - List orders
- `PATCH /api/orders/[id]/status` - Update order status
- `GET /api/inventory` - List inventory
- `POST /api/inventory` - Add ingredient
- `PATCH /api/inventory/[id]` - Update stock

### Reports APIs
- `GET /api/reports/summary` - Stats by period
- `GET /api/reports/revenue` - Revenue trend
- `GET /api/reports/profit` - Profit analysis
- `GET /api/reports/top-items` - Best sellers

---

## 🛠️ Development Commands

```bash
# Development
npm run dev

# Build for production
npm run build
npm run start

# Database management
npm run db:push       # Sync schema
npm run db:seed       # Populate demo data
npm run db:reset      # Reset database (⚠️ destructive)

# Linting
npm run lint
```

---

## 🐛 Troubleshooting

### Database Connection Error

- Verify MySQL is running
- Check DATABASE_URL in .env.local
- Ensure database exists

### Seed Script Fails

```bash
# Force reset database first
npm run db:reset

# Then seed again
npm run db:seed
```

### Port 3000 in Use

```bash
npm run dev -- -p 3001
```

### Missing Dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🚢 Production Deployment

### Vercel

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Enable postbuild script: `prisma migrate deploy`

### Environment Setup

```env
DATABASE_URL="mysql://user:pass@host:port/dbname"
NEXTAUTH_SECRET="<generate-secure-secret>"
NEXTAUTH_URL="https://your-domain.vercel.app"
UPLOADTHING_SECRET="<get-from-uploadthing>"
UPLOADTHING_APP_ID="<get-from-uploadthing>"
```

---

## 📝 Project Structure

```
/app
  /(customer)        # Public customer interface
  /(staff)           # Protected staff dashboard
  /api              # API routes
/components
  /customer         # Customer UI components
  /staff           # Staff dashboard components
  /ui              # Reusable UI components (shadcn/ui)
/lib
  auth.ts          # NextAuth configuration
  analytics.ts     # Business logic & calculations
  cart-store.ts    # Client-side cart (Zustand)
/prisma
  schema.prisma    # Database schema
  seed.ts          # Demo data generator
```

---

## 🎓 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** MySQL (Prisma ORM)
- **Auth:** NextAuth.js v5
- **UI:** shadcn/ui + Tailwind CSS
- **Charts:** Recharts
- **State:** Zustand
- **Notifications:** Sonner
- **File Upload:** Uploadthing

---

## 📞 Support

For issues or questions, check:
1. Error messages in console/terminal
2. Database connection settings
3. Environment variables in .env.local
4. SYSTEM_BLUEPRINT.md for feature details

---

**Happy coding! 🚀**
