import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CalendarCheck, 
  Activity, 
  Stethoscope, 
  ArrowUpRight, 
  ArrowDownRight, 
  Bed, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Flame, 
  ShieldAlert,
  SlidersHorizontal,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';
import { Patient, Doctor, Appointment, BedAlloc, UserRole } from '../types';
import LiveVitalsMonitorWidget from './LiveVitalsMonitorWidget';
import HospitalFloorPlanWidget from './HospitalFloorPlanWidget';

interface DashboardViewProps {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  beds: BedAlloc[];
  setBeds: (beds: BedAlloc[]) => void;
  activeRole: UserRole;
  activeDoctorId: string;
  activeDoctorName: string;
  onCheckIn: (appointmentId: string) => void;
  onSelectPatient: (patientId: string) => void;
  onSelectTab: (tab: string) => void;
}

// Widget ID Type definition
export type DashboardWidgetId = 
  | 'highlightsSlider'
  | 'kpiMatrix'
  | 'liveVitalsMonitor'
  | 'hospitalFloorPlan'
  | 'patientLoadChart'
  | 'bedAvailability'
  | 'receptionQueue'
  | 'activePhysicians';

interface WidgetConfig {
  id: DashboardWidgetId;
  title: string;
  category: 'Overview' | 'Analytics' | 'Operations';
  description: string;
  defaultVisible: boolean;
}

const DASHBOARD_WIDGETS: WidgetConfig[] = [
  {
    id: 'highlightsSlider',
    title: 'Clinical Hub Highlights & Announcements',
    category: 'Overview',
    description: 'Dynamic carousel showing medical center updates and facility highlights.',
    defaultVisible: true
  },
  {
    id: 'kpiMatrix',
    title: 'Key Operational Metrics (KPI Cards)',
    category: 'Overview',
    description: 'Registered census, today\'s scheduled actions, and bed occupancy.',
    defaultVisible: true
  },
  {
    id: 'liveVitalsMonitor',
    title: 'Real-Time Patient Vitals & ECG Waveform (D3.js)',
    category: 'Analytics',
    description: 'Continuous simulated telemetry streaming heart rate, blood pressure, SpO2, and arrhythmia detection.',
    defaultVisible: true
  },
  {
    id: 'hospitalFloorPlan',
    title: 'Interactive Hospital Architectural Floor Plan',
    category: 'Operations',
    description: 'Multi-level department heatmap color-coded by live occupancy level and bed census.',
    defaultVisible: true
  },
  {
    id: 'patientLoadChart',
    title: 'Patient Attendance & Trauma Trends',
    category: 'Analytics',
    description: 'Interactive SVG visualizer of daily visits and emergency triages.',
    defaultVisible: true
  },
  {
    id: 'bedAvailability',
    title: 'Live Ward Bed Availability & Allocation',
    category: 'Operations',
    description: 'Real-time bed occupancy meter by ICU, General, and Pediatric units.',
    defaultVisible: true
  },
  {
    id: 'receptionQueue',
    title: 'Active Reception & Triage Queue',
    category: 'Operations',
    description: 'Real-time check-in stream of today\'s scheduled patient consultations.',
    defaultVisible: true
  },
  {
    id: 'activePhysicians',
    title: 'Active Staff Physicians On Shift',
    category: 'Operations',
    description: 'Roster of on-duty surgeons and doctors with duty status.',
    defaultVisible: true
  }
];

const DEFAULT_WIDGET_STATE: Record<DashboardWidgetId, boolean> = {
  highlightsSlider: true,
  kpiMatrix: true,
  liveVitalsMonitor: true,
  hospitalFloorPlan: true,
  patientLoadChart: true,
  bedAvailability: true,
  receptionQueue: true,
  activePhysicians: true
};

const STORAGE_KEY = 'st_jude_dashboard_widget_layout';

// Unsplash premium clinical photos for the Carousel Slider
const SLIDE_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop',
    title: 'St. Jude Integrated Medical Center',
    desc: 'Equipped with ultra-low latency telemetry, custom robotic diagnostics, and smart ambient patient sensors.'
  },
  {
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1200&auto=format&fit=crop',
    title: 'Precision Surgical Operating Theatres',
    desc: 'Real-time blood profiling and neurological tracking overlays during invasive procedures.'
  },
  {
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop',
    title: 'Neonatal & Complex Intensive Care Units',
    desc: 'Constant subacute climate metrics supporting critical developmental parameters.'
  }
];

