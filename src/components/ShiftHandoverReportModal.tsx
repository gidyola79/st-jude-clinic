import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  Pill, 
  Bell, 
  Activity, 
  Clock, 
  User, 
  Bed, 
  ShieldAlert, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  X,
  Stethoscope,
  Send,
  Building
} from 'lucide-react';
import { EmergencyCase, PrescriptionOrder, Notification, Patient, WardBed, UserRole, StaffUser, SystemLog } from '../types';

interface ShiftHandoverReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyCases: EmergencyCase[];
  pharmacyPrescriptions: PrescriptionOrder[];
  notifications: Notification[];
  patients: Patient[];
  systemLogs?: SystemLog[];
  wardBeds?: WardBed[];
  activeRole: UserRole;
  activeDoctorName?: string;
  staffUser?: StaffUser | null;
  onBroadcastNotification?: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule') => void;
}

export default function ShiftHandoverReportModal({
  isOpen,
  onClose,
  emergencyCases,
  pharmacyPrescriptions,
  notifications,
  patients,
  systemLogs = [],
  wardBeds = [],
  activeRole,
  activeDoctorName,
  staffUser,
  onBroadcastNotification
}: ShiftHandoverReportModalProps) {
  const [copied, setCopied] = useState(false);
  const [broadcasted, setBroadcasted] = useState(false);
  const [customDirectives, setCustomDirectives] = useState(
    '1. Priority follow-up on serial troponin labs for ER Bay 2.\n2. Verify IV Vancomycin infusion rate in Ward 3.\n3. Discharge paperwork pending cardiology sign-off for Bed 104.'
  );

  // Compute shift timing based on current hour
  const currentHour = new Date().getHours();
  const shiftType = useMemo(() => {
    if (currentHour >= 7 && currentHour < 15) return 'Morning Shift (07:00 – 15:00)';
    if (currentHour >= 15 && currentHour < 23) return 'Evening Shift (15:00 – 23:00)';
    return 'Night Shift (23:00 – 07:00)';
  }, [currentHour]);

  const reportTimestamp = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Filter Active ER cases
  const activeEmergencies = useMemo(() => {
    return emergencyCases.filter(c => c.status === 'In Trauma Bay' || c.status === 'Transferred to ICU' || c.status === 'Transferred to OR');
  }, [emergencyCases]);

  // Filter Pending Pharmacy prescriptions
  const pendingRx = useMemo(() => {
    return pharmacyPrescriptions.filter(rx => rx.status === 'Pending Dispense');
  }, [pharmacyPrescriptions]);

  // Filter Recent System Alarms / Alerts (last 24 hours)
  const recentAlerts = useMemo(() => {
    return notifications.slice(0, 8);
  }, [notifications]);

  // Bed stats
  const totalBeds = wardBeds.length || 24;
  const occupiedBeds = wardBeds.filter(b => b.status === 'Occupied').length || patients.filter(p => p.status === 'Admitted').length;
  const criticalBeds = wardBeds.filter(b => b.ward === 'ICU' || b.ward === 'Emergency').length;

  if (!isOpen) return null;

  // Generate plain text report for clipboard or download
  const generateTextReport = () => {
    let report = `=======================================================\n`;
    report += `ST. JUDE CLINIC - INTER-SHIFT CLINICAL HANDOVER REPORT\n`;
    report += `=======================================================\n`;
    report += `Timestamp: ${reportTimestamp}\n`;
    report += `Shift: ${shiftType}\n`;
    report += `Clinician: ${staffUser?.displayName || activeRole} (Role: ${activeRole})\n`;
    report += `Hospital Census: ${patients.length} Total Patients | ${occupiedBeds}/${totalBeds} Beds Occupied\n\n`;

    report += `-------------------------------------------------------\n`;
    report += `1. ACTIVE EMERGENCY CASES (${activeEmergencies.length})\n`;
    report += `-------------------------------------------------------\n`;
    if (activeEmergencies.length === 0) {
      report += `No active emergency cases reported.\n`;
    } else {
      activeEmergencies.forEach((ec, idx) => {
        report += `[${idx + 1}] Patient: ${ec.patientName} (${ec.age}y, ${ec.gender})\n`;
        report += `    Triage: Level ${ec.triageLevel} (${ec.acuity}) | Bed: ${ec.bedAssigned || 'Triage Bay'}\n`;
        report += `    Chief Complaint: ${ec.chiefComplaint}\n`;
        report += `    Vitals: BP ${ec.vitals?.bloodPressure || 'N/A'}, HR ${ec.vitals?.heartRate || 'N/A'} bpm, SpO2 ${ec.vitals?.spO2 || 'N/A'}%\n`;
        report += `    Attending: ${ec.attendingPhysician} | Status: ${ec.status}\n\n`;
      });
    }

    report += `-------------------------------------------------------\n`;
    report += `2. PENDING PHARMACY PRESCRIPTIONS (${pendingRx.length})\n`;
    report += `-------------------------------------------------------\n`;
    if (pendingRx.length === 0) {
      report += `No pending pharmacy orders.\n`;
    } else {
      pendingRx.forEach((rx, idx) => {
        report += `[${idx + 1}] ${rx.medicationName} ${rx.dosage} (${rx.frequency}) for ${rx.patientName}\n`;
        report += `    Priority: ${rx.priority} | Prescribed By: ${rx.prescribedBy} | Status: ${rx.status}\n`;
      });
      report += `\n`;
    }

    report += `-------------------------------------------------------\n`;
    report += `3. RECENT SYSTEM & CLINICAL TELEMETRY ALERTS (${recentAlerts.length})\n`;
    report += `-------------------------------------------------------\n`;
    if (recentAlerts.length === 0) {
      report += `No high-priority clinical alarms.\n`;
    } else {
      recentAlerts.forEach((n, idx) => {
        report += `[${idx + 1}] [${n.type.toUpperCase()}] ${n.title} - ${n.description} (${n.time})\n`;
      });
      report += `\n`;
    }

    report += `-------------------------------------------------------\n`;
    report += `4. CLINICIAN HANDOVER DIRECTIVES & ACTION ITEMS\n`;
    report += `-------------------------------------------------------\n`;
    report += `${customDirectives}\n\n`;
    report += `Report certified by: ${staffUser?.displayName || activeRole} (Badge: ${staffUser?.badgeNumber || 'STAFF-AUTH'})\n`;
    return report;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTextReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateTextReport()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Shift_Handover_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBroadcast = () => {
    if (onBroadcastNotification) {
      onBroadcastNotification(
        `Shift Handover: ${shiftType}`,
        `Handover summary filed by ${staffUser?.displayName || activeRole}: ${activeEmergencies.length} active ER cases, ${pendingRx.length} pending Rx orders, ${occupiedBeds}/${totalBeds} beds occupied.`,
        'Alert'
      );
      setBroadcasted(true);
      setTimeout(() => setBroadcasted(false), 3000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="shift-handover-printable-area"
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 md:p-8 text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto font-sans animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Top Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Shift Handover Clinical Report</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  Live Operations
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated clinical briefing for emergency cases, pharmacy orders, telemetry alerts, and ward census.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Report Header */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/80 pb-3 mb-3">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <Building size={14} />
                <span>St. Jude Medical Center • Emergency & Inpatient Service</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                Clinical Shift Handover & Census Report
              </h1>
            </div>
            <div className="text-left sm:text-right text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center sm:justify-end gap-1.5">
                <Clock size={13} className="text-teal-600" />
                <span>{reportTimestamp}</span>
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Shift: <span className="font-bold text-slate-700 dark:text-slate-300">{shiftType}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Reporting Clinician</span>
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {staffUser?.displayName || activeRole}
              </p>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                {staffUser?.badgeNumber || 'STAFF-EMR'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active ER Cases</span>
              <p className="font-bold text-red-600 dark:text-red-400 text-sm">
                {activeEmergencies.length} Patients
              </p>
              <span className="text-[10px] text-slate-400">
                {activeEmergencies.filter(e => e.triageLevel <= 2).length} Critical / STAT
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Pending Pharmacy</span>
              <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                {pendingRx.length} Orders
              </p>
              <span className="text-[10px] text-slate-400">
                {pendingRx.filter(r => r.priority === 'STAT' || r.priority === 'Urgent').length} Urgent
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Ward Occupancy</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {occupiedBeds} / {totalBeds} Beds
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">
                {totalBeds - occupiedBeds} Available
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Active Emergency Cases */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <AlertTriangle size={15} />
              <span>1. Active Emergency Cases ({activeEmergencies.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Immediate clinical attention required</span>
          </div>

          {activeEmergencies.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              No active emergency or trauma cases at handover.
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeEmergencies.map((ec) => (
                <div 
                  key={ec.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900/50 transition-colors text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-900">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        ec.triageLevel === 1 ? 'bg-red-600 animate-ping' :
                        ec.triageLevel === 2 ? 'bg-orange-500' :
                        ec.triageLevel === 3 ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {ec.patientName}
                      </span>
                      <span className="text-slate-400">({ec.age}y, {ec.gender})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ec.triageLevel <= 2 
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900' 
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200'
                      }`}>
                        Level {ec.triageLevel} • {ec.acuity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">
                        {ec.bedAssigned || 'Triage Area'}
                      </span>
                      <span className="text-slate-500 font-medium">Status: {ec.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 font-semibold">Chief Complaint:</span>{' '}
                      <span className="font-bold text-slate-800 dark:text-slate-200">{ec.chiefComplaint}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">Attending:</span>{' '}
                      <span>{ec.attendingPhysician}</span>
                    </div>
                  </div>

                  {ec.vitals && (
                    <div className="mt-2 pt-1.5 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                      <span>BP: <strong className="text-slate-800 dark:text-slate-200">{ec.vitals.bloodPressure}</strong></span>
                      <span>•</span>
                      <span>HR: <strong className="text-slate-800 dark:text-slate-200">{ec.vitals.heartRate} bpm</strong></span>
                      <span>•</span>
                      <span>SpO2: <strong className="text-slate-800 dark:text-slate-200">{ec.vitals.spO2}%</strong></span>
                      <span>•</span>
                      <span>Temp: <strong className="text-slate-800 dark:text-slate-200">{ec.vitals.temperature}°F</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Pending Pharmacy Prescriptions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Pill size={15} />
              <span>2. Pending Pharmacy Orders ({pendingRx.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Medications awaiting dispensing & verification</span>
          </div>

          {pendingRx.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              All pharmacy medications dispensed and up to date.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {pendingRx.map((rx) => (
                <div 
                  key={rx.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {rx.medicationName} <span className="text-teal-600 dark:text-teal-400">{rx.dosage}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                      rx.priority === 'STAT' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                      rx.priority === 'Urgent' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {rx.priority}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Patient: <strong className="text-slate-700 dark:text-slate-300">{rx.patientName}</strong> • {rx.frequency}
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Prescribed by: {rx.prescribedBy}</span>
                    <span className="font-semibold text-amber-600">{rx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Recent System & Clinical Telemetry Alerts */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Bell size={15} />
              <span>3. Recent System & Clinical Alerts ({recentAlerts.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Critical events & telemetry logs</span>
          </div>

          <div className="space-y-1.5">
            {recentAlerts.map((n) => (
              <div 
                key={n.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                    n.type === 'Alert' ? 'bg-red-500' :
                    n.type === 'Success' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white mr-1.5">{n.title}:</span>
                    <span className="text-slate-600 dark:text-slate-400">{n.description}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                  {n.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Handover Directives & Instructions (Editable) */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-2">
            <Stethoscope size={15} />
            <span>4. Clinical Handover Directives & Special Watchlist</span>
          </h3>
          <textarea
            value={customDirectives}
            onChange={(e) => setCustomDirectives(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
            placeholder="Add special instructions for incoming team, critical patient watchlists, or pending physician consults..."
          />
        </div>

        {/* Bottom Actions Bar (Hidden in Print) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 font-bold text-xs cursor-pointer transition-colors shadow-xs"
              title="Print Physical Handover Document"
            >
              <Printer size={14} />
              <span>Print Handover Report</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
              title="Export as Text Document"
            >
              <Download size={14} />
              <span>Export File</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
              title="Copy formatted summary to clipboard"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onBroadcastNotification && (
              <button
                onClick={handleBroadcast}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
                title="Broadcast Handover as Live Staff Notification Alert"
              >
                {broadcasted ? <CheckCircle2 size={14} /> : <Send size={14} />}
                <span>{broadcasted ? 'Broadcast Sent!' : 'Broadcast to Staff Feed'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
