
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
    // Module 1
    { moduleId: "module-1", title: "Introductie Bekabeling", number: "1.1", vimeoId: "76979871" }, // Placeholder ID
    { moduleId: "module-1", title: "XLR vs Jack", number: "1.2", vimeoId: "76979871" },
    { moduleId: "module-1", title: "Kabel Management", number: "1.3", vimeoId: "76979871" },

    // Module 2
    { moduleId: "module-2", title: "De Priklijst Lezen", number: "2.1", vimeoId: "76979871" },
    { moduleId: "module-2", title: "Stageblock Patching", number: "2.2", vimeoId: "76979871" },

    // Module 3
    { moduleId: "module-3", title: "Dynamisch vs Condensator", number: "3.1", vimeoId: "76979871" },
    { moduleId: "module-3", title: "Drum Kit Micing", number: "3.2", vimeoId: "76979871" },

    // Module 4
    { moduleId: "module-4", title: "Line Check Protocol", number: "4.1", vimeoId: "76979871" },
    { moduleId: "module-4", title: "Gain Staging", number: "4.2", vimeoId: "76979871" },
];

const liveSlots = [
    {
        title: "PRAKTIJKDAG: AUDIO BASICS",
        description: "Hands-on training met kabels, microfoons en analoge mixers.",
        startTime: new Date("2024-03-15T10:00:00"),
        endTime: new Date("2024-03-15T16:00:00"),
        capacity: 6,
        prerequisiteModuleIds: ["module-1", "module-2", "module-3", "module-4"],
    },
    {
        title: "PRAKTIJKDAG: LIGHTING INIT",
        description: "Eerste keer achter de knoppen van een GrandMA3 command wing.",
        startTime: new Date("2024-04-20T10:00:00"),
        endTime: new Date("2024-04-20T16:00:00"),
        capacity: 6,
        prerequisiteModuleIds: ["module-5", "module-6"],
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
            duration: "10:00",
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
