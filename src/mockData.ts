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
  DepartmentMetric, 
  HospitalSettings,
  ClinicalDepartment,
  HealthArticle,
  PatientPortalMessage,
  VisitorGuideItem
} from './types';

export const INITIAL_HOSPITAL_SETTINGS: HospitalSettings = {
  name: 'St. Jude Integrated Medical Center',
  tagLine: 'Advanced Healthcare, Diagnostic Intelligence & Patient Excellence',
  hotline: '+1 (555) 000-911',
  email: 'ops@stjudes.org',
  address: '742 Healthcare Boulevard, Metro Health District, NY 10021',
  currency: 'USD ($)',
  taxRate: 8.5,
  timezone: 'America/New_York (EST)',
  bedCapacityAlert: 85,
  defaultRole: 'Admin',
  enableSoundAlerts: true
};

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'D1',
    name: 'Dr. Robert Chen',
    specialty: 'Cardiology',
    rating: 4.9,
    experience: 14,
    patientsCount: 1420,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=256&auto=format&fit=crop',
    status: 'On Duty',
    email: 'robert.chen@stjudes.org',
    phone: '+1 (555) 234-5678',
    department: 'Cardiovascular Medicine',
    qualifications: 'MD, FACC, Harvard Medical School',
    bio: 'Board-certified cardiologist specializing in interventional cardiac procedures, coronary artery disease management, and advanced preventive cardiology.',
    schedule: [
      {
        date: '2026-05-21',
        slots: [
          { time: '09:00 AM', isBooked: true, bookedBy: 'James Cooper' },
          { time: '10:00 AM', isBooked: false },
          { time: '11:00 AM', isBooked: true, bookedBy: 'Beatrice Vance' },
          { time: '02:00 PM', isBooked: false },
          { time: '03:00 PM', isBooked: false },
          { time: '04:00 PM', isBooked: true }
        ]
      },
      {
        date: '2026-05-22',
        slots: [
          { time: '09:00 AM', isBooked: false },
          { time: '10:00 AM', isBooked: false },
          { time: '11:00 AM', isBooked: false },
          { time: '02:00 PM', isBooked: false }
        ]
      }
    ]
  },
  {
    id: 'D2',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Neurology',
    rating: 4.8,
    experience: 11,
    patientsCount: 980,
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=256&auto=format&fit=crop',
    status: 'In Surgery',
    email: 'sarah.jenkins@stjudes.org',
    phone: '+1 (555) 345-6789',
    department: 'Neurological Sciences',
    qualifications: 'MD, PhD, Johns Hopkins Medicine',
    bio: 'Renowned clinical neurologist and neuro-researcher focused on electrophysiology, stroke rehabilitation, and treating epilepsy disorders.',
    schedule: [
      {
        date: '2026-05-21',
        slots: [
          { time: '09:00 AM', isBooked: true },
          { time: '10:00 AM', isBooked: true },
          { time: '11:00 AM', isBooked: false },
          { time: '02:00 PM', isBooked: true }
        ]
      },
      {
        date: '2026-05-22',
        slots: [
          { time: '09:00 AM', isBooked: false },
          { time: '10:00 AM', isBooked: false }
        ]
      }
    ]
  },
  {
    id: 'D3',
    name: 'Dr. Elena Rostova',
    specialty: 'Oncology',
    rating: 4.9,
    experience: 18,
    patientsCount: 1850,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop',
    status: 'On Duty',
    email: 'elena.rostova@stjudes.org',
    phone: '+1 (555) 456-7890',
    department: 'Clinical Oncology & Hematology',
    qualifications: 'MD, MSKCC Fellowship, Oxford Univ',
    bio: 'Dedicated hematologist and clinical oncologist specializing in personalized immunotherapy paths and complex oncology care protocols.',
    schedule: [
      {
        date: '2026-05-21',
        slots: [
          { time: '09:00 AM', isBooked: false },
          { time: '10:30 AM', isBooked: true },
          { time: '01:00 PM', isBooked: false },
          { time: '03:30 PM', isBooked: false }
        ]
      }
    ]
  },
  {
    id: 'D4',
    name: 'Dr. Marcus Vance',
    specialty: 'Emergency',
    rating: 4.7,
    experience: 9,
    patientsCount: 3200,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=256&auto=format&fit=crop',
    status: 'On Duty',
    email: 'marcus.vance@stjudes.org',
    phone: '+1 (555) 567-8901',
    department: 'Emergency & Trauma Services',
    qualifications: 'MD, FACEP, UCLA Medical Center',
    bio: 'Lead emergency trauma surgeon specializing in rapid resuscitation, acute cardiac events, polytrauma triage, and toxicological emergencies.',
    schedule: [
      {
        date: '2026-05-21',
        slots: [
          { time: '08:00 AM', isBooked: true },
          { time: '09:00 AM', isBooked: true },
          { time: '11:30 AM', isBooked: false },
          { time: '01:30 PM', isBooked: false }
        ]
      }
    ]
  },
  {
    id: 'D5',
    name: 'Dr. Priya Patel',
    specialty: 'Pediatrics',
    rating: 4.95,
    experience: 12,
    patientsCount: 1640,
    image: 'https://images.unsplash.com/photo-1594824813686-ec36940f5a77?q=80&w=256&auto=format&fit=crop',
    status: 'On Duty',
    email: 'priya.patel@stjudes.org',
    phone: '+1 (555) 678-9012',
    department: 'Pediatric & Neonatal Medicine',
    qualifications: 'MD, FAAP, Stanford University',
    bio: 'Pediatric care expert focused on developmental milestones, asthma management, childhood immunology, and neonatal acute care.',
    schedule: [
      {
        date: '2026-05-21',
        slots: [
          { time: '09:30 AM', isBooked: false },
          { time: '11:00 AM', isBooked: true },
          { time: '02:00 PM', isBooked: false },
          { time: '04:00 PM', isBooked: false }
        ]
      }
    ]
  },
  {
    id: 'D6',
    name: 'Dr. Arthur Mitchell',
    specialty: 'Internal Medicine',
    rating: 4.85,
    experience: 16,
    patientsCount: 2100,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=256&auto=format&fit=crop',
    status: 'On Duty',
    email: 'arthur.mitchell@stjudes.org',
    phone: '+1 (555) 789-0123',
    department: 'Internal Medicine & Geriatrics',
    qualifications: 'MD, FACP, Mayo Clinic Alum',
    bio: 'Comprehensive diagnostician dealing with multi-system chronic illnesses, metabolic disorders, hypertension, and complex polypharmacy cases.',
    schedule: [
      {
        date: '2026-05-21',
        slots: [
          { time: '10:00 AM', isBooked: true },
          { time: '01:00 PM', isBooked: false },
          { time: '03:00 PM', isBooked: false }
        ]
      }
    ]
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'P1',
    name: 'James Cooper',
    age: 48,
    dob: '1978-04-12',
    gender: 'Male',
    bloodType: 'A+',
    insurance: 'BlueCross Comprehensive',
    policyNumber: 'BC-98421098',
    phone: '+1 (555) 890-1234',
    email: 'james.cooper@email.com',
    address: '142 Maplewood Terrace, Riverdale, NY',
    emergencyContact: {
      name: 'Eleanor Cooper',
      relationship: 'Spouse',
      phone: '+1 (555) 890-5678'
    },
    condition: 'Hypertension Stage II & Angina',
    status: 'Admitted',
    room: 'Cardiology Ward - Bed 302A',
    bedId: 'BED-302A',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    immunizations: ['COVID-19 Booster (2025)', 'Influenza (2025)', 'Tetanus/Tdap (2023)'],
    admittedDate: '2026-05-19',
    primaryDoctor: 'Dr. Robert Chen',
    vitalsHistory: [
      {
        id: 'VIT-101',
        date: '2026-05-21',
        time: '08:30 AM',
        bloodPressure: '138/88',
        heartRate: 74,
        respRate: 16,
        temperature: 98.6,
        spO2: 98,
        glucose: 104,
        weight: 84.5,
        height: 180,
        bmi: 26.1,
        recordedBy: 'Nurse Clara Oswald',
        notes: 'BP stabilizing post-titration of Amlodipine.',
        status: 'Normal'
      },
      {
        id: 'VIT-102',
        date: '2026-05-20',
        time: '08:00 PM',
        bloodPressure: '152/96',
        heartRate: 88,
        respRate: 18,
        temperature: 99.1,
        spO2: 96,
        glucose: 118,
        weight: 84.8,
        recordedBy: 'Nurse Clara Oswald',
        notes: 'Evening peak noted; administered secondary dose.',
        status: 'Warning'
      }
    ],
    labTests: [
      {
        id: 'LAB-201',
        patientId: 'P1',
        patientName: 'James Cooper',
        doctorName: 'Dr. Robert Chen',
        testName: 'Lipid Panel & Troponin I',
        category: 'Biochemistry',
        date: '2026-05-20',
        status: 'Completed',
        priority: 'Routine',
        results: 'Troponin I: <0.02 ng/mL (Normal). Total Chol: 215 mg/dL, LDL: 135 mg/dL.',
        normalRange: 'Troponin <0.04 ng/mL, LDL <100 mg/dL',
        flags: 'Abnormal',
        cost: 160
      },
      {
        id: 'LAB-202',
        patientId: 'P1',
        patientName: 'James Cooper',
        doctorName: 'Dr. Robert Chen',
        testName: '12-Lead Electrocardiogram (ECG)',
        category: 'Cardiology',
        date: '2026-05-21',
        status: 'Completed',
        priority: 'Urgent',
        results: 'Sinus rhythm with mild LVH pattern. No acute ST-elevation.',
        normalRange: 'Normal Sinus Rhythm',
        flags: 'Normal',
        cost: 220
      }
    ],
    history: [
      {
        id: 'REC-1',
        date: '2026-05-21',
        diagnosis: 'Essential Hypertension with exertional angina pectoris',
        treatment: 'Amlodipine 5mg QD + Atorvastatin 20mg QHS titration',
        doctor: 'Dr. Robert Chen',
        department: 'Cardiology',
        prescriptions: [
          { medication: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (morning)', duration: '30 days', instructions: 'Take with water before breakfast' },
          { medication: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily (night)', duration: '30 days', instructions: 'Take after dinner' }
        ],
        notes: 'Patient reports reduced chest tightness. Echocardiogram reveals LVEF 58%. Continue telemetry monitoring.'
      }
    ]
  },
  {
    id: 'P2',
    name: 'Alice Miller',
    age: 34,
    dob: '1992-08-25',
    gender: 'Female',
    bloodType: 'O+',
    insurance: 'Aetna Health Platinum',
    policyNumber: 'AET-443912',
    phone: '+1 (555) 901-2345',
    email: 'alice.miller@email.com',
    address: '88 Oakridge Drive, Brooklyn, NY',
    emergencyContact: {
      name: 'David Miller',
      relationship: 'Brother',
      phone: '+1 (555) 901-7788'
    },
    condition: 'Refractory Migraine with Aura',
    status: 'Outpatient',
    room: 'Outpatient Clinic B',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
    allergies: ['NSAIDs (Ibuprofen, Aspirin)'],
    immunizations: ['COVID-19 Full', 'MMR', 'Hepatitis B'],
    admittedDate: '2026-05-21',
    primaryDoctor: 'Dr. Sarah Jenkins',
    vitalsHistory: [
      {
        id: 'VIT-103',
        date: '2026-05-21',
        time: '09:15 AM',
        bloodPressure: '118/76',
        heartRate: 72,
        respRate: 14,
        temperature: 98.4,
        spO2: 99,
        glucose: 92,
        weight: 62.0,
        height: 168,
        bmi: 22.0,
        recordedBy: 'Nurse Emily Stone',
        notes: 'Vitals stable. Mild photophobia noted.',
        status: 'Normal'
      }
    ],
    labTests: [
      {
        id: 'LAB-203',
        patientId: 'P2',
        patientName: 'Alice Miller',
        doctorName: 'Dr. Sarah Jenkins',
        testName: 'MRI Brain with Contrast',
        category: 'Radiology',
        date: '2026-05-18',
        status: 'Completed',
        priority: 'Routine',
        results: 'No intracranial space-occupying lesion or acute infarct. Mild microvascular changes.',
        normalRange: 'Normal intracranial anatomy',
        flags: 'Normal',
        cost: 850
      }
    ],
    history: [
      {
        id: 'REC-2',
        date: '2026-05-21',
        diagnosis: 'Vestibular Migraine with visual scintilla',
        treatment: 'Sumatriptan 50mg PRN + Topiramate prophylaxis',
        doctor: 'Dr. Sarah Jenkins',
        department: 'Neurology',
        prescriptions: [
          { medication: 'Sumatriptan', dosage: '50mg', frequency: 'At onset of migraine', duration: '9 tablets', instructions: 'Max 200mg in 24 hours' }
        ],
        notes: 'Patient instructed on visual aura triggers and sleep hygiene protocol.'
      }
    ]
  },
  {
    id: 'P3',
    name: 'Michael Zhang',
    age: 62,
    dob: '1964-11-03',
    gender: 'Male',
    bloodType: 'B+',
    insurance: 'Medicare Plus Advantage',
    policyNumber: 'MED-7718290',
    phone: '+1 (555) 012-3456',
    email: 'm.zhang@email.com',
    address: '304 Elmwood Ave, Queens, NY',
    emergencyContact: {
      name: 'Lin Zhang',
      relationship: 'Daughter',
      phone: '+1 (555) 012-9900'
    },
    condition: 'Post-CABG Recovery & Type 2 Diabetes',
    status: 'Admitted',
    room: 'ICU Ward - Bed 101',
    bedId: 'BED-101',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
    allergies: ['Latex'],
    immunizations: ['Pneumococcal (PCV13)', 'COVID-19 Updated', 'Shingles (Shingrix)'],
    admittedDate: '2026-05-17',
    primaryDoctor: 'Dr. Robert Chen',
    vitalsHistory: [
      {
        id: 'VIT-104',
        date: '2026-05-21',
        time: '08:00 AM',
        bloodPressure: '124/82',
        heartRate: 78,
        respRate: 16,
        temperature: 98.7,
        spO2: 97,
        glucose: 142,
        weight: 78.2,
        height: 173,
        bmi: 26.1,
        recordedBy: 'Nurse Marcus Cole',
        notes: 'Post-op Day 4. Sternal incision healing well, clean & dry.',
        status: 'Normal'
      }
    ],
    labTests: [
      {
        id: 'LAB-204',
        patientId: 'P3',
        patientName: 'Michael Zhang',
        doctorName: 'Dr. Robert Chen',
        testName: 'Comprehensive Metabolic Panel (CMP)',
        category: 'Biochemistry',
        date: '2026-05-20',
        status: 'Completed',
        priority: 'Routine',
        results: 'Creatinine: 1.1 mg/dL, BUN: 18 mg/dL, Fasting Glucose: 138 mg/dL, eGFR: >60 mL/min.',
        normalRange: 'Creatinine 0.7-1.3, Glucose 70-99',
        flags: 'Abnormal',
        cost: 145
      }
    ],
    history: [
      {
        id: 'REC-3',
        date: '2026-05-19',
        diagnosis: 'Coronary Artery Bypass Graft (CABG x3) Post-Op Day 2',
        treatment: 'Aspirin 81mg, Metformin 500mg, Ceftriaxone 1g IV',
        doctor: 'Dr. Robert Chen',
        department: 'Cardiology',
        prescriptions: [
          { medication: 'Aspirin Cardio', dosage: '81mg', frequency: 'Once daily', duration: '90 days' },
          { medication: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: '60 days' },
          { medication: 'Ceftriaxone', dosage: '1g IV', frequency: 'Every 24 hours', duration: '5 days' }
        ],
        notes: 'Extubated smoothly. Cardiac telemetry shows regular sinus rhythm.'
      }
    ]
  },
  {
    id: 'P4',
    name: 'Sophia Rodriguez',
    age: 8,
    dob: '2018-03-15',
    gender: 'Female',
    bloodType: 'O-',
    insurance: 'UnitedHealthcare Community',
    policyNumber: 'UHC-1092837',
    phone: '+1 (555) 123-4567',
    email: 'm.rodriguez.parent@email.com',
    address: '512 Sunrise Blvd, Staten Island, NY',
    emergencyContact: {
      name: 'Maria Rodriguez',
      relationship: 'Mother',
      phone: '+1 (555) 123-9988'
    },
    condition: 'Acute Pediatric Asthma Exacerbation',
    status: 'Admitted',
    room: 'Pediatrics Ward - Bed 201',
    bedId: 'BED-201',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=256&auto=format&fit=crop',
    allergies: ['Peanuts', 'Tree Nuts'],
    immunizations: ['Full Pediatric Vaccination Schedule (CDC compliant)'],
    admittedDate: '2026-05-20',
    primaryDoctor: 'Dr. Priya Patel',
    vitalsHistory: [
      {
        id: 'VIT-105',
        date: '2026-05-21',
        time: '08:45 AM',
        bloodPressure: '102/65',
        heartRate: 98,
        respRate: 22,
        temperature: 99.0,
        spO2: 97,
        weight: 27.5,
        height: 128,
        bmi: 16.8,
        recordedBy: 'Nurse Laura Gomez',
        notes: 'Wheezing decreased significantly post-nebulizer.',
        status: 'Normal'
      }
    ],
    labTests: [
      {
        id: 'LAB-205',
        patientId: 'P4',
        patientName: 'Sophia Rodriguez',
        doctorName: 'Dr. Priya Patel',
        testName: 'Pediatric Chest X-Ray (AP/Lateral)',
        category: 'Radiology',
        date: '2026-05-20',
        status: 'Completed',
        priority: 'STAT',
        results: 'Bilateral hyperinflation consistent with reactive airway disease. No focal consolidation or pneumothorax.',
        normalRange: 'Clear lung fields',
        flags: 'Normal',
        cost: 210
      }
    ],
    history: [
      {
        id: 'REC-4',
        date: '2026-05-20',
        diagnosis: 'Moderate Persistent Asthma with Acute Exacerbation',
        treatment: 'Albuterol Nebulization Q4H + Prednisolone oral solution',
        doctor: 'Dr. Priya Patel',
        department: 'Pediatrics',
        prescriptions: [
          { medication: 'Albuterol Inhaler', dosage: '90mcg/puff', frequency: '2 puffs Q4H PRN', duration: '30 days' },
          { medication: 'Prednisolone', dosage: '15mg/5mL', frequency: 'Once daily for 5 days', duration: '5 days' }
        ],
        notes: 'SpO2 maintained at 97% on room air. Plan for discharge in 24 hours if stable.'
      }
    ]
  },
  {
    id: 'P5',
    name: 'Beatrice Vance',
    age: 55,
    dob: '1971-09-14',
    gender: 'Female',
    bloodType: 'AB+',
    insurance: 'Cigna Global Health',
    policyNumber: 'CG-8829104',
    phone: '+1 (555) 234-9876',
    email: 'b.vance@vancerealty.com',
    address: '12 Central Park West, Penthouse 4, NY',
    emergencyContact: {
      name: 'Harold Vance',
      relationship: 'Spouse',
      phone: '+1 (555) 234-0011'
    },
    condition: 'Breast Neoplasm Follow-up & Infusion Protocol',
    status: 'Outpatient',
    room: 'Infusion Suite 4',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    allergies: ['Contrast Dye (Iodine)'],
    immunizations: ['COVID-19', 'Influenza', 'Hepatitis A/B'],
    admittedDate: '2026-05-21',
    primaryDoctor: 'Dr. Elena Rostova',
    vitalsHistory: [
      {
        id: 'VIT-106',
        date: '2026-05-21',
        time: '10:00 AM',
        bloodPressure: '126/80',
        heartRate: 76,
        respRate: 15,
        temperature: 98.6,
        spO2: 99,
        weight: 66.0,
        height: 165,
        bmi: 24.2,
        recordedBy: 'Nurse Kendra Bailey',
        notes: 'Pre-infusion check passed. ANC adequate.',
        status: 'Normal'
      }
    ],
    labTests: [
      {
        id: 'LAB-206',
        patientId: 'P5',
        patientName: 'Beatrice Vance',
        doctorName: 'Dr. Elena Rostova',
        testName: 'Complete Blood Count (CBC) with Differential',
        category: 'Hematology',
        date: '2026-05-21',
        status: 'Completed',
        priority: 'Routine',
        results: 'WBC: 6.4 x10^3/uL, ANC: 3.8 x10^3/uL, Hemoglobin: 12.2 g/dL, Platelets: 240 x10^3/uL.',
        normalRange: 'WBC 4.5-11.0, ANC >1.5',
        flags: 'Normal',
        cost: 95
      }
    ],
    history: [
      {
        id: 'REC-5',
        date: '2026-05-21',
        diagnosis: 'Stage IIA Invasive Ductal Carcinoma, ER+/PR+, HER2- (Maintenance)',
        treatment: 'Trastuzumab Infusion + Anastrozole 1mg daily',
        doctor: 'Dr. Elena Rostova',
        department: 'Oncology',
        prescriptions: [
          { medication: 'Anastrozole', dosage: '1mg', frequency: 'Once daily', duration: '90 days' },
          { medication: 'Ondansetron', dosage: '8mg', frequency: 'Before infusion PRN', duration: '10 tablets' }
        ],
        notes: 'Cycle 8 of maintenance therapy tolerated with zero adverse reactions.'
      }
    ]
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'A1',
    patientId: 'P1',
    patientName: 'James Cooper',
    doctorId: 'D1',
    doctorName: 'Dr. Robert Chen',
    date: '2026-05-21',
    time: '09:00 AM',
    specialty: 'Cardiology',
    type: 'In-Person',
    status: 'Completed',
    reason: 'Routine ECG check and blood pressure evaluation',
    notes: 'ECG normal, BP 138/88. Continue current medication regimen.',
    isUrgent: false,
    insuranceClaimStatus: 'Approved',
    consultationFee: 250,
    isBilled: true
  },
  {
    id: 'A2',
    patientId: 'P2',
    patientName: 'Alice Miller',
    doctorId: 'D2',
    doctorName: 'Dr. Sarah Jenkins',
    date: '2026-05-21',
    time: '10:00 AM',
    specialty: 'Neurology',
    type: 'In-Person',
    status: 'Scheduled',
    reason: 'Persistent vestibular migraine review and brain MRI interpretation',
    notes: 'Patient bringing previous scans.',
    isUrgent: false,
    insuranceClaimStatus: 'Pending',
    consultationFee: 280,
    isBilled: false
  },
  {
    id: 'A3',
    patientId: 'P4',
    patientName: 'Sophia Rodriguez',
    doctorId: 'D5',
    doctorName: 'Dr. Priya Patel',
    date: '2026-05-21',
    time: '11:00 AM',
    specialty: 'Pediatrics',
    type: 'In-Person',
    status: 'Scheduled',
    reason: 'Pediatric post-admission asthma check and spirometry test',
    notes: 'Parent reports good recovery with inhaler.',
    isUrgent: false,
    insuranceClaimStatus: 'Pending',
    consultationFee: 220,
    isBilled: false
  },
  {
    id: 'A4',
    patientId: 'P5',
    patientName: 'Beatrice Vance',
    doctorId: 'D3',
    doctorName: 'Dr. Elena Rostova',
    date: '2026-05-21',
    time: '10:30 AM',
    specialty: 'Oncology',
    type: 'In-Person',
    status: 'Completed',
    reason: 'Monthly oncology maintenance cycle review and blood markers',
    notes: 'ANC levels within safe threshold. Cleared for scheduled infusion.',
    isUrgent: false,
    insuranceClaimStatus: 'Approved',
    consultationFee: 320,
    isBilled: true
  },
  {
    id: 'A5',
    patientId: 'P3',
    patientName: 'Michael Zhang',
    doctorId: 'D1',
    doctorName: 'Dr. Robert Chen',
    date: '2026-05-21',
    time: '04:00 PM',
    specialty: 'Cardiology',
    type: 'In-Person',
    status: 'Scheduled',
    reason: 'ICU Post-CABG recovery assessment and telemetry sign-off',
    notes: 'Check chest tube drain site and sternal stability.',
    isUrgent: true,
    insuranceClaimStatus: 'Pending',
    consultationFee: 350,
    isBilled: false
  },
  {
    id: 'A6',
    patientId: 'P2',
    patientName: 'Alice Miller',
    doctorId: 'D6',
    doctorName: 'Dr. Arthur Mitchell',
    date: '2026-05-22',
    time: '10:00 AM',
    specialty: 'Internal Medicine',
    type: 'Telehealth Video',
    status: 'Scheduled',
    reason: 'Remote tele-consultation on metabolic blood panel and nutrition counseling',
    notes: 'Video link sent to patient email.',
    isUrgent: false,
    insuranceClaimStatus: 'Pending',
    consultationFee: 180,
    isBilled: false
  },
  {
    id: 'A7',
    patientId: 'P1',
    patientName: 'James Cooper',
    doctorId: 'D7',
    doctorName: 'Dr. David Kim',
    date: '2026-05-04',
    time: '02:00 PM',
    specialty: 'Orthopedics',
    type: 'In-Person',
    status: 'Completed',
    reason: 'Right knee arthroscopy follow-up and physical therapy progress',
    notes: 'Range of motion improved by 25 degrees. Continue strengthening exercises.',
    isUrgent: false,
    insuranceClaimStatus: 'Approved',
    consultationFee: 240,
    isBilled: true
  },
  {
    id: 'A8',
    patientId: 'P3',
    patientName: 'Michael Zhang',
    doctorId: 'D1',
    doctorName: 'Dr. Robert Chen',
    date: '2026-05-08',
    time: '09:30 AM',
    specialty: 'Cardiology',
    type: 'In-Person',
    status: 'Completed',
    reason: 'Pre-operative cardiac clearance and coronary angiogram review',
    notes: 'Triple vessel disease confirmed. Scheduled for CABG surgery.',
    isUrgent: true,
    insuranceClaimStatus: 'Approved',
    consultationFee: 320,
    isBilled: true
  },
  {
    id: 'A9',
    patientId: 'P4',
    patientName: 'Sophia Rodriguez',
    doctorId: 'D5',
    doctorName: 'Dr. Priya Patel',
    date: '2026-05-12',
    time: '11:30 AM',
    specialty: 'Pediatrics',
    type: 'In-Person',
    status: 'Completed',
    reason: 'Routine pediatric growth milestone and vaccination booster',
    notes: 'MMR booster administered without immediate reaction.',
    isUrgent: false,
    insuranceClaimStatus: 'Approved',
    consultationFee: 190,
    isBilled: true
  },
  {
    id: 'A10',
    patientId: 'P5',
    patientName: 'Beatrice Vance',
    doctorId: 'D3',
    doctorName: 'Dr. Elena Rostova',
    date: '2026-05-15',
    time: '01:00 PM',
    specialty: 'Oncology',
    type: 'In-Person',
    status: 'Completed',
    reason: 'Infusion cycle 7 tolerance check and renal panel monitoring',
    notes: 'Liver and renal function within normal limits.',
    isUrgent: false,
    insuranceClaimStatus: 'Approved',
    consultationFee: 290,
    isBilled: true
  },
  {
    id: 'A11',
    patientId: 'P2',
    patientName: 'Alice Miller',
    doctorId: 'D2',
    doctorName: 'Dr. Sarah Jenkins',
    date: '2026-05-18',
    time: '03:00 PM',
    specialty: 'Neurology',
    type: 'Telehealth Video',
    status: 'Completed',
    reason: 'Virtual migraine diary review and dosage adjustment for Topiramate',
    notes: 'Frequency of aura episodes decreased from 4x to 1x weekly.',
    isUrgent: false,
    insuranceClaimStatus: 'Approved',
    consultationFee: 210,
    isBilled: true
  },
  {
    id: 'A12',
    patientId: 'P1',
    patientName: 'James Cooper',
    doctorId: 'D6',
    doctorName: 'Dr. Arthur Mitchell',
    date: '2026-05-20',
    time: '08:30 AM',
    specialty: 'Internal Medicine',
    type: 'In-Person',
    status: 'Completed',
    reason: 'Annual comprehensive health checkup and lipid panel testing',
    notes: 'Recommended low-sodium Mediterranean diet. Re-check LDL in 6 months.',
    isUrgent: false,
    insuranceClaimStatus: 'Approved',
    consultationFee: 220,
    isBilled: true
  },
  {
    id: 'A13',
    patientId: 'P3',
    patientName: 'Michael Zhang',
    doctorId: 'D6',
    doctorName: 'Dr. Arthur Mitchell',
    date: '2026-05-23',
    time: '11:00 AM',
    specialty: 'Internal Medicine',
    type: 'In-Person',
    status: 'Scheduled',
    reason: 'Post-discharge diabetic insulin management and wound dressing inspection',
    notes: 'Fasting glucose logs to be reviewed.',
    isUrgent: false,
    insuranceClaimStatus: 'Pending',
    consultationFee: 200,
    isBilled: false
  },
  {
    id: 'A14',
    patientId: 'P4',
    patientName: 'Sophia Rodriguez',
    doctorId: 'D2',
    doctorName: 'Dr. Sarah Jenkins',
    date: '2026-05-25',
    time: '02:30 PM',
    specialty: 'Neurology',
    type: 'In-Person',
    status: 'Scheduled',
    reason: 'Pediatric sleep study and night terror neurological evaluation',
    notes: 'Sleep diary provided by parents.',
    isUrgent: false,
    insuranceClaimStatus: 'Pending',
    consultationFee: 260,
    isBilled: false
  },
  {
    id: 'A15',
    patientId: 'P5',
    patientName: 'Beatrice Vance',
    doctorId: 'D1',
    doctorName: 'Dr. Robert Chen',
    date: '2026-05-27',
    time: '10:00 AM',
    specialty: 'Cardiology',
    type: 'Telehealth Video',
    status: 'Scheduled',
    reason: 'Cardio-oncology surveillance echocardiogram interpretation',
    notes: 'Monitoring left ventricular ejection fraction during HER2 targeted therapy.',
    isUrgent: false,
    insuranceClaimStatus: 'Pending',
    consultationFee: 280,
    isBilled: false
  },
  {
    id: 'A16',
    patientId: 'P1',
    patientName: 'James Cooper',
    doctorId: 'D1',
    doctorName: 'Dr. Robert Chen',
    date: '2026-05-29',
    time: '09:00 AM',
    specialty: 'Cardiology',
    type: 'In-Person',
    status: 'Scheduled',
    reason: '24-hour Holter monitor hook-up and arrhythmic evaluation',
    notes: 'Patient reported occasional palpitations after morning coffee.',
    isUrgent: false,
    insuranceClaimStatus: 'Pending',
    consultationFee: 310,
    isBilled: false
  },
  {
    id: 'A17',
    patientId: 'P2',
    patientName: 'Alice Miller',
    doctorId: 'D7',
    doctorName: 'Dr. David Kim',
    date: '2026-06-02',
    time: '01:30 PM',
    specialty: 'Orthopedics',
    type: 'In-Person',
    status: 'Scheduled',
    reason: 'Cervical spine posture assessment and neck pain ergonomic review',
    notes: 'Ergonomic workstation recommendations requested.',
    isUrgent: false,
    insuranceClaimStatus: 'Pending',
    consultationFee: 230,
    isBilled: false
  },
  {
    id: 'A18',
    patientId: 'P4',
    patientName: 'Sophia Rodriguez',
    doctorId: 'D5',
    doctorName: 'Dr. Priya Patel',
    date: '2026-06-05',
    time: '10:00 AM',
    specialty: 'Pediatrics',
    type: 'In-Person',
    status: 'Scheduled',
    reason: 'Seasonal allergy immunotherapy skin prick evaluation',
    notes: 'Avoid antihistamines 48 hours prior to test.',
    isUrgent: false,
    insuranceClaimStatus: 'Pending',
    consultationFee: 250,
    isBilled: false
  }
];

export const INITIAL_BEDS: BedAlloc[] = [
  { id: 'B1', type: 'ICU', total: 24, occupied: 21, available: 3 },
  { id: 'B2', type: 'Emergency', total: 40, occupied: 34, available: 6 },
  { id: 'B3', type: 'General', total: 120, occupied: 88, available: 32 },
  { id: 'B4', type: 'Pediatric', total: 30, occupied: 19, available: 11 },
  { id: 'B5', type: 'Neonatal Care', total: 16, occupied: 12, available: 4 },
  { id: 'B6', type: 'Maternity', total: 25, occupied: 18, available: 7 }
];

export const INITIAL_WARD_BEDS: WardBed[] = [
  { id: 'BED-101', bedNumber: 'ICU-101', ward: 'ICU', status: 'Occupied', patientId: 'P3', patientName: 'Michael Zhang', admittedDate: '2026-05-17', attendingDoctor: 'Dr. Robert Chen', nurseAssigned: 'Nurse Marcus Cole', dailyRate: 1800, condition: 'Post-CABG Day 4' },
  { id: 'BED-102', bedNumber: 'ICU-102', ward: 'ICU', status: 'Occupied', patientId: 'P901', patientName: 'Gregory House', admittedDate: '2026-05-19', attendingDoctor: 'Dr. Marcus Vance', nurseAssigned: 'Nurse Marcus Cole', dailyRate: 1800, condition: 'Severe Sepsis' },
  { id: 'BED-103', bedNumber: 'ICU-103', ward: 'ICU', status: 'Available', dailyRate: 1800 },
  { id: 'BED-104', bedNumber: 'ICU-104', ward: 'ICU', status: 'Sanitizing', dailyRate: 1800 },

  { id: 'BED-201', bedNumber: 'PED-201', ward: 'Pediatrics', status: 'Occupied', patientId: 'P4', patientName: 'Sophia Rodriguez', admittedDate: '2026-05-20', attendingDoctor: 'Dr. Priya Patel', nurseAssigned: 'Nurse Laura Gomez', dailyRate: 750, condition: 'Acute Asthma' },
  { id: 'BED-202', bedNumber: 'PED-202', ward: 'Pediatrics', status: 'Available', dailyRate: 750 },
  { id: 'BED-203', bedNumber: 'PED-203', ward: 'Pediatrics', status: 'Occupied', patientId: 'P902', patientName: 'Leo Walker (4yo)', admittedDate: '2026-05-21', attendingDoctor: 'Dr. Priya Patel', nurseAssigned: 'Nurse Laura Gomez', dailyRate: 750, condition: 'Bronchiolitis' },

  { id: 'BED-301', bedNumber: 'GEN-301', ward: 'General Ward (3F)', status: 'Available', dailyRate: 500 },
  { id: 'BED-302A', bedNumber: 'GEN-302A', ward: 'General Ward (3F)', status: 'Occupied', patientId: 'P1', patientName: 'James Cooper', admittedDate: '2026-05-19', attendingDoctor: 'Dr. Robert Chen', nurseAssigned: 'Nurse Clara Oswald', dailyRate: 500, condition: 'Hypertension Stage II' },
  { id: 'BED-302B', bedNumber: 'GEN-302B', ward: 'General Ward (3F)', status: 'Occupied', patientId: 'P903', patientName: 'Walter Bishop', admittedDate: '2026-05-18', attendingDoctor: 'Dr. Arthur Mitchell', nurseAssigned: 'Nurse Clara Oswald', dailyRate: 500, condition: 'Pneumonia Recovery' },
  { id: 'BED-303', bedNumber: 'GEN-303', ward: 'General Ward (3F)', status: 'Available', dailyRate: 500 },
  { id: 'BED-304', bedNumber: 'GEN-304', ward: 'General Ward (3F)', status: 'Maintenance', dailyRate: 500 },

  { id: 'BED-ER-1', bedNumber: 'ER-BAY-01', ward: 'Emergency', status: 'Occupied', patientId: 'P-TR-101', patientName: 'Carlos Rivera', admittedDate: '2026-05-21', attendingDoctor: 'Dr. Marcus Vance', nurseAssigned: 'Nurse Tyler Brooks', dailyRate: 1200, condition: 'Motorcycle Trauma' },
  { id: 'BED-ER-2', bedNumber: 'ER-BAY-02', ward: 'Emergency', status: 'Occupied', patientId: 'P-TR-102', patientName: 'Hannah Abbott', admittedDate: '2026-05-21', attendingDoctor: 'Dr. Marcus Vance', nurseAssigned: 'Nurse Tyler Brooks', dailyRate: 1200, condition: 'Acute Anaphylaxis' },
  { id: 'BED-ER-3', bedNumber: 'ER-BAY-03', ward: 'Emergency', status: 'Available', dailyRate: 1200 },
  { id: 'BED-ER-4', bedNumber: 'ER-BAY-04', ward: 'Emergency', status: 'Sanitizing', dailyRate: 1200 },

  { id: 'BED-MAT-1', bedNumber: 'MAT-401', ward: 'Maternity', status: 'Occupied', patientId: 'P904', patientName: 'Emma Watson', admittedDate: '2026-05-20', attendingDoctor: 'Dr. Elena Rostova', nurseAssigned: 'Nurse Sarah Connor', dailyRate: 850, condition: 'Postpartum Observation' },
  { id: 'BED-MAT-2', bedNumber: 'MAT-402', ward: 'Maternity', status: 'Available', dailyRate: 850 }
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'MED-01',
    name: 'Amlodipine Besylate',
    genericName: 'Amlodipine',
    category: 'Cardiovascular',
    dosageForm: 'Tablet',
    strength: '5mg',
    inStock: 640,
    minThreshold: 150,
    unitPrice: 12.50,
    expiryDate: '2027-11-30',
    batchNumber: 'AML-2025-99B',
    manufacturer: 'Pfizer BioPharma',
    requiresPrescription: true
  },
  {
    id: 'MED-02',
    name: 'Atorvastatin Calcium',
    genericName: 'Atorvastatin',
    category: 'Cardiovascular',
    dosageForm: 'Tablet',
    strength: '20mg',
    inStock: 520,
    minThreshold: 120,
    unitPrice: 18.00,
    expiryDate: '2028-02-15',
    batchNumber: 'ATR-2025-14A',
    manufacturer: 'Viatris Healthcare',
    requiresPrescription: true
  },
  {
    id: 'MED-03',
    name: 'Ceftriaxone Sodium Injection',
    genericName: 'Ceftriaxone',
    category: 'Antibiotics',
    dosageForm: 'IV Infusion',
    strength: '1g/Vial',
    inStock: 185,
    minThreshold: 50,
    unitPrice: 45.00,
    expiryDate: '2027-08-20',
    batchNumber: 'CEF-2024-88C',
    manufacturer: 'Roche Pharmaceuticals',
    requiresPrescription: true
  },
  {
    id: 'MED-04',
    name: 'Albuterol Sulfate Inhalation Aerosol',
    genericName: 'Albuterol (Salbutamol)',
    category: 'Respiratory',
    dosageForm: 'Inhaler',
    strength: '90mcg/actuation',
    inStock: 95,
    minThreshold: 40,
    unitPrice: 32.00,
    expiryDate: '2027-05-10',
    batchNumber: 'ALB-2025-02D',
    manufacturer: 'GSK Respiratory',
    requiresPrescription: true
  },
  {
    id: 'MED-05',
    name: 'Morphine Sulfate Injection',
    genericName: 'Morphine Sulfate',
    category: 'Analgesics',
    dosageForm: 'Injection',
    strength: '10mg/mL',
    inStock: 35,
    minThreshold: 25,
    unitPrice: 28.50,
    expiryDate: '2026-12-31',
    batchNumber: 'MOR-2024-01X',
    manufacturer: 'Hospira Sterile',
    requiresPrescription: true
  },
  {
    id: 'MED-06',
    name: 'Epinephrine Auto-Injector (EpiPen)',
    genericName: 'Epinephrine',
    category: 'Emergency/IV',
    dosageForm: 'Injection',
    strength: '0.3mg',
    inStock: 48,
    minThreshold: 30,
    unitPrice: 110.00,
    expiryDate: '2027-04-30',
    batchNumber: 'EPI-2025-44Z',
    manufacturer: 'Mylan Specialty',
    requiresPrescription: true
  },
  {
    id: 'MED-07',
    name: 'Metformin Hydrochloride ER',
    genericName: 'Metformin',
    category: 'Antidiabetic',
    dosageForm: 'Tablet',
    strength: '500mg',
    inStock: 820,
    minThreshold: 200,
    unitPrice: 8.50,
    expiryDate: '2028-09-30',
    batchNumber: 'MET-2025-77R',
    manufacturer: 'Teva Generics',
    requiresPrescription: true
  },
  {
    id: 'MED-08',
    name: 'Sumatriptan Succinate',
    genericName: 'Sumatriptan',
    category: 'Analgesics',
    dosageForm: 'Tablet',
    strength: '50mg',
    inStock: 42, // Low stock indicator
    minThreshold: 50,
    unitPrice: 24.00,
    expiryDate: '2027-03-15',
    batchNumber: 'SUM-2024-19Q',
    manufacturer: 'Sun Pharma',
    requiresPrescription: true
  },
  {
    id: 'MED-09',
    name: 'Propofol Injectable Emulsion',
    genericName: 'Propofol (Diprivan)',
    category: 'Sedatives',
    dosageForm: 'IV Infusion',
    strength: '10mg/mL (20mL)',
    inStock: 22, // Low stock indicator
    minThreshold: 30,
    unitPrice: 65.00,
    expiryDate: '2026-10-15',
    batchNumber: 'PRF-2024-03A',
    manufacturer: 'Fresenius Kabi',
    requiresPrescription: true
  },
  {
    id: 'MED-10',
    name: 'Pantoprazole Sodium IV',
    genericName: 'Pantoprazole',
    category: 'Gastrointestinal',
    dosageForm: 'IV Infusion',
    strength: '40mg/Vial',
    inStock: 310,
    minThreshold: 80,
    unitPrice: 16.50,
    expiryDate: '2027-12-12',
    batchNumber: 'PAN-2025-88M',
    manufacturer: 'Sandoz',
    requiresPrescription: true
  }
];

