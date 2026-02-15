# Phase 2.1: UI/UX Polish & Refinements

## 🎨 Visual Polish

### Wizard Animations

- [ ] **Entrance Animations**: Add subtle fade-in + slide for step content (100ms delay from progress indicator)
- [ ] **Exit Animations**: Ensure smooth slide-out on back navigation
- [ ] **Loading States**: Spinner with branded color during auto-save
- [ ] **Success Feedback**: Green checkmark animation when step completes
- [ ] **Error States**: Red shake animation for validation errors

### Glass Blur & Glow Effects

- [ ] **Onboarding Backdrop**: Fine-tune blur intensity (currently 12px, test 8px and 16px)
- [ ] **Spotlight Glow**: Adjust blue glow spread (currently 20px, test pulsing effect)
- [ ] **Modal Overlays**: Apply consistent glass morphism to all modals (token upsell, notifications)
- [ ] **Card Hover States**: Add subtle glow on hover for interactive cards

### Progress Indicators

- [ ] **Wizard Progress Dots**: Animate fill on step completion (ease-in-out 300ms)
- [ ] **Token Usage Chart**: Add animated progress bar fill on load
- [ ] **Loading Skeletons**: Replace spinners with skeleton screens for dashboard panels

## 🧩 Component Refinements

### Turbo Wizard

- [ ] **Step Validation**: Show inline errors before allowing next step
- [ ] **Photo Upload UI**: Add drag-and-drop zone with preview thumbnails
- [ ] **Damage Selection**: Multi-select with visual chips (Material-UI style)
- [ ] **Review Screen**: Add expandable sections for each step's data
- [ ] **Auto-save Indicator**: "Saved 2 seconds ago" timestamp in footer
- [ ] **Keyboard Navigation**: Arrow keys for next/prev, Enter to continue

### Token System

- [ ] **Counter Animation**: Count-up/down animation when balance changes
- [ ] **Low Balance Warning**: Pulsing dot indicator when balance < 3
- [ ] **Upsell Modal Timing**: Show only after 2nd token consumption (not first)
- [ ] **Package Comparison**: Highlight "Most Popular" with badge
- [ ] **Stripe Checkout**: Add loading state during redirect

### Onboarding

- [ ] **Skip Button**: More prominent "Skip Tour" in top-right
- [ ] **Progress Dots**: Show 1/5, 2/5, etc. instead of just dots
- [ ] **Contextual Help**: Link to docs/video for each step
- [ ] **Completion Celebration**: Confetti animation on tour finish

### Dashboard

- [ ] **Job History**: Add status filter (All, Processing, Complete, Failed)
- [ ] **Token Chart**: Add date range picker (Last 7 days, 30 days, All time)
- [ ] **Notification Bell**: Badge count for unread notifications
- [ ] **Empty States**: Friendly illustrations when no jobs/notifications

## 🎯 UX Improvements

### Navigation & Flow

- [ ] **Wizard Entry Point**: Add prominent CTA on homepage (above fold)
- [ ] **Breadcrumbs**: Show "Dashboard > New Job > Step 3" navigation
- [ ] **Exit Confirmation**: "Save draft?" modal if user leaves mid-wizard
- [ ] **Resume Draft**: "Continue where you left off" banner on dashboard

### Responsiveness

- [ ] **Mobile Wizard**: Test all 6 steps on 375px viewport
- [ ] **Tablet Layout**: Optimize sidebar navigation for iPad
- [ ] **Touch Targets**: Ensure all buttons ≥ 44x44px
- [ ] **Gesture Support**: Swipe left/right for wizard steps on mobile

### Accessibility

- [ ] **ARIA Labels**: Add to all icon buttons (notifications, close, back)
- [ ] **Keyboard Focus**: Visible focus rings (blue outline 2px)
- [ ] **Screen Readers**: Test wizard flow with VoiceOver/NVDA
- [ ] **Color Contrast**: Ensure 4.5:1 ratio for all text (WCAG AA)
- [ ] **Alt Text**: Add to all images, icons, and logos

### Performance

- [ ] **Code Splitting**: Lazy load wizard steps (reduce initial bundle)
- [ ] **Image Optimization**: Use next/image for all photos
- [ ] **Debounce Optimization**: Test 400ms vs 600ms for auto-save
- [ ] **Skeleton Screens**: Replace spinners for better perceived performance

## 📊 Analytics & Tracking

### Events to Instrument

