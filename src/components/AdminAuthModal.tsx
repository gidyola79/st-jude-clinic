import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ShieldAlert, KeyRound, Lock, Check, X, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';
import ClinicLogo from './ClinicLogo';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetRole?: UserRole;
}

export default function AdminAuthModal({
  isOpen,
  onClose,
  onSuccess,
  targetRole = 'Admin',
}: AdminAuthModalProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Keyboard Escape listener to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Authorized master clinical hospital passcode
  // Defaults to "admin2026" or "7100" (Hospital ID root)
  const VALID_PASSCODES = ['admin2026', '7100', 'hospitaladmin', 'stjude'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const clean = passcode.trim().toLowerCase();
      if (VALID_PASSCODES.includes(clean)) {
        setPasscode('');
        setError('');
        onSuccess();
      } else {
        setError('Invalid Clinical Master Key. Access Denied. (Hint: "admin2026" or "7100")');
      }
    }, 350);
  };

  const handleQuickBypassForTest = (code: string) => {
    setPasscode(code);
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 font-sans"
            id="admin-auth-modal"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-650 via-red-600 to-rose-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClinicLogo size="md" id="admin-modal-logo" className="shadow-lg shadow-red-950/30" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-extrabold tracking-tight">
                      Admin Authorization
                    </h3>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-white/20 border border-white/30 text-white">
                      Clearance
                    </span>
                  </div>
                  <p className="text-xs text-red-100 font-medium">
                    St. Jude Clinic • Governance & Oversight
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-800 dark:text-red-300 flex items-start gap-2.5">
                <Lock size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <div className="leading-relaxed">
                  <strong>Restricted Access:</strong> Administrator mode grants full clearance over hospital system logs, database syncs, ICU bed overrides, and practitioner assignments.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter Administrator Passcode / Security Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="password"
                    autoFocus
                    placeholder="Enter admin passcode (e.g. admin2026)"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-medium"
                >
                  <AlertCircle size={14} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Quick credential hint badge */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Authorized hospital staff key:</span>
                <button
                  type="button"
                  onClick={() => handleQuickBypassForTest('admin2026')}
                  className="font-mono font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900"
                >
                  admin2026
                </button>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  id="admin-auth-submit-btn"
                >
                  {isVerifying ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      <span>Authorize Admin Mode</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
