import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  Bed, 
  Users, 
  Stethoscope, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Maximize2, 
  ChevronRight, 
  ArrowUpRight, 
  Sparkles, 
  Siren, 
  Search, 
  Filter, 
  X,
  Plus
} from 'lucide-react';
import { Patient, Doctor, BedAlloc } from '../types';

interface DepartmentRoom {
  id: string;
  name: string;
  code: string;
  floor: 1 | 2;
  category: 'Emergency' | 'Critical Care' | 'Inpatient' | 'Diagnostics' | 'Surgical' | 'Outpatient';
  totalBeds: number;
  occupiedBeds: number;
  leadDoctor: string;
  specialty: string;
  status: 'Normal' | 'Moderate' | 'High' | 'Surge';
  x: number;
  y: number;
  width: number;
  height: number;
  equipment: string[];
}

const INITIAL_DEPARTMENTS: DepartmentRoom[] = [
  // LEVEL 1: Ground Floor & Acute Emergency
  {
    id: 'DEPT_ER',
    name: 'Emergency & Trauma Center',
    code: 'ER-BAY-100',
    floor: 1,
    category: 'Emergency',
    totalBeds: 16,
    occupiedBeds: 14,
    leadDoctor: 'Dr. Michael Chang',
    specialty: 'Emergency Medicine',
    status: 'Surge',
    x: 10,
    y: 10,
    width: 280,
    height: 160,
    equipment: ['Level 1 Resuscitation Bays', 'Rapid Infusers', 'Telemetry Monitors']
  },
  {
    id: 'DEPT_TRIAGE',
    name: 'Acute Triage & Fast Track',
    code: 'TRG-102',
    floor: 1,
    category: 'Outpatient',
    totalBeds: 8,
    occupiedBeds: 5,
    leadDoctor: 'Dr. Emily Watson',
    specialty: 'Urgent Triage',
    status: 'Moderate',
    x: 300,
    y: 10,
    width: 170,
    height: 160,
    equipment: ['Vital Signs Kiosks', 'Point-of-Care Blood Analyzers']
  },
  {
    id: 'DEPT_RADIO',
    name: 'Radiology & CT / MRI Suite',
    code: 'RAD-105',
    floor: 1,
    category: 'Diagnostics',
    totalBeds: 6,
    occupiedBeds: 4,
    leadDoctor: 'Dr. Lisa Ray',
    specialty: 'Diagnostic Radiology',
    status: 'Normal',
    x: 480,
    y: 10,
    width: 210,
    height: 160,
    equipment: ['3T MRI Scanner', '128-Slice CT', 'Digital X-Ray']
  },
  {
    id: 'DEPT_PHARM',
    name: 'Central Pharmacy Dispensary',
    code: 'PHM-110',
    floor: 1,
    category: 'Outpatient',
    totalBeds: 4,
    occupiedBeds: 2,
    leadDoctor: 'PharmD. Jason Lee',
    specialty: 'Clinical Pharmacy',
    status: 'Normal',
    x: 10,
    y: 180,
    width: 220,
    height: 140,
    equipment: ['Automated Dispensing Cabinets', 'Sterile IV Hoods']
  },
  {
    id: 'DEPT_LOBBY',
    name: 'Main Admissions & Ambulatory Care',
    code: 'ADM-120',
    floor: 1,
    category: 'Outpatient',
    totalBeds: 12,
    occupiedBeds: 7,
    leadDoctor: 'Dr. Robert Chen',
    specialty: 'Internal Medicine',
    status: 'Moderate',
    x: 240,
    y: 180,
    width: 450,
    height: 140,
    equipment: ['Registration Terminals', 'Patient Waiting Pods']
  },

  // LEVEL 2: Intensive Care & Inpatient Wards
  {
    id: 'DEPT_ICU',
    name: 'Intensive Care Unit (ICU)',
    code: 'ICU-201',
    floor: 2,
    category: 'Critical Care',
    totalBeds: 12,
    occupiedBeds: 11,
    leadDoctor: 'Dr. Sarah Patel',
    specialty: 'Critical Care & Pulmonology',
    status: 'Surge',
    x: 10,
    y: 10,
    width: 240,
    height: 160,
    equipment: ['High-Flow Ventilators', 'Continuous Hemofiltration', 'Arterial Monitors']
  },
  {
    id: 'DEPT_CARDIO',
    name: 'Cardiac Care & Cath Lab',
    code: 'CAR-205',
    floor: 2,
    category: 'Critical Care',
    totalBeds: 14,
    occupiedBeds: 10,
    leadDoctor: 'Dr. Robert Chen',
    specialty: 'Cardiology & Cath',
    status: 'High',
    x: 260,
    y: 10,
    width: 210,
    height: 160,
    equipment: ['Echocardiogram Hub', 'Telemetry Grid', 'Biplane Angiography']
  },
  {
    id: 'DEPT_OR',
    name: 'Surgical Suites & OR Complex',
    code: 'SURG-210',
    floor: 2,
    category: 'Surgical',
    totalBeds: 8,
    occupiedBeds: 6,
    leadDoctor: 'Dr. James Thorne',
    specialty: 'General & Trauma Surgery',
    status: 'Moderate',
    x: 480,
    y: 10,
    width: 210,
    height: 160,
    equipment: ['Laparoscopic Towers', 'C-Arm Fluoroscopy', 'Anesthesia Workstations']
  },
  {
    id: 'DEPT_PEDS',
    name: 'Pediatric Care Ward',
    code: 'PED-220',
    floor: 2,
    category: 'Inpatient',
    totalBeds: 10,
    occupiedBeds: 4,
    leadDoctor: 'Dr. Elena Rostova',
    specialty: 'Pediatric Medicine',
    status: 'Normal',
    x: 10,
    y: 180,
    width: 320,
    height: 140,
    equipment: ['Neonatal Incubators', 'Pediatric Pulse Oximetry']
  },
  {
    id: 'DEPT_GEN',
    name: 'General Medical Inpatient Ward',
    code: 'MED-230',
    floor: 2,
    category: 'Inpatient',
    totalBeds: 24,
    occupiedBeds: 18,
    leadDoctor: 'Dr. Marcus Brody',
    specialty: 'General Internal Medicine',
    status: 'High',
    x: 340,
    y: 180,
    width: 350,
    height: 140,
    equipment: ['Infusion Pumps', 'Mobile Vital Signs Units']
  }
];

