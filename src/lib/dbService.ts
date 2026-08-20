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

/**
 * Sync / Seed initial hospital datasets into Firestore if collections are empty.
 */
export async function initializeHospitalDatabase(): Promise<void> {
  try {
    const patientsSnapshot = await getDocs(collection(db, COLLECTIONS.PATIENTS));
    if (patientsSnapshot.empty) {
      console.log('🔄 Seeding Firestore with Initial St. Jude Medical Datasets...');
      
      // Batch seed patients
      const patientPromises = INITIAL_PATIENTS.map(p => 
        setDoc(doc(db, COLLECTIONS.PATIENTS, p.id), p)
      );

      // Doctors
      const docPromises = INITIAL_DOCTORS.map(d => 
        setDoc(doc(db, COLLECTIONS.DOCTORS, d.id), d)
      );

      // Appointments
      const apptPromises = INITIAL_APPOINTMENTS.map(a => 
        setDoc(doc(db, COLLECTIONS.APPOINTMENTS, a.id), a)
      );

      // Prescriptions
      const rxPromises = INITIAL_PRESCRIPTIONS.map(rx => 
        setDoc(doc(db, COLLECTIONS.PRESCRIPTIONS, rx.id), rx)
      );

      // Beds
      const bedPromises = INITIAL_BEDS.map(b => 
        setDoc(doc(db, COLLECTIONS.BEDS, b.id), b)
      );

      // Invoices / Bills
      const billPromises = INITIAL_INVOICES.map(b => 
        setDoc(doc(db, COLLECTIONS.BILLS, b.id), b)
      );

      // System logs
      const logPromises = SYSTEM_LOGS.map(l => 
        setDoc(doc(db, COLLECTIONS.SYSTEM_LOGS, l.id), l)
      );

      // Notifications
      const notifPromises = INITIAL_NOTIFICATIONS.map(n => 
        setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), n)
      );

      await Promise.all([
        ...patientPromises,
        ...docPromises,
        ...apptPromises,
        ...rxPromises,
        ...bedPromises,
        ...billPromises,
        ...logPromises,
        ...notifPromises
      ]);

      console.log('✅ Firestore Database Seeding Completed Successfully');
    }
  } catch (error) {
    console.warn('⚠️ Firestore auto-seeding skipped or offline:', error);
  }
}

// -------------------------------------------------------------
// REAL-TIME FIRESTORE REPOSITORY METHODS
// -------------------------------------------------------------

// --- Patients ---
export function subscribePatients(callback: (patients: Patient[]) => void, onError?: (err: any) => void) {
  const q = collection(db, COLLECTIONS.PATIENTS);
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      callback(data);
    } else {
      callback(INITIAL_PATIENTS);
    }
  }, (err) => {
    console.error('Firestore Patients subscription error:', err);
    if (onError) onError(err);
  });
}

export async function savePatient(patient: Patient): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.PATIENTS, patient.id), patient);
}

export async function updatePatientRecord(patientId: string, updates: Partial<Patient>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.PATIENTS, patientId), updates);
}

export async function removePatient(patientId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.PATIENTS, patientId));
}

// --- Appointments ---
export function subscribeAppointments(callback: (appointments: Appointment[]) => void, onError?: (err: any) => void) {
  const q = collection(db, COLLECTIONS.APPOINTMENTS);
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      callback(data);
    } else {
      callback(INITIAL_APPOINTMENTS);
    }
  }, (err) => {
    console.error('Firestore Appointments subscription error:', err);
    if (onError) onError(err);
  });
}

export async function saveAppointment(appointment: Appointment): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointment.id), appointment);
}

export async function updateAppointmentRecord(apptId: string, updates: Partial<Appointment>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.APPOINTMENTS, apptId), updates);
}

// --- Prescriptions ---
export function subscribePrescriptions(callback: (prescriptions: PrescriptionOrder[]) => void, onError?: (err: any) => void) {
  const q = collection(db, COLLECTIONS.PRESCRIPTIONS);
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrescriptionOrder));
      callback(data);
    } else {
      callback(INITIAL_PRESCRIPTIONS);
    }
  }, (err) => {
    console.error('Firestore Prescriptions subscription error:', err);
    if (onError) onError(err);
  });
}

export async function savePrescription(prescription: PrescriptionOrder): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.PRESCRIPTIONS, prescription.id), prescription);
}

// --- Beds ---
export function subscribeBeds(callback: (beds: BedAlloc[]) => void, onError?: (err: any) => void) {
  const q = collection(db, COLLECTIONS.BEDS);
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BedAlloc));
      callback(data);
    } else {
      callback(INITIAL_BEDS);
    }
  }, (err) => {
    console.error('Firestore Beds subscription error:', err);
    if (onError) onError(err);
  });
}

export async function updateBedRecord(bedId: string, updates: Partial<BedAlloc>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BEDS, bedId), updates);
}

// --- Invoices & Bills ---
export function subscribeInvoices(callback: (invoices: Invoice[]) => void, onError?: (err: any) => void) {
  const q = collection(db, COLLECTIONS.BILLS);
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      callback(data);
    } else {
      callback(INITIAL_INVOICES);
    }
  }, (err) => {
    console.error('Firestore Bills subscription error:', err);
    if (onError) onError(err);
  });
}

export async function saveInvoice(invoice: Invoice): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.BILLS, invoice.id), invoice);
}

export async function updateInvoiceRecord(invoiceId: string, updates: Partial<Invoice>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BILLS, invoiceId), updates);
}

// --- System Logs ---
export function subscribeSystemLogs(callback: (logs: SystemLog[]) => void, onError?: (err: any) => void) {
  const q = collection(db, COLLECTIONS.SYSTEM_LOGS);
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SystemLog));
      callback(data);
    } else {
      callback(SYSTEM_LOGS);
    }
  }, (err) => {
    console.error('Firestore SystemLogs subscription error:', err);
    if (onError) onError(err);
  });
}

export async function addSystemAuditLog(log: SystemLog): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.SYSTEM_LOGS, log.id), log);
}

// --- Doctors ---
export function subscribeDoctors(callback: (doctors: Doctor[]) => void, onError?: (err: any) => void) {
  const q = collection(db, COLLECTIONS.DOCTORS);
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
      callback(data);
    } else {
      callback(INITIAL_DOCTORS);
    }
  }, (err) => {
    console.error('Firestore Doctors subscription error:', err);
    if (onError) onError(err);
  });
}

export async function saveDoctor(doctor: Doctor): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.DOCTORS, doctor.id), doctor);
}

export async function updateDoctorRecord(doctorId: string, updates: Partial<Doctor>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.DOCTORS, doctorId), updates);
}

export async function removeDoctor(doctorId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.DOCTORS, doctorId));
}
