import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Plus, 
  AlertTriangle, 
  Siren, 
  ShieldAlert, 
  HeartPulse, 
  UserPlus, 
  Radio, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Flame 
} from 'lucide-react';
import { EmergencyCase, Patient, UserRole } from '../types';

interface EmergencyTriageViewProps {
  emergencyCases: EmergencyCase[];
  setEmergencyCases: (cases: EmergencyCase[]) => void;
  patients: Patient[];
  activeRole: UserRole;
  searchTerm: string;
  addNotification: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule') => void;
  onOpenAiAssistant?: (patient?: any) => void;
}

export default function EmergencyTriageView({
  emergencyCases,
  setEmergencyCases,
  patients,
  activeRole,
  searchTerm: globalSearchTerm,
  addNotification,
  onOpenAiAssistant,
}: EmergencyTriageViewProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedTriageFilter, setSelectedTriageFilter] = useState<string>('All');
  const [isRapidIntakeOpen, setIsRapidIntakeOpen] = useState(false);

  // Active Code Alert Simulator
  const [activeCodeAlert, setActiveCodeAlert] = useState<string | null>(null);

  // Keyboard Escape listener to dismiss rapid intake modal
  useEffect(() => {
    if (!isRapidIntakeOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsRapidIntakeOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRapidIntakeOpen]);

  // Form State for Rapid Trauma Intake
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [triageLevel, setTriageLevel] = useState<EmergencyCase['triageLevel']>('Level 2 - Emergent (Orange)');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState(85);
  const [spo2, setSpo2] = useState(98);
  const [gcs, setGcs] = useState(15);
  const [temp, setTemp] = useState(98.6);
  const [assignedBay, setAssignedBay] = useState('Trauma Bay 1');
  const [attendingDoctor, setAttendingDoctor] = useState('Dr. Marcus Vance');

  const filteredCases = emergencyCases.filter(c => {
    const query = (globalSearchTerm || localSearch).toLowerCase();
    const matchesQuery = c.patientName.toLowerCase().includes(query) ||
                         c.traumaId.toLowerCase().includes(query) ||
                         c.chiefComplaint.toLowerCase().includes(query);
    const matchesTriage = selectedTriageFilter === 'All' || c.triageLevel.includes(selectedTriageFilter);
    return matchesQuery && matchesTriage;
  });

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !chiefComplaint.trim()) return;

    const newCase: EmergencyCase = {
      id: `ER-${Date.now().toString().slice(-4)}`,
      traumaId: `TR-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientName: patientName.trim(),
      age: Number(age),
      gender,
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triageLevel,
      chiefComplaint: chiefComplaint.trim(),
      vitals: {
        bp,
        pulse: Number(pulse),
        spo2: Number(spo2),
        gcs: Number(gcs),
        temp: Number(temp)
      },
      assignedBay,
      attendingDoctor,
      status: 'In Trauma Bay',
      alertActive: triageLevel.includes('Level 1') || triageLevel.includes('Level 2')
    };

    setEmergencyCases([newCase, ...emergencyCases]);
    setIsRapidIntakeOpen(false);

    if (triageLevel.includes('Level 1')) {
      setActiveCodeAlert(`CODE BLUE: Level 1 Resuscitation intake for ${newCase.patientName} at ${assignedBay}`);
      addNotification('CODE RED TRAUMA ADMISSION', `Trauma Bay paged for Level 1 arrival: ${newCase.patientName}.`, 'Alert');
    } else {
      addNotification('Emergency Intake Logged', `${newCase.patientName} triaged to ${assignedBay}.`, 'Info');
    }

    // Reset Form
    setPatientName('');
    setChiefComplaint('');
  };

  const handleUpdateStatus = (caseId: string, nextStatus: EmergencyCase['status']) => {
    setEmergencyCases(
      emergencyCases.map(c => c.id === caseId ? { ...c, status: nextStatus, alertActive: false } : c)
    );
    addNotification('Trauma Case Updated', `Case ${caseId} transitioned to ${nextStatus}.`, 'Success');
  };

  const triggerBroadcastCode = (codeName: string) => {
    setActiveCodeAlert(`BROADCAST: ${codeName} - All emergency teams report to stations!`);
    addNotification('Emergency Hospital Code Broadcast', `${codeName} broadcasted across clinical annunciators.`, 'Alert');
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Active Code Alert Banner */}
      {activeCodeAlert && (
        <div className="p-4 bg-red-600 text-white rounded-2xl shadow-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Siren className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider">HOSPITAL CODE ALERT ACTIVE</h4>
              <p className="text-xs font-semibold">{activeCodeAlert}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveCodeAlert(null)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
          >
            Acknowledge & Dismiss
          </button>
        </div>
      )}

      {/* Top ER Command Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">Resuscitation (L1/L2)</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {emergencyCases.filter(c => c.triageLevel.includes('Level 1') || c.triageLevel.includes('Level 2')).length} Critical
            </h4>
            <p className="text-xs text-slate-400 mt-1">Immediate life threat</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Urgent (L3) Cases</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {emergencyCases.filter(c => c.triageLevel.includes('Level 3')).length} Active
            </h4>
            <p className="text-xs text-slate-400 mt-1">Rapid diagnostic triage</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Fast Track (L4/L5)</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {emergencyCases.filter(c => c.triageLevel.includes('Level 4') || c.triageLevel.includes('Level 5')).length} Patients
            </h4>
            <p className="text-xs text-slate-400 mt-1">Minor injury & outpatient</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Trauma Bays</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4 of 6 Active</h4>
            <p className="text-xs text-slate-400 mt-1">Dr. Marcus Vance on call</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Emergency Actions & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Red', 'Orange', 'Yellow', 'Green'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedTriageFilter(lvl)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                selectedTriageFilter === lvl
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {lvl === 'All' ? 'All Triage Levels' : `Priority ${lvl}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => triggerBroadcastCode('CODE BLUE (Cardiac Arrest)')}
            className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow transition-colors flex items-center gap-1"
          >
            <Siren className="w-3.5 h-3.5" />
            <span>Code Blue Alert</span>
          </button>

          <button
            id="rapid-trauma-intake-btn"
            onClick={() => setIsRapidIntakeOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Rapid Trauma Intake</span>
          </button>
        </div>
      </div>

      {/* Emergency Cases Queue Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCases.map(er => {
          const isRed = er.triageLevel.includes('Red');
          const isOrange = er.triageLevel.includes('Orange');
          const isYellow = er.triageLevel.includes('Yellow');

          return (
            <div
              key={er.id}
              id={`er-case-${er.id}`}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm space-y-4 transition-all ${
                isRed
                  ? 'border-red-400/80 dark:border-red-600/80 ring-1 ring-red-400/30 bg-red-50/20'
                  : isOrange
                  ? 'border-amber-400/80 dark:border-amber-600/80 bg-amber-50/10'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    isRed ? 'bg-red-600 text-white animate-pulse' : isOrange ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{er.patientName}</h4>
                      <span className="text-xs font-mono text-slate-400">({er.traumaId})</span>
                      <span className="text-xs text-slate-500">{er.gender}, {er.age} yrs</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Arrived at <span className="font-semibold text-slate-700 dark:text-slate-300">{er.arrivalTime}</span> • Assigned to <span className="font-bold text-blue-600">{er.assignedBay}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    isRed
                      ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300'
                      : isOrange
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                      : 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 border-yellow-300'
                  }`}>
                    {er.triageLevel}
                  </span>
                  <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold text-slate-700 dark:text-slate-300">
                    {er.status}
                  </span>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-900 dark:text-white">Chief Complaint / Trauma Mechanism: </span>
                {er.chiefComplaint}
              </div>

              {/* Live Vitals Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Blood Pressure</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{er.vitals.bp}</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Heart Rate</span>
                  <span className={`font-bold text-sm ${er.vitals.pulse > 110 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                    {er.vitals.pulse} bpm
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">SpO2 Oxygen</span>
                  <span className={`font-bold text-sm ${er.vitals.spo2 < 92 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                    {er.vitals.spo2}%
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Glasgow Coma</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">GCS {er.vitals.gcs}/15</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Temperature</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{er.vitals.temp}°F</span>
                </div>
              </div>

              {/* Trauma Pipeline Status Transition */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="text-slate-500">
                  Attending Emergency Physician: <span className="font-bold text-slate-700 dark:text-slate-300">{er.attendingDoctor}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onOpenAiAssistant && (
                    <button
                      onClick={() => onOpenAiAssistant(er)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Triage Protocol</span>
                    </button>
                  )}

                  {er.status === 'In Trauma Bay' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(er.id, 'Transferred to OR')}
                        className="px-3 py-1.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow transition-colors"
                      >
                        Transfer to OR
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(er.id, 'Transferred to ICU')}
                        className="px-3 py-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors"
                      >
                        Admit to ICU
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(er.id, 'Discharged')}
                        className="px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Discharge Home
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Rapid Trauma Intake */}
      {isRapidIntakeOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRapidIntakeOpen(false);
          }}
        >
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Siren className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Emergency Trauma Rapid Intake</h3>
              </div>
              <button onClick={() => setIsRapidIntakeOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient Name / Unknown Alias *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe Trauma #1"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Triage Severity Index *</label>
                  <select
                    value={triageLevel}
                    onChange={(e) => setTriageLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Level 1 - Resuscitation (Red)">Level 1 - Resuscitation (Red - Immediate)</option>
                    <option value="Level 2 - Emergent (Orange)">Level 2 - Emergent (Orange - &lt;15 mins)</option>
                    <option value="Level 3 - Urgent (Yellow)">Level 3 - Urgent (Yellow - &lt;60 mins)</option>
                    <option value="Level 4 - Less Urgent (Green)">Level 4 - Less Urgent (Green)</option>
                    <option value="Level 5 - Non-Urgent (Blue)">Level 5 - Non-Urgent (Blue)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Trauma Bay</label>
                  <select
                    value={assignedBay}
                    onChange={(e) => setAssignedBay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Trauma Bay 1 (Resus)">Trauma Bay 1 (Resus)</option>
                    <option value="Trauma Bay 2 (Resus)">Trauma Bay 2 (Resus)</option>
                    <option value="Acute Bay 3">Acute Bay 3</option>
                    <option value="Acute Bay 4">Acute Bay 4</option>
                    <option value="Fast Track 1">Fast Track 1</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chief Complaint & Mechanism *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Document presenting trauma, symptoms, onset time, mechanism of injury..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Point-of-Care Vitals:</span>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">BP</label>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Heart Rate</label>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">SpO2 %</label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">GCS (3-15)</label>
                    <input
                      type="number"
                      min={3}
                      max={15}
                      value={gcs}
                      onChange={(e) => setGcs(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Temp (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRapidIntakeOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow"
                >
                  Admit to Trauma Bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
