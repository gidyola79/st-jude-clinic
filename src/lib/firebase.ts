import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  getDocFromServer,
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  type Firestore 
} from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton with active or environment API key
const activeApiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY)
  ? import.meta.env.VITE_FIREBASE_API_KEY
  : (firebaseConfig.apiKey || '');

const runtimeConfig = {
  ...firebaseConfig,
  apiKey: activeApiKey
};

const app = !getApps().length ? initializeApp(runtimeConfig) : getApp();

const targetDatabaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;

// Initialize Firestore singleton with auto-detect long polling for web/sandboxed proxy stability
let firestoreInstance: Firestore;
try {
  firestoreInstance = targetDatabaseId 
    ? initializeFirestore(app, { 
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true 
      }, targetDatabaseId)
    : initializeFirestore(app, { 
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true 
      });
} catch {
  firestoreInstance = targetDatabaseId 
    ? getFirestore(app, targetDatabaseId) 
    : getFirestore(app);
}

export const db: Firestore = firestoreInstance;

export const auth: Auth = getAuth(app);

// Validate Connection to Firestore (as mandated by firebase skill)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info("Firestore operating in offline client mode until backend stream synchronizes.");
    }
  }
}
testConnection();

// Structured Firestore error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Collection Names
export const COLLECTIONS = {
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  DOCTORS: 'doctors',
  PRESCRIPTIONS: 'prescriptions',
  BEDS: 'beds',
  BILLS: 'bills',
  LAB_RESULTS: 'labResults',
  SYSTEM_LOGS: 'systemLogs',
  NOTIFICATIONS: 'notifications'
} as const;

export {
  collection,
  doc,
  getDocs,
  getDoc,
  getDocFromServer,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
};

