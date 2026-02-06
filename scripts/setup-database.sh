#!/bin/bash

# FOH Academy - Database Setup Script
# This script helps you set up Firebase Admin credentials and seed the database

echo "🎓 FOH Academy - Database Setup Helper"
echo "========================================"
echo ""

# Check if firebase-admin-key.json exists
if [ -f "firebase-admin-key.json" ]; then
    echo "✅ Firebase Admin key found!"
    echo ""
    echo "Running seeding script..."
    node scripts/seed-new-curriculum.js
else
    echo "❌ Firebase Admin key NOT found"
    echo ""
    echo "📝 Setup Instructions:"
    echo ""
    echo "1. Go to Firebase Console:"
    echo "   https://console.firebase.google.com/"
    echo ""
    echo "2. Select your project: foh-platform"
    echo ""
    echo "3. Navigate to: Project Settings → Service Accounts"
    echo ""
    echo "4. Click: 'Generate new private key'"
    echo ""
    echo "5. Save the downloaded file as:"
    echo "   firebase-admin-key.json"
    echo "   (in this directory: $(pwd))"
    echo ""
    echo "6. Run this script again:"
    echo "   ./scripts/setup-database.sh"
    echo ""
    echo "⚠️  Security Note:"
    echo "   The firebase-admin-key.json file is gitignored"
    echo "   Never commit this file to version control!"
    echo ""
fi
