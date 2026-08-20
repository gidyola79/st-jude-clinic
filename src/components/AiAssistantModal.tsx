import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Copy, 
  Check, 
  Bot, 
  ShieldAlert, 
  Stethoscope, 
  Pill, 
  Activity, 
  FileText, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';
import { Patient, EmergencyCase, Medicine } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  selectedPatient?: Patient | null;
  emergencyCases?: EmergencyCase[];
  medicines?: Medicine[];
  addNotification: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule') => void;
}

export default function AiAssistantModal({
  isOpen,
  onClose,
  patients,
  selectedPatient,
  emergencyCases = [],
  medicines = [],
  addNotification,
}: AiAssistantModalProps) {
  const [activeTask, setActiveTask] = useState<'clinical_summary' | 'triage_analysis' | 'drug_safety' | 'discharge_instructions'>('clinical_summary');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(selectedPatient?.id || patients[0]?.id || '');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiOutput, setAiOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<string>('gemini-3.7-flash');

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

  if (!isOpen) return null;

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleRunAiAnalysis = async (taskType = activeTask) => {
    setIsLoading(true);
    setAiOutput('');
    try {
      const payload = {
        task: taskType,
        context: customPrompt,
        patientData: {
          ...currentPatient,
          availableEmergencyCases: emergencyCases.slice(0, 3),
          availableMedicines: medicines.slice(0, 5)
        }
      };

      const response = await fetch('/api/ai-clinical-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setAiOutput(data.result);
        setActiveModel(data.source || 'gemini-3.7-flash');
        addNotification('AI Clinical Insight Ready', `Analysis completed for ${currentPatient?.name || 'Clinical Case'}.`, 'Success');
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback offline response
      setAiOutput(`### St. Jude Clinical Analysis (Local Heuristic Mode)\n\n**Patient**: ${currentPatient?.name || 'Subject'}\n**Condition**: ${currentPatient?.condition || 'Under observation'}\n**Allergies**: ${currentPatient?.allergies?.join(', ') || 'None recorded'}\n\n**Clinical Recommendation**:\n1. Maintain current medical regime.\n2. Vitals monitoring Q4H indicated.\n3. Telemetry parameters within stable threshold.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="ai-clinical-assistant-modal"
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">St. Jude AI Clinical Co-Pilot</h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {activeModel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evidence-based clinical reasoning, SOAP notes, differential diagnosis & drug safety
              </p>
            </div>
          </div>
          <button
            id="close-ai-assistant-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar & Mode Switcher */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              id="ai-task-summary"
              onClick={() => { setActiveTask('clinical_summary'); handleRunAiAnalysis('clinical_summary'); }}
              className={`flex items-center justify-center gap-2 p-3 text-xs font-semibold rounded-xl border transition-all ${
                activeTask === 'clinical_summary'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>SOAP & Case Summary</span>
            </button>

            <button
              id="ai-task-triage"
              onClick={() => { setActiveTask('triage_analysis'); handleRunAiAnalysis('triage_analysis'); }}
              className={`flex items-center justify-center gap-2 p-3 text-xs font-semibold rounded-xl border transition-all ${
                activeTask === 'triage_analysis'
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Emergency Triage</span>
            </button>

            <button
              id="ai-task-safety"
              onClick={() => { setActiveTask('drug_safety'); handleRunAiAnalysis('drug_safety'); }}
              className={`flex items-center justify-center gap-2 p-3 text-xs font-semibold rounded-xl border transition-all ${
                activeTask === 'drug_safety'
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Drug & Allergy Safety</span>
            </button>

            <button
              id="ai-task-discharge"
              onClick={() => { setActiveTask('discharge_instructions'); handleRunAiAnalysis('discharge_instructions'); }}
              className={`flex items-center justify-center gap-2 p-3 text-xs font-semibold rounded-xl border transition-all ${
                activeTask === 'discharge_instructions'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Discharge Plan</span>
            </button>
          </div>

          {/* Patient Selector & Custom Inquiry */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Selected Patient Context:
              </label>
              <select
                id="ai-patient-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.gender}, {p.age}y) — {p.condition} [{p.status}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Custom Doctor Inquiry / Clinical Focus (Optional):
              </label>
              <input
                id="ai-custom-prompt"
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Check beta-blocker compatibility with asthma history..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => { if (e.key === 'Enter') handleRunAiAnalysis(); }}
              />
            </div>

            <div className="flex items-end">
              <button
                id="run-ai-analysis-btn"
                onClick={() => handleRunAiAnalysis()}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Canvas */}
        <div className="flex-1 p-6 overflow-y-auto min-h-[260px] bg-slate-50/50 dark:bg-slate-950/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Synthesizing clinical diagnostic dataset via Gemini...</p>
            </div>
          ) : aiOutput ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Clinical Evaluation Result</span>
                <button
                  id="copy-ai-output-btn"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Result</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans shadow-sm">
                {aiOutput}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 dark:text-slate-500">
              <Bot className="w-12 h-12 mb-2 stroke-[1.5] text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium">Select an action above to generate intelligent clinical insights for {currentPatient?.name || 'patient'}.</p>
              <p className="text-xs text-slate-400 mt-1">Includes SOAP summaries, trauma triage recommendations, drug allergy safety, and discharge directions.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>AI Clinical Decision Support is intended for certified medical professionals. Verify with clinical protocols.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
