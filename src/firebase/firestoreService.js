import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, getDocs, query, onSnapshot  } from 'firebase/firestore';
import { db } from './config';

/**
 * Adds a new document to a specified collection.
 * @param {string} collectionName - The name of the collection.
 * @param {object} data - The data to be added.
 * @returns {Promise<string>} - The ID of the newly created document.
 */
export async function addDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Retrieves a single document by its ID from a specified collection.
 * @param {string} collectionName - The name of the collection.
 * @param {string} docId - The ID of the document to retrieve.
 * @returns {Promise<object|null>} - The document data, or null if not found.
 */
export async function getDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log(`No such document: ${docRef.path}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Retrieves all documents in a collection that match a specific query.
 * @param {string} collectionName - The name of the collection.
 * @param {import('firebase/firestore').QueryConstraint} queryConstraint - The query constraint (e.g., where('field', '==', 'value')).
 * @returns {Promise<Array<object>>} - An array of document data.
 */
export async function getDocuments(collectionName, queryConstraint) {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, queryConstraint);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Updates an existing document in a specified collection.
 * @param {string} collectionName - The name of the collection.
 * @param {string} docId - The ID of the document to update.
 * @param {object} data - The data to update.
 * @returns {Promise<void>}
 */
export async function updateDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Deletes a document from a specified collection.
 * @param {string} collectionName - The name of the collection.
 * @param {string} docId - The ID of the document to delete.
 * @returns {Promise<void>}
 */
export async function deleteDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
}


export const listenToDocument = (collectionName, documentId, callback, errorCallback) => {
  const docRef = doc(db, collectionName, documentId)

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data())
      } else {
        callback(null)
      }
    },
    (error) => {
      console.error('Error listening to document:', error)

      if (errorCallback) {
        errorCallback(error)
      }
    }
  )

  return unsubscribe
}
