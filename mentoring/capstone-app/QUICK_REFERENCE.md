# 🚀 System Blueprint - Quick Reference Card

## ⚡ 60-Second Setup

```bash
cd /mentoring/capstone-app
npm install
npm run db:push
npm run db:seed
npm run dev
```

Then open:
- **Customer:** http://localhost:3000/menu
- **Staff:** http://localhost:3000/login (password123)

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@ericahticos.com | password123 |
| Admin | admin@ericahticos.com | password123 |
| Supervisor | supervisor@ericahticos.com | password123 |

---

## 📍 Key URLs

### Customer
- `/menu` - Browse menu
- `/menu/[id]` - Item detail
- `/cart/checkout` - Checkout
- `/order/[id]` - Order status
- `/qr/[tableId]` - Counter QR

### Staff
- `/login` - Login page
- `/dashboard` - Main dashboard
- `/dashboard/orders` - Order management
- `/dashboard/inventory` - Inventory
- `/dashboard/reports` - Analytics

---

## 🔌 Key APIs

### GET Endpoints (Public)
```
GET  /api/menu                    # Menu items
GET  /api/orders/[id]             # Order status
GET  /api/orders/[id]/qr          # QR code
```

### POST Endpoints (Public)
```
POST /api/orders                  # Place order
POST /api/transactions            # Record payment
```

### Staff Endpoints (Protected)
```
GET    /api/orders                # List orders
PATCH  /api/orders/[id]/status    # Update status
GET    /api/inventory             # List inventory
POST   /api/inventory             # Add item
PATCH  /api/inventory/[id]        # Update stock
GET    /api/reports/summary       # Stats
GET    /api/reports/revenue       # Revenue trend
GET    /api/reports/profit        # Profit trend
GET    /api/reports/top-items     # Top items
```

---

## 📦 npm Scripts

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Sync database schema
npm run db:seed      # Populate demo data
npm run db:reset     # ⚠️ Reset database
```

---

## 🗄️ Database

**Connection:** See `.env.local`

**Models:** User, MenuItem, Order, InventoryItem, Transaction, Expense, RestaurantTable

**Seed Data:** 3 users, 12 menu items, 6 tables, 12 inventory items, 5 orders

```bash
# Seed again if needed
npm run db:seed

# Reset everything
npm run db:reset
npm run db:push
npm run db:seed
```

---

## 🎨 Components Map

### Customer Components
```
MenuGrid.tsx          → Display menu items
ItemCard.tsx          → Single product card
CategoryTabs.tsx      → Filter by category
ItemDetail.tsx        → Product details page
CartSheet.tsx         → Cart slide-over
```

### Staff Components
```
OrderTable.tsx        → Orders list table
InventoryTable.tsx    → Inventory table
InventoryForm.tsx     → Add/edit inventory
DashboardLayout.tsx   → Main layout wrapper
StatCard.tsx          → Metric card
```

---

## 🔐 Auth & Roles

**Authentication:** NextAuth.js (JWT)

**Roles:**
- `OWNER` - Full access
- `ADMIN` - Menu & reports
- `SUPERVISOR` - Orders & inventory

**Protected:** All `/dashboard/*` routes and staff APIs

---

## 📊 Analytics Insights

**Dashboard Shows:**
- 💰 Revenue, Orders, Profit
- ⚠️ Low stock alerts
- 📈 Best selling items
- 🔮 Stock predictions

**Reports Include:**
- Period selector (Day/Week/Month/Year)
- Revenue vs Expenses chart
- Profit trend line chart
- Top items table

---

## 🚀 Deploy to Production

### Vercel + Aiven MySQL

1. **Push to GitHub**
2. **Vercel dashboard:** Import repo
3. **Set env variables:**
   ```
   DATABASE_URL = mysql://...
   NEXTAUTH_SECRET = <generate-new>
   NEXTAUTH_URL = https://your-domain.vercel.app
   ```
4. **Deploy** - Auto-deploys on push

**See:** DEPLOYMENT_CHECKLIST.md for details

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | `npm install` then `npm run build` |
| DB connection error | Check DATABASE_URL in .env.local |
| Port 3000 in use | `npm run dev -- -p 3001` |
| Seed fails | `npm run db:reset` then `npm run db:seed` |
| Auth not working | Verify NEXTAUTH_SECRET is set |

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| SETUP_GUIDE.md | Detailed setup |
| IMPLEMENTATION_SUMMARY.md | Full overview |
| DEPLOYMENT_CHECKLIST.md | Prod deployment |
| PROJECT_STATUS.md | Status & stats |
| SYSTEM_BLUEPRINT.md | Original specs |

---

## 🎯 Feature Checklist

### Customer
- [ ] Browse menu
- [ ] Search items
- [ ] Add to cart
- [ ] Checkout
- [ ] View order status
- [ ] Get QR code

### Staff
- [ ] Login to dashboard
- [ ] View analytics
- [ ] Manage orders
- [ ] Update inventory
- [ ] View reports

### Analytics
- [ ] See low stock alerts
- [ ] Check best sellers
- [ ] View profit trends
- [ ] Export reports

---

## 💾 Key Files

```
.env.local                  # Your config (git ignored)
.env.example                # Config template
package.json                # Dependencies & scripts
prisma/schema.prisma        # Database schema
prisma/seed.ts              # Demo data generator
middleware.ts               # Route protection
lib/analytics.ts            # Business logic
lib/cart-store.ts           # Cart state (Zustand)
```

---

## ⚙️ Tech Stack (One-liner)

Next.js 15 + TypeScript + MySQL + Prisma + NextAuth + Tailwind + shadcn/ui + Recharts

---

## 🎓 For Learning

**Best way to explore:**
1. Start with `/menu` (customer side)
2. Then check `/login` (staff side)
3. Review `/dashboard` (analytics)
4. Read IMPLEMENTATION_SUMMARY.md
5. Explore component code (TypeScript types everywhere)

---

## ✨ What's Working

✅ Full ordering flow
✅ Real-time order status
✅ Inventory management
✅ Analytics & reports
✅ Role-based access
✅ Mobile responsive
✅ Type-safe (TypeScript)
✅ Production-ready

---

## 🚢 Production Checklist

- [ ] Database configured (Aiven MySQL)
- [ ] Environment variables set (Vercel)
- [ ] NEXTAUTH_SECRET generated
- [ ] Database migrations run
- [ ] Seed data removed (optional)
- [ ] Vercel deployment tested
- [ ] Custom domain configured
- [ ] Monitoring set up
- [ ] Backups enabled

See DEPLOYMENT_CHECKLIST.md for details.

---

## 📞 Quick Help

**"How do I...?"**

- Start development? → `npm run dev`
- Add seed data? → `npm run db:seed`
- Deploy to production? → See DEPLOYMENT_CHECKLIST.md
- Check API docs? → See IMPLEMENTATION_SUMMARY.md
- Understand architecture? → See PROJECT_STATUS.md

---

## 🎉 You're All Set!

Run this to get started:
```bash
npm install && npm run db:push && npm run db:seed && npm run dev
```

Then visit http://localhost:3000/menu

**Happy coding! 🚀**
