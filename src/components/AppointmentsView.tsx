import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  FileText, 
  UserCheck, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
  Filter,
  Video,
  MapPin,
  Search,
  LayoutGrid,
  List,
  Info,
  CalendarRange,
  QrCode,
  Camera,
  Scan
} from 'lucide-react';
import { Appointment, Doctor, Patient, UserRole } from '../types';
import { saveAppointment, updateAppointmentRecord } from '../lib/dbService';
import FrontDeskQrScannerModal from './FrontDeskQrScannerModal';
import QrCodeCheckInModal from './QrCodeCheckInModal';

interface AppointmentsViewProps {
  appointments: Appointment[];
  setAppointments: (appts: Appointment[]) => void;
  doctors: Doctor[];
  patients: Patient[];
  activeRole: UserRole;
  activeDoctorId?: string;
  addNotification: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule') => void;
  searchTerm: string;
  openBookingOnVisit?: boolean;
  setOpenBookingOnVisit?: (val: boolean) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Specialty color map for calendar appointment badges
const SPECIALTY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Cardiology: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/60', dot: 'bg-rose-500' },
  Neurology: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/60', dot: 'bg-purple-500' },
  Oncology: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/60', dot: 'bg-amber-500' },
  Orthopedics: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/60', dot: 'bg-emerald-500' },
  Pediatrics: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800/60', dot: 'bg-sky-500' },
  'Internal Medicine': { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/60', dot: 'bg-indigo-500' },
  'General Surgery': { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800/60', dot: 'bg-teal-500' },
  Default: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/60', dot: 'bg-blue-500' },
};

export default function AppointmentsView({
  appointments,
  setAppointments,
  doctors,
  patients,
  activeRole,
  activeDoctorId,
  addNotification,
  searchTerm: globalSearchTerm,
  openBookingOnVisit,
  setOpenBookingOnVisit,
}: AppointmentsViewProps) {
  // Real-time live date simulation helper (today is dynamically computed or synced)
  const todayDateObj = useMemo(() => new Date(), []);
  const todayDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // View mode: 'calendar' (Monthly Grid), 'day' (Day timeline / single date view), 'list' (All Agenda list)
  const [viewMode, setViewMode] = useState<'calendar' | 'day' | 'list'>('calendar');
  
  // Current calendar viewing month & year (default to actual present date for live simulation)
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  
  // Selected single date for day-level drilldown (format: YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [doctorFilterMode, setDoctorFilterMode] = useState<'Mine' | 'All'>('All');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [bookingDateError, setBookingDateError] = useState<string>('');
  
  // Day Inspection Drawer / Popover
  const [inspectingDate, setInspectingDate] = useState<string | null>(null);
  
  // Front Desk Optical QR Scanner & Patient Pass Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedQrPassAppt, setSelectedQrPassAppt] = useState<Appointment | null>(null);

  // Form State
  const [patientId, setPatientId] = useState('');
  const [customPatientName, setCustomPatientName] = useState('');
  const [doctorId, setDoctorId] = useState(activeRole === 'Doctor' ? (activeDoctorId || '') : '');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [appointmentType, setAppointmentType] = useState<'In-Person' | 'Telehealth Video'>('In-Person');
  const [consultationFee, setConsultationFee] = useState<number>(200);
  const [reason, setReason] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [customNotes, setCustomNotes] = useState('');

  // Keyboard Escape listener to dismiss booking modal or inspection drawer
  useEffect(() => {
    if (!showBookingModal && !inspectingDate && !isScannerOpen && !selectedQrPassAppt) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowBookingModal(false);
        setInspectingDate(null);
        setIsScannerOpen(false);
        setSelectedQrPassAppt(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBookingModal, inspectingDate, isScannerOpen, selectedQrPassAppt]);

  // Front desk QR check-in execution
  const handleCheckInAppointment = (appointmentId: string, queueNumber: string) => {
    updateAppointmentRecord(appointmentId, { status: 'Checked In' }).catch(console.warn);
    setAppointments(
      appointments.map(a => a.id === appointmentId ? { ...a, status: 'Checked In' } : a)
    );
    const targetAppt = appointments.find(a => a.id === appointmentId);
    addNotification(
      'Admission Check-In Verified',
      `Patient ${targetAppt?.patientName || 'Patient'} has arrived and checked in via QR scan. Assigned ${queueNumber}.`,
      'Success'
    );
  };

  // Handle hotkeys triggered from home desk
  React.useEffect(() => {
    if (openBookingOnVisit && setOpenBookingOnVisit) {
      setBookingDate(selectedDate);
      setShowBookingModal(true);
      if (activeRole === 'Doctor' && activeDoctorId) {
        setDoctorId(activeDoctorId);
      }
      setOpenBookingOnVisit(false);
    }
  }, [openBookingOnVisit, activeRole, activeDoctorId, setOpenBookingOnVisit, selectedDate]);

  // Sync state if doctor swaps identities
  React.useEffect(() => {
    if (activeRole === 'Doctor' && activeDoctorId) {
      setDoctorId(activeDoctorId);
    }
  }, [activeDoctorId, activeRole]);

  // Generate calendar days for currentMonth and currentYear
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPast: boolean;
    }> = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const isPast = dateStr < todayDateStr;
      days.push({
        dayNumber: dayNum,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayDateStr,
        isPast,
      });
    }

    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isPast = dateStr < todayDateStr;
      days.push({
        dayNumber: i,
        dateString: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayDateStr,
        isPast,
      });
    }

