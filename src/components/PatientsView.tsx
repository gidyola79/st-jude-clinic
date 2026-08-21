import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Layers, 
  FileText, 
  Plus, 
  ArrowLeft, 
  Check, 
  UserPlus, 
  Trash2, 
  ClipboardList, 
  TrendingUp, 
  Activity, 
  Heart, 
  Printer, 
  ShieldAlert, 
  Sparkles, 
  FlaskConical, 
  Calendar, 
  Pill, 
  X, 
  Clock,
  Eye
} from 'lucide-react';
import { Patient, MedicalRecord, Prescription, VitalsRecord, LabTest, UserRole } from '../types';
import { savePatient, updatePatientRecord } from '../lib/dbService';
import PatientQuickViewModal from './PatientQuickViewModal';

interface PatientsViewProps {
  patients: Patient[];
  setPatients: (pats: Patient[]) => void;
  activeRole: UserRole;
  activeDoctorId?: string;
  activeDoctorName?: string;
  addNotification: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule') => void;
  searchTerm: string;
  onOpenAiAssistant?: (patient?: Patient) => void;
}

export default function PatientsView({
  patients,
  setPatients,
  activeRole,
  activeDoctorId,
  activeDoctorName,
  addNotification,
  searchTerm: globalSearchTerm,
  onOpenAiAssistant,
}: PatientsViewProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [quickViewPatient, setQuickViewPatient] = useState<Patient | null>(null);
  const [hoveredPatientId, setHoveredPatientId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState('');
  const [patientFilterMode, setPatientFilterMode] = useState<'All' | 'Admitted' | 'Outpatient'>('All');
  const [activePatientSubTab, setActivePatientSubTab] = useState<'overview' | 'vitals' | 'labs' | 'history'>('overview');

  // Quick Add Patient Form state (Admission)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(32);
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newBlood, setNewBlood] = useState('O+');
  const [newInsurance, setNewInsurance] = useState('BlueCross');
  const [newPhone, setNewPhone] = useState('+1 (555) 000-1122');
  const [newEmail, setNewEmail] = useState('patient@email.com');
  const [newCondition, setNewCondition] = useState('Routine Checkup');
  const [newStatus, setNewStatus] = useState<'Admitted' | 'Outpatient' | 'Discharged'>('Outpatient');
  const [newRoom, setNewRoom] = useState('Room 102');
  const [newAllergies, setNewAllergies] = useState('Penicillin');

  // Doctor workspace prescription states
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [duration, setDuration] = useState('14 days');
  const [tempPrescriptions, setTempPrescriptions] = useState<Prescription[]>([]);

  // Doctor diagnostic notes
  const [diagnosticDiagnosis, setDiagnosticDiagnosis] = useState('');
  const [diagnosticTreatment, setDiagnosticTreatment] = useState('');
  const [diagnosticNotes, setDiagnosticNotes] = useState('');

  // Vitals Logger Form Modal
  const [isAddVitalsOpen, setIsAddVitalsOpen] = useState(false);
  const [vBp, setVBp] = useState('120/80');
  const [vHr, setVHr] = useState(72);
  const [vRr, setVRr] = useState(16);
  const [vTemp, setVTemp] = useState(98.6);
  const [vSpo2, setVSpo2] = useState(99);
  const [vGlucose, setVGlucose] = useState(95);
  const [vWeight, setVWeight] = useState(70);
  const [vNotes, setVNotes] = useState('Routine morning vitals check.');

  // Lab Order Form Modal
  const [isAddLabOpen, setIsAddLabOpen] = useState(false);
  const [labTestName, setLabTestName] = useState('Complete Blood Count (CBC)');
  const [labCategory, setLabCategory] = useState<LabTest['category']>('Hematology');
  const [labPriority, setLabPriority] = useState<LabTest['priority']>('Routine');
  const [labCost, setLabCost] = useState(120);

  // Printable Medical Summary
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Keyboard Escape listener to dismiss any open modals in PatientsView
  useEffect(() => {
    const isAnyModalOpen = showAddPatientModal || isAddVitalsOpen || isAddLabOpen || showPrintModal;
    if (!isAnyModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddPatientModal(false);
        setIsAddVitalsOpen(false);
        setIsAddLabOpen(false);
        setShowPrintModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddPatientModal, isAddVitalsOpen, isAddLabOpen, showPrintModal]);

  // Search filter
  const filteredPatients = patients.filter((p) => {
    const val = (localSearch || globalSearchTerm).toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(val) || 
                          p.condition.toLowerCase().includes(val) || 
                          p.bloodType.toLowerCase().includes(val) ||
                          p.insurance.toLowerCase().includes(val);

    const matchesStatus = patientFilterMode === 'All' || p.status === patientFilterMode;
    return matchesSearch && matchesStatus;
  });

  const activePat = patients.find(p => p.id === selectedPatientId);

  // Quick admission submission
  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPat: Patient = {
      id: `P${Date.now().toString().slice(-4)}`,
      name: newName,
      age: Number(newAge),
      gender: newGender,
      bloodType: newBlood,
      insurance: newInsurance,
      phone: newPhone,
      email: newEmail,
      condition: newCondition,
      status: newStatus,
      room: newRoom,
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
      allergies: newAllergies ? newAllergies.split(',').map(a => a.trim()) : [],
      immunizations: ['Standard CDC Schedule'],
      vitalsHistory: [
        {
          id: `VIT-${Date.now()}`,
          date: new Date().toISOString().substring(0, 10),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          bloodPressure: '120/80',
          heartRate: 72,
          respRate: 16,
          temperature: 98.6,
          spO2: 99,
          glucose: 95,
          recordedBy: activeDoctorName || 'Admissions Nurse',
          status: 'Normal'
        }
      ],
      labTests: [],
      history: []
    };

    setPatients([newPat, ...patients]);
    savePatient(newPat).catch(err => console.error('Failed to persist patient:', err));
    setShowAddPatientModal(false);
    setSelectedPatientId(newPat.id);
    addNotification('Patient Admitted', `${newPat.name} was registered into St. Jude clinical database.`, 'Success');

    // Reset
    setNewName('');
    setNewCondition('');
  };

  const handleAddPrescriptionToTemp = () => {
    if (!medication.trim() || !dosage.trim()) return;
    const item: Prescription = {
      medication: medication.trim(),
      dosage: dosage.trim(),
      frequency,
      duration
    };
    setTempPrescriptions([...tempPrescriptions, item]);
    setMedication('');
    setDosage('');
  };

  const handleSaveMedicalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePat || !diagnosticDiagnosis.trim()) return;

    const newRecord: MedicalRecord = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().substring(0, 10),
      diagnosis: diagnosticDiagnosis.trim(),
      treatment: diagnosticTreatment.trim() || 'Therapeutic regime initiated',
      doctor: activeDoctorName || 'Dr. Robert Chen',
      department: 'Clinical Medicine',
      prescriptions: tempPrescriptions,
      notes: diagnosticNotes.trim()
    };

    const updatedHistory = [newRecord, ...activePat.history];
    setPatients(
      patients.map(p => p.id === activePat.id ? {
        ...p,
        condition: diagnosticDiagnosis.trim(),
        history: updatedHistory
      } : p)
    );

    updatePatientRecord(activePat.id, {
      condition: diagnosticDiagnosis.trim(),
      history: updatedHistory
    }).catch(err => console.error('Failed to persist medical record:', err));

    setDiagnosticDiagnosis('');
    setDiagnosticTreatment('');
    setDiagnosticNotes('');
    setTempPrescriptions([]);

    addNotification('Medical Record Logged', `Clinical consult saved to ${activePat.name}'s chart.`, 'Success');
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePat) return;

    const newVit: VitalsRecord = {
      id: `VIT-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bloodPressure: vBp,
      heartRate: Number(vHr),
      respRate: Number(vRr),
      temperature: Number(vTemp),
      spO2: Number(vSpo2),
      glucose: Number(vGlucose),
      weight: Number(vWeight),
      recordedBy: activeDoctorName || 'Ward Nurse',
      notes: vNotes,
      status: Number(vSpo2) < 92 || Number(vHr) > 120 ? 'Critical' : Number(vHr) > 100 ? 'Warning' : 'Normal'
    };

    const updatedVitals = [newVit, ...activePat.vitalsHistory];
    setPatients(
      patients.map(p => p.id === activePat.id ? {
        ...p,
        vitalsHistory: updatedVitals
      } : p)
    );

    updatePatientRecord(activePat.id, {
      vitalsHistory: updatedVitals
    }).catch(err => console.error('Failed to persist vitals:', err));

    setIsAddVitalsOpen(false);
    addNotification('Vitals Telemetry Logged', `Recorded BP ${vBp}, SpO2 ${vSpo2}% for ${activePat.name}.`, 'Success');
  };

  const handleOrderLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePat) return;

    const newLab: LabTest = {
      id: `LAB-${Date.now().toString().slice(-4)}`,
      patientId: activePat.id,
      patientName: activePat.name,
      doctorName: activeDoctorName || 'Dr. Robert Chen',
      testName: labTestName,
      category: labCategory,
      date: new Date().toISOString().substring(0, 10),
      status: 'Ordered',
      priority: labPriority,
      cost: Number(labCost)
    };

    const updatedLabs = [newLab, ...(activePat.labTests || [])];
    setPatients(
      patients.map(p => p.id === activePat.id ? {
        ...p,
        labTests: updatedLabs
      } : p)
    );

    updatePatientRecord(activePat.id, {
      labTests: updatedLabs
    }).catch(err => console.error('Failed to persist lab order:', err));

    setIsAddLabOpen(false);
    addNotification('Diagnostic Lab Ordered', `Requisition created for ${labTestName} (${labPriority}).`, 'Success');
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Patient Detail Screen */}
      {activePat ? (
        <div className="space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setSelectedPatientId(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Patient Directory</span>
            </button>

            <div className="flex items-center gap-2">
              {onOpenAiAssistant && (
                <button
                  onClick={() => onOpenAiAssistant(activePat)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Case Co-Pilot</span>
                </button>
              )}

              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Medical Chart</span>
              </button>
            </div>
          </div>

          {/* Patient Overview Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={activePat.photo}
                alt={activePat.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{activePat.name}</h3>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200">
                    {activePat.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {activePat.gender} • {activePat.age} yrs • Blood Group: <span className="font-bold text-red-600">{activePat.bloodType}</span> • ID: #{activePat.id}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Current Condition: <span className="text-slate-900 dark:text-white font-bold">{activePat.condition}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Location: {activePat.room} • Insurance: {activePat.insurance} (Policy #{activePat.policyNumber || 'N/A'})
                </p>
              </div>
            </div>

            {/* Allergies & Key Badges */}
            <div className="space-y-2 text-right">
              {activePat.allergies && activePat.allergies.length > 0 ? (
                <div className="flex items-center gap-1.5 justify-end flex-wrap">
                  <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Allergies:
                  </span>
                  {activePat.allergies.map(a => (
                    <span key={a} className="px-2 py-0.5 text-[11px] font-semibold bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 rounded-lg">
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400">No known drug allergies</span>
              )}
              <div className="text-xs text-slate-400">
                Primary Doctor: <span className="font-semibold text-slate-700 dark:text-slate-300">{activePat.primaryDoctor || 'Dr. Robert Chen'}</span>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Overview, Vitals, Labs, Clinical History */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActivePatientSubTab('overview')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                activePatientSubTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Clinical Consultation & Notes</span>
            </button>

            <button
              onClick={() => setActivePatientSubTab('vitals')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                activePatientSubTab === 'vitals'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Vitals Telemetry ({activePat.vitalsHistory?.length || 0})</span>
            </button>

            <button
              onClick={() => setActivePatientSubTab('labs')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                activePatientSubTab === 'labs'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Lab & Diagnostic Orders ({activePat.labTests?.length || 0})</span>
            </button>
          </div>

          {/* SubTab 1: Overview & SOAP Record Entry */}
          {activePatientSubTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Doctor Consultation Workstation (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Record New Physician Consultation</span>
                  </h4>

                  <form onSubmit={handleSaveMedicalRecord} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Clinical Diagnosis *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Essential Hypertension with secondary dyslipidemia"
                        value={diagnosticDiagnosis}
                        onChange={(e) => setDiagnosticDiagnosis(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Prescribed Medical Treatment & Regimen</label>
                      <input
                        type="text"
                        placeholder="e.g. Initiate ACE inhibitor therapy & low sodium diet"
                        value={diagnosticTreatment}
                        onChange={(e) => setDiagnosticTreatment(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Assessment Notes</label>
                      <textarea
                        rows={3}
                        placeholder="Document physical findings, patient symptoms, auscultation, and follow-up directives..."
                        value={diagnosticNotes}
                        onChange={(e) => setDiagnosticNotes(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Add Prescription */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Add Prescribed Medication:</span>
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Medication name"
                          value={medication}
                          onChange={(e) => setMedication(e.target.value)}
                          className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 10mg)"
                          value={dosage}
                          onChange={(e) => setDosage(e.target.value)}
                          className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 rounded"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)}
                          className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 rounded"
                        >
                          <option value="Once daily">Once daily (morning)</option>
                          <option value="Twice daily">Twice daily (morning & night)</option>
                          <option value="Every 8 hours">Every 8 hours</option>
                          <option value="PRN as needed">PRN as needed</option>
                        </select>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 rounded"
                        >
                          <option value="7 days">7 days</option>
                          <option value="14 days">14 days</option>
                          <option value="30 days">30 days</option>
                          <option value="90 days">90 days</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddPrescriptionToTemp}
                        className="px-3 py-1 font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded border border-emerald-300"
                      >
                        + Add Drug to Rx
                      </button>

                      {tempPrescriptions.length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-slate-200">
                          {tempPrescriptions.map((rx, idx) => (
                            <div key={idx} className="flex justify-between items-center p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200">
                              <span><strong>{rx.medication}</strong> {rx.dosage} - {rx.frequency} ({rx.duration})</span>
                              <button
                                type="button"
                                onClick={() => setTempPrescriptions(tempPrescriptions.filter((_, i) => i !== idx))}
                                className="text-red-500 font-bold px-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                      >
                        Save Consult to Electronic Chart
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Consultation History Timeline (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Past Medical Encounters</span>
                  </h4>

                  <div className="space-y-4">
                    {activePat.history && activePat.history.length > 0 ? (
                      activePat.history.map(rec => (
                        <div key={rec.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                            <span className="font-bold text-slate-900 dark:text-white">{rec.date}</span>
                            <span className="text-slate-500 font-semibold">{rec.doctor}</span>
                          </div>
                          <p><strong className="text-slate-700 dark:text-slate-300">Diagnosis: </strong>{rec.diagnosis}</p>
                          <p><strong className="text-slate-700 dark:text-slate-300">Treatment: </strong>{rec.treatment}</p>
                          {rec.notes && <p className="text-slate-500 italic">"{rec.notes}"</p>}

                          {rec.prescriptions && rec.prescriptions.length > 0 && (
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                              <span className="font-semibold text-emerald-600 block">Issued Rx:</span>
                              {rec.prescriptions.map((rx, idx) => (
                                <div key={idx} className="text-[11px] text-slate-600 dark:text-slate-400">
                                  • {rx.medication} {rx.dosage} ({rx.frequency})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-6 text-center">No previous encounter records found.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: Vitals Telemetry Timeline */}
          {activePatientSubTab === 'vitals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Biometric Vitals Stream</h4>
                <button
                  onClick={() => setIsAddVitalsOpen(true)}
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Vitals Reading</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-3.5">Timestamp</th>
                        <th className="px-5 py-3.5">BP (mmHg)</th>
                        <th className="px-5 py-3.5">Heart Rate</th>
                        <th className="px-5 py-3.5">SpO2</th>
                        <th className="px-5 py-3.5">Resp Rate</th>
                        <th className="px-5 py-3.5">Temp</th>
                        <th className="px-5 py-3.5">Glucose</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activePat.vitalsHistory?.map(v => (
                        <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="px-5 py-3.5 font-medium">{v.date} {v.time}</td>
                          <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{v.bloodPressure}</td>
                          <td className="px-5 py-3.5">{v.heartRate} bpm</td>
                          <td className="px-5 py-3.5 font-semibold text-blue-600">{v.spO2}%</td>
                          <td className="px-5 py-3.5">{v.respRate} /min</td>
                          <td className="px-5 py-3.5">{v.temperature}°F</td>
                          <td className="px-5 py-3.5">{v.glucose ? `${v.glucose} mg/dL` : '—'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              v.status === 'Critical'
                                ? 'bg-red-50 text-red-700 border-red-300'
                                : v.status === 'Warning'
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{v.recordedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 3: Labs & Diagnostic Imaging */}
          {activePatientSubTab === 'labs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Diagnostic Laboratory Orders</h4>
                <button
                  onClick={() => setIsAddLabOpen(true)}
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Order Diagnostic Panel</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {activePat.labTests && activePat.labTests.length > 0 ? (
                  activePat.labTests.map(lab => (
                    <div key={lab.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{lab.testName}</span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 font-medium">
                            {lab.category}
                          </span>
                          {lab.priority === 'STAT' && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 font-bold rounded text-[10px]">STAT</span>
                          )}
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                          lab.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}>
                          {lab.status}
                        </span>
                      </div>

                      {lab.results && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-slate-800 dark:text-slate-200">
                          <div className="font-bold">Result Value: <span className="font-normal">{lab.results}</span></div>
                          {lab.normalRange && <div className="text-slate-500 text-[11px]">Normal Range: {lab.normalRange}</div>}
                        </div>
                      )}

                      <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1">
                        <span>Ordered on {lab.date} by {lab.doctorName}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">${lab.cost}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No diagnostic lab orders placed.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Patient Directory Grid / Table */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              {(['All', 'Admitted', 'Outpatient'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPatientFilterMode(mode)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    patientFilterMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient name, condition, blood..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                id="register-patient-btn"
                onClick={() => setShowAddPatientModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow transition-colors whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Patient</span>
              </button>
            </div>
          </div>

          {/* Patients List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map(pat => {
              const latestNote = pat.history && pat.history.length > 0 ? pat.history[0] : null;
              const isHovered = hoveredPatientId === pat.id;

              return (
                <div
                  key={pat.id}
                  id={`patient-card-${pat.id}`}
                  onClick={() => setSelectedPatientId(pat.id)}
                  className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div 
                      className="flex items-center gap-3 min-w-0 group"
                      onMouseEnter={() => setHoveredPatientId(pat.id)}
                      onMouseLeave={() => setHoveredPatientId(null)}
                    >
                      <img
                        src={pat.photo}
                        alt={pat.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 group-hover:ring-2 group-hover:ring-teal-500 transition-all"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {pat.name}
                          </h4>
                          <span className="text-[10px] font-mono font-semibold text-slate-400">
                            #{pat.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {pat.gender}, {pat.age} yrs • Blood: <span className="font-bold text-red-600">{pat.bloodType}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border shrink-0 whitespace-nowrap ${
                        pat.status === 'Admitted'
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                      }`}>
                        {pat.status}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewPatient(pat);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-600 dark:hover:text-teal-400 text-[10px] font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                        title="Quick View Note Snippet"
                        id={`quick-view-btn-${pat.id}`}
                      >
                        <Eye size={11} />
                        <span>Quick View</span>
                      </button>
                    </div>
                  </div>

                  {/* Hover Quick-View Note Snippet Popover */}
                  {isHovered && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-2 right-2 top-16 z-40 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-teal-300 dark:border-teal-700 shadow-2xl space-y-2 text-xs animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1">
                          <FileText size={12} /> Recent Note Snippet
                        </span>
                        {latestNote && (
                          <span className="text-[10px] text-slate-400 font-mono">{latestNote.date}</span>
                        )}
                      </div>

                      {latestNote ? (
                        <div className="space-y-1">
                          <div className="text-[11px] text-slate-900 dark:text-white font-bold leading-tight">
                            Diagnosis: <span className="text-teal-600 dark:text-teal-400 font-semibold">{latestNote.diagnosis}</span>
                          </div>
                          {latestNote.notes && (
                            <p className="text-[10.5px] text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50 dark:bg-slate-950/70 p-1.5 rounded-lg">
                              "{latestNote.notes}"
                            </p>
                          )}
                          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                            <span>Dr. {latestNote.doctor}</span>
                            <span className="font-semibold text-blue-600 hover:underline">Click Quick View for more</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 py-1">
                          No prior clinical encounters logged. Condition: <strong className="text-slate-800 dark:text-slate-200">{pat.condition}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      Condition: <span className="text-blue-600 dark:text-blue-400 font-bold">{pat.condition}</span>
                    </div>
                    <div className="text-slate-500 truncate">Room: {pat.room}</div>
                    <div className="text-slate-500 truncate">Insurance: {pat.insurance}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                    <span className="flex items-center gap-1">
                      <ClipboardList size={12} className="text-slate-400" />
                      <span>{pat.history?.length || 0} Consult Encounters</span>
                    </span>
                    <span className="font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                      <span>Open Chart</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Quick-View Modal */}
      <PatientQuickViewModal
        patient={quickViewPatient}
        onClose={() => setQuickViewPatient(null)}
        onOpenFullChart={(id) => setSelectedPatientId(id)}
        onOpenAiAssistant={onOpenAiAssistant}
      />

      {/* Modal: Register Patient */}
      {showAddPatientModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddPatientModal(false);
          }}
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Electronic Patient Record</h3>
              <button onClick={() => setShowAddPatientModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatientSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Hassel"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Type</label>
                  <select
                    value={newBlood}
                    onChange={(e) => setNewBlood(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  >
                    <option value="Outpatient">Outpatient</option>
                    <option value="Admitted">Admitted</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Presenting Condition / Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Severe Migraine, Asthma Exacerbation"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Insurance Provider</label>
                  <input
                    type="text"
                    value={newInsurance}
                    onChange={(e) => setNewInsurance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Known Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts"
                    value={newAllergies}
                    onChange={(e) => setNewAllergies(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Vitals */}
      {isAddVitalsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddVitalsOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Vitals Reading</h3>
            <form onSubmit={handleSaveVitals} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    value={vBp}
                    onChange={(e) => setVBp(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={vHr}
                    onChange={(e) => setVHr(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">SpO2 %</label>
                  <input
                    type="number"
                    value={vSpo2}
                    onChange={(e) => setVSpo2(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Resp Rate</label>
                  <input
                    type="number"
                    value={vRr}
                    onChange={(e) => setVRr(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vTemp}
                    onChange={(e) => setVTemp(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddVitalsOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Order Lab */}
      {isAddLabOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddLabOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Order Diagnostic Panel</h3>
            <form onSubmit={handleOrderLab} className="space-y-3">
              <div>
                <label className="block text-slate-500 mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  value={labTestName}
                  onChange={(e) => setLabTestName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Category</label>
                  <select
                    value={labCategory}
                    onChange={(e) => setLabCategory(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pathology">Pathology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Priority</label>
                  <select
                    value={labPriority}
                    onChange={(e) => setLabPriority(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT">STAT Emergency</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLabOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
                >
                  Transmit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Medical Summary */}
      {showPrintModal && activePat && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPrintModal(false);
          }}
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-300 p-8 shadow-2xl space-y-4 text-slate-900">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
              <div>
                <h2 className="text-xl font-black uppercase text-blue-900">St. Jude Medical Center</h2>
                <p className="text-xs text-slate-600">Confidential Electronic Health Record Summary</p>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded">
                EHR #{activePat.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><strong>Patient Name:</strong> {activePat.name}</div>
              <div><strong>Age / Gender:</strong> {activePat.age} yrs / {activePat.gender}</div>
              <div><strong>Blood Group:</strong> {activePat.bloodType}</div>
              <div><strong>Insurance:</strong> {activePat.insurance}</div>
              <div><strong>Allergies:</strong> {activePat.allergies?.join(', ') || 'NKDA'}</div>
              <div><strong>Primary Diagnosis:</strong> {activePat.condition}</div>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
              <h4 className="font-bold uppercase text-slate-700">Latest Vitals:</h4>
              {activePat.vitalsHistory?.[0] ? (
                <p>
                  BP: {activePat.vitalsHistory[0].bloodPressure} • HR: {activePat.vitalsHistory[0].heartRate} bpm • SpO2: {activePat.vitalsHistory[0].spO2}% • Temp: {activePat.vitalsHistory[0].temperature}°F
                </p>
              ) : (
                <p>No vitals logged.</p>
              )}
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
              <h4 className="font-bold uppercase text-slate-700">Latest Consultation History:</h4>
              {activePat.history?.[0] ? (
                <div>
                  <p><strong>{activePat.history[0].date}:</strong> {activePat.history[0].diagnosis}</p>
                  <p className="text-slate-600">Treatment: {activePat.history[0].treatment}</p>
                </div>
              ) : (
                <p>No consult records on file.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Physical Chart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
