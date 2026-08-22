import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Shield, 
  Lock, 
  Check, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Globe, 
  Building, 
  LogOut, 
  FileText, 
  X, 
  Sparkles, 
  Stethoscope, 
  UserCheck2, 
  Clock, 
  Activity,
  KeyRound,
  Sliders,
  BadgeCheck
} from 'lucide-react';
import { UserRole, StaffUser } from '../types';

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffUser?: StaffUser | null;
  activeRole: UserRole;
  onRequestRoleChange?: (newRole: UserRole) => void;
  onSignOutStaff?: () => void;
  appMode: 'public' | 'emr';
  setAppMode: (mode: 'public' | 'emr') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenShiftHandover?: () => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  staffUser,
  activeRole,
  onRequestRoleChange,
  onSignOutStaff,
  appMode,
  setAppMode,
  darkMode,
  setDarkMode,
  onOpenShiftHandover
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'clearance' | 'preferences'>('profile');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('stjude_audio_alerts') !== 'false';
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Prevent background page scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('stjude_audio_alerts', String(nextVal));
    setStatusMessage(nextVal ? 'Audio alerts enabled for clinical telemetry' : 'Audio alerts muted');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleRoleSelect = (role: UserRole) => {
    if (onRequestRoleChange) {
      onRequestRoleChange(role);
      setStatusMessage(`Switched clinical clearance to ${role}`);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          id="user-profile-modal-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[88vh] sm:max-h-[85vh] shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 font-sans"
            onClick={(e) => e.stopPropagation()}
            id="user-profile-modal-card"
          >
            {/* Modal Header (Fixed / Non-scrolling) */}
            <div className="p-4 sm:p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Shield size={22} className="sm:size-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                    Staff Profile & Security Clearance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Manage your credentials, active clinical role, and system preferences
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center"
                title="Close dialog (Esc)"
                id="close-profile-modal-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="px-4 sm:px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <User size={14} />
                <span>Identity & Shift</span>
              </button>

              <button
                onClick={() => setActiveTab('clearance')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'clearance'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <KeyRound size={14} />
                <span>Clearance Roles</span>
              </button>

              <button
                onClick={() => setActiveTab('preferences')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'preferences'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Sliders size={14} />
                <span>Preferences</span>
              </button>
            </div>

            {/* Status Notice Banner */}
            {statusMessage && (
              <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-xs font-medium text-teal-800 dark:text-teal-200 flex items-center justify-between shrink-0 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-teal-600 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
                <button onClick={() => setStatusMessage(null)} className="p-1 text-teal-600 hover:text-teal-900 cursor-pointer">
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Dedicated Scrollable Body */}
            {/* The overscroll-contain and isolated overflow-y-auto ensures scrolling here does not scroll the outer page */}
            <div 
              className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain touch-pan-y scrollbar-thin"
              id="user-profile-modal-scrollable-content"
            >
              {/* TAB 1: IDENTITY & SHIFT */}
              {activeTab === 'profile' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Main Identity Card */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-md relative shrink-0">
                        {staffUser?.displayName 
                          ? staffUser.displayName.slice(0, 2).toUpperCase() 
                          : activeRole === 'Admin' ? 'AD' : activeRole === 'Doctor' ? 'MD' : 'RE'}
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                          activeRole === 'Admin' ? 'bg-red-500' : activeRole === 'Doctor' ? 'bg-indigo-500' : 'bg-emerald-500'
                        }`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                            {staffUser?.displayName || `${activeRole} On Duty`}
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Shift Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                          {staffUser?.email || 'authenticated.staff@stjude-clinic.org'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {staffUser?.department || 'Emergency & Acute Care'}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                            {staffUser?.badgeNumber || 'STJ-EMR-2026'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Meta details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Security Level</span>
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Shield size={14} className="text-teal-600" />
                          <span>Level {activeRole === 'Admin' ? '3 (Master Administrator)' : activeRole === 'Doctor' ? '2 (Clinical Attending)' : '1 (Front Desk & Triage)'}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">HIPAA Audit Hash</span>
                        <div className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate">
                          STJ-HIPAA-{Math.abs((staffUser?.email || 'user').split('').reduce((a,b)=>((a<<5)-a)+b.charCodeAt(0),0)).toString(16).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shift Handover Quick Action */}
                  {onOpenShiftHandover && (
                    <div className="p-4 rounded-2xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/40 dark:bg-teal-950/20 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-xs font-bold text-teal-900 dark:text-teal-200">
                          Shift Handover Report
                        </h5>
                        <p className="text-[11px] text-teal-700/80 dark:text-teal-400/80 mt-0.5">
                          Summarize patient handoffs, ICU bed allocations, and pending medication orders
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenShiftHandover();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        <FileText size={13} />
                        <span>Launch Handover</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CLEARANCE ROLES */}
              {activeTab === 'clearance' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
                    Select a clearance role below to switch clinical workflows, chart access, and emergency triage authority:
                  </p>

                  {/* Administrator Role */}
                  <button
                    onClick={() => handleRoleSelect('Admin')}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3.5 ${
                      activeRole === 'Admin'
                        ? 'bg-red-50/90 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 shadow-xs ring-1 ring-red-500/20'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                    id="role-select-admin"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-xs">
                        <Shield size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                          <span>Hospital Administrator</span>
                          {activeRole === 'Admin' && (
                            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 font-extrabold">
                              ACTIVE CLEARANCE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          Full system control: Financial Invoices, Audit Logs, Staff Clearance & Bed Configuration
                        </p>
                      </div>
                    </div>

                    {activeRole === 'Admin' ? (
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check size={16} />
                      </div>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-bold shrink-0">
                        Switch
                      </span>
                    )}
                  </button>

                  {/* Physician Role */}
                  <button
                    onClick={() => handleRoleSelect('Doctor')}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3.5 ${
                      activeRole === 'Doctor'
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 shadow-xs ring-1 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                    id="role-select-doctor"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
                        <Stethoscope size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                          <span>Physician / Attending Doctor</span>
                          {activeRole === 'Doctor' && (
                            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-extrabold">
                              ACTIVE CLEARANCE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          Clinical care: Electronic Medical Records, Prescriptions, Telemetry & Bed Ward Assignments
                        </p>
                      </div>
                    </div>

                    {activeRole === 'Doctor' ? (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check size={16} />
                      </div>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-bold shrink-0">
                        Switch
                      </span>
                    )}
                  </button>

                  {/* Receptionist Role */}
                  <button
                    onClick={() => handleRoleSelect('Receptionist')}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3.5 ${
                      activeRole === 'Receptionist'
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-xs ring-1 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                    id="role-select-receptionist"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                        <UserCheck2 size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                          <span>Front Desk Receptionist</span>
                          {activeRole === 'Receptionist' && (
                            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-extrabold">
                              ACTIVE CLEARANCE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          Patient intake: Check-in, Appointments, Triage Dispatch, QR Passes & Queue Tickets
                        </p>
                      </div>
                    </div>

                    {activeRole === 'Receptionist' ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check size={16} />
                      </div>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-bold shrink-0">
                        Switch
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 3: PREFERENCES & SETTINGS */}
              {activeTab === 'preferences' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  {/* Dark Mode Preference */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                        {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          Interface Theme
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Currently using {darkMode ? 'Night/Dark Mode' : 'Clean Light Mode'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Toggle {darkMode ? 'Light' : 'Dark'}
                    </button>
                  </div>

                  {/* Audio Telemetry Chime Preference */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          Telemetry & Alarm Audio Chimes
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {soundEnabled ? 'Audio alerts will sound on urgent vital alarms' : 'Audio alerts are currently silenced'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={toggleSound}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                        soundEnabled
                          ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {soundEnabled ? 'Mute' : 'Enable'}
                    </button>
                  </div>

                  {/* Portal View Switch */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                        {appMode === 'emr' ? <Building size={18} /> : <Globe size={18} />}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          Hospital Workspace Mode
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Currently viewing {appMode === 'emr' ? 'Staff EMR Electronic Record' : 'Patient Public Portal'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setAppMode(appMode === 'emr' ? 'public' : 'emr')}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Switch to {appMode === 'emr' ? 'Public' : 'EMR'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Fixed / Non-scrolling) */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {onSignOutStaff ? (
                <button
                  onClick={() => {
                    onClose();
                    onSignOutStaff();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900/50 flex items-center gap-2 cursor-pointer transition-colors"
                  id="lock-workstation-btn"
                >
                  <LogOut size={14} />
                  <span>Lock Workstation & Sign Out</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs min-h-[40px] flex items-center justify-center ml-auto"
                id="done-profile-modal-btn"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
