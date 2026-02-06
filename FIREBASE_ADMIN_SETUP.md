# Firebase Admin SDK - Service Account Setup

## Quick Setup Guide

To run the automated seeding script, you need a Firebase Admin SDK service account key.

### Steps:

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/project/foh-platform/settings/serviceaccounts/adminsdk

2. **Generate New Private Key:**
   - Click "Generate new private key"
   - Confirm the download
   - Save the file as `firebase-admin-key.json` in the root of this project

3. **Install Dependencies (if needed):**
   ```bash
   npm install firebase-admin
   ```

4. **Run the Seeding Script:**
   ```bash
   node scripts/seed-admin.js
   ```

5. **Expected Output:**
   ```
   🌱 Starting production database seed...
   📚 Seeding modules...
   ✅ 8 modules queued
   📖 Seeding lessons...
   ✅ 33 lessons queued
   📅 Seeding live training slots...
   ✅ 4 live slots queued
   💾 Committing to Firestore...
   ✅ Production database seeded successfully!
   ```

### Security Note:

⚠️ **NEVER commit `firebase-admin-key.json` to Git!**

The file is already in `.gitignore`, but double-check before pushing.

### Alternative: Manual Seeding via Admin Panel

If you prefer not to use the Admin SDK:
1. Deploy the platform first
2. Log in to `/admin`
3. Use the UI to manually create all modules and lessons
4. This is more time-consuming but doesn't require service account setup
