# 🚀 COMPLETE SETUP INSTRUCTIONS

## Overview

This guide will help you complete the final two setup steps:

1. ✅ Complete your company branding
2. ✅ Setup Trades Network database (optional)

---

## PART 1: Company Branding Setup ⭐ REQUIRED

### Prerequisites

- ✅ Application is deployed
- ✅ You have Clerk account credentials
- ✅ You have your company logo file ready

### Steps

#### 1. Open Branding Page

Navigate to:

```
https://preloss-vision-main-nr0ghn5ho-buildingwithdamiens-projects.vercel.app/settings/branding
```

Or if using custom domain:

```
https://YOUR-DOMAIN.com/settings/branding
```

#### 2. Sign In

- Use Clerk authentication
- Sign in with your account

#### 3. Fill Out Company Information

**Required Fields:**

- **Company Name**: \***\*\*\*\*\***\_\_\_\***\*\*\*\*\***
- **Email**: \***\*\*\*\*\***\_\_\_\***\*\*\*\*\***
- **Phone**: \***\*\*\*\*\***\_\_\_\***\*\*\*\*\***

**Optional Fields:**

- **Website**: \***\*\*\*\*\***\_\_\_\***\*\*\*\*\***
- **License Number**: \***\*\*\*\*\***\_\_\_\***\*\*\*\*\***

#### 4. Upload Logo

1. Click "Upload Logo" button
2. Select your logo file:
   - Formats: PNG, JPG, GIF
   - Max size: 5MB
   - Recommended: Square image, at least 200x200px
3. Wait for upload progress
4. Logo will appear in preview

**Troubleshooting Logo Upload:**

- ❌ "File too large" → Reduce image size to under 5MB
- ❌ "Invalid file type" → Use PNG, JPG, or GIF only
- ❌ "Upload failed" → Check browser console (F12) for errors

#### 5. Upload Team Photo (Optional)

1. Click "Upload Team Photo" button
2. Select team photo
3. Same process as logo

#### 6. Choose Brand Colors

**Primary Color:**

- Click on primary color picker
- Select your main brand color
- Example: #117CFF (blue)

**Accent Color:**

- Click on accent color picker
- Select your secondary brand color
- Example: #FFC838 (yellow)

#### 7. Save Your Branding

1. Click "Save Branding" button
2. Wait for success message
3. You should see: ✅ "Branding saved successfully!"

#### 8. Verify It Worked

1. Refresh the page (Cmd+R or Ctrl+R)
2. Your information should still be there
3. Logo should be visible
4. Colors should be saved

---

## PART 2: Trades Network Database Setup 🔧 OPTIONAL

### Prerequisites

- ✅ Supabase account
- ✅ Supabase project created
- ✅ Database connection string in `.env` file

### When to do this?

Only if you want to use Trades Network features:

- Job opportunities board
- Contractor messaging
- Full Access subscriptions

### Steps

#### 1. Open Supabase Dashboard

```
https://supabase.com/dashboard/projects
```

#### 2. Select Your Project

Click on your PreLossVision project

#### 3. Go to SQL Editor

- Click "SQL Editor" in left sidebar
- Click "+ New query"

#### 4. Copy Migration File

**On Mac:**

```bash
cat /Users/admin/Downloads/preloss-vision-main/db/migrations/20241103_trades_network_clerk.sql | pbcopy
```

**On Windows:**

```bash
type db\migrations\20241103_trades_network_clerk.sql | clip
```

**Or manually:**

1. Open file in text editor
2. Select all (Cmd+A or Ctrl+A)
3. Copy (Cmd+C or Ctrl+C)

#### 5. Paste and Run

1. Paste SQL into Supabase SQL Editor (Cmd+V or Ctrl+V)
2. Click "Run" button (bottom right)
3. Wait for execution

#### 6. Verify Success

You should see:

```
✅ Trades Network schema created successfully!
```

**If you see errors:**

- Check if tables already exist
- Verify you're in the correct database
- Check database permissions

#### 7. Verify Tables Created

1. Go to "Table Editor" in Supabase
2. You should see 5 new tables:
   - ✅ `tn_memberships`
   - ✅ `tn_posts`
   - ✅ `tn_threads`
   - ✅ `tn_participants`
   - ✅ `tn_messages`

#### 8. (Optional) Add Demo Data

If you want demo data for testing:

1. Open file: `db/seed-trades-network-demo.sql`
2. **IMPORTANT**: Replace placeholder user IDs
3. Get your Clerk user ID:
   - Sign into your app
   - Open browser console (F12)
   - Type: `console.log(window.Clerk?.user?.id)`
   - Copy the ID
