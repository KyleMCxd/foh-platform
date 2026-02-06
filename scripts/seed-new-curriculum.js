/**
 * FOH Academy - New Curriculum Seeding Script
 * 
 * 5-Level Hierarchy:
 * Semester → Block → Module → Week → Lesson
 * 
 * Total: 2 Semesters, 4 Blocks, 10 Modules, 40 Weeks, 77 Lessons
 * 
 * Run with: node scripts/seed-new-curriculum.js
 * Requires: firebase-admin-key.json in project root
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-key.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'foh-platform'
});

const db = admin.firestore();

// ===============================================
// SEMESTERS
// ===============================================

const semesters = [
    {
        id: "semester-1",
        title: "SEMESTER 1: GELUIDSTECHNIEK",
        order: 1,
        description: "Fundamentals of live sound engineering"
    },
    {
        id: "semester-2",
        title: "SEMESTER 2: LICHTTECHNIEK",
        order: 2,
        description: "Professional lighting design and operation"
    }
];

// ===============================================
// BLOCKS
// ===============================================

const blocks = [
    {
        id: "block-1",
        semesterId: "semester-1",
        title: "BLOK 1: STAGE FUNDAMENTALS",
        description: "Van de vrachtwagen naar een werkend systeem met theater-discipline.",
        order: 1
    },
    {
        id: "block-2",
        semesterId: "semester-1",
        title: "BLOK 2: MIXEN & MONITOREN",
        description: "Nu we geluid hebben, gaan we het mooi maken.",
        order: 2
    },
    {
        id: "block-3",
        semesterId: "semester-2",
        title: "BLOK 3: LIGHT & POWER",
        description: "Van stroomplan tot een werkende basis-lichtshow.",
        order: 3
    },
    {
        id: "block-4",
        semesterId: "semester-2",
        title: "BLOK 4: SHOWCONTROL, AV & LIVE OPS",
        description: "Integratie, video, live-licht en de zakelijke afronding.",
        order: 4
    }
];

// ===============================================
// MODULES
// ===============================================

const modules = [
    // BLOCK 1
    {
        id: "module-1",
        blockId: "block-1",
        semesterId: "semester-1",
        title: "Module 1: Het Podium & Bekabeling",
        description: "De fundamenten van een veilig en functioneel podium",
        order: 1,
        status: "published"
    },
    {
        id: "module-2",
        blockId: "block-1",
        semesterId: "semester-1",
        title: "Module 2: De Mengtafel Basis",
        description: "Je eerste stappen achter de mixing console",
        order: 2,
        status: "published"
    },
    {
        id: "module-3",
        blockId: "block-1",
        semesterId: "semester-1",
        title: "Module 3: Inputs & Microfoons",
        description: "Van microfoon tot mengpaneel",
        order: 3,
        status: "published"
    },
    // BLOCK 2
    {
        id: "module-4",
        blockId: "block-2",
        semesterId: "semester-1",
        title: "Module 4: Mix Techniek & Processing",
        description: "EQ, compressie en effecten beheersen",
        order: 4,
        status: "published"
    },
    {
        id: "module-5",
        blockId: "block-2",
        semesterId: "semester-1",
        title: "Module 5: Monitoring & Systemen",
        description: "Podium monitoring en master processing",
        order: 5,
        status: "published"
    },
    // BLOCK 3
    {
        id: "module-6",
        blockId: "block-3",
        semesterId: "semester-2",
        title: "Module 6: Licht Hardware & Signaal",
        description: "Stroom, DMX en het bouwen van een lichtset",
        order: 6,
        status: "published"
    },
    {
        id: "module-7",
        blockId: "block-3",
        semesterId: "semester-2",
        title: "Module 7: Lichttafel Logica & Basis Programmeren",
        description: "Van patch tot je eerste licht-cues",
        order: 7,
        status: "published"
    },
    // BLOCK 4
    {
        id: "module-8",
        blockId: "block-4",
        semesterId: "semester-2",
        title: "Module 8: Showcontrol & AV Basics",
        description: "QLab, video en synchronisatie",
        order: 8,
        status: "published"
    },
    {
        id: "module-9",
        blockId: "block-4",
        semesterId: "semester-2",
        title: "Module 9: Business & Onderhoud",
        description: "De zakelijke kant van live techniek",
        order: 9,
        status: "published"
    },
    {
        id: "module-10",
        blockId: "block-4",
        semesterId: "semester-2",
        title: "Module 10: Eindexamen",
        description: "Je meesterproef als FOH Technicus",
        order: 10,
        status: "published"
    }
];

// ===============================================
// WEEKS
// ===============================================

const weeks = [
    // MODULE 1 (Weeks 1-4)
    { id: "week-1", moduleId: "module-1", blockId: "block-1", semesterId: "semester-1", weekNumber: 1, order: 1, title: "Week 1: De Start & Theater Termen" },
    { id: "week-2", moduleId: "module-1", blockId: "block-1", semesterId: "semester-1", weekNumber: 2, order: 2, title: "Week 2: De Vloer & Kabels" },
    { id: "week-3", moduleId: "module-1", blockId: "block-1", semesterId: "semester-1", weekNumber: 3, order: 3, title: "Week 3: Speakers & Stroom" },
    { id: "week-4", moduleId: "module-1", blockId: "block-1", semesterId: "semester-1", weekNumber: 4, order: 4, title: "Week 4: Afronding Module 1" },

    // MODULE 2 (Weeks 5-7)
    { id: "week-5", moduleId: "module-2", blockId: "block-1", semesterId: "semester-1", weekNumber: 5, order: 1, title: "Week 5: Tafel Hardware" },
    { id: "week-6", moduleId: "module-2", blockId: "block-1", semesterId: "semester-1", weekNumber: 6, order: 2, title: "Week 6: Luisteren & Route" },
    { id: "week-7", moduleId: "module-2", blockId: "block-1", semesterId: "semester-1", weekNumber: 7, order: 3, title: "Week 7: Tafel Beheer" },

    // MODULE 3 (Weeks 8-10)
    { id: "week-8", moduleId: "module-3", blockId: "block-1", semesterId: "semester-1", weekNumber: 8, order: 1, title: "Week 8: Gain & Mics" },
    { id: "week-9", moduleId: "module-3", blockId: "block-1", semesterId: "semester-1", weekNumber: 9, order: 2, title: "Week 9: Connectiviteit" },
    { id: "week-10", moduleId: "module-3", blockId: "block-1", semesterId: "semester-1", weekNumber: 10, order: 3, title: "Week 10: Blok 1 Review" },

    // MODULE 4 (Weeks 11-15)
    { id: "week-11", moduleId: "module-4", blockId: "block-2", semesterId: "semester-1", weekNumber: 11, order: 1, title: "Week 11: EQ Fundamentals" },
    { id: "week-12", moduleId: "module-4", blockId: "block-2", semesterId: "semester-1", weekNumber: 12, order: 2, title: "Week 12: EQ Shaping" },
    { id: "week-13", moduleId: "module-4", blockId: "block-2", semesterId: "semester-1", weekNumber: 13, order: 3, title: "Week 13: Dynamiek" },
    { id: "week-14", moduleId: "module-4", blockId: "block-2", semesterId: "semester-1", weekNumber: 14, order: 4, title: "Week 14: Effecten (FX)" },
    { id: "week-15", moduleId: "module-4", blockId: "block-2", semesterId: "semester-1", weekNumber: 15, order: 5, title: "Week 15: Workflow & Remote" },

    // MODULE 5 (Weeks 16-20)
    { id: "week-16", moduleId: "module-5", blockId: "block-2", semesterId: "semester-1", weekNumber: 16, order: 1, title: "Week 16: Podium Veiligheid" },
    { id: "week-17", moduleId: "module-5", blockId: "block-2", semesterId: "semester-1", weekNumber: 17, order: 2, title: "Week 17: In-Ear Monitoring" },
    { id: "week-18", moduleId: "module-5", blockId: "block-2", semesterId: "semester-1", weekNumber: 18, order: 3, title: "Week 18: Master Bus" },
    { id: "week-19", moduleId: "module-5", blockId: "block-2", semesterId: "semester-1", weekNumber: 19, order: 4, title: "Week 19: Systeem Tuning" },
    { id: "week-20", moduleId: "module-5", blockId: "block-2", semesterId: "semester-1", weekNumber: 20, order: 5, title: "Week 20: Voorbereiding & Afronding" },

    // MODULE 6 (Weeks 21-25)
    { id: "week-21", moduleId: "module-6", blockId: "block-3", semesterId: "semester-2", weekNumber: 21, order: 1, title: "Week 21: Stroomvoorziening & Veiligheid" },
    { id: "week-22", moduleId: "module-6", blockId: "block-3", semesterId: "semester-2", weekNumber: 22, order: 2, title: "Week 22: DMX & Data" },
    { id: "week-23", moduleId: "module-6", blockId: "block-3", semesterId: "semester-2", weekNumber: 23, order: 3, title: "Week 23: Rigging & Montage" },
    { id: "week-24", moduleId: "module-6", blockId: "block-3", semesterId: "semester-2", weekNumber: 24, order: 4, title: "Week 24: Soorten Lampen" },
    { id: "week-25", moduleId: "module-6", blockId: "block-3", semesterId: "semester-2", weekNumber: 25, order: 5, title: "Week 25: De Licht-set Bouwen" },

    // MODULE 7 (Weeks 26-30)
    { id: "week-26", moduleId: "module-7", blockId: "block-3", semesterId: "semester-2", weekNumber: 26, order: 1, title: "Week 26: De Patch" },
    { id: "week-27", moduleId: "module-7", blockId: "block-3", semesterId: "semester-2", weekNumber: 27, order: 2, title: "Week 27: Selecteren & De 'Programmer'" },
    { id: "week-28", moduleId: "module-7", blockId: "block-3", semesterId: "semester-2", weekNumber: 28, order: 3, title: "Week 28: Kleuren & Dimmen" },
    { id: "week-29", moduleId: "module-7", blockId: "block-3", semesterId: "semester-2", weekNumber: 29, order: 4, title: "Week 29: Posities & Focus" },
    { id: "week-30", moduleId: "module-7", blockId: "block-3", semesterId: "semester-2", weekNumber: 30, order: 5, title: "Week 30: De Eerste Show (Cues)" },

    // MODULE 8 (Weeks 31-34)
    { id: "week-31", moduleId: "module-8", blockId: "block-4", semesterId: "semester-2", weekNumber: 31, order: 1, title: "Week 31: QLab voor Audio" },
    { id: "week-32", moduleId: "module-8", blockId: "block-4", semesterId: "semester-2", weekNumber: 32, order: 2, title: "Week 32: AV & Projectie" },
    { id: "week-33", moduleId: "module-8", blockId: "block-4", semesterId: "semester-2", weekNumber: 33, order: 3, title: "Week 33: Showcontrol & Sync" },
    { id: "week-34", moduleId: "module-8", blockId: "block-4", semesterId: "semester-2", weekNumber: 34, order: 4, title: "Week 34: Live Licht: Busking & Improvisatie" },

    // MODULE 9 (Weeks 35-37)
    { id: "week-35", moduleId: "module-9", blockId: "block-4", semesterId: "semester-2", weekNumber: 35, order: 1, title: "Week 35: Reparatie & Solderen" },
    { id: "week-36", moduleId: "module-9", blockId: "block-4", semesterId: "semester-2", weekNumber: 36, order: 2, title: "Week 36: Veiligheid & Arbo" },
    { id: "week-37", moduleId: "module-9", blockId: "block-4", semesterId: "semester-2", weekNumber: 37, order: 3, title: "Week 37: De ZZP Business" },

    // MODULE 10 (Weeks 38-40)
    { id: "week-38", moduleId: "module-10", blockId: "block-4", semesterId: "semester-2", weekNumber: 38, order: 1, title: "Week 38: Pre-Productie" },
    { id: "week-39", moduleId: "module-10", blockId: "block-4", semesterId: "semester-2", weekNumber: 39, order: 2, title: "Week 39: De Finale" },
    { id: "week-40", moduleId: "module-10", blockId: "block-4", semesterId: "semester-2", weekNumber: 40, order: 3, title: "Week 40: OPEN" }
];

// ===============================================
// LESSONS (77 total)
// ===============================================

const lessons = [
    // WEEK 1: De Start & Theater Termen
    { weekId: "week-1", number: "B1 L1.1", title: "De 'Load-in' & Connectoren", description: "Wat zit er in de kisten? XLR, Jack, Speakon.", duration: "18 min", order: 1 },
    { weekId: "week-1", number: "B1 L1.2", title: "Theater Basics & Termen", description: "Manteau, fries, poten en de 'Koperen Kees'.", duration: "22 min", order: 2 },

    // WEEK 2: De Vloer & Kabels
    { weekId: "week-2", number: "B1 L1.3", title: "De Balletvloer", description: "Hoe plak je strak een vloer zonder bellen.", duration: "20 min", order: 1 },
    { weekId: "week-2", number: "B1 L1.4", title: "Kabels rollen & Stage-beheer", description: "De Over/Under techniek en een veilig podium.", duration: "24 min", order: 2 },

    // WEEK 3: Speakers & Stroom
    { weekId: "week-3", number: "B1 L1.5", title: "Speakers Prikken", description: "Actief vs. Passief aansluiten en veilig aanzetten.", duration: "26 min", order: 1 },
    { weekId: "week-3", number: "B1 L1.6", title: "Stroom op het podium", description: "Schuko-verdeling en basis veiligheid.", duration: "19 min", order: 2 },

    // WEEK 4: Afronding Module 1
    { weekId: "week-4", number: "B1 L1.7", title: "Praktijk Check", description: "Een podium veilig en netjes inrichten volgens de theater-regels.", duration: "30 min", order: 1 },

    // WEEK 5: Tafel Hardware
    { weekId: "week-5", number: "B1 L2.1", title: "De Mengtafel Achterkant", description: "Inputs, Outputs en Local Racks snappen.", duration: "25 min", order: 1 },
    { weekId: "week-5", number: "B1 L2.2", title: "De Mengtafel Voorkant", description: "Navigatie, faders en schermen bedienen.", duration: "28 min", order: 2 },

    // WEEK 6: Luisteren & Route
    { weekId: "week-6", number: "B1 L2.3", title: "De Reis van het Geluid", description: "Het signaalpad van microfoon tot speaker.", duration: "24 min", order: 1 },
    { weekId: "week-6", number: "B1 L2.4", title: "PFL, Solo & Headphones", description: "Luisteren voordat de zaal het hoort.", duration: "20 min", order: 2 },

    // WEEK 7: Tafel Beheer
    { weekId: "week-7", number: "B1 L2.5", title: "Troubleshooting & Priklijst", description: "Administratie en fouten in de patch opsporen.", duration: "27 min", order: 1 },

    // WEEK 8: Gain & Mics
    { weekId: "week-8", number: "B1 L3.1", title: "Microfoons Basics", description: "Dynamisch vs. Condensator en 48V Fantoomvoeding.", duration: "23 min", order: 1 },
    { weekId: "week-8", number: "B1 L3.2", title: "Gain Staging", description: "De belangrijkste knop voor een zuivere mix zonder ruis.", duration: "26 min", order: 2 },

    // WEEK 9: Connectiviteit
    { weekId: "week-9", number: "B1 L3.3", title: "Instrumenten & DI-boxen", description: "Keyboards, gitaren en laptops aansluiten.", duration: "22 min", order: 1 },
    { weekId: "week-9", number: "B1 L3.4", title: "Draadloos & Talkback", description: "Zenders instellen en praten met de artiest.", duration: "24 min", order: 2 },

    // WEEK 10: Blok 1 Review
    { weekId: "week-10", number: "B1 L3.5", title: "Praktijktoets", description: "Zelfstandig een klein podium prikken en geluid krijgen.", duration: "35 min", order: 1 },

    // WEEK 11: EQ Fundamentals
    { weekId: "week-11", number: "B2 L4.1", title: "EQ: Filters & Correctie", description: "Low-cut HPF en probleemfrequenties weghalen.", duration: "25 min", order: 1 },
    { weekId: "week-11", number: "B2 L4.2", title: "EQ: Frequentie Training", description: "Hoe klinkt 200Hz vs 4kHz? Leren luisteren.", duration: "28 min", order: 2 },

    // WEEK 12: EQ Shaping
    { weekId: "week-12", number: "B2 L4.3", title: "EQ: Kleuren & Vormgeven", description: "Een stem helder maken en een kick vet.", duration: "30 min", order: 1 },

    // WEEK 13: Dynamiek
    { weekId: "week-13", number: "B2 L4.4", title: "Dynamics: De Gate", description: "Ruis en 'bleed' op drums weghalen.", duration: "22 min", order: 1 },
    { weekId: "week-13", number: "B2 L4.5", title: "Dynamics: De Compressor", description: "Vocals en basgitaar strak trekken.", duration: "27 min", order: 2 },

    // WEEK 14: Effecten (FX)
    { weekId: "week-14", number: "B2 L4.6", title: "Effecten: Reverb (Galm)", description: "Ruimte maken in je mix.", duration: "24 min", order: 1 },
    { weekId: "week-14", number: "B2 L4.7", title: "Effecten: Delay (Echo)", description: "Tap-tempo en creatief gebruik.", duration: "21 min", order: 2 },

    // WEEK 15: Workflow & Remote
    { weekId: "week-15", number: "B2 L4.8", title: "De Mix Opbouwen", description: "Stap voor stap: Kick -> Bass -> Chords -> Vocals.", duration: "32 min", order: 1 },
    { weekId: "week-15", number: "B2 L4.9", title: "iPad Mixing", description: "De zaal in lopen en op afstand werken.", duration: "19 min", order: 2 },

    // WEEK 16: Podium Veiligheid
    { weekId: "week-16", number: "B2 L5.1", title: "Feedback Bestrijden", description: "Uitfluiten voorkomen met EQ.", duration: "25 min", order: 1 },
    { weekId: "week-16", number: "B2 L5.3", title: "De 'Line-Check' vs Soundcheck", description: "Het verschil tussen \"Doet ie het?\" en \"Klinkt ie goed?\".", duration: "23 min", order: 2 },

    // WEEK 17: In-Ear Monitoring
    { weekId: "week-17", number: "B2 L5.2", title: "In-Ear Monitoring (IEM)", description: "Stereo mixen voor oortjes.", duration: "28 min", order: 1 },

    // WEEK 18: Master Bus
    { weekId: "week-18", number: "B2 L5.4", title: "Master Processing", description: "EQ en Compressie over de hele zaal Main LR.", duration: "26 min", order: 1 },

    // WEEK 19: Systeem Tuning
    { weekId: "week-19", number: "B2 L5.5", title: "Systeem Check", description: "Fase en Tijd. Staan de speakers goed?", duration: "30 min", order: 1 },

    // WEEK 20: Voorbereiding & Afronding
    { weekId: "week-20", number: "B2 L5.6", title: "Show Voorbereiding", description: "Riders lezen en Offline Editors gebruiken.", duration: "27 min", order: 1 },

    // WEEK 21: Stroomvoorziening & Veiligheid
    { weekId: "week-21", number: "B3 L6.1", title: "Krachtstroom Basics", description: "Het verschil tussen Schuko en CEE 16A/32A.", duration: "22 min", order: 1 },
    { weekId: "week-21", number: "B3 L6.2", title: "Faseverdeling", description: "Hoe voorkom je dat de zekering eruit klapt?", duration: "24 min", order: 2 },
    { weekId: "week-21", number: "B3 L6.3", title: "Meten is Weten", description: "Werken met de multimeter, checken of stroom veilig is.", duration: "20 min", order: 3 },

    // WEEK 22: DMX & Data
    { weekId: "week-22", number: "B3 L6.4", title: "Het DMX-512 Protocol", description: "Hoe praten lampen met de tafel? Het postbode-principe.", duration: "25 min", order: 1 },
    { weekId: "week-22", number: "B3 L6.5", title: "Adressering", description: "Het instellen van DMX-startsels op de lampen zelf.", duration: "21 min", order: 2 },
    { weekId: "week-22", number: "B3 L6.6", title: "Kabels & Terminators", description: "Waarom een weerstandje aan het eind cruciaal is.", duration: "18 min", order: 3 },

    // WEEK 23: Rigging & Montage
    { weekId: "week-23", number: "B3 L6.7", title: "Haken, Klemmen & Safeties", description: "Hoe hang je een lamp veilig op? De 'Second Chance' regel.", duration: "28 min", order: 1 },
    { weekId: "week-23", number: "B3 L6.8", title: "Lichtplan Lezen", description: "Een technische tekening begrijpen: wat hangt waar?", duration: "24 min", order: 2 },
    { weekId: "week-23", number: "B3 L6.9", title: "Werken op Hoogte", description: "Introductie in veiligheid op trappen en hoogwerkers.", duration: "22 min", order: 3 },

    // WEEK 24: Soorten Lampen
    { weekId: "week-24", number: "B3 L6.10", title: "Conventioneel vs. LED", description: "Het verschil tussen 'domme' en 'slimme' lampen.", duration: "20 min", order: 1 },
    { weekId: "week-24", number: "B3 L6.11", title: "Movingheads & Scanners", description: "Pan, Tilt en de basis van bewegend licht.", duration: "26 min", order: 2 },
    { weekId: "week-24", number: "B3 L6.12", title: "De 'Gouden Regel'", description: "Waarom LED nooit op een dimmer-pack mag.", duration: "17 min", order: 3 },

    // WEEK 25: De Licht-set Bouwen
    { weekId: "week-25", number: "B3 L6.13", title: "De 'Load-in' Licht", description: "Een complete set opbouwen vanaf de vrachtwagen.", duration: "35 min", order: 1 },
    { weekId: "week-25", number: "B3 L6.14", title: "Foutopsporing", description: "Wat doe je als een lamp niet reageert of knippert?", duration: "23 min", order: 2 },

    // WEEK 26: De Patch
    { weekId: "week-26", number: "B3 L7.1", title: "De Lichttafel Achterkant", description: "Schermen aansluiten, DMX-output en netwerk.", duration: "24 min", order: 1 },
    { weekId: "week-26", number: "B3 L7.2", title: "Fixture Libraries", description: "De tafel vertellen welke lampen er in de zaal hangen.", duration: "21 min", order: 2 },
    { weekId: "week-26", number: "B3 L7.3", title: "De Digitale Patch", description: "DMX-adressen koppelen aan de software.", duration: "25 min", order: 3 },

    // WEEK 27: Selecteren & De 'Programmer'
    { weekId: "week-27", number: "B3 L7.4", title: "Groepen Maken", description: "Lampen slim indelen bijv. \"Alle Frontjes\".", duration: "22 min", order: 1 },
    { weekId: "week-27", number: "B3 L7.5", title: "De Programmer Logica", description: "Select -> Adjust -> Clear. De basis van élke tafel.", duration: "26 min", order: 2 },

    // WEEK 28: Kleuren & Dimmen
    { weekId: "week-28", number: "B3 L7.6", title: "Intensiteit & Dimmer Curves", description: "Hoe maak je een mooie 'fade'?", duration: "20 min", order: 1 },
    { weekId: "week-28", number: "B3 L7.7", title: "Kleuren Mengen", description: "Werken met RGB, CMY en kleurenwielen.", duration: "24 min", order: 2 },
    { weekId: "week-28", number: "B3 L7.8", title: "Kleur-Palettes", description: "Je favoriete kleuren opslaan als bouwstenen.", duration: "19 min", order: 3 },

    // WEEK 29: Posities & Focus
    { weekId: "week-29", number: "B3 L7.9", title: "Pan & Tilt Bediening", description: "Movingheads naar de juiste plek sturen.", duration: "23 min", order: 1 },
    { weekId: "week-29", number: "B3 L7.10", title: "Positie-Palettes", description: "Standen van de lampen opslaan bijv. \"Zanger\".", duration: "21 min", order: 2 },
    { weekId: "week-29", number: "B3 L7.11", title: "Beam & Gobo's", description: "Patronen en scherpte instellen.", duration: "22 min", order: 3 },

    // WEEK 30: De Eerste Show (Cues)
    { weekId: "week-30", number: "B3 L7.12", title: "De 'Cue' Opslaan", description: "Je eerste licht-beeld vastleggen.", duration: "25 min", order: 1 },
    { weekId: "week-30", number: "B3 L7.13", title: "Playbacks & Faders", description: "Je cues onder een knop of schuif zetten.", duration: "23 min", order: 2 },
    { weekId: "week-30", number: "B3 L7.14", title: "Een Simpele Cuelist", description: "Een serie beelden achter elkaar zetten voor een liedje.", duration: "27 min", order: 3 },

    // WEEK 31: QLab voor Audio
    { weekId: "week-31", number: "B4 L8.1", title: "QLab Basics", description: "Audio cues, fades en jingles instarten.", duration: "26 min", order: 1 },
    { weekId: "week-31", number: "B4 L8.2", title: "Tracks & Click", description: "Meelopende muziek en een clicktrack voor de drummer.", duration: "24 min", order: 2 },

    // WEEK 32: AV & Projectie
    { weekId: "week-32", number: "B4 L8.3", title: "Video Basics", description: "HDMI vs. SDI, resoluties en aspect ratio's.", duration: "22 min", order: 1 },
    { weekId: "week-32", number: "B4 L8.4", title: "Beamers & Schermen", description: "Projectoren afstellen en schermen aansturen via QLab.", duration: "28 min", order: 2 },

    // WEEK 33: Showcontrol & Sync
    { weekId: "week-33", number: "B4 L8.5", title: "MIDI & Timecode", description: "Hoe laat je QLab 'praten' met je lichttafel?", duration: "27 min", order: 1 },
    { weekId: "week-33", number: "B4 L8.6", title: "De 'Panic' Button", description: "Wat doe je als de techniek hapert tijdens de show?", duration: "19 min", order: 2 },

    // WEEK 34: Live Licht: Busking & Improvisatie
    { weekId: "week-34", number: "B4 L8.7", title: "De Busking Layout", description: "Je lichttafel indelen voor live bediening.", duration: "25 min", order: 1 },
    { weekId: "week-34", number: "B4 L8.8", title: "Live Timing & Flash", description: "Mee-drukken op de maat.", duration: "23 min", order: 2 },

    // WEEK 35: Reparatie & Solderen
    { weekId: "week-35", number: "B4 L9.1", title: "De Soldeerbout", description: "Zelf connectoren en kabels repareren.", duration: "30 min", order: 1 },
    { weekId: "week-35", number: "B4 L9.2", title: "Apparatuur Service", description: "Movingheads en lenzen schoonmaken.", duration: "24 min", order: 2 },

    // WEEK 36: Veiligheid & Arbo
    { weekId: "week-36", number: "B4 L9.3", title: "Veilig Werken op Hoogte", description: "Gebruik van trappen en valbeveiliging.", duration: "26 min", order: 1 },
    { weekId: "week-36", number: "B4 L9.4", title: "Gehoorbescherming", description: "Decibel-limieten en wetgeving.", duration: "20 min", order: 2 },

    // WEEK 37: De ZZP Business
    { weekId: "week-37", number: "B4 L9.5", title: "Riders & Offertes", description: "Hoe lees je een tech-rider en wat reken je per dag?", duration: "28 min", order: 1 },
    { weekId: "week-37", number: "B4 L9.6", title: "De ZZP-er", description: "Facturatie, verzekeringen en houding op de werkvloer.", duration: "25 min", order: 2 },

    // WEEK 38: Pre-Productie
    { weekId: "week-38", number: "B4 L10.1", title: "Het Examenplan", description: "Je eigen show voorbereiden: Priklijst, Lichtplan, QLab file.", duration: "35 min", order: 1 },

    // WEEK 39: De Finale
    { weekId: "week-39", number: "B4 L10.2", title: "De Meesterproef", description: "Volledige opbouw, live show draaien en veilig afbreken.", duration: "45 min", order: 1 },

    // WEEK 40: OPEN
    { weekId: "week-40", number: "B4 L10.3", title: "Portfolio & Afsluiting", description: "Ruimte voor uitloop en portfolio opbouw.", duration: "30 min", order: 1 }
];

// Add parent references to lessons
lessons.forEach(lesson => {
    const week = weeks.find(w => w.id === lesson.weekId);
    if (week) {
        lesson.moduleId = week.moduleId;
        lesson.blockId = week.blockId;
        lesson.semesterId = week.semesterId;
    }
    // Add placeholder Vimeo ID and resources
    lesson.vimeoId = "76979871"; // Placeholder
    lesson.resources = [];
    lesson.handoutMarkdown = `# ${lesson.title}\n\n${lesson.description}\n\n## Handout\n\nDit is een placeholder handout. Echte content wordt later toegevoegd.`;
});

// ===============================================
// SEEDING FUNCTION
// ===============================================

async function seed() {
    console.log('\n🌱 Starting FOH Academy - New Curriculum Seeding...\n');
    console.log('📊 Summary:');
    console.log(`   - Semesters: ${semesters.length}`);
    console.log(`   - Blocks: ${blocks.length}`);
    console.log(`   - Modules: ${modules.length}`);
    console.log(`   - Weeks: ${weeks.length}`);
    console.log(`   - Lessons: ${lessons.length}\n`);

    const batch = db.batch();

    // Seed Semesters
    console.log('📚 Seeding semesters...');
    for (const semester of semesters) {
        const ref = db.collection('semesters').doc(semester.id);
        batch.set(ref, semester);
    }
    console.log(`   ✅ ${semesters.length} semesters queued\n`);

    // Seed Blocks
    console.log('📦 Seeding blocks...');
    for (const block of blocks) {
        const ref = db.collection('blocks').doc(block.id);
        batch.set(ref, block);
    }
    console.log(`   ✅ ${blocks.length} blocks queued\n`);

    // Seed Modules
    console.log('📘 Seeding modules...');
    for (const module of modules) {
        const ref = db.collection('modules').doc(module.id);
        batch.set(ref, {
            ...module,
            createdAt: admin.firestore.Timestamp.now()
        });
    }
    console.log(`   ✅ ${modules.length} modules queued\n`);

    // Seed Weeks
    console.log('📅 Seeding weeks...');
    for (const week of weeks) {
        const ref = db.collection('weeks').doc(week.id);
        batch.set(ref, week);
    }
    console.log(`   ✅ ${weeks.length} weeks queued\n`);

    // Seed Lessons
    console.log('📖 Seeding lessons...');
    for (const lesson of lessons) {
        const id = lesson.number.toLowerCase().replace(/\s+/g, '-');
        const ref = db.collection('lessons').doc(id);
        batch.set(ref, {
            ...lesson,
            id
        });
    }
    console.log(`   ✅ ${lessons.length} lessons queued\n`);

    // Commit batch
    console.log('💾 Committing to Firestore...');
    await batch.commit();

    console.log('\n✅ FOH Academy curriculum seeded successfully!\n');
    console.log('🎓 Platform ready with:');
    console.log(`   - 2 Semesters (Geluidstechniek & Lichttechniek)`);
    console.log(`   - 4 Blocks (Stage Fundamentals → Business)`);
    console.log(`   - 10 Modules (Complete professional curriculum)`);
    console.log(`   - 40 Weeks (Full academic year)`);
    console.log(`   - 77 Lessons (Comprehensive training)`);
    console.log('\n🚀 Students can now navigate the full 5-level hierarchy!\n');

    process.exit(0);
}

seed().catch(error => {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
});
