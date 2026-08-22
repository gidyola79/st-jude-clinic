import {
  db,
  COLLECTIONS,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from './firebase';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_BEDS,
  INITIAL_WARD_BEDS,
  INITIAL_NOTIFICATIONS,
  SYSTEM_LOGS,
  INITIAL_MEDICINES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_CLAIMS,
  INITIAL_EMERGENCY_CASES
} from '../mockData';
import { 
  Patient, 
  Doctor, 
  Appointment, 
  PrescriptionOrder, 
  BedAlloc, 
  WardBed,
  Invoice, 
  InsuranceClaim,
  EmergencyCase,
  Medicine,
  SystemLog, 
  Notification 
} from '../types';

// Local storage cache keys
const STORAGE_KEYS = {
  PATIENTS: 'stjude_cache_patients',
  DOCTORS: 'stjude_cache_doctors',
  APPOINTMENTS: 'stjude_cache_appointments',
  PRESCRIPTIONS: 'stjude_cache_prescriptions',
  BEDS: 'stjude_cache_beds',
  INVOICES: 'stjude_cache_invoices',
  SYSTEM_LOGS: 'stjude_cache_system_logs',
  NOTIFICATIONS: 'stjude_cache_notifications',
  EMERGENCY_CASES: 'stjude_cache_emergency_cases'
};

// Safe LocalStorage helpers
function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) {
      return (Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback) as T;
    }
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/**
 * Sync / Seed initial hospital datasets into Firestore if collections are empty.
 */
export async function initializeHospitalDatabase(): Promise<void> {
  try {
    const patientsSnapshot = await getDocs(collection(db, COLLECTIONS.PATIENTS));
    if (patientsSnapshot.empty) {
      console.log('🔄 Seeding Firestore with Initial St. Jude Medical Datasets...');
      
      const patientPromises = INITIAL_PATIENTS.map(p => 
        setDoc(doc(db, COLLECTIONS.PATIENTS, p.id), p).catch(() => {})
      );
      const docPromises = INITIAL_DOCTORS.map(d => 
        setDoc(doc(db, COLLECTIONS.DOCTORS, d.id), d).catch(() => {})
      );
      const apptPromises = INITIAL_APPOINTMENTS.map(a => 
        setDoc(doc(db, COLLECTIONS.APPOINTMENTS, a.id), a).catch(() => {})
      );
      const rxPromises = INITIAL_PRESCRIPTIONS.map(rx => 
        setDoc(doc(db, COLLECTIONS.PRESCRIPTIONS, rx.id), rx).catch(() => {})
      );
      const bedPromises = INITIAL_BEDS.map(b => 
        setDoc(doc(db, COLLECTIONS.BEDS, b.id), b).catch(() => {})
      );
      const billPromises = INITIAL_INVOICES.map(b => 
        setDoc(doc(db, COLLECTIONS.BILLS, b.id), b).catch(() => {})
      );
      const logPromises = SYSTEM_LOGS.map(l => 
        setDoc(doc(db, COLLECTIONS.SYSTEM_LOGS, l.id), l).catch(() => {})
      );
      const notifPromises = INITIAL_NOTIFICATIONS.map(n => 
        setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), n).catch(() => {})
      );

      await Promise.allSettled([
        ...patientPromises,
        ...docPromises,
        ...apptPromises,
        ...rxPromises,
        ...bedPromises,
        ...billPromises,
        ...logPromises,
        ...notifPromises
      ]);

      console.log('✅ Firestore Database initial seeding completed');
    }
  } catch (error: any) {
    // Cloud Firestore offline / unavailable is expected when disconnected or working in local offline mode
    console.info('ℹ️ Hospital data service active in local offline cache mode:', error?.message || error);
  }
}

// -------------------------------------------------------------
// REAL-TIME FIRESTORE REPOSITORY METHODS WITH LOCAL PERSISTENCE
// -------------------------------------------------------------

