import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// =============================================================================
// TYPES
// =============================================================================

export interface Semester {
    id: string;
    title: string;
    order: number; // 1 or 2
    description?: string;
}

export interface Block {
    id: string;
    semesterId: string;
    title: string;
    description: string;
    order: number; // 1-4
}

export interface Module {
    id: string;
    blockId: string; // Parent block
    semesterId: string; // For easy querying
    title: string;
    description: string;
    order: number; // Global order 1-10
    status: "published" | "draft";
    createdAt: Date;
}

export interface Week {
    id: string;
    moduleId: string; // Parent module
    blockId: string; // For easy querying
    semesterId: string; // For easy querying
    title: string;
    weekNumber: number; // 1-40 global
    order: number; // 1-N within module
}

export interface Lesson {
    id: string;
    weekId: string; // Parent week
    moduleId: string; // Keep for backward compatibility
    blockId: string; // For easy querying
    semesterId: string; // For easy querying
    title: string;
    number: string; // e.g. "B1 L1.1", "B2 L4.3"
    description: string; // Detailed description
    vimeoId: string;
    handoutPdfUrl?: string; // URL to viewable PDF cheatsheet
    handoutMarkdown?: string; // Legacy support
    resources: { name: string; url: string }[];
    order: number; // Within week
    duration: string;
}

export interface LiveSlot {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    capacity: number;
    bookedUserIds: string[];
    prerequisiteModuleIds: string[]; // Modules that must be complete
}

export interface UserProgress {
    lessonId: string;
    completedAt: Date;
}

export interface UserData {
    email: string;
    role: "student" | "admin";
    progress: Record<string, boolean>;
    bookedSlots?: string[]; // IDs of booked LiveSlots
}

// =============================================================================
// SEMESTERS
// =============================================================================


export async function getSemesters(): Promise<Semester[]> {
    const q = query(collection(db, "semesters"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Semester[];
}

export async function getSemester(id: string): Promise<Semester | null> {
    const docRef = doc(db, "semesters", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
        id: snapshot.id,
        ...snapshot.data(),
    } as Semester;
}

export async function createSemester(data: Omit<Semester, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "semesters"), data);
    return docRef.id;
}

export async function updateSemester(id: string, data: Partial<Semester>): Promise<void> {
    const docRef = doc(db, "semesters", id);
    await updateDoc(docRef, data);
}

export async function deleteSemester(id: string): Promise<void> {
    const docRef = doc(db, "semesters", id);
    await deleteDoc(docRef);
}

// =============================================================================
// BLOCKS
// =============================================================================

export async function getBlocks(): Promise<Block[]> {
    const q = query(collection(db, "blocks"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Block[];
}

export async function getBlocksForSemester(semesterId: string): Promise<Block[]> {
    const q = query(
        collection(db, "blocks"),
        where("semesterId", "==", semesterId)
    );
    const snapshot = await getDocs(q);
    const blocks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Block[];

    // Sort in memory to avoid index requirements
    return blocks.sort((a, b) => a.order - b.order);
}

export async function getBlock(id: string): Promise<Block | null> {
    const docRef = doc(db, "blocks", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
        id: snapshot.id,
        ...snapshot.data(),
    } as Block;
}

export async function createBlock(data: Omit<Block, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "blocks"), data);
    return docRef.id;
}

export async function updateBlock(id: string, data: Partial<Block>): Promise<void> {
    const docRef = doc(db, "blocks", id);
    await updateDoc(docRef, data);
}

export async function deleteBlock(id: string): Promise<void> {
    const docRef = doc(db, "blocks", id);
    await deleteDoc(docRef);
}

// =============================================================================
// WEEKS
// =============================================================================

export async function getWeeks(): Promise<Week[]> {
    const q = query(collection(db, "weeks"), orderBy("weekNumber", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Week[];
}

export async function getWeeksForModule(moduleId: string): Promise<Week[]> {
    const q = query(
        collection(db, "weeks"),
        where("moduleId", "==", moduleId)
    );
    const snapshot = await getDocs(q);
    const weeks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Week[];

    // Sort in memory to avoid index requirements
    return weeks.sort((a, b) => a.order - b.order);
}

export async function getWeek(id: string): Promise<Week | null> {
    const docRef = doc(db, "weeks", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
        id: snapshot.id,
        ...snapshot.data(),
    } as Week;
}

export async function createWeek(data: Omit<Week, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "weeks"), data);
    return docRef.id;
}

export async function updateWeek(id: string, data: Partial<Week>): Promise<void> {
    const docRef = doc(db, "weeks", id);
    await updateDoc(docRef, data);
}

export async function deleteWeek(id: string): Promise<void> {
    const docRef = doc(db, "weeks", id);
    await deleteDoc(docRef);
}

// =============================================================================
// MODULES (formerly Weeks)
// =============================================================================

export async function getModules(): Promise<Module[]> {
    const q = query(collection(db, "modules"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    })) as Module[];
}

export async function getModule(id: string): Promise<Module | null> {
    const docRef = doc(db, "modules", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate?.() || new Date(),
    } as Module;
}

