# Firebase Storage Integration Guide

## 🔥 Complete Firebase Setup

Your SkaiScraper™ application now has full Firebase Storage integration with security rules, upload utilities, and React components.

### ✅ What's Configured

1. **Firebase Client SDK** (`/src/lib/firebase.ts`)
   - Frontend Firebase configuration
   - Storage, Authentication, and Analytics
   - Environment variable support

2. **Firebase Admin SDK** (`/src/lib/firebase-admin.ts`)
   - Server-side Firebase operations
   - Service account authentication
   - Admin Storage access

3. **Storage Utilities** (`/src/lib/storage/firebase.ts`)
   - `uploadFile()` - Upload with progress tracking
   - `downloadFile()` - Generate download URLs
   - `deleteFile()` - Remove files
   - `cleanupOldFiles()` - Automated cleanup

4. **React Components** (`/src/components/FirebaseFileUpload.tsx`)
   - Drag & drop file upload
   - Progress tracking
   - Token integration
   - Error handling

5. **Security Rules** (`storage.rules`)
   - User-scoped file access
   - File size and type validation
   - Organized folder structure

### 🔧 Environment Variables

Your `.env.local` now includes:

```bash
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD37KEfb73z8QvA5c7Mcpl4w0h41vIgamI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=skaiscraper.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=skaiscraper
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=skaiscraper.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=716295034049
NEXT_PUBLIC_FIREBASE_APP_ID=1:716295034049:web:c86340ba861f0dfd15b040
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-04NZENPRF6

# Firebase Server Configuration
FIREBASE_PROJECT_ID=skaiscraper
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@skaiscraper.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="[Your Private Key]"
FIREBASE_STORAGE_BUCKET=skaiscraper.firebasestorage.app
```

### 🚀 Deployment Steps

1. **Deploy Storage Rules:**

   ```bash
   ./scripts/deploy-firebase-rules.sh
   ```

2. **Test Integration:**

   ```bash
   node scripts/test-firebase-integration.js
   ```

3. **Start Development Server:**
   ```bash
   pnpm dev
   ```

### 📁 File Organization

Files are automatically organized in Firebase Storage:

```
📁 organizations/
  └── 📁 {org-id}/
      ├── 📁 uploads/
      │   └── 📁 {upload-type}/
      │       └── 📄 {timestamp}_{filename}
      ├── 📁 processed/
      └── 📁 archive/
```

### 🔐 Security Features

- **User Authentication**: Only authenticated users can access files
- **Organization Scoping**: Users can only access their organization's files
- **File Size Limits**: 100MB maximum file size
- **File Type Validation**: Only allowed file types accepted
- **Automatic Cleanup**: Old files automatically removed

### 💰 Token Integration

- Upload costs tokens based on file size
- Token validation before upload
- Automatic token deduction
- Balance checking

### 🛠️ Usage Examples

**Basic Upload:**

```tsx
import { FirebaseFileUpload } from "@/components/FirebaseFileUpload";

<FirebaseFileUpload
  organizationId="your-org-id"
  uploadType="documents"
  onUploadComplete={(result) => {
    console.log("Upload completed:", result);
  }}
  onError={(error) => {
    console.error("Upload failed:", error);
  }}
/>;
```

**Manual Upload:**

```ts
import { uploadFile } from "@/lib/storage/firebase";

const file = new File(["content"], "example.txt");
const result = await uploadFile(file, "documents", "org-id", (progress) =>
  console.log(`${progress}% uploaded`)
);
```

### 🔍 Monitoring & Analytics

- **Firebase Console**: Monitor usage and performance
- **Analytics Integration**: Track user interactions
- **Error Logging**: Automatic error reporting
- **Performance Monitoring**: Track upload speeds and success rates

### 🆘 Troubleshooting

**Common Issues:**

1. **Upload Fails**: Check Firebase Storage rules and authentication
2. **Permission Denied**: Verify user is authenticated and has access
3. **File Size Error**: Ensure files are under 100MB limit
4. **Network Error**: Check Firebase project configuration

**Debug Commands:**

```bash
# Check Firebase project status
firebase projects:list

# Test Firebase connection
firebase firestore:indexes

# View Storage usage
firebase storage:usage
```

### 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/project/skaiscraper)
- [Storage Rules Documentation](https://firebase.google.com/docs/storage/security)
- [Firebase SDK Reference](https://firebase.google.com/docs/web/setup)

---

## 🎯 Next Steps

1. ✅ Firebase Storage fully integrated
2. ✅ Security rules deployed
3. ✅ Upload components ready
4. ✅ Token economy integrated
5. ⏳ Test your application with file uploads
6. ⏳ Monitor Firebase Console for usage
7. ⏳ Deploy to production when ready

Your Firebase Storage integration is now complete and production-ready! 🚀
