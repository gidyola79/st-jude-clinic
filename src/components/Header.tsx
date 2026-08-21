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
  Shield,
  Trash2,
  SlidersHorizontal,
  Archive,
  RotateCcw,
  Inbox,
  Volume2,
  VolumeX,
  Flame,
  FileText
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
  onOpenShiftHandover?: () => void;
}

// Helper to determine if a notification is older than 24 hours
export function isNotificationOlderThan24Hours(n: Notification): boolean {
  if (n.createdAt) {
    return Date.now() - n.createdAt > 24 * 60 * 60 * 1000;
  }
  const timeStr = (n.time || '').toLowerCase();
  if (
    timeStr.includes('d ago') || 
    timeStr.includes('day') || 
    timeStr.includes('week') || 
    timeStr.includes('yesterday') || 
    timeStr.includes('month') || 
    timeStr.includes('year')
  ) {
    return true;
  }
  if (timeStr.includes('hour') || timeStr.includes('hr')) {
    const match = timeStr.match(/(\d+)\s*(?:hour|hr)/);
    if (match && parseInt(match[1], 10) >= 24) return true;
  }
  return false;
}

// Interactive Swipeable Notification Card for Mobile and Desktop
interface SwipeableNotificationItemProps {
  key?: React.Key;
  notification: Notification;
  onToggleRead: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
  onRestore?: (id: string, e?: React.MouseEvent) => void;
  isArchivedView?: boolean;
}

