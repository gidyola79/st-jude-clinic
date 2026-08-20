import React, { useState, useEffect } from 'react';
import { 
  Grid2X2, 
  List, 
  Search, 
  Star, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  History, 
  ShieldAlert, 
  X, 
  Plus, 
  Lock, 
  LockOpen 
} from 'lucide-react';
import { Doctor, UserRole } from '../types';
import { updateDoctorRecord } from '../lib/dbService';

interface DoctorsViewProps {
  doctors: Doctor[];
  setDoctors: (docs: Doctor[]) => void;
  activeRole: UserRole;
  searchTerm: string;
}

const SPECIALTIES = [
  'All',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Oncology',
  'Emergency',
  'Internal Medicine'
];

export default function DoctorsView({
  doctors,
  setDoctors,
  activeRole,
  searchTerm: globalSearchTerm,
}: DoctorsViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Keyboard Escape listener to dismiss doctor details modal
  useEffect(() => {
    if (!selectedDocId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDocId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDocId]);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [editedStatus, setEditedStatus] = useState<'On Duty' | 'Off Duty' | 'In Surgery'>('On Duty');
  
  // Custom slots edit state
  const [newSlotTime, setNewSlotTime] = useState('02:30 PM');

  // Filter Doctors
  const filteredDoctors = doctors.filter((doc) => {
    const query = (globalSearchTerm || localSearch).toLowerCase();
    const matchesSearch = doc.name.toLowerCase().includes(query) ||
                          doc.specialty.toLowerCase().includes(query) ||
                          doc.bio.toLowerCase().includes(query);
    
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const activeDoc = doctors.find(d => d.id === selectedDocId);

  const handleOpenDocDetails = (doc: Doctor) => {
    setSelectedDocId(doc.id);
    setEditedBio(doc.bio);
    setEditedStatus(doc.status);
    setIsEditing(false);
  };

  const handleSaveDocDetails = () => {
    if (!selectedDocId) return;
    setDoctors(
      doctors.map(d => d.id === selectedDocId ? {
        ...d,
        bio: editedBio,
        status: editedStatus
      } : d)
    );
    updateDoctorRecord(selectedDocId, {
      bio: editedBio,
      status: editedStatus
    }).catch(err => console.warn('Doctor update sync error:', err));
    setIsEditing(false);
  };

  // Switch Slot isBooked Status (Admin)
  const toggleSlotLock = (time: string) => {
    if (activeRole !== 'Admin') return;
    if (!selectedDocId) return;
    const targetDoc = doctors.find(d => d.id === selectedDocId);
    if (!targetDoc) return;

    const updatedSchedule = targetDoc.schedule.map(sch => {
      if (sch.date === '2026-05-21') {
        return {
          ...sch,
          slots: sch.slots.map(slot => 
            slot.time === time 
              ? { ...slot, isBooked: !slot.isBooked, bookedBy: !slot.isBooked ? 'Reserved/Admin Slot' : undefined }
              : slot
          )
        };
      }
      return sch;
    });

    setDoctors(
      doctors.map(doc => doc.id === selectedDocId ? { ...doc, schedule: updatedSchedule } : doc)
    );

    updateDoctorRecord(selectedDocId, { schedule: updatedSchedule })
      .catch(err => console.warn('Doctor schedule update error:', err));
  };

  // Add Slots
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole !== 'Admin') return;
    if (!selectedDocId || !newSlotTime.trim()) return;
    const targetDoc = doctors.find(d => d.id === selectedDocId);
    if (!targetDoc) return;

    const updatedSchedule = targetDoc.schedule.map(sch => {
      if (sch.date === '2026-05-21') {
        if (sch.slots.some(s => s.time === newSlotTime)) return sch;
        return {
          ...sch,
          slots: [...sch.slots, { time: newSlotTime, isBooked: false }].sort((a,b) => a.time.localeCompare(b.time))
        };
      }
      return sch;
    });

    setDoctors(
      doctors.map(doc => doc.id === selectedDocId ? { ...doc, schedule: updatedSchedule } : doc)
    );

    updateDoctorRecord(selectedDocId, { schedule: updatedSchedule })
      .catch(err => console.warn('Doctor add slot sync error:', err));

    setNewSlotTime('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top action utilities bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search input local */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search physicians, bio context..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-450 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/30 focus:border-blue-500 transition-all font-medium"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        {/* Filters and Toggle layout button */}
        <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {SPECIALTIES.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1 text-[11px] font-bold tracking-tight rounded-md whitespace-nowrap transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Grid/List selector */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-850 p-0.5 bg-slate-50 dark:bg-slate-900 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-800 text-blue-605 dark:text-blue-400 shadow-xs' 
                  : 'text-slate-400'
              }`}
            >
              <Grid2X2 size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-850 text-blue-605 dark:text-blue-400 shadow-xs' 
                  : 'text-slate-400'
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid view of Doctors list */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => {
            const isDuty = doc.status === 'On Duty';
            const isSurgery = doc.status === 'In Surgery';
            return (
              <div 
                key={doc.id}
                className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 h-72 flex flex-col justify-between p-4 shadow-xs relative overflow-hidden group hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                id={`doctor-card-${doc.id}`}
              >
                {/* Visual Accent glow */}
                <span className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isSurgery ? 'bg-amber-500' : isDuty ? 'bg-blue-600' : 'bg-slate-400'
                }`} />

                <div className="flex gap-3 items-start min-w-0">
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    className="w-14 h-14 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-800 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black tracking-widest text-[#0ea5e9] uppercase truncate block">
                      {doc.specialty}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">{doc.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-500 dark:text-slate-400 text-xs truncate">
                      <div className="flex items-center text-amber-500 shrink-0">
                        <Star size={11} fill="#f59e0b" />
                        <span className="font-bold ml-0.5 font-mono">{doc.rating}</span>
                      </div>
                      <span className="text-slate-300 dark:text-slate-850 shrink-0">|</span>
                      <span className="truncate">{doc.experience} yrs exp</span>
                    </div>
                  </div>
                </div>

                {/* Duty Tag */}
                <div className="my-2 p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-900/60 text-[11px] text-slate-550 dark:text-slate-400 line-clamp-2">
                  {doc.bio}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-900/50">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      isSurgery ? 'bg-amber-500 animate-pulse' : isDuty ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} />
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-300">
                      {doc.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenDocDetails(doc)}
                    className="px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-105 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition-all cursor-pointer"
                  >
                    Medical Bio & Slots &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View of Doctors list */
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10.5px] font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800 font-sans">
                <th className="p-3.5 pl-6">Physician Details</th>
                <th className="p-3.5">Clinical Specialization</th>
                <th className="p-3.5">Clinician Census</th>
                <th className="p-3.5">Availability Status</th>
                <th className="p-3.5 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
              {filteredDoctors.map((doc) => {
                const isDuty = doc.status === 'On Duty';
                const isSurgery = doc.status === 'In Surgery';
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <img 
                        src={doc.image} 
                        alt={doc.name} 
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{doc.name}</p>
                        <p className="text-[10px] text-slate-400">{doc.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/45 dark:text-blue-400 font-bold uppercase tracking-wide text-[9px] rounded">
                        {doc.specialty}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-300">
                        {doc.patientsCount} patients
                      </span>
                      <p className="text-[10px] text-slate-400">{doc.experience} yrs tenure</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isSurgery ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                        isDuty ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isSurgery ? 'bg-amber-500 animate-pulse' : isDuty ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleOpenDocDetails(doc)}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Doctor Profile overlay details Drawer/Modal */}
      {activeDoc && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md py-6 px-4 z-50 flex justify-center items-center overflow-y-auto select-none animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDocId(null);
          }}
        >
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Head Banner */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-start border-b border-slate-800">
              <div className="flex gap-4 items-center">
                <img 
                  src={activeDoc.image} 
                  alt={activeDoc.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-550"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-black uppercase tracking-wider shadow-sm">
                    {activeDoc.specialty} Specialist
                  </span>
                  <h3 className="text-lg font-bold mt-1 text-white">{activeDoc.name}</h3>
                  <p className="text-xs text-slate-400">{activeDoc.email} • {activeDoc.phone}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDocId(null)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md shrink-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-1 dark:text-slate-100">
              
              {/* Left detail card: BIO and custom edit fields */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Physician Bio</h5>
                  {isEditing ? (
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={4}
                      className="w-full text-xs p-2 rounded border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-xs text-slate-650 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-900 leading-relaxed font-sans">
                      {activeDoc.bio}
                    </p>
                  )}
                </div>

                {/* KPI numbers */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-center border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Rating</span>
                    <span className="text-sm font-mono font-black text-amber-500">{activeDoc.rating} / 5</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-center border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Experience</span>
                    <span className="text-sm font-mono font-black text-blue-600">{activeDoc.experience} yrs</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-center border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Consults</span>
                    <span className="text-sm font-mono font-black text-emerald-500">{activeDoc.patientsCount}+</span>
                  </div>
                </div>

                {/* Duty edit controls for Admin role */}
                {activeRole === 'Admin' ? (
                  <div className="p-4 rounded-xl border border-red-100 dark:border-red-950/40 bg-red-50/10 dark:bg-red-950/10 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-650 dark:text-red-400 uppercase tracking-wide">
                      <ShieldAlert size={14} />
                      <span>Administrative Guardrails</span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">Shift Status</label>
                          <select
                            value={editedStatus}
                            onChange={(e: any) => setEditedStatus(e.target.value)}
                            className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                          >
                            <option value="On Duty">On Duty</option>
                            <option value="Off Duty">Off Duty</option>
                            <option value="In Surgery">In Surgery</option>
                          </select>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-650"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveDocDetails}
                            className="px-3 py-1 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs"
                          >
                            Save Bio Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Modify clinical bio and status privileges.</span>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-3 py-1.5 text-xs font-bold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                        >
                          EDIT CLINICIAN
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/55 text-center text-xs text-slate-500 rounded-lg">
                    Contact reception staff for administrative profile modifications.
                  </div>
                )}
              </div>

              {/* Right detail card: Availability slot grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Today Schedule slots (May 21)
                  </h5>
                  <span className="text-[10.5px] text-slate-450 flex items-center gap-1">
                    <Clock size={12} /> Live Slots Tracking
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {activeDoc.schedule[0]?.slots.map((slot, index) => (
                    <div 
                      key={index}
                      onClick={() => toggleSlotLock(slot.time)}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                        slot.isBooked
                          ? 'bg-red-50/20 dark:bg-red-950/10 border-red-100/40 dark:border-red-900/40 text-red-700 dark:text-red-400'
                          : 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-150 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400'
                      } ${activeRole === 'Admin' ? 'cursor-pointer hover:scale-103 shadow-xs' : ''}`}
                      title={activeRole === 'Admin' ? "Click to lock / unlock this slot" : ""}
                    >
                      <div>
                        <span className="font-mono font-bold block text-xs">{slot.time}</span>
                        {slot.isBooked && (
                          <span className="text-[9px] text-slate-500 font-medium block truncate max-w-[130px]">
                            {slot.bookedBy ?? 'Reserved'}
                          </span>
                        )}
                      </div>

                      {slot.isBooked ? (
                        <Lock size={12} className="text-red-400 shrink-0" />
                      ) : (
                        <LockOpen size={12} className="text-emerald-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Add new slots drawer (Admin) */}
                {activeRole === 'Admin' && (
                  <form onSubmit={handleAddSlot} className="p-3 border border-slate-150 dark:border-slate-900 bg-slate-50/40 dark:bg-slate-950 rounded-lg space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 block">Add Custom Calendar Slot (Admin)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 11:30 AM, 04:30 PM"
                        value={newSlotTime}
                        onChange={(e) => setNewSlotTime(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold cursor-pointer shrink-0"
                      >
                        + ADD
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedDocId(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
