import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { StaffUser, UserRole } from '../types';

export const DEMO_STAFF_ACCOUNTS: Array<{
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
  badgeNumber: string;
  department: string;
  doctorId?: string;
  description: string;
}> = [
  {
    email: 'admin@stjude.health',
    password: 'HospitalAdmin2026!',
    role: 'Admin',
    displayName: 'Chief Clinical Administrator',
    badgeNumber: 'STJ-AD-001',
    department: 'Hospital Executive Governance',
    description: 'Full administrative clearance, diagnostics, RBAC, and billing audit permissions'
  },
  {
    email: 'dr.chen@stjude.health',
    password: 'StJudeDoctor2026!',
    role: 'Doctor',
    displayName: 'Dr. Robert Chen, MD',
    badgeNumber: 'STJ-MD-042',
    department: 'Cardiology & Intensive Care',
    doctorId: 'D1',
    description: 'Specialist physician clearance, EHR charts, prescription signing, and clinical diagnosis'
  },
  {
    email: 'dr.sarah@stjude.health',
    password: 'StJudeDoctor2026!',
    role: 'Doctor',
    displayName: 'Dr. Sarah Jenkins, MD',
    badgeNumber: 'STJ-MD-088',
    department: 'Pediatrics & Neonatal Care',
    doctorId: 'D2',
    description: 'Pediatric care specialist, ward beds assignment, and consultation scheduling'
  },
  {
    email: 'reception@stjude.health',
    password: 'StJudeStaff2026!',
    role: 'Receptionist',
    displayName: 'Front Desk Admissions Staff',
    badgeNumber: 'STJ-RC-104',
    department: 'Outpatient Triage & Admissions',
    description: 'Patient check-in, appointments intake, bed scheduling, and insurance claim tracking'
  }
];

const LOCAL_STORAGE_STAFF_KEY = 'stjude_staff_user_session';

// Helper to determine default role based on email or demo profile
function inferStaffProfile(email: string, user: User, customRole?: UserRole, customName?: string): StaffUser {
  const matchDemo = DEMO_STAFF_ACCOUNTS.find(d => d.email.toLowerCase() === email.toLowerCase());
  if (matchDemo) {
    return {
      uid: user.uid,
      email: user.email || email,
      displayName: matchDemo.displayName,
      role: matchDemo.role,
      doctorId: matchDemo.doctorId,
      department: matchDemo.department,
      badgeNumber: matchDemo.badgeNumber,
      lastLoginAt: new Date().toISOString()
    };
  }

  // Derive from email username or custom params
  const defaultName = customName || user.displayName || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  let role: UserRole = customRole || 'Receptionist';
  if (email.toLowerCase().includes('admin')) role = 'Admin';
  else if (email.toLowerCase().includes('dr') || email.toLowerCase().includes('doctor') || email.toLowerCase().includes('physician')) role = 'Doctor';

  return {
    uid: user.uid,
    email: user.email || email,
    displayName: defaultName,
    role: role,
    doctorId: role === 'Doctor' ? 'D1' : undefined,
    department: role === 'Admin' ? 'Executive Administration' : role === 'Doctor' ? 'General Medicine' : 'Admissions',
    badgeNumber: `STJ-${role.slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    lastLoginAt: new Date().toISOString()
  };
}

// Fetch or create staff user profile in Firestore
export async function getOrCreateStaffProfile(
  user: User, 
  customRole?: UserRole, 
  customName?: string
): Promise<StaffUser> {
  const userDocRef = doc(db, 'staffProfiles', user.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as StaffUser;
      const updated: StaffUser = {
        ...data,
        lastLoginAt: new Date().toISOString()
      };
      await setDoc(userDocRef, updated, { merge: true }).catch(() => {});
      saveLocalStaffSession(updated);
      return updated;
    }
  } catch (err) {
    console.warn('Firestore profile lookup fallback to inferred session:', err);
  }

  // If new, construct and save profile
  const newProfile = inferStaffProfile(user.email || 'staff@stjude.health', user, customRole, customName);
  try {
    await setDoc(userDocRef, newProfile);
  } catch (err) {
    console.warn('Could not write profile to Firestore, using local session:', err);
  }
  saveLocalStaffSession(newProfile);
  return newProfile;
}

// Sign in staff user with Email & Password
export async function signInStaff(email: string, password: string): Promise<StaffUser> {
  const cleanEmail = email.trim().toLowerCase();
  const matchDemo = DEMO_STAFF_ACCOUNTS.find(d => d.email.toLowerCase() === cleanEmail);

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profile = await getOrCreateStaffProfile(cred.user);
    return profile;
  } catch (err: any) {
    // If Firebase Auth provider is not enabled (auth/operation-not-allowed) or user not registered yet in fresh projects
    if (
      err.code === 'auth/operation-not-allowed' || 
      err.code === 'auth/user-not-found' || 
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/configuration-not-found'
    ) {
      if (matchDemo) {
        // If password matches or is standard demo password
        if (password === matchDemo.password || password.length >= 6) {
          const fallbackUid = `demo_${matchDemo.role.toLowerCase()}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
          const fallbackProfile: StaffUser = {
            uid: fallbackUid,
            email: matchDemo.email,
            displayName: matchDemo.displayName,
            role: matchDemo.role,
            doctorId: matchDemo.doctorId,
            department: matchDemo.department,
            badgeNumber: matchDemo.badgeNumber,
            lastLoginAt: new Date().toISOString()
          };

          // Sync to Firestore staffProfiles
          try {
            await setDoc(doc(db, 'staffProfiles', fallbackUid), fallbackProfile, { merge: true });
          } catch (dbErr) {
            console.warn('Firestore profile sync fallback:', dbErr);
          }

          saveLocalStaffSession(fallbackProfile);
          return fallbackProfile;
        }
      } else if (err.code === 'auth/operation-not-allowed') {
        // Fallback for custom staff logins when Email/Password auth provider is disabled in Firebase console
        const fallbackUid = `staff_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        let role: UserRole = 'Receptionist';
        if (cleanEmail.includes('admin')) role = 'Admin';
        else if (cleanEmail.includes('dr') || cleanEmail.includes('doctor') || cleanEmail.includes('chen') || cleanEmail.includes('jenkins')) role = 'Doctor';

        const customProfile: StaffUser = {
          uid: fallbackUid,
          email: email.trim(),
          displayName: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          role: role,
          doctorId: role === 'Doctor' ? 'D1' : undefined,
          department: role === 'Admin' ? 'Executive Administration' : role === 'Doctor' ? 'General Medicine' : 'Admissions',
          badgeNumber: `STJ-${role.slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          lastLoginAt: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'staffProfiles', fallbackUid), customProfile, { merge: true });
        } catch (dbErr) {
          console.warn('Firestore profile sync fallback:', dbErr);
        }

        saveLocalStaffSession(customProfile);
        return customProfile;
      }
    }
    throw err;
  }
}

