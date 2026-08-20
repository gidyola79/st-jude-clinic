import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Heart, 
  X, 
  Minimize2, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Volume2, 
  VolumeX, 
  Bed, 
  User, 
  Sliders, 
  Maximize2, 
  ShieldAlert, 
  Stethoscope, 
  RefreshCw,
  Search,
  Filter,
  Layers,
  FileText,
  Clock
} from 'lucide-react';
import { Patient } from '../types';

interface BedTelemetry {
  bedNumber: string;
  unit: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  diagnosis: string;
  doctor: string;
  hr: number;
  bpSys: number;
  bpDia: number;
  spO2: number;
  respRate: number;
  temp: number;
  rhythm: 'Normal Sinus' | 'Sinus Tachycardia' | 'Atrial Fibrillation' | 'Sinus Bradycardia' | 'Ventricular Bigeminy';
  status: 'Normal' | 'Warning' | 'Critical';
  waveformPoints: number[];
}

const INITIAL_BEDS: BedTelemetry[] = [
  {
    bedNumber: 'BED-01',
    unit: 'ICU / Critical Care',
    patientId: 'P1',
    patientName: 'Eleanor Vance',
    age: 62,
    gender: 'Female',
    diagnosis: 'Atrial Fibrillation & HTN',
    doctor: 'Dr. Robert Chen',
    hr: 82,
    bpSys: 134,
    bpDia: 86,
    spO2: 97,
    respRate: 17,
    temp: 98.6,
    rhythm: 'Atrial Fibrillation',
    status: 'Normal',
    waveformPoints: []
  },
  {
    bedNumber: 'BED-02',
    unit: 'ICU / Post-Op',
    patientId: 'P2',
    patientName: 'Marcus Brody',
    age: 54,
    gender: 'Male',
    diagnosis: 'Post-Op Coronary Bypass',
    doctor: 'Dr. Sarah Patel',
    hr: 114,
    bpSys: 158,
    bpDia: 96,
    spO2: 93,
    respRate: 23,
    temp: 100.4,
    rhythm: 'Sinus Tachycardia',
    status: 'Critical',
    waveformPoints: []
  },
  {
    bedNumber: 'BED-03',
    unit: 'Cardiac Telemetry',
    patientId: 'P3',
    patientName: 'Sarah Johnson',
    age: 29,
    gender: 'Female',
    diagnosis: 'Supraventricular Tachycardia',
    doctor: 'Dr. Robert Chen',
    hr: 92,
    bpSys: 118,
    bpDia: 76,
    spO2: 99,
    respRate: 16,
    temp: 98.4,
    rhythm: 'Normal Sinus',
    status: 'Normal',
    waveformPoints: []
  },
  {
    bedNumber: 'BED-04',
    unit: 'Trauma Bay 01',
    patientId: 'P4',
    patientName: 'David Miller',
    age: 47,
    gender: 'Male',
    diagnosis: 'Severe Polytrauma & Shock',
    doctor: 'Dr. Michael Chang',
    hr: 128,
    bpSys: 88,
    bpDia: 54,
    spO2: 91,
    respRate: 26,
    temp: 96.8,
    rhythm: 'Sinus Tachycardia',
    status: 'Critical',
    waveformPoints: []
  },
  {
    bedNumber: 'BED-05',
    unit: 'Step-Down Ward',
    patientId: 'P5',
    patientName: 'Linda Chen',
    age: 71,
    gender: 'Female',
    diagnosis: 'COPD Exacerbation & CHF',
    doctor: 'Dr. Lisa Ray',
    hr: 76,
    bpSys: 142,
    bpDia: 88,
    spO2: 95,
    respRate: 19,
    temp: 98.8,
    rhythm: 'Normal Sinus',
    status: 'Warning',
    waveformPoints: []
  },
  {
    bedNumber: 'BED-06',
    unit: 'Pediatric ICU',
    patientId: 'P6',
    patientName: 'Lucas Hayes',
    age: 8,
    gender: 'Male',
    diagnosis: 'Status Asthmaticus',
    doctor: 'Dr. Elena Rostova',
    hr: 104,
    bpSys: 106,
    bpDia: 68,
    spO2: 96,
    respRate: 22,
    temp: 99.2,
    rhythm: 'Normal Sinus',
    status: 'Normal',
    waveformPoints: []
  }
];

