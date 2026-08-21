import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  CameraOff, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  Search, 
  UserCheck, 
  Calendar, 
  Clock, 
  Printer, 
  RefreshCw, 
  Check, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { Appointment } from '../types';
import { playClinicalAlertSound } from '../utils/audioAlerts';

interface FrontDeskQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onCheckInAppointment: (appointmentId: string, queueNumber: string) => void;
}

export default function FrontDeskQrScannerModal({
  isOpen,
  onClose,
  appointments,
  onCheckInAppointment
}: FrontDeskQrScannerModalProps) {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scannedResult, setScannedResult] = useState<{
    appointment: Appointment;
    queueNumber: string;
    timestamp: string;
  } | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Filter scheduled appointments ready for check-in
  const pendingAppointments = appointments.filter(
    (a) => a.status === 'Scheduled'
  );

  // Initialize camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedResult(null);
      setCameraError(null);
      setSearchError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access warning (fallback to simulation):', err);
      setCameraActive(false);
      setCameraError(err.message || 'Camera permission denied or camera device in use. Simulated scanner active.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Perform successful scan verification
  const handleVerifyAppointment = (appt: Appointment) => {
    const queueNumber = `Q-${Math.floor(100 + Math.random() * 900)}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    playClinicalAlertSound('Success', true, 0.35);

    setScannedResult({
      appointment: appt,
      queueNumber,
      timestamp
    });
    setSearchError(null);

    // Call parent handler to update state in appointments DB
    onCheckInAppointment(appt.id, queueNumber);
  };

  // Handle manual code entry
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const query = manualCode.trim().toLowerCase();
    if (!query) {
      setSearchError('Please enter a check-in code, appointment ID, or patient name.');
      return;
    }

    const matched = appointments.find(
      (a) =>
        a.id.toLowerCase().includes(query) ||
        a.patientName.toLowerCase().includes(query) ||
        `stj-chk-${a.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(-6)}`.includes(query)
    );

    if (matched) {
      handleVerifyAppointment(matched);
    } else {
      setSearchError(`No appointment found matching "${manualCode}". Please verify reference code.`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        id="front-desk-qr-scanner-modal"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 text-slate-800 dark:text-slate-100 relative my-auto max-h-[90vh] overflow-y-auto"
        >
          {/* Top Bar */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-teal-800/60">
                <QrCode size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Front Desk Optical QR Scanner
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300/40">
                    Kiosk Mode
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Scan patient appointment QR pass to verify admission, mark arrival, and generate queue ticket.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Success Scan View Result */}
          {scannedResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Admission Check-In Verified
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {scannedResult.appointment.patientName}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Queue Ticket</span>
                  <span className="text-xl font-mono font-black text-teal-600 dark:text-teal-400">
                    {scannedResult.queueNumber}
                  </span>
                </div>
              </div>

              {/* Verified Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-2 border-t border-emerald-200/80 dark:border-emerald-900/60">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Physician</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {scannedResult.appointment.doctorName}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Specialty & Room</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {scannedResult.appointment.specialty} • Rm 302
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/40 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Arrival Timestamp</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {scannedResult.timestamp} (Today)
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-600 shrink-0" />
                  <span>Patient status marked as <strong>Checked In</strong>. Assigned doctor has been notified.</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setScannedResult(null);
                    setManualCode('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Scan Another Pass</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Print Queue Slip</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Camera Scanner Viewport */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden aspect-video flex flex-col items-center justify-center">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400">
                      <Camera size={24} />
                    </div>
                    <p className="text-xs font-medium max-w-sm">
                      {cameraError || 'Optical Camera Feed Active'}
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Retry Camera Link
                    </button>
                  </div>
                )}

                {/* Cyber Scanner HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Outer scan reticle box */}
                  <div className="w-52 h-52 sm:w-64 sm:h-64 border-2 border-teal-500/60 rounded-3xl relative flex flex-col items-center justify-between p-2 shadow-[0_0_25px_rgba(20,184,166,0.3)]">
                    {/* Corner Accent Brackets */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />

                    {/* Animated Scanning Laser Sweep */}
                    <motion.div
                      animate={{ y: [0, 210, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                      className="w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf]"
                    />

                    <span className="text-[10px] font-mono uppercase tracking-widest text-teal-300/80 bg-slate-950/80 px-2 py-0.5 rounded-full border border-teal-500/30">
                      [ ALIGN PATIENT QR CODE ]
                    </span>
                  </div>
                </div>
              </div>

              {/* Manual Code Input Bar */}
              <form onSubmit={handleManualSearch} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => {
                        setManualCode(e.target.value);
                        setSearchError(null);
                      }}
                      placeholder="Enter check-in reference code (e.g. STJ-CHK-9042) or patient name..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-xs"
                  >
                    <span>Verify Code</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {searchError && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{searchError}</span>
                  </p>
                )}
              </form>

              {/* Fast 1-Click Demo Scanner Test Simulation */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Zap size={12} className="text-amber-500" />
                    <span>Simulate Incoming Patient QR Scan</span>
                  </span>
                  <span className="text-[10px] text-slate-400">1-Click Test</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {pendingAppointments.slice(0, 4).map((appt) => (
                    <button
                      key={appt.id}
                      type="button"
                      onClick={() => handleVerifyAppointment(appt)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-800 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                          {appt.patientName}
                        </span>
                        <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold">
                          {appt.time}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                        {appt.doctorName} • {appt.specialty}
                      </div>
                    </button>
                  ))}

                  {pendingAppointments.length === 0 && (
                    <div className="col-span-2 p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl">
                      All scheduled appointments for today have already checked in.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
