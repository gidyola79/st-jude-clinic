import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Star, 
  Activity, 
  Heart, 
  Brain, 
  Baby, 
  Siren, 
  ChevronRight, 
  ArrowRight, 
  UserCheck, 
  FileText, 
  Pill, 
  Video, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  Download, 
  Printer, 
  Stethoscope, 
  Sparkles, 
  Building, 
  Shield, 
  X, 
  ExternalLink,
  ChevronDown,
  Info,
  CalendarCheck,
  Check,
  Menu
} from 'lucide-react';
import { 
  Doctor, 
  Patient, 
  Appointment, 
  ClinicalDepartment, 
  HealthArticle, 
  PatientPortalMessage, 
  VisitorGuideItem,
  UserRole
} from '../types';
import ClinicLogo from './ClinicLogo';

interface PublicHospitalViewProps {
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  departments: ClinicalDepartment[];
  articles: HealthArticle[];
  patientMessages: PatientPortalMessage[];
  setPatientMessages: React.Dispatch<React.SetStateAction<PatientPortalMessage[]>>;
  visitorGuides: VisitorGuideItem[];
  addNotification: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule', audience?: 'public' | 'staff' | 'admin') => void;
  onSwitchToEhr: () => void;
  onLaunchTelehealth: (appointment: Appointment) => void;
  onOpenAiAssistant: (patientId?: string) => void;
}

