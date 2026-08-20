import React, { useEffect } from 'react';
import { Lock, Timer, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SessionInactivityModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onExtendSession: () => void;
  onLogoutNow: () => void;
}

/**
 * SessionInactivityModal Component
 * 
 * Alerts clinical staff before automatic session termination occurs due to inactivity.
 * Enforces compliance with hospital data security policies (HIPAA automatic logoff standards).
 */
export default function SessionInactivityModal({
  isOpen,
  remainingSeconds,
  onExtendSession,
  onLogoutNow,
}: SessionInactivityModalProps) {
  // Keyboard Escape listener to extend session & dismiss warning
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExtendSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onExtendSession]);

  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-70 p-4 font-sans select-none"
        id="session-inactivity-modal-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-900/60 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 relative overflow-hidden text-center"
        >
          {/* Pulsing warning banner strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 animate-pulse" />

          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-4 shadow-inner">
            <Timer size={28} className="animate-bounce" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2 font-mono">
            <ShieldAlert size={12} />
            <span>Clinical Workstation Timeout</span>
          </div>

          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Session Expiring Due to Inactivity
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto mb-4">
            For patient data confidentiality (HIPAA § 164.312), idle workstation sessions automatically lock after 15 minutes of inactivity.
          </p>

          {/* Countdown Clock Display */}
          <div className="my-5 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-center gap-3">
            <div className="text-left">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Lockout in</span>
              <span className="text-2xl font-black font-mono tracking-widest text-amber-400">
                {formattedTime}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono pl-4 border-l border-slate-800">
              15 min security limit
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-center mt-2">
            <button
              onClick={onExtendSession}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="extend-session-btn"
            >
              <RefreshCw size={14} />
              <span>Keep Working (Extend)</span>
            </button>
            <button
              onClick={onLogoutNow}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-800"
              id="logout-now-btn"
            >
              <LogOut size={14} />
              <span>Lock Now</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