// --- Patients ---
export function subscribePatients(callback: (patients: Patient[]) => void, onError?: (err: any) => void) {
  // Immediately serve from persistent local cache
  const localData = loadLocal<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  callback(localData);

  try {
    const q = collection(db, COLLECTIONS.PATIENTS);
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
        saveLocal(STORAGE_KEYS.PATIENTS, data);
        callback(data);
      }
    }, (err) => {
      console.info('Using persistent local patient records (offline-ready):', err?.message || err);
      callback(loadLocal<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS));
      if (onError) onError(err);
    });
  } catch (err) {
    console.info('Firestore subscription fallback to local cache:', err);
    return () => {};
  }
}

export async function savePatient(patient: Patient): Promise<void> {
  const current = loadLocal<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  const existsIdx = current.findIndex(p => p.id === patient.id);
  const updated = existsIdx >= 0
    ? current.map(p => p.id === patient.id ? patient : p)
    : [patient, ...current];
  saveLocal(STORAGE_KEYS.PATIENTS, updated);

  try {
    await setDoc(doc(db, COLLECTIONS.PATIENTS, patient.id), patient);
  } catch (err) {
    console.info('Patient saved locally (offline buffer):', err);
  }
}

export async function updatePatientRecord(patientId: string, updates: Partial<Patient>): Promise<void> {
  const current = loadLocal<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  const updated = current.map(p => p.id === patientId ? { ...p, ...updates } : p);
  saveLocal(STORAGE_KEYS.PATIENTS, updated);

  try {
    await updateDoc(doc(db, COLLECTIONS.PATIENTS, patientId), updates);
  } catch (err) {
    console.info('Patient record updated locally (offline buffer):', err);
  }
}

export async function removePatient(patientId: string): Promise<void> {
  const current = loadLocal<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  const updated = current.filter(p => p.id !== patientId);
  saveLocal(STORAGE_KEYS.PATIENTS, updated);

  try {
    await deleteDoc(doc(db, COLLECTIONS.PATIENTS, patientId));
  } catch (err) {
    console.info('Patient removed locally (offline buffer):', err);
  }
}

// --- Appointments ---
export function subscribeAppointments(callback: (appointments: Appointment[]) => void, onError?: (err: any) => void) {
  const localData = loadLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  callback(localData);

  try {
    const q = collection(db, COLLECTIONS.APPOINTMENTS);
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        saveLocal(STORAGE_KEYS.APPOINTMENTS, data);
        callback(data);
      }
    }, (err) => {
      console.info('Using persistent local appointments (offline-ready):', err?.message || err);
      callback(loadLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS));
      if (onError) onError(err);
    });
  } catch (err) {
    console.info('Firestore appointments subscription fallback to local cache:', err);
    return () => {};
  }
}

export async function saveAppointment(appointment: Appointment): Promise<void> {
  const current = loadLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  const existsIdx = current.findIndex(a => a.id === appointment.id);
  const updated = existsIdx >= 0
    ? current.map(a => a.id === appointment.id ? appointment : a)
    : [appointment, ...current];
  saveLocal(STORAGE_KEYS.APPOINTMENTS, updated);

  try {
    await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointment.id), appointment);
  } catch (err) {
    console.info('Appointment saved locally (offline buffer):', err);
  }
}

export async function updateAppointmentRecord(apptId: string, updates: Partial<Appointment>): Promise<void> {
  const current = loadLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  const updated = current.map(a => a.id === apptId ? { ...a, ...updates } : a);
  saveLocal(STORAGE_KEYS.APPOINTMENTS, updated);

  try {
    await updateDoc(doc(db, COLLECTIONS.APPOINTMENTS, apptId), updates);
  } catch (err) {
    console.info('Appointment updated locally (offline buffer):', err);
  }
}

