
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const modules = [
    // SEMESTER 1
    {
        id: "module-1",
        title: "Module 1: Bekabeling & Gear",
        description: "Alles over kabels, connectoren en de basis uitrusting.",
        order: 1,
        semester: 1,
        status: "published",
    },
    {
        id: "module-2",
        title: "Module 2: Priklijsten & Patching",
        description: "Hoe lees je een priklijst en patch je een stageblock.",
        order: 2,
        semester: 1,
        status: "published",
    },
    {
        id: "module-3",
        title: "Module 3: Microfoontechniek",
        description: "De juiste microfoon voor de juiste bron.",
        order: 3,
        semester: 1,
        status: "published",
    },
    {
        id: "module-4",
        title: "Module 4: Line Check & Sound Check",
        description: "Workflow voor een efficiënte check.",
        order: 4,
        semester: 1,
        status: "published",
    },
    // SEMESTER 2
    {
        id: "module-5",
        title: "Module 5: Licht Console Basis",
        description: "Navigeren op de GrandMA3 en basis patching.",
        order: 5,
        semester: 2,
        status: "published",
    },
    {
        id: "module-6",
        title: "Module 6: Fixtures & DMX",
        description: "Hoe werken lampen en DMX adressering.",
        order: 6,
        semester: 2,
        status: "published",
    },
    {
        id: "module-7",
        title: "Module 7: Programmeren & Cues",
        description: "Het maken van je eerste lichtshow.",
        order: 7,
        semester: 2,
        status: "published",
    },
    {
        id: "module-8",
        title: "Module 8: Busking",
        description: "Live licht bedienen op de muziek.",
        order: 8,
        semester: 2,
        status: "published",
    },
];

const lessons = [
    // Module 1: Bekabeling & Gear
    { moduleId: "module-1", title: "Introductie Bekabeling", number: "1.1", vimeoId: "76979871", duration: "18 min" },
    { moduleId: "module-1", title: "XLR vs Jack", number: "1.2", vimeoId: "76979871", duration: "22 min" },
    { moduleId: "module-1", title: "Kabel Management", number: "1.3", vimeoId: "76979871", duration: "15 min" },
    { moduleId: "module-1", title: "Speakon & Powercon", number: "1.4", vimeoId: "76979871", duration: "20 min" },

    // Module 2: Priklijsten & Patching
    { moduleId: "module-2", title: "De Priklijst Lezen", number: "2.1", vimeoId: "76979871", duration: "25 min" },
    { moduleId: "module-2", title: "Stageblock Patching", number: "2.2", vimeoId: "76979871", duration: "30 min" },
    { moduleId: "module-2", title: "Snake Beheer", number: "2.3", vimeoId: "76979871", duration: "18 min" },

    // Module 3: Microfoontechniek
    { moduleId: "module-3", title: "Dynamisch vs Condensator", number: "3.1", vimeoId: "76979871", duration: "24 min" },
    { moduleId: "module-3", title: "Drum Kit Micing", number: "3.2", vimeoId: "76979871", duration: "32 min" },
    { moduleId: "module-3", title: "Vocals & Instruments", number: "3.3", vimeoId: "76979871", duration: "28 min" },
    { moduleId: "module-3", title: "Phantom Power & DI", number: "3.4", vimeoId: "76979871", duration: "20 min" },

    // Module 4: Line Check & Sound Check
    { moduleId: "module-4", title: "Line Check Protocol", number: "4.1", vimeoId: "76979871", duration: "22 min" },
    { moduleId: "module-4", title: "Gain Staging", number: "4.2", vimeoId: "76979871", duration: "26 min" },
    { moduleId: "module-4", title: "Monitor Mix Basics", number: "4.3", vimeoId: "76979871", duration: "30 min" },
    { moduleId: "module-4", title: "FOH Sound Check", number: "4.4", vimeoId: "76979871", duration: "35 min" },

    // Module 5: Licht Console Basis
    { moduleId: "module-5", title: "GrandMA3 Interface", number: "5.1", vimeoId: "76979871", duration: "28 min" },
    { moduleId: "module-5", title: "Patching Fixtures", number: "5.2", vimeoId: "76979871", duration: "25 min" },
    { moduleId: "module-5", title: "Groups & Presets", number: "5.3", vimeoId: "76979871", duration: "30 min" },
    { moduleId: "module-5", title: "Command Line Basics", number: "5.4", vimeoId: "76979871", duration: "22 min" },

    // Module 6: Fixtures & DMX
    { moduleId: "module-6", title: "DMX Adressering", number: "6.1", vimeoId: "76979871", duration: "24 min" },
    { moduleId: "module-6", title: "Moving Heads & LED Pars", number: "6.2", vimeoId: "76979871", duration: "28 min" },
    { moduleId: "module-6", title: "Fixture Modes", number: "6.3", vimeoId: "76979871", duration: "20 min" },
    { moduleId: "module-6", title: "DMX Universes", number: "6.4", vimeoId: "76979871", duration: "26 min" },

    // Module 7: Programmeren & Cues
    { moduleId: "module-7", title: "Cue Basis", number: "7.1", vimeoId: "76979871", duration: "30 min" },
    { moduleId: "module-7", title: "Fade Times & Delays", number: "7.2", vimeoId: "76979871", duration: "25 min" },
    { moduleId: "module-7", title: "Effects Engine", number: "7.3", vimeoId: "76979871", duration: "35 min" },
    { moduleId: "module-7", title: "Sequence Builder", number: "7.4", vimeoId: "76979871", duration: "28 min" },

    // Module 8: Busking
    { moduleId: "module-8", title: "Live Playback", number: "8.1", vimeoId: "76979871", duration: "32 min" },
    { moduleId: "module-8", title: "Executor Prioriteit", number: "8.2", vimeoId: "76979871", duration: "26 min" },
    { moduleId: "module-8", title: "BPM Sync & Beat Detection", number: "8.3", vimeoId: "76979871", duration: "30 min" },
    { moduleId: "module-8", title: "Show Design Tips", number: "8.4", vimeoId: "76979871", duration: "24 min" },
];

