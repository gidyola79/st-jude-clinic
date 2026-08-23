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
  KeyRound,
  FileText,
  Shield,
  Check,
  ChevronRight
} from 'lucide-react';
import { StaffUser, Patient } from '../types';
import { DEMO_STAFF_ACCOUNTS } from '../lib/authService';
import { playClinicalAlertSound } from '../utils/audioAlerts';
import ClinicLogo from './ClinicLogo';

export interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBiometricSuccess: (staffUser: StaffUser) => void;
  onVerified?: () => void;
  selectedStaffEmail?: string;
  mode?: 'login' | 'ehr_access';
  patient?: Patient | null;
  accessScopeTitle?: string;
}

type ScanStage = 'IDLE' | 'ALIGNING' | 'SCANNING' | 'MATCHING' | 'VERIFIED' | 'FAILED';
type BiometricMethod = 'fingerprint' | 'face';

export default function BiometricAuthModal({
  isOpen,
  onClose,
  onBiometricSuccess,
  onVerified,
  selectedStaffEmail,
  mode = 'login',
  patient = null,
  accessScopeTitle = 'Confidential Patient Health Record & Diagnostic Labs'
}: BiometricAuthModalProps) {
  const [selectedStaff, setSelectedStaff] = useState<typeof DEMO_STAFF_ACCOUNTS[0]>(() => {
    return DEMO_STAFF_ACCOUNTS.find(s => s.email === selectedStaffEmail) || DEMO_STAFF_ACCOUNTS[0];
  });

  const [biometricMethod, setBiometricMethod] = useState<BiometricMethod>('fingerprint');
  const [scanStage, setScanStage] = useState<ScanStage>('IDLE');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [faceConfidence, setFaceConfidence] = useState<number>(0);
  const [isFingerTouching, setIsFingerTouching] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<any>(null);

  // Sync selected staff if prop changes
  useEffect(() => {
    if (selectedStaffEmail) {
      const match = DEMO_STAFF_ACCOUNTS.find(s => s.email === selectedStaffEmail);
      if (match) setSelectedStaff(match);
    }
  }, [selectedStaffEmail]);

  // Reset or initialize state when modal opens
  useEffect(() => {
    if (!isOpen) {
      cleanupScan();
      return;
    }

    setScanStage('IDLE');
    setProgressPercent(0);
    setFaceConfidence(0);

    if (biometricMethod === 'face') {
      startCamera();
    } else {
      setTelemetryLogs([
        `[READY] St. Jude Biometric Capacitive Sensor v4.2 Online.`,
        mode === 'ehr_access' && patient 
          ? `[EHR GUARD] Patient #${patient.id} (${patient.name}) requires HIPAA §164.312 biometric verification.`
          : `[AUTH] Workstation security protocol active.`,
        `[ACTION] Place authorized clinician finger on optical glass scanner.`
      ].filter(Boolean) as string[]);
    }

    return () => {
      cleanupScan();
    };
  }, [isOpen, biometricMethod]);

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
    setIsFingerTouching(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setScanStage('ALIGNING');
    setTelemetryLogs([
      '[INIT] Clinical Biometric Neural Sensor v4.2 started...',
      mode === 'ehr_access' ? `[HIPAA] Requesting biometric step-up for EHR: ${patient?.name || 'Protected Record'}` : '[AUTH] Face ID initialization...'
    ]);

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
      
      triggerBiometricScan();
    } catch (err: any) {
      console.warn('Biometric camera access warning:', err);
      setCameraActive(false);
      setCameraError(err.message || 'Camera permission denied or unavailable. Running simulated optical stream.');
      setTelemetryLogs(prev => [...prev, '[WARN] Optical hardware unavailable. Fallback neural simulation engaged.']);
      
      triggerBiometricScan();
    }
  };

  const triggerBiometricScan = () => {
    setScanStage('SCANNING');
    setProgressPercent(15);
    setFaceConfidence(82);

    let progress = 15;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 14) + 10;
      if (progress >= 95) {
        progress = 98;
        clearInterval(interval);
        runMatchingStage();
      }
      setProgressPercent(Math.min(98, progress));
      setFaceConfidence(prev => Math.min(99.8, +(prev + (Math.random() * 1.5)).toFixed(1)));
    }, 160);

    scanTimerRef.current = interval;
  };

  const handleFingerprintScan = () => {
    if (scanStage === 'SCANNING' || scanStage === 'MATCHING' || scanStage === 'VERIFIED') return;

    setIsFingerTouching(true);
    setScanStage('SCANNING');
    setProgressPercent(20);
    setTelemetryLogs(prev => [
      ...prev,
      `[SENSOR] Dermal ridge capture initiated for ${selectedStaff.displayName}...`,
      `[ENCRYPTION] Generating SHA-256 biometric token...`
    ]);

    let progress = 20;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 16) + 12;
      if (progress >= 95) {
        progress = 100;
        clearInterval(interval);
        runMatchingStage();
      }
      setProgressPercent(Math.min(100, progress));
    }, 140);

    scanTimerRef.current = interval;
  };

  const runMatchingStage = () => {
    setScanStage('MATCHING');
    const methodStr = biometricMethod === 'fingerprint' ? 'Capacitive Dermal Hash' : '68-point 3D Facial Topology';
    
    setTelemetryLogs(prev => [
      ...prev,
      `[MATCH] ${methodStr} extracted.`,
      `[VAULT] Querying St. Jude HSM Cryptographic Staff Directory...`,
      `[CONFIRM] Verified Credential: ${selectedStaff.displayName} (${selectedStaff.role})`
    ]);

    setTimeout(() => {
      setScanStage('VERIFIED');
      setProgressPercent(100);
      setFaceConfidence(99.9);
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
        if (onVerified) onVerified();
        onBiometricSuccess(verifiedUser);
      }, 950);
    }, 700);
  };

  const handleManualRetry = () => {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    if (biometricMethod === 'face') {
      startCamera();
    } else {
      setScanStage('IDLE');
      setProgressPercent(0);
      setIsFingerTouching(false);
      handleFingerprintScan();
    }
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
          {/* Subtle Ambient Background Glows */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4 mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
                mode === 'ehr_access' 
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' 
                  : 'bg-teal-500/15 text-teal-400 border-teal-500/30'
              }`}>
                {biometricMethod === 'fingerprint' ? <Fingerprint size={24} /> : <ScanFace size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {mode === 'ehr_access' ? 'Biometric EHR Access Verification' : 'Biometric Staff Authentication'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-teal-950 text-teal-300 border border-teal-700/60">
                    HIPAA §164.312
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mode === 'ehr_access' 
                    ? 'Dual-factor cryptographic biometric clearance required to view protected health records.' 
                    : 'High-security biometric verification for clinical workstations and EMR operations.'}
                </p>
              </div>
            </div>
            
            {scanStage !== 'VERIFIED' && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                id="biometric-modal-close-btn"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* If accessing EHR, show Patient Target Badge */}
          {mode === 'ehr_access' && patient && (
            <div className="mb-3.5 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-300 block">
                    Target Protected Record:
                  </span>
                  <div className="font-bold text-white truncate flex items-center gap-1.5">
                    <span>{patient.name}</span>
                    <span className="font-mono text-indigo-400 text-[11px]">#{patient.id}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-900/60 text-indigo-200 border border-indigo-700/50 shrink-0">
                Confidential Chart
              </span>
            </div>
          )}

          {/* Biometric Method Selector (Fingerprint vs FaceID) */}
          <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (scanStage !== 'VERIFIED') {
                  setBiometricMethod('fingerprint');
                  cleanupScan();
                }
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                biometricMethod === 'fingerprint'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              id="bio-method-fingerprint-btn"
            >
              <Fingerprint size={16} />
              <span>Touch ID / Fingerprint</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (scanStage !== 'VERIFIED') {
                  setBiometricMethod('face');
                  cleanupScan();
                }
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                biometricMethod === 'face'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              id="bio-method-face-btn"
            >
              <ScanFace size={16} />
              <span>Face ID / Optical Scan</span>
            </button>
          </div>

          {/* Clinician Profile Strip */}
          <div className="mb-4 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-teal-600/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                <Stethoscope size={14} />
              </div>
              <div className="min-w-0 truncate">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Clinician Identity:</span>
                <span className="font-bold text-white truncate">{selectedStaff.displayName} ({selectedStaff.role})</span>
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
                className="text-[11px] font-bold bg-slate-900 text-slate-200 py-1 px-2 rounded-lg border border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer shrink-0"
              >
                {DEMO_STAFF_ACCOUNTS.map(staff => (
                  <option key={staff.email} value={staff.email}>
                    {staff.displayName} ({staff.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* --- METHOD 1: FINGERPRINT TOUCH SCANNER --- */}
          {biometricMethod === 'fingerprint' && (
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[260px] text-center overflow-hidden">
              {/* Concentric Scanner Pulse Rings */}
              <div className="relative flex items-center justify-center my-3">
                {scanStage === 'SCANNING' && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.45, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute inset-0 w-32 h-32 -m-4 rounded-full border-2 border-teal-400/60 pointer-events-none"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.2 }}
                      className="absolute inset-0 w-32 h-32 -m-4 rounded-full border border-teal-500/30 pointer-events-none"
                    />
                  </>
                )}

                {/* Main Interactive Touch Button */}
                <button
                  type="button"
                  onClick={handleFingerprintScan}
                  disabled={scanStage === 'VERIFIED'}
                  className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer select-none group shadow-2xl ${
                    scanStage === 'VERIFIED'
                      ? 'bg-emerald-600/20 text-emerald-400 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                      : scanStage === 'SCANNING'
                        ? 'bg-teal-500/20 text-teal-300 border-2 border-teal-400 shadow-[0_0_35px_rgba(45,212,191,0.35)] scale-105'
                        : 'bg-slate-900 text-teal-400 border-2 border-slate-700 hover:border-teal-500/80 hover:bg-slate-850 hover:shadow-[0_0_25px_rgba(20,184,166,0.2)]'
                  }`}
                  id="biometric-fingerprint-touch-pad"
                  title="Click or Tap to Scan Fingerprint"
                >
                  {scanStage === 'VERIFIED' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="flex flex-col items-center"
                    >
                      <CheckCircle2 size={44} className="text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 mt-1">Verified</span>
                    </motion.div>
                  ) : (
                    <>
                      <Fingerprint 
                        size={48} 
                        className={`transition-all duration-300 ${
                          scanStage === 'SCANNING' ? 'animate-pulse text-teal-300' : 'group-hover:scale-105 text-teal-400'
                        }`} 
                      />
                      {/* Laser Bar Scan */}
                      {scanStage === 'SCANNING' && (
                        <motion.div
                          animate={{ y: [-24, 24, -24] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute w-16 h-1 bg-gradient-to-r from-transparent via-teal-300 to-transparent rounded-full shadow-[0_0_12px_#2dd4bf]"
                        />
                      )}
                    </>
                  )}
                </button>
              </div>

              {/* Status Message */}
              <div className="space-y-1 mt-2">
                <div className="text-xs font-bold text-slate-200">
                  {scanStage === 'IDLE' && 'Click Fingerprint Sensor to Authorize'}
                  {scanStage === 'SCANNING' && 'Scanning Dermal Ridges & Cryptographic Key...'}
                  {scanStage === 'MATCHING' && 'Validating with Hospital Biometric Directory...'}
                  {scanStage === 'VERIFIED' && 'Biometric Authentication Approved!'}
                </div>
                <p className="text-[11px] text-slate-400">
                  {scanStage === 'VERIFIED' 
                    ? 'Access granted. Opening clinical patient charts...' 
                    : 'Conforms to ISO/IEC 19794-2 biometric compliance standards.'}
                </p>
              </div>

              {/* Progress Bar */}
              {scanStage !== 'IDLE' && (
                <div className="w-full max-w-xs mt-3 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${scanStage === 'VERIFIED' ? 'bg-emerald-500' : 'bg-teal-500'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* --- METHOD 2: FACEID OPTICAL CAMERA SCANNER --- */}
          {biometricMethod === 'face' && (
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
                    {cameraError ? 'Optical Neural Simulation Active' : 'Initializing Optical Stream...'}
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
                      {scanStage === 'ALIGNING' && 'Positioning face within optical reticle...'}
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
          )}

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
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualRetry}
                disabled={scanStage === 'VERIFIED'}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                id="bio-rescan-btn"
              >
                <RefreshCw size={13} />
                <span>{biometricMethod === 'fingerprint' ? 'Restart Touch Scan' : 'Rescan Face'}</span>
              </button>

              {/* Instant 1-Click Verification for Fast Workflow */}
              <button
                type="button"
                onClick={() => {
                  runMatchingStage();
                }}
                disabled={scanStage === 'VERIFIED'}
                className="hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-xl bg-teal-950 text-teal-300 border border-teal-700/60 hover:bg-teal-900 text-xs font-bold transition-colors cursor-pointer"
                title="Simulate Instant Hardware Match"
                id="instant-bio-pass-btn"
              >
                <Zap size={12} className="text-amber-400" />
                <span>Quick Match</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              id="bio-cancel-btn"
            >
              Cancel
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
