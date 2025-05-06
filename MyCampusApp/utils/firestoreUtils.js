import { collection, addDoc, doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Saves a post to Firestore.
 * @param {string} imageurl - The download URL of the uploaded image.
 * @param {string} userId - The ID of the user who created the post.
 * @param {string} profilePicture - The profile picture URL of the user.
 * @param {string} caption - The caption for the post (optional).
 * @returns {Promise<void>}
 */
export const savePost = async (imageurl, userId, profilePicture, caption = "") => {
  try {
    await addDoc(collection(db, "posts"), {
      imageurl,
      Likes: 0,
      comments: [],
      timestamp: new Date(),
      user: userId,
      profile_picture: profilePicture,
      caption,
    });
  } catch (error) {
    console.error("Error saving post to Firestore:", error);
    throw error; // Re-throw the error for handling in the calling component
  }
};

/**
 * Adds a like to a post.
 * @param {string} postId - The ID of the post to like.
 * @returns {Promise<void>}
 */
export const likePost = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      Likes: increment(1),
    });
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

/**
 * Adds a comment to a post.
 * @param {string} postId - The ID of the post to comment on.
 * @param {string} userId - The ID of the user who commented.
 * @param {string} username - The username of the user who commented.
 * @param {string} comment - The comment text.
 * @returns {Promise<void>}
 */
export const addComment = async (postId, userId, username, comment) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        userId,
        username,
        comment,
        timestamp: new Date(),
      }),
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

/**
 * Fetches all posts from Firestore.
 * @returns {Promise<Array>} - An array of posts.
 */
export const fetchPosts = async () => {
  try {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const fetchedPosts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return fetchedPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};