# Next.js Routing Rules

**Last Updated:** December 13, 2025  
**Why This Exists:** We lost hours debugging underscore-prefixed routes that Next.js silently ignored in production.

---

## ⚠️ Critical Rules

### 1. **NEVER use underscore-prefixed folders for routable segments**

```
❌ BAD:  src/app/api/_build/route.ts       → NOT compiled, NOT deployed
❌ BAD:  src/app/api/_health/route.ts      → NOT compiled, NOT deployed
❌ BAD:  src/app/_private/[id]/page.tsx    → NOT compiled, NOT deployed

✅ GOOD: src/app/api/build-info/route.ts   → ✓ compiled, ✓ deployed
✅ GOOD: src/app/api/health/route.ts       → ✓ compiled, ✓ deployed
✅ GOOD: src/app/internal/[id]/page.tsx    → ✓ compiled, ✓ deployed
```

**Why:**  
Next.js App Router treats `_prefixed` folders as **private/non-routable** by design.  
They are excluded from compilation and will never exist in production builds.

**When you CAN use underscores:**

- `_components/` — for non-route helper folders (no route.ts/page.tsx inside)
- `_lib/`, `_utils/`, `_types/` — utility code that isn't a route segment

---

### 2. **Test every new API route locally AND in production**

After adding a new route:

```bash
# Local verification
curl http://localhost:3000/api/your-new-route

# Production verification (after deploy)
curl https://www.skaiscrape.com/api/your-new-route
```

If production returns 404 but local works → check for underscore prefixes.

---

### 3. **Use `/api/build-info` as your "truth endpoint"**

Before assuming "Vercel is broken" or "my code didn't deploy":

```bash
curl -sS https://www.skaiscrape.com/api/build-info | python3 -m json.tool
```

This endpoint tells you:

- ✅ What commit is actually deployed
- ✅ What deployment URL is serving
- ✅ What environment it thinks it's in
- ✅ When it was built

If `/api/build-info` returns your latest commit → **your code IS deployed**.  
If your other routes 404 → **the routes themselves have a problem** (probably naming).

---

## Quick Reference

| Folder Pattern                   | Routable? | Use Case                         |
| -------------------------------- | --------- | -------------------------------- |
| `src/app/api/foo/route.ts`       | ✅ Yes    | Public API route                 |
| `src/app/api/_foo/route.ts`      | ❌ No     | **NEVER DO THIS**                |
| `src/app/_components/Button.tsx` | N/A       | Helper component (no route file) |
| `src/app/dashboard/page.tsx`     | ✅ Yes    | Public page                      |
| `src/app/_admin/page.tsx`        | ❌ No     | **NEVER DO THIS**                |

---

## History: Why This Rule Exists

**December 13, 2025:**  
Spent hours debugging why `/api/_build` and `/api/_health` returned 404 in production but worked locally.

**Root cause:**  
Next.js App Router silently excludes `_`-prefixed segments during compilation.  
The routes existed in source code but were never compiled into `.next/server/app/`.

**Fix:**  
Renamed to `/api/build-info` and `/api/health/*` → instant production success.

---

## When In Doubt

1. Check the [Next.js App Router documentation](https://nextjs.org/docs/app/building-your-application/routing#private-folders)
2. Test locally AND in production
3. Use `/api/build-info` to verify what's actually deployed
4. Never prefix routable segments with underscores

---

**Remember:**  
Vercel deploys exactly what Next.js compiles.  
If Next.js doesn't compile it, Vercel can't deploy it.