// --- Prescriptions ---
export function subscribePrescriptions(callback: (prescriptions: PrescriptionOrder[]) => void, onError?: (err: any) => void) {
  const localData = loadLocal<PrescriptionOrder[]>(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
  callback(localData);

  try {
    const q = collection(db, COLLECTIONS.PRESCRIPTIONS);
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrescriptionOrder));
        saveLocal(STORAGE_KEYS.PRESCRIPTIONS, data);
        callback(data);
      }
    }, (err) => {
      console.info('Using persistent local prescriptions (offline-ready):', err?.message || err);
      callback(loadLocal<PrescriptionOrder[]>(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS));
      if (onError) onError(err);
    });
  } catch (err) {
    console.info('Firestore prescriptions subscription fallback to local cache:', err);
    return () => {};
  }
}

export async function savePrescription(prescription: PrescriptionOrder): Promise<void> {
  const current = loadLocal<PrescriptionOrder[]>(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
  const existsIdx = current.findIndex(rx => rx.id === prescription.id);
  const updated = existsIdx >= 0
    ? current.map(rx => rx.id === prescription.id ? prescription : rx)
    : [prescription, ...current];
  saveLocal(STORAGE_KEYS.PRESCRIPTIONS, updated);

  try {
    await setDoc(doc(db, COLLECTIONS.PRESCRIPTIONS, prescription.id), prescription);
  } catch (err) {
    console.info('Prescription saved locally (offline buffer):', err);
  }
}

// --- Beds ---
export function subscribeBeds(callback: (beds: BedAlloc[]) => void, onError?: (err: any) => void) {
  const localData = loadLocal<BedAlloc[]>(STORAGE_KEYS.BEDS, INITIAL_BEDS);
  callback(localData);

  try {
    const q = collection(db, COLLECTIONS.BEDS);
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BedAlloc));
        saveLocal(STORAGE_KEYS.BEDS, data);
        callback(data);
      }
    }, (err) => {
      console.info('Using persistent local bed records (offline-ready):', err?.message || err);
      callback(loadLocal<BedAlloc[]>(STORAGE_KEYS.BEDS, INITIAL_BEDS));
      if (onError) onError(err);
    });
  } catch (err) {
    console.info('Firestore beds subscription fallback to local cache:', err);
    return () => {};
  }
}

export async function updateBedRecord(bedId: string, updates: Partial<BedAlloc>): Promise<void> {
  const current = loadLocal<BedAlloc[]>(STORAGE_KEYS.BEDS, INITIAL_BEDS);
  const updated = current.map(b => b.id === bedId ? { ...b, ...updates } : b);
  saveLocal(STORAGE_KEYS.BEDS, updated);

  try {
    await updateDoc(doc(db, COLLECTIONS.BEDS, bedId), updates);
  } catch (err) {
    console.info('Bed record updated locally (offline buffer):', err);
  }
}

// --- Invoices & Bills ---
export function subscribeInvoices(callback: (invoices: Invoice[]) => void, onError?: (err: any) => void) {
  const localData = loadLocal<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  callback(localData);

  try {
    const q = collection(db, COLLECTIONS.BILLS);
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
        saveLocal(STORAGE_KEYS.INVOICES, data);
        callback(data);
      }
    }, (err) => {
      console.info('Using persistent local invoices (offline-ready):', err?.message || err);
      callback(loadLocal<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES));
      if (onError) onError(err);
    });
  } catch (err) {
    console.info('Firestore invoices subscription fallback to local cache:', err);
    return () => {};
  }
}

export async function saveInvoice(invoice: Invoice): Promise<void> {
  const current = loadLocal<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  const existsIdx = current.findIndex(i => i.id === invoice.id);
  const updated = existsIdx >= 0
    ? current.map(i => i.id === invoice.id ? invoice : i)
    : [invoice, ...current];
  saveLocal(STORAGE_KEYS.INVOICES, updated);

  try {
    await setDoc(doc(db, COLLECTIONS.BILLS, invoice.id), invoice);
  } catch (err) {
    console.info('Invoice saved locally (offline buffer):', err);
  }
}

