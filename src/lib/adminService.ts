import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  updateDoc, 
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface DeliveryRequest {
  id: string;
  recipientName: string;
  recipientInstagram: string;
  senderEmail: string;
  senderName: string;
  isAnonymous: boolean;
  message: string;
  status: 'pending' | 'delivered';
  createdAt: Timestamp | null;
  deliveredAt: Timestamp | null;
  viewedAt: Timestamp | null;
  viewCount: number;
  deliveryMethod?: string;
}

const DEDICATIONS_COLLECTION = 'dedications';

/**
 * Debug: Get ALL dedications to see what's in the database
 */
export async function getAllDedications(): Promise<any[]> {
  try {
    const dedicationsRef = collection(db, DEDICATIONS_COLLECTION);
    const snapshot = await getDocs(dedicationsRef);
    
    console.log('Total dedications in DB:', snapshot.docs.length);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Document:', doc.id, 'deliveryMethod:', data.deliveryMethod, data);
      return {
        id: doc.id,
        ...data
      };
    });
  } catch (error) {
    console.error('Error fetching all dedications:', error);
    return [];
  }
}

/**
 * Get all delivery requests (dedications with deliveryMethod = 'deliver')
 */
export async function getAllDeliveryRequests(): Promise<DeliveryRequest[]> {
  try {
    const dedicationsRef = collection(db, DEDICATIONS_COLLECTION);
    
    // Try with composite query first
    try {
      const q = query(
        dedicationsRef,
        where('deliveryMethod', '==', 'deliver'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      console.log('Found delivery requests:', snapshot.docs.length);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        recipientName: doc.data().recipientName || '',
        recipientInstagram: doc.data().recipientInstagram || '',
        senderEmail: doc.data().senderEmail || '',
        senderName: doc.data().senderName || '',
        isAnonymous: doc.data().isAnonymous || false,
        message: doc.data().message || '',
        status: doc.data().status || 'pending',
        createdAt: doc.data().createdAt || null,
        deliveredAt: doc.data().deliveredAt || null,
        viewedAt: doc.data().viewedAt || null,
        viewCount: doc.data().viewCount || 0,
      }));
    } catch (indexError: any) {
      // If index doesn't exist, fall back to simpler query
      console.warn('Composite index may be missing, falling back to simple query:', indexError.message);
      
      // Fallback: get all dedications and filter client-side
      const q = query(dedicationsRef, where('deliveryMethod', '==', 'deliver'));
      const snapshot = await getDocs(q);
      
      console.log('Found delivery requests (fallback):', snapshot.docs.length);
      
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        recipientName: doc.data().recipientName || '',
        recipientInstagram: doc.data().recipientInstagram || '',
        senderEmail: doc.data().senderEmail || '',
        senderName: doc.data().senderName || '',
        isAnonymous: doc.data().isAnonymous || false,
        message: doc.data().message || '',
        status: doc.data().status || 'pending',
        createdAt: doc.data().createdAt || null,
        deliveredAt: doc.data().deliveredAt || null,
        viewedAt: doc.data().viewedAt || null,
        viewCount: doc.data().viewCount || 0,
      }));
      
      // Sort client-side
      return requests.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
    }
  } catch (error) {
    console.error('Error fetching delivery requests:', error);
    return [];
  }
}

/**
 * Mark a dedication as delivered
 */
export async function markAsDelivered(dedicationId: string): Promise<boolean> {
  try {
    const docRef = doc(db, DEDICATIONS_COLLECTION, dedicationId);
    await updateDoc(docRef, {
      status: 'delivered',
      deliveredAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error marking as delivered:', error);
    return false;
  }
}

/**
 * Record when a dedication is viewed (called from ViewPage)
 */
export async function recordView(dedicationId: string): Promise<boolean> {
  try {
    const docRef = doc(db, DEDICATIONS_COLLECTION, dedicationId);
    await updateDoc(docRef, {
      viewedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error recording view:', error);
    return false;
  }
}

/**
 * Get sender email for a dedication (to notify when viewed)
 */
export async function getSenderEmail(dedicationId: string): Promise<string | null> {
  try {
    const { getDedication } = await import('./firebase');
    const dedication = await getDedication(dedicationId);
    return dedication?.senderEmail || null;
  } catch (error) {
    console.error('Error getting sender email:', error);
    return null;
  }
}
