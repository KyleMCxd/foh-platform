/**
 * FOH Academy - Cleanup Old Lessons
 * 
 * This script removes old lesson data that was created before
 * the new 5-level curriculum hierarchy was implemented.
 * 
 * Old lessons can be identified by the absence of the new
 * hierarchy fields (semesterId, blockId, weekId).
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'firebase-admin-key.json');

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.error('❌ Error loading firebase-admin-key.json');
    console.error('   Make sure the file exists in the project root.');
    process.exit(1);
}

const db = admin.firestore();

async function cleanupOldLessons() {
    console.log('\n🧹 FOH Academy - Cleanup Old Lessons');
    console.log('=====================================\n');

    try {
        // Get all lessons
        const lessonsSnapshot = await db.collection('lessons').get();

        console.log(`📊 Found ${lessonsSnapshot.size} total lessons\n`);

        const oldLessons = [];
        const newLessons = [];

        lessonsSnapshot.forEach(doc => {
            const data = doc.data();
            // Old lessons don't have semesterId or blockId (new hierarchy fields)
            if (!data.semesterId || !data.blockId || !data.weekId) {
                oldLessons.push({
                    id: doc.id,
                    title: data.title || 'Untitled',
                    moduleId: data.moduleId
                });
            } else {
                newLessons.push({
                    id: doc.id,
                    title: data.title
                });
            }
        });

        console.log(`✅ New curriculum lessons: ${newLessons.length}`);
        console.log(`⚠️  Old lessons to delete: ${oldLessons.length}\n`);

        if (oldLessons.length === 0) {
            console.log('🎉 No old lessons found! Database is clean.\n');
            return;
        }

        console.log('📋 Old lessons to be deleted:');
        oldLessons.forEach((lesson, i) => {
            console.log(`   ${i + 1}. "${lesson.title}" (ID: ${lesson.id})`);
        });
        console.log('');

        // Delete old lessons in batches
        const batch = db.batch();

        for (const lesson of oldLessons) {
            const lessonRef = db.collection('lessons').doc(lesson.id);
            batch.delete(lessonRef);
        }

        console.log('🗑️  Deleting old lessons...');
        await batch.commit();

        console.log(`\n✅ Successfully deleted ${oldLessons.length} old lessons!`);
        console.log(`📚 Remaining lessons: ${newLessons.length} (new curriculum)\n`);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupOldLessons()
    .then(() => {
        console.log('🎉 Cleanup complete!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
