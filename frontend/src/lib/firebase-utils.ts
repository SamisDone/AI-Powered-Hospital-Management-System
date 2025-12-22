// Firebase utility functions for backend operations
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  type WhereFilterOp,
  type OrderByDirection,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  deleteUser,
  type User
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from './firebase';

// Types
export interface FirebaseResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  id?: string;
}

export interface FilterConfig {
  field: string;
  operator: WhereFilterOp;
  value: unknown;
}

export interface OrderConfig {
  field: string;
  direction?: OrderByDirection;
}

// ==================== Authentication ====================

export const signIn = async (email: string, password: string): Promise<FirebaseResult<User>> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, data: userCredential.user };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const signUp = async (email: string, password: string): Promise<FirebaseResult<User>> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, data: userCredential.user };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const logout = async (): Promise<FirebaseResult> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updateUserPassword = async (password: string): Promise<FirebaseResult> => {
  try {
    if (!auth.currentUser) throw new Error("No user logged in");
    await updatePassword(auth.currentUser, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const deleteUserAuth = async (): Promise<FirebaseResult> => {
  try {
    if (!auth.currentUser) throw new Error("No user logged in");
    await deleteUser(auth.currentUser);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

// ==================== Firestore Operations ====================

export const getDocument = async <T = DocumentData>(
  collectionName: string, 
  docId: string
): Promise<FirebaseResult<T>> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } as T };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const getCollection = async <T = DocumentData>(
  collectionName: string, 
  filters: FilterConfig[] = [], 
  orderByField?: OrderConfig, 
  limitCount?: number
): Promise<FirebaseResult<T[]>> => {
  try {
    const collectionRef = collection(db, collectionName);
    const constraints = [];
    
    filters.forEach(filter => {
      constraints.push(where(filter.field, filter.operator, filter.value));
    });
    
    if (orderByField) {
      constraints.push(orderBy(orderByField.field, orderByField.direction || 'asc'));
    }
    
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    const q = constraints.length > 0 
      ? query(collectionRef, ...constraints)
      : query(collectionRef);
    
    const querySnapshot = await getDocs(q);
    const documents: T[] = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() } as T);
    });
    
    return { success: true, data: documents };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const addDocument = async (
  collectionName: string, 
  data: DocumentData
): Promise<FirebaseResult> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const setDocument = async (
  collectionName: string, 
  docId: string, 
  data: DocumentData
): Promise<FirebaseResult> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true, id: docId };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const updateDocument = async (
  collectionName: string, 
  docId: string, 
  data: DocumentData
): Promise<FirebaseResult> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const deleteDocument = async (
  collectionName: string, 
  docId: string
): Promise<FirebaseResult> => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const listenToCollection = <T = DocumentData>(
  collectionName: string,
  filters: FilterConfig[] = [],
  callback: (data: T[]) => void,
  orderByField?: OrderConfig,
  limitCount?: number
) => {
  const collectionRef = collection(db, collectionName);
  const constraints: any[] = [];
  
  filters.forEach(filter => {
    constraints.push(where(filter.field, filter.operator, filter.value));
  });
  
  if (orderByField) {
    constraints.push(orderBy(orderByField.field, orderByField.direction || 'asc'));
  }
  
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  
  const q = constraints.length > 0 
    ? query(collectionRef, ...constraints)
    : query(collectionRef);
  
  return onSnapshot(q, (querySnapshot) => {
    const documents: T[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() } as T);
    });
    callback(documents);
  }, (error) => {
    console.error(`Error listening to ${collectionName}:`, error);
  });
};

// ==================== Storage Operations ====================

export const uploadFile = async (
  file: File, 
  path: string, 
  metadata?: object
): Promise<FirebaseResult<{ url: string; path: string }>> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, data: { url: downloadURL, path: snapshot.ref.fullPath } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const getFileURL = async (path: string): Promise<FirebaseResult<string>> => {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return { success: true, data: url };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const deleteFile = async (path: string): Promise<FirebaseResult> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

// Real-time document listener
export const listenToDocument = <T>(
  collectionName: string,
  docId: string,
  onUpdate: (data: T | null) => void
) => {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate({ id: docSnap.id, ...docSnap.data() } as T);
    } else {
      onUpdate(null);
    }
  });
};