export async function updateInvoiceRecord(invoiceId: string, updates: Partial<Invoice>): Promise<void> {
  const current = loadLocal<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  const updated = current.map(i => i.id === invoiceId ? { ...i, ...updates } : i);
  saveLocal(STORAGE_KEYS.INVOICES, updated);

  try {
    await updateDoc(doc(db, COLLECTIONS.BILLS, invoiceId), updates);
  } catch (err) {
    console.info('Invoice updated locally (offline buffer):', err);
  }
}

// --- System Logs ---
export function subscribeSystemLogs(callback: (logs: SystemLog[]) => void, onError?: (err: any) => void) {
  const localData = loadLocal<SystemLog[]>(STORAGE_KEYS.SYSTEM_LOGS, SYSTEM_LOGS);
  callback(localData);

  try {
    const q = collection(db, COLLECTIONS.SYSTEM_LOGS);
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SystemLog));
        saveLocal(STORAGE_KEYS.SYSTEM_LOGS, data);
        callback(data);
      }
    }, (err) => {
      console.info('Using persistent local system logs (offline-ready):', err?.message || err);
      callback(loadLocal<SystemLog[]>(STORAGE_KEYS.SYSTEM_LOGS, SYSTEM_LOGS));
      if (onError) onError(err);
    });
  } catch (err) {
    console.info('Firestore system logs subscription fallback to local cache:', err);
    return () => {};
  }
}

export async function addSystemAuditLog(log: SystemLog): Promise<void> {
  const current = loadLocal<SystemLog[]>(STORAGE_KEYS.SYSTEM_LOGS, SYSTEM_LOGS);
  const updated = [log, ...current];
  saveLocal(STORAGE_KEYS.SYSTEM_LOGS, updated);

  try {
    await setDoc(doc(db, COLLECTIONS.SYSTEM_LOGS, log.id), log);
  } catch (err) {
    console.info('Audit log saved locally (offline buffer):', err);
  }
}

// --- Doctors ---
export function subscribeDoctors(callback: (doctors: Doctor[]) => void, onError?: (err: any) => void) {
  const localData = loadLocal<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  callback(localData);

  try {
    const q = collection(db, COLLECTIONS.DOCTORS);
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
        saveLocal(STORAGE_KEYS.DOCTORS, data);
        callback(data);
      }
    }, (err) => {
      console.info('Using persistent local doctor directory (offline-ready):', err?.message || err);
      callback(loadLocal<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS));
      if (onError) onError(err);
    });
  } catch (err) {
    console.info('Firestore doctors subscription fallback to local cache:', err);
    return () => {};
  }
}

export async function saveDoctor(doctor: Doctor): Promise<void> {
  const current = loadLocal<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  const existsIdx = current.findIndex(d => d.id === doctor.id);
  const updated = existsIdx >= 0
    ? current.map(d => d.id === doctor.id ? doctor : d)
    : [doctor, ...current];
  saveLocal(STORAGE_KEYS.DOCTORS, updated);

  try {
    await setDoc(doc(db, COLLECTIONS.DOCTORS, doctor.id), doctor);
  } catch (err) {
    console.info('Doctor saved locally (offline buffer):', err);
  }
}

export async function updateDoctorRecord(doctorId: string, updates: Partial<Doctor>): Promise<void> {
  const current = loadLocal<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  const updated = current.map(d => d.id === doctorId ? { ...d, ...updates } : d);
  saveLocal(STORAGE_KEYS.DOCTORS, updated);

  try {
    await updateDoc(doc(db, COLLECTIONS.DOCTORS, doctorId), updates);
  } catch (err) {
    console.info('Doctor record updated locally (offline buffer):', err);
  }
}

export async function removeDoctor(doctorId: string): Promise<void> {
  const current = loadLocal<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  const updated = current.filter(d => d.id !== doctorId);
  saveLocal(STORAGE_KEYS.DOCTORS, updated);

  try {
    await deleteDoc(doc(db, COLLECTIONS.DOCTORS, doctorId));
  } catch (err) {
    console.info('Doctor removed locally (offline buffer):', err);
  }
}

