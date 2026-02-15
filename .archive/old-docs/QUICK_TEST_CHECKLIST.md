# ⚡ QUICK TEST CHECKLIST

**Production URL:** https://preloss-vision-main-ldvb2l6ej-buildingwithdamiens-projects.vercel.app

---

## 🎯 STEP 1: BRANDING (5 minutes)

### Go to Branding Page:

```
https://preloss-vision-main-ldvb2l6ej-buildingwithdamiens-projects.vercel.app/settings/branding
```

### Complete the Form:

- [ ] Sign in with Clerk
- [ ] Enter Company Name: **\*\***\_\_\_\_**\*\***
- [ ] Enter Email: **\*\***\_\_\_\_**\*\***
- [ ] Enter Phone: **\*\***\_\_\_\_**\*\***
- [ ] Upload Logo (click button, select file <5MB)
- [ ] Wait for "Upload successful!" message
- [ ] See logo preview appear
- [ ] Pick Primary Color (main brand color)
- [ ] Pick Accent Color (secondary color)
- [ ] Click "Save Branding"
- [ ] See success message
- [ ] **REFRESH PAGE** - logo should appear in top nav bar

### ✅ Success Criteria:

- Logo shows in navigation bar
- No upload errors
- Colors applied to UI

---

## 🔐 STEP 2: CLERK JWT (5 minutes) - OPTIONAL

**Only if you want Trades Network (job board/messaging)**

### Get Supabase Secret:

1. Open: https://supabase.com/dashboard/project/nkjgcbkytuftkumdtjat/settings/api
2. Find "JWT Secret" section
3. Copy the long secret string

### Configure Clerk:

1. Open: https://dashboard.clerk.com/
2. Go to: **JWT Templates** → **New Template**
3. Select: **Supabase**
4. Settings:
   - Name: `supabase` (lowercase, exact!)
   - Algorithm: HS256
   - Signing Key: [paste secret]
5. Click "Apply Changes"

### Test:

- [ ] Visit: `/network/opportunities`
- [ ] Should load without errors
- [ ] See "No opportunities yet" or job listings

---

## 🧪 STEP 3: FEATURE TESTING (10 minutes)

### Test Uploads (No Errors!):

- [ ] Go to `/settings/branding`
- [ ] Upload a new logo
- [ ] No "Unexpected token" error
- [ ] Upload succeeds

### Test Navigation (Single Nav!):

- [ ] Only ONE menu bar visible
- [ ] No duplicate navs
- [ ] Logo appears in nav (if branding complete)

### Test AI Features (All Free!):

- [ ] Go to `/ai/weather`
- [ ] No token limit warnings
- [ ] Can use feature unlimited
- [ ] Try `/ai/exports` - also unlimited

### Test Reports:

- [ ] Go to `/reports`
- [ ] Page loads (shows empty state)
- [ ] No mock/demo data
- [ ] Ready for real reports

### Test Mockups (Should be Gone!):

- [ ] Check AI Tools dropdown
- [ ] "AI Mockups" should NOT be there
- [ ] Only: DOL Pulls, Weather Reports, Exports

---

## 📊 VERIFICATION CHECKLIST

### ✅ What Should Be Working:

- [ ] Image upload works (no errors)
- [ ] Single navigation bar (no duplicates)
- [ ] Branding saves and displays
- [ ] All AI features unlimited (no token costs)
- [ ] No paywall prompts
- [ ] No "Upgrade" messages
- [ ] Mockups removed from menu
- [ ] Reports page shows clean state

### ❌ What Should Be Gone:

- [ ] "Unexpected token" upload errors
- [ ] Duplicate navigation bars
- [ ] "AI Mockups" menu item
- [ ] Token limit warnings
- [ ] Trial upgrade prompts
- [ ] Mock/demo report data

---

## 🚨 IF SOMETHING DOESN'T WORK:

### Upload Issues:

1. Check browser console (F12)
2. Look for red errors
3. Verify file is <5MB
4. Try PNG or JPG format

### Navigation Issues:

1. Hard refresh (Cmd+Shift+R)
2. Clear cache
3. Try incognito window

### Branding Not Showing:

1. Did you click "Save Branding"?
2. Did you refresh the page?
3. Check if signed in with same account

### Features Still Limited:

1. Hard refresh browser
2. Clear site data
3. Verify on latest deployment URL

---

## 📞 REPORT ISSUES

If anything fails:

1. Note the exact error message
2. Screenshot if helpful
3. Note which step failed
4. Share browser console errors

---

## 🎉 SUCCESS = ALL CHECKBOXES CHECKED!

When everything above works:

- ✅ Branding complete
- ✅ Upload working
- ✅ Navigation clean
- ✅ All features unlimited
- ✅ Ready for production use!
