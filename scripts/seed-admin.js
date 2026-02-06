/**
 * Firebase Admin SDK Seed Script
 * 
 * This script seeds the production Firestore database with curriculum data.
 * Run with: node --env-file=.env.local scripts/seed-admin.js
 * 
 * Prerequisites:
 * 1. Firebase Admin SDK service account key (download from Firebase Console)
 * 2. Place service account key at: firebase-admin-key.json
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-key.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});

const db = admin.firestore();

// Module data
const modules = [
    {
        id: "module-1",
        title: "Module 1: Bekabeling & Gear",
        description: "Fundamentals van audio kabels, connectoren en signaalflow.",
        order: 1,
        semester: 1,
        semesterLabel: "Semester 1: Audio",
        status: "published",
    },
    {
        id: "module-2",
        title: "Module 2: Priklijsten & Patching",
        description: "Van tourbook naar stage plot: praktisch patchen en stage management.",
        order: 2,
        semester: 1,
        semesterLabel: "Semester 1: Audio",
        status: "published",
    },
    {
        id: "module-3",
        title: "Module 3: Geluidstechniek Basis",
        description: "Microfoons, lijnniveaus, en eerste stappen achter de mengpaneel.",
        order: 3,
        semester: 1,
        semesterLabel: "Semester 1: Audio",
        status: "published",
    },
    {
        id: "module-4",
        title: "Module 4: Mixing & FOH",
        description: "EQ, compressie, reverb en het mixen van een volledige band.",
        order: 4,
        semester: 1,
        semesterLabel: "Semester 1: Audio",
        status: "published",
    },
    {
        id: "module-5",
        title: "Module 5: Lichttechniek Introductie",
        description: "DMX, fixtures, en hoe licht werkt in een live setting.",
        order: 5,
        semester: 2,
        semesterLabel: "Semester 2: Light",
        status: "published",
    },
    {
        id: "module-6",
        title: "Module 6: Lichtontwerp Basis",
        description: "Kleur, positioning, en het creëren van sfeer met licht.",
        order: 6,
        semester: 2,
        semesterLabel: "Semester 2: Light",
        status: "published",
    },
    {
        id: "module-7",
        title: "Module 7: GrandMA3 Programmeren",
        description: "Van scratch naar showfile: leer programmeren op de GrandMA3.",
        order: 7,
        semester: 2,
        semesterLabel: "Semester 2: Light",
        status: "published",
    },
    {
        id: "module-8",
        title: "Module 8: Lichtshows & Busking",
        description: "Live licht runnen voor festivals, concerten en evenementen.",
        order: 8,
        semester: 2,
        semesterLabel: "Semester 2: Light",
        status: "published",
    }
];

// Lesson data (33 lessons across all modules)
const lessons = [
    // Module 1: Bekabeling & Gear
    { moduleId: "module-1", title: "Introductie Bekabeling", number: "1.1", vimeoId: "76979871", duration: "18 min" },
    { moduleId: "module-1", title: "XLR vs Jack", number: "1.2", vimeoId: "76979871", duration: "22 min" },
    { moduleId: "module-1", title: "Kabel Management", number: "1.3", vimeoId: "76979871", duration: "15 min" },
    { moduleId: "module-1", title: "Signaalflow Basis", number: "1.4", vimeoId: "76979871", duration: "25 min" },

    // Module 2: Priklijsten & Patching
    { moduleId: "module-2", title: "Lezen van een Tourbook", number: "2.1", vimeoId: "76979871", duration: "20 min" },
    { moduleId: "module-2", title: "Stage Plots Interpreteren", number: "2.2", vimeoId: "76979871", duration: "18 min" },
    { moduleId: "module-2", title: "Praktisch Patchen", number: "2.3", vimeoId: "76979871", duration: "30 min" },
    { moduleId: "module-2", title: "Troubleshooting Signaalflow", number: "2.4", vimeoId: "76979871", duration: "22 min" },

    // Module 3: Geluidstechniek Basis
    { moduleId: "module-3", title: "Microfoon Types", number: "3.1", vimeoId: "76979871", duration: "24 min" },
    { moduleId: "module-3", title: "Lijnniveau vs Micniveau", number: "3.2", vimeoId: "76979871", duration: "16 min" },
    { moduleId: "module-3", title: "Je Eerste Soundcheck", number: "3.3", vimeoId: "76979871", duration: "28 min" },
    { moduleId: "module-3", title: "Monitor Mixing Basics", number: "3.4", vimeoId: "76979871", duration: "26 min" },

    // Module 4: Mixing & FOH
    { moduleId: "module-4", title: "EQ Fundamentals", number: "4.1", vimeoId: "76979871", duration: "25 min" },
    { moduleId: "module-4", title: "Compressie & Dynamics", number: "4.2", vimeoId: "76979871", duration: "30 min" },
    { moduleId: "module-4", title: "Reverb & Effecten", number: "4.3", vimeoId: "76979871", duration: "22 min" },
    { moduleId: "module-4", title: "Live Band Mix", number: "4.4", vimeoId: "76979871", duration: "35 min" },

    // Module 5: Lichttechniek Introductie
    { moduleId: "module-5", title: "DMX Protocol", number: "5.1", vimeoId: "76979871", duration: "20 min" },
    { moduleId: "module-5", title: "Fixture Types", number: "5.2", vimeoId: "76979871", duration: "24 min" },
    { moduleId: "module-5", title: "Addressing & Patching", number: "5.3", vimeoId: "76979871", duration: "18 min" },
    { moduleId: "module-5", title: "Power & Rigging Safety", number: "5.4", vimeoId: "76979871", duration: "22 min" },

    // Module 6: Lichtontwerp Basis
    { moduleId: "module-6", title: "Kleurtheorie voor Licht", number: "6.1", vimeoId: "76979871", duration: "20 min" },
    { moduleId: "module-6", title: "Lichtpositionering", number: "6.2", vimeoId: "76979871", duration: "25 min" },
    { moduleId: "module-6", title: "Sfeer Creëren", number: "6.3", vimeoId: "76979871", duration: "28 min" },

    // Module 7: GrandMA3 Programmeren
    { moduleId: "module-7", title: "GrandMA3 Interface", number: "7.1", vimeoId: "76979871", duration: "30 min" },
    { moduleId: "module-7", title: "Fixtures Patchen in MA3", number: "7.2", vimeoId: "76979871", duration: "25 min" },
    { moduleId: "module-7", title: "Cues & Sequences", number: "7.3", vimeoId: "76979871", duration: "35 min" },
    { moduleId: "module-7", title: "Effects & Timing", number: "7.4", vimeoId: "76979871", duration: "32 min" },

    // Module 8: Lichtshows & Busking
    { moduleId: "module-8", title: "Live Busking Technieken", number: "8.1", vimeoId: "76979871", duration: "28 min" },
    { moduleId: "module-8", title: "Festival Stage Lighting", number: "8.2", vimeoId: "76979871", duration: "30 min" },
    { moduleId: "module-8", title: "Showfile Voorbereiding", number: "8.3", vimeoId: "76979871", duration: "26 min" },
    { moduleId: "module-8", title: "Troubleshooting Live", number: "8.4", vimeoId: "76979871", duration: "24 min" },
    { moduleId: "module-8", title: "Career Tips & Networking", number: "8.5", vimeoId: "76979871", duration: "20 min" },
];

// Live training slots
const liveSlots = [
    {
        id: "slot-1",
        title: "PRAKTIJKDAG: AUDIO BASICS",
        description: "Hands-on training met kabels, microfoons en analoge mixers.",
        startTime: new Date("2026-03-15T10:00:00"),
        endTime: new Date("2026-03-15T16:00:00"),
        capacity: 6,
        prerequisiteModuleIds: ["module-1", "module-2", "module-3", "module-4"],
        bookedUserIds: []
    },
    {
        id: "slot-2",
        title: "PRAKTIJKDAG: LIGHTING INIT",
        description: "Eerste keer achter de knoppen van een GrandMA3 command wing.",
        startTime: new Date("2026-04-20T10:00:00"),
        endTime: new Date("2026-04-20T16:00:00"),
        capacity: 6,
        prerequisiteModuleIds: ["module-5", "module-6"],
        bookedUserIds: []
    },
    {
        id: "slot-3",
        title: "PRAKTIJKDAG: ADVANCED AUDIO",
        description: "FOH mixing voor een live band, EQ en compression masterclass.",
        startTime: new Date("2026-05-10T10:00:00"),
        endTime: new Date("2026-05-10T17:00:00"),
        capacity: 8,
        prerequisiteModuleIds: ["module-1", "module-2", "module-3", "module-4"],
        bookedUserIds: []
    },
    {
        id: "slot-4",
        title: "PRAKTIJKDAG: LIGHTING SHOW",
        description: "Programmeer een volledige lichtshow en leer live busken.",
        startTime: new Date("2026-06-05T10:00:00"),
        endTime: new Date("2026-06-05T17:00:00"),
        capacity: 8,
        prerequisiteModuleIds: ["module-5", "module-6", "module-7", "module-8"],
        bookedUserIds: []
    }
];

async function seed() {
    console.log('🌱 Starting production database seed...\n');

    const batch = db.batch();

    // Seed Modules
    console.log('📚 Seeding modules...');
    for (const module of modules) {
        const ref = db.collection('modules').doc(module.id);
        batch.set(ref, module);
    }
    console.log(`✅ ${modules.length} modules queued\n`);

    // Seed Lessons
    console.log('📖 Seeding lessons...');
    let lessonCount = 0;
    for (const lesson of lessons) {
        const id = `lesson-${lesson.moduleId}-${lessonCount++}`;
        const ref = db.collection('lessons').doc(id);
        batch.set(ref, {
            ...lesson,
            id,
            order: lessonCount,
            resources: [],
            handoutMarkdown: "# Notes\n\nDit is een voorbeeld handout.",
        });
    }
    console.log(`✅ ${lessons.length} lessons queued\n`);

    // Seed Live Slots
    console.log('📅 Seeding live training slots...');
    for (const slot of liveSlots) {
        const ref = db.collection('liveSlots').doc(slot.id);
        batch.set(ref, slot);
    }
    console.log(`✅ ${liveSlots.length} live slots queued\n`);

    // Commit batch
    console.log('💾 Committing to Firestore...');
    await batch.commit();

    console.log('\n✅ Production database seeded successfully!');
    console.log(`\nSummary:`);
    console.log(`- ${modules.length} modules`);
    console.log(`- ${lessons.length} lessons`);
    console.log(`- ${liveSlots.length} live training slots`);
    console.log('\n🚀 FOH Academy is ready for students!\n');

    process.exit(0);
}

seed().catch(error => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
});
