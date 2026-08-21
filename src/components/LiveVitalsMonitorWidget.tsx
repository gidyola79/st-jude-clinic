import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  Activity, 
  Heart, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  User, 
  Bed, 
  Zap, 
  Sliders,
  Maximize2,
  Expand
} from 'lucide-react';
import { Patient } from '../types';
import CentralTelemetryModal from './CentralTelemetryModal';
import { VitalsSparkline } from './VitalsSparkline';

interface VitalPoint {
  time: Date;
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  spO2: number;
  respRate: number;
}

interface LiveVitalsMonitorWidgetProps {
  patients: Patient[];
  onSelectPatient?: (patientId: string) => void;
}

export default function LiveVitalsMonitorWidget({
  patients,
  onSelectPatient
}: LiveVitalsMonitorWidgetProps) {
  // Fullscreen Central Station modal
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);

  // Selected Patient for telemetry monitoring
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'P1');
  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0] || {
    id: 'P1',
    name: 'Eleanor Vance',
    age: 62,
    gender: 'Female',
    condition: 'Arrhythmia & Hypertension',
    room: 'ICU Bed 04',
    status: 'Inpatient'
  };

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [activeMetric, setActiveMetric] = useState<'both' | 'heartRate' | 'bloodPressure'>('both');
  const [vitalsHistory, setVitalsHistory] = useState<VitalPoint[]>(() => {
    // Generate initial 20 points
    const now = Date.now();
    const list: VitalPoint[] = [];
    for (let i = 20; i >= 0; i--) {
      list.push({
        time: new Date(now - i * 1500),
        heartRate: 74 + Math.sin(i * 0.4) * 6 + (Math.random() * 4 - 2),
        bpSystolic: 122 + Math.cos(i * 0.3) * 5 + (Math.random() * 3 - 1.5),
        bpDiastolic: 80 + Math.sin(i * 0.2) * 3 + (Math.random() * 2 - 1),
        spO2: 98 + Math.round(Math.random() * 1),
        respRate: 16 + Math.round(Math.random() * 2)
      });
    }
    return list;
  });

  const [alertStatus, setAlertStatus] = useState<'Normal' | 'Elevated' | 'Critical'>('Normal');
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ResizeObserver for dynamic D3 responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Latest vitals readouts
  const latest = vitalsHistory[vitalsHistory.length - 1] || {
    heartRate: 76,
    bpSystolic: 124,
    bpDiastolic: 82,
    spO2: 98,
    respRate: 16
  };

  // Real-time telemetry generator loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setVitalsHistory(prev => {
        const last = prev[prev.length - 1] || {
          heartRate: 75,
          bpSystolic: 120,
          bpDiastolic: 80,
          spO2: 98,
          respRate: 16
        };

        // Smooth physiological fluctuations
        const hrNoise = (Math.random() - 0.48) * 4;
        let newHr = Math.round(Math.max(50, Math.min(145, last.heartRate + hrNoise)));
        
        const sysNoise = (Math.random() - 0.48) * 3;
        let newSys = Math.round(Math.max(90, Math.min(170, last.bpSystolic + sysNoise)));
        
        const diaNoise = (Math.random() - 0.48) * 2;
        let newDia = Math.round(Math.max(55, Math.min(105, last.bpDiastolic + diaNoise)));

        const newSpO2 = Math.min(100, Math.max(94, Math.round(last.spO2 + (Math.random() * 0.8 - 0.4))));
        const newResp = Math.min(24, Math.max(12, Math.round(last.respRate + (Math.random() * 0.6 - 0.3))));

        // Status evaluator
        if (newHr > 105 || newSys > 145 || newSpO2 < 95) {
          setAlertStatus(newHr > 120 || newSys > 160 ? 'Critical' : 'Elevated');
        } else {
          setAlertStatus('Normal');
        }

        const newPoint: VitalPoint = {
          time: new Date(),
          heartRate: newHr,
          bpSystolic: newSys,
          bpDiastolic: newDia,
          spO2: newSpO2,
          respRate: newResp
        };

        const updated = [...prev.slice(1), newPoint];
        return updated;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isRunning, selectedPatientId]);

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current || vitalsHistory.length === 0) return;

    const width = Math.max(260, Math.min(containerWidth, 1400));
    const height = 180;
    const margin = { top: 12, right: 14, bottom: 20, left: 32 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'none');

    const innerWidth = Math.max(40, width - margin.left - margin.right);
    const innerHeight = Math.max(40, height - margin.top - margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (Time)
    const timeDomain = d3.extent(vitalsHistory, (d: VitalPoint) => d.time);
    const xScale = d3.scaleTime()
      .domain([timeDomain[0] || new Date(), timeDomain[1] || new Date()])
      .range([0, innerWidth]);

    // Y Scale
    let yMin = 50;
    let yMax = 160;
    if (activeMetric === 'heartRate') {
      yMin = 45;
      yMax = 135;
    } else if (activeMetric === 'bloodPressure') {
      yMin = 60;
      yMax = 175;
    }

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0])
      .nice();

    // Subtle Grid Lines
    const yAxisGrid = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
      .ticks(4);

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08);

    g.select('.grid .domain').remove();

    // Defs for Gradients
    const defs = svg.append('defs');

    // HR Gradient Area
    const hrGrad = defs.append('linearGradient')
      .attr('id', 'hr-area-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    hrGrad.append('stop').attr('offset', '0%').attr('stop-color', '#14b8a6').attr('stop-opacity', 0.25);
    hrGrad.append('stop').attr('offset', '100%').attr('stop-color', '#14b8a6').attr('stop-opacity', 0.0);

    // BP Gradient Area
    const bpGrad = defs.append('linearGradient')
      .attr('id', 'bp-area-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    bpGrad.append('stop').attr('offset', '0%').attr('stop-color', '#6366f1').attr('stop-opacity', 0.20);
    bpGrad.append('stop').attr('offset', '100%').attr('stop-color', '#6366f1').attr('stop-opacity', 0.0);

    // Heart Rate Area & Line Generators
    if (activeMetric === 'both' || activeMetric === 'heartRate') {
      const hrArea = d3.area<VitalPoint>()
        .x(d => xScale(d.time))
        .y0(innerHeight)
        .y1(d => yScale(d.heartRate))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(vitalsHistory)
        .attr('fill', 'url(#hr-area-grad)')
        .attr('d', hrArea);

      const hrLine = d3.line<VitalPoint>()
        .x(d => xScale(d.time))
        .y(d => yScale(d.heartRate))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(vitalsHistory)
        .attr('fill', 'none')
        .attr('stroke', '#0d9488')
        .attr('stroke-width', 2.2)
        .attr('d', hrLine);

      // Latest HR Pulsing Point
      const lastPoint = vitalsHistory[vitalsHistory.length - 1];
      if (lastPoint) {
        g.append('circle')
          .attr('cx', xScale(lastPoint.time))
          .attr('cy', yScale(lastPoint.heartRate))
          .attr('r', 4.5)
          .attr('fill', '#0d9488')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);
      }
    }

    // Blood Pressure Systolic Line
    if (activeMetric === 'both' || activeMetric === 'bloodPressure') {
      const bpSysLine = d3.line<VitalPoint>()
        .x(d => xScale(d.time))
        .y(d => yScale(d.bpSystolic))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(vitalsHistory)
        .attr('fill', 'none')
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', activeMetric === 'both' ? '4 3' : 'none')
        .attr('d', bpSysLine);

      // Diastolic Line
      const bpDiaLine = d3.line<VitalPoint>()
        .x(d => xScale(d.time))
        .y(d => yScale(d.bpDiastolic))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(vitalsHistory)
        .attr('fill', 'none')
        .attr('stroke', '#a855f7')
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '2 2')
        .attr('d', bpDiaLine);
    }

    // X Axis
    const tickCount = width < 450 ? 3 : 5;
    const xAxis = d3.axisBottom(xScale)
      .ticks(tickCount)
      .tickFormat(d => d3.timeFormat('%H:%M:%S')(d as Date));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-size', '9.5px')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6);

    // Y Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(4);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', '9.5px')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6);

  }, [vitalsHistory, activeMetric, containerWidth]);

  return (
    <div className="p-3.5 sm:p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all w-full max-w-full overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 min-w-0">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0 max-w-full">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5 sm:mt-0">
            <Activity size={18} className="animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-xs md:max-w-md">
                Continuous Patient Vitals Monitor
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Stream
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px] sm:max-w-sm md:max-w-xl">
              Hemodynamics, cardiac pulse waveform & arrhythmia detection.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Patient Selector */}
          <select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              if (onSelectPatient) onSelectPatient(e.target.value);
            }}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer max-w-[130px] sm:max-w-[160px] md:max-w-[200px] truncate"
          >
            {patients.slice(0, 6).map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.room || 'ICU'})
              </option>
            ))}
          </select>

          {/* Stream Pause/Play */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              isRunning 
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                : 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/60'
            }`}
            title={isRunning ? "Pause Telemetry Stream" : "Resume Telemetry Stream"}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Expand View / Central Station Modal Button */}
          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            title="Expand View into full-screen telemetry modal"
            id="vitals-expand-view-btn"
          >
            <Expand size={13} />
            <span className="hidden sm:inline">Expand View</span>
            <span className="sm:hidden">Expand</span>
          </button>
        </div>
      </div>

      {/* Patient Mini Banner */}
      <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl mb-3.5 flex flex-wrap items-center justify-between gap-2.5 text-xs min-w-0 max-w-full overflow-hidden">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 max-w-full">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xs shrink-0">
            {activePatient.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 min-w-0">
              <span className="truncate max-w-[130px] sm:max-w-[200px]">{activePatient.name}</span>
              <span className="text-[10px] text-slate-400 font-normal truncate shrink-0">Age {activePatient.age || 58} • {activePatient.gender || 'Patient'}</span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 min-w-0">
              <span className="shrink-0">{activePatient.room || 'ICU Ward 02'}</span>
              <span className="shrink-0">•</span>
              <span className="text-teal-600 dark:text-teal-400 font-medium truncate max-w-[150px] sm:max-w-xs">{activePatient.condition || 'Post-Op Cardiac Monitoring'}</span>
            </div>
          </div>
        </div>

        {/* Telemetry Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1.5 whitespace-nowrap ${
            alertStatus === 'Critical' 
              ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 animate-pulse'
              : alertStatus === 'Elevated'
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
          }`}>
            {alertStatus === 'Normal' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
            <span className="truncate max-w-[120px]">Rhythm: {alertStatus}</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards: Dynamic CSS Grid (Auto-fill/Auto-fit columns) with Compact Sparklines */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5 sm:gap-3 mb-3.5 w-full">
        {/* Heart Rate BPM */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400">
            <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider truncate">Heart Rate</span>
            <Heart size={14} className="animate-pulse text-rose-500 shrink-0" />
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono truncate">
                {latest.heartRate}
              </span>
              <span className="text-[10px] text-slate-500 font-bold shrink-0">BPM</span>
            </div>
            {/* Sparkline trend */}
            <VitalsSparkline
              data={vitalsHistory.map(v => ({ value: v.heartRate }))}
              color="#0d9488"
              width={70}
              height={32}
              unit="BPM"
            />
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
            <span>Norm: 60-100</span>
            <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold">Live trend</span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider truncate">Blood Pressure</span>
            <Activity size={14} className="shrink-0 text-indigo-500" />
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono truncate">
                {latest.bpSystolic}/{latest.bpDiastolic}
              </span>
              <span className="text-[10px] text-slate-500 font-bold shrink-0">mmHg</span>
            </div>
            {/* Sparkline trend */}
            <VitalsSparkline
              data={vitalsHistory.map(v => ({ value: v.bpSystolic }))}
              color="#6366f1"
              width={70}
              height={32}
              unit="mmHg"
            />
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
            <span>Target: 120/80</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">Systolic</span>
          </div>
        </div>

        {/* Blood Oxygen SpO2 */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider truncate">Blood Oxygen</span>
            <Zap size={14} className="shrink-0 text-blue-500" />
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono truncate">
                {latest.spO2}%
              </span>
              <span className="text-[10px] text-slate-500 font-bold shrink-0">SpO2</span>
            </div>
            {/* Sparkline trend */}
            <VitalsSparkline
              data={vitalsHistory.map(v => ({ value: v.spO2 }))}
              color="#3b82f6"
              width={70}
              height={32}
              unit="%"
            />
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
            <span>Target: &gt;95%</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">Pulse Ox</span>
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-violet-600 dark:text-violet-400">
            <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider truncate">Resp Rate</span>
            <Activity size={14} className="shrink-0 text-violet-500" />
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono truncate">
                {latest.respRate}
              </span>
              <span className="text-[10px] text-slate-500 font-bold shrink-0">rpm</span>
            </div>
            {/* Sparkline trend */}
            <VitalsSparkline
              data={vitalsHistory.map(v => ({ value: v.respRate }))}
              color="#8b5cf6"
              width={70}
              height={32}
              unit="rpm"
            />
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
            <span>Norm: 12-20</span>
            <span className="font-mono text-violet-600 dark:text-violet-400 font-semibold">Respiration</span>
          </div>
        </div>
      </div>

      {/* D3 Waveform Canvas */}
      <div className="relative w-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveMetric('both')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                activeMetric === 'both'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setActiveMetric('heartRate')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMetric === 'heartRate'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-teal-600 dark:text-teal-400 hover:opacity-80'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>Heart Rate</span>
            </button>
            <button
              onClick={() => setActiveMetric('bloodPressure')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMetric === 'bloodPressure'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-600 dark:text-indigo-400 hover:opacity-80'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Blood Pressure</span>
            </button>
          </div>

          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            1.2s Telemetry • D3 Waveform
          </span>
        </div>

        <div 
          ref={containerRef}
          className="w-full bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/80 p-1 relative overflow-hidden"
        >
          <svg 
            ref={svgRef} 
            className="w-full h-[180px] overflow-hidden text-slate-400 dark:text-slate-500 block" 
          />
        </div>
      </div>

      {/* Fullscreen Multi-Patient Central Telemetry Modal */}
      <CentralTelemetryModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        patients={patients}
        onSelectPatient={onSelectPatient}
      />
    </div>
  );
}
