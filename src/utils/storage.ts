import { 
  Doctor, 
  Patient, 
  Appointment, 
  BedAlloc, 
  WardBed, 
  Medicine, 
  PrescriptionOrder, 
  Invoice, 
  InsuranceClaim, 
  EmergencyCase, 
  Notification, 
  SystemLog, 
  HospitalSettings 
} from '../types';
import { 
  INITIAL_DOCTORS, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_BEDS, 
  INITIAL_WARD_BEDS, 
  INITIAL_MEDICINES, 
  INITIAL_PRESCRIPTION_ORDERS, 
  INITIAL_INVOICES, 
  INITIAL_INSURANCE_CLAIMS, 
  INITIAL_EMERGENCY_CASES, 
  INITIAL_NOTIFICATIONS, 
  SYSTEM_LOGS, 
  INITIAL_HOSPITAL_SETTINGS 
} from '../mockData';

const STORAGE_PREFIX = 'stjude_mvp_';

export function loadState<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading from localStorage for key "${key}":`, err);
    return fallback;
  }
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing to localStorage for key "${key}":`, err);
  }
}

export const loadInitialData = () => {
  return {
    settings: loadState<HospitalSettings>('settings', INITIAL_HOSPITAL_SETTINGS),
    doctors: loadState<Doctor[]>('doctors', INITIAL_DOCTORS),
    patients: loadState<Patient[]>('patients', INITIAL_PATIENTS),
    appointments: loadState<Appointment[]>('appointments', INITIAL_APPOINTMENTS),
    beds: loadState<BedAlloc[]>('beds', INITIAL_BEDS),
    wardBeds: loadState<WardBed[]>('wardBeds', INITIAL_WARD_BEDS),
    medicines: loadState<Medicine[]>('medicines', INITIAL_MEDICINES),
    prescriptions: loadState<PrescriptionOrder[]>('pharmacyPrescriptions', INITIAL_PRESCRIPTION_ORDERS),
    invoices: loadState<Invoice[]>('invoices', INITIAL_INVOICES),
    claims: loadState<InsuranceClaim[]>('claims', INITIAL_INSURANCE_CLAIMS),
    emergencyCases: loadState<EmergencyCase[]>('emergencyCases', INITIAL_EMERGENCY_CASES),
    notifications: loadState<Notification[]>('notifications', INITIAL_NOTIFICATIONS),
    logs: loadState<SystemLog[]>('systemLogs', SYSTEM_LOGS)
  };
};

export interface HospitalDataset {
  settings: HospitalSettings;
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  beds: BedAlloc[];
  wardBeds: WardBed[];
  medicines: Medicine[];
  prescriptions: PrescriptionOrder[];
  invoices: Invoice[];
  claims: InsuranceClaim[];
  emergencyCases: EmergencyCase[];
  notifications: Notification[];
  logs: SystemLog[];
}

export const saveAllData = (dataset: Partial<HospitalDataset>) => {
  if (dataset.settings) saveState('settings', dataset.settings);
  if (dataset.doctors) saveState('doctors', dataset.doctors);
  if (dataset.patients) saveState('patients', dataset.patients);
  if (dataset.appointments) saveState('appointments', dataset.appointments);
  if (dataset.beds) saveState('beds', dataset.beds);
  if (dataset.wardBeds) saveState('wardBeds', dataset.wardBeds);
  if (dataset.medicines) saveState('medicines', dataset.medicines);
  if (dataset.prescriptions) saveState('pharmacyPrescriptions', dataset.prescriptions);
  if (dataset.invoices) saveState('invoices', dataset.invoices);
  if (dataset.claims) saveState('claims', dataset.claims);
  if (dataset.emergencyCases) saveState('emergencyCases', dataset.emergencyCases);
  if (dataset.notifications) saveState('notifications', dataset.notifications);
  if (dataset.logs) saveState('systemLogs', dataset.logs);
};

export const resetHospitalStorage = () => {
  localStorage.clear();
  saveAllData({
    settings: INITIAL_HOSPITAL_SETTINGS,
    doctors: INITIAL_DOCTORS,
    patients: INITIAL_PATIENTS,
    appointments: INITIAL_APPOINTMENTS,
    beds: INITIAL_BEDS,
    wardBeds: INITIAL_WARD_BEDS,
    medicines: INITIAL_MEDICINES,
    prescriptions: INITIAL_PRESCRIPTION_ORDERS,
    invoices: INITIAL_INVOICES,
    claims: INITIAL_INSURANCE_CLAIMS,
    emergencyCases: INITIAL_EMERGENCY_CASES,
    notifications: INITIAL_NOTIFICATIONS,
    logs: SYSTEM_LOGS
  });
};

export const exportHospitalJSON = (dataset: HospitalDataset): string => {
  return JSON.stringify({
    appName: 'St. Jude Integrated Medical Center - Health System MVP',
    exportedAt: new Date().toISOString(),
    version: '3.0.0',
    data: dataset
  }, null, 2);
};
