import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, serverTimestamp, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { DedicationData } from "./dedicationStore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvdB4VUE7UHfN4xoyz6trRQKyAgdRKC1I",
  authDomain: "anony-fc294.firebaseapp.com",
  projectId: "anony-fc294",
  storageBucket: "anony-fc294.firebasestorage.app",
  messagingSenderId: "280220039436",
  appId: "1:280220039436:web:6e24e3ac33d03b7324f129",
  measurementId: "G-Q3B821DVJS"
};

// Lazy initialization
let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

const getApp = (): FirebaseApp => {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
};

const getDb = (): Firestore => {
  if (!dbInstance) {
    dbInstance = getFirestore(getApp());
  }
  return dbInstance;
};

const getAuthInstance = (): Auth => {
  if (!authInstance) {
    authInstance = getAuth(getApp());
  }
  return authInstance;
};

// Export db for direct access
export const db = getDb();

// Export auth with lazy initialization
export const auth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    return getAuthInstance()[prop as keyof Auth];
  }
});

// Generate a short, unique ID
const generateId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper function to recursively remove undefined values (Firebase doesn't accept undefined)
const removeUndefined = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Only include the key if the value is not undefined
      if (value !== undefined) {
        const cleanedValue = removeUndefined(value);
        // Also check if the cleaned value is not an empty object
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned;
  }
  return obj;
};

// Save a dedication to Firestore
export const saveDedication = async (data: DedicationData): Promise<string> => {
  console.log('saveDedication called with:', data);
  console.log('deliveryMethod:', data.deliveryMethod);
  console.log('songData before cleaning:', data.songData);
  
  // Always store in localStorage as backup (keyed by a hash)
  const dataStr = JSON.stringify(data);
  
  try {
    const firestore = getDb();
    console.log('Firestore instance obtained');
    
    const dedicationsCollection = collection(firestore, "dedications");
    const id = generateId();
    const docRef = doc(dedicationsCollection, id);
    
    // Clean the data - recursively remove undefined values (Firebase doesn't accept undefined)
    const cleanData = removeUndefined(data);
    
    console.log('Data after cleaning:', cleanData);
    console.log('songData after cleaning:', cleanData.songData);
    
    const docData = {
      ...cleanData,
      createdAt: serverTimestamp(),
      views: 0,
      viewCount: 0,
      status: 'pending', // For delivery tracking
      deliveredAt: null,
      viewedAt: null,
    };
    
    console.log('Attempting to save document with ID:', id);
    console.log('Final document data:', docData);
    
    await setDoc(docRef, docData);
    
    console.log('Document saved successfully with ID:', id);
    
    // Also save to localStorage as backup (without photo to avoid quota issues)
    try {
      const dataWithoutPhoto = { ...data, photoUrl: null };
      localStorage.setItem(`dedication_${id}`, JSON.stringify(dataWithoutPhoto));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
    
    return id;
  } catch (error: any) {
    console.error("Error saving dedication:", error);
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);
    
    // Return a base64 encoded ID (this will be decoded by ViewPage)
    const fallbackId = btoa(dataStr)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    console.log('Using fallback base64 ID');
    return fallbackId;
  }
};

// Get a dedication from Firestore
export const getDedication = async (id: string): Promise<DedicationData | null> => {
  // Skip Firebase for local fallback IDs
  if (id.startsWith('local_')) {
    return null;
  }
  
  try {
    const firestore = getDb();
    const dedicationsCollection = collection(firestore, "dedications");
    const docRef = doc(dedicationsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        recipientName: data.recipientName || '',
        themeId: data.themeId || 'crush',
        songUrl: data.songUrl || '',
        message: data.message || '',
        photoUrl: data.photoUrl || null,
        isAnonymous: data.isAnonymous ?? true,
        senderName: data.senderName || '',
        deliveryMethod: data.deliveryMethod || 'self',
        recipientInstagram: data.recipientInstagram || '',
        senderEmail: data.senderEmail || '',
      } as DedicationData;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting dedication:", error);
    return null;
  }
};

// Increment view count
export const incrementViews = async (id: string): Promise<void> => {
  if (id.startsWith('local_')) return;
  
  try {
    const firestore = getDb();
    const dedicationsCollection = collection(firestore, "dedications");
    const docRef = doc(dedicationsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentViews = docSnap.data().views || 0;
      await setDoc(docRef, { views: currentViews + 1 }, { merge: true });
    }
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
};
