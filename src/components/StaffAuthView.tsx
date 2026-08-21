import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Stethoscope, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  UserCheck, 
  Sparkles,
  ArrowLeft,
  Hospital,
  ScanFace,
  Camera
} from 'lucide-react';
import { StaffUser, UserRole } from '../types';
import { signInStaff, signUpStaff, DEMO_STAFF_ACCOUNTS } from '../lib/authService';
import ClinicLogo from './ClinicLogo';
import BiometricAuthModal from './BiometricAuthModal';

interface StaffAuthViewProps {
  onAuthSuccess: (user: StaffUser) => void;
  onReturnToPublic: () => void;
}

export default function StaffAuthView({ onAuthSuccess, onReturnToPublic }: StaffAuthViewProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Doctor');
  const [department, setDepartment] = useState('Cardiology');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);

  // Quick fill demo credentials
  const handleQuickFill = (demo: typeof DEMO_STAFF_ACCOUNTS[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setSelectedRole(demo.role);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both hospital work email and workstation password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Workstation security requires a password of at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        const staff = await signInStaff(email, password);
        setSuccessMessage(`Authenticated successfully as ${staff.displayName} (${staff.role}). Initializing EMR...`);
        setTimeout(() => {
          onAuthSuccess(staff);
        }, 600);
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Please enter the staff member full legal name for medical licensing logs.');
          setIsLoading(false);
          return;
        }
        const staff = await signUpStaff(email, password, fullName, selectedRole, department);
        setSuccessMessage(`Staff credentials created for ${staff.displayName}. Logging into ${staff.role} workstation...`);
        setTimeout(() => {
          onAuthSuccess(staff);
        }, 700);
      }
    } catch (err: any) {
      console.error('Staff authentication error:', err);
      let msg = 'Authentication failed. Please verify your credentials.';
      const raw = err?.message || String(err || '');

      if (raw.includes('api-keys-are-not-supported') || raw.includes('API key') || raw.includes('principal')) {
        msg = 'Invalid credentials or workstation authorization failed. Please check your password or select a verified staff role below.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid hospital email or security password. Please re-check or use quick-fill demo credentials below.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No staff record found with this email. You can register this account using the "Register New Staff" tab.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'A clinical staff profile with this email already exists. Please switch to Sign In.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address format.';
      } else if (raw && !raw.includes('Firebase: Error') && !raw.includes('https://')) {
        msg = raw;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <ClinicLogo size="md" id="staff-auth-header-logo" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">ST. JUDE CLINIC</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-950 text-teal-300 border border-teal-800/60">
                Staff EMR Gateway
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Electronic Medical Records & Clinical Governance Terminal</p>
          </div>
        </div>

        <button
          onClick={onReturnToPublic}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Return to Public Portal</span>
        </button>
      </header>

      {/* Main Authentication Card Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-xl">
          
          {/* Central Security Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            
            {/* Top Badge & Title */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck size={13} />
                  <span>Authorized Personnel Only</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {authMode === 'signin' ? 'Hospital Staff Sign In' : 'Register Clinical Staff Account'}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  {authMode === 'signin' 
                    ? 'Enter your hospital email and security password to unlock clinical records.' 
                    : 'Create a verified medical staff profile for clinical operations and triage.'}
                </p>
              </div>

              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <ClinicLogo size="lg" id="staff-auth-card-logo" />
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn size={14} />
                <span>Staff Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus size={14} />
                <span>Register New Staff</span>
              </button>
            </div>

            {/* Error & Success Feedback Alerts */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-teal-950/60 border border-teal-800/80 text-teal-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-teal-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name & Department (if Registering) */}
              {authMode === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Full Legal Name & Title *
                    </label>
                    <div className="relative">
                      <UserCheck size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Michael Vance, MD"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Hospital Role *
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="Doctor">Doctor / Physician</option>
                      <option value="Admin">Administrator / CMO</option>
                      <option value="Receptionist">Admissions Receptionist</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hospital Work Email *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@stjude.health or your email"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Workstation Password *
                  </label>
                  <span className="text-[10px] text-slate-500">Min. 6 characters</span>
                </div>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-teal-600/30 hover:shadow-teal-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Clinical Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'signin' ? 'Authenticate & Enter Staff EMR' : 'Create Account & Launch Station'}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {/* Biometric High-Security Camera Login Option */}
              {authMode === 'signin' && (
                <div className="pt-2">
                  <div className="relative flex py-1.5 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      High-Security Alternative
                    </span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBiometricModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-teal-400 hover:text-teal-300 border border-teal-500/40 hover:border-teal-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-teal-500/5 group"
                    id="staff-biometric-camera-login-btn"
                  >
                    <ScanFace size={16} className="text-teal-400 group-hover:scale-110 transition-transform" />
                    <span>Biometric Face Verification (Camera API)</span>
                  </button>
                </div>
              )}
            </form>

            {/* Quick Demo Credentials Autofill Section */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-teal-400" />
                  <span>Quick-Fill Verified Staff Roles</span>
                </span>
                <span className="text-[10px] text-slate-500">1-Click Fast Fill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_STAFF_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleQuickFill(demo)}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                        {demo.displayName}
                      </span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        demo.role === 'Admin' ? 'bg-red-950 text-red-400 border border-red-800/40' :
                        demo.role === 'Doctor' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/40' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      }`}>
                        {demo.role}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-400 font-mono truncate">
                      {demo.email}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Security Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Lock size={12} className="text-teal-500" />
              <span>TLS 256-Bit Encrypted Workstation</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-teal-500" />
              <span>HIPAA Compliance Active</span>
            </span>
            <span>•</span>
            <span>Audit Trail Enabled</span>
          </div>

        </div>
      </main>

      {/* Footer System Info */}
      <footer className="relative z-10 py-3 px-6 text-center text-[10px] text-slate-600 border-t border-slate-800/60 bg-slate-950/40">
        St. Jude Memorial Health System • Cloud EMR v4.2 • Secured with Firebase Identity Platform
      </footer>

      {/* Biometric Camera Authentication Modal */}
      <BiometricAuthModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        onBiometricSuccess={(staff) => {
          setIsBiometricModalOpen(false);
          setSuccessMessage(`Biometric Face Scan verified for ${staff.displayName} (${staff.role}). Initializing EMR...`);
          setTimeout(() => {
            onAuthSuccess(staff);
          }, 400);
        }}
        selectedStaffEmail={email}
      />
    </div>
  );
}