export const INITIAL_PRESCRIPTION_ORDERS: PrescriptionOrder[] = [
  {
    id: 'RX-9001',
    patientId: 'P1',
    patientName: 'James Cooper',
    doctorId: 'D1',
    doctorName: 'Dr. Robert Chen',
    date: '2026-05-21',
    medications: [
      { medication: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (morning)', duration: '30 days', instructions: 'Take before breakfast' },
      { medication: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily (night)', duration: '30 days', instructions: 'Take after dinner' }
    ],
    status: 'Dispensed',
    priority: 'Routine',
    pharmacyNotes: 'Checked against penicillin allergy. Both meds safely dispensed in blister pack.',
    totalCost: 30.50,
    dispensedAt: '2026-05-21 09:45 AM',
    dispensedBy: 'Pharm. David Kim'
  },
  {
    id: 'RX-9002',
    patientId: 'P2',
    patientName: 'Alice Miller',
    doctorId: 'D2',
    doctorName: 'Dr. Sarah Jenkins',
    date: '2026-05-21',
    medications: [
      { medication: 'Sumatriptan', dosage: '50mg', frequency: 'PRN at onset', duration: '9 tablets', instructions: 'Take with full glass of water' }
    ],
    status: 'Pending Dispense',
    priority: 'Routine',
    pharmacyNotes: 'Verification pending prescription signature.',
    totalCost: 24.00
  },
  {
    id: 'RX-9003',
    patientId: 'P3',
    patientName: 'Michael Zhang',
    doctorId: 'D1',
    doctorName: 'Dr. Robert Chen',
    date: '2026-05-21',
    medications: [
      { medication: 'Ceftriaxone', dosage: '1g IV', frequency: 'Q24H', duration: '5 days', instructions: 'Slow IV push over 30 mins' },
      { medication: 'Metformin', dosage: '500mg', frequency: 'BID', duration: '60 days' }
    ],
    status: 'Pending Dispense',
    priority: 'STAT',
    pharmacyNotes: 'Inpatient ICU priority order.',
    totalCost: 53.50
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-001',
    invoiceNumber: 'INV-882101',
    patientId: 'P1',
    patientName: 'James Cooper',
    date: '2026-05-21',
    dueDate: '2026-06-20',
    items: [
      { id: 'ITM-1', description: 'Comprehensive Cardiology Consultation (Dr. Robert Chen)', category: 'Consultation', quantity: 1, unitPrice: 250, amount: 250 },
      { id: 'ITM-2', description: '12-Lead ECG with Rhythm Interpretation', category: 'Laboratory', quantity: 1, unitPrice: 220, amount: 220 },
      { id: 'ITM-3', description: 'Lipid Panel & Troponin I Bloodwork', category: 'Laboratory', quantity: 1, unitPrice: 160, amount: 160 },
      { id: 'ITM-4', description: 'Pharmacy Dispense (Amlodipine 5mg + Atorvastatin 20mg)', category: 'Pharmacy', quantity: 1, unitPrice: 30.50, amount: 30.50 },
      { id: 'ITM-5', description: 'Inpatient General Ward Care (2 Days @ $500/day)', category: 'Ward/Bed', quantity: 2, unitPrice: 500, amount: 1000 }
    ],
    subtotal: 1660.50,
    tax: 141.14,
    discount: 50.00,
    totalAmount: 1751.64,
    insuranceCovered: 1401.31, // 80% coverage
    patientPayable: 350.33,
    status: 'Claim Processing',
    paymentMethod: 'Insurance Direct',
    insuranceProvider: 'BlueCross Comprehensive',
    claimId: 'CLM-9901'
  },
  {
    id: 'INV-2026-002',
    invoiceNumber: 'INV-882102',
    patientId: 'P5',
    patientName: 'Beatrice Vance',
    date: '2026-05-21',
    dueDate: '2026-06-21',
    items: [
      { id: 'ITM-6', description: 'Oncology Specialist Assessment (Dr. Elena Rostova)', category: 'Consultation', quantity: 1, unitPrice: 320, amount: 320 },
      { id: 'ITM-7', description: 'Complete Blood Count (CBC) with Differential', category: 'Laboratory', quantity: 1, unitPrice: 95, amount: 95 },
      { id: 'ITM-8', description: 'Chemotherapy / Immunotherapy Infusion Suite Administration', category: 'Procedure', quantity: 1, unitPrice: 1200, amount: 1200 }
    ],
    subtotal: 1615.00,
    tax: 137.28,
    discount: 0,
    totalAmount: 1752.28,
    insuranceCovered: 1577.05, // 90% coverage
    patientPayable: 175.23,
    status: 'Paid',
    paymentMethod: 'Credit Card',
    insuranceProvider: 'Cigna Global Health',
    paidAt: '2026-05-21 11:30 AM'
  },
  {
    id: 'INV-2026-003',
    invoiceNumber: 'INV-882103',
    patientId: 'P3',
    patientName: 'Michael Zhang',
    date: '2026-05-20',
    dueDate: '2026-06-19',
    items: [
      { id: 'ITM-9', description: 'ICU Ward Bed & Telemetry Monitoring (4 Days @ $1800/day)', category: 'Ward/Bed', quantity: 4, unitPrice: 1800, amount: 7200 },
      { id: 'ITM-10', description: 'Comprehensive Metabolic Panel (CMP)', category: 'Laboratory', quantity: 1, unitPrice: 145, amount: 145 },
      { id: 'ITM-11', description: 'Post-Surgical Critical Care Attending Fee', category: 'Consultation', quantity: 1, unitPrice: 450, amount: 450 }
    ],
    subtotal: 7795.00,
    tax: 662.58,
    discount: 100.00,
    totalAmount: 8357.58,
    insuranceCovered: 6686.06, // 80% Medicare
    patientPayable: 1671.52,
    status: 'Pending',
    insuranceProvider: 'Medicare Plus Advantage'
  }
];

export const INITIAL_INSURANCE_CLAIMS: InsuranceClaim[] = [
  {
    id: 'CLM-9901',
    claimNumber: 'CLM-BC-2026-01',
    invoiceId: 'INV-2026-001',
    patientId: 'P1',
    patientName: 'James Cooper',
    provider: 'BlueCross Comprehensive',
    policyNumber: 'BC-98421098',
    totalBilled: 1751.64,
    amountClaimed: 1401.31,
    status: 'In Review',
    submittedDate: '2026-05-21',
    notes: 'Electronic claims EDI 837 batch transmitted. Awaiting adjudication code.'
  },
  {
    id: 'CLM-9902',
    claimNumber: 'CLM-CG-2026-04',
    invoiceId: 'INV-2026-002',
    patientId: 'P5',
    patientName: 'Beatrice Vance',
    provider: 'Cigna Global Health',
    policyNumber: 'CG-8829104',
    totalBilled: 1752.28,
    amountClaimed: 1577.05,
    amountApproved: 1577.05,
    status: 'Approved',
    submittedDate: '2026-05-21',
    decisionDate: '2026-05-21',
    notes: 'Pre-authorization #ONC-4491 verified. Remittance advice received.'
  },
  {
    id: 'CLM-9903',
    claimNumber: 'CLM-MED-2026-12',
    invoiceId: 'INV-2026-003',
    patientId: 'P3',
    patientName: 'Michael Zhang',
    provider: 'Medicare Plus Advantage',
    policyNumber: 'MED-7718290',
    totalBilled: 8357.58,
    amountClaimed: 6686.06,
    status: 'Submitted',
    submittedDate: '2026-05-20',
    notes: 'Inpatient surgical DRG-236 code submitted with operative report attached.'
  }
];

export const INITIAL_EMERGENCY_CASES: EmergencyCase[] = [
  {
    id: 'ER-01',
    traumaId: 'TR-2026-101',
    patientName: 'Carlos Rivera',
    age: 29,
    gender: 'Male',
    arrivalTime: '08:45 AM',
    triageLevel: 'Level 1 - Resuscitation (Red)',
    chiefComplaint: 'Motorcycle collision; multiple blunt trauma, suspected pelvic fracture & acute hypoxia.',
    vitals: {
      bp: '85/50',
      pulse: 128,
      spo2: 89,
      gcs: 10,
      temp: 97.8
    },
    assignedBay: 'Trauma Bay 1',
    attendingDoctor: 'Dr. Marcus Vance',
    status: 'In Trauma Bay',
    alertActive: true
  },
  {
    id: 'ER-02',
    traumaId: 'TR-2026-102',
    patientName: 'Hannah Abbott',
    age: 41,
    gender: 'Female',
    arrivalTime: '09:05 AM',
    triageLevel: 'Level 2 - Emergent (Orange)',
    chiefComplaint: 'Severe bee sting anaphylaxis; stridor, facial angioedema, refractory urticaria.',
    vitals: {
      bp: '95/60',
      pulse: 115,
      spo2: 93,
      gcs: 14,
      temp: 98.4
    },
    assignedBay: 'Trauma Bay 2',
    attendingDoctor: 'Dr. Marcus Vance',
    status: 'In Trauma Bay',
    alertActive: true
  },
  {
    id: 'ER-03',
    traumaId: 'TR-2026-103',
    patientName: 'Samuel Drake',
    age: 52,
    gender: 'Male',
    arrivalTime: '08:15 AM',
    triageLevel: 'Level 3 - Urgent (Yellow)',
    chiefComplaint: 'Acute right lower quadrant abdominal pain, rebound tenderness, high fever 102.4°F.',
    vitals: {
      bp: '130/84',
      pulse: 94,
      spo2: 98,
      gcs: 15,
      temp: 102.4
    },
    assignedBay: 'Acute Bay 4',
    attendingDoctor: 'Dr. Arthur Mitchell',
    status: 'Transferred to OR',
    alertActive: false
  },
  {
    id: 'ER-04',
    traumaId: 'TR-2026-104',
    patientName: 'Maya Lin',
    age: 23,
    gender: 'Female',
    arrivalTime: '09:30 AM',
    triageLevel: 'Level 4 - Less Urgent (Green)',
    chiefComplaint: 'Distal radius wrist fracture from rollerblading fall; neurovascular bundle intact.',
    vitals: {
      bp: '122/78',
      pulse: 82,
      spo2: 99,
      gcs: 15,
      temp: 98.6
    },
    assignedBay: 'Fast Track 1',
    attendingDoctor: 'Dr. Marcus Vance',
    status: 'In Trauma Bay',
    alertActive: false
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'N1',
    title: 'Code Blue Resuscitation Drill Cleared',
    description: 'Trauma ICU response time measured at 1.8 mins (Exceeds Hospital Benchmark).',
    time: '5 mins ago',
    type: 'Success',
    isRead: false,
    targetAudience: 'staff',
  },
  {
    id: 'N2',
    title: 'Critical Triage Inbound (Bay 1)',
    description: 'Ambulance 302 arriving with multi-trauma victim. Trauma surgeon paged.',
    time: '18 mins ago',
    type: 'Alert',
    isRead: false,
    targetAudience: 'staff',
  },
  {
    id: 'N3',
    title: 'Pharmacy Stock Alert: Sumatriptan',
    description: 'Sumatriptan 50mg inventory dropped below minimum threshold (42/50 left).',
    time: '42 mins ago',
    type: 'Info',
    isRead: false,
    targetAudience: 'staff',
  },
  {
    id: 'N4',
    title: 'Insurance Claim Auto-Approved',
    description: 'Cigna Global claim CLM-CG-2026-04 for Beatrice Vance approved ($1,577.05).',
    time: '1 hour ago',
    type: 'Success',
    isRead: true,
    targetAudience: 'admin',
  },
  {
    id: 'N5',
    title: 'Telehealth Video Session Confirmed',
    description: 'Dr. Arthur Mitchell has a scheduled tele-consultation with Alice Miller tomorrow.',
    time: '2 hours ago',
    type: 'Schedule',
    isRead: true,
    targetAudience: 'staff',
  }
];

export const SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'L1',
    timestamp: '2026-05-21 09:18:42',
    level: 'Info',
    message: 'Global Telemetry Matrix: 18 Bedside Ventilator interfaces active with 0 socket latency.',
    user: 'System Core'
  },
  {
    id: 'L2',
    timestamp: '2026-05-21 09:05:11',
    level: 'Warning',
    message: 'Emergency Triage: Trauma Bay 1 occupied by incoming Level 1 resuscitation protocol.',
    user: 'Dr. Marcus Vance'
  },
  {
    id: 'L3',
    timestamp: '2026-05-21 08:45:00',
    level: 'Info',
    message: 'Pharmacy Dispense Verified: Rx-9001 (Amlodipine, Atorvastatin) cleared for James Cooper.',
    user: 'Pharm. David Kim'
  },
  {
    id: 'L4',
    timestamp: '2026-05-21 08:30:19',
    level: 'Info',
    message: 'Inpatient Vitals Logged: James Cooper (Cardiology Ward 302A) BP recorded 138/88.',
    user: 'Nurse Clara Oswald'
  },
  {
    id: 'L5',
    timestamp: '2026-05-21 08:00:02',
    level: 'Info',
    message: 'Morning Shift Synchronization: 6 Senior Doctors & 14 Specialty Nurses marked On-Duty.',
    user: 'Admin Operations'
  }
];

