import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload a homework PDF to Firebase Storage
 * @param file The PDF file to upload
 * @param userId The user's UID
 * @param weekId The week ID this submission belongs to
 * @returns The download URL of the uploaded file
 */
export async function uploadHomework(
    file: File,
    userId: string,
    weekId: string
): Promise<string> {
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `submissions/${userId}/${weekId}/${timestamp}_${sanitizedFileName}`;

    const storageRef = ref(storage, path);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
    });

    // Get the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
}

/**
 * Upload a resource file (PDF, etc.) for a lesson
 * @param file The file to upload
 * @param lessonId The lesson ID
 * @returns The download URL
 */
export async function uploadLessonResource(
    file: File,
    lessonId: string
): Promise<string> {
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `resources/${lessonId}/${timestamp}_${sanitizedFileName}`;

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
    });

    return await getDownloadURL(snapshot.ref);
}
