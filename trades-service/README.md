# 🔧 SkaiScraper Trades Microservice

**Separate contractor marketplace service with independent database and deployment**

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SKAISCRAPER CORE                            │
│                  (skaiscrape.com)                               │
│  - CRM, Claims, AI, Billing                                     │
│  - Calls Trades Service via JWT tokens                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ JWT Service Tokens
                       │ (signed with SERVICE_TOKEN_SECRET)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                 TRADES MICROSERVICE                             │
│              (trades.skaiscraper.com)                           │
│  - Trade Profiles (contractors)                                 │
│  - Client ↔ Pro Matching                                        │
│  - Reviews & Ratings                                            │
│  - Connection Management                                        │
│  - SEPARATE PostgreSQL Database                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

- **Runtime**: Node.js (Vercel Serverless)
- **Database**: PostgreSQL (Supabase/Neon - separate from Core)
- **ORM**: Prisma 5.7.0
- **Auth**: JWT service tokens (inter-service)
- **Storage**: Firebase Storage (shared with Core)
- **Validation**: Zod 3.22.4
- **Geo**: zipcodes 8.0.0

## 📦 Project Structure

```
trades-service/
├── prisma/
│   └── schema.prisma          # Database schema (5 models)
├── src/
│   ├── api/                   # API routes
│   │   ├── profile/route.ts   # POST/GET/PATCH profile
│   │   ├── search/route.ts    # GET search pros
│   │   ├── connect/
│   │   │   ├── route.ts       # POST/GET connections
│   │   │   └── respond/route.ts # POST accept/decline
│   │   ├── reviews/route.ts   # POST/GET reviews
│   │   └── health/route.ts    # GET health check
│   ├── lib/                   # Core libraries
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # JWT service token auth
│   │   ├── firebase.ts        # Firebase Storage client
│   │   ├── zipDistance.ts     # Geo calculations
│   │   └── responses.ts       # API response helpers
│   └── types/
│       └── index.ts           # TypeScript types
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## 📋 Database Schema

### TradeProfile

Contractor/professional profiles

- `clerkUserId` (unique) - Links to Clerk user
- Business info: `companyName`, `tradeType`, `specialties`, `bio`, `portfolio`
- Credentials: `licenseNumber`, `insured`, `yearsExperience`, `certifications`
- Service area: `baseZip`, `radiusMiles`, `serviceZips`
- Stats: `avgRating`, `reviewCount`, `completedJobs`, `responseRate`
- Availability: `acceptingClients`, `emergencyService`

### ClientProConnection

Client → Pro connection requests

- `clientClerkId`, `proClerkId`
- `status`: pending/accepted/declined/expired
- `serviceType`, `urgency`, `notes`
- `responseTimeMinutes` - Tracks pro response speed
- `coreLeadId`, `coreClaimId` - Links to Core CRM when accepted

### TradeReview

Client reviews of pros

- `proClerkId`, `clientClerkId`
- `rating` (1-5 stars), `comment`
- `jobType`, `jobCompleted`, `verified`
- `proResponse` - Pro can respond to reviews

### ServiceRequest (Phase 2)

Client job postings for bidding

- `clientClerkId`, `title`, `description`, `serviceType`
- `zip`, `budgetMin`, `budgetMax`
- `status`: open/matched/closed
- `photos` - Firebase Storage URLs

### ProAvailability (Phase 3)

Calendar availability

- `proClerkId`, `date`, `available`
- `timeSlots` - Array of {start, end, available}
- `bookedBy` - clientClerkId if booked

## 🔐 Authentication

All requests require JWT service token in Authorization header:

```typescript
Authorization: Bearer<JWT_TOKEN>;
```

**Token Payload:**

```json
{
  "service": "skaiscraper-core",
  "clerkUserId": "user_xxx",
  "role": "client|pro|admin",
  "exp": 1234567890
}
```

**Signing Secret:** `SERVICE_TOKEN_SECRET` (shared between Core and Trades)

## 🌐 API Endpoints

### Profile Management

#### `POST /api/profile` - Create/Update Profile

```json
{
  "companyName": "ABC Roofing",
  "tradeType": "roofing",
  "specialties": ["asphalt-shingles", "metal-roofing"],
  "bio": "20 years experience...",
  "portfolio": [{ "url": "https://...", "type": "image", "caption": "Commercial roof" }],
  "licenseNumber": "ROO-12345",
  "insured": true,
  "yearsExperience": 20,
  "certifications": [{ "name": "GAF Master Elite", "url": "https://..." }],
  "baseZip": "90210",
  "radiusMiles": 50,
  "serviceZips": ["90211", "90212"],
  "acceptingClients": true,
  "emergencyService": true
}
```

#### `GET /api/profile?clerkUserId=xxx` - Get Profile

#### `PATCH /api/profile` - Partial Update

### Search

#### `GET /api/search` - Find Pros

Query params:

- `zip` (required) - Client's zip code
- `radiusMiles` (default: 25) - Search radius
- `tradeType` - Filter by trade
- `minRating` - Minimum rating
- `emergencyOnly` - Emergency service only
- `insuredOnly` - Insured only
- `limit` (default: 20) - Max results

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "profile": {...},
        "distance": 12.3,
        "score": 87.5
      }
    ],
    "count": 15,
    "filters": {...}
  }
}
```

**Scoring Algorithm:**

- 30% Distance (closer = better)
- 30% Rating (higher = better)
- 20% Experience (completedJobs)
- 20% Response Rate

### Connections

#### `POST /api/connect` - Request Connection

```json
{
  "proClerkId": "user_xxx",
  "serviceType": "roof-replacement",
  "urgency": "urgent",
  "notes": "Need estimate for hail damage"
}
```

