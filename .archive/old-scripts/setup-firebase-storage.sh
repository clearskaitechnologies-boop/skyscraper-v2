#!/bin/bash

# Firebase Storage Setup Script
# Run this script to deploy Firebase Storage rules and test the connection

echo "🔥 Setting up Firebase Storage for SkaiScraper™"
echo "================================================"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "Please log in to Firebase:"
    firebase login
fi

# Set the project
echo "📁 Setting Firebase project to skaiscraper..."
firebase use skaiscraper

# Deploy storage rules
echo "📋 Deploying Firebase Storage rules..."
firebase deploy --only storage

# Test the connection
echo "🧪 Testing Firebase Storage connection..."

# Create a test upload script
cat > test-firebase-storage.js << 'EOF'
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

async function testStorage() {
  try {
    const bucket = admin.storage().bucket();
    
    // Test 1: Create a test file
    const testFile = bucket.file('test/connection-test.txt');
    await testFile.save('Firebase Storage is working!');
    console.log('✅ Test file uploaded successfully');
    
    // Test 2: Read the file
    const [data] = await testFile.download();
    console.log('✅ Test file downloaded:', data.toString());
    
    // Test 3: Delete the file
    await testFile.delete();
    console.log('✅ Test file deleted successfully');
    
    console.log('🎉 Firebase Storage is configured correctly!');
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error);
    process.exit(1);
  }
}

testStorage();
EOF

# Run the test with environment variables
echo "🔍 Running connection test..."
node test-firebase-storage.js

# Clean up
rm test-firebase-storage.js

echo ""
echo "✅ Firebase Storage setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify STORAGE_ENABLED=true in your .env.local"
echo "2. Test file uploads in your application"
echo "3. Monitor uploads in Firebase Console: https://console.firebase.google.com/project/skaiscraper/storage"
echo ""
echo "🔧 Environment variables needed:"
echo "   STORAGE_ENABLED=true"
echo "   FIREBASE_PROJECT_ID=skaiscraper"
echo "   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@skaiscraper.iam.gserviceaccount.com"
echo "   FIREBASE_PRIVATE_KEY=(your private key)"
echo "   FIREBASE_STORAGE_BUCKET=skaiscraper.appspot.com"
echo "   NEXT_PUBLIC_FIREBASE_PROJECT_ID=skaiscraper"
echo "   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=skaiscraper.appspot.com"
