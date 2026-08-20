import { ReactNode } from 'react';
import { UserRole } from '../types';
import { ShieldAlert, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export interface AccessControlProps {
  /** The current active role of the logged-in staff session */
  activeRole: UserRole;
  /** Allowed roles that have permission to view this module */
  allowedRoles?: UserRole[];
  /** Minimum or exact required role if specified */
  requiredRole?: UserRole;
  /** Human-readable module/view name for clear security messaging */
  moduleName: string;
  /** Callback triggered when user requests elevation (e.g. opens admin passcode challenge) */
  onRequestElevation?: () => void;
  /** Callback triggered when user clicks return to dashboard */
  onNavigateDashboard?: () => void;
  /** Optional custom fallback component to override the default lock screen */
  fallback?: ReactNode;
  /** Child component to render ONLY when permission is verified */
  children: ReactNode;
}

/**
 * Centralized AccessControl Component
 * 
 * Enforces strict role-based access control (RBAC) at the render tree boundary.
 * If the active role lacks sufficient clearance, children are NOT mounted or rendered,
 * completely preventing unauthorized component lifecycle execution or data leakage.
 */
export default function AccessControl({
  activeRole,
  allowedRoles,
  requiredRole,
  moduleName,
  onRequestElevation,
  onNavigateDashboard,
  fallback,
  children
}: AccessControlProps) {
  // Determine if the active role is permitted
  const isAuthorized = (() => {
    if (requiredRole) {
      return activeRole === requiredRole;
    }
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(activeRole);
    }
    // Default: allow all standard staff roles if no restrictions specified
    return true;
  })();

  if (isAuthorized) {
    return <>{children}</>;
  }

  // Custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  const expectedRoleText = requiredRole 
    ? requiredRole 
    : allowedRoles?.join(' or ') || 'Admin';

  // Standardized High-Security Clinical Clearance Guard
  return (
    <div 
      className="flex items-center justify-center min-h-[500px] w-full p-4 select-none"
      id="access-control-restricted-guard"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden"
      >
        {/* Top security accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-500 to-rose-600" />

        {/* Shield Security Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-5 shadow-inner">
          <Lock size={30} className="stroke-[2.2]" />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shadow">
            !
          </span>
        </div>

        {/* Header Badges */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] uppercase font-mono font-black text-slate-600 dark:text-slate-400 mb-3 tracking-wider">
          <ShieldAlert size={12} className="text-amber-500" />
          <span>Security Clearance Restriction</span>
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Clearance Level Required
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
          The <strong className="text-slate-900 dark:text-slate-100 font-bold">{moduleName}</strong> module contains protected hospital telemetry, administrative audit logs, or governance configurations.
        </p>

        {/* Clearance Discrepancy Matrix */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 mb-6 text-left text-xs font-sans">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Your Active Role
            </span>
            <div className="flex items-center gap-1.5 font-extrabold text-slate-700 dark:text-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{activeRole}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Required Clearance
            </span>
            <div className="flex items-center gap-1.5 font-extrabold text-red-600 dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>{expectedRoleText}</span>
            </div>
          </div>
        </div>

        {/* Security Policy Notice */}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mb-6 leading-relaxed">
          HIPAA Security Rule 45 CFR § 164.312(a)(1) — Access Control & Role-Based Separation of Duties.
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {onRequestElevation && (
            <button
              onClick={onRequestElevation}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs tracking-wide shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
              id="elevate-clearance-btn"
            >
              <ShieldCheck size={14} />
              <span>Elevate Clearance to Admin</span>
            </button>
          )}

          {onNavigateDashboard && (
            <button
              onClick={onNavigateDashboard}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800"
              id="return-to-dashboard-btn"
            >
              <ArrowLeft size={13} />
              <span>Return to Dashboard</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
