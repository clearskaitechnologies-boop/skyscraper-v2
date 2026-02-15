# 🚀 REFERRAL SYSTEM - DEPLOY NOW (3 Commands)

## ⚡ FASTEST PATH TO PRODUCTION

### Command 1: Apply Database Migration

```bash
export DATABASE_URL="your-production-db-url"
psql "$DATABASE_URL" -f prisma/migrations/20251103_referrals/migration.sql
```

### Command 2: Set Vercel Env Vars (One-Time)

```bash
vercel env add REFERRAL_TOKEN_REWARD production
# Enter: 500

vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://skaiscrape.com
```

### Command 3: Deploy

```bash
vercel --prod
```

---

## ✅ VALIDATE (2 Minutes)

1. **Visit**: https://skaiscrape.com/dashboard
   - Referral button should appear in header

2. **Copy** your referral link, **open** in incognito
   - Landing page should load: `https://skaiscrape.com/r/ABC123`

3. **Visit**: https://skaiscrape.com/settings/referrals
   - Rewards tracker should display

---

## 🎯 HOW IT WORKS

| Action                    | Reward                |
| ------------------------- | --------------------- |
| First successful referral | +30 days subscription |
| Each additional referral  | +500 tokens           |

**Flow**: User shares link → Friend signs up → Friend subscribes → Reward auto-applied

---

## 📊 MONITOR

**Vercel Logs**: https://vercel.com/dashboard  
**Stripe Webhooks**: https://dashboard.stripe.com/webhooks  
**Database**:

```sql
SELECT * FROM "Referral" ORDER BY "createdAt" DESC LIMIT 10;
SELECT * FROM "ReferralReward" ORDER BY "createdAt" DESC LIMIT 10;
```

---

## 🔥 ALTERNATIVE: Automated Script

```bash
./scripts/deploy-referrals-production.sh
```

This script does **everything** - migration, env check, deploy, validation prompts.

---

**Status**: ✅ Ready  
**Time**: 5-10 minutes  
**Risk**: Low

All code is tested and committed. Just run the commands above! 🚀
