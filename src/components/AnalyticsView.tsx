import { useState } from 'react';
import { 
  BarChart3, 
  Activity, 
  Bed, 
  ShieldCheck, 
  ArrowUpRight, 
  Layers, 
  Users, 
  AlertCircle, 
  HeartHandshake
} from 'lucide-react';
import { Patient, BedAlloc, DepartmentMetric } from '../types';

interface AnalyticsViewProps {
  patients: Patient[];
  beds: BedAlloc[];
}

const DEPARTMENTS = [
  { name: 'Cardiology', color: '#3b82f6', darkColor: 'text-blue-400', bg: 'bg-blue-500/10', fill: '#3b82f6' },
  { name: 'Neurology', color: '#6366f1', darkColor: 'text-indigo-400', bg: 'bg-indigo-500/10', fill: '#6366f1' },
  { name: 'Oncology', color: '#ec4899', darkColor: 'text-pink-400', bg: 'bg-pink-500/10', fill: '#ec4899' },
  { name: 'Pediatrics', color: '#10b981', darkColor: 'text-[#10b981]', bg: 'bg-emerald-500/10', fill: '#15803d' },
  { name: 'Emergency', color: '#f43f5e', darkColor: 'text-rose-400', bg: 'bg-rose-500/10', fill: '#f43f5e' }
];