export const DEPARTMENT_METRICS: DepartmentMetric[] = [
  { name: 'Cardiology', patientsCount: 420, growth: 12.4, occupancyRate: 91 },
  { name: 'Neurology', patientsCount: 280, growth: 8.1, occupancyRate: 78 },
  { name: 'Oncology', patientsCount: 340, growth: 15.3, occupancyRate: 85 },
  { name: 'Pediatrics', patientsCount: 210, growth: 5.6, occupancyRate: 63 },
  { name: 'Emergency', patientsCount: 580, growth: 22.8, occupancyRate: 88 },
  { name: 'Internal Medicine', patientsCount: 490, growth: 9.7, occupancyRate: 74 }
];

// Aliases for compatibility
export const INITIAL_PRESCRIPTIONS = INITIAL_PRESCRIPTION_ORDERS;
export const INITIAL_CLAIMS = INITIAL_INSURANCE_CLAIMS;

export const INITIAL_DEPARTMENTS: ClinicalDepartment[] = [
  {
    id: 'dept-cardio',
    name: 'Cardiovascular Institute & Heart Center',
    tagline: 'World-renowned comprehensive cardiology, electrophysiology & robotic cardiac surgery',
    description: 'Specializing in coronary interventions, transcatheter aortic valve replacement (TAVR), advanced heart failure management, and comprehensive preventive cardiology programs.',
    icon: 'HeartPulse',
    headOfDepartment: 'Dr. Robert Chen, MD, FACC',
    teamSize: 28,
    bedCapacity: 45,
    keyServices: ['Robotic Coronary Bypass', 'Echocardiography & Cardiac MRI', 'Arrhythmia Ablation', 'Hypertension & Lipid Clinics'],
    waitingTimeMinutes: 12,
    specialtyCode: 'Cardiology',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'dept-neuro',
    name: 'Brain & Neurological Sciences Center',
    tagline: 'Advanced surgical & clinical care for stroke, epilepsy, tumors, and spinal pathology',
    description: 'Pioneering intraoperative neuro-navigation, acute ischemic stroke rapid-response triage, deep brain stimulation (DBS), and multidisciplinary memory clinics.',
    icon: 'Brain',
    headOfDepartment: 'Dr. Emily Watson, MD, PhD',
    teamSize: 22,
    bedCapacity: 35,
    keyServices: ['Rapid Stroke Intervention', 'Stereotactic Radiosurgery', 'Epilepsy Monitoring Unit', 'Spine Reconstruction'],
    waitingTimeMinutes: 15,
    specialtyCode: 'Neurology',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'dept-onco',
    name: 'Comprehensive Cancer Center & Cellular Therapy',
    tagline: 'Next-generation precision oncology, targeted immunotherapies, and compassionate care',
    description: 'Providing genomic tumor profiling, outpatient infusion suites, CAR-T cell immunotherapies, stereotactic body radiation (SBRT), and holistic oncology survivorship care.',
    icon: 'Shield',
    headOfDepartment: 'Dr. Priya Patel, MD',
    teamSize: 34,
    bedCapacity: 40,
    keyServices: ['Genomic Tumor Board', 'Chemotherapy & Immunotherapy Suites', 'Linear Accelerator Radiotherapy', 'Palliative & Supportive Care'],
    waitingTimeMinutes: 10,
    specialtyCode: 'Oncology',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'dept-ortho',
    name: 'Orthopedic & Joint Reconstruction Institute',
    tagline: 'Minimally invasive joint replacement, sports medicine, and spinal stabilization',
    description: 'Leveraging Mako robotic arm-assisted arthroplasty, cartilage regeneration, arthroscopic ligament repair, and dedicated rapid-recovery physical rehabilitation.',
    icon: 'Activity',
    headOfDepartment: 'Dr. Jonathan Reynolds, MD, FAAOS',
    teamSize: 19,
    bedCapacity: 30,
    keyServices: ['Robotic Total Knee & Hip Replacement', 'Sports Arthroscopy (ACL/Rotator Cuff)', 'Spinal Fusion & Decompression', 'Physical Therapy Pavilion'],
    waitingTimeMinutes: 18,
    specialtyCode: 'Orthopedics',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'dept-peds',
    name: 'Children’s & Neonatal Health Center',
    tagline: 'Compassionate pediatric medicine, pediatric surgery, and Level III NICU',
    description: 'A comforting, child-friendly healing environment featuring dedicated pediatric sub-specialists, family-centered inpatient rooms, and 24/7 pediatric emergency coverage.',
    icon: 'Baby',
    headOfDepartment: 'Dr. Sarah Jenkins, MD, FAAP',
    teamSize: 26,
    bedCapacity: 35,
    keyServices: ['Level III Neonatal Intensive Care', 'Pediatric Pulmonology & Allergy', 'Well-Child Preventive Programs', 'Adolescent Behavioral Health'],
    waitingTimeMinutes: 8,
    specialtyCode: 'Pediatrics',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'dept-er',
    name: 'Emergency & Level 1 Trauma Resuscitation',
    tagline: '24/7 Rapid triage, helipad evacuation, cardiac catheterization & acute resuscitation',
    description: 'Designated Level 1 Trauma facility with immediate surgical readiness, dedicated CT suites in the trauma bay, ultrasound-guided vascular access, and seamless ICU transfer.',
    icon: 'Siren',
    headOfDepartment: 'Dr. Alex Rivera, MD, FACEP',
    teamSize: 42,
    bedCapacity: 50,
    keyServices: ['Rapid Triage Resuscitation', 'Dedicated Trauma Operating Theatres', 'Point-of-Care Bedside Ultrasound', 'Toxicology & Hyperbaric Treatment'],
    waitingTimeMinutes: 14,
    specialtyCode: 'Emergency',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop'
  }
];

