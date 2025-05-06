import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param {string} uri - The local URI of the file to upload.
 * @param {string} folder - The folder in Firebase Storage where the file will be stored (e.g., "media").
 * @returns {Promise<string>} - The download URL of the uploaded file.
 */
export const uploadMedia = async (uri, folder = "media") => {
  try {
    // Fetch the file as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `${folder}/${Date.now()}`);

    // Upload the file
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading media:", error);
    throw error; // Re-throw the error for handling in the calling component
  }
};