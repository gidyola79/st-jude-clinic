import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  INITIAL_DOCTORS, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_BEDS, 
  INITIAL_NOTIFICATIONS, 
  SYSTEM_LOGS,
  INITIAL_MEDICINES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_WARD_BEDS,
  INITIAL_EMERGENCY_CASES,
  INITIAL_INVOICES,
  INITIAL_CLAIMS,
  INITIAL_DEPARTMENTS,
  INITIAL_HEALTH_ARTICLES,
  INITIAL_PATIENT_MESSAGES,
  VISITOR_GUIDE_ITEMS
} from './mockData';
import { 
  Doctor, 
  Patient, 
  Appointment, 
  BedAlloc, 
  Notification, 
  SystemLog, 
  UserRole,
  Medicine,
  PrescriptionOrder,
  WardBed,
  EmergencyCase,
  Invoice,
  InsuranceClaim,
  ClinicalDepartment,
  HealthArticle,
  PatientPortalMessage,
  VisitorGuideItem
} from './types';
import { loadState, saveState } from './utils/storage';
import { 
  initializeHospitalDatabase, 
  subscribePatients, 
  subscribeAppointments, 
  subscribeDoctors 
} from './lib/dbService';

// Views & Security Controls
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AccessControl from './components/AccessControl';
import DashboardView from './components/DashboardView';
import DoctorsView from './components/DoctorsView';
import AppointmentsView from './components/AppointmentsView';
import PatientsView from './components/PatientsView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import PharmacyView from './components/PharmacyView';
import BillingView from './components/BillingView';
import BedsView from './components/BedsView';
import EmergencyTriageView from './components/EmergencyTriageView';
import PublicHospitalView from './components/PublicHospitalView';
import AdminAuthModal from './components/AdminAuthModal';
import StaffAuthView from './components/StaffAuthView';
import SessionInactivityModal from './components/SessionInactivityModal';

// Interactive Modals
import AiAssistantModal from './components/AiAssistantModal';
import TelehealthRoomModal from './components/TelehealthRoomModal';

import { StaffUser } from './types';
import { 
  subscribeStaffAuth, 
  signOutStaff, 
  getSavedLocalStaffSession 
} from './lib/authService';

