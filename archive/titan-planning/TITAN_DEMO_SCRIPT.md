# 🎯 TITAN DEMO SCRIPT — 10-Minute Bulletproof Flow

> **Date:** February 27, 2026
> **Audience:** Titan Roofing leadership (180 roofers, AZ-based)
> **Objective:** Show operational maturity, not hype. Close the deal.
> **Duration:** 10 minutes sharp. No improvisation.

---

## PRE-MEETING CHECKLIST (Do This Morning)

- [ ] Clear browser cache, use Chrome Incognito for demo
- [ ] Open these 4 tabs ready to go:
  1. `https://skaiscrape.com` (landing page)
  2. `https://skaiscrape.com/pro/dashboard` (logged into demo org)
  3. `https://skaiscrape.com/titan-proof/readiness.html` (readiness 1-pager)
  4. `https://skaiscrape.com/titan-proof/comparison.html` (cost comparison)
- [ ] Test login works. Test health endpoint returns green.
- [ ] Print 3 copies of the readiness page (PDF or paper)
- [ ] Have pricing page open as backup: `https://skaiscrape.com/pricing`
- [ ] Phone on silent. Laptop charged. No notifications.

---

## THE 10-MINUTE FLOW

### MINUTE 0–1: THE OPENING (No Slides)

**Don't touch the laptop yet. Make eye contact.**

> "Thanks for having me. I'll keep this tight — 10 minutes, then I'll answer anything you want to throw at me."
>
> "Quick context: I built this because I was in your shoes. I ran restoration crews, dealt with the same carriers, fought the same supplement battles. I got tired of using tools that weren't built for how we actually work."
>
> "So I built one. It's live. Your 180 people could be on it next week."

**→ Pause. Let that land.**

---

### MINUTE 1–3: THE LIVE PRODUCT (Tab 1 → Tab 2)

**Show the landing page for 5 seconds. Then switch to the Pro dashboard.**

> "This isn't a mockup. This is production. Live right now."

**Walk through in this exact order:**

1. **Dashboard** — Show the overview. Claims count, lead pipeline, recent activity.

   > "This is what your project managers see when they log in. Everything in one place."

2. **Claims** — Click into a claim. Show the lifecycle stages.

   > "Full claim lifecycle — intake through final packet. Every status, every document, every note."

3. **AI Damage Detection** — If demo photos are loaded, show the analysis.

   > "Upload a roof photo. 8 seconds later, 47 damage points identified. Your adjuster gets this before the carrier's adjuster even arrives."

4. **Weather Verification** — Show a property-level weather lookup.
   > "Automated weather verification at the property address. Not the city — the property. Timestamped, sourced, ready for the claim."

**DO NOT show more than 4 features. Less is more.**

---

### MINUTE 3–5: THE SECURITY QUESTION (Tab 3)

**Pull up the readiness page.**

> "I know the question on your mind: 'Can we trust this with our data?'"
>
> "Here's the short answer."

**Point to these sections only:**

1. **Infrastructure row** — "Vercel, Supabase, Clerk, Stripe. No basement servers. Enterprise-grade infrastructure."

2. **Tenant isolation** — "Every organization's data is isolated. We verified it with 22 automated tests. Your data never touches another company's data."

3. **Load test table** — "We put 500 simultaneous users on this system for 18 minutes. Zero crashes. Your 180 people at peak load? That's 36% of our tested capacity."

> "I'm not going to tell you we're perfect. I'm going to tell you we tested it, we measured it, and I can show you the raw data."

**→ Hand them a printed copy of the readiness page. Let them hold it.**

---

### MINUTE 5–7: THE MONEY QUESTION (Tab 4)

**Pull up the cost comparison.**

> "Let's talk numbers."

**Let the page speak. Point to:**

1. **AccuLynx annual cost** — "$321,840 a year for 180 seats. And that's just CRM. No AI, no weather verification, no damage detection."

2. **SkaiScraper annual cost** — "$172,800. Every feature. Every seat."

3. **Savings line** — "$149,040 a year. That's a full salary you're saving. Plus you get 12 capabilities AccuLynx doesn't offer."

4. **Data ownership row** — "AccuLynx got acquired. Your data moved to new ownership. We're founder-led. Your data stays yours."

