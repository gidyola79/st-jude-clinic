import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  MapPin, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { Appointment } from '../types';
import ClinicLogo from './ClinicLogo';

interface QrCodeCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSelfCheckIn?: (appointmentId: string) => void;
}

export default function QrCodeCheckInModal({
  isOpen,
  onClose,
  appointment,
  onSelfCheckIn
}: QrCodeCheckInModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false);
  const printableRef = useRef<HTMLDivElement>(null);

  // Derive unique check-in reference
  const checkInCode = appointment 
    ? `STJ-CHK-${appointment.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-6) || '9820'}`
    : 'STJ-CHK-0000';

  useEffect(() => {
    if (!appointment || !isOpen) return;

    setHasCheckedIn(appointment.status === 'Checked In' || appointment.status === 'Completed');
    setIsGenerating(true);

    const payload = JSON.stringify({
      facility: "ST_JUDE_CLINIC",
      system: "CLINICAL_EMR_CHECKIN_V4",
      checkInCode,
      appointmentId: appointment.id,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      specialty: appointment.specialty,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      location: "Building A • Main Medical Atrium",
      generatedAt: new Date().toISOString()
    });

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        setQrDataUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        setIsGenerating(false);
      });
  }, [appointment, isOpen, checkInCode]);

  if (!isOpen || !appointment) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(checkInCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `StJude-CheckIn-Pass-${appointment.patientName.replace(/\s+/g, '_')}-${appointment.date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCheckInNow = () => {
    if (onSelfCheckIn) {
      onSelfCheckIn(appointment.id);
      setHasCheckedIn(true);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        id="qr-checkin-modal"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-5 text-slate-800 dark:text-slate-100 relative my-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-teal-800/60 shadow-xs">
                <QrCode size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Appointment Check-In Pass
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300/40">
                    Fast Pass
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Present this QR pass at the front desk kiosk upon clinic arrival.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close QR modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* QR Code Graphic Card (Printable Area) */}
          <div 
            ref={printableRef}
            className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-teal-50/30 dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden shadow-inner"
          >
            {/* Top Pass Brand Bar */}
            <div className="w-full flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ClinicLogo size="sm" id="qr-modal-clinic-logo" />
                <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white">
                  ST. JUDE MEDICAL CLINIC
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-950/80 px-2 py-0.5 rounded-md">
                <span>{checkInCode}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="relative p-3 bg-white rounded-2xl border-2 border-teal-600/30 dark:border-teal-500/40 shadow-md">
              {isGenerating ? (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">Generating encrypted QR code...</span>
                </div>
              ) : qrDataUrl ? (
                <div className="relative">
                  <img 
                    src={qrDataUrl} 
                    alt={`Check-in QR Code for ${appointment.patientName}`} 
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg" 
                  />
                  {/* Subtle Center Emblem */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-200 flex items-center justify-center">
                      <ClinicLogo size="xs" id="qr-center-emblem" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-red-500 text-xs">
                  Error generating QR code
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                hasCheckedIn 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}>
                {hasCheckedIn ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Checked In & In Queue</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} className="text-amber-600 dark:text-amber-400" />
                    <span>Awaiting Arrival Scan</span>
                  </>
                )}
              </span>
            </div>

            {/* Appointment Summary Grid */}
            <div className="w-full mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-2 text-left text-xs">
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">{appointment.patientName}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Attending Physician</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">{appointment.doctorName}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">{appointment.date} @ {appointment.time}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Department / Room</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">{appointment.specialty} • Atrium 3</span>
              </div>
            </div>
          </div>

          {/* Quick Instructions & Self Check-in Trigger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Smartphone size={16} className="text-teal-600 shrink-0" />
              <span>Screenshot or show this screen to the reception optical scanner.</span>
            </div>

            {!hasCheckedIn && (
              <button
                onClick={handleCheckInNow}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                title="Simulate instant self check-in"
              >
                <CheckCircle2 size={14} />
                <span>Simulate Self Check-In</span>
              </button>
            )}
          </div>

          {/* Action Buttons Bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Pass</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-teal-600/20"
              >
                <Download size={14} />
                <span>Save QR Image</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