interface CentralTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSelectPatient?: (patientId: string) => void;
}

export default function CentralTelemetryModal({
  isOpen,
  onClose,
  patients,
  onSelectPatient
}: CentralTelemetryModalProps) {
  const [beds, setBeds] = useState<BedTelemetry[]>(INITIAL_BEDS);
  const [filterMode, setFilterMode] = useState<'All' | 'Critical' | 'ICU' | 'Normal'>('All');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [focusedBed, setFocusedBed] = useState<BedTelemetry | null>(null);
  const [sweepPhase, setSweepPhase] = useState<number>(0);
  const [timeString, setTimeString] = useState<string>('');

  // Keyboard Escape listener to dismiss focused bed or close telemetry modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (focusedBed) {
          setFocusedBed(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedBed, onClose]);

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Waveform & Hemodynamic simulation
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSweepPhase(prev => (prev + 1) % 60);

      setBeds(prevBeds => 
        prevBeds.map(bed => {
          // Slight natural biological drift
          const hrNoise = (Math.random() - 0.5) * 2;
          const newHr = Math.round(Math.max(45, Math.min(160, bed.hr + hrNoise)));
          
          const sysNoise = (Math.random() - 0.5) * 2;
          const newSys = Math.round(Math.max(80, Math.min(185, bed.bpSys + sysNoise)));

          const diaNoise = (Math.random() - 0.5) * 1.5;
          const newDia = Math.round(Math.max(50, Math.min(110, bed.bpDia + diaNoise)));

          const spO2Noise = (Math.random() - 0.5) * 0.4;
          const newSpO2 = Math.round(Math.max(88, Math.min(100, bed.spO2 + spO2Noise)));

          // Evaluate status
          let status: BedTelemetry['status'] = 'Normal';
          if (newHr > 110 || newSys > 150 || newSys < 90 || newSpO2 < 94) {
            status = (newHr > 125 || newSys > 160 || newSys < 85 || newSpO2 < 92) ? 'Critical' : 'Warning';
          }

          return {
            ...bed,
            hr: newHr,
            bpSys: newSys,
            bpDia: newDia,
            spO2: newSpO2,
            status
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredBeds = beds.filter(bed => {
    if (filterMode === 'Critical') return bed.status === 'Critical';
    if (filterMode === 'ICU') return bed.unit.includes('ICU');
    if (filterMode === 'Normal') return bed.status === 'Normal';
    return true;
  });

  const criticalCount = beds.filter(b => b.status === 'Critical').length;
  const warningCount = beds.filter(b => b.status === 'Warning').length;

  // ECG Line Path Generator for SVG
  const generateEcgPath = (width: number, height: number, hr: number, phase: number) => {
    const points: string[] = [];
    const midY = height / 2;
    const step = 4;
    const totalPoints = Math.floor(width / step);
    const wavelength = Math.max(15, Math.floor(60 / (hr / 60)));

    for (let i = 0; i < totalPoints; i++) {
      const x = i * step;
      const t = (i + phase * 2) % wavelength;
      let y = midY;

      if (t === 4) y = midY - 4; // P wave
      else if (t === 6) y = midY + 3; // Q wave
      else if (t === 7) y = midY - (height * 0.42); // R peak
      else if (t === 8) y = midY + (height * 0.28); // S wave
      else if (t === 11 || t === 12) y = midY - 6; // T wave
      else y = midY + (Math.random() * 2 - 1); // Isoelectric noise

      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }

    return points.join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white font-sans overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Telemetry Command Bar */}
      <div className="h-16 px-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 animate-pulse">
            <Activity size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                CENTRAL ICU TELEMETRY STATION
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                6 CHANNELS ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Bed Continuous ECG Waveform &amp; Hemodynamic Surveillance Matrix
            </p>
          </div>
        </div>

        {/* Central Filters & Alarm Indicators */}
        <div className="hidden md:flex items-center gap-3">
          {/* Alarms Counter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Alarms:</span>
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/40 animate-pulse">
                {criticalCount} Critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40">
                {warningCount} Warning
              </span>
            )}
            {criticalCount === 0 && warningCount === 0 && (
              <span className="text-emerald-400 font-bold">All Normal</span>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['All', 'Critical', 'ICU', 'Normal'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filterMode === mode
                    ? 'bg-teal-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'All' ? 'All Beds (6)' : mode}
              </button>
            ))}
          </div>

          {/* Live System Time */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-teal-400 flex items-center gap-1.5">
            <Clock size={13} />
            <span>{timeString}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              audioEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-red-950/40 text-red-400 border-red-800'
            }`}
            title={audioEnabled ? "Silence Audible Telemetry Tone" : "Enable Telemetry Audio"}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-white transition-all cursor-pointer"
            title="Exit Fullscreen Telemetry"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Multi-Bed Grid */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-950">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {filteredBeds.map((bed, idx) => {
            const isCritical = bed.status === 'Critical';
            const isWarning = bed.status === 'Warning';

            return (
              <motion.div
                key={bed.bedNumber}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-2xl border p-4 flex flex-col justify-between transition-all relative overflow-hidden ${
                  isCritical 
                    ? 'bg-red-950/20 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                    : isWarning
                    ? 'bg-amber-950/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Critical Alarm Banner */}
                {isCritical && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />
                )}

                {/* Bed Top Meta */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-teal-400">
                        {bed.bedNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold truncate max-w-[130px]">
                        {bed.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        isCritical 
                          ? 'bg-red-500 text-white animate-pulse'
                          : isWarning
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {bed.status === 'Critical' ? 'CRITICAL ALARM' : bed.status === 'Warning' ? 'WARNING' : 'NORMAL'}
                      </span>
                    </div>
                  </div>

                  {/* Patient Name & Clinical Condition */}
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{bed.patientName}</span>
                        <span className="text-xs font-normal text-slate-400">({bed.age}{bed.gender === 'Female' ? 'F' : 'M'})</span>
                      </h3>
                      <p className="text-[11px] text-teal-400 truncate max-w-[220px]">
                        {bed.diagnosis} • {bed.doctor}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                      {bed.rhythm}
                    </span>
                  </div>

                  {/* Live ECG Rhythm Waveform Display */}
                  <div className="relative h-20 w-full bg-slate-950 rounded-xl border border-slate-800 p-1 mb-3 overflow-hidden">
                    <div className="absolute top-1 left-2 text-[9px] font-mono text-teal-500 font-bold z-10">
                      LEAD II • 25mm/s • 1mV
                    </div>
                    <svg
                      viewBox="0 0 320 80"
                      className="w-full h-full text-teal-400"
                      preserveAspectRatio="none"
                    >
                      {/* Grid background lines */}
                      <line x1="0" y1="20" x2="320" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                      <line x1="0" y1="40" x2="320" y2="40" stroke="#1e293b" strokeWidth="0.5" />
                      <line x1="0" y1="60" x2="320" y2="60" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />

                      {/* Continuous ECG trace */}
                      <path
                        d={generateEcgPath(320, 80, bed.hr, sweepPhase)}
                        fill="none"
                        stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#14b8a6'}
                        strokeWidth="1.8"
                      />
                    </svg>
                  </div>

                  {/* Vitals Telemetry Numbers Matrix */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {/* Heart Rate */}
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[9.5px] font-extrabold uppercase text-slate-400 flex items-center justify-center gap-1">
                        <Heart size={10} className={`text-rose-500 ${isCritical ? 'animate-ping' : 'animate-pulse'}`} />
                        <span>HR (BPM)</span>
                      </div>
                      <div className={`text-lg font-black font-mono mt-0.5 ${
                        bed.hr > 110 || bed.hr < 55 ? 'text-red-400 animate-pulse' : 'text-teal-400'
                      }`}>
                        {bed.hr}
                      </div>
                    </div>

                    {/* Blood Pressure */}
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[9.5px] font-extrabold uppercase text-slate-400">
                        BP (mmHg)
                      </div>
                      <div className={`text-base font-black font-mono mt-0.5 ${
                        bed.bpSys > 150 || bed.bpSys < 90 ? 'text-amber-400' : 'text-indigo-400'
                      }`}>
                        {bed.bpSys}/{bed.bpDia}
                      </div>
                    </div>

                    {/* SpO2 */}
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[9.5px] font-extrabold uppercase text-slate-400 flex items-center justify-center gap-1">
                        <Zap size={10} className="text-blue-400" />
                        <span>SpO2 %</span>
                      </div>
                      <div className={`text-lg font-black font-mono mt-0.5 ${
                        bed.spO2 < 94 ? 'text-red-400 animate-pulse' : 'text-blue-400'
                      }`}>
                        {bed.spO2}%
                      </div>
                    </div>

                    {/* Resp Rate */}
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[9.5px] font-extrabold uppercase text-slate-400">
                        RESP (rpm)
                      </div>
                      <div className={`text-lg font-black font-mono mt-0.5 ${
                        bed.respRate > 22 ? 'text-amber-400' : 'text-violet-400'
                      }`}>
                        {bed.respRate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bed Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Temp: <strong className="text-slate-200">{bed.temp}°F</strong>
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setFocusedBed(bed)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-teal-600 text-slate-200 hover:text-white font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <Maximize2 size={11} />
                      <span>Deep Waveform</span>
                    </button>
                    {onSelectPatient && (
                      <button
                        onClick={() => {
                          onSelectPatient(bed.patientId);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border border-teal-500/30 font-bold transition-all cursor-pointer text-[11px]"
                      >
                        Chart
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Deep Waveform Focus Modal Overlay */}
      <AnimatePresence>
        {focusedBed && (
          <div 
            className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setFocusedBed(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-teal-500 text-slate-950 font-bold font-mono text-xs">
                      {focusedBed.bedNumber}
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {focusedBed.patientName} — 4-Channel High Resolution Telemetry
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {focusedBed.diagnosis} • Attending: {focusedBed.doctor} • Age {focusedBed.age}
                  </p>
                </div>
                <button
                  onClick={() => setFocusedBed(null)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 4 Multi-Channel Strips */}
              <div className="space-y-3 mb-6 font-mono text-xs">
                {/* Channel 1: Lead II ECG */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-teal-400 mb-1 text-[10px]">
                    <span>CH 1: ECG LEAD II (mV)</span>
                    <span>HR: {focusedBed.hr} BPM • {focusedBed.rhythm}</span>
                  </div>
                  <svg viewBox="0 0 600 60" className="w-full h-14 text-teal-400">
                    <path d={generateEcgPath(600, 60, focusedBed.hr, sweepPhase)} fill="none" stroke="#14b8a6" strokeWidth="2" />
                  </svg>
                </div>

                {/* Channel 2: Lead V5 */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-indigo-400 mb-1 text-[10px]">
                    <span>CH 2: ECG LEAD V5 (ST-Segment Monitor)</span>
                    <span>ST Deviation: 0.02 mV (Normal)</span>
                  </div>
                  <svg viewBox="0 0 600 60" className="w-full h-14 text-indigo-400">
                    <path d={generateEcgPath(600, 60, focusedBed.hr, sweepPhase + 5)} fill="none" stroke="#6366f1" strokeWidth="1.8" />
                  </svg>
                </div>

                {/* Channel 3: Plethysmograph (SpO2) */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-blue-400 mb-1 text-[10px]">
                    <span>CH 3: PLETHYSMOGRAPHY WAVEFORM</span>
                    <span>SpO2: {focusedBed.spO2}% • Pulse Perfusion Index: 3.4%</span>
                  </div>
                  <svg viewBox="0 0 600 60" className="w-full h-14 text-blue-400">
                    <path d={generateEcgPath(600, 60, focusedBed.hr, sweepPhase + 2)} fill="none" stroke="#3b82f6" strokeWidth="2" />
                  </svg>
                </div>

                {/* Channel 4: Respiratory CO2 Capnography */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-violet-400 mb-1 text-[10px]">
                    <span>CH 4: CAPNOGRAPHY &amp; RESPIRATORY DRIVE</span>
                    <span>RR: {focusedBed.respRate} rpm • EtCO2: 38 mmHg</span>
                  </div>
                  <svg viewBox="0 0 600 60" className="w-full h-14 text-violet-400">
                    <path d={generateEcgPath(600, 60, focusedBed.respRate * 3, sweepPhase)} fill="none" stroke="#a855f7" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setFocusedBed(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Close Waveform Focus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