4. In seed file, replace:
   ```sql
   -- Replace these UUIDs with your real Clerk user IDs
   'user_xxx' → 'your_real_clerk_user_id'
   ```
5. Paste and run in Supabase SQL Editor

---

## PART 3: Configure Clerk JWT (for Trades Network)

### Prerequisites

- ✅ Clerk account
- ✅ Supabase JWT secret

### Steps

#### 1. Get Supabase JWT Secret

1. Open Supabase Dashboard
2. Go to Settings → API
3. Find "JWT Secret" under "JWT Settings"
4. Click "Copy" to copy the secret

#### 2. Configure Clerk JWT Template

1. Go to Clerk Dashboard:

   ```
   https://dashboard.clerk.com/
   ```

2. Navigate to:
   - Your application
   - JWT Templates (in left sidebar)

3. Click "New template"

4. Select "Supabase" template

5. Template Settings:
   - **Name**: `supabase`
   - **Signing Algorithm**: HS256
   - **Signing Key**: Paste your Supabase JWT Secret

6. Click "Apply Changes"

#### 3. Verify Configuration

1. Go to your app: `/network/opportunities`
2. You should see the page load without auth errors
3. If you see "Unauthorized" → Check JWT template name is exactly `supabase`

---

## Verification Checklist

### Branding Setup ✅

- [ ] Visited `/settings/branding`
- [ ] Filled out company name
- [ ] Filled out email
- [ ] Filled out phone
- [ ] Uploaded logo
- [ ] Selected brand colors
- [ ] Clicked "Save Branding"
- [ ] Verified data persists after refresh

### Trades Network Database ✅ (Optional)

- [ ] Opened Supabase SQL Editor
- [ ] Copied migration file
- [ ] Pasted and ran SQL
- [ ] Saw success message
- [ ] Verified tables exist in Table Editor
- [ ] (Optional) Added demo data

### Clerk JWT Configuration ✅ (Optional)

- [ ] Got Supabase JWT Secret
- [ ] Created "supabase" template in Clerk
- [ ] Pasted JWT secret
- [ ] Saved template
- [ ] Tested `/network/opportunities` page

---

## Troubleshooting

### Branding Upload Issues

**Problem: "Upload failed: SyntaxError"**

- ✅ FIXED! This was the base64 encoding issue
- Solution: Already deployed in latest version
- If still seeing: Clear browser cache, try again

**Problem: "File too large"**

- Solution: Compress image to under 5MB
- Tools: TinyPNG, ImageOptim, or online compressors

**Problem: Logo doesn't display**

- Check browser console for errors
- Verify image uploaded (refresh page)
- Try different image format

### Database Migration Issues

**Problem: "Table already exists"**

- Solution: Tables were already created
- You can skip this step OR
- Drop tables first (careful! data will be lost)

**Problem: "Permission denied"**

- Solution: Check you're using correct database
- Verify database user has CREATE TABLE permissions

**Problem: "Syntax error"**

- Solution: Make sure you copied entire file
- Don't modify the SQL
- Run entire script at once

### Clerk JWT Issues

**Problem: "Unauthorized" on Trades Network pages**

- Check JWT template name is exactly "supabase"
- Verify JWT secret is correct
- Try logging out and back in

---

## Next Steps After Setup

### Once Branding is Complete:

1. ✅ Banner disappears from dashboard
2. ✅ Your logo appears throughout app
3. ✅ Brand colors are applied
4. ✅ All features unlocked

### Once Trades Network is Setup:

1. ✅ Visit `/network/opportunities`
2. ✅ Browse job postings
3. ✅ Post your own opportunities
4. ✅ Send messages to contractors
5. ✅ Manage subscriptions

---

## Support

**Documentation:**

- `START_HERE.md` - Quick start guide
- `FIXES_DEPLOYED_STATUS.md` - Complete status
- `CRITICAL_ISSUES_AND_FIXES.md` - Technical details

**Production URL:**

```
https://preloss-vision-main-nr0ghn5ho-buildingwithdamiens-projects.vercel.app
```

**Key Routes:**

- Branding: `/settings/branding`
- Dashboard: `/dashboard`
- Trades Network: `/network/opportunities`

---

## Success Criteria

✅ **You'll know it worked when:**

**Branding:**

- Your logo appears in navigation
- Company name shows in headers
- Brand colors are visible
- No more branding banner

**Trades Network:**

- `/network/opportunities` loads without errors
- You can view job postings
- You can post opportunities (with Full Access)
- Messaging works

---

**Need Help?** Check the browser console (F12) for error messages and review the documentation files.