export default function PublicHospitalView({
  doctors,
  patients,
  appointments,
  setAppointments,
  departments,
  articles,
  patientMessages,
  setPatientMessages,
  visitorGuides,
  addNotification,
  onSwitchToEhr,
  onLaunchTelehealth,
  onOpenAiAssistant,
}: PublicHospitalViewProps) {
  // Navigation sub-tab inside public portal
  const [activeSection, setActiveSection] = useState<'home' | 'doctors' | 'departments' | 'symptom-checker' | 'patient-portal' | 'visitor-guide' | 'health-library'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Search & Filter States
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState('All');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  // Selected Department for Details Modal
  const [selectedDeptModal, setSelectedDeptModal] = useState<ClinicalDepartment | null>(null);

  // Selected Article for Reading Modal
  const [selectedArticleModal, setSelectedArticleModal] = useState<HealthArticle | null>(null);

  // Active Patient for MyChart Portal View
  const [selectedPortalPatientId, setSelectedPortalPatientId] = useState<string>(patients[0]?.id || 'P1');
  const [portalActiveSubTab, setPortalActiveSubTab] = useState<'appointments' | 'prescriptions' | 'labs' | 'messages' | 'summary'>('appointments');
  const [newMessageText, setNewMessageText] = useState('');
  const [selectedRecipientDoctor, setSelectedRecipientDoctor] = useState(doctors[0]?.name || 'Dr. Robert Chen, MD');

  // Interactive Symptom Assessment Engine State
  const [symptomStep, setSymptomStep] = useState<number>(1);
  const [selectedSymptomCategory, setSelectedSymptomCategory] = useState<string | null>(null);
  const [symptomSeverity, setSymptomSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Critical'>('Moderate');
  const [symptomDuration, setSymptomDuration] = useState<string>('Few days');
  const [symptomAdditionalNotes, setSymptomAdditionalNotes] = useState<string>('');
  const [triageResult, setTriageResult] = useState<{
    urgency: 'Emergency / 911' | 'Urgent Care (Same Day)' | 'Specialty Consultation' | 'Routine Wellness';
    recommendedDept: string;
    recommendedDoctor: Doctor | undefined;
    clinicalGuidance: string;
    color: string;
  } | null>(null);

  // Quick Online Appointment Booking Modal State
  const todayLiveDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingFormData, setBookingFormData] = useState(() => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      patientName: 'Sarah Johnson',
      patientEmail: 'sarah.j@example.com',
      patientPhone: '(555) 234-5678',
      doctorId: doctors[0]?.id || 'D1',
      date: dateStr,
      time: '10:00 AM',
      type: 'In-Person' as 'In-Person' | 'Telehealth Video',
      reason: 'Routine annual check-up and blood pressure monitoring',
      insuranceProvider: 'Blue Cross Blue Shield'
    };
  });
  const [publicBookingDateError, setPublicBookingDateError] = useState('');
  const [bookingSuccessModal, setBookingSuccessModal] = useState<Appointment | null>(null);

  // Keyboard Escape listener to dismiss any open modals in PublicHospitalView
  useEffect(() => {
    const isAnyModalOpen = isBookingModalOpen || !!bookingSuccessModal || !!selectedArticleModal || !!selectedDeptModal;
    if (!isAnyModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsBookingModalOpen(false);
        setBookingSuccessModal(null);
        setSelectedArticleModal(null);
        setSelectedDeptModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBookingModalOpen, bookingSuccessModal, selectedArticleModal, selectedDeptModal]);

  // Current Patient Object in Portal
  const activePortalPatient = patients.find(p => p.id === selectedPortalPatientId) || patients[0];

  // Active Portal Patient Messages
  const activePatientMsgs = patientMessages.filter(m => m.patientId === selectedPortalPatientId);

  // Patient Appointments
  const activePatientAppointments = appointments.filter(a => a.patientId === selectedPortalPatientId || a.patientName === activePortalPatient?.name);

  // Handle Symptom Checker Assessment
  const handleRunTriage = () => {
    let urgency: 'Emergency / 911' | 'Urgent Care (Same Day)' | 'Specialty Consultation' | 'Routine Wellness' = 'Specialty Consultation';
    let deptName = 'Cardiology';
    let guidance = 'We recommend scheduling a clinical consultation with one of our specialized physicians.';
    let color = 'text-blue-600 bg-blue-50 border-blue-200';

    if (selectedSymptomCategory === 'chest-pain' || symptomSeverity === 'Critical') {
      urgency = 'Emergency / 911';
      deptName = 'Emergency';
      guidance = 'CRITICAL WARNING: Acute chest pain, shortness of breath, or radiating pressure requires immediate emergency room evaluation or calling 911.';
      color = 'text-red-700 bg-red-50 border-red-200';
    } else if (selectedSymptomCategory === 'headache' && symptomSeverity === 'Severe') {
      urgency = 'Urgent Care (Same Day)';
      deptName = 'Neurology';
      guidance = 'Severe or sudden neurological symptoms should be evaluated today to rule out vascular etiology.';
      color = 'text-amber-700 bg-amber-50 border-amber-200';
    } else if (selectedSymptomCategory === 'joint-pain') {
      urgency = 'Specialty Consultation';
      deptName = 'Orthopedics';
      guidance = 'Subacute joint pain and mobility limitations respond best to a structured orthopedic evaluation.';
      color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (selectedSymptomCategory === 'pediatric') {
      urgency = 'Urgent Care (Same Day)';
      deptName = 'Pediatrics';
      guidance = 'Pediatric fever or distress should be evaluated by a board-certified pediatrician within 12-24 hours.';
      color = 'text-teal-700 bg-teal-50 border-teal-200';
    } else if (selectedSymptomCategory === 'cancer-screening') {
      urgency = 'Specialty Consultation';
      deptName = 'Oncology';
      guidance = 'Comprehensive molecular and diagnostic evaluation by our specialized oncology tumor board.';
      color = 'text-indigo-700 bg-indigo-50 border-indigo-200';
    }

    const matchedDoc = doctors.find(d => d.specialty.toLowerCase() === deptName.toLowerCase()) || doctors[0];

    setTriageResult({
      urgency,
      recommendedDept: deptName,
      recommendedDoctor: matchedDoc,
      clinicalGuidance: guidance,
      color
    });
    setSymptomStep(3);
  };

  // Handle Online Booking Submit
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingFormData.patientName.trim() || !bookingFormData.doctorId) return;

    if (bookingFormData.date < todayLiveDateStr) {
      setPublicBookingDateError(`Cannot schedule appointments for past dates (${bookingFormData.date}). Please select today or a future continuous date.`);
      return;
    }
    setPublicBookingDateError('');

    const docMatch = doctors.find(d => d.id === bookingFormData.doctorId) || doctors[0];

    const newAppt: Appointment = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: selectedPortalPatientId || 'P1',
      patientName: bookingFormData.patientName,
      doctorId: docMatch.id,
      doctorName: docMatch.name,
      date: bookingFormData.date,
      time: bookingFormData.time,
      specialty: docMatch.specialty,
      type: bookingFormData.type,
      status: 'Scheduled',
      reason: bookingFormData.reason,
      notes: `Booked via St. Jude Public Portal. Insurance: ${bookingFormData.insuranceProvider}`,
      isUrgent: false,
      insuranceClaimStatus: 'Pending',
      consultationFee: 200,
      isBilled: false
    };

    setAppointments(prev => [newAppt, ...prev]);
    addNotification(
      'New Appointment Confirmed',
      `${bookingFormData.patientName} scheduled with ${docMatch.name} on ${bookingFormData.date} at ${bookingFormData.time}.`,
      'Schedule',
      'public'
    );

    setIsBookingModalOpen(false);
    setBookingSuccessModal(newAppt);
  };

  // Send message in Patient Portal
  const handleSendPortalMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg: PatientPortalMessage = {
      id: `msg-${Date.now()}`,
      patientId: selectedPortalPatientId,
      senderName: `${activePortalPatient.name} (Patient)`,
      senderRole: 'Patient',
      timestamp: 'Just now',
      subject: `Patient Clinical Inquiry to ${selectedRecipientDoctor}`,
      message: newMessageText.trim(),
      isRead: true
    };

    setPatientMessages(prev => [newMsg, ...prev]);
    setNewMessageText('');
    addNotification(
      'Secure Message Sent to Physician',
      `Your inquiry was dispatched to ${selectedRecipientDoctor}'s clinical care team.`,
      'Success',
      'public'
    );
  };

  // Filtered Doctors
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      doc.bio.toLowerCase().includes(doctorSearchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialtyFilter === 'All' || doc.specialty === selectedSpecialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200" id="st-jude-public-hospital-hub">
      
      {/* --- TOP 24/7 EMERGENCY & CRISIS TRIAGE BAR --- */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            <Siren size={14} />
            <span>Emergency Dept Live Wait Time:</span>
            <span className="bg-red-950/80 text-red-300 px-2 py-0.5 rounded border border-red-800 font-mono text-[11px]">
              14 Minutes Avg
            </span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
            <ShieldCheck size={14} className="text-teal-400" />
            <span>Level 1 Adult & Pediatric Trauma Center — Helipad Active</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <a href="tel:8005555833" className="flex items-center gap-1.5 text-teal-300 hover:text-teal-200 font-bold transition-colors">
            <Phone size={13} />
            <span>24/7 Urgent Care Helpline: (800) 555-JUDE</span>
          </a>
          <button
            onClick={onSwitchToEhr}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            id="switch-to-ehr-btn-top"
          >
            <Stethoscope size={12} />
            <span>Hospital Staff EMR Portal &rarr;</span>
          </button>
        </div>
      </div>

      {/* --- HOSPITAL MAIN HEADER & NAVIGATION --- */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Hospital Brand & Badge */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSection('home')}>
              <ClinicLogo size="lg" id="public-main-clinic-logo" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                    St. Jude Clinic
                  </span>
                  <span className="bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 uppercase tracking-wider">
                    Hospital & Health System
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Center for Advanced Clinical Care, Surgery & Medical Research
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 font-medium text-xs">
              <button
                onClick={() => setActiveSection('home')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeSection === 'home' 
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveSection('departments')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeSection === 'departments' 
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Centers of Excellence
              </button>
              <button
                onClick={() => setActiveSection('doctors')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeSection === 'doctors' 
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Find a Doctor
              </button>
              <button
                onClick={() => setActiveSection('symptom-checker')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeSection === 'symptom-checker' 
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles size={13} className="text-teal-600 dark:text-teal-400" />
                <span>Symptom Checker</span>
              </button>
              <button
                onClick={() => setActiveSection('patient-portal')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeSection === 'patient-portal' 
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck size={13} className="text-blue-600 dark:text-blue-400" />
                <span>MyChart Patient Portal</span>
              </button>
              <button
                onClick={() => setActiveSection('visitor-guide')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeSection === 'visitor-guide' 
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Patients & Visitors
              </button>
              <button
                onClick={() => setActiveSection('health-library')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeSection === 'health-library' 
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Health Library
              </button>
            </nav>

            {/* Quick Action Booking Button & Mobile Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setSelectedDoctorForBooking(doctors[0]);
                  setIsBookingModalOpen(true);
                }}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-700/20 hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                id="header-book-appointment-btn"
              >
                <Calendar size={14} />
                <span className="hidden sm:inline">Book Appointment</span>
                <span className="sm:hidden">Book</span>
              </button>

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
                title="Toggle Navigation Menu"
                id="public-mobile-nav-toggle-btn"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Dropdown Accordion */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 shadow-xl overflow-hidden"
            >
              {[
                { id: 'home', label: 'Home' },
                { id: 'departments', label: 'Centers of Excellence' },
                { id: 'doctors', label: 'Find a Doctor' },
                { id: 'symptom-checker', label: 'Symptom Checker', icon: Sparkles },
                { id: 'patient-portal', label: 'MyChart Patient Portal', icon: UserCheck },
                { id: 'visitor-guide', label: 'Patients & Visitors' },
                { id: 'health-library', label: 'Health Library' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-900/40'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {Icon && <Icon size={14} className="text-teal-600 dark:text-teal-400" />}
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                );
              })}
              
              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    onSwitchToEhr();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold shadow"
                >
                  <Stethoscope size={14} className="text-teal-400" />
                  <span>Switch to Staff EMR Operations &rarr;</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================== */}
      {/* 1. HOMEPAGE SECTION (Mayo & Cleveland Clinic Inspired Hero) */}
      {/* ========================================================== */}
      {activeSection === 'home' && (
        <div>
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-b from-teal-950/20 via-slate-50 dark:via-slate-950 to-slate-50 dark:to-slate-950 pt-12 pb-20 border-b border-slate-200/80 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Hero Narrative */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold shadow-xs">
                    <Sparkles size={14} className="text-teal-600 dark:text-teal-400" />
                    <span>Ranked #1 Regional Medical Center for Clinical Innovation</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    World-Class Medical Care, <br />
                    <span className="text-teal-700 dark:text-teal-400">Grounded in Compassion.</span>
                  </h1>

                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                    St. Jude Clinic unites board-certified medical leaders, precision robotic surgery, genomics-guided oncology, and 24/7 Level 1 emergency trauma care to provide comprehensive, individualized treatment for you and your loved ones.
                  </p>

                  {/* Search Bar for Doctors & Care */}
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 max-w-xl">
                    <Search size={18} className="text-slate-400 ml-3 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search by condition, specialty, doctor name..."
                      value={doctorSearchQuery}
                      onChange={(e) => setDoctorSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setActiveSection('doctors');
                      }}
                      className="w-full text-xs font-medium bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none py-2"
                    />
                    <button
                      onClick={() => setActiveSection('doctors')}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
                    >
                      Find Care
                    </button>
                  </div>

                  {/* Key Assurance Indicators */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">98.8%</div>
                      <div className="text-xs text-slate-500 font-medium">Patient Satisfaction</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-teal-600 dark:text-teal-400">45+</div>
                      <div className="text-xs text-slate-500 font-medium">Medical Specialties</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">24/7</div>
                      <div className="text-xs text-slate-500 font-medium">Level 1 Emergency & Triage</div>
                    </div>
                  </div>

                </div>

                {/* Right Hero Visual Cards */}
                <div className="lg:col-span-5 relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <img 
                      src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop" 
                      alt="St. Jude Clinic Pavilion" 
                      className="w-full h-72 object-cover"
                    />
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                          Rapid Direct Care
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Open 24/7</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Immediate In-Person & Telehealth Access
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Connect with top clinicians from home or visit our multi-specialty clinical pavillion.
                      </p>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => {
                            setSelectedDoctorForBooking(doctors[0]);
                            setIsBookingModalOpen(true);
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Calendar size={14} />
                          <span>Book Visit</span>
                        </button>
                        <button
                          onClick={() => setActiveSection('symptom-checker')}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sparkles size={14} className="text-teal-500" />
                          <span>Check Symptoms</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Accreditation Micro Badge - Clean Non-Overlapping Layout */}
                  <div className="mt-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-3.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Joint Commission Accredited</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Highest National Safety & Quality Standards</div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </section>

          {/* 4 Core Pillars Navigation Bar */}
          <section className="py-12 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Pillar 1: Find a Doctor */}
                <div 
                  onClick={() => setActiveSection('doctors')}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Stethoscope size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Find a Specialist</span>
                    <ArrowRight size={16} className="text-teal-600 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Search over 40+ leading physicians by specialty, condition, language, or hospital affiliation.
                  </p>
                </div>

                {/* Pillar 2: Centers of Excellence */}
                <div 
                  onClick={() => setActiveSection('departments')}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Building size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Clinical Institutes</span>
                    <ArrowRight size={16} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Cardiovascular Institute, Neurosciences, Comprehensive Oncology & Robotic Surgery.
                  </p>
                </div>

                {/* Pillar 3: MyChart Patient Portal */}
                <div 
                  onClick={() => setActiveSection('patient-portal')}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserCheck size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Patient MyChart</span>
                    <ArrowRight size={16} className="text-indigo-600 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Access test results, medication refills, clinician messages, and appointments 24/7.
                  </p>
                </div>

                {/* Pillar 4: AI Symptom Triage */}
                <div 
                  onClick={() => setActiveSection('symptom-checker')}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Symptom Triage</span>
                    <ArrowRight size={16} className="text-amber-600 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Check acute symptoms, determine care urgency, and match with the optimal department.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* Featured Centers of Excellence Preview */}
          <section className="py-16 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Multidisciplinary Expertise
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                    Centers of Clinical Excellence
                  </h2>
                </div>
                <button
                  onClick={() => setActiveSection('departments')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  <span>Explore all clinical institutes</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {departments.slice(0, 3).map((dept) => (
                  <div 
                    key={dept.id} 
                    className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={dept.image} 
                        alt={dept.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {dept.specialtyCode}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {dept.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                          {dept.tagline}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Head: {dept.headOfDepartment}
                        </span>
                        <button
                          onClick={() => setSelectedDeptModal(dept)}
                          className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                        >
                          View Institute &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Evidence-Based Health Library Teaser */}
          <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Clinical Insights & Wellness
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                    Reviewed Health Intelligence
                  </h2>
                </div>
                <button
                  onClick={() => setActiveSection('health-library')}
                  className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>Browse all articles</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {articles.slice(0, 2).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticleModal(art)}
                    className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-teal-500/40 transition-all cursor-pointer flex flex-col sm:flex-row gap-6 group"
                  >
                    <img 
                      src={art.imageUrl} 
                      alt={art.title} 
                      className="w-full sm:w-40 h-36 rounded-2xl object-cover shrink-0" 
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                          <span>{art.category}</span>
                          <span>•</span>
                          <span>{art.readTime}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors leading-snug">
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {art.excerpt}
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-3 font-medium">
                        By {art.author}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. FIND A DOCTOR & SPECIALISTS DIRECTORY */}
      {/* ========================================================== */}
      {activeSection === 'doctors' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header & Breadcrumb */}
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Provider Directory
            </span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Find a Physician or Specialist
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              Our clinical faculty are leaders in patient-centered medicine, pioneering research, and surgical innovation. Select a specialist below to book an in-person or telehealth visit.
            </p>
          </div>

          {/* Search & Specialty Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search physician by name, specialty, or condition..."
                value={doctorSearchQuery}
                onChange={(e) => setDoctorSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Specialty Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {['All', 'Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Emergency'].map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialtyFilter(spec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSpecialtyFilter === spec
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <img 
                      src={doc.image} 
                      alt={doc.name} 
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border-2 border-teal-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {doc.specialty}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>{doc.rating}</span>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {doc.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {doc.department} • {doc.experience} yrs exp
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed line-clamp-3">
                    {doc.bio}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span>Next Available: <strong className="text-slate-800 dark:text-slate-200">Tomorrow at 10:00 AM</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video size={13} className="text-blue-500" />
                      <span>Telehealth & In-Person Appointments</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedDoctorForBooking(doc);
                      setBookingFormData(prev => ({ ...prev, doctorId: doc.id, type: 'In-Person' }));
                      setIsBookingModalOpen(true);
                    }}
                    className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs text-center transition-colors cursor-pointer"
                  >
                    Book Clinic
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDoctorForBooking(doc);
                      setBookingFormData(prev => ({ ...prev, doctorId: doc.id, type: 'Telehealth Video' }));
                      setIsBookingModalOpen(true);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Video size={12} />
                    <span>Telehealth</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3. CENTERS OF CLINICAL EXCELLENCE (DEPARTMENTS) */}
      {/* ========================================================== */}
      {activeSection === 'departments' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Specialized Care
            </span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Centers of Clinical Excellence & Institutes
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              St. Jude Clinic’s designated institutes integrate specialized inpatient pavilions, surgical suites, rapid diagnostic laboratories, and dedicated clinical research teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {departments.map((dept) => (
              <div 
                key={dept.id}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={dept.image} 
                      alt={dept.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-600 px-2.5 py-1 rounded-full">
                        {dept.specialtyCode} Institute
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {dept.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {dept.description}
                    </p>

                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                        Key Surgical & Diagnostic Capabilities:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {dept.keyServices.map((srv, idx) => (
                          <span key={idx} className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{dept.teamSize}</div>
                        <div className="text-[10px] text-slate-400">Specialists</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{dept.bedCapacity}</div>
                        <div className="text-[10px] text-slate-400">Ward Beds</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                        <div className="text-xs font-bold text-teal-600 dark:text-teal-400">{dept.waitingTimeMinutes}m</div>
                        <div className="text-[10px] text-slate-400">Avg Triage</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Led by: {dept.headOfDepartment}
                  </span>
                  <button
                    onClick={() => {
                      const docMatch = doctors.find(d => d.specialty.toLowerCase() === dept.specialtyCode.toLowerCase()) || doctors[0];
                      setSelectedDoctorForBooking(docMatch);
                      setIsBookingModalOpen(true);
                    }}
                    className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Consult Specialists &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 4. INTERACTIVE SYMPTOM CHECKER & AI TRIAGE (MAYO CLINIC STYLE) */}
      {/* ========================================================== */}
      {activeSection === 'symptom-checker' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold mb-3">
              <Sparkles size={14} className="text-teal-600 dark:text-teal-400" />
              <span>Evidence-Based Clinical Triage Engine</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Interactive Symptom Assessment
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
              Answer a few guided clinical questions to assess your condition urgency and match with the appropriate department or specialist at St. Jude Clinic.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className={`flex items-center gap-2 text-xs font-bold ${symptomStep >= 1 ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${symptomStep >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'}`}>1</span>
                <span>Select Symptoms</span>
              </div>
              <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-800" />
              <div className={`flex items-center gap-2 text-xs font-bold ${symptomStep >= 2 ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${symptomStep >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'}`}>2</span>
                <span>Severity & Timeline</span>
              </div>
              <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-800" />
              <div className={`flex items-center gap-2 text-xs font-bold ${symptomStep >= 3 ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${symptomStep >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'}`}>3</span>
                <span>Clinical Triage Recommendation</span>
              </div>
            </div>

            {/* STEP 1: Symptom Category Selection */}
            {symptomStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  What is your primary area of concern?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'chest-pain', label: 'Chest Pressure / Palpitations / Shortness of Breath', icon: Heart, category: 'Cardiovascular' },
                    { id: 'headache', label: 'Severe Headaches, Dizziness, or Neuropathy', icon: Brain, category: 'Neurological' },
                    { id: 'joint-pain', label: 'Joint Pain, Back Spasm, or Sports Injury', icon: Activity, category: 'Orthopedics' },
                    { id: 'pediatric', label: 'Child Fever, Rash, or Pediatric Symptoms', icon: Baby, category: 'Pediatrics' },
                    { id: 'cancer-screening', label: 'Unexplained Weight Loss, Lumps, or Tumor Screening', icon: Shield, category: 'Oncology' },
                    { id: 'general-wellness', label: 'Routine Check-up, High BP, or Diabetes Management', icon: Stethoscope, category: 'Internal Medicine' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedSymptomCategory(item.id)}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        selectedSymptomCategory === item.id
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-teal-400/50 bg-slate-50/50 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${selectedSymptomCategory === item.id ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                        <item.icon size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                          {item.category}
                        </span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                          {item.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    disabled={!selectedSymptomCategory}
                    onClick={() => setSymptomStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Next: Assess Severity</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Severity & Duration */}
            {symptomStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                    How severe is your discomfort?
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {(['Mild', 'Moderate', 'Severe', 'Critical'] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSymptomSeverity(sev)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                          symptomSeverity === sev
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                    How long have you experienced these symptoms?
                  </label>
                  <select
                    value={symptomDuration}
                    onChange={(e) => setSymptomDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="Less than 2 hours">Less than 2 hours (Acute onset)</option>
                    <option value="Few days">1 – 3 days</option>
                    <option value="Few weeks">1 – 4 weeks</option>
                    <option value="Chronic (> 1 month)">Chronic (Over 1 month)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                    Additional notes or known medical conditions:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., previous stent, history of asthma, taking blood thinners..."
                    value={symptomAdditionalNotes}
                    onChange={(e) => setSymptomAdditionalNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setSymptomStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleRunTriage}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Generate Clinical Assessment</span>
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Triage Recommendation Output */}
            {symptomStep === 3 && triageResult && (
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border ${triageResult.color}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider">
                      Recommended Care Level:
                    </span>
                    <span className="font-extrabold text-sm px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 shadow-xs">
                      {triageResult.urgency}
                    </span>
                  </div>
                  <p className="text-xs mt-3 leading-relaxed font-medium">
                    {triageResult.clinicalGuidance}
                  </p>
                </div>

                {/* Recommended Doctor Card */}
                {triageResult.recommendedDoctor && (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={triageResult.recommendedDoctor.image} 
                        alt={triageResult.recommendedDoctor.name} 
                        className="w-14 h-14 rounded-2xl object-cover" 
                      />
                      <div>
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                          Recommended Specialist
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {triageResult.recommendedDoctor.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {triageResult.recommendedDoctor.specialty} • {triageResult.recommendedDoctor.department}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDoctorForBooking(triageResult.recommendedDoctor!);
                        setBookingFormData(prev => ({
                          ...prev,
                          doctorId: triageResult.recommendedDoctor!.id,
                          reason: `Triage evaluation for ${selectedSymptomCategory}`
                        }));
                        setIsBookingModalOpen(true);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Book Consultation Now
                    </button>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setSymptomStep(1);
                      setSelectedSymptomCategory(null);
                      setTriageResult(null);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    Start New Assessment
                  </button>
                  <button
                    onClick={() => setActiveSection('doctors')}
                    className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    Browse All St. Jude Physicians &rarr;
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. INTERACTIVE MYCHART PATIENT PORTAL */}
      {/* ========================================================== */}
      {activeSection === 'patient-portal' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header & Patient Account Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Secure Patient Health Portal (MyChart)
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Welcome back, {activePortalPatient.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Medical Record #{activePortalPatient.id} • DOB: {activePortalPatient.dob || '1984-06-12'} • Insurance: {activePortalPatient.insurance}
              </p>
            </div>

            {/* Demo Patient Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 px-2">Switch Patient:</span>
              <select
                value={selectedPortalPatientId}
                onChange={(e) => setSelectedPortalPatientId(e.target.value)}
                className="text-xs font-bold bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.condition})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-8 overflow-x-auto">
            {[
              { id: 'appointments', label: 'My Appointments', icon: Calendar, count: activePatientAppointments.length },
              { id: 'prescriptions', label: 'Active Medications', icon: Pill },
              { id: 'labs', label: 'Diagnostic & Lab Results', icon: FileText, count: activePortalPatient.labTests?.length || 0 },
              { id: 'messages', label: 'Doctor Messaging', icon: MessageSquare, count: activePatientMsgs.length },
              { id: 'summary', label: 'Health Record Summary', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPortalActiveSubTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  portalActiveSubTab === tab.id
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${portalActiveSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* SUBTAB 1: APPOINTMENTS */}
          {portalActiveSubTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Upcoming & Recent Appointments
                </h3>
                <button
                  onClick={() => {
                    setSelectedDoctorForBooking(doctors[0]);
                    setIsBookingModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Schedule New Visit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activePatientAppointments.length > 0 ? (
                  activePatientAppointments.map((appt) => (
                    <div 
                      key={appt.id} 
                      className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            appt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {appt.status}
                          </span>
                          <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                            {appt.time}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                          {appt.doctorName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {appt.specialty} • {appt.type}
                        </p>

                        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar size={13} className="text-teal-600" />
                            <span>Date: <strong>{appt.date}</strong></span>
                          </div>
                          <div>Reason: {appt.reason}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        {appt.type === 'Telehealth Video' ? (
                          <button
                            onClick={() => onLaunchTelehealth(appt)}
                            className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Video size={13} />
                            <span>Enter Virtual Waiting Room</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => addNotification('Check-In Completed', `You are checked in for ${appt.doctorName}. Please take a seat in West Atrium.`, 'Success')}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Self Check-In (Arrival)
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <Calendar size={32} className="mx-auto text-slate-400 mb-2" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">No upcoming appointments scheduled</h4>
                    <p className="text-xs text-slate-500 mt-1">Book an appointment online with one of our specialists.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBTAB 2: PRESCRIPTIONS */}
          {portalActiveSubTab === 'prescriptions' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Medication Prescriptions & Refills
              </h3>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activePortalPatient.history.flatMap(h => h.prescriptions).map((rx, idx) => (
                    <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                          <Pill size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {rx.medication}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Dosage: {rx.dosage} • Frequency: {rx.frequency} • Duration: {rx.duration}
                          </p>
                          {rx.instructions && (
                            <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-1">
                              Directions: {rx.instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => addNotification('Pharmacy Refill Dispatched', `Refill request for ${rx.medication} transmitted to St. Jude Outpatient Pharmacy.`, 'Success')}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                      >
                        Request Refill
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3: DIAGNOSTIC & LAB RESULTS */}
          {portalActiveSubTab === 'labs' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Laboratory & Diagnostic Imaging Reports
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activePortalPatient.labTests && activePortalPatient.labTests.length > 0 ? (
                  activePortalPatient.labTests.map((lab) => (
                    <div key={lab.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {lab.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          lab.flags === 'Normal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Flag: {lab.flags || 'Normal'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{lab.testName}</h4>
                        <p className="text-xs text-slate-500 font-medium">Ordered by {lab.doctorName} • {lab.date}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Diagnostic Finding:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{lab.results || 'Pending Lab Analysis'}</span>
                        </div>
                        {lab.normalRange && (
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Reference Range:</span>
                            <span>{lab.normalRange}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <FileText size={32} className="mx-auto text-slate-400 mb-2" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">No lab tests logged</h4>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBTAB 4: MESSAGING */}
          {portalActiveSubTab === 'messages' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Secure Physician Care Team Messaging
              </h3>

              {/* Message List */}
              <div className="space-y-4">
                {activePatientMsgs.map((msg) => (
                  <div key={msg.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{msg.senderName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                          {msg.senderRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{msg.subject}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {msg.message}
                    </p>

                    {msg.replies && msg.replies.map(rep => (
                      <div key={rep.id} className="ml-6 p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/30 text-xs">
                        <div className="font-bold text-teal-900 dark:text-teal-200 text-[11px] mb-1">{rep.senderName} • {rep.timestamp}</div>
                        <p className="text-slate-700 dark:text-slate-300">{rep.message}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Send New Message Form */}
              <form onSubmit={handleSendPortalMessage} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Compose Message to Clinical Care Team
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">To Attending Clinician:</label>
                    <select
                      value={selectedRecipientDoctor}
                      onChange={(e) => setSelectedRecipientDoctor(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100"
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <textarea
                  rows={3}
                  placeholder="Describe your health question, symptoms, or prescription inquiry..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Send size={13} />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          )}

          {/* SUBTAB 5: SUMMARY & FHIR EXPORT */}
          {portalActiveSubTab === 'summary' && (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Patient Longitudinal Clinical Record
                  </h3>
                  <p className="text-xs text-slate-500">Compliant with USCDI v4 & HL7 FHIR Healthcare Exchange Standards</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Medical Summary</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Demographics</div>
                  <div><strong>Name:</strong> {activePortalPatient.name}</div>
                  <div><strong>Age / Gender:</strong> {activePortalPatient.age} yrs • {activePortalPatient.gender}</div>
                  <div><strong>Blood Type:</strong> {activePortalPatient.bloodType}</div>
                  <div><strong>Emergency Contact:</strong> {activePortalPatient.emergencyContact?.name || 'Spouse'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Known Allergies</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activePortalPatient.allergies.map((allg, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold text-[10px]">
                        {allg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Active Diagnosis</div>
                  <div className="font-bold text-slate-900 dark:text-white">{activePortalPatient.condition}</div>
                  <div className="text-[11px] text-slate-500">Status: {activePortalPatient.status}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* 6. PATIENT & VISITOR GUIDE */}
      {/* ========================================================== */}
      {activeSection === 'visitor-guide' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Visitor Experience & Amenities
            </span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Patient & Visitor Information Guide
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              Everything you need to know about visiting loved ones, parking, dining, accommodations, and hospital policies at St. Jude Clinic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visitorGuides.map((guide) => (
              <div 
                key={guide.id} 
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                    {guide.category}
                  </span>
                  {guide.timing && (
                    <span className="text-[11px] font-mono text-slate-400">{guide.timing}</span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {guide.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {guide.details}
                </p>

                {guide.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <MapPin size={13} className="text-teal-600" />
                    <span>{guide.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 7. EVIDENCE-BASED HEALTH LIBRARY */}
      {/* ========================================================== */}
      {activeSection === 'health-library' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Wellness & Clinical Research
            </span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              St. Jude Health & Medicine Library
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              Medically reviewed health education, preventative lifestyle protocols, and breakthrough clinical therapies authored by our medical faculty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((art) => (
              <div 
                key={art.id} 
                onClick={() => setSelectedArticleModal(art)}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
              >
                <div className="relative h-52 overflow-hidden">
                  <img 
                    src={art.imageUrl} 
                    alt={art.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold">
                    {art.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider mb-1">
                      {art.readTime} • Published {art.publishDate}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>By {art.author}</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400 group-hover:underline">Read Article &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ONLINE APPOINTMENT BOOKING MODAL */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsBookingModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] overflow-y-auto my-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Book Clinical Appointment
                    </h3>
                    <p className="text-[11px] text-slate-500">St. Jude Clinic Patient Scheduling</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={bookingFormData.patientName}
                      onChange={(e) => setBookingFormData(prev => ({ ...prev, patientName: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={bookingFormData.patientPhone}
                      onChange={(e) => setBookingFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Clinician *</label>
                    <select
                      value={bookingFormData.doctorId}
                      onChange={(e) => setBookingFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Consultation Mode *</label>
                    <select
                      value={bookingFormData.type}
                      onChange={(e) => setBookingFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
                    >
                      <option value="In-Person">In-Person Clinic Visit</option>
                      <option value="Telehealth Video">Telehealth Video Consult</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Date * (Present / Future)</label>
                      <input
                        type="date"
                        min={todayLiveDateStr}
                        required
                        value={bookingFormData.date}
                        onChange={(e) => {
                          setBookingFormData(prev => ({ ...prev, date: e.target.value }));
                          if (e.target.value < todayLiveDateStr) {
                            setPublicBookingDateError(`Past date selected. Please select today (${todayLiveDateStr}) or a future continuous date.`);
                          } else {
                            setPublicBookingDateError('');
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono ${
                          publicBookingDateError ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-950' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Time Slot *</label>
                      <select
                        value={bookingFormData.time}
                        onChange={(e) => setBookingFormData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
                      >
                        {['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:45 PM'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {publicBookingDateError && (
                    <div className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 font-bold">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>{publicBookingDateError}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Medical Reason / Symptoms *</label>
                  <textarea
                    rows={2}
                    required
                    value={bookingFormData.reason}
                    onChange={(e) => setBookingFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-2.5 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors cursor-pointer"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOOKING CONFIRMATION SUCCESS MODAL */}
      <AnimatePresence>
        {bookingSuccessModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) setBookingSuccessModal(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Appointment Successfully Confirmed!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your appointment with <strong>{bookingSuccessModal.doctorName}</strong> is locked for <strong>{bookingSuccessModal.date}</strong> at <strong>{bookingSuccessModal.time}</strong>.
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 text-left font-mono">
                <div>Appointment Ref: {bookingSuccessModal.id}</div>
                <div>Type: {bookingSuccessModal.type}</div>
                <div>Status: Confirmed & Synchronized with EMR</div>
              </div>
              <button
                onClick={() => setBookingSuccessModal(null)}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ARTICLE READER MODAL */}
      <AnimatePresence>
        {selectedArticleModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedArticleModal(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full">
                  {selectedArticleModal.category}
                </span>
                <button onClick={() => setSelectedArticleModal(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {selectedArticleModal.title}
              </h2>

              <div className="text-xs text-slate-400 font-medium">
                By {selectedArticleModal.author} ({selectedArticleModal.authorTitle}) • Reviewed by {selectedArticleModal.medicalReviewer}
              </div>

              <img src={selectedArticleModal.imageUrl} alt={selectedArticleModal.title} className="w-full h-56 rounded-2xl object-cover" />

              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedArticleModal.content}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedArticleModal(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEPARTMENT DETAIL MODAL */}
      <AnimatePresence>
        {selectedDeptModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedDeptModal(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full">
                  {selectedDeptModal.specialtyCode} Pavilion
                </span>
                <button onClick={() => setSelectedDeptModal(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {selectedDeptModal.name}
              </h2>

              <img src={selectedDeptModal.image} alt={selectedDeptModal.name} className="w-full h-56 rounded-2xl object-cover" />

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedDeptModal.description}
              </p>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Specialized Clinical Services:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDeptModal.keyServices.map((s, idx) => (
                    <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Head: {selectedDeptModal.headOfDepartment}</span>
                <button
                  onClick={() => {
                    const docMatch = doctors.find(d => d.specialty.toLowerCase() === selectedDeptModal.specialtyCode.toLowerCase()) || doctors[0];
                    setSelectedDeptModal(null);
                    setSelectedDoctorForBooking(docMatch);
                    setIsBookingModalOpen(true);
                  }}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  Book with Institute Specialists
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <ClinicLogo size="sm" id="public-footer-clinic-logo" />
                <span>St. Jude Clinic</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Center for Advanced Clinical Care, Robotic Surgery & Inpatient Medicine.
              </p>
              <div className="text-xs text-teal-400 font-medium">
                Emergency Hotline: (800) 555-JUDE
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Clinical Centers</h4>
              <ul className="space-y-2 text-xs">
                <li>Cardiovascular Institute</li>
                <li>Brain & Neurological Sciences</li>
                <li>Comprehensive Cancer Center</li>
                <li>Orthopedics & Joint Care</li>
                <li>Emergency & Level 1 Trauma</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Patients & Visitors</h4>
              <ul className="space-y-2 text-xs">
                <li>Visiting Guidelines</li>
                <li>Campus Map & Parking</li>
                <li>Insurance Coverage Checker</li>
                <li>Financial Assistance</li>
                <li>MyChart Patient Portal</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Health Professionals</h4>
              <p className="text-xs text-slate-400 mb-3">
                Authorized clinical faculty and administrative staff can enter the secure EHR portal below:
              </p>
              <button
                onClick={onSwitchToEhr}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                id="footer-staff-emr-portal-btn"
              >
                <Stethoscope size={14} />
                <span>Launch Clinical EMR System &rarr;</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
            <div>© 2026 St. Jude Clinic & Health System. All rights reserved. HIPAA & HITECH Compliant.</div>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <span className="hover:underline cursor-pointer">Privacy Practices</span>
              <span className="hover:underline cursor-pointer">Patient Rights</span>
              <span className="hover:underline cursor-pointer">Terms of Care</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