import { 
  AlertTriangle, 
  ShieldCheck, 
  Keyboard as KeyboardIcon, 
  X, 
  CheckCircle2, 
  Info, 
  Lock,
  Zap,
  Sparkles,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Application Mode: 'public' (Patient Portal & Hospital Web Presence) vs 'emr' (Hospital Staff Operations)
  const [appMode, setAppMode] = useState<'public' | 'emr'>('public');

  // Authenticated Staff User Session State
  const [staffUser, setStaffUser] = useState<StaffUser | null>(() => getSavedLocalStaffSession());

  // Navigation & Permissions State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('Admin');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Active Doctor Roleplay Identity (when in Doctor role, e.g. D1 is Dr. Robert Chen)
  const [activeDoctorId, setActiveDoctorId] = useState<string>('D1');

  // Interactive keyboard shortcuts state
  const [showShortcutHelp, setShowShortcutHelp] = useState<boolean>(false);
  const [openBookingOnVisit, setOpenBookingOnVisit] = useState<boolean>(false);

  // Active floating real-time toasts state
  const [activeToasts, setActiveToasts] = useState<{ id: string; title: string; description: string; type: 'Alert' | 'Success' | 'Info' | 'Schedule'; audience?: 'public' | 'staff' | 'admin' }[]>([]);

  // Simulation Daemon toggle state
  const [isSimulationEnabled, setIsSimulationEnabled] = useState<boolean>(true);

  // Search & Central Persistent States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>(() => loadState('doctors', INITIAL_DOCTORS));
  const [patients, setPatients] = useState<Patient[]>(() => loadState('patients', INITIAL_PATIENTS));
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadState('appointments', INITIAL_APPOINTMENTS));
  const [beds, setBeds] = useState<BedAlloc[]>(() => loadState('beds', INITIAL_BEDS));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadState('notifications', INITIAL_NOTIFICATIONS));
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => loadState('systemLogs', SYSTEM_LOGS));

  // MVP Data States
  const [medicines, setMedicines] = useState<Medicine[]>(() => loadState('medicines', INITIAL_MEDICINES));
  const [pharmacyPrescriptions, setPharmacyPrescriptions] = useState<PrescriptionOrder[]>(() => loadState('pharmacyPrescriptions', INITIAL_PRESCRIPTIONS));
  const [wardBeds, setWardBeds] = useState<WardBed[]>(() => loadState('wardBeds', INITIAL_WARD_BEDS));
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>(() => loadState('emergencyCases', INITIAL_EMERGENCY_CASES));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadState('invoices', INITIAL_INVOICES));
  const [claims, setClaims] = useState<InsuranceClaim[]>(() => loadState('claims', INITIAL_CLAIMS));

  // Public Portal States
  const [departments] = useState<ClinicalDepartment[]>(INITIAL_DEPARTMENTS);
  const [articles] = useState<HealthArticle[]>(INITIAL_HEALTH_ARTICLES);
  const [visitorGuides] = useState<VisitorGuideItem[]>(VISITOR_GUIDE_ITEMS);
  const [patientMessages, setPatientMessages] = useState<PatientPortalMessage[]>(() => loadState('patientMessages', INITIAL_PATIENT_MESSAGES));

  // Modal Launcher States
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiSelectedPatient, setAiSelectedPatient] = useState<any>(null);

  const [isTelehealthModalOpen, setIsTelehealthModalOpen] = useState<boolean>(false);
  const [telehealthSelectedAppt, setTelehealthSelectedAppt] = useState<any>(null);

  // Admin Authorization Modal State
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  const handleRequestRoleChange = (targetRole: UserRole) => {
    if (targetRole === 'Admin') {
      if (activeRole === 'Admin') return; // already in admin
      setPendingRole('Admin');
      setIsAdminAuthModalOpen(true);
    } else {
      setActiveRole(targetRole);
      addNotification(
        'Shift Mode Changed',
        `Switched shift to ${targetRole} mode.`,
        'Info'
      );
    }
  };

  const handleAdminAuthSuccess = () => {
    setActiveRole('Admin');
    setIsAdminAuthModalOpen(false);
    setPendingRole(null);
    addNotification(
      'Admin Authorization Verified',
      'Administrator clearance granted. Full hospital system diagnostics & governance unlocked.',
      'Success'
    );
  };

  // 15-Minute Staff Inactivity Auto-Logout Timer (HIPAA Security Compliance)
  const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes = 900,000 ms
  const WARNING_THRESHOLD_MS = 60 * 1000; // Warning modal triggers when <= 60 seconds remain

  const [remainingInactivitySeconds, setRemainingInactivitySeconds] = useState<number>(15 * 60);
  const [showInactivityWarning, setShowInactivityWarning] = useState<boolean>(false);
  const lastActivityRef = useRef<number>(Date.now());

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowInactivityWarning(false);
    setRemainingInactivitySeconds(15 * 60);
  }, []);

  // Staff User Authentication Handlers
  const handleStaffAuthSuccess = (user: StaffUser) => {
    setStaffUser(user);
    setActiveRole(user.role);
    if (user.doctorId) {
      setActiveDoctorId(user.doctorId);
    }
    setAppMode('emr');
    resetInactivityTimer();
    addNotification(
      'Workstation Access Granted',
      `Welcome back, ${user.displayName} (${user.role}). Secure EMR terminal initialized.`,
      'Success'
    );
  };

  const handleSignOutStaff = useCallback(async (isAutoTimeout = false) => {
    await signOutStaff();
    setStaffUser(null);
    setAppMode('public');
    setShowInactivityWarning(false);
    if (isAutoTimeout) {
      addNotification(
        'Session Timed Out (HIPAA Security)',
        'Clinical workstation automatically locked after 15 minutes of inactivity to protect health data confidentiality.',
        'Alert'
      );
    } else {
      addNotification(
        'Workstation Locked',
        'Clinical staff session closed. Redirected to public portal.',
        'Info'
      );
    }
  }, []);

  // Inactivity Auto-Logout Timer Effect (Active during EMR staff sessions)
  useEffect(() => {
    if (appMode !== 'emr' || !staffUser) {
      setShowInactivityWarning(false);
      return;
    }

    lastActivityRef.current = Date.now();

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
      if (showInactivityWarning) {
        setShowInactivityWarning(false);
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remainingMs = Math.max(0, INACTIVITY_LIMIT_MS - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);
      setRemainingInactivitySeconds(remainingSec);

      if (remainingMs <= 0) {
        // Auto-logout triggered after 15 minutes of inactivity
        handleSignOutStaff(true);
      } else if (remainingMs <= WARNING_THRESHOLD_MS) {
        setShowInactivityWarning(true);
      } else {
        setShowInactivityWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      clearInterval(checkInterval);
    };
  }, [appMode, staffUser, showInactivityWarning, handleSignOutStaff]);

  // Firebase Auth Real-time Session Listener
  useEffect(() => {
    const unsubAuth = subscribeStaffAuth((user) => {
      if (user) {
        setStaffUser(user);
        setActiveRole(user.role);
        if (user.doctorId) setActiveDoctorId(user.doctorId);
      }
    });
    return () => unsubAuth();
  }, []);

  // Firestore Database Real-time Sync Lifecycle
  useEffect(() => {
    // Seed initial dataset to Firestore if empty
    initializeHospitalDatabase().catch(err => console.warn('Database initialization note:', err));

    // Real-time synchronization
    const unsubPatients = subscribePatients(
      (data) => { if (data && data.length > 0) setPatients(data); },
      (err) => console.warn('Using local patient cache:', err)
    );

    const unsubAppts = subscribeAppointments(
      (data) => { if (data && data.length > 0) setAppointments(data); },
      (err) => console.warn('Using local appointment cache:', err)
    );

    const unsubDocs = subscribeDoctors(
      (data) => { if (data && data.length > 0) setDoctors(data); },
      (err) => console.warn('Using local doctor cache:', err)
    );

    return () => {
      unsubPatients();
      unsubAppts();
      unsubDocs();
    };
  }, []);

  // Sync to Storage on changes
  useEffect(() => { saveState('doctors', doctors); }, [doctors]);
  useEffect(() => { saveState('patients', patients); }, [patients]);
  useEffect(() => { saveState('appointments', appointments); }, [appointments]);
  useEffect(() => { saveState('beds', beds); }, [beds]);
  useEffect(() => { saveState('notifications', notifications); }, [notifications]);
  useEffect(() => { saveState('systemLogs', systemLogs); }, [systemLogs]);
  useEffect(() => { saveState('medicines', medicines); }, [medicines]);
  useEffect(() => { saveState('pharmacyPrescriptions', pharmacyPrescriptions); }, [pharmacyPrescriptions]);
  useEffect(() => { saveState('wardBeds', wardBeds); }, [wardBeds]);
  useEffect(() => { saveState('emergencyCases', emergencyCases); }, [emergencyCases]);
  useEffect(() => { saveState('invoices', invoices); }, [invoices]);
  useEffect(() => { saveState('claims', claims); }, [claims]);
  useEffect(() => { saveState('patientMessages', patientMessages); }, [patientMessages]);

  // Dark Mode Sync Side-Effect
  useEffect(() => {
    const rootEl = document.documentElement;
    if (darkMode) {
      rootEl.classList.add('dark');
    } else {
      rootEl.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard Shortcuts Bindings (Accessibility)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const activeEl = document.activeElement;

      if (e.key === 'Escape') {
        if (showShortcutHelp) setShowShortcutHelp(false);
        if (isAiModalOpen) setIsAiModalOpen(false);
        if (isTelehealthModalOpen) setIsTelehealthModalOpen(false);
        if (isAdminAuthModalOpen) {
          setIsAdminAuthModalOpen(false);
          setPendingRole(null);
        }
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
          (activeEl as HTMLElement).blur();
        }
        return;
      }

      if (
        activeEl && 
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case '1':
          setActiveTab('dashboard');
          break;
        case '2':
          setActiveTab('appointments');
          break;
        case '3':
          setActiveTab('patients');
          break;
        case '4':
          setActiveTab('billing');
          break;
        case '5':
          setActiveTab('doctors');
          break;
        case '6':
          setActiveTab('analytics');
          break;
        case '7':
          setActiveTab('settings');
          break;
        case 'e':
          setActiveTab('emergency');
          break;
        case 'b':
          setActiveTab('beds');
          break;
        case 'p':
          setActiveTab('pharmacy');
          break;
        case 'u':
          e.preventDefault();
          if (activeRole === 'Receptionist') {
            setActiveRole('Doctor');
            addNotification('Shift Mode Changed', 'Switched shift to Doctor mode.', 'Info');
          } else if (activeRole === 'Doctor') {
            setPendingRole('Admin');
            setIsAdminAuthModalOpen(true);
          } else {
            setActiveRole('Receptionist');
            addNotification('Shift Mode Changed', 'Switched shift to Receptionist mode.', 'Info');
          }
          break;
        case 'd':
          setDarkMode(prev => !prev);
          break;
        case '/':
          e.preventDefault();
          const searchInput = document.getElementById('global-search-input');
          if (searchInput) {
            searchInput.focus();
          }
          break;
        case '?':
        case 'h':
          setShowShortcutHelp(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Background Live Scenario Simulation (Active ONLY during authenticated staff EMR sessions)
  useEffect(() => {
    if (!isSimulationEnabled || appMode !== 'emr' || !staffUser) return;

    const scenarios = [
      {
        title: 'Emergency Inbound Unit 402',
        desc: 'Ambulance dispatching Level 2 cardiac arrhythmia patient. Trauma Bay 1 assigned.',
        type: 'Alert' as const,
        audience: 'staff' as const
      },
      {
        title: 'Pharmacy Dispensing Completed',
        desc: 'Prescription for Amoxicillin 500mg verified and dispensed for outpatient pickup.',
        type: 'Success' as const,
        audience: 'staff' as const
      },
      {
        title: 'Insurance EDI Claim Remitted',
        desc: 'BlueCross processed and approved $850.00 claim for clinical inpatient stay.',
        type: 'Success' as const,
        audience: 'admin' as const
      },
      {
        title: 'Bed Sterilization Finished',
        desc: 'ICU Bed 201 sterilized after patient discharge. Status updated to Available.',
        type: 'Info' as const,
        audience: 'staff' as const
      }
    ];

    const interval = setInterval(() => {
      const picked = scenarios[Math.floor(Math.random() * scenarios.length)];
      addNotification(picked.title, picked.desc, picked.type, picked.audience);
    }, 45000);

    return () => clearInterval(interval);
  }, [isSimulationEnabled, appMode, staffUser, activeRole]);

  // Central Notification Adding Function with Role/Audience Scoping
  const addNotification = (
    title: string, 
    desc: string, 
    type: 'Alert' | 'Success' | 'Info' | 'Schedule',
    audience: 'public' | 'staff' | 'admin' = 'staff'
  ) => {
    const notId = `N-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newNotif: Notification = {
      id: notId,
      title,
      description: desc,
      time: 'Just now',
      type,
      isRead: false,
      targetAudience: audience
    };
    
    setNotifications(prev => [newNotif, ...prev]);

    // Live Toast Visibility Policy:
    // - In Public View: ONLY show toasts targeted to the public (e.g. appointment confirmations, messages sent).
    //   Suppress all clinical background operations, emergency alarms, and staff telemetry from disrupting public visitors.
    // - In Staff EMR Mode: Show clinical alerts and staff notifications; only show admin-restricted alerts to Admins.
    const isToastAllowed = appMode === 'emr'
      ? (audience === 'admin' ? activeRole === 'Admin' : true)
      : audience === 'public';

    if (isToastAllowed) {
      setActiveToasts(prev => {
        const updated = [{ id: notId, title, description: desc, type, audience }, ...prev];
        return updated.slice(0, 3);
      });

      setTimeout(() => {
        setActiveToasts(prev => prev.filter(t => t.id !== notId));
      }, 5000);
    }

    const newLog: SystemLog = {
      id: `L${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level: type === 'Alert' ? 'Warning' : 'Info',
      message: `${title}: ${desc}`,
      user: appMode === 'public' ? 'Public Portal' : activeRole
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  const handleCheckIn = (appointmentId: string) => {
    setAppointments(
      appointments.map(a => {
        if (a.id === appointmentId) {
          addNotification(
            'Patient Checked-In',
            `Patient ${a.patientName} has arrived and is checked-in for ${a.doctorName}.`,
            'Success'
          );
          return { ...a, status: 'Completed' };
        }
        return a;
      })
    );
  };

  const handleSelectPatientIdx = (patientId: string) => {
    setActiveTab('patients');
  };

  const handleQuickAction = (actionName: string) => {
    if (actionName === 'simulateAlert') {
      addNotification(
        'Critical Triage Inbound',
        'Ambulance Unit 108: Multi-trauma victim with subarachnoid hemorrhage incoming. Projected Arrival: 3 mins.',
        'Alert'
      );
    }
  };

  const handleResetDatabase = () => {
    setDoctors(INITIAL_DOCTORS);
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setBeds(INITIAL_BEDS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSystemLogs(SYSTEM_LOGS);
    setMedicines(INITIAL_MEDICINES);
    setPharmacyPrescriptions(INITIAL_PRESCRIPTIONS);
    setWardBeds(INITIAL_WARD_BEDS);
    setEmergencyCases(INITIAL_EMERGENCY_CASES);
    setInvoices(INITIAL_INVOICES);
    setClaims(INITIAL_CLAIMS);
    addNotification('Clinician Databases Restored', 'Global diagnostic structures restarted to base templates.', 'Info');
  };

  const handleOpenAiAssistant = (patient?: any) => {
    setAiSelectedPatient(patient || patients[0]);
    setIsAiModalOpen(true);
  };

  const handleOpenTelehealth = (appt?: any) => {
    setTelehealthSelectedAppt(appt || appointments[0]);
    setIsTelehealthModalOpen(true);
  };

  const selectActingDoctorStr = doctors.find(d => d.id === activeDoctorId)?.name || 'Dr. Robert Chen';

  const emergencyCount = emergencyCases.filter(c => c.status === 'In Trauma Bay').length;
  const lowStockCount = medicines.filter(m => m.stock <= m.minStock).length;
  const pendingClaimsCount = claims.filter(c => c.status === 'Submitted' || c.status === 'In Review').length;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-250 font-sans flex flex-col">
      {/* If in Public Portal Mode, render the comprehensive St. Jude Public Hospital Website & MyChart Experience */}
      {appMode === 'public' ? (
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
          {/* Top Global Navigation with quick toggle to Staff EMR */}
          <Header
            appMode={appMode}
            setAppMode={setAppMode}
            activeRole={activeRole}
            notifications={notifications}
            setNotifications={setNotifications}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onQuickAction={handleQuickAction}
            onShowShortcutsHelp={() => setShowShortcutHelp(true)}
            staffUser={staffUser}
            onSignOutStaff={handleSignOutStaff}
          />

          <PublicHospitalView
            doctors={doctors}
            patients={patients}
            appointments={appointments}
            setAppointments={setAppointments}
            departments={departments}
            articles={articles}
            patientMessages={patientMessages}
            setPatientMessages={setPatientMessages}
            visitorGuides={visitorGuides}
            addNotification={addNotification}
            onSwitchToEhr={() => setAppMode('emr')}
            onLaunchTelehealth={(appt) => handleOpenTelehealth(appt)}
            onOpenAiAssistant={(patId) => {
              const targetPatient = patients.find(p => p.id === patId) || patients[0];
              handleOpenAiAssistant(targetPatient);
            }}
          />
        </div>
      ) : !staffUser ? (
        /* Protected Staff EMR Authentication Gateway Screen */
        <StaffAuthView
          onAuthSuccess={handleStaffAuthSuccess}
          onReturnToPublic={() => setAppMode('public')}
        />
      ) : (
        /* Authenticated Staff Clinical Operations EMR Mode */
        <div className="flex h-screen w-full min-w-0 overflow-hidden">
          {/* Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            emergencyCount={emergencyCount}
            lowStockCount={lowStockCount}
            pendingClaimsCount={pendingClaimsCount}
            onOpenAiAssistant={() => handleOpenAiAssistant()}
            onOpenTelehealth={() => handleOpenTelehealth()}
            onSwitchToPublic={() => setAppMode('public')}
            staffUser={staffUser}
            onSignOutStaff={handleSignOutStaff}
          />

          {/* Main Container */}
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
            
            {/* Sticky Global Header */}
            <Header
              appMode={appMode}
              setAppMode={setAppMode}
              activeRole={activeRole}
              notifications={notifications}
              setNotifications={setNotifications}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onQuickAction={handleQuickAction}
              onShowShortcutsHelp={() => setShowShortcutHelp(true)}
              onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
              patients={patients}
              doctors={doctors}
              appointments={appointments}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                if (appMode === 'public') setAppMode('emr');
              }}
              onSelectPatient={(p) => {
                const idx = patients.findIndex(item => item.id === p.id);
                if (idx !== -1) handleSelectPatientIdx(idx);
              }}
              onSelectDoctor={(d) => {
                setActiveDoctorId(d.id);
                setActiveTab('doctors');
                if (appMode === 'public') setAppMode('emr');
              }}
              onRequestRoleChange={handleRequestRoleChange}
              staffUser={staffUser}
              onSignOutStaff={handleSignOutStaff}
            />

            {/* Doctor Context Ribbon */}
            {activeRole === 'Doctor' && (
              <div className="bg-indigo-600 text-white py-2 px-3 sm:px-6 text-xs flex flex-wrap gap-2 justify-between items-center shrink-0 border-b border-indigo-700 shadow-xs z-10 font-sans tracking-wide">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                  <span className="truncate">ACTING AS: <strong className="font-extrabold tracking-tight">{selectActingDoctorStr}</strong> (Specialty On Duty)</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-indigo-200 whitespace-nowrap">Simulate Shift:</span>
                  <select
                    value={activeDoctorId}
                    onChange={(e) => {
                      setActiveDoctorId(e.target.value);
                      const docName = doctors.find(d => d.id === e.target.value)?.name || 'Doctor';
                      addNotification('Practitioner Shift Swapped', `Simulated active shift transferred to ${docName}.`, 'Info');
                    }}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white border border-indigo-500 rounded px-2.5 py-0.5 text-[10px] font-bold focus:outline-none cursor-pointer max-w-[180px] sm:max-w-xs truncate"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Content Body Pane */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6 pb-20 md:pb-6 bg-slate-50/70 dark:bg-slate-900/40">
              <div className="max-w-7xl mx-auto w-full min-w-0">
                
                {activeTab === 'dashboard' && (
                  <AccessControl
                    activeRole={activeRole}
                    moduleName="Clinical Operations Dashboard"
                    onNavigateDashboard={() => setActiveTab('dashboard')}
                  >
                    <DashboardView
                      patients={patients}
                      doctors={doctors}
                      appointments={appointments}
                      beds={beds}
                      setBeds={setBeds}
                      activeRole={activeRole}
                      activeDoctorId={activeDoctorId}
                      activeDoctorName={selectActingDoctorStr}
                      onCheckIn={handleCheckIn}
                      onSelectPatient={handleSelectPatientIdx}
                      onSelectTab={setActiveTab}
                    />
                  </AccessControl>
                )}

                {activeTab === 'emergency' && (
                  <AccessControl
                    activeRole={activeRole}
                    moduleName="Emergency Trauma & Triage Bay"
                    onNavigateDashboard={() => setActiveTab('dashboard')}
                  >
                    <EmergencyTriageView
                      emergencyCases={emergencyCases}
                      setEmergencyCases={setEmergencyCases}
                      patients={patients}
                      activeRole={activeRole}
                      searchTerm={searchTerm}
                      addNotification={addNotification}
                      onOpenAiAssistant={handleOpenAiAssistant}
                    />
                  </AccessControl>
                )}

                {activeTab === 'appointments' && (
                  <AccessControl
                    activeRole={activeRole}
                    moduleName="Consultation Scheduling & Intake"
                    onNavigateDashboard={() => setActiveTab('dashboard')}
                  >
                    <AppointmentsView
                      appointments={appointments}
                      setAppointments={setAppointments}
                      doctors={doctors}
                      patients={patients}
                      activeRole={activeRole}
                      activeDoctorId={activeDoctorId}
                      addNotification={addNotification}
                      searchTerm={searchTerm}
                      openBookingOnVisit={openBookingOnVisit}
                      setOpenBookingOnVisit={setOpenBookingOnVisit}
                    />
                  </AccessControl>
                )}

                {activeTab === 'beds' && (
                  <AccessControl
                    activeRole={activeRole}
                    moduleName="Ward Bed Allocation & Occupancy"
                    onNavigateDashboard={() => setActiveTab('dashboard')}
                  >
                    <BedsView
                      beds={beds}
                      setBeds={setBeds}
                      wardBeds={wardBeds}
                      setWardBeds={setWardBeds}
                      patients={patients}
                      setPatients={setPatients}
                      activeRole={activeRole}
                      searchTerm={searchTerm}
                      addNotification={addNotification}
                    />
                  </AccessControl>
                )}

                {activeTab === 'patients' && (
                  <AccessControl
                    activeRole={activeRole}
                    moduleName="Electronic Health Records (EHR)"
                    onNavigateDashboard={() => setActiveTab('dashboard')}
                  >
                    <PatientsView
                      patients={patients}
                      setPatients={setPatients}
                      activeRole={activeRole}
                      activeDoctorId={activeDoctorId}
                      activeDoctorName={selectActingDoctorStr}
                      addNotification={addNotification}
                      searchTerm={searchTerm}
                      onOpenAiAssistant={handleOpenAiAssistant}
                    />
                  </AccessControl>
                )}

                {activeTab === 'pharmacy' && (
                  <AccessControl
                    activeRole={activeRole}
                    moduleName="Hospital Pharmacy & Dispensary"
                    onNavigateDashboard={() => setActiveTab('dashboard')}
                  >
                    <PharmacyView
                      medicines={medicines}
                      setMedicines={setMedicines}
                      prescriptions={pharmacyPrescriptions}
                      setPrescriptions={setPharmacyPrescriptions}
                      patients={patients}
                      activeRole={activeRole}
                      searchTerm={searchTerm}
                      addNotification={addNotification}
                    />
                  </AccessControl>
                )}

                {activeTab === 'billing' && (
                  <AccessControl
                    activeRole={activeRole}
                    moduleName="Billing & Insurance Claims"
                    onNavigateDashboard={() => setActiveTab('dashboard')}
                  >
                    <BillingView
                      invoices={invoices}
                      setInvoices={setInvoices}
                      claims={claims}
                      setClaims={setClaims}
                      patients={patients}
                      activeRole={activeRole}
                      searchTerm={searchTerm}
                      addNotification={addNotification}
                    />
                  </AccessControl>
                )}

                {activeTab === 'doctors' && (
                  <AccessControl
                    activeRole={activeRole}
                    moduleName="Medical Staff & Care Teams"
                    onNavigateDashboard={() => setActiveTab('dashboard')}
                  >
                    <DoctorsView
                      doctors={doctors}
                      setDoctors={setDoctors}
                      activeRole={activeRole}
                      searchTerm={searchTerm}
                    />
                  </AccessControl>
                )}

                {activeTab === 'analytics' && (
                  <AccessControl
                    activeRole={activeRole}
                    allowedRoles={['Admin']}
                    moduleName="Clinical Analytics & Operational KPIs"
                    onRequestElevation={() => handleRequestRoleChange('Admin')}
                    onNavigateDashboard={() => setActiveTab('dashboard')}
                  >
                    <AnalyticsView
                      patients={patients}
                      beds={beds}
                    />
                  </AccessControl>
                )}

                {activeTab === 'settings' && (
                  <AccessControl
                    activeRole={activeRole}
                    allowedRoles={['Admin']}
                    moduleName="Hospital Configuration & Telemetry Audit Logs"
                    onRequestElevation={() => handleRequestRoleChange('Admin')}
                    onNavigateDashboard={() => setActiveTab('dashboard')}
                  >
                    <SettingsView
                      systemLogs={systemLogs}
                      setSystemLogs={setSystemLogs}
                      onResetDatabase={handleResetDatabase}
                      activeRole={activeRole}
                      addNotification={addNotification}
                      isSimulationEnabled={isSimulationEnabled}
                      setIsSimulationEnabled={setIsSimulationEnabled}
                    />
                  </AccessControl>
                )}

              </div>
            </main>

            {/* Dynamic Critical Urgent Warning Ticker */}
            {emergencyCases.some(c => c.status === 'In Trauma Bay' && (c.triageLevel.includes('Level 1') || c.triageLevel.includes('Level 2'))) && (
              <div className="bg-red-600 text-white py-1.5 px-4 text-xs font-bold leading-none select-none flex items-center justify-between shrink-0 animate-pulse">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  CRITICAL TRAUMA ALERT: Level 1/2 resuscitation cases actively monitored in Emergency Bays.
                </span>
                <button
                  onClick={() => setActiveTab('emergency')}
                  className="underline font-black cursor-pointer hover:text-white/90 text-xs"
                >
                  Open Trauma Command &rarr;
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- AI CLINICAL COPILOT MODAL --- */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        selectedPatient={aiSelectedPatient}
        patients={patients}
        addNotification={addNotification}
      />

      {/* --- TELEHEALTH CONSULTATION ROOM MODAL --- */}
      <TelehealthRoomModal
        isOpen={isTelehealthModalOpen}
        onClose={() => setIsTelehealthModalOpen(false)}
        appointment={telehealthSelectedAppt}
        doctorName={selectActingDoctorStr}
        addNotification={addNotification}
      />

      {/* --- FLOATING REAL-TIME NOTIFICATION TOASTS DISPLAY --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-full max-w-[340px] pointer-events-none select-none">
        <AnimatePresence>
          {activeToasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -20, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="pointer-events-auto w-full p-3.5 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-2xl flex gap-3 items-start overflow-hidden relative"
            >
              <div className={`absolute bottom-0 left-0 top-0 w-1.5 ${
                t.type === 'Alert' ? 'bg-red-500' : t.type === 'Success' ? 'bg-emerald-500' : 'bg-blue-500'
              }`} />

              <div className="shrink-0 mt-0.5">
                {t.type === 'Alert' ? (
                  <AlertTriangle className="text-red-400 animate-pulse" size={16} />
                ) : t.type === 'Success' ? (
                  <CheckCircle2 className="text-emerald-400" size={16} />
                ) : (
                  <Info className="text-blue-400" size={16} />
                )}
              </div>

              <div className="flex-1 overflow-hidden pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {t.audience === 'public' ? 'Patient Notification' : t.audience === 'admin' ? 'Administrative Alert' : 'Clinical Telemetry'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    t.audience === 'public' 
                      ? 'text-teal-300 bg-teal-950/60 border-teal-800/40' 
                      : t.audience === 'admin' 
                        ? 'text-purple-300 bg-purple-950/60 border-purple-800/40' 
                        : 'text-blue-300 bg-blue-950/60 border-blue-800/40'
                  }`}>
                    {t.audience === 'public' ? 'MyChart' : t.audience === 'admin' ? 'Admin Scope' : 'Staff EMR'}
                  </span>
                </div>
                <h4 className="text-xs font-bold mt-1 text-white truncate leading-tight">
                  {t.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveToasts(prev => prev.filter(x => x.id !== t.id));
                }}
                className="text-slate-500 hover:text-white shrink-0 p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- KEYBOARD SHORTCUTS HELP MODAL --- */}
      <AnimatePresence>
        {showShortcutHelp && (
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowShortcutHelp(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 select-none font-sans"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/10">
                    <KeyboardIcon size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Shortcuts & Touch Bindings</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Keystroke mappings for clinician workflows.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShortcutHelp(false)}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Module Navigation</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Dashboard</span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[9.5px]">1</kbd>
                    </div>
                    <div className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Emergency</span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[9.5px]">E</kbd>
                    </div>
                    <div className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Appointments</span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[9.5px]">2</kbd>
                    </div>
                    <div className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Ward Beds</span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[9.5px]">B</kbd>
                    </div>
                    <div className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">EHR Records</span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[9.5px]">3</kbd>
                    </div>
                    <div className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Pharmacy</span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[9.5px]">P</kbd>
                    </div>
                    <div className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Billing</span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[9.5px]">4</kbd>
                    </div>
                    <div className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Doctors</span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[9.5px]">5</kbd>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Actions</h4>
                  <div className="space-y-2">
                    <div className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Rotate Role (Admin/Recept/Doctor)</span>
                      <kbd className="px-2 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[9.5px]">U</kbd>
                    </div>
                    <div className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Toggle Dark/Light Mode</span>
                      <kbd className="px-2 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[9.5px]">D</kbd>
                    </div>
                    <div className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Global Search</span>
                      <kbd className="px-2 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-[9.5px]">/</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Admin Authorization Master Key Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => {
          setIsAdminAuthModalOpen(false);
          setPendingRole(null);
        }}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* 15-Minute Staff Inactivity Auto-Logout Warning Modal */}
      <SessionInactivityModal
        isOpen={showInactivityWarning}
        remainingSeconds={remainingInactivitySeconds}
        onExtendSession={resetInactivityTimer}
        onLogoutNow={() => handleSignOutStaff(false)}
      />
    </div>
  );
}