export const INITIAL_HEALTH_ARTICLES: HealthArticle[] = [
  {
    id: 'art-1',
    title: 'Understanding Resting Heart Rate: When Normal Fluctuations Signal Cardiac Health',
    category: 'Cardiovascular Wellness',
    author: 'Dr. Robert Chen, MD, FACC',
    authorTitle: 'Chief of Cardiovascular Medicine',
    readTime: '4 min read',
    publishDate: 'May 18, 2026',
    excerpt: 'Your resting heart rate provides real-time telemetry on autonomic nervous system balance, cardiovascular endurance, and arterial elasticity.',
    content: 'A normal resting heart rate for adults ranges from 60 to 100 beats per minute. Highly trained athletes often maintain resting rates in the low 40s to 50s due to increased stroke volume and elevated vagal tone.\n\nKey signs that warrant clinical evaluation include sudden unexplained tachycardia (>100 bpm at rest) accompanied by palpitations, lightheadedness, or nocturnal dyspnea. Modern wearable monitors provide valuable continuous telemetry that our cardiology team incorporates directly into personalized risk stratifications.',
    tags: ['Cardiology', 'Heart Rate', 'Prevention', 'Wearables'],
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop',
    medicalReviewer: 'St. Jude Clinical Review Board'
  },
  {
    id: 'art-2',
    title: 'Precision Oncology & Genomic Profiling: Tailoring Therapy to Your Tumor Signature',
    category: 'Cancer Innovation',
    author: 'Dr. Priya Patel, MD',
    authorTitle: 'Director of Molecular Oncology',
    readTime: '6 min read',
    publishDate: 'May 14, 2026',
    excerpt: 'How next-generation DNA sequencing enables oncologists to target specific oncogenic driver mutations while sparing healthy tissue.',
    content: 'Gone are the days when cancer treatments were categorized strictly by organ origin. Today, comprehensive genomic profiling (CGP) interrogates hundreds of genes simultaneously to identify somatic mutations, copy number alterations, and microsatellite instability.\n\nPatients undergoing targeted immunotherapies experience significantly higher response rates and preserved quality of life compared to historic cytotoxic regimens.',
    tags: ['Oncology', 'Genomics', 'Targeted Therapy', 'Precision Medicine'],
    imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop',
    medicalReviewer: 'St. Jude Molecular Oncology Panel'
  },
  {
    id: 'art-3',
    title: 'Sleep Architecture & Neurocognitive Recovery: The Science of Glymphatic Clearance',
    category: 'Neurology & Brain Health',
    author: 'Dr. Emily Watson, MD, PhD',
    authorTitle: 'Lead Neurologist & Neuroscientist',
    readTime: '5 min read',
    publishDate: 'May 09, 2026',
    excerpt: 'During deep slow-wave sleep, the brain’s unique waste-clearance system removes neurotoxic metabolic byproducts including beta-amyloid.',
    content: 'The glymphatic system expands interstitial space during Stage 3 non-REM sleep by up to 60%, allowing cerebrospinal fluid to flush cellular metabolites from brain parenchyma.\n\nMaintaining consistent sleep duration (7 to 8.5 hours) and minimizing nocturnal blue-light exposure safeguards synaptic plasticity, emotional equilibrium, and long-term neurocognitive resilience.',
    tags: ['Neurology', 'Sleep Hygiene', 'Brain Health', 'Glymphatics'],
    imageUrl: 'https://images.unsplash.com/photo-1541480601022-2308c0f02487?q=80&w=800&auto=format&fit=crop',
    medicalReviewer: 'St. Jude Sleep & Neurosciences Department'
  },
  {
    id: 'art-4',
    title: 'Robotic-Assisted Joint Replacement: Faster Ambulation & Sub-Millimeter Accuracy',
    category: 'Orthopedic Innovation',
    author: 'Dr. Jonathan Reynolds, MD, FAAOS',
    authorTitle: 'Senior Orthopedic Joint Specialist',
    readTime: '4 min read',
    publishDate: 'May 02, 2026',
    excerpt: 'CT-based 3D modeling and robotic surgical guidance enable tailored implant alignment aligned to your unique pelvic and femoral biomechanics.',
    content: 'By generating a patient-specific virtual 3D plan prior to surgery, surgeons can fine-tune bone resections within 0.5 mm and 0.5 degrees. This intraoperative precision protects surrounding soft tissue envelopes, resulting in reduced postoperative pain and rapid rehabilitation discharge within 24 to 48 hours.',
    tags: ['Orthopedics', 'Robotic Surgery', 'Joint Replacement', 'Rehabilitation'],
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
    medicalReviewer: 'St. Jude Orthopedic Surgical Committee'
  }
];

