import React, { useState, useEffect } from 'react';
import { 
  Bed, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Filter, 
  UserPlus, 
  LogOut, 
  RefreshCw, 
  ShieldAlert, 
  X, 
  Sparkles, 
  HeartHandshake, 
  Layers 
} from 'lucide-react';
import { WardBed, BedAlloc, Patient, UserRole } from '../types';

interface BedsViewProps {
  beds: BedAlloc[];
  setBeds: (b: BedAlloc[]) => void;
  wardBeds: WardBed[];
  setWardBeds: (wb: WardBed[]) => void;
  patients: Patient[];
  setPatients: (p: Patient[]) => void;
  activeRole: UserRole;
  searchTerm: string;
  addNotification: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule') => void;
}

export default function BedsView({
  beds,
  setBeds,
  wardBeds,
  setWardBeds,
  patients,
  setPatients,
  activeRole,
  searchTerm: globalSearchTerm,
  addNotification,
}: BedsViewProps) {
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [localSearch, setLocalSearch] = useState('');

  // Admit Modal
  const [admitBed, setAdmitBed] = useState<WardBed | null>(null);
  const [admitPatientId, setAdmitPatientId] = useState<string>(patients[0]?.id || '');
  const [attendingDoctor, setAttendingDoctor] = useState<string>('Dr. Robert Chen');
  const [nurseAssigned, setNurseAssigned] = useState<string>('Nurse Clara Oswald');

  // Keyboard Escape listener to dismiss admit modal
  useEffect(() => {
    if (!admitBed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAdmitBed(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [admitBed]);

  // Filter Ward Beds
  const filteredBeds = wardBeds.filter(bed => {
    const query = (globalSearchTerm || localSearch).toLowerCase();
    const matchesQuery = bed.bedNumber.toLowerCase().includes(query) ||
                         (bed.patientName || '').toLowerCase().includes(query) ||
                         bed.ward.toLowerCase().includes(query);
    const matchesWard = selectedWard === 'All' || bed.ward === selectedWard;
    const matchesStatus = selectedStatus === 'All' || bed.status === selectedStatus;
    return matchesQuery && matchesWard && matchesStatus;
  });

  // Calculate Capacity
  const totalBedsCount = wardBeds.length;
  const occupiedCount = wardBeds.filter(b => b.status === 'Occupied').length;
  const availableCount = wardBeds.filter(b => b.status === 'Available').length;
  const sanitizingCount = wardBeds.filter(b => b.status === 'Sanitizing').length;
  const occupancyPercentage = Math.round((occupiedCount / totalBedsCount) * 100);

  const handleAdmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitBed) return;

    const patientObj = patients.find(p => p.id === admitPatientId);
    if (!patientObj) return;

    // Update Bed
    const updatedWardBeds = wardBeds.map(b => b.id === admitBed.id ? {
      ...b,
      status: 'Occupied' as const,
      patientId: patientObj.id,
      patientName: patientObj.name,
      admittedDate: new Date().toISOString().substring(0, 10),
      attendingDoctor,
      nurseAssigned,
      condition: patientObj.condition
    } : b);

    // Update Patient Status
    const updatedPatients = patients.map(p => p.id === patientObj.id ? {
      ...p,
      status: 'Admitted' as const,
      room: `${admitBed.ward} - ${admitBed.bedNumber}`,
      bedId: admitBed.id
    } : p);

    setWardBeds(updatedWardBeds);
    setPatients(updatedPatients);

    addNotification('Patient Admitted to Bed', `${patientObj.name} assigned to ${admitBed.bedNumber} (${admitBed.ward}).`, 'Success');
    setAdmitBed(null);
  };

  const handleDischargeBed = (bed: WardBed) => {
    if (!bed.patientId) return;

    const patientName = bed.patientName;
    const updatedWardBeds = wardBeds.map(b => b.id === bed.id ? {
      ...b,
      status: 'Sanitizing' as const,
      patientId: undefined,
      patientName: undefined,
      admittedDate: undefined,
      condition: undefined
    } : b);

    const updatedPatients = patients.map(p => p.id === bed.patientId ? {
      ...p,
      status: 'Discharged' as const,
      bedId: undefined
    } : p);

    setWardBeds(updatedWardBeds);
    setPatients(updatedPatients);

    addNotification('Patient Discharged from Ward', `${patientName} discharged from ${bed.bedNumber}. Bed flagged for sanitization.`, 'Info');
  };

  const handleMarkAvailable = (bedId: string) => {
    setWardBeds(
      wardBeds.map(b => b.id === bedId ? { ...b, status: 'Available' as const } : b)
    );
    addNotification('Bed Cleared', 'Bed sanitized and made available for new inpatient admissions.', 'Success');
  };

  const wards = ['All', 'ICU', 'Emergency', 'General Ward (3F)', 'General Ward (4F)', 'Pediatrics', 'Neonatal Care', 'Maternity'];

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Top Ward Capacity Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Occupancy</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{occupancyPercentage}%</h4>
            <div className="w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${occupancyPercentage > 85 ? 'bg-rose-500' : 'bg-blue-600'}`}
                style={{ width: `${occupancyPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600">
            <Bed className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Occupied Inpatients</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{occupiedCount} beds</h4>
            <p className="text-xs text-slate-400 mt-1">Active monitored patients</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600">
            <HeartHandshake className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Immediate Ready</span>
            <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{availableCount} beds</h4>
            <p className="text-xs text-emerald-500 mt-1">Clean & fully prepped</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Turnover Sanitizing</span>
            <h4 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{sanitizingCount} beds</h4>
            <p className="text-xs text-amber-500 mt-1">Sterilization in progress</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Ward Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {wards.map(w => (
            <button
              key={w}
              onClick={() => setSelectedWard(w)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                selectedWard === w
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search bed, patient, room..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Occupied">Occupied</option>
            <option value="Available">Available</option>
            <option value="Sanitizing">Sanitizing</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Ward Bed Matrix Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map(bed => {
          const isOccupied = bed.status === 'Occupied';
          const isAvailable = bed.status === 'Available';
          const isSanitizing = bed.status === 'Sanitizing';

          return (
            <div
              key={bed.id}
              id={`ward-bed-${bed.id}`}
              className={`p-5 rounded-2xl border shadow-sm transition-all relative flex flex-col justify-between ${
                isOccupied
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : isAvailable
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : isSanitizing
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                  : 'bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {/* Bed Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                      {bed.bedNumber}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {bed.ward}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                    isOccupied
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300'
                      : isAvailable
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                      : isSanitizing
                      ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-300'
                  }`}>
                    {bed.status}
                  </span>
                </div>

                {/* Inpatient Information or Status Info */}
                {isOccupied ? (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {bed.patientName}
                    </div>
                    {bed.condition && (
                      <p className="text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-500">Diagnosis: </span>{bed.condition}
                      </p>
                    )}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <div>Doctor: <span className="font-semibold text-slate-700 dark:text-slate-300">{bed.attendingDoctor}</span></div>
                      <div>Nurse: <span className="font-semibold text-slate-700 dark:text-slate-300">{bed.nurseAssigned}</span></div>
                      <div>Admitted: {bed.admittedDate}</div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
                    <Bed className="w-8 h-8 mx-auto stroke-[1.5] opacity-60 mb-2" />
                    <p className="font-medium">
                      {isAvailable ? 'Bed is sterilized and ready for intake' : 'Bed undergoing housekeeping sanitization'}
                    </p>
                    <p className="text-[11px]">Daily Rate: ${bed.dailyRate}/day</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-400">${bed.dailyRate}<span className="text-[10px] font-normal">/day</span></span>

                {isAvailable && (
                  <button
                    onClick={() => setAdmitBed(bed)}
                    className="px-3 py-1 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Admit Patient</span>
                  </button>
                )}

                {isOccupied && (
                  <button
                    onClick={() => handleDischargeBed(bed)}
                    className="px-3 py-1 font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Discharge</span>
                  </button>
                )}

                {isSanitizing && (
                  <button
                    onClick={() => handleMarkAvailable(bed.id)}
                    className="px-3 py-1 font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Ready</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Admit Patient to Bed */}
      {admitBed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAdmitBed(null);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Inpatient Ward Admission</h3>
                <p className="text-slate-500">Allocating Bed {admitBed.bedNumber} ({admitBed.ward})</p>
              </div>
              <button onClick={() => setAdmitBed(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdmitSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
                <select
                  value={admitPatientId}
                  onChange={(e) => setAdmitPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.gender}, {p.age}y) — {p.condition} [{p.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Attending Physician</label>
                <input
                  type="text"
                  value={attendingDoctor}
                  onChange={(e) => setAttendingDoctor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Ward Nurse</label>
                <input
                  type="text"
                  value={nurseAssigned}
                  onChange={(e) => setNurseAssigned(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdmitBed(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  Confirm Inpatient Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
