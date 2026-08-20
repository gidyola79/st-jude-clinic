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
  Plus
} from 'lucide-react';
import { SystemLog, UserRole } from '../types';

interface SettingsViewProps {
  systemLogs: SystemLog[];
  setSystemLogs: (logs: SystemLog[]) => void;
  onResetDatabase: () => void;
  activeRole: UserRole;
  addNotification: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule') => void;
  isSimulationEnabled: boolean;
  setIsSimulationEnabled: (val: boolean) => void;
}

export default function SettingsView({
  systemLogs,
  setSystemLogs,
  onResetDatabase,
  activeRole,
  addNotification,
  isSimulationEnabled,
  setIsSimulationEnabled,
}: SettingsViewProps) {
  const [logFilter, setLogFilter] = useState<'All' | 'Info' | 'Warning' | 'Error'>('All');

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
        
        {/* Left Column 2 Cols: Keyboard Shortcuts & Security governance table */}
        <div className="lg:col-span-2 space-y-6">
          
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
                onClick={onResetDatabase}
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
                  onClick={clearSystemLogs}
                  className="text-[10px] text-slate-400 hover:text-slate-500 underline cursor-pointer"
                >
                  Clear logs cache
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
