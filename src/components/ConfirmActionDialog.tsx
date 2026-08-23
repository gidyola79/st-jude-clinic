import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle,
  FileWarning,
  Activity,
  User,
  Calendar,
  Pill,
  Clock
} from 'lucide-react';

export interface ConfirmActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  message?: string; // alias for description
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  iconType?: 'trash' | 'alert' | 'prescription' | 'appointment' | 'discharge' | 'reset' | 'shield';
  itemDetails?: Array<{
    label: string;
    value: string | number;
    icon?: React.ComponentType<{ className?: string; size?: number }>;
  }>;
  requireTypingConfirmation?: string; // e.g. "RESET" or "DELETE"
  destructiveImpactNotice?: string;
}

export function ConfirmActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  iconType = 'trash',
  itemDetails,
  requireTypingConfirmation,
  destructiveImpactNotice = 'This action will modify clinical records. Please verify patient context before proceeding.'
}: ConfirmActionDialogProps) {
  const [typedValue, setTypedValue] = React.useState('');

  const displayDescription = description || message || 'Are you sure you want to proceed with this destructive action?';

  // Reset typed confirmation when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTypedValue('');
    }
  }, [isOpen]);

  // Keyboard Escape listener
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

  if (!isOpen) return null;

  const isConfirmDisabled = requireTypingConfirmation 
    ? typedValue.trim().toUpperCase() !== requireTypingConfirmation.toUpperCase()
    : false;

  const getHeaderIcon = () => {
    switch (iconType) {
      case 'trash':
        return <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'prescription':
        return <Pill className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'discharge':
        return <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'reset':
        return <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'alert':
      default:
        return <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-600',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-amber-600/20',
          badgeBorder: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/20',
          badgeBorder: 'border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300'
        };
      case 'danger':
      default:
        return {
          iconBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-600/20',
          badgeBorder: 'border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        id="confirm-action-dialog-backdrop"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-action-dialog-title"
        >
          {/* Top Security Stripe */}
          <div className={`h-1.5 w-full ${variant === 'danger' ? 'bg-rose-600' : variant === 'warning' ? 'bg-amber-500' : 'bg-blue-600'}`} />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${styles.iconBg}`}>
                {getHeaderIcon()}
              </div>
              <div className="space-y-1">
                <h3 
                  id="confirm-action-dialog-title" 
                  className="text-base font-bold text-slate-900 dark:text-white leading-snug"
                >
                  {title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {displayDescription}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              id="confirm-action-dialog-close-btn"
              title="Close dialog (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Item Context Details (if provided) */}
          {itemDetails && itemDetails.length > 0 && (
            <div className="px-5 sm:px-6 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-y border-slate-150 dark:border-slate-800/80">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Clinical Target Record
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {itemDetails.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div 
                      key={idx} 
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                        {ItemIcon && <ItemIcon className="w-3.5 h-3.5 text-slate-400" />}
                        {item.label}:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white truncate text-right">
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Impact Warning Banner */}
          <div className="px-5 sm:px-6 pt-4 pb-2">
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${styles.badgeBorder}`}>
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">HIPAA & Clinical Data Integrity Safeguard</span>
                <span className="text-[11px] opacity-90 leading-relaxed block">
                  {destructiveImpactNotice}
                </span>
              </div>
            </div>
          </div>

          {/* Explicit Typing Requirement for Critical Actions */}
          {requireTypingConfirmation && (
            <div className="px-5 sm:px-6 py-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                To confirm, type <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">{requireTypingConfirmation}</span> below:
              </label>
              <input
                type="text"
                value={typedValue}
                onChange={(e) => setTypedValue(e.target.value)}
                placeholder={`Type "${requireTypingConfirmation}" to proceed`}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                id="confirm-action-dialog-type-input"
                autoFocus
              />
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="p-5 sm:p-6 pt-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              id="confirm-action-dialog-cancel-btn"
            >
              {cancelText}
            </button>

            <button
              type="button"
              disabled={isConfirmDisabled}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2 text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmBtn}`}
              id="confirm-action-dialog-confirm-btn"
            >
              {variant === 'danger' && <Trash2 className="w-3.5 h-3.5" />}
              {variant === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
              {variant === 'info' && <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ConfirmActionDialog;
