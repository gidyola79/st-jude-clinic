import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Bell, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Moon, 
  Sun, 
  Terminal, 
  UserCheck2,
  Check,
  Keyboard,
  HelpCircle,
  Building,
  Stethoscope,
  Globe,
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Activity,
  X,
  Menu,
  LogOut,
  Lock,
  Shield
} from 'lucide-react';
import { Notification, UserRole, Patient, Doctor, Appointment, StaffUser } from '../types';
import ClinicLogo from './ClinicLogo';

interface HeaderProps {
  appMode: 'public' | 'emr';
  setAppMode: (mode: 'public' | 'emr') => void;
  activeRole: UserRole;
  notifications: Notification[];
  setNotifications: (notif: Notification[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onQuickAction: (actionName: string) => void;
  onShowShortcutsHelp?: () => void;
  onOpenMobileMenu?: () => void;
  // Live dataset props for dropdown search preview
  patients?: Patient[];
  doctors?: Doctor[];
  appointments?: Appointment[];
  onNavigateTab?: (tabName: string) => void;
  onSelectPatient?: (patient: Patient) => void;
  onSelectDoctor?: (doctor: Doctor) => void;
  onRequestRoleChange?: (newRole: UserRole) => void;
  staffUser?: StaffUser | null;
  onSignOutStaff?: () => void;
}

export default function Header({
  appMode,
  setAppMode,
  activeRole,
  notifications,
  setNotifications,
  searchTerm,
  setSearchTerm,
  darkMode,
  setDarkMode,
  onQuickAction,
  onShowShortcutsHelp,
  onOpenMobileMenu,
  patients = [],
  doctors = [],
  appointments = [],
  onNavigateTab,
  onSelectPatient,
  onSelectDoctor,
  onRequestRoleChange,
  staffUser,
  onSignOutStaff
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [timeStr, setTimeStr] = useState('09:19 AM');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Elegant standard clock tracking
    const updateClock = () => {
      const date = new Date();
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      setTimeStr(`${hours}:${minutesStr} ${ampm}`);
    };
    
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Computed Search Results categorized by type
  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return { patients: [], doctors: [], appointments: [], totalCount: 0 };
    }

    // In public mode, hide confidential patient electronic records from search
    const matchedPatients = appMode === 'emr' ? patients.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.condition?.toLowerCase().includes(query) ||
      p.bloodType?.toLowerCase().includes(query) ||
      p.room?.toLowerCase().includes(query)
    ).slice(0, 4) : [];

    const matchedDoctors = doctors.filter(d => 
      d.name.toLowerCase().includes(query) ||
      d.specialty.toLowerCase().includes(query) ||
      d.department.toLowerCase().includes(query)
    ).slice(0, 3);

    // In public mode, only show general consult info, not patient medical reasons
    const matchedAppointments = appMode === 'emr' ? appointments.filter(a => 
      a.patientName.toLowerCase().includes(query) ||
      a.doctorName.toLowerCase().includes(query) ||
      a.specialty.toLowerCase().includes(query) ||
      a.reason.toLowerCase().includes(query)
    ).slice(0, 3) : [];

    const totalCount = matchedPatients.length + matchedDoctors.length + matchedAppointments.length;

    return {
      patients: matchedPatients,
      doctors: matchedDoctors,
      appointments: matchedAppointments,
      totalCount
    };
  }, [searchTerm, patients, doctors, appointments, appMode]);

  // Filter notifications based on application mode and user role
  const displayedNotifications = useMemo(() => {
    return notifications.filter(n => {
      const target = n.targetAudience || 'staff';
      if (appMode === 'public') {
        return target === 'public' || target === 'all';
      }
      // EMR Mode
      if (activeRole === 'Admin') return true;
      if (target === 'admin') return false; // Non-admin clinical staff do not see admin-restricted logs
      return true;
    });
  }, [notifications, appMode, activeRole]);

  const unreadCount = displayedNotifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    const displayedIds = new Set(displayedNotifications.map(n => n.id));
    setNotifications(
      notifications.map(n => displayedIds.has(n.id) ? { ...n, isRead: true } : n)
    );
  };

  const toggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(
      notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n)
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(
      notifications.filter(n => n.id !== id)
    );
  };

  const todayStr = 'Thursday, May 21, 2026';

  return (
    <header className="sticky top-0 h-16 w-full flex items-center justify-between px-3 sm:px-4 lg:px-6 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors duration-250 select-none overflow-hidden max-w-full">
      
      {/* Left Area: Mobile Hamburger Button, Clinic Logo & Search Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0 max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md" ref={searchContainerRef}>
        
        {/* Mobile Hamburger Button */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors shrink-0 cursor-pointer"
            title="Open Navigation Menu"
            id="mobile-nav-toggle-btn"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Clinical Brand Logo */}
        <div 
          onClick={() => {
            if (onNavigateTab) onNavigateTab('dashboard');
          }}
          className="flex items-center gap-2 cursor-pointer shrink-0 hover:opacity-90 transition-opacity"
          title="St. Jude Clinic"
          id="header-brand-logo-container"
        >
          <ClinicLogo size="sm" showText={false} id="header-clinical-logo" />
        </div>

        <div className="relative w-full min-w-0">
          <Search size={14} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search patients, doctors... [/]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full pl-7 sm:pl-9 pr-8 sm:pr-14 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-950/30 focus:border-teal-500 transition-all shadow-xs"
            id="global-search-input"
            autoComplete="off"
          />
          {searchTerm ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
              title="Clear search"
            >
              <X size={12} />
            </button>
          ) : null}
          <kbd className="hidden sm:inline absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700 font-bold select-none cursor-pointer" onClick={() => document.getElementById('global-search-input')?.focus()}>
            /
          </kbd>

          {/* Interactive Search Results Dropdown Preview */}
          {showSearchDropdown && searchTerm.trim().length > 0 && (
            <div className="absolute left-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-[420px] max-w-[90vw] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800 dark:text-slate-100 max-h-[480px] overflow-y-auto scrollbar-thin">
              
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Search Results ({searchResults.totalCount} matches)
                </span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium truncate max-w-[140px]">
                  Keyword: "{searchTerm}"
                </span>
              </div>

              {searchResults.totalCount === 0 ? (
                <div className="py-6 text-center text-slate-400 dark:text-slate-500">
                  <Search size={22} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No records match your query</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try searching by patient name, doctor specialty, or appointment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  
                  {/* Patients Section */}
                  {searchResults.patients.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <User size={12} className="text-teal-500" />
                          Patients ({searchResults.patients.length})
                        </span>
                        {onNavigateTab && (
                          <button
                            onClick={() => {
                              onNavigateTab('patients');
                              setShowSearchDropdown(false);
                            }}
                            className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            View All <ChevronRight size={10} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        {searchResults.patients.map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (onSelectPatient) onSelectPatient(p);
                              if (onNavigateTab) onNavigateTab('patients');
                              setShowSearchDropdown(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-teal-50/80 dark:hover:bg-slate-900/80 border border-transparent hover:border-teal-200 dark:hover:border-teal-900/30 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                                {p.photo ? (
                                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  p.name.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400">
                                  {p.name}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                                  <span>{p.condition || 'General Patient'}</span>
                                  <span>•</span>
                                  <span>Room {p.room || 'Outpatient'}</span>
                                </div>
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              p.status === 'Admitted' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                              p.status === 'Discharged' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' :
                              'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            }`}>
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctors Section */}
                  {searchResults.doctors.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Stethoscope size={12} className="text-indigo-500" />
                          Physicians ({searchResults.doctors.length})
                        </span>
                        {onNavigateTab && (
                          <button
                            onClick={() => {
                              onNavigateTab('doctors');
                              setShowSearchDropdown(false);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            View All <ChevronRight size={10} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        {searchResults.doctors.map(d => (
                          <div
                            key={d.id}
                            onClick={() => {
                              if (onSelectDoctor) onSelectDoctor(d);
                              if (onNavigateTab) onNavigateTab('doctors');
                              setShowSearchDropdown(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/80 dark:hover:bg-slate-900/80 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/30 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                                {d.image ? (
                                  <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                                ) : (
                                  d.name.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                  {d.name}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {d.specialty} • {d.department}
                                </div>
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              d.status === 'On Duty' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              d.status === 'In Surgery' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' :
                              'bg-slate-100 text-slate-500 dark:bg-slate-800'
                            }`}>
                              {d.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Appointments Section */}
                  {searchResults.appointments.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-amber-500" />
                          Appointments ({searchResults.appointments.length})
                        </span>
                        {onNavigateTab && (
                          <button
                            onClick={() => {
                              onNavigateTab('appointments');
                              setShowSearchDropdown(false);
                            }}
                            className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            View All <ChevronRight size={10} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        {searchResults.appointments.map(a => (
                          <div
                            key={a.id}
                            onClick={() => {
                              if (onNavigateTab) onNavigateTab('appointments');
                              setShowSearchDropdown(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/80 dark:hover:bg-slate-900/80 border border-transparent hover:border-amber-200 dark:hover:border-amber-900/30 transition-all cursor-pointer group"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                {a.patientName} &rarr; {a.doctorName}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                                <span>{a.date} at {a.time}</span>
                                <span>•</span>
                                <span>{a.specialty}</span>
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              a.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              a.status === 'Cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' :
                              'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}>
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Bottom Quick-Action Link */}
              {onNavigateTab && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Esc</kbd> to dismiss</span>
                  <button
                    onClick={() => {
                      onNavigateTab('patients');
                      setShowSearchDropdown(false);
                    }}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Open Directory Filter <ArrowRight size={11} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Portal Switcher (Visible on extra large desktops, accessible via sidebar/menu on mobile/tablet) */}
      <div className="hidden 2xl:flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-xs shrink-0">
        <button
          onClick={() => setAppMode('public')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            appMode === 'public'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe size={13} className="shrink-0" />
          <span>Patient & Public Web</span>
        </button>
        <button
          onClick={() => setAppMode('emr')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            appMode === 'emr'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Stethoscope size={13} className="shrink-0" />
          <span>Staff EMR Operations</span>
        </button>
      </div>

      {/* Meta Indicators & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 shrink-0">
        
        {/* Real-time Clock Widget */}
        <div className="hidden 2xl:flex items-center gap-2 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-950/40 text-[11px] font-sans text-slate-600 dark:text-slate-400 whitespace-nowrap">
          <Clock size={12} className="text-teal-600 animate-pulse shrink-0" />
          <span className="font-semibold">{timeStr}</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-semibold text-slate-500">{todayStr}</span>
        </div>

        {/* Selected Role Tag (EMR Mode Only) */}
        {appMode === 'emr' && (
          <div className="hidden md:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs whitespace-nowrap">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              activeRole === 'Admin' ? 'bg-red-500 animate-pulse' : 
              activeRole === 'Doctor' ? 'bg-indigo-500' : 'bg-emerald-500'
            }`} />
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-700 dark:text-slate-300">
              {activeRole}
            </span>
          </div>
        )}

        {/* Notifications Icon with Badge (EMR Mode Only) */}
        {appMode === 'emr' && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full transition-all relative cursor-pointer"
              id="notification-bell-btn"
              title="System Alerts"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-[8px] font-sans font-black text-white flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-[calc(100vw-24px)] sm:w-96 max-w-[95vw] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-3.5 sm:p-4 shadow-2xl z-50 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-3 duration-200"
                id="notifications-tray"
              >
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">Active Medical Alarms</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400 rounded">
                        {unreadCount} Urgent
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] font-black text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Acknowledge All
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {displayedNotifications.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-6">No active notifications for current view</p>
                  ) : (
                    displayedNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded-xl border text-xs transition-all relative group ${
                          notif.isRead 
                            ? 'bg-slate-50/40 border-slate-100 dark:bg-slate-900/30 dark:border-slate-800 opacity-70' 
                            : 'bg-red-50/20 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            {notif.type === 'Alert' ? (
                              <AlertTriangle size={12} className="text-red-500 shrink-0" />
                            ) : notif.type === 'Success' ? (
                              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
                            )}
                            <span className="truncate max-w-[180px]">{notif.title}</span>
                            {notif.targetAudience && (
                              <span className={`text-[8px] font-mono uppercase px-1 py-0.2 rounded border ${
                                notif.targetAudience === 'public'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
                                  : notif.targetAudience === 'admin'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                              }`}>
                                {notif.targetAudience}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 pr-5 leading-relaxed">
                          {notif.description}
                        </p>
                        <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={(e) => toggleRead(notif.id, e)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-550 hover:text-slate-900 dark:hover:text-white"
                            title={notif.isRead ? "Mark as unread" : "Mark as read"}
                          >
                            <Check size={11} className={notif.isRead ? "text-teal-600 font-black" : ""} />
                          </button>
                          <button
                            onClick={(e) => deleteNotification(notif.id, e)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-red-550 hover:text-red-650"
                            title="Delete"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-900 flex justify-between gap-2">
                  <button
                    onClick={() => {
                      onQuickAction('simulateAlert');
                      setShowNotifications(false);
                    }}
                    className="w-full text-center py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 cursor-pointer"
                  >
                    [ SIMULATE ADMISSION ALARM ]
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keyboard Shortcuts Trigger Button (EMR Mode Only) */}
        {appMode === 'emr' && (
          <button
            onClick={onShowShortcutsHelp}
            className="hidden xl:inline-flex p-1.5 sm:p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-all cursor-pointer relative"
            title="Keyboard Shortcuts Hub"
            id="shortcuts-trigger-btn"
          >
            <Keyboard size={17} />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-teal-600 text-white border border-white dark:border-slate-900 flex items-center justify-center font-mono text-[8px] font-extrabold shadow">
              ?
            </span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 sm:p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-all cursor-pointer"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          id="darkmode-toggle-btn"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Public Mode: Staff Portal Entry Button (When not logged in) */}
        {appMode === 'public' && !staffUser && (
          <button
            onClick={() => setAppMode('emr')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-teal-600 dark:hover:bg-teal-400 text-white dark:text-slate-950 hover:text-white dark:hover:text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer ml-1 whitespace-nowrap"
            title="Secure Clinical Staff & Admin Portal"
            id="public-staff-login-btn"
          >
            <Lock size={13} />
            <span>Staff Portal</span>
          </button>
        )}

        {/* Quick Lock Workstation Button (When in EMR mode) */}
        {appMode === 'emr' && onSignOutStaff && (
          <button
            onClick={onSignOutStaff}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            title="Lock Clinical Workstation & Sign Out"
            id="lock-workstation-btn"
          >
            <LogOut size={13} />
            <span className="hidden xl:inline">Lock Station</span>
          </button>
        )}

        {/* User Badge Profile Summary & Shift Switcher (EMR Mode or Authenticated Staff Only) */}
        {(appMode === 'emr' || staffUser) && (
          <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800" ref={roleMenuRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title={`Active: ${staffUser?.displayName || activeRole} (${activeRole}). Click for security details.`}
              id="role-switcher-profile-btn"
            >
              <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold shadow-xs border border-teal-200 dark:border-teal-900/30 text-xs shrink-0 relative">
                {staffUser?.displayName ? staffUser.displayName.slice(0, 2).toUpperCase() : activeRole === 'Admin' ? 'AD' : activeRole === 'Doctor' ? 'MD' : 'RE'}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                  activeRole === 'Admin' ? 'bg-red-500' : activeRole === 'Doctor' ? 'bg-indigo-500' : 'bg-emerald-500'
                }`} title={`Role: ${activeRole}`} />
              </div>
              {staffUser && (
                <div className="hidden xl:flex flex-col text-left text-[11px] leading-tight pr-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                    {staffUser.displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[110px] font-mono">
                    {staffUser.badgeNumber || staffUser.email}
                  </span>
                </div>
              )}
            </button>

          {/* Role & Staff Account dropdown */}
          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 max-w-[90vw] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 text-slate-800 dark:text-slate-100 font-sans">
              
              {/* Authenticated Staff Card */}
              {staffUser ? (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                      Active EMR Session
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {staffUser.displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    {staffUser.email}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="font-semibold">{staffUser.department || 'Hospital Operations'}</span>
                    <span>•</span>
                    <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">{staffUser.badgeNumber || 'STAFF'}</span>
                  </div>
                </div>
              ) : (
                <div className="px-2 py-1.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Active Shift Mode
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Current: {activeRole}
                  </div>
                </div>
              )}

              {/* Role Switcher Options */}
              <div className="space-y-1 mb-2">
                <div className="px-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Change Clinical Clearance
                </div>

                {/* Admin Role - Authorized only */}
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    if (onRequestRoleChange) onRequestRoleChange('Admin');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeRole === 'Admin'
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span>Administrator</span>
                  </div>
                  {activeRole === 'Admin' ? (
                    <Check size={14} className="text-red-600" />
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-mono font-bold">
                      Auth Required
                    </span>
                  )}
                </button>

                {/* Doctor Role */}
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    if (onRequestRoleChange) onRequestRoleChange('Doctor');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeRole === 'Doctor'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <span>Doctor / Physician</span>
                  </div>
                  {activeRole === 'Doctor' && <Check size={14} className="text-indigo-600" />}
                </button>

                {/* Receptionist Role */}
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    if (onRequestRoleChange) onRequestRoleChange('Receptionist');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeRole === 'Receptionist'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Receptionist</span>
                  </div>
                  {activeRole === 'Receptionist' && <Check size={14} className="text-emerald-600" />}
                </button>
              </div>

              {/* Sign out / Lock Station Action */}
              {onSignOutStaff && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onSignOutStaff();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Lock Workstation & Sign Out</span>
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      </div>
    </header>
  );
}
