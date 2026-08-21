import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
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

// Initialize Firestore singleton
let firestoreInstance: Firestore;
try {
  firestoreInstance = targetDatabaseId 
    ? getFirestore(app, targetDatabaseId) 
    : getFirestore(app);
} catch {
  firestoreInstance = targetDatabaseId
    ? initializeFirestore(app, { ignoreUndefinedProperties: true }, targetDatabaseId)
    : initializeFirestore(app, { ignoreUndefinedProperties: true });
}

export const db: Firestore = firestoreInstance;

export const auth: Auth = getAuth(app);

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
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
};

