# SkaiScraper™ Complete Setup Guide

## Start-to-Finish Instructions

### 📋 Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ VS Code (recommended)
- ✅ Firebase account and project
- ✅ Supabase account and project
- ✅ Stripe account (for payments)

---

## 🚀 **Phase 1: Initial Setup**

### **Step 1: Install Dependencies**

```bash
cd /Users/admin/Downloads/preloss-vision-main

# Install pnpm if not already installed
npm install -g pnpm

# Install all project dependencies
pnpm install

# Install Firebase CLI globally
npm install -g firebase-tools
```

### **Step 2: Environment Configuration**

Your `.env.local` file is already configured with:

- ✅ Firebase configuration (client & server)
- ✅ Supabase database connection
- ✅ Stripe payment configuration
- ✅ Authentication (Clerk)

**Verify your environment variables are set correctly in `.env.local`**

---

## 🔥 **Phase 2: Firebase Setup**

### **Step 3: Login to Firebase**

```bash
# Login to Firebase (opens browser)
firebase login

# Verify your project
firebase projects:list
```

### **Step 4: Deploy Firebase Storage Rules**

```bash
# Make script executable
chmod +x ./scripts/deploy-firebase-rules.sh

# Deploy storage rules
./scripts/deploy-firebase-rules.sh
```

### **Step 5: Test Firebase Integration**

```bash
# Test Firebase connection (optional)
node scripts/test-firebase-integration.js
```

---

## 🗄️ **Phase 3: Database Setup**

### **Step 6: Generate Prisma Client**

```bash
# Generate Prisma client from schema
npx prisma generate
```

### **Step 7: Apply Database Migrations**

```bash
# Run the database migration task
pnpm run task:migrate

# OR manually apply migrations:
export DATABASE_URL="postgres://postgres:Pinkskiesahead2025@db.nkjgcbkytuftkumdtjat.supabase.co:5432/postgres?sslmode=require&schema=app"
psql "$DATABASE_URL" -f ./db/migrations/20251026_add_organization_branding.sql
psql "$DATABASE_URL" -f ./db/migrations/20251026_create_branding_uploads.sql
psql "$DATABASE_URL" -f ./db/migrations/20251026_create_tokens_ledger.sql
psql "$DATABASE_URL" -f ./db/migrations/20251026_tokens_ledger_balance_trigger.sql
```

### **Step 8: Seed Initial Data**

```bash
# Seed the database with initial data
export DATABASE_URL="postgres://postgres:Pinkskiesahead2025@db.nkjgcbkytuftkumdtjat.supabase.co:5432/postgres?sslmode=require&schema=app"
npx ts-node prisma/seed-new.ts
```

---

## 🔧 **Phase 4: Build & Development**

### **Step 9: Fix TypeScript Issues**

The following files need fixes before building:

**Fix Prisma Model Names:**

```bash
# Fix token ledger references
find . -name "*.ts" -type f -exec sed -i '' 's/token_ledger/tokenLedger/g' {} \;
find . -name "*.ts" -type f -exec sed -i '' 's/tokenPacks/tokenPack/g' {} \;
```

### **Step 10: Build the Application**

```bash
# Clean any existing builds
rm -rf .next dist

# Build the application
npm run build
```

### **Step 11: Start Development Server**

```bash
# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

---

## 🧪 **Phase 5: Testing & Verification**

### **Step 12: Test Core Features**

**Test Token System:**

```bash
# Test token purchase (mock)
curl -sS -X POST -H 'Content-Type: application/json' \
  -d '{"packId": "solo", "userId": "test-user"}' \
  http://localhost:3000/api/tokens/purchase

# Test token consumption
curl -sS -X POST -H 'Content-Type: application/json' \
  -d '{"userId": "test-user", "cost": 1, "operation": "test"}' \
  http://localhost:3000/api/tokens/consume
```

**Test File Upload:**

1. Navigate to upload page in browser
2. Try uploading a file
3. Verify Firebase Storage receives the file
4. Check token deduction

**Test Authentication:**

1. Visit `/sign-in` page
2. Create test account
3. Verify user can access protected routes

### **Step 13: Run Test Suites**

```bash
# Run Playwright tests against Storybook
pnpm run test:pw:sb

# Run Lighthouse CI tests
npx lhci autorun
```

---

## 📦 **Phase 6: Production Deployment**

### **Step 14: Prepare for Production**

```bash
# Run the preparation script
chmod +x ./scripts/prepare_and_push.sh
./scripts/prepare_and_push.sh
```

### **Step 15: Deploy to Netlify**

**Manual Deployment:**

1. Build the static export: `npm run build`
2. Deploy `out/` folder to Netlify
3. Configure environment variables in Netlify dashboard

**Automated Deployment:**

1. Push to GitHub repository
2. Connect Netlify to your GitHub repo
3. Set build command: `npm run build`
4. Set publish directory: `out`

---

## 🔍 **Phase 7: Monitoring & Maintenance**

### **Step 16: Monitor System Health**

**Firebase Console:**

- Monitor storage usage
- Check authentication metrics
- Review security rule violations

**Supabase Dashboard:**

- Monitor database performance
- Check query performance
- Review connection logs

**Stripe Dashboard:**

- Monitor payment processing
- Review transaction logs
- Check webhook delivery

### **Step 17: Regular Maintenance**

**Weekly Tasks:**

```bash
# Clean up old uploads
node scripts/cleanup-old-files.js

# Check system health
node scripts/health-check.js

# Update dependencies
pnpm update
```

---

## 🆘 **Troubleshooting Guide**

### **Common Issues & Solutions**

**Build Fails:**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json pnpm-lock.yaml
pnpm install
```

**Database Connection Issues:**

```bash
# Test database connection
npx prisma db pull
```

**Firebase Permission Errors:**

```bash
# Re-deploy storage rules
firebase deploy --only storage
```

**Token System Not Working:**

```bash
# Check database schema
npx prisma studio
```

---

## 📚 **Feature Documentation**

### **Available Features**

- ✅ **Token Economy**: Purchase and consumption system
- ✅ **File Upload**: Firebase Storage integration
- ✅ **Authentication**: Clerk user management
- ✅ **Payment Processing**: Stripe integration
- ✅ **PDF Generation**: Automated report creation
- ✅ **Mockup Generation**: AI-powered design creation
- ✅ **Organization Management**: Multi-tenant support
- ✅ **Branding System**: Custom branding uploads

### **API Endpoints**

- `POST /api/tokens/purchase` - Buy token packages
- `POST /api/tokens/consume` - Use tokens for operations
- `GET /api/tokens/balance` - Check token balance
- `POST /api/upload` - Upload files to Firebase
- `POST /api/generate-pdf` - Create PDF reports
- `POST /api/generate-mockup` - Generate design mockups

---

## 🎯 **Next Steps**

After completing setup:

1. **Customize Branding**: Upload your logos and brand assets
2. **Configure Pricing**: Adjust token costs in environment variables
3. **Add Team Members**: Invite users to your organization
4. **Monitor Usage**: Track token consumption and file uploads
5. **Scale Infrastructure**: Upgrade Firebase/Supabase plans as needed

---

## 📞 **Support Resources**

- **Firebase Console**: https://console.firebase.google.com/project/skaiscraper
- **Supabase Dashboard**: https://supabase.com/dashboard/projects
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Documentation**: `/docs/` folder in project

---

**Your SkaiScraper™ application is now ready for production! 🚀**

Last updated: October 29, 2025