export default function DashboardView({
  patients,
  doctors,
  appointments,
  beds,
  setBeds,
  activeRole,
  activeDoctorId,
  activeDoctorName,
  onCheckIn,
  onSelectPatient,
  onSelectTab,
}: DashboardViewProps) {
  // Carousel state
  const [slideIdx, setSlideIdx] = useState(0);
  const [activeChartFilter, setActiveChartFilter] = useState<'visitor' | 'bed'>('visitor');
  const [selectedChartPoint, setSelectedChartPoint] = useState<number | null>(7);

  // Widget Customization Modal State with localStorage persistence
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<Record<DashboardWidgetId, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_WIDGET_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read widget layout from localStorage:', e);
    }
    return DEFAULT_WIDGET_STATE;
  });

  // Save to localStorage when modified
  const toggleWidget = (id: DashboardWidgetId) => {
    setVisibleWidgets((prev) => {
      const nextState = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch (e) {
        console.warn('Could not persist widget layout:', e);
      }
      return nextState;
    });
  };

  const resetToDefaultLayout = () => {
    setVisibleWidgets(DEFAULT_WIDGET_STATE);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WIDGET_STATE));
    } catch (e) {
      console.warn('Could not persist default layout:', e);
    }
  };

  // Auto cyclic slider callback
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setSlideIdx((prev) => (prev + 1) % SLIDE_IMAGES.length);
  };
  const prevSlide = () => {
    setSlideIdx((prev) => (prev - 1 + SLIDE_IMAGES.length) % SLIDE_IMAGES.length);
  };

  // KPI Computations
  const doctorPatients = patients.filter(pat => 
    appointments.some(appt => appt.patientId === pat.id && appt.doctorId === activeDoctorId) ||
    pat.history.some(rec => rec.doctor === activeDoctorName)
  );
  const totalPatientsCount = activeRole === 'Doctor' ? doctorPatients.length : patients.length + 840; // Filtered to Doctor-specific caseload in roleplay
  const activeBedsCount = beds.reduce((sum, b) => sum + b.occupied, 0);
  const totalBedsCount = beds.reduce((sum, b) => sum + b.total, 0);
  const globalBedsOccupancy = Math.round((activeBedsCount / totalBedsCount) * 100);

  const appointmentsToday = appointments.filter(a => {
    const isToday = a.date === '2026-05-21';
    if (activeRole === 'Doctor') {
      return isToday && a.doctorId === activeDoctorId;
    }
    return isToday;
  });
  const pendingCheckins = appointmentsToday.filter(a => a.status === 'Scheduled');
  const completedToday = appointmentsToday.filter(a => a.status === 'Completed');

  const onDutyDoctors = doctors.filter(d => d.status === 'On Duty' || d.status === 'In Surgery');

  // Interactive Chart Mock Data for past 10 days
  const visitsHistory = [
    { day: '05/11', count: 142, beds: 82, emerg: 24 },
    { day: '05/12', count: 156, beds: 80, emerg: 29 },
    { day: '05/13', count: 130, beds: 78, emerg: 18 },
    { day: '05/14', count: 168, beds: 84, emerg: 32 },
    { day: '05/15', count: 185, beds: 88, emerg: 40 },
    { day: '05/16', count: 144, beds: 85, emerg: 21 },
    { day: '05/17', count: 120, beds: 81, emerg: 15 },
    { day: '05/18', count: 162, beds: 84, emerg: 27 },
    { day: '05/19', count: 175, beds: 89, emerg: 35 },
    { day: '05/20', count: 190, beds: 91, emerg: 42 },
    { day: '05/21', count: 198, beds: 90, emerg: 38 }
  ];

  // Quick Bed Allocation
  const adjustBedCapacity = (id: string, dir: 'inc' | 'dec') => {
    if (activeRole !== 'Admin' && activeRole !== 'Receptionist') return;
    setBeds(
      beds.map(b => {
        if (b.id === id) {
          const newOccupied = dir === 'inc' 
            ? Math.min(b.total, b.occupied + 1)
            : Math.max(0, b.occupied - 1);
          return {
            ...b,
            occupied: newOccupied,
            available: b.total - newOccupied
          };
        }
        return b;
      })
    );
  };

  const activeWidgetsCount = Object.values(visibleWidgets).filter(Boolean).length;

  return (
    <div className="space-y-6">

      {/* Action Toolbar Header with Customize Layout Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 px-5 py-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Executive Command Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time diagnostic telemetry, inpatient census & care coordination.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-800 transition-all cursor-pointer shadow-xs"
            id="customize-layout-btn"
          >
            <SlidersHorizontal size={14} className="text-teal-600 dark:text-teal-400" />
            <span>Customize Layout</span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-600 text-white text-[10px] font-mono">
              {activeWidgetsCount}/{DASHBOARD_WIDGETS.length}
            </span>
          </button>
        </div>
      </div>

      {/* Widget 1: Top Media Highlights Slider */}
      {visibleWidgets.highlightsSlider && (
        <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group animate-in fade-in duration-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIdx}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.8 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={SLIDE_IMAGES[slideIdx].url} 
                alt={SLIDE_IMAGES[slideIdx].title}
                className="w-full h-full object-cover brightness-[0.45] saturate-[1.15]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>

          {/* Floating gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10" />

          {/* Slide Content Overlay */}
          <div className="absolute bottom-6 left-8 right-8 z-10 text-white select-none">
            <span className="px-2 py-0.5 rounded bg-teal-600 text-[10px] font-mono tracking-widest font-black uppercase shadow-xs">
              Clinical Hub Update
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-white mt-2">
              {SLIDE_IMAGES[slideIdx].title}
            </h2>
            <p className="text-xs text-slate-200 mt-1 max-w-2xl font-sans leading-relaxed">
              {SLIDE_IMAGES[slideIdx].desc}
            </p>
          </div>

          {/* Slide navigation controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 z-20 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={prevSlide}
              className="p-1.5 rounded-full bg-slate-950/50 hover:bg-slate-950 text-white border border-white/10 shrink-0 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextSlide}
              className="p-1.5 rounded-full bg-slate-950/50 hover:bg-slate-950 text-white border border-white/10 shrink-0 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Carousel indicators */}
          <div className="absolute bottom-5 right-8 z-20 flex items-center gap-1.5">
            {SLIDE_IMAGES.map((_, i) => (
              <button
                 key={i}
                 onClick={() => setSlideIdx(i)}
                 className={`h-1.5 rounded-full transition-all cursor-pointer ${
                   slideIdx === i ? 'w-5 bg-teal-500' : 'w-1.5 bg-white/40'
                 }`}
               />
            ))}
          </div>
        </div>
      )}

      {/* Widget 2: KPI Stats Cards Matrix */}
      {visibleWidgets.kpiMatrix && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${
          activeRole === 'Doctor' ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
        } gap-4 animate-in fade-in duration-200`}>
          
          {/* Card 1: Patients admitted */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Registered Census</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalPatientsCount}</p>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-emerald-500 font-bold">
                <ArrowUpRight size={14} />
                <span>+3.2% this mth</span>
              </div>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-950/40 rounded-xl text-teal-700 dark:text-teal-400">
              <Users size={22} />
            </div>
          </div>

          {/* Card 2: Today Appointments queue */}
          {activeRole !== 'Admin' && activeRole !== 'Receptionist' && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Scheduled Actions Today</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{appointmentsToday.length}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-teal-600 dark:text-teal-400">{pendingCheckins.length} Active</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="font-medium text-emerald-500">{completedToday.length} Done</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                <CalendarCheck size={22} />
              </div>
            </div>
          )}

          {/* Card 3: Bed allocation census */}
          {activeRole !== 'Doctor' && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Clinical Bed Occupancy</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{globalBedsOccupancy}%</p>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-rose-500 font-medium font-sans">
                  <span className="font-extrabold">{totalBedsCount - activeBedsCount} Critical Beds Open</span>
                </div>
              </div>
              <div className="p-3 bg-teal-100 dark:bg-teal-950/50 rounded-xl text-teal-600 dark:text-teal-400">
                <Bed size={22} />
              </div>
            </div>
          )}

          {/* Card 4: Doctors duty tracker */}
          {activeRole !== 'Doctor' && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Surgical Staff Active</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{onDutyDoctors.length} / {doctors.length}</p>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold">
                  <span className="text-amber-500 animate-pulse font-extrabold">● 1 In Complex OR</span>
                </div>
              </div>
              <div className="p-3 bg-rose-100 dark:bg-rose-950/50 rounded-xl text-rose-600 dark:text-rose-400">
                <Stethoscope size={22} />
              </div>
            </div>
          )}

        </div>
      )}

      {/* Widget: Live Continuous Patient Vitals Monitor (D3.js Line Chart) */}
      {visibleWidgets.liveVitalsMonitor && (
        <div className="animate-in fade-in duration-200">
          <LiveVitalsMonitorWidget
            patients={patients}
            onSelectPatient={onSelectPatient}
          />
        </div>
      )}

      {/* Widget: Interactive Hospital Architectural Floor Plan */}
      {visibleWidgets.hospitalFloorPlan && (
        <div className="animate-in fade-in duration-200">
          <HospitalFloorPlanWidget
            patients={patients}
            doctors={doctors}
            beds={beds}
            onSelectTab={onSelectTab}
          />
        </div>
      )}

      {/* Main Insights Chart & Bed Occupancy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 3: Left Column - Interactive Patient visits trend chart */}
        {visibleWidgets.patientLoadChart && (
          <div className={`${visibleWidgets.bedAvailability ? 'lg:col-span-2' : 'lg:col-span-3'} p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm animate-in fade-in duration-200`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Clinical Patient Load Overview</h3>
                <p className="text-xs text-slate-400">High-fidelity live tracking of diagnostic emergency rooms & admissions over 11 days.</p>
              </div>
              
              <div className="flex gap-1.5 rounded-lg border border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900 p-0.5">
                <button
                  onClick={() => setActiveChartFilter('visitor')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                    activeChartFilter === 'visitor'
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-400'
                  }`}
                >
                  Visits Count
                </button>
                <button
                  onClick={() => setActiveChartFilter('bed')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                    activeChartFilter === 'bed'
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-400'
                  }`}
                >
                  Inbound Trauma
                </button>
              </div>
            </div>

            {/* Custom SVG Line Chart with glow gradients & point interactivity */}
            <div className="relative w-full h-64 bg-slate-50/20 dark:bg-slate-950/20 rounded-xl p-2 border border-slate-100 dark:border-slate-900/60 flex flex-col justify-end">
              
              {/* SVG Elements */}
              <svg 
                viewBox="0 0 550 180" 
                className="w-full h-4/5 select-none overflow-hidden"
                id="visits-analytic-svg"
              >
                {/* Gradients */}
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="traumaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="30" x2="550" y2="30" stroke="#f1f5f9" className="dark:stroke-slate-900" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="550" y2="80" stroke="#f1f5f9" className="dark:stroke-slate-900" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="130" x2="550" y2="130" stroke="#f1f5f9" className="dark:stroke-slate-900" strokeWidth="1" strokeDasharray="3 3" />

                {/* Chart Line Path Calculation */}
                {(() => {
                  const values = activeChartFilter === 'visitor' 
                    ? visitsHistory.map(h => h.count)
                    : visitsHistory.map(h => h.emerg);
                  
                  const minVal = activeChartFilter === 'visitor' ? 100 : 10;
                  const maxVal = activeChartFilter === 'visitor' ? 210 : 45;
                  const range = maxVal - minVal;

                  // Map points to SVG coordinates
                  const coords = values.map((val, idx) => {
                    const x = idx * 55;
                    const ratio = (val - minVal) / range;
                    // y maps between 150 (bottom) and 20 (top)
                    const y = 150 - (ratio * 120);
                    return { x, y };
                  });

                  // Generate SVG path string
                  const dPath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                  // Generate Area string for fill
                  const dArea = `${dPath} L ${coords[coords.length - 1].x} 155 L ${coords[0].x} 155 Z`;

                  const mainColor = activeChartFilter === 'visitor' ? '#0d9488' : '#f43f5e';
                  const gradientId = activeChartFilter === 'visitor' ? 'url(#chartGlow)' : 'url(#traumaGlow)';

                  return (
                    <>
                      {/* Area under line */}
                      <path d={dArea} fill={gradientId} />

                      {/* Bold stroke line */}
                      <path 
                        d={dPath} 
                        fill="none" 
                        stroke={mainColor} 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="drop-shadow-[0_2px_8px_rgba(13,148,136,0.35)]"
                      />

                      {/* Interactive Points on Line */}
                      {coords.map((c, idx) => {
                        const isSelected = selectedChartPoint === idx;
                        return (
                          <g 
                            key={idx} 
                            onClick={() => setSelectedChartPoint(idx)}
                            className="cursor-pointer group/node"
                          >
                            <circle
                              cx={c.x}
                              cy={c.y}
                              r={isSelected ? '6.5' : '4'}
                              fill={isSelected ? '#ffffff' : mainColor}
                              stroke={mainColor}
                              strokeWidth={isSelected ? '3' : '1.5'}
                              className="transition-all duration-150"
                            />
                            <circle
                              cx={c.x}
                              cy={c.y}
                              r="11"
                              fill="transparent"
                            />
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>

              {/* X-axis labels alignment */}
              <div className="flex justify-between px-1.5 pt-2 border-t border-slate-100 dark:border-slate-900/50">
                {visitsHistory.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedChartPoint(i)}
                    className={`text-[9px] font-mono font-bold uppercase transition-all tracking-tight ${
                      selectedChartPoint === i 
                        ? 'text-teal-600 dark:text-teal-400 font-extrabold scale-110' 
                        : 'text-slate-400 hover:text-slate-500'
                    }`}
                  >
                    {h.day}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Tooltip readout area */}
            <div className="mt-4 p-3 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Data Point: <span className="font-extrabold text-slate-800 dark:text-slate-200">{visitsHistory[selectedChartPoint ?? 10].day}</span>
                </span>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">TOTAL ATTENDANCE</span>
                  <span className="text-xs font-mono font-black text-teal-600 dark:text-teal-400">{visitsHistory[selectedChartPoint ?? 10].count} patients</span>
                </div>
                <div className="text-right border-l border-slate-100 dark:border-slate-900 pl-4">
                  <span className="text-[10px] text-slate-400 font-bold block">AMBULANCE TRIAGES</span>
                  <span className="text-xs font-mono font-black text-rose-500">{visitsHistory[selectedChartPoint ?? 10].emerg} emergencies</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Widget 4: Right Column - Real-time Bed Allocation Census */}
        {visibleWidgets.bedAvailability && (
          <div className={`${!visibleWidgets.patientLoadChart ? 'lg:col-span-3' : ''} p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between animate-in fade-in duration-200`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Live Bed Availability</h3>
                <Bed size={16} className="text-teal-500" />
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Track allocated patient rooms and special care units in real-time. Toggle status checks as shifts change.
              </p>

              {/* Bed census listings */}
              <div className="space-y-3.5">
                {beds.map((b) => {
                  const percent = Math.round((b.occupied / b.total) * 100);
                  const isUrgent = percent >= 85;
                  return (
                    <div key={b.id} className="text-xs p-2.5 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{b.type} Units</span>
                          {isUrgent && (
                            <span className="px-1.5 py-0.2 bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 text-[8px] font-black uppercase tracking-wider rounded">
                              Critical Cap
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {b.occupied}/{b.total} beds ({percent}%)
                        </span>
                      </div>

                      {/* Loading indicator bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Admin/Receptionist rapid controls */}
                      {(activeRole === 'Admin' || activeRole === 'Receptionist') && (
                        <div className="flex justify-end gap-1.5 mt-2 pt-1 border-t border-slate-100 dark:border-slate-900/60">
                          <button
                            onClick={() => adjustBedCapacity(b.id, 'dec')}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                            title="Release 1 Bed"
                            disabled={b.occupied === 0}
                          >
                            - RELEASE
                          </button>
                          <button
                            onClick={() => adjustBedCapacity(b.id, 'inc')}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-teal-600 text-white hover:bg-teal-700 hover:shadow shadow-teal-500/20 cursor-pointer"
                            title="Exert & Book 1 Bed"
                            disabled={b.occupied === b.total}
                          >
                            + ALLOCATE
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900">
              <button
                onClick={() => onSelectTab('analytics')}
                className="w-full text-center py-2 text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Analyze Bed Outages &rarr;
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Grid: Live Appointment Feed & Critical Staff On Shift */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Widget 5: Left pane - Active Clinical Reception Queue */}
        {visibleWidgets.receptionQueue && (
          <div className={`${!visibleWidgets.activePhysicians ? 'md:col-span-2' : ''} p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm animate-in fade-in duration-200`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Active Reception Queue (May 21)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Quick triage desk & post-op patient status checks.</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wide">
                {pendingCheckins.length} PENDING ACTION
              </span>
            </div>

            <div className="space-y-2.5">
              {appointmentsToday.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-6">No appointments today</p>
              ) : (
                appointmentsToday.map((appt) => {
                  const isCompleted = appt.status === 'Completed';
                  const isCancelled = appt.status === 'Cancelled';
                  return (
                    <div 
                      key={appt.id}
                      className={`p-3 rounded-xl border flex items-center justify-between group transition-all ${
                        isCompleted 
                          ? 'bg-slate-50/50 border-slate-100 dark:bg-slate-900/10 dark:border-slate-800/60 opacity-65'
                          : isCancelled 
                          ? 'bg-rose-50/20 border-rose-100/40 dark:bg-rose-950/5 dark:border-rose-900/25 opacity-50'
                          : 'bg-gradient-to-r from-teal-50/10 to-indigo-50/10 dark:from-teal-950/5 dark:to-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => onSelectPatient(appt.patientId)}
                          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-teal-600 hover:text-teal-600"
                          title="View Patient Record"
                        >
                          {appt.patientName.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                             <p 
                              onClick={() => onSelectPatient(appt.patientId)}
                              className="text-xs font-bold text-slate-900 dark:text-white hover:text-teal-600 cursor-pointer"
                            >
                              {appt.patientName}
                            </p>
                            {appt.isUrgent && (
                              <span className="px-1 text-[8px] bg-rose-500 text-white font-extrabold rounded animate-pulse">
                                URGENT
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            With {appt.doctorName} • <span className="font-mono text-xs">{appt.time}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">{appt.reason}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full">
                            Checked In
                          </span>
                        ) : isCancelled ? (
                          <span className="text-[9px] font-mono text-slate-400">Cancelled</span>
                        ) : (activeRole === 'Admin' || activeRole === 'Receptionist') ? (
                          <button
                            onClick={() => onCheckIn(appt.id)}
                            className="px-2.5 py-1 text-[10.5px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm hover:shadow dark:shadow-emerald-950/30 cursor-pointer flex items-center gap-1"
                          >
                            <Check size={12} />
                            Check-In
                          </button>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-450 text-[10px] font-mono tracking-tighter uppercase font-bold rounded">
                            Ready for intake
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Widget 6: Right pane - Doctors On shift */}
        {visibleWidgets.activePhysicians && (
          <div className={`${!visibleWidgets.receptionQueue ? 'md:col-span-2' : ''} p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm animate-in fade-in duration-200`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Active Staff Physicians On Shift</h3>
                <p className="text-xs text-slate-400">Duty status and active surgical assignments.</p>
              </div>
              <button
                onClick={() => onSelectTab('doctors')}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                All Staff &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctors.slice(0, 4).map((doc) => {
                const isOnDuty = doc.status === 'On Duty';
                const isInSurgery = doc.status === 'In Surgery';
                return (
                  <div key={doc.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-950/20 flex items-center gap-3">
                    <img 
                      src={doc.image} 
                      alt={doc.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="overflow-hidden min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{doc.specialty}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isInSurgery ? 'bg-amber-500 animate-pulse' : isOnDuty ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Empty State when all widgets are toggled off */}
      {activeWidgetsCount === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <SlidersHorizontal size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">All Dashboard Widgets Are Hidden</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You have personalized your view by hiding all widgets. Click below to customize your layout or restore default widgets.
          </p>
          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <SlidersHorizontal size={14} />
            <span>Open Layout Customizer</span>
          </button>
        </div>
      )}

      {/* Modal: Customize Dashboard Layout */}
      <AnimatePresence>
        {isCustomizeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomizeModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden text-slate-800 dark:text-slate-100"
              id="customize-layout-modal"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <SlidersHorizontal size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Customize Dashboard Layout
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Toggle operational widgets on or off to personalize your workspace.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCustomizeModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Widget List */}
              <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {DASHBOARD_WIDGETS.map((widget) => {
                  const isVisible = visibleWidgets[widget.id];
                  return (
                    <div
                      key={widget.id}
                      onClick={() => toggleWidget(widget.id)}
                      className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isVisible
                          ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-900/40'
                          : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {widget.title}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {widget.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {widget.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWidget(widget.id);
                        }}
                        className={`p-2 rounded-xl transition-all ${
                          isVisible
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}
                        title={isVisible ? 'Hide Widget' : 'Show Widget'}
                      >
                        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <button
                  onClick={resetToDefaultLayout}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset to Default</span>
                </button>

                <button
                  onClick={() => setIsCustomizeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition-all cursor-pointer"
                >
                  Apply & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
