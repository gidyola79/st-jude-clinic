import React, { useState, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Activity, 
  FileText, 
  Pill, 
  User, 
  Clock, 
  ShieldCheck, 
  Maximize2, 
  Volume2, 
  Check, 
  Send 
} from 'lucide-react';
import { Appointment, Patient, Prescription } from '../types';

interface TelehealthRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  patient?: Patient | null;
  doctorName?: string;
  onSaveConsultation?: (notes: string, prescriptions: Prescription[]) => void;
  addNotification: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule') => void;
}

export default function TelehealthRoomModal({
  isOpen,
  onClose,
  appointment,
  patient,
  doctorName,
  onSaveConsultation,
  addNotification,
}: TelehealthRoomModalProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [consultationNotes, setConsultationNotes] = useState(
    appointment?.notes ? `Follow-up notes: ${appointment.notes}\n\nChief complaint discussed.\nVitals confirmed stable via remote oximetry.` : 'Patient present on video stream.\nReports symptomatic improvement.\nNo acute respiratory distress or headache.'
  );

  // New Rx Form
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('Once daily');
  const [medDuration, setMedDuration] = useState('14 days');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    let timer: any = null;
    if (isOpen) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen]);

  // Keyboard Escape listener to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !appointment) return null;

  const formatSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddPrescription = () => {
    if (!medName.trim() || !medDosage.trim()) return;
    const newRx: Prescription = {
      medication: medName.trim(),
      dosage: medDosage.trim(),
      frequency: medFreq,
      duration: medDuration
    };
    setPrescriptions([...prescriptions, newRx]);
    setMedName('');
    setMedDosage('');
  };

  const handleEndCallAndComplete = () => {
    if (onSaveConsultation) {
      onSaveConsultation(consultationNotes, prescriptions);
    }
    addNotification('Telehealth Consultation Completed', `Remote session for ${appointment.patientName} concluded (${formatSeconds(callDuration)}).`, 'Success');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="telehealth-consultation-room"
        className="relative flex flex-col w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-white"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/40 rounded-full">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">LIVE TELEHEALTH</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{appointment.doctorName}</span>
                <span className="text-xs text-slate-400 font-normal">consulting with</span>
                <span className="text-blue-400">{appointment.patientName}</span>
              </h3>
              <p className="text-xs text-slate-400">{appointment.specialty} • Encrypted WebRTC Session (HIPAA Compliant)</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatSeconds(callDuration)}</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              Minimize
            </button>
          </div>
        </div>

        {/* Main Content: Video Feed (Left) & Clinical Panel (Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Video Stream Area (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col bg-slate-950 p-4 relative justify-between border-r border-slate-800">
            {/* Main Patient Video Placeholder */}
            <div className="relative flex-1 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              {isVideoOn ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
                  <img
                    src={patient?.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=512&auto=format&fit=crop'}
                    alt={appointment.patientName}
                    className="w-40 h-40 rounded-full object-cover border-4 border-slate-700 shadow-2xl mb-4"
                  />
                  <div className="text-center">
                    <p className="text-base font-semibold text-slate-200">{appointment.patientName}</p>
                    <p className="text-xs text-emerald-400 flex items-center justify-center gap-1 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> HD Video Connected (1080p, 60fps)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                  <VideoOff className="w-12 h-12" />
                  <p className="text-sm">Video Stream Muted</p>
                </div>
              )}

              {/* Doctor PiP Video (Bottom Right) */}
              <div className="absolute bottom-4 right-4 w-36 h-28 rounded-lg overflow-hidden bg-slate-800 border-2 border-blue-500/60 shadow-xl flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mx-auto mb-1">
                    MD
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium truncate">You ({appointment.doctorName})</p>
                  <span className="text-[9px] text-emerald-400">Audio 100%</span>
                </div>
              </div>

              {/* Patient Live Vitals Banner (Bottom Left) */}
              <div className="absolute bottom-4 left-4 p-2.5 bg-slate-950/85 backdrop-blur-md border border-slate-700/70 rounded-xl text-xs space-y-1 text-slate-300 shadow-lg">
                <div className="flex items-center gap-2 font-semibold text-blue-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Real-time Telemetry</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-[11px]">
                  <div><span className="text-slate-500">BP:</span> 120/78</div>
                  <div><span className="text-slate-500">HR:</span> 74 bpm</div>
                  <div><span className="text-slate-500">SpO2:</span> 99%</div>
                </div>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                id="telehealth-toggle-mic"
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full transition-colors ${
                  isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
                }`}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                id="telehealth-toggle-video"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
                }`}
                title={isVideoOn ? 'Stop Camera' : 'Start Camera'}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                id="telehealth-end-call"
                onClick={handleEndCallAndComplete}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End & Sign Consult</span>
              </button>
            </div>
          </div>

          {/* Clinical Workstation (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-900 overflow-y-auto p-5 space-y-5">
            {/* Patient Header Card */}
            <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400">Patient Electronic Chart</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-900/60 text-blue-300 rounded border border-blue-700">
                  {patient?.insurance || 'Insured'}
                </span>
              </div>
              <h4 className="text-base font-bold text-white">{appointment.patientName}</h4>
              <p className="text-xs text-slate-300">
                <span className="font-semibold text-slate-400">Chief Complaint: </span>
                {appointment.reason}
              </p>
              {patient?.allergies && patient.allergies.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-red-400 font-semibold">Allergies:</span>
                  {patient.allergies.map(a => (
                    <span key={a} className="px-1.5 py-0.5 text-[10px] bg-red-950 text-red-300 border border-red-800 rounded">
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Clinical SOAP / Consultation Note Taker */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Consultation Assessment & Clinical Notes</span>
              </label>
              <textarea
                id="telehealth-notes-input"
                rows={5}
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                placeholder="Document subjective history, visual findings, assessment & medical orders..."
                className="w-full p-3 text-xs leading-relaxed bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Electronic Prescription Writer */}
            <div className="space-y-3 p-4 bg-slate-800/60 border border-slate-700 rounded-xl">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Pill className="w-3.5 h-3.5 text-emerald-400" />
                <span>Issue Electronic Prescription (e-Rx)</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Medication (e.g. Amoxicillin)"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 500mg)"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={medFreq}
                  onChange={(e) => setMedFreq(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Once daily">Once daily (QD)</option>
                  <option value="Twice daily">Twice daily (BID)</option>
                  <option value="Three times daily">Three times daily (TID)</option>
                  <option value="Every 4 hours PRN">Every 4 hours PRN</option>
                  <option value="At bedtime">At bedtime (QHS)</option>
                </select>

                <select
                  value={medDuration}
                  onChange={(e) => setMedDuration(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="5 days">5 days</option>
                  <option value="7 days">7 days</option>
                  <option value="14 days">14 days</option>
                  <option value="30 days">30 days</option>
                  <option value="90 days">90 days</option>
                </select>
              </div>

              <button
                id="add-telehealth-rx-btn"
                type="button"
                onClick={handleAddPrescription}
                className="w-full py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Attach Medication to Prescription</span>
              </button>

              {prescriptions.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-400">Attached e-Rx:</span>
                  {prescriptions.map((rx, idx) => (
                    <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-700 text-[11px] flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-emerald-300">{rx.medication} {rx.dosage}</span>
                        <span className="text-slate-400"> • {rx.frequency} ({rx.duration})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complete & Bill Action */}
            <div className="pt-2">
              <button
                id="finish-telehealth-consult-btn"
                onClick={handleEndCallAndComplete}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition-colors"
              >
                Complete Session & Post to Patient Chart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