> "I'm not asking you to take a risk on a startup. I'm asking you to stop overpaying for a tool that doesn't do what you need."

**→ Pause. Don't fill the silence.**

---

### MINUTE 7–8: THE SCALE QUESTION

**Stay on the comparison page. No new tabs.**

Someone will ask about scale or reliability. Pre-loaded answer:

> "Fair question. Here's the architecture: Vercel handles our application layer — it auto-scales. If you go from 180 to 500 users, we don't touch a server. It just works."
>
> "Database is Supabase PostgreSQL — same technology that powers companies 100x our size. Redis handles caching. Everything is redundant."
>
> "But I don't want to just talk. We load tested. 500 concurrent users, 18 minutes, against the production system you'd be using. p95 latency at your load would be 615 milliseconds. We have the raw k6 output if your IT team wants to review it."

---

### MINUTE 8–9: THE TRANSITION QUESTION

Someone will ask "How do we switch?" or "What's the migration look like?"

> "We handle the migration. We'll work with your team to move your existing claims data in. Typical onboarding is 2 weeks from signature to first login."
>
> "Week 1: We set up your organization, import your data, configure your branding."
> "Week 2: We train your project managers — live session, not a YouTube link."
>
> "On day 15, your team is running claims through SkaiScraper. AccuLynx doesn't need to know until you're ready to cancel."

---

### MINUTE 9–10: THE CLOSE

**Close the laptop. Look them in the eye.**

> "I'll leave you with this: I didn't build SkaiScraper because I wanted to be in software. I built it because I was in restoration and the tools didn't exist."
>
> "Everything you saw today is live. Everything I quoted you is real. Your 180 people can be on this platform in two weeks."
>
> "What questions do you have?"

**→ Then stop talking. Let them ask.**

---

## HARD QUESTIONS — PRE-LOADED ANSWERS

### "How long have you been in business?"

> "ClearSkai Technologies launched the product in 2025. We're in active production with live users. I've been in the restoration industry for [X] years before this."

### "Do you have other customers this size?"

> "You'd be our first 180-seat deployment. That means two things: one, you get founder-level attention that a company with 10,000 customers can't give you. Two, you help shape the product — your feedback goes directly to the person who writes the code."

### "What if something breaks?"

> "Same answer as any enterprise vendor: we have monitoring (Sentry), we have health endpoints that check every integration every 60 seconds, and you have my direct number. The difference is when you call me, you're talking to the person who built it — not a tier-1 support rep reading a script."

### "What about your uptime guarantee?"

> "We don't put a number on a wall we haven't earned. What I can tell you: our health endpoint has been green since launch, our load tests passed at 500 users, and our database latency is 3 milliseconds. We'll earn the uptime number with your deployment, and you'll see it in real-time on your dashboard."

### "Can we do a pilot with 10 people first?"

> "Absolutely. That's smart. Let's get 10 of your PMs on for 30 days. If they don't want to go back to AccuLynx, we roll the rest of the company in."

### "Why should we trust a small company?"

> "Because I'm not going anywhere. I'm not building this to sell it — I'm building it because this industry needs it. And when you call with a problem, I'm the one who answers. Ask AccuLynx's new owners if they can say that."

---

## POST-MEETING

- [ ] Send thank-you email within 2 hours
- [ ] Attach PDF of readiness page
- [ ] Attach PDF of cost comparison
- [ ] Include link: "Your platform is ready at skaiscrape.com whenever you are."
- [ ] Do NOT follow up for 48 hours after the thank-you. Let them discuss internally.

---

## RULES FOR THE ROOM

1. **Speak slower than feels natural.** Confidence is calm.
2. **Do not say "AI" more than 3 times.** Say "automated" or "intelligent" instead.
3. **Do not apologize for being small.** Reframe it as founder-level attention.
4. **Do not bash AccuLynx.** Let the numbers speak. Say "I respect what they built, but the market has moved."
5. **Do not demo more than 4 features.** Feature overload kills deals. Less is more.
6. **Do not improvise.** If you don't know the answer, say "I'll get you that answer today" and move on.
7. **Hand them something physical.** The printed readiness page stays on the table after you leave.
8. **End on time.** If they want more, they'll ask. Leaving them wanting more is better than overstaying.