export const INITIAL_PATIENT_MESSAGES: PatientPortalMessage[] = [
  {
    id: 'msg-1',
    patientId: 'P1',
    senderName: 'Dr. Robert Chen, MD',
    senderRole: 'Doctor',
    timestamp: 'May 20, 2026 at 4:15 PM',
    subject: 'Follow-up on Lipid Panel & Atorvastatin Dosage',
    message: 'Hello Sarah, your recent lipid diagnostic shows a significant reduction in LDL cholesterol down to 88 mg/dL. Please continue taking Atorvastatin 20mg nightly with water. Let me know if you experience any muscle stiffness.',
    isRead: false,
    replies: [
      {
        id: 'rep-1',
        senderName: 'Sarah Johnson (Patient)',
        senderRole: 'Patient',
        timestamp: 'May 20, 2026 at 5:30 PM',
        message: 'Thank you Dr. Chen! I feel great with zero side effects. I will see you at the scheduled check-up in June.'
      }
    ]
  },
  {
    id: 'msg-2',
    patientId: 'P1',
    senderName: 'Care Coordinator Maria Lopez',
    senderRole: 'Care Coordinator',
    timestamp: 'May 19, 2026 at 11:00 AM',
    subject: 'Upcoming Cardiac Ultrasound Appointment Reminder',
    message: 'Dear Sarah, this is a friendly reminder for your scheduled Transthoracic Echocardiogram on May 28 at 10:00 AM at St. Jude West Pavilion, 2nd Floor.',
    isRead: true
  },
  {
    id: 'msg-3',
    patientId: 'P2',
    senderName: 'Dr. Emily Watson, MD',
    senderRole: 'Doctor',
    timestamp: 'May 18, 2026 at 2:45 PM',
    subject: 'Brain MRI Scan Review & Next Steps',
    message: 'Marcus, we reviewed your high-resolution MRI. Everything is completely stable with no abnormal vascular or parenchymal changes. Your current migraine prophylaxis is working effectively.',
    isRead: true
  }
];

