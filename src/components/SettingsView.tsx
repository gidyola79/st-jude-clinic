import { useState } from 'react';
import { 
  Settings, 
  Terminal, 
  RefreshCw, 
  ShieldCheck, 
  Info, 
  Keyboard, 
  ShieldAlert, 
  Check, 
  X,
  Plus,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { SystemLog, UserRole } from '../types';
import { playClinicalAlertSound } from '../utils/audioAlerts';
import ConfirmationModal from './ConfirmationModal';

interface SettingsViewProps {
  systemLogs: SystemLog[];
  setSystemLogs: (logs: SystemLog[]) => void;
  onResetDatabase: () => void;
  activeRole: UserRole;
  addNotification: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule') => void;
  isSimulationEnabled: boolean;
  setIsSimulationEnabled: (val: boolean) => void;
  soundAlertsEnabled?: boolean;
  setSoundAlertsEnabled?: (val: boolean) => void;
  soundVolume?: number;
  setSoundVolume?: (val: number) => void;
}

export default function SettingsView({
  systemLogs,
  setSystemLogs,
  onResetDatabase,
  activeRole,
  addNotification,
  isSimulationEnabled,
  setIsSimulationEnabled,
  soundAlertsEnabled = true,
  setSoundAlertsEnabled,
  soundVolume = 0.28,
  setSoundVolume
}: SettingsViewProps) {
  const [logFilter, setLogFilter] = useState<'All' | 'Info' | 'Warning' | 'Error'>('All');
  const [testingSoundType, setTestingSoundType] = useState<string | null>(null);
  
  // Destructive Confirmation States
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearLogsConfirmOpen, setIsClearLogsConfirmOpen] = useState(false);

  const handleTestSound = (type: 'Alert' | 'Success' | 'Info' | 'Schedule') => {
    setTestingSoundType(type);
    playClinicalAlertSound(type, true, soundVolume);
    setTimeout(() => {
      setTestingSoundType(null);
    }, 600);
  };

  const handleToggleSound = () => {
    if (setSoundAlertsEnabled) {
      const nextState = !soundAlertsEnabled;
      setSoundAlertsEnabled(nextState);
      if (nextState) {
        playClinicalAlertSound('Success', true, soundVolume);
        addNotification(
          'Clinical Audio Alerts Enabled',
          'Harmonic alert acoustics active (IEC 60601-1-8 compliant).',
          'Success'
        );
      } else {
        addNotification(
          'Clinical Silent Mode Activated',
          'Acoustic alert alarms muted. Visual notifications and status lights remain active.',
          'Info'
        );
      }
    }
  };

  // Filter System logs
  const filteredLogs = systemLogs.filter(log => {
    return logFilter === 'All' || log.level === logFilter;
  });

  const clearSystemLogs = () => {
    setSystemLogs([]);
    addNotification('Audit Logs Purged', 'System audit logs cleared successfully by administrator.', 'Info');
  };

  const executeManualSelfCheck = () => {
    const checkLog: SystemLog = {
      id: `L${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level: 'Info',
      message: 'Self-Diagnostic Completed: Airway, telemetry, and gas storage sockets all report stable calibration parameters.',
      user: 'Automated Diagnostic Unit'
    };
    setSystemLogs([checkLog, ...systemLogs]);
    addNotification('Diagnostic Sync Completed', 'St. Jude clinical check complete. Zero socket leaks reported.', 'Success');
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column 2 Cols: Audio Noise Governance, Keyboard Shortcuts & Security permissions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Clinical Environment Acoustic & Notification Sound Control */}
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs" id="clinical-audio-settings-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${soundAlertsEnabled ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                    {soundAlertsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Clinical Notification Sounds & Noise Governance
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                  Toggle audible chimes for critical triage alarms, admission events, and verified operations. Configured to comply with hospital noise abatement guidelines (IEC 60601-1-8).
                </p>
              </div>

              {/* Master Sound Alert Toggle */}
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-bold ${soundAlertsEnabled ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
                  {soundAlertsEnabled ? 'Acoustic Sounds ON' : 'Muted (Silent Mode)'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={soundAlertsEnabled}
                  onClick={handleToggleSound}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    soundAlertsEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  id="notification-sound-toggle-btn"
                  title={soundAlertsEnabled ? "Disable notification sounds (Clinical Silent Mode)" : "Enable notification sounds"}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      soundAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Environmental Mode & Calibration Controls */}
            <div className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Clinical Mode Description Box */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  soundAlertsEnabled 
                    ? 'bg-teal-50/30 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-900/40 text-slate-700 dark:text-slate-300'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Volume1 size={14} className="text-teal-600 dark:text-teal-400" />
                      Acoustic Alarm Profile
                    </span>
                    <span className={`text-[9.5px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                      soundAlertsEnabled ? 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {soundAlertsEnabled ? 'Active Ward' : 'Quiet Ward'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {soundAlertsEnabled 
                      ? 'Employs soft two-tone sinusoidal harmonic waves (880Hz / 740Hz) with gradual attack ramps to notify staff while preserving quiet patient recovery rooms.'
                      : 'Silent Visual Mode active: Only screen badges and status banners will render. Ideal for night rounds and intensive care quiet zones.'}
                  </p>
                </div>

                {/* Sound Output Level / Volume Presets */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Volume Level Calibration
                    </span>
                    <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                      {soundAlertsEnabled ? `${Math.round((soundVolume || 0.28) * 100)}%` : '0% (Muted)'}
                    </span>
                  </div>
                  
                  {/* Volume Preset Selector Chips */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Quiet (15%)', val: 0.15 },
                      { label: 'Ward (28%)', val: 0.28 },
                      { label: 'ICU (50%)', val: 0.50 }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        disabled={!soundAlertsEnabled}
                        onClick={() => {
                          if (setSoundVolume) {
                            setSoundVolume(preset.val);
                            playClinicalAlertSound('Success', true, preset.val);
                          }
                        }}
                        className={`py-1.5 px-2 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer border ${
                          Math.abs((soundVolume || 0.28) - preset.val) < 0.05 && soundAlertsEnabled
                            ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sound Calibration Test Buttons Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Interactive Sound Synthesizer Test:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleTestSound('Alert')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      testingSoundType === 'Alert'
                        ? 'bg-red-600 text-white border-red-600 scale-95'
                        : 'bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900'
                    }`}
                    title="Test High-Priority Emergency Alarm Sound"
                  >
                    <AlertTriangle size={13} className={testingSoundType === 'Alert' ? 'animate-spin' : ''} />
                    <span>Test Critical Alert</span>
                  </button>

                  <button
                    onClick={() => handleTestSound('Success')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      testingSoundType === 'Success'
                        ? 'bg-emerald-600 text-white border-emerald-600 scale-95'
                        : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                    }`}
                    title="Test Clinical Verification Chime"
                  >
                    <CheckCircle2 size={13} />
                    <span>Test Verification Chime</span>
                  </button>

                  <button
                    onClick={() => handleTestSound('Info')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      testingSoundType === 'Info'
                        ? 'bg-sky-600 text-white border-sky-600 scale-95'
                        : 'bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900'
                    }`}
                    title="Test Gentle Info Blip"
                  >
                    <Bell size={13} />
                    <span>Test Info Blip</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Permissions Matrix */}
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck className="text-blue-600 dark:text-blue-400" size={16} />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security Governance & Permissions Matrix</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              St. Jude utilizes rigid Role-Based Access Control (RBAC). Shift modes dictate authorized actions in real-time.
            </p>

            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3 border border-red-100 dark:border-red-950/40 bg-rose-50/5 dark:bg-red-950/10 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-red-650 dark:text-red-400">ADMINISTRATOR PRIVILEGES</span>
                  {activeRole === 'Admin' && <span className="px-2 py-0.2 bg-red-600 text-white font-extrabold text-[8px] tracking-wide rounded">Active</span>}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Has global read-write diagnostic capabilities. Authorized to add clinical staff, toggle duty schedules, override continuous care ICU bed levels, and sync third-party claim APIs.
                </p>
              </div>

              <div className="p-3 border border-indigo-150 dark:border-indigo-950/40 bg-indigo-50/5 dark:bg-indigo-950/10 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-indigo-650 dark:text-indigo-400">PRACTITIONER / DOCTOR AUTHORIZATION</span>
                  {activeRole === 'Doctor' && <span className="px-2 py-0.2 bg-indigo-600 text-white font-extrabold text-[8px] tracking-wide rounded">Active</span>}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Clearance level: Clinical Patient records. Entitled to read diagnosis histories, write pharmacopeia scripts, sign off checkups, and dispatch laboratory inquiries.
                </p>
              </div>

              <div className="p-3 border border-emerald-150 dark:border-emerald-950/40 bg-emerald-50/5 dark:bg-emerald-950/15 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-emerald-650 dark:text-emerald-400">ADM_RECEPTIONIST PRIVILEGES</span>
                  {activeRole === 'Receptionist' && <span className="px-2 py-0.2 bg-emerald-600 text-white font-extrabold text-[8px] tracking-wide rounded">Active</span>}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Core duties: Walk-in intake and doctor scheduler slots coordinates. Authorized to draft patient admissions, check-in queues, and monitor insurance eligibility.
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Keyboard shortcuts */}
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5 mb-2">
              <Keyboard className="text-blue-600 dark:text-blue-400" size={16} />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">Keyboard Shortcuts Accessibility Index</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Rapid keyboard bindings designed for professional high-density hospital desks. Type standard keys anytime.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2 border border-slate-100 dark:border-slate-900 rounded bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                <span className="text-slate-550 dark:text-slate-400">View Overview Dashboard</span>
                <span className="px-2 py-0.5 rounded border border-slate-250 bg-white dark:bg-slate-900 font-mono font-bold text-[10px] text-slate-600 dark:text-slate-300 shadow-3xd">[ 1 ]</span>
              </div>
              <div className="p-2 border border-slate-100 dark:border-slate-900 rounded bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                <span className="text-slate-550 dark:text-slate-400">View Scheduler calendar</span>
                <span className="px-2 py-0.5 rounded border border-slate-250 bg-white dark:bg-slate-900 font-mono font-bold text-[10px] text-slate-600 dark:text-slate-300 shadow-3xd">[ 2 ]</span>
              </div>
              <div className="p-2 border border-slate-100 dark:border-slate-900 rounded bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                <span className="text-slate-550 dark:text-slate-400">View Active Physicians</span>
                <span className="px-2 py-0.5 rounded border border-slate-250 bg-white dark:bg-slate-900 font-mono font-bold text-[10px] text-slate-600 dark:text-slate-300 shadow-3xd">[ 3 ]</span>
              </div>
              <div className="p-2 border border-slate-100 dark:border-slate-900 rounded bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                <span className="text-slate-550 dark:text-slate-400">View EHR Patient Files</span>
                <span className="px-2 py-0.5 rounded border border-slate-250 bg-white dark:bg-slate-900 font-mono font-bold text-[10px] text-slate-600 dark:text-slate-300 shadow-3xd">[ 4 ]</span>
              </div>
              <div className="p-2 border border-slate-100 dark:border-slate-900 rounded bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                <span className="text-slate-550 dark:text-slate-400">View Clinical Reports</span>
                <span className="px-2 py-0.5 rounded border border-slate-250 bg-white dark:bg-slate-900 font-mono font-bold text-[10px] text-slate-600 dark:text-slate-300 shadow-3xd">[ 5 ]</span>
              </div>
              <div className="p-2 border border-slate-100 dark:border-slate-900 rounded bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                <span className="text-slate-550 dark:text-slate-400">Open Settings Bar</span>
                <span className="px-2 py-0.5 rounded border border-slate-250 bg-white dark:bg-slate-900 font-mono font-bold text-[10px] text-slate-600 dark:text-slate-300 shadow-3xd">[ 6 ]</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column 1 Col: Admin Quick Recovery + Live System logs */}
        <div className="space-y-6">
          
          {/* Live Simulation Control Panel */}
          <div className="p-5 bg-gradient-to-br from-blue-50/10 to-indigo-50/10 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-indigo-900/30 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Live Simulator Daemon
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Simulates background client bookings and triage events.</p>
              </div>
              <button
                onClick={() => {
                  setIsSimulationEnabled(!isSimulationEnabled);
                  addNotification(
                    isSimulationEnabled ? 'Live Simulation Deactivated' : 'Live Simulation Activated',
                    isSimulationEnabled ? 'Hospital telemetry simulation stopped.' : 'Hospital background event cycle synced.',
                    'Info'
                  );
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all border ${
                  isSimulationEnabled 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10' 
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-450'
                }`}
              >
                {isSimulationEnabled ? 'ACTIVE (45s)' : 'STANDBY'}
              </button>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-150 dark:border-slate-900 bg-white/40 dark:bg-slate-950/20 text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-2">
              <p>
                The background worker generates random patient admissions, clinical bed updates, and kiosk appointments.
              </p>
              <div className="flex justify-between items-center text-[10.5px] border-t border-slate-105 dark:border-slate-900 pt-1.5">
                <span>Simulation Status:</span>
                <span className={`font-mono font-bold ${isSimulationEnabled ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {isSimulationEnabled ? '■ INGESTION LIVE' : '○ IDLE'}
                </span>
              </div>
            </div>
          </div>

          {/* Recovery controls */}
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Database Care</h3>
              <p className="text-xs text-slate-400 mt-1">Restore default settings and simulated database parameters immediately.</p>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <button
                onClick={executeManualSelfCheck}
                className="w-full text-center py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg cursor-pointer"
              >
                Perform Clinical Socket Self-Check
              </button>

              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="w-full text-center py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-lg shadow cursor-pointer flex items-center justify-center gap-1.5"
                id="reset-db-btn"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
                Hard Reset Clinician Databases
              </button>
            </div>
          </div>

          {/* System logs */}
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
              <div className="flex items-center gap-1.5">
                <Terminal size={14} className="text-blue-500" />
                <span className="font-extrabold font-sans text-xs tracking-tight text-slate-900 dark:text-white font-mono">
                  Telemetry & Audit Log
                </span>
              </div>

              <select
                value={logFilter}
                onChange={(e: any) => setLogFilter(e.target.value)}
                className="text-[10px] p-1 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Logs</option>
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Error">Error</option>
              </select>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-2 rounded border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/40 text-[10.5px]">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`font-black font-mono text-[9px] uppercase tracking-wider ${
                      log.level === 'Error' ? 'text-rose-500' : log.level === 'Warning' ? 'text-amber-500' : 'text-blue-500'
                    }`}>
                      [{log.level}]
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-650 dark:text-slate-400 italic">
                    {log.message}
                  </p>
                  <p className="text-[9.5px] text-slate-400 mt-1 font-mono">Operator: {log.user}</p>
                </div>
              ))}
            </div>

            {filteredLogs.length > 0 && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsClearLogsConfirmOpen(true)}
                  className="text-[10px] text-slate-400 hover:text-rose-500 underline cursor-pointer"
                  id="clear-logs-btn"
                >
                  Clear logs cache
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Hard Reset Clinical Database Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          onResetDatabase();
          setIsResetConfirmOpen(false);
        }}
        title="Hard Reset Hospital Databases"
        description="WARNING: This operation will completely purge all active patient electronic health records, outpatient schedule bookings, inpatient bed allocations, and pharmacy warehouse stock levels, restoring factory default clinical templates."
        confirmText="Hard Reset Databases"
        cancelText="Cancel & Keep Data"
        variant="danger"
        iconType="reset"
        requireTypingConfirmation="RESET"
        destructiveImpactNotice="All local modifications and active telemetry streams will be irrevocably deleted across all hospital departmental workstations."
        itemDetails={[
          { label: 'Operator Role', value: activeRole },
          { label: 'Target Datastores', value: 'EHR, Rx, Beds, Billing, Logs' },
          { label: 'Security Level', value: 'HIPAA Critical Wipe' }
        ]}
      />

      {/* Clear Logs Cache Confirmation Modal */}
      <ConfirmationModal
        isOpen={isClearLogsConfirmOpen}
        onClose={() => setIsClearLogsConfirmOpen(false)}
        onConfirm={() => {
          clearSystemLogs();
          setIsClearLogsConfirmOpen(false);
        }}
        title="Purge System Telemetry & Audit Logs"
        description="Are you sure you want to clear the workstation telemetry and audit log history? Recent operational events will be cleared from memory."
        confirmText="Purge Logs Cache"
        cancelText="Keep Logs"
        variant="warning"
        iconType="trash"
        destructiveImpactNotice="Workstation event history will be cleared. Background telemetry services will continue recording new events."
        itemDetails={[
          { label: 'Total Logs', value: `${systemLogs.length} events` },
          { label: 'Current Filter', value: logFilter }
        ]}
      />

    </div>
  );
}