export default function AnalyticsView({
  patients,
  beds,
}: AnalyticsViewProps) {
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Compute stats on-the-fly dynamically to reflect actual patients in state! This is beautiful.
  const deptPatientCounts = DEPARTMENTS.map(dept => {
    // Cardiology maps to Dr. Robert Chen etc. Or match patient condition/history departments
    const count = patients.filter(p => {
      // Direct text matching or matching historical departments
      const hasHistMatch = p.history.some(h => h.department.toLowerCase() === dept.name.toLowerCase());
      if (hasHistMatch) return true;
      if (dept.name === 'Cardiology' && p.condition.toLowerCase().includes('heart')) return true;
      if (dept.name === 'Neurology' && p.condition.toLowerCase().includes('brain')) return true;
      if (dept.name === 'Pediatrics' && p.age < 12) return true;
      if (dept.name === 'Emergency' && p.status === 'Admitted' && p.room.toLowerCase().includes('icu')) return true;
      // Default fallback
      return p.id === 'P3' && dept.name === 'Internal Medicine';
    }).length;

    return {
      ...dept,
      count: count + (dept.name === 'Emergency' ? 24 : dept.name === 'Cardiology' ? 14 : dept.name === 'Oncology' ? 8 : 4) // mock baseline count
    };
  });

  const totalPatientsSum = deptPatientCounts.reduce((arr, d) => arr + d.count, 0);

  // Filter beds
  const icuBeds = beds.find(b => b.type === 'ICU');
  const emergencyBeds = beds.find(b => b.type === 'Emergency');
  const genBeds = beds.find(b => b.type === 'General');

  // Interactive Drill Down Patient Group
  const drillingPatients = patients.filter(p => {
    if (selectedDept === 'All') return true;
    
    // Check if department matches
    const hasHistMatch = p.history.some(h => h.department.toLowerCase() === selectedDept.toLowerCase());
    if (hasHistMatch) return true;
    if (selectedDept === 'Cardiology' && p.condition.toLowerCase().includes('heart')) return true;
    if (selectedDept === 'Neurology' && p.condition.toLowerCase().includes('migraine')) return true;
    if (selectedDept === 'Pediatrics' && p.age < 12) return true;
    if (selectedDept === 'Emergency' && p.status === 'Admitted' && p.room.toLowerCase().includes('icu')) return true;
    return false;
  });

  return (
    <div className="space-y-6">

      {/* Analytics Main metrics line */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric A */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Dynamic Outpatient Ratio</span>
          <div className="flex gap-4 items-end mt-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">2.4 : 1</h3>
            <span className="text-[10px] text-emerald-500 font-bold mb-1 flex items-center gap-0.5">
              <ArrowUpRight size={12} />
              +4% capacity expansion
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-sans">
            Measured against current general ward discharges and ambulatory checkups.
          </p>
        </div>

        {/* Metric B */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">ICU Outage Protection</span>
          <div className="flex gap-4 items-end mt-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">92.4%</h3>
            <span className="text-[10px] text-emerald-500 font-bold mb-1 flex items-center">
              Active Stability
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Average response time for cardiac crash telemetry is currently clocked at 8.4 seconds.
          </p>
        </div>

        {/* Metric C */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Clinical Bed Allocations</span>
          <div className="flex gap-4 items-end mt-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {icuBeds ? icuBeds.available : 3} ICU / {emergencyBeds ? emergencyBeds.available : 4} ER Open
            </h3>
          </div>
          <p className="text-[10px] text-rose-500 font-bold mt-2">
            Discharges scheduled today support stable triage flow.
          </p>
        </div>

      </div>

      {/* Custom Graphic layout and Department distribution (Click interactive filters) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        
        {/* Left Column: Interactive Circle Donut (Using SVG!) */}
        <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Patient Allocation by Department</h3>
            <p className="text-xs text-slate-400 mt-0.5">Click segments or names below to drills down active patient files.</p>
          </div>

          <div className="my-6 flex flex-col sm:flex-row items-center justify-around gap-6">
            
            {/* Donut Circle SVG */}
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background base circle */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" className="dark:stroke-slate-900" strokeWidth="12" />
                
                {/* Dynamically drawing segments */}
                {(() => {
                  let cumPercent = 0;
                  return deptPatientCounts.map((dept, idx) => {
                    const ratio = dept.count / totalPatientsSum;
                    const dashArray = `${ratio * 100 * 2.51} 251.2`;
                    const dashOffset = -cumPercent * 100 * 2.51;
                    cumPercent += ratio;
                    
                    const isSelected = selectedDept === dept.name;

                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={dept.color}
                        strokeWidth={isSelected ? '15' : '12'}
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        className={`transition-all duration-300 cursor-pointer hover:stroke-[15px] ${
                          dept.name === 'Emergency' ? 'animate-emergency-pulse' : ''
                        }`}
                        onClick={() => setSelectedDept(isSelected ? 'All' : dept.name)}
                        strokeLinecap="round"
                        title={`${dept.name}: ${dept.count}`}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  {selectedDept === 'All' ? totalPatientsSum : deptPatientCounts.find(d=>d.name === selectedDept)?.count}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold text-center tracking-tight leading-none px-2.5">
                  {selectedDept === 'All' ? 'Staff Load' : `${selectedDept}`}
                </span>
              </div>
            </div>

            {/* Explanatory legend table */}
            <div className="space-y-2 flex-1 w-full max-w-xs text-xs">
              {deptPatientCounts.map((dept) => {
                const isSelected = selectedDept === dept.name;
                const ratio = Math.round((dept.count / totalPatientsSum) * 100);
                return (
                  <div 
                    key={dept.name}
                    onClick={() => setSelectedDept(isSelected ? 'All' : dept.name)}
                    className={`p-1.5 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-between ${
                      isSelected 
                        ? 'border-blue-400 bg-blue-50/10 dark:bg-blue-950/20' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                      <span className={`font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {dept.name}
                      </span>
                    </div>
                    
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {dept.count} pats • {ratio}%
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {selectedDept !== 'All' && (
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedDept('All')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Clear Filter (Show All) &times;
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Case drilling list (Filtered Patients matching selected donut slice) */}
        <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-900 pb-2">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Drilled Records: {selectedDept} ({drillingPatients.length})
              </h4>
              <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded">
                Active Ward Telemetry
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {drillingPatients.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-8 leading-none">No active patients registered in this discipline segment.</p>
              ) : (
                drillingPatients.map((p) => {
                  const isAdmitted = p.status === 'Admitted';
                  return (
                    <div key={p.id} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-900/60 bg-slate-50/20 dark:bg-slate-950/20 text-xs flex justify-between items-center transition-all hover:border-slate-300 dark:hover:border-slate-700">
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Inpatient: <span className="font-mono">{p.id}</span> • Status: <span className="font-semibold">{p.status}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 italic">{p.condition}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">Room Location</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{p.room === 'N/A' ? 'Outpatient Desk' : p.room}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900">
            <span className="text-[10px] text-slate-450 italic block leading-relaxed text-center">
              * Bed metrics are refreshed at 15-minute interposing windows. Staff loads are self-calculated on clinician login.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