export const VISITOR_GUIDE_ITEMS: VisitorGuideItem[] = [
  {
    id: 'vg-1',
    title: 'Inpatient General Visiting Hours',
    category: 'Visiting Hours',
    details: 'General inpatient wards welcome up to 2 visitors per patient between 8:00 AM and 8:30 PM daily. Quiet hours commence at 9:00 PM to facilitate restorative healing.',
    location: 'Main Hospital Towers (Floors 2-6)',
    timing: '8:00 AM – 8:30 PM'
  },
  {
    id: 'vg-2',
    title: 'ICU & Critical Care Visitation Guidelines',
    category: 'Visiting Hours',
    details: 'Immediate family members (18+) are permitted with 24/7 access. Please consult with the charge nurse during clinical handovers (7:00 AM–8:00 AM & 7:00 PM–8:00 PM).',
    location: 'Level 4 Intensive Care Pavilion',
    timing: '24/7 for Primary Care Partners'
  },
  {
    id: 'vg-3',
    title: 'Complimentary Patient & Visitor Parking',
    category: 'Parking & Transport',
    details: 'Covered parking structure attached to Main Pavilion with EV charging bays and 24/7 security escorts. Valet service available at Emergency and Main Entrances.',
    location: 'Parking Structure A & B (Entrances on St. Jude Blvd)',
    timing: '24 Hours Daily'
  },
  {
    id: 'vg-4',
    title: 'The Garden Café & Organic Bistro',
    category: 'Dining & Cafeteria',
    details: 'Offering chef-prepared Mediterranean meals, gluten-free & vegan options, fresh juices, and specialty espresso roasted locally.',
    location: 'Ground Floor Atrium (Courtyard Garden)',
    timing: '6:30 AM – 9:00 PM'
  },
  {
    id: 'vg-5',
    title: 'Healing Gardens, Chapel & Meditation Sanctuary',
    category: 'Amenities',
    details: 'Multi-faith meditation spaces, quiet rooftop reflection terrace, and live botanical courtyard designed for emotional grounding.',
    location: 'Pavilion 3, 3rd Floor Reflection Wing',
    timing: 'Open 24/7'
  }
];