- [ ] **Wizard Events**: Start, Step Completion, Abandonment, Submission
- [ ] **Token Events**: Balance Check, Consumption, Upsell Modal View, Purchase Click
- [ ] **Onboarding Events**: Start Tour, Step View, Skip, Complete
- [ ] **Dashboard Events**: Panel Views, Filter Changes, CTA Clicks

### Metrics to Monitor

- [ ] **Wizard Completion Rate**: % who reach Review from Step 1
- [ ] **Step Drop-off**: Identify which step has highest abandonment
- [ ] **Token Conversion**: % who click upsell → complete purchase
- [ ] **Onboarding Completion**: % who finish tour vs skip

## 🐛 Bug Fixes & Edge Cases

### Known Issues

- [ ] **Auto-save on Unmount**: Ensure draft saves if user closes tab mid-step
- [ ] **Token Balance Race**: Handle concurrent consume requests
- [ ] **Photo Upload Size**: Add 10MB limit with friendly error
- [ ] **Wizard Reset**: Clear localStorage on successful submission

### Error Handling

- [ ] **Network Errors**: Retry auto-save with exponential backoff
- [ ] **API Failures**: Show toast notification with retry button
- [ ] **Stripe Redirect**: Handle cancelled/failed checkout gracefully
- [ ] **Session Expiry**: Redirect to login if Clerk session expires mid-wizard

## 🔐 Security & Validation

### Input Validation

- [ ] **Email Format**: RFC 5322 validation for client email
- [ ] **Phone Number**: E.164 format with country code
- [ ] **Address**: Validate with Google Maps API geocoding
- [ ] **File Uploads**: Whitelist image types (jpg, png, heic)

### Rate Limiting

- [ ] **Auto-save**: Max 1 request per 300ms (client-side)
- [ ] **Token Consume**: Max 10 per minute per user (server-side)
- [ ] **API Routes**: Apply middleware to all /api/wizard/\* endpoints

## 📱 Mobile-First Enhancements

### Progressive Web App

- [ ] **Add to Home Screen**: manifest.json with app icons
- [ ] **Offline Support**: Service worker for offline draft editing
- [ ] **Push Notifications**: "Your job is ready!" when AI completes
- [ ] **Native Share**: Share wizard results via Web Share API

### Touch Interactions

- [ ] **Swipe Gestures**: Swipe right to go back in wizard
- [ ] **Pull to Refresh**: Reload dashboard panels
- [ ] **Long Press**: Context menu for job history items

## 🧪 Testing

### Unit Tests

- [ ] **Wizard Store**: Test all Zustand actions (nextStep, updateJobData, reset)
- [ ] **Token Store**: Test consumeToken, fetchBalance, showUpsellModal
- [ ] **Onboarding Store**: Test step progression, skip, complete

### Integration Tests

- [ ] **Wizard Flow**: E2E test from start to submission
- [ ] **Token Upsell**: Click package → redirect to Stripe
- [ ] **Auto-save**: Verify debounce + API call

### Visual Regression

- [ ] **Screenshot Tests**: Playwright snapshots for all wizard steps
- [ ] **Chromatic/Percy**: Storybook stories for all components

## 🚀 Future Enhancements (Phase 3)

### AI Features

- [ ] **Smart Suggestions**: Pre-fill damage types based on photos
- [ ] **Budget Estimator**: ML-powered cost prediction
- [ ] **Voice Input**: Dictate notes instead of typing

### Collaboration

- [ ] **Share Draft**: Generate link to share wizard state
- [ ] **Team Workspaces**: Assign jobs to team members
- [ ] **Comments**: Annotate photos with markup tools

### Integrations

- [ ] **Calendar**: Schedule inspections via Google Calendar
- [ ] **CRM Sync**: Push jobs to Salesforce/HubSpot
- [ ] **QuickBooks**: Export invoices automatically

---

## 📌 Priority Ranking

**P0 (Launch Blockers):**

- Wizard step validation
- Mobile responsive wizard
- Auto-save on unmount
- ARIA labels for accessibility

**P1 (Week 1):**

- Loading states & skeletons
- Error handling & retry
- Analytics instrumentation
- Photo upload UI

**P2 (Week 2-3):**

- Animation polish
- Keyboard navigation
- Visual regression tests
- Performance optimization

**P3 (Backlog):**

- PWA features
- Voice input
- Team collaboration
- Third-party integrations