    // Trailing days for next month to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isPast = dateStr < todayDateStr;
      days.push({
        dayNumber: i,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayDateStr,
        isPast,
      });
    }

    return days;
  }, [currentYear, currentMonth, todayDateStr]);

  // Appointments mapping by dateString for fast lookup in calendar
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    const query = (localSearch || globalSearchTerm).toLowerCase();

    appointments.forEach((appt) => {
      const matchesSearch = !query || 
        appt.patientName.toLowerCase().includes(query) ||
        appt.doctorName.toLowerCase().includes(query) ||
        (appt.reason && appt.reason.toLowerCase().includes(query)) ||
        appt.specialty.toLowerCase().includes(query);

      const matchesDoctor = (activeRole === 'Doctor' && doctorFilterMode === 'Mine')
        ? appt.doctorId === activeDoctorId
        : true;

      const matchesSpecialty = selectedSpecialtyFilter === 'All' || appt.specialty === selectedSpecialtyFilter;
      const matchesStatus = selectedStatusFilter === 'All' || appt.status === selectedStatusFilter;

      if (matchesSearch && matchesDoctor && matchesSpecialty && matchesStatus) {
        const existing = map.get(appt.date) || [];
        existing.push(appt);
        map.set(appt.date, existing);
      }
    });

    return map;
  }, [appointments, localSearch, globalSearchTerm, activeRole, doctorFilterMode, activeDoctorId, selectedSpecialtyFilter, selectedStatusFilter]);

  // Filtered appointments for single day view or list view
  const filteredAppointments = useMemo(() => {
    const query = (localSearch || globalSearchTerm).toLowerCase();
    return appointments.filter((appt) => {
      const matchesDate = viewMode === 'day' ? appt.date === selectedDate : true;
      const matchesSearch = !query ||
        appt.patientName.toLowerCase().includes(query) ||
        appt.doctorName.toLowerCase().includes(query) ||
        (appt.reason && appt.reason.toLowerCase().includes(query)) ||
        appt.specialty.toLowerCase().includes(query);
      
      const matchesDoctor = (activeRole === 'Doctor' && doctorFilterMode === 'Mine')
        ? appt.doctorId === activeDoctorId
        : true;

      const matchesSpecialty = selectedSpecialtyFilter === 'All' || appt.specialty === selectedSpecialtyFilter;
      const matchesStatus = selectedStatusFilter === 'All' || appt.status === selectedStatusFilter;

      return matchesDate && matchesSearch && matchesDoctor && matchesSpecialty && matchesStatus;
    });
  }, [appointments, viewMode, selectedDate, localSearch, globalSearchTerm, activeRole, doctorFilterMode, activeDoctorId, selectedSpecialtyFilter, selectedStatusFilter]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayDateStr);
  };

  // Open booking modal for a specific date
  const openBookingForDate = (dateStr: string) => {
    if (dateStr < todayDateStr) {
      alert(`Cannot book appointments for past dates (${dateStr}). Please select present day (${todayDateStr}) or future dates.`);
      return;
    }
    setBookingDate(dateStr);
    setSelectedDate(dateStr);
    setShowBookingModal(true);
  };

  // Action methods
  const changeStatus = (id: string, newStatus: 'Scheduled' | 'Completed' | 'Cancelled') => {
    // Persist to Cloud Database
    updateAppointmentRecord(id, { status: newStatus }).catch(err => {
      console.warn('Firestore update fallback to local state:', err);
    });

    setAppointments(
      appointments.map(a => {
        if (a.id === id) {
          const updated = { ...a, status: newStatus };
          if (newStatus === 'Completed') {
            addNotification(
              'Patient Attended Desk',
              `Check-in complete for ${a.patientName} under ${a.doctorName}. Vital logs loaded.`,
              'Success'
            );
          } else if (newStatus === 'Cancelled') {
            addNotification(
              'Appointment Voided',
              `Scheduled consultation with ${a.doctorName} for patient ${a.patientName} was cancelled.`,
              'Alert'
            );
          }
          return updated;
        }
        return a;
      })
    );
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const chosenDate = bookingDate || selectedDate;
    if (chosenDate < todayDateStr) {
      setBookingDateError(`Cannot schedule appointment for a past date (${chosenDate}). Please select today (${todayDateStr}) or a future date.`);
      return;
    }
    setBookingDateError('');

    if (!doctorId) {
      alert('Please check and select a practitioner.');
      return;
    }

    let finalPatientName = customPatientName;
    if (patientId) {
      const matchP = patients.find(p => p.id === patientId);
      if (matchP) finalPatientName = matchP.name;
    }

    if (!finalPatientName.trim() || !reason.trim()) {
      alert('Vitals complaint reason and patient details are mandatory.');
      return;
    }

    const docMatch = doctors.find(d => d.id === doctorId);
    const newAppt: Appointment = {
      id: `A${Date.now()}`,
      patientId: patientId || 'P99',
      patientName: finalPatientName,
      doctorId: doctorId,
      doctorName: docMatch ? docMatch.name : 'St. Jude General Practitioner',
      date: bookingDate || selectedDate,
      time: bookingTime,
      specialty: docMatch ? docMatch.specialty : 'Urgent Care',
      type: appointmentType,
      status: 'Scheduled',
      reason: reason,
      notes: customNotes,
      isUrgent: isUrgent,
      insuranceClaimStatus: 'Pending',
      consultationFee: consultationFee || 200,
      isBilled: false
    };

    // Save to Firestore Database
    saveAppointment(newAppt).catch(err => {
      console.warn('Firestore appointment save fallback to local state:', err);
    });

    setAppointments([newAppt, ...appointments]);
    setShowBookingModal(false);

    // Toast and add Notification
    addNotification(
      'New Slot Booked',
      `Assigned standard appointment for ${finalPatientName} with ${docMatch?.name} on ${bookingDate || selectedDate}`,
      'Success'
    );

    // Reset Form
    setPatientId('');
    setCustomPatientName('');
    setDoctorId(activeRole === 'Doctor' ? (activeDoctorId || '') : '');
    setReason('');
    setAppointmentType('In-Person');
    setConsultationFee(200);
    setIsUrgent(false);
    setCustomNotes('');
  };

  // Inspecting date appointments
  const inspectingAppts = inspectingDate ? (appointmentsByDate.get(inspectingDate) || []) : [];

  // Get total appointments in the currently viewed month
  const totalMonthAppointments = useMemo(() => {
    let count = 0;
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    appointments.forEach(a => {
      if (a.date.startsWith(monthPrefix)) count++;
    });
    return count;
  }, [appointments, currentYear, currentMonth]);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Interactive Calendar Controls */}
      <div className="p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md border border-blue-200/60 dark:border-blue-800/50">
                Outpatient Scheduling Hub
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • {totalMonthAppointments} consultations in {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1.5 font-sans tracking-tight">
              Hospital Appointment Management & Calendar
            </h2>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-bold select-none">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="toggle-month-view-btn"
              >
                <LayoutGrid size={14} />
                <span>Month View</span>
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="toggle-day-view-btn"
              >
                <Clock size={14} />
                <span>Day Timeline</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="toggle-list-view-btn"
              >
                <List size={14} />
                <span>Agenda List</span>
              </button>
            </div>

            {/* Front Desk Optical QR Scanner Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 hover:shadow-teal-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              id="front-desk-qr-scanner-btn"
            >
              <QrCode size={14} />
              <span>Front Desk Scanner (Camera)</span>
            </button>

            <button
              onClick={() => openBookingForDate(selectedDate)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-1.5 transition-all cursor-pointer ml-auto lg:ml-0"
              id="book-appointment-btn"
            >
              <Plus size={16} />
              Book Consult Slot
            </button>
          </div>
        </div>

        {/* Calendar Toolbar: Month Navigator & Search/Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-3 border-t border-slate-150 dark:border-slate-800/80">
          
          {/* Month Stepper & Today Quick Jump */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous Month"
              id="prev-month-btn"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <CalendarIcon size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="font-extrabold text-sm text-slate-900 dark:text-white min-w-[140px] text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Next Month"
              id="next-month-btn"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={handleJumpToToday}
              className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900/60 transition-colors cursor-pointer"
              id="jump-today-btn"
            >
              Today
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, doctor, reason..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Specialty Filter */}
            <select
              value={selectedSpecialtyFilter}
              onChange={(e) => setSelectedSpecialtyFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
            >
              <option value="All">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Oncology">Oncology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Internal Medicine">Internal Medicine</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Doctor Filter Mode */}
            {activeRole === 'Doctor' && (
              <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg text-[10px] select-none font-bold">
                <button
                  onClick={() => setDoctorFilterMode('Mine')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    doctorFilterMode === 'Mine'
                      ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  My Shift
                </button>
                <button
                  onClick={() => setDoctorFilterMode('All')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    doctorFilterMode === 'All'
                      ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  Hospital
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MONTHLY CALENDAR GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-center py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div key={day} className={idx === 0 || idx === 6 ? 'text-slate-400 dark:text-slate-500' : ''}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid Cells (7 columns) */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-850/70 border-b border-slate-200 dark:border-slate-800">
              {calendarGrid.map((cell) => {
                const dayAppts = appointmentsByDate.get(cell.dateString) || [];
                const isSelected = selectedDate === cell.dateString;
                const hasUrgent = dayAppts.some(a => a.isUrgent);

                return (
                  <div
                    key={cell.dateString}
                    onClick={() => {
                      setSelectedDate(cell.dateString);
                      setInspectingDate(cell.dateString);
                    }}
                    className={`min-h-[120px] p-2 flex flex-col justify-between transition-all cursor-pointer group relative ${
                      !cell.isCurrentMonth
                        ? 'bg-slate-50/40 dark:bg-slate-900/20 text-slate-300 dark:text-slate-700'
                        : isSelected
                        ? 'bg-blue-50/30 dark:bg-blue-950/20 ring-2 ring-blue-500/50 z-10'
                        : 'bg-white dark:bg-slate-950 hover:bg-slate-50/70 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Top Row: Date Number & Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-mono font-bold flex items-center justify-center w-6 h-6 rounded-full transition-all ${
                          cell.isToday
                            ? 'bg-rose-500 text-white shadow-xs font-black ring-2 ring-rose-300 dark:ring-rose-900'
                            : isSelected
                            ? 'bg-blue-600 text-white font-extrabold'
                            : cell.isPast
                            ? 'text-slate-400/80 dark:text-slate-600 line-through decoration-slate-300 dark:decoration-slate-700'
                            : cell.isCurrentMonth
                            ? 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}>
                          {cell.dayNumber}
                        </span>
                        {cell.isToday && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {hasUrgent && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" title="Urgent Case" />
                        )}
                        {dayAppts.length > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-bold">
                            {dayAppts.length}
                          </span>
                        )}
                        {/* Quick Add Button on Hover (only for present & future dates) */}
                        {!cell.isPast && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openBookingForDate(cell.dateString);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-opacity"
                            title={`Schedule for ${cell.dateString}`}
                          >
                            <Plus size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle: Appointment Badges / Pills */}
                    <div className="space-y-1 my-1 flex-1 overflow-hidden">
                      {dayAppts.slice(0, 3).map((appt) => {
                        const style = SPECIALTY_COLORS[appt.specialty] || SPECIALTY_COLORS.Default;
                        return (
                          <div
                            key={appt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(cell.dateString);
                              setInspectingDate(cell.dateString);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 border transition-all hover:scale-102 ${style.bg} ${style.text} ${style.border}`}
                            title={`${appt.time} - ${appt.patientName} (${appt.doctorName} • ${appt.specialty})`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${appt.isUrgent ? 'bg-red-500 animate-pulse' : style.dot}`} />
                            <span className="font-mono text-[9px] shrink-0">{appt.time.split(' ')[0]}</span>
                            <span className="truncate">{appt.patientName}</span>
                          </div>
                        );
                      })}

                      {dayAppts.length > 3 && (
                        <div className="text-[9px] font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-1">
                          +{dayAppts.length - 3} more consults...
                        </div>
                      )}
                    </div>

                    {/* Bottom Indicator for Empty Day */}
                    {dayAppts.length === 0 && cell.isCurrentMonth && (
                      <div className="text-[9px] text-slate-300 dark:text-slate-700 italic opacity-0 group-hover:opacity-100 transition-opacity">
                        No slots booked
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Specialty Legend:</span>
                {Object.entries(SPECIALTY_COLORS).filter(([k]) => k !== 'Default').map(([specialty, colors]) => (
                  <div key={specialty} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                    <span>{specialty}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Today's Date</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Critical Case</span>
                </span>
              </div>
            </div>

          </div>

          {/* Selected Date Inspector Popover / Drawer underneath calendar */}
          {inspectingDate && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <CalendarRange className="text-blue-600 dark:text-blue-400" size={18} />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Appointments for {new Date(inspectingDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {inspectingAppts.length} total scheduled consultations
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openBookingForDate(inspectingDate)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Slot to This Date
                  </button>
                  <button
                    onClick={() => setInspectingDate(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Day Appointment Cards */}
              {inspectingAppts.length === 0 ? (
                <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <CalendarDays size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No appointments scheduled for this date</p>
                  <button
                    onClick={() => openBookingForDate(inspectingDate)}
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Schedule first appointment &rarr;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {inspectingAppts.map((appt) => {
                    const isCompleted = appt.status === 'Completed';
                    const isCancelled = appt.status === 'Cancelled';
                    const specStyle = SPECIALTY_COLORS[appt.specialty] || SPECIALTY_COLORS.Default;

                    return (
                      <div
                        key={appt.id}
                        className={`p-4 rounded-xl border bg-slate-50/40 dark:bg-slate-900/40 flex flex-col justify-between space-y-3 transition-all ${
                          isCompleted
                            ? 'border-emerald-200 dark:border-emerald-950/40 opacity-75'
                            : isCancelled
                            ? 'border-red-200 dark:border-red-950/40 opacity-60'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {appt.patientName}
                              </span>
                              {appt.isUrgent && (
                                <span className="px-1.5 py-0.2 bg-red-500 text-white text-[8px] font-black uppercase rounded animate-pulse">
                                  URGENT
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                              isCancelled ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                            }`}>
                              {appt.status}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} className="text-blue-500" />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{appt.time}</span>
                              <span>•</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${specStyle.bg} ${specStyle.text}`}>
                                {appt.specialty}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Stethoscope size={12} className="text-slate-400" />
                              <span>{appt.doctorName}</span>
                            </div>
                            {appt.reason && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-2 pt-1">
                                "{appt.reason}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Change Buttons */}
                        {appt.status === 'Scheduled' && (
                          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <button
                              onClick={() => changeStatus(appt.id, 'Cancelled')}
                              className="px-2 py-1 text-[10px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded border border-rose-200 dark:border-rose-900/50 font-bold transition-colors"
                            >
                              Void Slot
                            </button>
                            <button
                              onClick={() => changeStatus(appt.id, 'Completed')}
                              className="px-3 py-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Check size={11} />
                              Check-In
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DAY TIMELINE VIEW & ON-DUTY SPECIALTIES */}
      {/* ========================================================================= */}
      {viewMode === 'day' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Slot grid listings */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs px-1">
              <div className="space-y-1">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                  Consultation Load for {selectedDate}:
                </span>
                {activeRole === 'Doctor' && (
                  <span className="text-[10px] text-indigo-500 block">
                    Active filter is locked to your practitioner identity context.
                  </span>
                )}
              </div>
              
              <span className="font-mono text-slate-400 shrink-0">
                {filteredAppointments.length} Bookings Active
              </span>
            </div>

            <div className="space-y-3">
              {filteredAppointments.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <CalendarDays size={32} className="mx-auto text-slate-300 dark:text-slate-800 mb-2" />
                  <p className="text-xs font-medium text-slate-400">No appointments scheduled for {selectedDate}</p>
                  <button
                    onClick={() => openBookingForDate(selectedDate)}
                    className="mt-3 text-xs text-blue-600 hover:underline font-bold"
                  >
                    Book first appointment slot &rarr;
                  </button>
                </div>
              ) : (
                filteredAppointments.map((appt) => {
                  const isScheduled = appt.status === 'Scheduled';
                  const isCompleted = appt.status === 'Completed';
                  const isCancelled = appt.status === 'Cancelled';
                  const specStyle = SPECIALTY_COLORS[appt.specialty] || SPECIALTY_COLORS.Default;

                  return (
                    <div 
                      key={appt.id}
                      className={`p-4 rounded-xl border bg-white dark:bg-slate-950/60 transition-all ${
                        isCompleted 
                          ? 'border-slate-150 dark:border-slate-850 opacity-70' 
                          : isCancelled 
                          ? 'border-red-100 dark:border-red-950/20 opacity-55'
                          : 'border-slate-200 dark:border-slate-800 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        
                        {/* Left: General patient context */}
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shrink-0">
                            {appt.time.split(':')[0]} {appt.time.includes('PM') ? 'PM' : 'AM'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {appt.patientName}
                              </h4>
                              {appt.isUrgent && (
                                <span className="px-1.5 py-0.2 bg-red-500 text-white text-[8px] font-black uppercase rounded animate-pulse">
                                  URGENT
                                </span>
                              )}
                            </div>
                            
                            <p className="text-[11px] text-slate-450 mt-1">
                              Slot: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{appt.time}</span> • Physician: <span className="font-bold text-slate-800 dark:text-slate-200">{appt.doctorName}</span> • Specialty: <span className={`font-bold ${specStyle.text}`}>{appt.specialty}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 italic mt-0.5 leading-relaxed">{appt.reason}</p>
                          </div>
                        </div>

                        {/* Right Status layout */}
                        <div className="flex flex-col sm:items-end gap-2 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-900">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider self-start sm:self-auto ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' :
                            isCancelled ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-950/45 dark:text-blue-450'
                          }`}>
                            {appt.status}
                          </span>

                          {/* Status Change rapid clickers for Receptionists and Admins */}
                          {isScheduled && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => changeStatus(appt.id, 'Cancelled')}
                                className="p-1 px-2 text-[10px] bg-rose-50/20 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-800 rounded select-none text-rose-500 hover:text-rose-600 transition-colors"
                                title="Cancel Session"
                              >
                                Void
                              </button>
                              <button
                                onClick={() => changeStatus(appt.id, 'Completed')}
                                className="p-1 px-3 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white rounded select-none shadow-xs font-bold transition-all flex items-center gap-1"
                                title="Mark Checkin Complete"
                              >
                                <Check size={11} />
                                Check-In
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                      
                      {/* Collapsible micro notes */}
                      {appt.notes && (
                        <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-100 dark:border-slate-900 text-[11px] text-slate-550 leading-relaxed font-sans flex items-start gap-1.5">
                          <FileText size={12} className="text-blue-500 mt-0.5 shrink-0" />
                          <span>Reception notes: {appt.notes}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right side panel: Clinicians available today & duty template info */}
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">On Duty Specialties</h3>
              <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                Verify medical disciplines before scheduling emergency diagnostic appointments.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {doctors.map((d) => (
                <div key={d.id} className="text-xs p-2.5 rounded-lg border border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-950/30 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{d.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{d.specialty} clinic</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    d.status === 'On Duty' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    {d.status === 'On Duty' ? 'Active' : d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AGENDA / FULL LIST VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              All Outpatient Scheduled Encounters ({filteredAppointments.length})
            </h3>
            <span className="text-xs text-slate-400">
              Sorted chronologically
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CalendarDays size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">No appointments matching current filters</p>
              </div>
            ) : (
              filteredAppointments.map((appt) => {
                const specStyle = SPECIALTY_COLORS[appt.specialty] || SPECIALTY_COLORS.Default;
                return (
                  <div key={appt.id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-center shrink-0">
                        <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
                          {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-base font-mono font-black text-slate-900 dark:text-white block leading-none mt-0.5">
                          {appt.date.split('-')[2]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {appt.patientName}
                          </span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${specStyle.bg} ${specStyle.text}`}>
                            {appt.specialty}
                          </span>
                          {appt.isUrgent && (
                            <span className="px-1.5 py-0.2 bg-red-500 text-white text-[8px] font-black uppercase rounded">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Time: <strong className="font-mono text-slate-700 dark:text-slate-300">{appt.time}</strong> • Physician: {appt.doctorName} • Type: {appt.type}
                        </p>
                        {appt.reason && (
                          <p className="text-[11px] text-slate-400 italic mt-0.5">{appt.reason}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                        appt.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                      }`}>
                        {appt.status}
                      </span>
                      {appt.status === 'Scheduled' && (
                        <button
                          onClick={() => changeStatus(appt.id, 'Completed')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors"
                        >
                          Check-In
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BOOKING MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showBookingModal && (
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex justify-center items-center p-3 sm:p-4 md:p-6 overflow-y-auto select-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowBookingModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col my-auto max-h-[92vh]"
            >
              
              {/* Header */}
              <div className="bg-slate-900 p-4 sm:p-5 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-blue-500 shrink-0" />
                  <span className="font-bold font-sans text-xs sm:text-sm tracking-tight text-white line-clamp-1">
                    Schedule Outpatient Clinical Appointment
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleBookingSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[calc(92vh-130px)]">
                
                {/* Toggle Patient: Registered vs Walk-In */}
                <div>
                  <label className="text-slate-400 block font-bold mb-1 uppercase tracking-wider text-[10px]">Patient Record</label>
                  <select
                    value={patientId}
                    onChange={(e) => {
                      setPatientId(e.target.value);
                      if (e.target.value) setCustomPatientName('');
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">-- [ New Walk-In Patient / Custom Input ] --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Age {p.age}, Blood: {p.bloodType || 'O+'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* If custom name walk-in */}
                {!patientId && (
                  <div>
                    <label className="text-slate-400 block font-bold mb-1 uppercase tracking-wider text-[10px]">Walk-In Patient Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter patient full legal name"
                      value={customPatientName}
                      onChange={(e) => setCustomPatientName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      required={!patientId}
                    />
                  </div>
                )}

                {/* Practitioner Assignment select */}
                <div>
                  <label className="text-slate-400 block font-bold mb-1 uppercase tracking-wider text-[10px]">Assign On-Duty Practitioner *</label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    required
                  >
                    <option value="">Choose physician...</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty} Specialist, {d.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time Slot Row */}
                <div className="space-y-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block font-bold mb-1 uppercase tracking-wider text-[10px]">Scheduled Date * (Present / Future)</label>
                      <input
                        type="date"
                        min={todayDateStr}
                        value={bookingDate}
                        onChange={(e) => {
                          setBookingDate(e.target.value);
                          if (e.target.value < todayDateStr) {
                            setBookingDateError(`Past date selected. Please select today (${todayDateStr}) or a future date.`);
                          } else {
                            setBookingDateError('');
                          }
                        }}
                        className={`w-full p-2 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono ${
                          bookingDateError ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-950' : 'border-slate-200 dark:border-slate-800'
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block font-bold mb-1 uppercase tracking-wider text-[10px]">Consult Time Slot</label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-100 font-mono"
                      >
                        <option value="08:30 AM">08:30 AM</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="09:30 AM">09:30 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="01:30 PM">01:30 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="02:30 PM">02:30 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                      </select>
                    </div>
                  </div>
                  {bookingDateError && (
                    <div className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 font-bold mt-1">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>{bookingDateError}</span>
                    </div>
                  )}
                </div>

                {/* Consultation Type & Fee Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block font-bold mb-1 uppercase tracking-wider text-[10px]">Consultation Mode</label>
                    <select
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value as 'In-Person' | 'Telehealth Video')}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-100"
                    >
                      <option value="In-Person">In-Person Clinic</option>
                      <option value="Telehealth Video">Telehealth Video</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block font-bold mb-1 uppercase tracking-wider text-[10px]">Consultation Fee ($)</label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                      min={0}
                    />
                  </div>
                </div>

                {/* Complaint / Primary reason */}
                <div>
                  <label className="text-slate-400 block font-bold mb-1 uppercase tracking-wider text-[10px]">Medical Complaint / Symptoms *</label>
                  <input
                    type="text"
                    placeholder="e.g. Substernal chest pain, chronic dyspnea, post-operative clearance"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                {/* Walk-in Receptionist notes */}
                <div>
                  <label className="text-slate-400 block font-bold mb-1 uppercase tracking-wider text-[10px]">Administrative Notes (Optional)</label>
                  <textarea
                    placeholder="Add triage level observations, billing notes, or clinical background..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Urgency state */}
                <div className="flex items-center gap-2.5 p-3 bg-red-50/40 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-950/30">
                  <input
                    type="checkbox"
                    id="is-urgent-check"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded border-slate-300 dark:border-slate-700 focus:ring-0 cursor-pointer shrink-0"
                  />
                  <div className="text-[11px]">
                    <label htmlFor="is-urgent-check" className="font-bold text-rose-600 dark:text-rose-400 block uppercase tracking-wider text-[9.5px] cursor-pointer">
                      Flag as Urgent / High Priority Encounter
                    </label>
                    <span className="text-slate-500 dark:text-slate-400">
                      Highlights this slot across the month grid and triggers trauma telemetry alerts.
                    </span>
                  </div>
                </div>

                {/* Modal actions */}
                <div className="pt-3 flex flex-wrap justify-end gap-2.5 border-t border-slate-100 dark:border-slate-900 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Authorize Session Booking
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Front Desk Optical QR Scanner Modal */}
      <FrontDeskQrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        appointments={appointments}
        onCheckInAppointment={handleCheckInAppointment}
      />

      {/* Patient QR Code Check-In Pass Modal */}
      <QrCodeCheckInModal
        isOpen={!!selectedQrPassAppt}
        onClose={() => setSelectedQrPassAppt(null)}
        appointment={selectedQrPassAppt}
        onSelfCheckIn={(id) => handleCheckInAppointment(id, 'Q-SELF')}
      />

    </div>
  );
}
