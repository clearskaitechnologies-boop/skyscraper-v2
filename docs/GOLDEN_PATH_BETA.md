# 🎯 GOLDEN PATH — BETA VALIDATION CHECKLIST

**Date Created**: December 12, 2025  
**Purpose**: Define and test the ONE canonical workflow that must be flawless for beta success

---

## THE GOLDEN PATH (6 STEPS)

This is the workflow you test **daily** and optimize **relentlessly**.

### Step 1: Sign In

**Goal**: User gets authenticated and lands in workspace  
**Success**: Loads dashboard within 3 seconds, no errors

**Test**:

- [ ] Sign in with Google works
- [ ] Sign in with email works
- [ ] User lands on dashboard (not blank screen)
- [ ] No redirect loops
- [ ] Organization context loads

**Friction Points to Watch**:

- Legal gate blocking flow?
- Branding setup interrupting?
- Unclear next action?

---

### Step 2: Create Claim

**Goal**: User initiates a new insurance claim  
**Success**: Claim created, user lands in claim workspace

**Test**:

- [ ] "New Claim" button visible and clear
- [ ] Form loads properly
- [ ] Minimal required fields only
- [ ] Submit works without errors
- [ ] Redirects to claim workspace (not overview)

**Friction Points to Watch**:

- Too many required fields?
- Form validation confusing?
- Unclear what to enter?

---

### Step 3: Upload Photos

**Goal**: User adds damage photos to claim  
**Success**: Photos uploaded, visible in claim workspace

**Test**:

- [ ] Upload button/area is obvious
- [ ] Drag-and-drop works
- [ ] File picker works
- [ ] Progress indicator shows
- [ ] Photos appear after upload
- [ ] Thumbnails load properly

**Friction Points to Watch**:

- Upload fails silently?
- No feedback during upload?
- Unclear where photos went?

---

### Step 4: Generate Report / Tool Output

**Goal**: User creates AI-powered output (report, mockup, weather verification, etc.)  
**Success**: Tool runs, output generated, user sees result

**Test**:

- [ ] Tool button/link is clear
- [ ] Loading state shows
- [ ] Generation completes
- [ ] Output renders properly
- [ ] Download/save options visible

**Friction Points to Watch**:

- Tool takes too long?
- No progress feedback?
- Output unclear or ugly?
- Errors not explained?

---

### Step 5: Save to Claim/Report

**Goal**: User saves generated output back to claim  
**Success**: Output attached, visible in claim documents

**Test**:

- [ ] "Save to Claim" button exists
- [ ] Click works
- [ ] Confirmation message shows
- [ ] Document appears in claim
- [ ] Can view saved document

**Friction Points to Watch**:

- Unclear if save worked?
- Document not findable after save?
- Multiple clicks required?

---

### Step 6: Download or Share

**Goal**: User exports final deliverable  
**Success**: PDF/DOCX downloads or share link generated

**Test**:

- [ ] Export button is obvious
- [ ] Format options clear (PDF, DOCX, etc.)
- [ ] Download starts
- [ ] File opens properly
- [ ] Share link generates (if applicable)

**Friction Points to Watch**:

- Export fails silently?
- File format wrong?
- Download doesn't start?
- Share link broken?

---

## DAILY TESTING PROTOCOL

**Who**: Product owner (you) runs this daily for first 3 days  
**When**: Morning, before making any changes  
**How**: Fresh incognito window, real workflow

### Testing Log Template

```
Date: ______
Time: ______
Browser: ______

Step 1 (Sign In): ✅ / ❌
  - Issue: ___________

Step 2 (Create Claim): ✅ / ❌
  - Issue: ___________

Step 3 (Upload Photos): ✅ / ❌
  - Issue: ___________

Step 4 (Generate Output): ✅ / ❌
  - Issue: ___________

Step 5 (Save to Claim): ✅ / ❌
  - Issue: ___________

Step 6 (Download/Share): ✅ / ❌
  - Issue: ___________

Overall Time: _____ minutes
Pain Points: _____________
What felt clunky: _____________
What would I change: _____________
```

---

## SUCCESS CRITERIA

Golden Path is **validated** when:

- [ ] Completes in under 5 minutes
- [ ] Zero errors or crashes
- [ ] User never asks "wait, what?"
- [ ] Every action has clear feedback
- [ ] Output is professional quality
- [ ] 3 external users complete it without help

---

## WHAT TO FIX FIRST

After each test, prioritize fixes by:

1. **Blockers** (prevents completion) → Fix immediately
2. **Confusion** (user pauses/asks) → Fix within 24 hours
3. **Friction** (takes extra clicks) → Fix within 3 days
4. **Polish** (works but ugly) → Fix after beta

---

## EXPANSION AFTER GOLDEN PATH IS SOLID

Only after this path is **flawless** do you:

- Add more tools
- Build new workflows
- Expand integrations
- Add premium features

**Why?** Because if users can't complete this core flow easily, nothing else matters.

---

**Next Review**: After 3 days of daily testing
**Owner**: Founder
**Status**: 🟡 In Progress