const liveSlots = [
    {
        title: "PRAKTIJKDAG: AUDIO BASICS",
        description: "Hands-on training met kabels, microfoons en analoge mixers.",
        startTime: new Date("2026-03-15T10:00:00"),
        endTime: new Date("2026-03-15T16:00:00"),
        capacity: 6,
        prerequisiteModuleIds: ["module-1", "module-2", "module-3", "module-4"],
    },
    {
        title: "PRAKTIJKDAG: LIGHTING INIT",
        description: "Eerste keer achter de knoppen van een GrandMA3 command wing.",
        startTime: new Date("2026-04-20T10:00:00"),
        endTime: new Date("2026-04-20T16:00:00"),
        capacity: 6,
        prerequisiteModuleIds: ["module-5", "module-6"],
    },
    {
        title: "PRAKTIJKDAG: ADVANCED AUDIO",
        description: "FOH mixing voor een live band, EQ en compression masterclass.",
        startTime: new Date("2026-05-10T10:00:00"),
        endTime: new Date("2026-05-10T17:00:00"),
        capacity: 8,
        prerequisiteModuleIds: ["module-1", "module-2", "module-3", "module-4"],
    },
    {
        title: "PRAKTIJKDAG: LIGHTING SHOW",
        description: "Programmeer een volledige lichtshow en leer live busken.",
        startTime: new Date("2026-06-05T10:00:00"),
        endTime: new Date("2026-06-05T17:00:00"),
        capacity: 8,
        prerequisiteModuleIds: ["module-5", "module-6", "module-7", "module-8"],
    }
];

async function seed() {
    console.log("🌱 Seeding Firestore...");
    const batch = writeBatch(db);

    // Seed Modules
    for (const mod of modules) {
        const ref = doc(db, "modules", mod.id);
        batch.set(ref, { ...mod, createdAt: new Date() });
    }

    // Seed Lessons
    let lessonCount = 0;
    for (const lesson of lessons) {
        const id = `lesson-${lesson.moduleId}-${lessonCount++}`;
        const ref = doc(db, "lessons", id);
        batch.set(ref, {
            ...lesson,
            id,
            order: lessonCount,
            resources: [],
            handoutMarkdown: "# Notes\n\nDit is een voorbeeld handout.",
        });
    }

    // Seed Live Slots
    // Using collection() and doc() for auto-ID, but batch.set needs a doc ref with ID if usage is specific, 
    // or we can use batch.set on a doc(collection(db...)) which generates ID? No, doc() generates ID.
    for (const slot of liveSlots) {
        const ref = doc(collection(db, "liveSlots"));
        batch.set(ref, {
            ...slot,
            bookedUserIds: [],
        })
    }

    await batch.commit();
    console.log("✅ Seeding complete!");
    process.exit(0);
}

seed().catch(console.error);
