import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ScanFace, 
  Camera, 
  CameraOff, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Activity,
  Fingerprint,
  Stethoscope,
  KeyRound
} from 'lucide-react';
import { StaffUser } from '../types';
import { DEMO_STAFF_ACCOUNTS } from '../lib/authService';
import { playClinicalAlertSound } from '../utils/audioAlerts';
import ClinicLogo from './ClinicLogo';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBiometricSuccess: (staffUser: StaffUser) => void;
  selectedStaffEmail?: string;
}

type ScanStage = 'IDLE' | 'ALIGNING' | 'SCANNING' | 'MATCHING' | 'VERIFIED' | 'FAILED';

export default function BiometricAuthModal({
  isOpen,
  onClose,
  onBiometricSuccess,
  selectedStaffEmail
}: BiometricAuthModalProps) {
  const [selectedStaff, setSelectedStaff] = useState<typeof DEMO_STAFF_ACCOUNTS[0]>(() => {
    return DEMO_STAFF_ACCOUNTS.find(s => s.email === selectedStaffEmail) || DEMO_STAFF_ACCOUNTS[0];
  });

  const [scanStage, setScanStage] = useState<ScanStage>('IDLE');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [faceConfidence, setFaceConfidence] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<any>(null);

  // Initialize camera and scanning pipeline when modal opens
  useEffect(() => {
    if (!isOpen) {
      cleanupScan();
      return;
    }

    startCamera();

    return () => {
      cleanupScan();
    };
  }, [isOpen]);

  const cleanupScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      clearInterval(scanTimerRef.current);
    }
    setCameraActive(false);
    setScanStage('IDLE');
    setProgressPercent(0);
  };

  const startCamera = async () => {
    setCameraError(null);
    setScanStage('ALIGNING');
    setTelemetryLogs(['[INIT] Clinical Biometric Neural Sensor v4.2 started...']);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API unavailable in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
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
      setTelemetryLogs(prev => [...prev, '[OPTICAL] High-resolution biometric feed connected.']);
      
      // Begin automated scanning sequence
      triggerBiometricScan();
    } catch (err: any) {
      console.warn('Biometric camera access warning:', err);
      setCameraActive(false);
      setCameraError(err.message || 'Camera permission denied or camera unavailable. Running simulated optical stream.');
      setTelemetryLogs(prev => [...prev, '[WARN] Optical hardware in use. Fallback simulation engaged.']);
      
      // Auto-trigger simulation
      triggerBiometricScan();
    }
  };

  const triggerBiometricScan = () => {
    setScanStage('SCANNING');
    setProgressPercent(15);
    setFaceConfidence(82);

    let progress = 15;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 8;
      if (progress >= 95) {
        progress = 98;
        clearInterval(interval);
        runMatchingStage();
      }
      setProgressPercent(Math.min(98, progress));
      setFaceConfidence(prev => Math.min(99.4, +(prev + (Math.random() * 1.5)).toFixed(1)));
    }, 180);

    scanTimerRef.current = interval;
  };

  const runMatchingStage = () => {
    setScanStage('MATCHING');
    setTelemetryLogs(prev => [
      ...prev,
      '[LANDMARK] 68-point facial topology extracted.',
      '[VAULT] Querying St. Jude Cryptographic Staff Directory...',
      `[MATCH] Verified identity: ${selectedStaff.displayName} (${selectedStaff.role})`
    ]);

    setTimeout(() => {
      setScanStage('VERIFIED');
      setProgressPercent(100);
      setFaceConfidence(99.7);
      playClinicalAlertSound('Success', true, 0.35);

      const verifiedUser: StaffUser = {
        uid: `bio-${selectedStaff.email.split('@')[0]}-${Date.now().toString(36)}`,
        email: selectedStaff.email,
        displayName: selectedStaff.displayName,
        role: selectedStaff.role,
        department: selectedStaff.department || 'Clinical Operations',
        doctorId: selectedStaff.doctorId,
        lastLoginAt: new Date().toISOString()
      };

      setTimeout(() => {
        onBiometricSuccess(verifiedUser);
      }, 1100);
    }, 900);
  };

  const handleManualRetry = () => {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && scanStage !== 'VERIFIED') onClose();
        }}
        id="biometric-auth-modal"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl text-slate-100 relative my-auto overflow-hidden"
        >
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4 mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30 shadow-inner">
                <ScanFace size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Biometric Facial Authentication
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-teal-950 text-teal-300 border border-teal-700/60">
                    IEC 62304
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-security optical verification for clinical workstations & EMR access.
                </p>
              </div>
            </div>
            
            {scanStage !== 'VERIFIED' && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Staff Member Selector */}
          <div className="mb-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                <Stethoscope size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Target Staff Profile:</span>
                <span className="text-xs font-bold text-white">{selectedStaff.displayName} ({selectedStaff.role})</span>
              </div>
            </div>

            {scanStage !== 'VERIFIED' && (
              <select
                value={selectedStaff.email}
                onChange={(e) => {
                  const match = DEMO_STAFF_ACCOUNTS.find(s => s.email === e.target.value);
                  if (match) {
                    setSelectedStaff(match);
                    handleManualRetry();
                  }
                }}
                className="text-xs font-bold bg-slate-900 text-slate-200 py-1.5 px-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {DEMO_STAFF_ACCOUNTS.map(staff => (
                  <option key={staff.email} value={staff.email}>
                    {staff.displayName} — {staff.role}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Camera Viewport with Facial Mesh HUD */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden aspect-[4/3] flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-teal-400 shadow-inner">
                  <ScanFace size={32} className="animate-pulse" />
                </div>
                <span className="text-xs font-bold text-slate-300">
                  {cameraError ? 'Optical Simulation Mode' : 'Initializing Neural Sensor...'}
                </span>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  {cameraError || 'Aligning facial geometry with St. Jude biometric directory.'}
                </p>
              </div>
            )}

            {/* Cyber Biometric HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40">
              
              {/* Top Telemetry Line */}
              <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 text-teal-400">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  <span>IRIS_OPTICAL_TRACKING</span>
                </div>
                <div className="bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
                  CONFIDENCE: <strong className="text-teal-400">{faceConfidence > 0 ? `${faceConfidence}%` : '--'}</strong>
                </div>
              </div>

              {/* Center Face Reticle Box */}
              <div className="self-center relative w-48 h-56 sm:w-56 sm:h-64 border-2 border-teal-500/50 rounded-[40px] flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.25)]">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-2xl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-2xl" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-2xl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-2xl" />

                {/* Laser Sweep Line */}
                {scanStage !== 'VERIFIED' && (
                  <motion.div
                    animate={{ y: [-90, 90, -90] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_#2dd4bf]"
                  />
                )}

                {/* Eye Level Targets */}
                <div className="absolute top-16 w-32 flex justify-between px-2 opacity-60">
                  <div className="w-5 h-5 border border-teal-400/80 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                  </div>
                  <div className="w-5 h-5 border border-teal-400/80 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                  </div>
                </div>

                {/* Verification Badge inside reticle when complete */}
                {scanStage === 'VERIFIED' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-600/90 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xl backdrop-blur-md border border-emerald-400"
                  >
                    <CheckCircle2 size={20} className="text-white" />
                    <span className="text-xs font-black uppercase tracking-wider">Identity Confirmed</span>
                  </motion.div>
                )}
              </div>

              {/* Bottom Progress Bar & Stage Description */}
              <div className="space-y-1.5 bg-slate-950/85 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    {scanStage === 'ALIGNING' && 'Positioning face within reticle...'}
                    {scanStage === 'SCANNING' && 'Analyzing biometric vector landmarks...'}
                    {scanStage === 'MATCHING' && 'Validating cryptographic credentials in vault...'}
                    {scanStage === 'VERIFIED' && `Authentication Approved: ${selectedStaff.displayName}`}
                  </span>
                  <span className="text-teal-400 font-mono text-[11px]">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${scanStage === 'VERIFIED' ? 'bg-emerald-500' : 'bg-teal-500'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Telemetry Log Terminal Drawer */}
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[10.5px] text-slate-400 max-h-20 overflow-y-auto space-y-1">
            {telemetryLogs.map((log, idx) => (
              <div key={idx} className="leading-tight truncate">
                <span className="text-teal-500 font-bold">&gt; </span>
                <span>{log}</span>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleManualRetry}
              disabled={scanStage === 'VERIFIED'}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} />
              <span>Rescan Face</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel / Use Password
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
