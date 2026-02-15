# Post-Mortem: Trades Onboarding Silent Failure

**Date:** January 16, 2026  
**Severity:** Medium (UX blocker, not data loss)  
**Status:** ✅ Resolved

---

## Summary

Users could not complete Trades Network onboarding. The form appeared to work but nothing happened on submit. No errors were shown, creating a "dead end" that blocked profile creation.

---

## Root Cause Analysis

### 1. Why Onboarding Appeared Broken

| Factor                                               | Impact                                     |
| ---------------------------------------------------- | ------------------------------------------ |
| Multi-step form with conditional `required` fields   | Browser validation blocked submit silently |
| Disabled submit button tied to incomplete validation | Users couldn't click to see what was wrong |
| Auth state ambiguity                                 | `userId` vs `orgId` confusion in API       |
| No visual feedback on failure                        | Form just sat there                        |

### 2. Why No Error Surfaced

| Factor                                      | Impact                                |
| ------------------------------------------- | ------------------------------------- |
| HTML5 `required` attribute on hidden fields | Browser blocked submit before JS ran  |
| `disabled={!isValid}` on submit button      | Click events never fired              |
| No server error propagation                 | API failures weren't caught/displayed |
| No console logging on submit attempts       | Debugging required code diving        |

### 3. Why It Was Hard to Detect

| Factor                                  | Impact                                     |
| --------------------------------------- | ------------------------------------------ |
| No telemetry on submit attempts         | Couldn't see "tried but failed"            |
| No funnel metrics                       | No visibility into step completion         |
| Works locally with different auth state | Developer machines often pre-authenticated |
| Visual appearance was "correct"         | Button looked clickable                    |

---

## Resolution

### Immediate Fixes (Completed)

1. **Created bypass edit pages**
   - `/trades/profile/edit` - Direct profile editing
   - `/trades/company/edit` - Direct company editing

2. **Fixed onboarding validation**
   - Removed hidden required fields
   - Added explicit error toasts
   - Changed step buttons to `type="button"`

3. **Added error propagation**
   - All API calls now show toast on failure
   - Console logging for debugging

### Architectural Changes

1. **No Silent Failures Rule**
   - Every submit must: redirect, show success toast, OR show error toast
   - "Nothing happening" is now a bug by definition

2. **Instrumentation**
   - Added step tracking events
   - Console breadcrumbs on all transitions

---

## Prevention Measures

### Code Patterns to Avoid

```tsx
// ❌ BAD: Silent failure possible
<button type="submit" disabled={!isValid}>Submit</button>

// ✅ GOOD: Always shows feedback
<button
  type="button"
  onClick={handleSubmit}
  disabled={loading}
>
  {loading ? "Saving..." : "Submit"}
</button>
```

### Required on All Forms

```tsx
try {
  setLoading(true);
  const res = await fetch(...);
  if (!res.ok) throw new Error(await res.text());
  toast.success("Saved successfully");
  router.push("/next-page");
} catch (err) {
  console.error("[FormName] Submit failed:", err);
  toast.error("Something went wrong. Please try again.");
} finally {
  setLoading(false);
}
```

---

## Testing Requirements

### Regression Tests Added

1. `trades-onboarding-happy-path.spec.ts` - Full flow completion
2. `trades-onboarding-auth-failure.spec.ts` - Error handling

### Manual Checklist

- [ ] Form submits with visible network request
- [ ] API logs show profile creation
- [ ] Redirect works on slow networks
- [ ] Page refresh doesn't lose state
- [ ] Edit pages work as fallback

---

## Lessons Learned

1. **Onboarding should never be the only path** - Always have direct edit pages
2. **HTML5 validation is dangerous** - Use JS validation only for complex forms
3. **Disabled buttons hide problems** - Only disable during `loading`
4. **Instrument before you ship** - Can't debug what you can't see
5. **"Nothing happens" = critical bug** - Not a minor UX issue

---

## Related Files

- `/src/app/(app)/trades/onboarding/page.tsx` - Main onboarding flow
- `/src/app/(app)/trades/profile/edit/page.tsx` - Bypass edit page
- `/src/app/(app)/trades/company/edit/page.tsx` - Company bypass
- `/src/app/api/trades/onboarding/route.ts` - API endpoint

---

_This post-mortem is for internal reference. Update if similar issues recur._
