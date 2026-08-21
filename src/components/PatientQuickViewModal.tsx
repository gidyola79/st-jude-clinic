import React from 'react';
import { 
  User, 
  FileText, 
  Activity, 
  ShieldAlert, 
  Pill, 
  Stethoscope, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  X, 
  Heart, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { Patient } from '../types';

interface PatientQuickViewModalProps {
  patient: Patient | null;
  onClose: () => void;
  onOpenFullChart: (patientId: string) => void;
  onOpenAiAssistant?: (patient: Patient) => void;
}

export default function PatientQuickViewModal({
  patient,
  onClose,
  onOpenFullChart,
  onOpenAiAssistant
}: PatientQuickViewModalProps) {
  if (!patient) return null;

  const latestNote = patient.history && patient.history.length > 0 ? patient.history[0] : null;
  const latestVitals = patient.vitalsHistory && patient.vitalsHistory.length > 0 ? patient.vitalsHistory[0] : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 overflow-y-auto font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 relative"
      >
        {/* Header with Patient Basics */}
        <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5 min-w-0">
            <img 
              src={patient.photo} 
              alt={patient.name} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm shrink-0" 
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {patient.name}
                </h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${
                  patient.status === 'Admitted'
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300'
                    : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                }`}>
                  {patient.status}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-0.5">
                {patient.gender} • {patient.age} yrs • Blood: <span className="font-bold text-red-600">{patient.bloodType}</span> • ID: #{patient.id}
              </p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                {patient.room || 'Outpatient'} • {patient.insurance}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Close Quick-View"
          >
            <X size={16} />
          </button>
        </div>

        {/* Most Recent Clinical Note Section */}
        <div className="mb-4 p-4 rounded-2xl bg-teal-50/60 dark:bg-slate-950 border border-teal-200/80 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-400">
              <FileText size={14} className="text-teal-600" />
              <span>Most Recent Clinical Note</span>
            </div>
            {latestNote && (
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <Calendar size={11} /> {latestNote.date}
              </span>
            )}
          </div>

          {latestNote ? (
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Primary Diagnosis:</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                  {latestNote.diagnosis}
                </p>
              </div>

              {latestNote.treatment && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Prescribed Treatment:</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {latestNote.treatment}
                  </p>
                </div>
              )}

              {latestNote.notes && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-teal-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{latestNote.notes}"
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-teal-100 dark:border-slate-800/80">
                <span className="flex items-center gap-1">
                  <Stethoscope size={12} className="text-teal-600" />
                  <span>Attending: <strong>{latestNote.doctor}</strong></span>
                </span>
                <span className="font-semibold text-slate-400">{latestNote.department || 'General Medicine'}</span>
              </div>

              {/* Active Prescriptions from latest consult */}
              {latestNote.prescriptions && latestNote.prescriptions.length > 0 && (
                <div className="pt-1.5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Pill size={11} className="text-emerald-600" /> Active Medications:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {latestNote.prescriptions.map((rx, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 rounded-md">
                        {rx.medication} {rx.dosage} ({rx.frequency})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-400">
              No recent clinical notes on file. Current presenting condition: <strong>{patient.condition}</strong>
            </div>
          )}
        </div>

        {/* Latest Vitals Telemetry Snippet */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Activity size={13} className="text-blue-500" /> Latest Vital Signs
            </span>
            {latestVitals && (
              <span className="text-[10px] text-slate-400 font-mono">{latestVitals.time || latestVitals.date}</span>
            )}
          </div>

          {latestVitals ? (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">BP</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{latestVitals.bloodPressure}</span>
              </div>
              <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Heart Rate</span>
                <span className="font-bold text-red-600 text-xs">{latestVitals.heartRate} bpm</span>
              </div>
              <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">SpO2</span>
                <span className="font-bold text-blue-600 text-xs">{latestVitals.spO2}%</span>
              </div>
              <div className="p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Temp</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{latestVitals.temperature}°F</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 text-center py-1">No vitals readings logged yet.</p>
          )}
        </div>

        {/* Allergies & Alerts */}
        <div className="mb-4 flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
          <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <ShieldAlert size={13} className="text-red-500" /> Allergies:
          </span>
          {patient.allergies && patient.allergies.length > 0 ? (
            <div className="flex gap-1 flex-wrap justify-end">
              {patient.allergies.map((a, i) => (
                <span key={i} className="px-2 py-0.5 text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded">
                  {a}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-400 text-[11px]">No known drug allergies (NKDA)</span>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {onOpenAiAssistant && (
            <button
              onClick={() => {
                onClose();
                onOpenAiAssistant(patient);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Sparkles size={13} className="text-indigo-600" />
              <span>AI Co-Pilot</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenFullChart(patient.id);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              <span>Open Full Chart</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
