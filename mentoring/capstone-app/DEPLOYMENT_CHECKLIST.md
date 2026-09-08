# System Blueprint - Deployment Checklist

Complete guide for deploying System Blueprint to production (Vercel + Aiven MySQL).

---

## ✅ Pre-Deployment Checklist

### Local Testing (Before Pushing)

- [ ] Clone repository: `git clone <repo-url>`
- [ ] Install dependencies: `npm install`
- [ ] Create `.env.local` with test credentials
- [ ] Set up local MySQL database
- [ ] Run migrations: `npm run db:push`
- [ ] Seed demo data: `npm run db:seed`
- [ ] Start dev server: `npm run dev`
- [ ] Test customer flow: http://localhost:3000/menu
- [ ] Test staff dashboard: http://localhost:3000/login
- [ ] Verify all 14 features working:
  - [ ] Menu browsing and search
  - [ ] Add to cart and checkout
  - [ ] Order placement and QR generation
  - [ ] Order status updates
  - [ ] Payment recording
  - [ ] Staff order management
  - [ ] Inventory add/edit/view
  - [ ] Inventory analytics alerts
  - [ ] Reports with charts
  - [ ] Revenue/profit calculations

### Build Verification

```bash
# Verify build succeeds
npm run build

# Verify production start works
npm run start
```

---

## 🚀 Production Environment Setup

### 1. Database - Aiven MySQL

**Setup:**
1. Create account at [aiven.io](https://aiven.io)
2. Create MySQL service
3. Get connection details from Aiven dashboard
4. Download CA certificate (if SSL required)

**Connection String Format:**
```
mysql://username:password@hostname:port/database?ssl-mode=REQUIRED&ca=/path/to/ca.pem
```

**Initial Schema:**
```bash
# Apply schema to production database
DATABASE_URL="<production-url>" npm run db:push
```

### 2. Application - Vercel Deployment

**Connect Repository:**
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Select Next.js framework (auto-detected)
4. Configure build settings (defaults are fine)

**Environment Variables in Vercel:**

Settings → Environment Variables

```
DATABASE_URL = mysql://user:pass@host:port/db
NEXTAUTH_SECRET = <generate-new-secure-secret>
NEXTAUTH_URL = https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
UPLOADTHING_SECRET = sk_live_xxx
UPLOADTHING_APP_ID = your_app_id
```

**Generate New NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Uploadthing - File Storage (Optional)

For menu item image uploads:

1. Sign up at [uploadthing.com](https://uploadthing.com)
2. Create app
3. Get API keys
4. Add to Vercel environment variables

---

## 🔧 Build Configuration

### Build Command

```bash
npm run build
```

Vercel auto-runs this during deployment.

### Post-Build Database Migration

Add to `next.config.ts` or use Vercel postbuild hook:

```bash
prisma migrate deploy
```

This ensures production database schema is updated before server starts.

### Environment-Specific Configuration

**Development:**
```env
DATABASE_URL = "mysql://local..."
NODE_ENV = development
```

**Production:**
```env
DATABASE_URL = "mysql://aiven..."
NODE_ENV = production
NEXTAUTH_URL = "https://domain.vercel.app"
```

---

## 📊 Pre-Launch Verification

### Database Connectivity Test

```bash
# Test connection
prisma db execute --stdin <<EOF
SELECT 1;
EOF
```

### API Health Check

After deployment, verify endpoints:

```bash
# Public APIs (no auth required)
curl https://your-domain.vercel.app/api/menu

# Protected APIs (require login)
curl -H "Cookie: session=..." \
  https://your-domain.vercel.app/api/inventory
```

### Feature Testing on Production

1. **Customer Flow:**
   - Navigate to https://your-domain.vercel.app/menu
   - Browse items, add to cart
   - Complete checkout
   - Verify order QR generation

2. **Staff Flow:**
   - Login to https://your-domain.vercel.app/login
   - View dashboard with live analytics
   - Process an order (status updates)
   - Update inventory
   - View reports

3. **Analytics:**
   - Check revenue calculations
   - Verify inventory insights
   - Review profit trends

---

## 🔐 Security Checklist

- [ ] NEXTAUTH_SECRET is strong and random
- [ ] DATABASE_URL uses SSL/TLS (Aiven enforces this)
- [ ] UPLOADTHING_SECRET is never exposed in client code
- [ ] Authentication middleware protects `/dashboard/*` routes
- [ ] Rate limiting configured (if needed)
- [ ] CORS configured properly for API endpoints
- [ ] Sensitive data not logged to console

**Verify Environment Variables:**
```bash
# In Vercel dashboard, confirm:
- DATABASE_URL is hidden (password masked)
- All secrets marked as "sensitive"
- No variables accidentally committed to git
```

---

## 📈 Post-Deployment Monitoring

### Set Up Logging

**Vercel Logs:**
- Dashboard → Deployments → Logs
- Monitor for errors/warnings

**Database Monitoring:**
- Aiven Dashboard → Metrics
- Monitor CPU, memory, connections

### Performance Optimization

**Before Scaling:**
1. Add database indexes on frequently queried fields
2. Enable Vercel Edge Cache
3. Configure CDN for static assets
4. Review database query performance

**Database Indexes to Add:**
```sql
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_created ON orders(createdAt);
CREATE INDEX idx_inventory_status ON inventory_items(status);
CREATE INDEX idx_user_email ON users(email UNIQUE);
```

---

## 🆘 Troubleshooting Deployment

### Build Fails

**Check:**
- All dependencies installed: `npm install`
- TypeScript compiles: `npm run build` locally
- Environment variables set in Vercel
- Prisma schema synced: `npm run db:push`

### Database Connection Error

**Check:**
- DATABASE_URL format is correct
- Aiven database is running
- Firewall allows Vercel IP ranges
- CA certificate path is correct (if using SSL)

### API Returns 500 Errors

**Debug:**
1. Check Vercel logs for error messages
2. Verify database connectivity
3. Check for missing environment variables
4. Review API route implementation

---

## 📦 Deployment Commands Reference

```bash
# Local development
npm install
npm run dev

# Build testing
npm run build
npm run start

# Database management
npm run db:push           # Sync schema
npm run db:reset          # ⚠️ Destructive reset

# Production
npm run build             # Vercel runs this automatically
prisma migrate deploy     # Run migrations in production

# Linting
npm run lint
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Auto-deploy on push to main:

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Vercel
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm run lint
```

### Manual Deployment Steps

1. Push to GitHub main branch
2. Vercel auto-builds and deploys
3. Monitor deployment status in Vercel dashboard
4. Verify production environment

---

## 📋 Post-Deployment Handoff

### Documentation for Team

Provide team with:
- [ ] Production URL
- [ ] Staff login credentials (separate secure document)
- [ ] Database admin access (if needed)
- [ ] Vercel dashboard access
- [ ] Aiven database access
- [ ] This checklist

### Monitoring Setup

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up database backup alerts
- [ ] Configure performance alerts

### Regular Maintenance

**Weekly:**
- Review error logs
- Check database performance
- Monitor disk usage

**Monthly:**
- Review analytics
- Audit access logs
- Update dependencies

---

## ✨ Success Criteria

System is production-ready when:

✅ All 14 features working end-to-end
✅ Build passes without warnings
✅ Database migrations successful
✅ API endpoints responding correctly
✅ Analytics calculations accurate
✅ Real-time updates working (polling)
✅ Error handling graceful
✅ Performance acceptable (<3s page load)
✅ Mobile responsive
✅ Security checklist complete

---

**Deployment Ready! 🚀**
