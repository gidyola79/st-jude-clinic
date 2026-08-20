import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Settings, 
  ShieldAlert, 
  UserRound, 
  UsersRound, 
  Pill, 
  Receipt, 
  Bed, 
  Activity, 
  Video, 
  Sparkles, 
  ShieldCheck, 
  Stethoscope, 
  UserCheck, 
  Siren,
  Globe,
  ArrowUpRight,
  X,
  Menu,
  LogOut,
  Lock,
  MoreHorizontal
} from 'lucide-react';
import { UserRole, StaffUser } from '../types';
import ClinicLogo from './ClinicLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  emergencyCount?: number;
  lowStockCount?: number;
  pendingClaimsCount?: number;
  onOpenAiAssistant?: () => void;
  onOpenTelehealth?: () => void;
  onSwitchToPublic?: () => void;
  staffUser?: StaffUser | null;
  onSignOutStaff?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen,
  emergencyCount = 2,
  lowStockCount = 2,
  pendingClaimsCount = 2,
  onOpenAiAssistant,
  onOpenTelehealth,
  onSwitchToPublic,
  staffUser,
  onSignOutStaff,
}: SidebarProps) {
  // Keyboard Escape listener to dismiss mobile drawer
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (setIsMobileOpen) setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setIsMobileOpen]);

  const menuItems = [
    { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard, keyHint: '1' },
    { id: 'emergency', label: 'Emergency & Triage', icon: Siren, keyHint: 'E', badge: emergencyCount, badgeColor: 'bg-red-500' },
    { id: 'appointments', label: 'Appointments & Consults', icon: Calendar, keyHint: '2' },
    { id: 'beds', label: 'Inpatient Ward Beds', icon: Bed, keyHint: 'B' },
    { id: 'patients', label: 'Patient Electronic Records', icon: UserRound, keyHint: '3' },
    { id: 'pharmacy', label: 'Pharmacy & Dispensary', icon: Pill, keyHint: 'P', badge: lowStockCount, badgeColor: 'bg-amber-500' },
    { id: 'billing', label: 'Billing & Insurance', icon: Receipt, keyHint: '4' },
    { id: 'doctors', label: 'Doctors & Care Teams', icon: UsersRound, keyHint: '5' },
    { id: 'analytics', label: 'Clinical Analytics', icon: BarChart3, keyHint: '6', adminOnly: true },
    { id: 'settings', label: 'Settings & Audit Logs', icon: Settings, keyHint: '7', adminOnly: true },
  ];

  // Primary bottom navigation items for small mobile screens
  const mobilePrimaryTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'emergency', label: 'Emergency', icon: Siren, badge: emergencyCount, badgeColor: 'bg-red-500' },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: UserRound },
  ];

  const isMoreActive = !mobilePrimaryTabs.some(t => t.id === activeTab);
  const otherBadgesCount = (lowStockCount || 0) + (pendingClaimsCount || 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 h-16 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <ClinicLogo size="sm" id="sidebar-clinic-logo" />
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                St. Jude Clinic
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wider">
                CLINICAL OS v2.4
              </span>
            </div>
          )}
        </div>
        
        {/* Mobile Close Button */}
        {isMobileOpen && setIsMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            title="Close menu"
          >
            <X size={18} />
          </button>
        )}

        {/* Desktop Collapse Toggle */}
        {!isMobileOpen && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
              
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate pr-1">{item.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.adminOnly && activeRole !== 'Admin' && (
                      <span className="p-0.5 rounded text-amber-500" title="Admin clearance required">
                        <Lock size={11} />
                      </span>
                    )}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shrink-0 ${item.badgeColor || 'bg-teal-500'}`}>
                        {item.badge}
                      </span>
                    )}
                    <span className={`text-[9px] font-mono px-1 rounded border opacity-60 shrink-0 ${
                      isActive 
                        ? 'border-teal-400/40 text-teal-100' 
                        : 'border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}>
                      {item.keyHint}
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Launch Clinical Tools Footer */}
      {(!isCollapsed || isMobileOpen) && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Clinical Tools
          </div>
          
          {onOpenAiAssistant && (
            <button
              onClick={() => {
                onOpenAiAssistant();
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500/10 to-indigo-500/10 hover:from-teal-500/20 hover:to-indigo-500/20 border border-teal-200/50 dark:border-teal-800/50 text-teal-800 dark:text-teal-300 text-xs font-bold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-teal-600 dark:text-teal-400" />
                <span>AI Clinical Co-Pilot</span>
              </div>
              <span className="text-[9px] bg-teal-500 text-white px-1.5 py-0.2 rounded font-mono">STAT</span>
            </button>
          )}

          {onSwitchToPublic && (
            <button
              onClick={() => {
                onSwitchToPublic();
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-slate-500" />
                <span>Public Patient Gateway</span>
              </div>
              <ArrowUpRight size={12} />
            </button>
          )}

          {/* Authenticated Staff Station Footer & Lock Button */}
          {staffUser && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex flex-col truncate pr-2">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {staffUser.displayName}
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-mono truncate">
                    {staffUser.email}
                  </span>
                </div>
                {onSignOutStaff && (
                  <button
                    onClick={() => {
                      if (setIsMobileOpen) setIsMobileOpen(false);
                      onSignOutStaff();
                    }}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 cursor-pointer"
                    title="Lock Workstation & Sign Out"
                  >
                    <LogOut size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Persistent Sidebar Drawer */}
      <motion.aside
        animate={{ width: isCollapsed ? '72px' : '280px' }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex relative flex-col h-screen border-r border-slate-200 dark:border-slate-800 shrink-0 select-none z-30 overflow-hidden"
        id="main-sidebar-desktop"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Bottom Navigation Bar (Mobile-first responsive pattern) */}
      <nav 
        id="mobile-bottom-navigation-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around select-none shadow-lg shadow-slate-950/10"
      >
        {mobilePrimaryTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all relative cursor-pointer min-w-[56px] ${
                isActive 
                  ? 'text-teal-600 dark:text-teal-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? 'text-teal-600 dark:text-teal-400 scale-110 transition-transform' : 'text-slate-500 dark:text-slate-400'} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[8px] font-black text-white ${item.badgeColor || 'bg-teal-500'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-teal-600 dark:bg-teal-400 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* More / All Modules Drawer Trigger */}
        <button
          onClick={() => setIsMobileOpen && setIsMobileOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all relative cursor-pointer min-w-[56px] ${
            isMoreActive 
              ? 'text-teal-600 dark:text-teal-400 font-bold' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="All clinical modules & tools"
        >
          <div className="relative">
            <MoreHorizontal size={19} className={isMoreActive ? 'text-teal-600 dark:text-teal-400 scale-110 transition-transform' : 'text-slate-500 dark:text-slate-400'} />
            {otherBadgesCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="mt-0.5 tracking-tight">{isMoreActive ? 'Module' : 'More'}</span>
          {isMoreActive && (
            <span className="w-1 h-1 rounded-full bg-teal-600 dark:bg-teal-400 mt-0.5" />
          )}
        </button>
      </nav>

      {/* Mobile Drawer (Accessible via 'More' in bottom nav or Header hamburger) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Sliding Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