function SwipeableNotificationItem({
  notification,
  onToggleRead,
  onDelete,
  onRestore,
  isArchivedView = false
}: SwipeableNotificationItemProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;
    
    // Only lock to horizontal swipe if horizontal movement is greater than vertical movement
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiping left (dismiss direction)
        setOffsetX(Math.max(deltaX, -160));
      } else {
        // Elastic resistance if dragging right
        setOffsetX(Math.min(deltaX * 0.25, 25));
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offsetX < -75) {
      // Trigger dismissal animation
      setIsDismissed(true);
      setOffsetX(-360);
      setTimeout(() => {
        onDelete(notification.id);
      }, 220);
    } else {
      // Snap back smoothly
      setOffsetX(0);
    }
  };

  if (isDismissed) {
    return (
      <div className="h-0 opacity-0 overflow-hidden transition-all duration-200" />
    );
  }

  const isAlert = notification.type === 'Alert';
  const progressRatio = Math.min(Math.abs(offsetX) / 75, 1);
  const isOlder = isNotificationOlderThan24Hours(notification);

  return (
    <div className="relative overflow-hidden rounded-xl group select-none shadow-2xs">
      {/* Background Revealed on Swipe-Left */}
      <div 
        className="absolute inset-0 bg-red-600 dark:bg-red-700 flex items-center justify-end px-4 text-white font-bold text-xs gap-1.5 transition-colors rounded-xl"
        style={{ opacity: Math.max(0.4, progressRatio) }}
      >
        <span className="text-[11px] font-bold tracking-wide">
          {offsetX < -75 ? 'Release to Dismiss' : 'Swipe to Dismiss'}
        </span>
        <Trash2 size={16} className={offsetX < -75 ? "animate-bounce" : ""} />
      </div>

      {/* Main Foreground Notification Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
        className={`relative z-10 p-3 sm:p-3.5 rounded-xl border text-xs transition-all ${
          isArchivedView 
            ? 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
            : notification.isRead 
              ? 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80' 
              : isAlert 
                ? 'border-l-4 border-l-red-600 border-red-200 dark:border-red-900/70 bg-red-50/40 dark:bg-red-950/25 shadow-sm ring-1 ring-red-500/10' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
        }`}
      >
        {/* High-Priority / Alert Type Badge Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Color-Coded Priority Badges */}
            {isAlert ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 dark:bg-red-500 text-white shadow-xs ring-2 ring-red-300/80 dark:ring-red-900/80 animate-pulse">
                <AlertTriangle size={11} className="stroke-[3]" />
                HIGH PRIORITY ALERT
              </span>
            ) : notification.type === 'Success' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={10} />
                VERIFIED
              </span>
            ) : notification.type === 'Schedule' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Clock size={10} />
                SCHEDULE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                <Terminal size={10} />
                INFO LOG
              </span>
            )}

            {/* Target Audience Scope Badge */}
            {notification.targetAudience && (
              <span className={`text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                notification.targetAudience === 'public'
                  ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
                  : notification.targetAudience === 'admin'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
              }`}>
                {notification.targetAudience}
              </span>
            )}

            {/* >24h Age Flag */}
            {isOlder && !isArchivedView && (
              <span className="text-[8.5px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                &gt;24h old
              </span>
            )}
          </div>

          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 pt-0.5">
            {notification.time}
          </span>
        </div>

        {/* Title and Description */}
        <div className="mb-2">
          <h4 className={`text-xs font-bold leading-snug ${isAlert ? 'text-red-950 dark:text-red-100 font-black' : 'text-slate-900 dark:text-white'}`}>
            {notification.title}
          </h4>
          <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
            {notification.description}
          </p>
        </div>

        {/* Action Buttons Bar with High Touch Target Sizes (40px+) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span className="hidden sm:inline">Swipe left to dismiss</span>
            <span className="sm:hidden text-teal-600 dark:text-teal-400">← Swipe to dismiss</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isArchivedView ? (
              <>
                {onRestore && (
                  <button
                    onClick={(e) => onRestore(notification.id, e)}
                    className="min-w-[42px] min-h-[42px] px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition-all cursor-pointer shadow-xs"
                    title="Restore to active notification feed"
                  >
                    <RotateCcw size={13} />
                    <span>Restore</span>
                  </button>
                )}
                <button
                  onClick={(e) => onDelete(notification.id, e)}
                  className="min-w-[42px] min-h-[42px] px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/40 transition-all cursor-pointer shadow-xs"
                  title="Permanently Delete Notification"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <>
                {/* Mark as Read / Unread Action Button */}
                <button
                  onClick={(e) => onToggleRead(notification.id, e)}
                  className={`min-w-[42px] min-h-[42px] px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer shadow-xs ${
                    notification.isRead 
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300' 
                      : 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  }`}
                  title={notification.isRead ? "Mark as unread" : "Mark as read"}
                >
                  <Check size={14} className={notification.isRead ? "text-slate-400" : "text-teal-600 font-black"} />
                  <span>{notification.isRead ? "Unread" : "Read"}</span>
                </button>

                {/* Dismiss / Delete Action Button */}
                <button
                  onClick={(e) => onDelete(notification.id, e)}
                  className="min-w-[42px] min-h-[42px] px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/40 transition-all cursor-pointer shadow-xs"
                  title="Delete Notification"
                >
                  <Trash2 size={13} />
                  <span>Dismiss</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
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
  onSignOutStaff,
  onOpenShiftHandover
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [timeStr, setTimeStr] = useState('09:19 AM');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
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

  const [notificationTab, setNotificationTab] = useState<'active' | 'archived'>('active');
  const [archiveNotice, setArchiveNotice] = useState<string | null>(null);

  // Filter notifications based on application mode and user role
  const scopedNotifications = useMemo(() => {
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

  // Split into active feed and archived
  const activeFeedNotifications = useMemo(() => {
    return scopedNotifications.filter(n => !n.archived);
  }, [scopedNotifications]);

  const archivedNotifications = useMemo(() => {
    return scopedNotifications.filter(n => n.archived);
  }, [scopedNotifications]);

  const displayedNotifications = notificationTab === 'active' 
    ? activeFeedNotifications 
    : archivedNotifications;

  const unreadCount = activeFeedNotifications.filter(n => !n.isRead).length;
  const olderThan24hCount = activeFeedNotifications.filter(isNotificationOlderThan24Hours).length;

  const markAllRead = () => {
    const displayedIds = new Set(activeFeedNotifications.map(n => n.id));
    setNotifications(
      notifications.map(n => displayedIds.has(n.id) ? { ...n, isRead: true } : n)
    );
  };

  /**
   * Automatically archive notifications older than 24 hours, keeping recent feed clean.
   * If there are >24h items, archive them. If all are fresh, offer full clean archive.
   */
  const handleClearAll = () => {
    const olderItems = activeFeedNotifications.filter(isNotificationOlderThan24Hours);
    
    if (olderItems.length > 0) {
      const olderIds = new Set(olderItems.map(n => n.id));
      setNotifications(
        notifications.map(n => olderIds.has(n.id) ? { ...n, archived: true, isRead: true } : n)
      );
      const remainingCount = activeFeedNotifications.length - olderItems.length;
      setArchiveNotice(
        `Archived ${olderItems.length} notification${olderItems.length > 1 ? 's' : ''} older than 24h. Kept ${remainingCount} fresh item${remainingCount !== 1 ? 's' : ''} in active feed.`
      );
    } else if (activeFeedNotifications.length > 0) {
      // All items in feed are under 24 hours; archive them to completely clean feed
      const activeIds = new Set(activeFeedNotifications.map(n => n.id));
      setNotifications(
        notifications.map(n => activeIds.has(n.id) ? { ...n, archived: true, isRead: true } : n)
      );
      setArchiveNotice(
        `Archived all ${activeFeedNotifications.length} notification${activeFeedNotifications.length > 1 ? 's' : ''} to clean feed.`
      );
    } else {
      setArchiveNotice('Notification feed is already clean.');
    }

    setTimeout(() => {
      setArchiveNotice(null);
    }, 4000);
  };

  const handleRestoreNotification = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(
      notifications.map(n => n.id === id ? { ...n, archived: false } : n)
    );
  };

  const handleRestoreAllArchived = () => {
    const archivedIds = new Set(archivedNotifications.map(n => n.id));
    setNotifications(
      notifications.map(n => archivedIds.has(n.id) ? { ...n, archived: false } : n)
    );
    setArchiveNotice(`Restored ${archivedNotifications.length} notification(s) back to active feed.`);
    setTimeout(() => setArchiveNotice(null), 3000);
  };

  const handleClearAllArchived = () => {
    const archivedIds = new Set(archivedNotifications.map(n => n.id));
    setNotifications(
      notifications.filter(n => !archivedIds.has(n.id))
    );
    setArchiveNotice(`Permanently deleted ${archivedNotifications.length} archived notification(s).`);
    setTimeout(() => setArchiveNotice(null), 3000);
  };

  const toggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(
      notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n)
    );
  };

  const deleteNotification = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(
      notifications.filter(n => n.id !== id)
    );
  };

  const todayStr = 'Thursday, May 21, 2026';

  return (
    <>
      {/* Global Dismiss Backdrop for Open Dropdowns/Dialogs: Prevents underlying overlaps and enables outside-click dismissal */}
      {(showNotifications || (showSearchDropdown && searchTerm.trim().length > 0) || showRoleMenu) && (
        <div
          className="fixed inset-0 z-40 bg-black/30 dark:bg-black/60 transition-opacity duration-150 cursor-default"
          onClick={() => {
            setShowNotifications(false);
            setShowSearchDropdown(false);
            setShowRoleMenu(false);
          }}
          aria-label="Close dialog overlay"
        />
      )}

      <header className="sticky top-0 h-16 w-full flex items-center justify-between px-2.5 sm:px-4 lg:px-6 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-250 select-none overflow-visible max-w-full shadow-xs">
        
        {/* Left Area: Mobile Hamburger Button, Clinic Logo & Search Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0 max-w-[210px] sm:max-w-xs md:max-w-sm lg:max-w-md" ref={searchContainerRef}>
          
          {/* Mobile Hamburger Button */}
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors shrink-0 cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
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
            <Search size={14} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 shrink-0 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patients, doctors... [/]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full pl-7 sm:pl-9 pr-8 sm:pr-14 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-950/30 focus:border-teal-500 transition-all shadow-xs"
              id="global-search-input"
              autoComplete="off"
            />
            {searchTerm ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
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
              <div 
                onClick={(e) => e.stopPropagation()}
                className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:left-0 sm:top-full mt-2 w-auto sm:w-[420px] max-w-[calc(100vw-24px)] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800 dark:text-slate-100 max-h-[75vh] sm:max-h-[480px] overflow-y-auto scrollbar-thin"
              >
                
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Search Results ({searchResults.totalCount} matches)
                    </span>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold truncate max-w-[120px]">
                      "{searchTerm}"
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowSearchDropdown(false)}
                    className="min-w-[36px] min-h-[36px] p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                    title="Close search dialog"
                  >
                    <X size={15} />
                  </button>
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

        {/* Shift Handover Report Button (EMR Mode Only) */}
        {appMode === 'emr' && onOpenShiftHandover && (
          <button
            onClick={onOpenShiftHandover}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-800/80 bg-teal-50/80 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
            title="Generate and Print Shift Handover Report"
            id="shift-handover-report-btn"
          >
            <FileText size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="hidden sm:inline">Shift Handover</span>
          </button>
        )}

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

        {/* Notifications Icon with Badge (Available in both EMR and Public modes) */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full transition-all relative cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
            id="notification-bell-btn"
            title="System & Clinical Alerts"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-[8.5px] font-sans font-black text-white flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel Dialog */}
          {showNotifications && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-[430px] max-w-[calc(100vw-24px)] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xl z-50 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-3 duration-200"
              id="notifications-tray"
            >
              {/* Header Title & Close Button */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">
                    {appMode === 'emr' ? 'Clinical Telemetry & Alarms' : 'Hospital & Portal Notifications'}
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400 rounded shrink-0">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {unreadCount > 0 && notificationTab === 'active' && (
                    <button
                      onClick={markAllRead}
                      className="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-[11px] font-bold text-teal-700 dark:text-teal-300 transition-colors cursor-pointer whitespace-nowrap"
                      title="Mark all notifications as read"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="min-w-[36px] min-h-[36px] p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                    title="Close notifications dialog"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* View Sub-Tabs: Active Feed vs Archive */}
              <div className="flex items-center justify-between gap-1.5 mb-2.5 bg-slate-100/90 dark:bg-slate-900/80 p-1 rounded-xl">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setNotificationTab('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      notificationTab === 'active'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Inbox size={13} />
                    <span>Active ({activeFeedNotifications.length})</span>
                  </button>

                  <button
                    onClick={() => setNotificationTab('archived')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      notificationTab === 'archived'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Archive size={13} />
                    <span>Archived ({archivedNotifications.length})</span>
                  </button>
                </div>

                {/* Clear All Button for Active Feed */}
                {notificationTab === 'active' && activeFeedNotifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/70 text-teal-700 dark:text-teal-300 text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs border border-teal-200/70 dark:border-teal-800/70"
                    title="Automatically archives notifications older than 24 hours, keeping recent feed clean"
                    id="clear-all-notifications-btn"
                  >
                    <Archive size={12} className="text-teal-600 dark:text-teal-400" />
                    <span>Clear All {olderThan24hCount > 0 ? `(>24h: ${olderThan24hCount})` : ''}</span>
                  </button>
                )}

                {/* Batch Actions for Archived View */}
                {notificationTab === 'archived' && archivedNotifications.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleRestoreAllArchived}
                      className="px-2 py-1 rounded-md text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                      title="Restore all archived notifications to active feed"
                    >
                      Restore All
                    </button>
                    <button
                      onClick={handleClearAllArchived}
                      className="px-2 py-1 rounded-md text-[10px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      title="Delete all archived notifications permanently"
                    >
                      Purge
                    </button>
                  </div>
                )}
              </div>

              {/* Status Notice Banner (when Clear All or Archive action triggers) */}
              {archiveNotice && (
                <div className="mb-2.5 p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-[11px] font-medium text-teal-800 dark:text-teal-200 flex items-center justify-between animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-teal-600 shrink-0" />
                    <span>{archiveNotice}</span>
                  </div>
                  <button 
                    onClick={() => setArchiveNotice(null)}
                    className="p-1 text-teal-600 dark:text-teal-400 hover:text-teal-900 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Notification List Body */}
              <div className="max-h-[58vh] sm:max-h-80 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
                {displayedNotifications.length === 0 ? (
                  <div className="text-center py-8 px-4 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 mx-auto flex items-center justify-center text-slate-400">
                      {notificationTab === 'active' ? <Inbox size={20} /> : <Archive size={20} />}
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {notificationTab === 'active' 
                        ? 'No active notifications in your feed' 
                        : 'No archived notifications stored'}
                    </p>
                    {notificationTab === 'active' && archivedNotifications.length > 0 && (
                      <button
                        onClick={() => setNotificationTab('archived')}
                        className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        View {archivedNotifications.length} archived notification(s) →
                      </button>
                    )}
                  </div>
                ) : (
                  displayedNotifications.map((notif) => (
                    <SwipeableNotificationItem
                      key={notif.id}
                      notification={notif}
                      onToggleRead={toggleRead}
                      onDelete={deleteNotification}
                      onRestore={handleRestoreNotification}
                      isArchivedView={notificationTab === 'archived'}
                    />
                  ))
                )}
              </div>

              {/* Bottom Quick Test Alarm Simulation Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-900 flex items-center gap-2">
                <button
                  onClick={() => {
                    onQuickAction('simulateAlert');
                    setShowNotifications(false);
                  }}
                  className="flex-1 text-center py-2.5 min-h-[42px] rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center justify-center gap-2 transition-colors"
                >
                  <AlertTriangle size={14} className="text-rose-500" />
                  <span>[ SIMULATE ADMISSION ALARM ]</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Trigger Button (EMR Mode Only) */}
        {appMode === 'emr' && (
          <button
            onClick={onShowShortcutsHelp}
            className="hidden xl:inline-flex p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-all cursor-pointer relative min-w-[38px] min-h-[38px] items-center justify-center"
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
          className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          id="darkmode-toggle-btn"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Public Mode: Staff Portal Entry Button (When not logged in) */}
        {appMode === 'public' && !staffUser && (
          <button
            onClick={() => setAppMode('emr')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-teal-600 dark:hover:bg-teal-400 text-white dark:text-slate-950 hover:text-white dark:hover:text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer ml-1 whitespace-nowrap min-h-[36px]"
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
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px]"
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
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer min-h-[38px]"
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

            {/* Role & Staff Account dropdown Dialog */}
            {showRoleMenu && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-80 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 z-50 text-slate-800 dark:text-slate-100 font-sans animate-in fade-in slide-in-from-top-2 duration-150"
              >
                
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Staff Clearance & Security
                  </span>
                  <button
                    onClick={() => setShowRoleMenu(false)}
                    className="min-w-[36px] min-h-[36px] p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                    title="Close role menu"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Authenticated Staff Card */}
                {staffUser ? (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 mb-2.5">
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

                {/* Role Switcher Options with comfortable tap heights */}
                <div className="space-y-1.5 mb-2">
                  <div className="px-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Change Clinical Clearance
                  </div>

                  {/* Admin Role - Authorized only */}
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      if (onRequestRoleChange) onRequestRoleChange('Admin');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
                      <Check size={16} className="text-red-600" />
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-mono font-bold">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeRole === 'Doctor'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span>Doctor / Physician</span>
                    </div>
                    {activeRole === 'Doctor' && <Check size={16} className="text-indigo-600" />}
                  </button>

                  {/* Receptionist Role */}
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      if (onRequestRoleChange) onRequestRoleChange('Receptionist');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeRole === 'Receptionist'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Receptionist</span>
                    </div>
                    {activeRole === 'Receptionist' && <Check size={16} className="text-emerald-600" />}
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
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer"
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
    </>
  );
}
