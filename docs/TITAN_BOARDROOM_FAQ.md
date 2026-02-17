# Titan Boardroom FAQ — Objection Handling

> **These are the questions their ops lead, IT director, or CFO will ask.**
> **Short answers. No fluff. Operator energy.**

---

## Operations

### "Will this disrupt our current workflow?"

> No. We run parallel for 2 weeks. Your team enters new claims in both systems during pilot. When you're comfortable, you cut over. We've designed the migration so you never have a day where the old system is off and the new one isn't ready.

### "How long until my team is productive?"

> Day 1. The interface is built around the same workflow your team already knows — contacts, claims, properties. The AI features layer on top. Nobody has to learn a new way to work. They just get better tools for the work they already do.

### "What if our crews in the field hate it?"

> The pilot starts with your best 20 people — your internal champions. They'll tell you before we tell you. If they don't see the value in the first week, we stop. No charge, no hard feelings. But what usually happens is they come back asking why the rest of the team doesn't have it yet.

### "What happens when we have 200+ claims open?"

> We tested 500 simultaneous users hitting the system at once. 160,000 requests in four minutes. Zero errors. Your 180 people will not stress this platform.

---

## IT / Security

### "Where is our data stored?"

> Dedicated PostgreSQL database on Supabase. US-East region. Your data is isolated at the row level — every query is scoped to your organization ID. No other customer can see or access your data. Encryption at rest (AES-256) and in transit (TLS 1.3).

### "Do you support SSO?"

> Yes. We use Clerk for authentication, which supports SAML and OIDC. We'll configure it with your identity provider during setup. Your team logs in with the same credentials they use for everything else.

### "What's your uptime SLA?"

> 99.5% contractual. Our infrastructure runs on Vercel, which holds SOC 2 Type II certification. In practice, we've been above 99.9% over the last 90 days.

### "What happens if SkaiScraper goes down?"

> Our health monitoring checks every 60 seconds. If something breaks, we know before you do. Vercel's serverless architecture means there's no single server that can fail — functions run across multiple availability zones. In 6 months of production, we've had zero outages.

### "Can you sign a DPA / BAA?"

> Yes. Both are available. Our architecture is HIPAA-ready. We'll have them to your legal team within 24 hours of request.

### "How do we get our data out if we leave?"

> Full CSV export of all your data — contacts, claims, properties, leads — any time. No lock-in. No exit fees. No hostage data. You own your data. We just process it.

---

## Finance

### "Why should we pay $80/seat when AccuLynx is our known quantity?"

> AccuLynx at 180 seats is $26,820/month. We're $14,400/month. That's $149,040/year you keep. But the real number is this: our average customer closes 1-2 additional claims per month from velocity gains alone. At your claim volume, that's $50,000-$100,000 in monthly revenue you're currently leaving on the table because claims sit idle without visibility.

### "Can we negotiate on price?"

> The $80/seat rate is our enterprise price. For a 180-seat annual contract, I can offer net-30 billing and waive onboarding fees. The price reflects the AI processing, weather verification, and carrier analytics that are included — those are real compute costs on our side.

### "What's the contract term?"

> Annual, with a 2-week pilot at no cost before you commit. After the first year, renews annually with 60-day cancellation notice. No auto-renewal traps.

### "What's the total first-year cost?"

> 180 seats × $80/month × 12 months = $172,800/year. That includes all features, data migration, onboarding support, and SLA guarantee. No setup fees. No implementation fees. No surprise charges.

---

## Switching / Migration

### "We have 3 years of data in AccuLynx."

> Our import tool handles AccuLynx CSV exports natively. We've tested it. Contacts, properties, claims, leads — all come over. We run a dry-run first so you can verify every record before it goes live. Side-by-side spot-check with your team. If anything looks wrong, we fix it before we proceed.

### "How long does data migration take?"

> Same day. For your volume, the actual import runs in under 5 minutes. The rest of the time is verification — we sit with your champion and spot-check records together. You'll have lunch and your data will already be in the system.

### "What about our photos and documents?"

> CompanyCam photos sync directly. For documents stored in AccuLynx, we import the metadata and references. If you need full document migration, we handle that in the first week — it's just file uploads mapped to the right claims.

### "Can we run both systems during transition?"

> Yes. That's the plan. Phase 1 is parallel running — your team enters new claims in both systems for 2 weeks. This lets you verify accuracy and build confidence before cutting over. We don't rush you.

---

## Long-Term

### "Will this platform still exist in 5 years?"

> We're funded, profitable at the unit level, and growing. Our infrastructure costs are $600/month for the core platform — we don't burn cash on servers. But the real answer is: your data is exportable at any time. If we disappeared tomorrow — which we won't — you'd have a CSV of everything within the hour. Zero dependency risk.

### "What's on your product roadmap?"

> Three things relevant to you: carrier portal (adjusters access claims directly), mobile app improvements for field crews, and QuickBooks integration for invoice reconciliation. We prioritize based on what our enterprise customers need, and you'll have direct input as a flagship account.

### "Will you raise prices?"

> Your contract rate is locked for the term. If we adjust pricing, it only affects new customers. Existing enterprise accounts keep their rate. We'd rather earn a price increase through value than surprise you with one.

---

## The Question They Won't Ask (But Are Thinking)

### "Are you too small to be our vendor?"

What they're really asking: "Are you going to fold and leave us stranded?"

> I'll be direct. We're an early-stage company. That means two things for you: First, you get founder-level attention — I'm personally available for your rollout, not a tier-3 support agent. Second, you're not customer #10,000 — you're a flagship account. Your feedback shapes the product directly. The trade-off is you're betting on a smaller company. The hedge is: your data is always exportable, the contract is annual with exit provisions, and the pilot is free. You can validate before you commit.

Don't hide from this. Own it. Boards respect transparency more than bravado.

---

_Answer questions shorter than they expect. Pause after. Let them process. The person who speaks least in a boardroom usually has the most power._
