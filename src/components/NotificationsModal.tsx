import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  CheckCheck,
  Trash2, 
  Archive, 
  RotateCcw, 
  Inbox, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  X, 
  Sparkles,
  Filter
} from 'lucide-react';
import { Notification, UserRole } from '../types';

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
    
    // Only lock to horizontal swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        setOffsetX(Math.max(deltaX, -160));
      } else {
        setOffsetX(Math.min(deltaX * 0.25, 25));
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offsetX < -75) {
      setIsDismissed(true);
      setOffsetX(-360);
      setTimeout(() => {
        onDelete(notification.id);
      }, 220);
    } else {
      setOffsetX(0);
    }
  };

  if (isDismissed) {
    return <div className="h-0 opacity-0 overflow-hidden transition-all duration-200" />;
  }

  const isAlert = notification.type === 'Alert';
  const progressRatio = Math.min(Math.abs(offsetX) / 75, 1);
  const isOlder = isNotificationOlderThan24Hours(notification);

  return (
    <div className="relative overflow-hidden rounded-2xl group select-none shadow-2xs">
      {/* Background Revealed on Swipe-Left */}
      <div 
        className="absolute inset-0 bg-red-600 dark:bg-red-700 flex items-center justify-end px-4 text-white font-bold text-xs gap-1.5 transition-colors rounded-2xl"
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
        className={`relative z-10 p-3.5 sm:p-4 rounded-2xl border text-xs transition-all ${
          isArchivedView 
            ? 'bg-slate-50/90 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
            : notification.isRead 
              ? 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 opacity-85' 
              : isAlert 
                ? 'border-l-4 border-l-red-600 border-red-200 dark:border-red-900/70 bg-red-50/40 dark:bg-red-950/25 shadow-sm ring-1 ring-red-500/10' 
                : 'border-teal-200/60 dark:border-teal-900/40 bg-teal-50/20 dark:bg-teal-950/15 ring-1 ring-teal-500/10'
        }`}
      >
        {/* Priority & Audience Badge Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isAlert ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs animate-pulse">
                <AlertTriangle size={11} className="stroke-[3]" />
                HIGH PRIORITY ALERT
              </span>
            ) : notification.type === 'Success' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={10} />
                VERIFIED
              </span>
            ) : notification.type === 'Schedule' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Clock size={10} />
                SCHEDULE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                <Terminal size={10} />
                INFO LOG
              </span>
            )}

            {notification.targetAudience && (
              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                notification.targetAudience === 'public'
                  ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
                  : notification.targetAudience === 'admin'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
              }`}>
                {notification.targetAudience}
              </span>
            )}

            {isOlder && !isArchivedView && (
              <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                &gt;24h old
              </span>
            )}

            {!notification.isRead && !isArchivedView && (
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" title="Unread" />
            )}
          </div>

          <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-mono shrink-0 pt-0.5">
            {notification.time}
          </span>
        </div>

        {/* Title and Description */}
        <div className="mb-2.5">
          <h4 className={`text-xs sm:text-sm font-bold leading-snug ${isAlert ? 'text-red-950 dark:text-red-100 font-black' : 'text-slate-900 dark:text-white'}`}>
            {notification.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
            {notification.description}
          </p>
        </div>

        {/* Action Buttons Bar with high touch targets */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <span className="hidden sm:inline">Swipe left to dismiss</span>
            <span className="sm:hidden text-teal-600 dark:text-teal-400">← Swipe to dismiss</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isArchivedView ? (
              <>
                {onRestore && (
                  <button
                    onClick={(e) => onRestore(notification.id, e)}
                    className="min-w-[40px] min-h-[38px] px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition-all cursor-pointer shadow-xs"
                    title="Restore to active notification feed"
                  >
                    <RotateCcw size={13} />
                    <span>Restore</span>
                  </button>
                )}
                <button
                  onClick={(e) => onDelete(notification.id, e)}
                  className="min-w-[40px] min-h-[38px] px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/40 transition-all cursor-pointer shadow-xs"
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
                  className={`min-w-[40px] min-h-[38px] px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer shadow-xs ${
                    notification.isRead 
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                  }`}
                  title={notification.isRead ? "Mark as unread" : "Mark as read"}
                >
                  <Check size={14} className={notification.isRead ? "text-slate-400" : "text-white font-black"} />
                  <span>{notification.isRead ? "Unread" : "Mark Read"}</span>
                </button>

                {/* Dismiss / Delete Action Button */}
                <button
                  onClick={(e) => onDelete(notification.id, e)}
                  className="min-w-[40px] min-h-[38px] px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/40 transition-all cursor-pointer shadow-xs"
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

export interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  setNotifications: (notif: Notification[]) => void;
  appMode: 'public' | 'emr';
  activeRole: UserRole;
  onQuickAction?: (actionName: string) => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  setNotifications,
  appMode,
  activeRole,
  onQuickAction
}: NotificationsModalProps) {
  const [notificationTab, setNotificationTab] = useState<'active' | 'archived'>('active');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Alert' | 'Schedule' | 'Success' | 'Info'>('all');
  const [archiveNotice, setArchiveNotice] = useState<string | null>(null);

  // Prevent background page scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Lock body scroll
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

  // Filter notifications based on application mode and user role
  const scopedNotifications = useMemo(() => {
    return notifications.filter(n => {
      const target = n.targetAudience || 'staff';
      if (appMode === 'public') {
        return target === 'public' || target === 'all';
      }
      if (activeRole === 'Admin') return true;
      if (target === 'admin') return false;
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

  const displayedNotifications = useMemo(() => {
    const list = notificationTab === 'active' ? activeFeedNotifications : archivedNotifications;
    if (typeFilter === 'all') return list;
    return list.filter(n => n.type === typeFilter);
  }, [notificationTab, activeFeedNotifications, archivedNotifications, typeFilter]);

  const unreadCount = activeFeedNotifications.filter(n => !n.isRead).length;
  const olderThan24hCount = activeFeedNotifications.filter(isNotificationOlderThan24Hours).length;

  // Prominent Mark All as Read handler
  const handleMarkAllRead = () => {
    const displayedIds = new Set(activeFeedNotifications.map(n => n.id));
    setNotifications(
      notifications.map(n => displayedIds.has(n.id) ? { ...n, isRead: true } : n)
    );
    setArchiveNotice('All active notifications marked as read.');
    setTimeout(() => setArchiveNotice(null), 3000);
  };

  // Archive older or clear feed handler
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          id="notifications-modal-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[88vh] sm:max-h-[85vh] shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 font-sans"
            onClick={(e) => e.stopPropagation()}
            id="notifications-modal-card"
          >
            {/* Modal Header (Fixed / Non-scrolling) */}
            <div className="p-4 sm:p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Bell size={22} className="sm:size-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                      {appMode === 'emr' ? 'Clinical Telemetry & System Alerts' : 'Hospital & Portal Notifications'}
                    </h3>
                    {unreadCount > 0 ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-full shrink-0 border border-red-200 dark:border-red-900">
                        {unreadCount} New
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full shrink-0 border border-emerald-200 dark:border-emerald-900">
                        All Caught Up
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Real-time feed of patient admissions, triage updates, lab notices, and telemetry alarms
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center"
                title="Close dialog (Esc)"
                id="close-notifications-modal-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Action Toolbar & Filters (Fixed / Non-scrolling) */}
            <div className="px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              {/* Feed Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setNotificationTab('active');
                    setTypeFilter('all');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    notificationTab === 'active'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                  id="tab-active-notifications"
                >
                  <Inbox size={14} />
                  <span>Active Feed ({activeFeedNotifications.length})</span>
                </button>

                <button
                  onClick={() => {
                    setNotificationTab('archived');
                    setTypeFilter('all');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    notificationTab === 'archived'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                  id="tab-archived-notifications"
                >
                  <Archive size={14} />
                  <span>Archived ({archivedNotifications.length})</span>
                </button>
              </div>

              {/* Action Buttons: Mark all as read & Clear All */}
              <div className="flex items-center gap-2 flex-wrap">
                {notificationTab === 'active' && (
                  <>
                    {/* Explicit 'Mark all as read' button */}
                    <button
                      onClick={handleMarkAllRead}
                      disabled={unreadCount === 0}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        unreadCount > 0
                          ? 'bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 cursor-pointer shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                      }`}
                      title={unreadCount > 0 ? "Mark all unread notifications as read" : "All notifications are already marked read"}
                      id="mark-all-read-btn"
                    >
                      <CheckCheck size={14} className={unreadCount > 0 ? "text-teal-600 dark:text-teal-400" : "text-slate-400"} />
                      <span>Mark all as read</span>
                    </button>

                    {activeFeedNotifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                        title="Archives older notifications to keep feed clean"
                        id="clear-all-feed-btn"
                      >
                        <Archive size={13} className="text-teal-600 dark:text-teal-400" />
                        <span>Clear Feed {olderThan24hCount > 0 ? `(>24h: ${olderThan24hCount})` : ''}</span>
                      </button>
                    )}
                  </>
                )}

                {notificationTab === 'archived' && archivedNotifications.length > 0 && (
                  <>
                    <button
                      onClick={handleRestoreAllArchived}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                    >
                      Restore All
                    </button>
                    <button
                      onClick={handleClearAllArchived}
                      className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
                    >
                      Purge All
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Notification Category Filters */}
            <div className="px-4 sm:px-6 py-2 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Filter size={11} />
                Filter:
              </span>
              {(['all', 'Alert', 'Schedule', 'Success', 'Info'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    typeFilter === type
                      ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type === 'Alert' ? 'Alerts' : type === 'Schedule' ? 'Schedules' : type === 'Success' ? 'Verified' : 'Info Logs'}
                </button>
              ))}
            </div>

            {/* Status Notice Banner */}
            {archiveNotice && (
              <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-xs font-medium text-teal-800 dark:text-teal-200 flex items-center justify-between shrink-0 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-teal-600 shrink-0" />
                  <span>{archiveNotice}</span>
                </div>
                <button onClick={() => setArchiveNotice(null)} className="p-1 text-teal-600 hover:text-teal-900 cursor-pointer">
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Dedicated Scrollable Notification List Body */}
            {/* The overscroll-contain and isolated overflow-y-auto ensures scrolling here does not scroll the outer page */}
            <div 
              className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 overscroll-contain touch-pan-y scrollbar-thin"
              id="notifications-modal-scrollable-content"
            >
              {displayedNotifications.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center shadow-2xs">
                    {notificationTab === 'active' ? <Inbox size={28} /> : <Archive size={28} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {notificationTab === 'active' 
                        ? (typeFilter !== 'all' ? `No ${typeFilter} notifications found` : 'No active notifications in feed') 
                        : 'No archived notifications stored'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {notificationTab === 'active'
                        ? 'All clinical alerts, patient triage updates, and hospital telemetry alarms have been resolved.'
                        : 'Notifications archived past 24 hours will be safely retained here for compliance audits.'}
                    </p>
                  </div>
                  {typeFilter !== 'all' && (
                    <button
                      onClick={() => setTypeFilter('all')}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Clear filters and view all
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

            {/* Modal Footer (Fixed / Non-scrolling) */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {onQuickAction && (
                <button
                  onClick={() => {
                    onQuickAction('simulateAlert');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                  title="Simulate a real-time admission telemetry alarm"
                >
                  <AlertTriangle size={14} className="text-rose-500" />
                  <span>[ SIMULATE ADMISSION ALARM ]</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs min-h-[40px] flex items-center justify-center"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