interface HospitalFloorPlanWidgetProps {
  patients: Patient[];
  doctors: Doctor[];
  beds: BedAlloc[];
  onSelectTab?: (tab: string) => void;
}

export default function HospitalFloorPlanWidget({
  patients,
  doctors,
  beds,
  onSelectTab
}: HospitalFloorPlanWidgetProps) {
  const [activeFloor, setActiveFloor] = useState<1 | 2>(1);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('DEPT_ER');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [departments, setDepartments] = useState<DepartmentRoom[]>(INITIAL_DEPARTMENTS);

  // Selected Department
  const activeDept = departments.find(d => d.id === selectedDeptId) || departments[0];

  const currentFloorDepts = departments.filter(d => {
    if (d.floor !== activeFloor) return false;
    if (filterCategory !== 'All' && d.category !== filterCategory) return false;
    return true;
  });

  // Calculate Overall Floor Statistics
  const totalFloorBeds = currentFloorDepts.reduce((acc, curr) => acc + curr.totalBeds, 0);
  const totalFloorOccupied = currentFloorDepts.reduce((acc, curr) => acc + curr.occupiedBeds, 0);
  const floorOccupancyPct = totalFloorBeds > 0 ? Math.round((totalFloorOccupied / totalFloorBeds) * 100) : 0;

  // Status Color Mapping Helper
  const getOccupancyColor = (status: DepartmentRoom['status'], pct: number) => {
    if (pct >= 90 || status === 'Surge') {
      return {
        fill: 'fill-red-500/15 dark:fill-red-950/40',
        stroke: 'stroke-red-500 dark:stroke-red-600',
        border: 'border-red-400 dark:border-red-800',
        badge: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900',
        text: 'text-red-600 dark:text-red-400'
      };
    }
    if (pct >= 75 || status === 'High') {
      return {
        fill: 'fill-amber-500/15 dark:fill-amber-950/40',
        stroke: 'stroke-amber-500 dark:stroke-amber-600',
        border: 'border-amber-400 dark:border-amber-800',
        badge: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
        text: 'text-amber-600 dark:text-amber-400'
      };
    }
    if (pct >= 50 || status === 'Moderate') {
      return {
        fill: 'fill-indigo-500/15 dark:fill-indigo-950/40',
        stroke: 'stroke-indigo-500 dark:stroke-indigo-600',
        border: 'border-indigo-400 dark:border-indigo-800',
        badge: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
        text: 'text-indigo-600 dark:text-indigo-400'
      };
    }
    return {
      fill: 'fill-teal-500/15 dark:fill-teal-950/40',
      stroke: 'stroke-teal-500 dark:stroke-teal-600',
      border: 'border-teal-400 dark:border-teal-800',
      badge: 'bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900',
      text: 'text-teal-600 dark:text-teal-400'
    };
  };

  return (
    <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Building size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Interactive Hospital Architectural Floor Plan
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono font-bold">
                  Level {activeFloor} of 2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live wing occupancy tracking, bed utilization heatmap, and acute care ward telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Floor Level Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveFloor(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFloor === 1
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers size={13} />
            <span>Level 1: Ground &amp; Trauma</span>
          </button>
          <button
            onClick={() => setActiveFloor(2)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFloor === 2
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers size={13} />
            <span>Level 2: ICU &amp; Surgical</span>
          </button>
        </div>
      </div>

      {/* Main Floor Plan & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Architectural SVG Map (Col 8) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {/* Map Controls & Summary Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Occupancy Legend:</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-teal-500" /> &lt;60% Normal
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> 60-74% Moderate
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 75-89% High
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500" /> &ge;90% Surge
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500">
              Level {activeFloor} Census: <strong className="text-slate-800 dark:text-slate-200">{totalFloorOccupied} / {totalFloorBeds} Beds ({floorOccupancyPct}%)</strong>
            </div>
          </div>

          {/* SVG Floor Layout Canvas */}
          <div className="relative w-full bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-3 overflow-hidden shadow-inner">
            <svg
              viewBox="0 0 700 330"
              className="w-full h-auto max-h-[380px] select-none"
            >
              {/* Architectural Grid Background */}
              <defs>
                <pattern id="floor-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-300 dark:text-slate-800" strokeOpacity="0.4" />
                </pattern>
              </defs>
              <rect width="700" height="330" fill="url(#floor-grid)" rx="12" />

              {/* Department Rooms */}
              {currentFloorDepts.map((dept) => {
                const pct = Math.round((dept.occupiedBeds / dept.totalBeds) * 100);
                const color = getOccupancyColor(dept.status, pct);
                const isSelected = dept.id === selectedDeptId;

                return (
                  <g
                    key={dept.id}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className="cursor-pointer transition-all duration-200 group"
                  >
                    {/* Room Rectangle */}
                    <rect
                      x={dept.x}
                      y={dept.y}
                      width={dept.width}
                      height={dept.height}
                      rx="10"
                      className={`${color.fill} ${color.stroke} transition-all duration-200 ${
                        isSelected 
                          ? 'stroke-[3px] filter drop-shadow-md' 
                          : 'stroke-[1.5px] hover:stroke-[2.5px]'
                      }`}
                    />

                    {/* Room Code Badge */}
                    <rect
                      x={dept.x + 8}
                      y={dept.y + 8}
                      width={dept.code.length * 6.8 + 10}
                      height="16"
                      rx="4"
                      className="fill-white/80 dark:fill-slate-900/80"
                    />
                    <text
                      x={dept.x + 13}
                      y={dept.y + 20}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="fill-slate-700 dark:fill-slate-300"
                    >
                      {dept.code}
                    </text>

                    {/* Department Title */}
                    <text
                      x={dept.x + 10}
                      y={dept.y + 44}
                      fontSize="11.5"
                      fontWeight="bold"
                      className="fill-slate-900 dark:fill-slate-100"
                    >
                      {dept.name}
                    </text>

                    {/* Specialty & Lead Doctor */}
                    <text
                      x={dept.x + 10}
                      y={dept.y + 60}
                      fontSize="9.5"
                      className="fill-slate-500 dark:fill-slate-400"
                    >
                      {dept.specialty} • {dept.leadDoctor}
                    </text>

                    {/* Occupancy Progress Bar inside Room */}
                    <rect
                      x={dept.x + 10}
                      y={dept.y + dept.height - 36}
                      width={dept.width - 20}
                      height="7"
                      rx="3.5"
                      className="fill-slate-200 dark:fill-slate-800"
                    />
                    <rect
                      x={dept.x + 10}
                      y={dept.y + dept.height - 36}
                      width={((dept.width - 20) * pct) / 100}
                      height="7"
                      rx="3.5"
                      className={
                        pct >= 90 ? 'fill-red-500' :
                        pct >= 75 ? 'fill-amber-500' :
                        pct >= 50 ? 'fill-indigo-500' : 'fill-teal-500'
                      }
                    />

                    {/* Bed Capacity Readout */}
                    <text
                      x={dept.x + 10}
                      y={dept.y + dept.height - 14}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="fill-slate-700 dark:fill-slate-300"
                    >
                      Beds: {dept.occupiedBeds}/{dept.totalBeds} ({pct}%)
                    </text>

                    {/* Active Status Pill in Top Right of Room */}
                    <rect
                      x={dept.x + dept.width - 64}
                      y={dept.y + 8}
                      width="56"
                      height="16"
                      rx="4"
                      className={
                        pct >= 90 ? 'fill-red-500' :
                        pct >= 75 ? 'fill-amber-500' :
                        pct >= 50 ? 'fill-indigo-500' : 'fill-teal-500'
                      }
                    />
                    <text
                      x={dept.x + dept.width - 36}
                      y={dept.y + 19}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      {pct >= 90 ? 'SURGE' : pct >= 75 ? 'BUSY' : 'READY'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Department Inspector Panel (Col 4) */}
        <div className="lg:col-span-4 flex flex-col justify-between p-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Department Inspector
              </span>
              <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                {activeDept.code}
              </span>
            </div>

            {/* Department Title Card */}
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {activeDept.name}
            </h4>
            <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5 mt-0.5">
              <span>{activeDept.category}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Level {activeDept.floor} Wing</span>
            </div>

            {/* Capacity Meter Bar */}
            <div className="mb-4 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Occupancy Level</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {activeDept.occupiedBeds} / {activeDept.totalBeds} Beds ({Math.round((activeDept.occupiedBeds / activeDept.totalBeds) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    (activeDept.occupiedBeds / activeDept.totalBeds) >= 0.9 ? 'bg-red-500' :
                    (activeDept.occupiedBeds / activeDept.totalBeds) >= 0.75 ? 'bg-amber-500' :
                    (activeDept.occupiedBeds / activeDept.totalBeds) >= 0.5 ? 'bg-indigo-500' : 'bg-teal-500'
                  }`}
                  style={{ width: `${(activeDept.occupiedBeds / activeDept.totalBeds) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
                <span>{activeDept.totalBeds - activeDept.occupiedBeds} Free Beds</span>
                <span>Max Capacity: {activeDept.totalBeds}</span>
              </div>
            </div>

            {/* Clinical Personnel & Care Team */}
            <div className="space-y-2 mb-4">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Staff Physician on Duty
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-[11px] shrink-0 border border-teal-200 dark:border-teal-800">
                  MD
                </div>
                <div className="truncate">
                  <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                    {activeDept.leadDoctor}
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate">
                    {activeDept.specialty}
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic & Specialty Equipment */}
            <div className="mb-4">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Specialized Medical Assets
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeDept.equipment.map((eq, i) => (
                  <span 
                    key={i}
                    className="text-[10px] px-2 py-1 bg-white dark:bg-slate-950 rounded-lg border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
            {onSelectTab && (
              <>
                <button
                  onClick={() => onSelectTab(activeDept.floor === 1 && activeDept.category === 'Emergency' ? 'emergency' : 'beds')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Open {activeDept.name.split(' ')[0]} Management</span>
                  <ArrowUpRight size={14} />
                </button>

                <button
                  onClick={() => onSelectTab('appointments')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>Book Consultation in Wing</span>
                  <ChevronRight size={14} />
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