#### `GET /api/connect?role=client|pro&status=pending` - Get Connections

#### `POST /api/connect/respond` - Accept/Decline

```json
{
  "connectionId": "conn_xxx",
  "accept": true,
  "message": "Happy to help! I'll call you today.",
  "coreLeadId": "lead_xxx",
  "coreClaimId": "claim_xxx"
}
```

### Reviews

#### `POST /api/reviews` - Submit Review

```json
{
  "proClerkId": "user_xxx",
  "rating": 5,
  "comment": "Excellent work, very professional",
  "jobType": "roofing",
  "jobCompleted": true
}
```

#### `GET /api/reviews?proClerkId=xxx` - Get Reviews

### Health

#### `GET /api/health` - Health Check

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "trades-microservice",
    "timestamp": "2024-12-03T...",
    "database": "connected"
  }
}
```

## 🔗 Core Integration

**In SkaiScraper Core**, use the service client:

```typescript
import {
  createTradeProfile,
  searchPros,
  requestConnection,
  respondToConnection,
  submitReview,
} from "@/lib/services/tradesService";

// Create pro profile
await createTradeProfile(clerkUserId, {
  companyName: "ABC Roofing",
  tradeType: "roofing",
  // ...
});

// Search for pros
const results = await searchPros(clientClerkId, {
  zip: "90210",
  radiusMiles: 25,
  tradeType: "roofing",
  insuredOnly: true,
});

// Client requests connection
const connection = await requestConnection(clientClerkId, {
  proClerkId: "user_xxx",
  serviceType: "roof-replacement",
  urgency: "urgent",
});

// Pro accepts (in webhook handler)
await respondToConnection(proClerkId, {
  connectionId: connection.id,
  accept: true,
  coreLeadId: lead.id, // Created in Core CRM
});

// Client submits review
await submitReview(clientClerkId, {
  proClerkId: "user_xxx",
  rating: 5,
  comment: "Great work!",
});
```

## 🚀 Deployment

### 1. Setup Database

```bash
# Create new Supabase/Neon database (separate from Core)
# Get DATABASE_URL connection string
```

### 2. Environment Variables

Create `.env` in trades-service/:

```bash
DATABASE_URL="postgresql://..."
SERVICE_TOKEN_SECRET="your-secret-here"
FIREBASE_PROJECT_ID="skaiscraper"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_STORAGE_BUCKET="skaiscraper.appspot.com"
```

### 3. Install & Migrate

```bash
cd trades-service
pnpm install
npx prisma generate
npx prisma db push
```

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd trades-service
vercel --prod

# Set domain: trades.skaiscraper.com
```

### 5. Configure Core

In SkaiScraper Core `.env`:

```bash
TRADES_SERVICE_URL="https://trades.skaiscraper.com"
SERVICE_TOKEN_SECRET="same-secret-as-microservice"
```

## 🧪 Testing

### Health Check

```bash
curl https://trades.skaiscraper.com/api/health
```

### Create Profile (from Core)

```bash
# Generate token in Core
const token = generateServiceToken('user_xxx', 'pro')

curl -X POST https://trades.skaiscraper.com/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "ABC Roofing",
    "tradeType": "roofing",
    "insured": true,
    "baseZip": "90210",
    "radiusMiles": 25,
    "acceptingClients": true,
    "emergencyService": false
  }'
```

### Search Pros

```bash
curl "https://trades.skaiscraper.com/api/search?zip=90210&radiusMiles=25&tradeType=roofing" \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Monitoring

- **Health**: `GET /api/health` - Database connection status
- **Logs**: Vercel Dashboard → trades-service project
- **Database**: Supabase/Neon dashboard
- **Errors**: Monitor 4xx/5xx response codes

## 🔄 CRM Integration Flow

When pro accepts connection:

1. **Client requests** → `POST /api/connect`
2. **Pro accepts** → `POST /api/connect/respond` with `accept: true`
3. **Webhook to Core** → Trades service calls Core webhook
4. **Core creates**:
   - Lead in CRM with pro details
   - Appointment for estimate
   - Message thread between client & pro
5. **Core responds** → Sends `coreLeadId` back to trades service
6. **Trades updates** → Stores `coreLeadId` in connection record

## 🛠️ Development

```bash
# Install dependencies
cd trades-service
pnpm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Dev server (local)
pnpm dev

# Build
pnpm build
```

## 📝 Notes

- **Why microservice?** Decouples trades marketplace from core CRM, enables independent scaling
- **Shared Firebase** Portfolio uploads use same Firebase Storage as Core
- **JWT tokens** 1-hour expiration, Core regenerates as needed
- **Clerk IDs** Both services use Clerk for user management, identified by `clerkUserId`
- **Database separation** Trades DB is completely independent, no foreign keys to Core
- **Future phases** Service Requests (bidding), Pro Availability (calendar), Mobile app API

## 🔮 Roadmap

**Phase 1** (Current):

- ✅ Profile management
- ✅ Search & matching
- ✅ Connection requests
- ✅ Reviews & ratings

**Phase 2**:

- 🔄 Service Requests (client job postings)
- 🔄 Pro bidding system
- 🔄 Message threading
- 🔄 Push notifications

**Phase 3**:

- ⏳ Calendar availability
- ⏳ Appointment booking
- ⏳ Payment processing
- ⏳ Escrow system

**Phase 4**:

- ⏳ Mobile app API
- ⏳ Partner integrations
- ⏳ Background checks
- ⏳ Insurance verification

---

**Status**: Foundation complete, ready for database setup and deployment
**Last Updated**: December 3, 2024
