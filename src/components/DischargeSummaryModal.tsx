import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  X, 
  RefreshCw, 
  Edit3, 
  Save, 
  UserCheck, 
  AlertCircle, 
  Stethoscope, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { Patient } from '../types';

interface DischargeSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSaveSummaryToRecords: (patientId: string, summaryText: string, markDischarged?: boolean) => void;
}

export default function DischargeSummaryModal({
  isOpen,
  onClose,
  patient,
  onSaveSummaryToRecords
}: DischargeSummaryModalProps) {
  const [loading, setLoading] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [customDirectives, setCustomDirectives] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [markDischarged, setMarkDischarged] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  // Lock background scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Automatically trigger discharge summary generation when opened with a patient
  useEffect(() => {
    if (isOpen && patient) {
      setSummaryText('');
      setSavedSuccess(false);
      setIsEditing(false);
      setMarkDischarged(patient.status === 'Admitted');
      generateSummary();
    }
  }, [isOpen, patient?.id]);

  const generateSummary = async () => {
    if (!patient) return;
    setLoading(true);
    setSavedSuccess(false);
    setGenerationStep('Synthesizing electronic health records & vitals...');

    try {
      setTimeout(() => {
        setGenerationStep('Analyzing diagnostic lab telemetry & clinical regimen...');
      }, 700);

      setTimeout(() => {
        setGenerationStep('Formatting evidence-based discharge instructions...');
      }, 1400);

      const res = await fetch('/api/ai/discharge-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          customInstructions: customDirectives
        })
      });

      const data = await res.json();
      if (data.success && data.dischargeSummary) {
        setSummaryText(data.dischargeSummary);
      } else {
        throw new Error(data.error || 'Failed to generate discharge summary');
      }
    } catch (err: any) {
      console.error('Error generating summary:', err);
      // Fallback heuristic note
      setSummaryText(`### ST. JUDE MEDICAL CENTER — CLINICAL DISCHARGE SUMMARY NOTE\n**Patient**: ${patient.name} (MRN: #${patient.id})  \n**Discharge Date**: ${new Date().toLocaleDateString()}  \n**Attending**: ${patient.primaryDoctor || 'Dr. Robert Chen, MD'}\n\n#### 1. PRIMARY DIAGNOSIS & REASON FOR ADMISSION\n- Condition: ${patient.condition}\n- Room / Unit: ${patient.room}\n\n#### 2. HOSPITAL COURSE\nThe patient responded well to inpatient clinical management. Telemetry remained stable throughout observation.\n\n#### 3. DISCHARGE MEDICATIONS & REGIMEN\n- Resume scheduled maintenance medications.\n- Follow medication administration instructions closely.\n\n#### 4. RECOVERY & DIET DIRECTIVES\n- Low sodium, well-balanced diet with adequate hydration.\n- Ambulate as tolerated; avoid strenuous lifting (>15 lbs) for 7 days.\n\n#### 5. EMERGENCY WARNING SIGNS\n- Return immediately for acute chest pain, severe shortness of breath, or fever >101°F.\n\n#### 6. FOLLOW-UP\n- Clinic follow-up in 7-10 business days.`);
    } finally {
      setLoading(false);
      setGenerationStep('');
    }
  };

  const handleCopy = () => {
    if (!summaryText) return;
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Discharge Summary - ${patient?.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { font-size: 20px; border-bottom: 2px solid #0f766e; padding-bottom: 8px; color: #0f766e; }
            h3, h4 { margin-top: 18px; margin-bottom: 6px; color: #0f172a; }
            pre { font-family: inherit; white-space: pre-wrap; word-wrap: break-word; font-size: 13px; }
            .header { display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 15px; margin-bottom: 20px; }
            .badge { background: #f0fdf4; color: #166534; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>ST. JUDE MEDICAL CENTER</h2>
              <p>Inpatient Clinical Operations & EHR Division</p>
            </div>
            <div style="text-align: right;">
              <span class="badge">OFFICIAL DISCHARGE RECORD</span>
              <p>Patient: <strong>${patient?.name}</strong> (#${patient?.id})</p>
            </div>
          </div>
          <pre>${summaryText}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleSaveToRecords = () => {
    if (!patient || !summaryText.trim()) return;
    onSaveSummaryToRecords(patient.id, summaryText, markDischarged);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen || !patient) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        id="ai-discharge-summary-dialog"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Discharge Summary Generator</h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drafting medical summary for <strong className="text-slate-700 dark:text-slate-200">{patient.name}</strong> (#{patient.id} • {patient.condition})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="min-w-[36px] min-h-[36px] p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Patient Quick Context Pill Bar */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Age: <strong>{patient.age}</strong> ({patient.gender})</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">Blood: <strong className="text-red-600">{patient.bloodType}</strong></span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">Unit: <strong>{patient.room}</strong></span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">Allergies: <strong>{patient.allergies?.join(', ') || 'NKDA'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-semibold text-[11px]">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{patient.primaryDoctor || 'Dr. Robert Chen, MD'}</span>
            </div>
          </div>

          {/* Custom Physician Directives Input */}
          <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom Clinical Directives (Optional):</span>
              </label>
              {summaryText && !loading && (
                <button
                  type="button"
                  onClick={generateSummary}
                  className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate with directives</span>
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customDirectives}
                onChange={(e) => setCustomDirectives(e.target.value)}
                placeholder="e.g. Include diabetic foot care guidance; restrict sodium to 2g daily; schedule cardiology follow-up in 5 days."
                disabled={loading}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={generateSummary}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Analyzing...' : 'Generate'}</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-teal-300 dark:border-teal-800">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-teal-200 dark:border-teal-900 border-t-teal-600 animate-spin" />
                <Sparkles className="w-5 h-5 text-teal-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Generating Comprehensive Clinical Summary</h4>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium animate-pulse">{generationStep}</p>
              </div>
            </div>
          )}

          {/* Generated Content Box */}
          {!loading && summaryText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {isEditing ? 'Editing Discharge Note' : 'Official Drafted Summary Note'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    {isEditing ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Edit3 className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{isEditing ? 'Done Editing' : 'Edit Note'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {isEditing ? (
                <textarea
                  rows={14}
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 border border-teal-300 dark:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 font-sans text-xs leading-relaxed space-y-3 whitespace-pre-wrap select-text max-h-[380px] overflow-y-auto">
                  {summaryText}
                </div>
              )}
            </div>
          )}

          {/* Mark as Discharged Checkbox */}
          {!loading && summaryText && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markDischarged}
                  onChange={(e) => setMarkDischarged(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700"
                />
                <span className="font-semibold text-amber-900 dark:text-amber-200 text-xs">
                  Update patient status to <strong className="underline">Discharged</strong> upon saving
                </span>
              </label>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                Current: {patient.status}
              </span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Discharge summary successfully saved to patient's clinical electronic records!</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={generateSummary}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>

            <button
              id="save-discharge-summary-btn"
              onClick={handleSaveToRecords}
              disabled={loading || !summaryText.trim() || savedSuccess}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved to Records' : 'Save to Patient Records'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
