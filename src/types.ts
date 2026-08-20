export type UserRole = 'Admin' | 'Receptionist' | 'Doctor' | 'Pharmacist' | 'Nurse';

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  doctor: string;
  department: string;
  prescriptions: Prescription[];
  notes: string;
}

export interface VitalsRecord {
  id: string;
  date: string;
  time: string;
  bloodPressure: string; // e.g. "120/80"
  heartRate: number; // bpm
  respRate: number; // breaths/min
  temperature: number; // °F or °C
  spO2: number; // %
  glucose?: number; // mg/dL
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
  recordedBy: string;
  notes?: string;
  status: 'Normal' | 'Warning' | 'Critical';
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Radiology' | 'Cardiology' | 'Pathology';
  date: string;
  status: 'Ordered' | 'Sample Collected' | 'Analyzing' | 'Completed';
  priority: 'Routine' | 'Urgent' | 'STAT';
  results?: string;
  normalRange?: string;
  flags?: 'Normal' | 'Abnormal' | 'Critical';
  cost: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  dob?: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: string;
  insurance: string;
  policyNumber?: string;
  phone: string;
  email: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  condition: string;
  status: 'Admitted' | 'Outpatient' | 'Discharged';
  room: string;
  bedId?: string;
  photo: string;
  allergies: string[];
  immunizations: string[];
  vitalsHistory: VitalsRecord[];
  labTests: LabTest[];
  history: MedicalRecord[];
  admittedDate?: string;
  primaryDoctor?: string;
}

export interface TimeSlot {
  time: string;
  isBooked: boolean;
  bookedBy?: string;
}

export interface DoctorSchedule {
  date: string;
  slots: TimeSlot[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: 'Cardiology' | 'Neurology' | 'Pediatrics' | 'Oncology' | 'Emergency' | 'Internal Medicine' | 'Orthopedics' | 'General Surgery';
  rating: number;
  experience: number;
  patientsCount: number;
  image: string;
  status: 'On Duty' | 'Off Duty' | 'In Surgery' | 'On Call';
  email: string;
  phone: string;
  bio: string;
  department: string;
  qualifications?: string;
  schedule: DoctorSchedule[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  specialty: string;
  type: 'In-Person' | 'Telehealth Video';
  status: 'Scheduled' | 'In-Consultation' | 'Completed' | 'Cancelled';
  reason: string;
  notes?: string;
  isUrgent: boolean;
  insuranceClaimStatus?: 'Pending' | 'Approved' | 'Rejected';
  consultationFee: number;
  isBilled?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'Alert' | 'Info' | 'Success' | 'Schedule';
  isRead: boolean;
  targetAudience?: 'public' | 'staff' | 'admin' | 'all';
}

export interface BedAlloc {
  id: string;
  type: 'ICU' | 'Emergency' | 'General' | 'Pediatric' | 'Neonatal Care' | 'Maternity';
  total: number;
  occupied: number;
  available: number;
}

export interface WardBed {
  id: string;
  bedNumber: string;
  ward: 'ICU' | 'Emergency' | 'General Ward (3F)' | 'General Ward (4F)' | 'Pediatrics' | 'Neonatal Care' | 'Maternity';
  status: 'Occupied' | 'Available' | 'Sanitizing' | 'Maintenance';
  patientId?: string;
  patientName?: string;
  admittedDate?: string;
  attendingDoctor?: string;
  nurseAssigned?: string;
  dailyRate: number;
  condition?: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: 'Antibiotics' | 'Analgesics' | 'Cardiovascular' | 'Antidiabetic' | 'Respiratory' | 'Sedatives' | 'Emergency/IV' | 'Gastrointestinal';
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'IV Infusion' | 'Inhaler' | 'Ointment';
  strength: string;
  inStock: number;
  minThreshold: number;
  unitPrice: number;
  expiryDate: string;
  batchNumber: string;
  manufacturer: string;
  requiresPrescription: boolean;
}

export interface PrescriptionOrder {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: Prescription[];
  status: 'Pending Dispense' | 'Dispensed' | 'Collected';
  priority: 'Routine' | 'STAT';
  pharmacyNotes?: string;
  totalCost: number;
  dispensedAt?: string;
  dispensedBy?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'Consultation' | 'Pharmacy' | 'Laboratory' | 'Ward/Bed' | 'Procedure';
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  insuranceCovered: number;
  patientPayable: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Claim Processing';
  paymentMethod?: 'Cash' | 'Credit Card' | 'Insurance Direct' | 'Wire Transfer';
  insuranceProvider?: string;
  claimId?: string;
  paidAt?: string;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  provider: string;
  policyNumber: string;
  totalBilled: number;
  amountClaimed: number;
  amountApproved?: number;
  status: 'Submitted' | 'In Review' | 'Approved' | 'Denied';
  submittedDate: string;
  decisionDate?: string;
  notes?: string;
}

export interface EmergencyCase {
  id: string;
  traumaId: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  arrivalTime: string;
  triageLevel: 'Level 1 - Resuscitation (Red)' | 'Level 2 - Emergent (Orange)' | 'Level 3 - Urgent (Yellow)' | 'Level 4 - Less Urgent (Green)' | 'Level 5 - Non-Urgent (Blue)';
  chiefComplaint: string;
  vitals: {
    bp: string;
    pulse: number;
    spo2: number;
    gcs: number; // Glasgow Coma Scale 3-15
    temp: number;
  };
  assignedBay: string;
  attendingDoctor: string;
  status: 'In Trauma Bay' | 'Transferred to OR' | 'Transferred to ICU' | 'Discharged';
  alertActive?: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'Info' | 'Warning' | 'Error';
  message: string;
  user: string;
}

export interface DepartmentMetric {
  name: string;
  patientsCount: number;
  growth: number;
  occupancyRate: number;
}

export interface HospitalSettings {
  name: string;
  tagLine: string;
  hotline: string;
  email: string;
  address: string;
  currency: string;
  taxRate: number;
  timezone: string;
  bedCapacityAlert: number;
  defaultRole: UserRole;
  enableSoundAlerts: boolean;
}

export interface ClinicalDepartment {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  headOfDepartment: string;
  teamSize: number;
  bedCapacity: number;
  keyServices: string[];
  waitingTimeMinutes: number;
  specialtyCode: string;
  image: string;
}

export interface HealthArticle {
  id: string;
  title: string;
  category: string;
  author: string;
  authorTitle: string;
  readTime: string;
  publishDate: string;
  excerpt: string;
  content: string;
  tags: string[];
  imageUrl: string;
  medicalReviewer: string;
}

export interface PatientPortalMessage {
  id: string;
  patientId: string;
  senderName: string;
  senderRole: 'Patient' | 'Doctor' | 'Nurse' | 'Care Coordinator';
  timestamp: string;
  subject: string;
  message: string;
  isRead: boolean;
  replies?: {
    id: string;
    senderName: string;
    senderRole: string;
    timestamp: string;
    message: string;
  }[];
}

export interface VisitorGuideItem {
  id: string;
  title: string;
  category: 'Visiting Hours' | 'Parking & Transport' | 'Dining & Cafeteria' | 'Amenities' | 'Policies';
  details: string;
  location?: string;
  timing?: string;
}

export interface StaffUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  doctorId?: string;
  department?: string;
  badgeNumber?: string;
  lastLoginAt?: string;
}