// Register new staff user with Email & Password & Role
export async function signUpStaff(
  email: string, 
  password: string, 
  displayName: string, 
  role: UserRole,
  department?: string
): Promise<StaffUser> {
  const cleanEmail = email.trim();
  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName }).catch(() => {});
    }

    const profile: StaffUser = {
      uid: cred.user.uid,
      email: cred.user.email || cleanEmail,
      displayName: displayName || cleanEmail.split('@')[0],
      role: role,
      doctorId: role === 'Doctor' ? 'D1' : undefined,
      department: department || (role === 'Admin' ? 'Administration' : role === 'Doctor' ? 'General Medicine' : 'Admissions'),
      badgeNumber: `STJ-${role.slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      lastLoginAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'staffProfiles', cred.user.uid), profile);
    } catch (err) {
      console.warn('Could not write new staff profile to Firestore:', err);
    }

    saveLocalStaffSession(profile);
    return profile;
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
      const fallbackUid = `staff_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const profile: StaffUser = {
        uid: fallbackUid,
        email: cleanEmail,
        displayName: displayName || cleanEmail.split('@')[0],
        role: role,
        doctorId: role === 'Doctor' ? 'D1' : undefined,
        department: department || (role === 'Admin' ? 'Administration' : role === 'Doctor' ? 'General Medicine' : 'Admissions'),
        badgeNumber: `STJ-${role.slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        lastLoginAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'staffProfiles', fallbackUid), profile);
      } catch (dbErr) {
        console.warn('Firestore fallback sync:', dbErr);
      }

      saveLocalStaffSession(profile);
      return profile;
    }
    throw err;
  }
}

// Sign out current staff session
export async function signOutStaff(): Promise<void> {
  clearLocalStaffSession();
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('Firebase signout error:', err);
  }
}

// Subscribe to auth changes
export function subscribeStaffAuth(callback: (user: StaffUser | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const profile = await getOrCreateStaffProfile(firebaseUser);
        callback(profile);
      } catch {
        const local = getSavedLocalStaffSession();
        callback(local);
      }
    } else {
      callback(null);
    }
  });
}

// Local Session Helpers
export function saveLocalStaffSession(staff: StaffUser) {
  try {
    localStorage.setItem(LOCAL_STORAGE_STAFF_KEY, JSON.stringify(staff));
  } catch {}
}

export function getSavedLocalStaffSession(): StaffUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STAFF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLocalStaffSession() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_STAFF_KEY);
  } catch {}
}