export async function createModule(
    data: Omit<Module, "id" | "createdAt">
): Promise<string> {
    const docRef = await addDoc(collection(db, "modules"), {
        ...data,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function updateModule(
    id: string,
    data: Partial<Omit<Module, "id" | "createdAt">>
): Promise<void> {
    const docRef = doc(db, "modules", id);
    await updateDoc(docRef, data);
}

export async function deleteModule(id: string): Promise<void> {
    const docRef = doc(db, "modules", id);
    await deleteDoc(docRef);
}

// =============================================================================
// LIVE SLOTS
// =============================================================================

export async function getLiveSlots(): Promise<LiveSlot[]> {
    const q = query(collection(db, "liveSlots"), orderBy("startTime", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate?.() || new Date(),
        endTime: doc.data().endTime?.toDate?.() || new Date(),
    })) as LiveSlot[];
}

export async function createLiveSlot(
    data: Omit<LiveSlot, "id">
): Promise<string> {
    const docRef = await addDoc(collection(db, "liveSlots"), data);
    return docRef.id;
}

export async function bookLiveSlot(
    userId: string,
    slotId: string
): Promise<void> {
    const slotRef = doc(db, "liveSlots", slotId);
    const userRef = doc(db, "users", userId);

    // We ideally use a transaction here for safety, but for MVP simple updates:
    const slotSnap = await getDoc(slotRef);
    if (!slotSnap.exists()) throw new Error("Slot not found");

    const slotData = slotSnap.data() as LiveSlot;
    if (slotData.bookedUserIds.includes(userId)) return; // Already booked
    if (slotData.bookedUserIds.length >= slotData.capacity) throw new Error("Full");

    await updateDoc(slotRef, {
        bookedUserIds: [...slotData.bookedUserIds, userId]
    });

    // Update user record too
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() as UserData;
    await updateDoc(userRef, {
        bookedSlots: [...(userData.bookedSlots || []), slotId]
    });
}


// =============================================================================
// LESSONS
// =============================================================================

export async function getLessonsForModule(moduleId: string): Promise<Lesson[]> {
    const q = query(
        collection(db, "lessons"),
        where("moduleId", "==", moduleId)
    );
    const snapshot = await getDocs(q);
    const lessons = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Lesson[];

    // Sort in memory to avoid index requirements
    return lessons.sort((a, b) => a.order - b.order);
}

export async function getLessonsForWeek(weekId: string): Promise<Lesson[]> {
    const q = query(
        collection(db, "lessons"),
        where("weekId", "==", weekId)
    );
    const snapshot = await getDocs(q);
    const lessons = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Lesson[];

    // Sort in memory to avoid index requirements
    return lessons.sort((a, b) => a.order - b.order);
}

export async function getLesson(id: string): Promise<Lesson | null> {
    const docRef = doc(db, "lessons", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
        id: snapshot.id,
        ...snapshot.data(),
    } as Lesson;
}

export async function createLesson(
    data: Omit<Lesson, "id">
): Promise<string> {
    const docRef = await addDoc(collection(db, "lessons"), data);
    return docRef.id;
}

export async function updateLesson(
    id: string,
    data: Partial<Omit<Lesson, "id">>
): Promise<void> {
    const docRef = doc(db, "lessons", id);
    await updateDoc(docRef, data);
}

export async function deleteLesson(id: string): Promise<void> {
    const docRef = doc(db, "lessons", id);
    await deleteDoc(docRef);
}

// =============================================================================
// USER PROGRESS
// =============================================================================

export async function getUserData(uid: string): Promise<UserData | null> {
    const docRef = doc(db, "users", uid);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as UserData;
}

export async function createOrUpdateUser(
    uid: string,
    data: Partial<UserData>
): Promise<void> {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, data, { merge: true });
}

export async function markLessonComplete(
    uid: string,
    lessonId: string
): Promise<void> {
    const docRef = doc(db, "users", uid);
    // Use setDoc with merge to create the document if it doesn't exist
    await setDoc(docRef, {
        progress: {
            [lessonId]: true
        }
    }, { merge: true });
}

export async function markLessonIncomplete(
    uid: string,
    lessonId: string
): Promise<void> {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, {
        progress: {
            [lessonId]: false
        }
    }, { merge: true });
}

export async function isLessonComplete(
    uid: string,
    lessonId: string
): Promise<boolean> {
    const userData = await getUserData(uid);
    return userData?.progress?.[lessonId] === true;
}

// =============================================================================
// ADMIN HELPERS
// =============================================================================

export async function isUserAdmin(uid: string): Promise<boolean> {
    const userData = await getUserData(uid);
    return userData?.role === "admin";
}

// =============================================================================
// SUBMISSIONS (Homework)
// =============================================================================

export interface Submission {
    id: string;
    moduleId: string;
    userId: string;
    userEmail: string;
    fileName: string;
    fileUrl: string;
    submittedAt: Date;
    status: "pending" | "reviewed" | "approved";
    grade?: "pass" | "fail";
    feedback?: string;
}

export async function createSubmission(
    data: Omit<Submission, "id" | "submittedAt">
): Promise<string> {
    const docRef = await addDoc(collection(db, "submissions"), {
        ...data,
        submittedAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function getSubmissionsForModule(moduleId: string): Promise<Submission[]> {
    const q = query(
        collection(db, "submissions"),
        where("moduleId", "==", moduleId)
    );
    const snapshot = await getDocs(q);
    const submissions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
    })) as Submission[];

    // Sort in memory
    return submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
}

export async function getSubmissionsForUser(userId: string): Promise<Submission[]> {
    const q = query(
        collection(db, "submissions"),
        where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const submissions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
    })) as Submission[];

    // Sort in memory
    return submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
}

export async function getAllSubmissions(): Promise<Submission[]> {
    const q = query(
        collection(db, "submissions"),
        orderBy("submittedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
    })) as Submission[];
}

export async function updateSubmissionStatus(
    id: string,
    status: Submission["status"]
): Promise<void> {
    const docRef = doc(db, "submissions", id);
    await updateDoc(docRef, { status });
}

export async function gradeSubmission(
    id: string,
    grade: "pass" | "fail",
    feedback: string
): Promise<void> {
    const docRef = doc(db, "submissions", id);
    await updateDoc(docRef, {
        grade,
        feedback,
        status: "reviewed" as const
    });
}
