import React, { useState } from 'react';
import { Sparkles, Shield, UserCheck, ArrowRight, Lock, Mail, User as UserIcon, Building, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Role, User } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  onCancel?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@company.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<Role>('member');
  const [signupDepartment, setSignupDepartment] = useState('Enterprise Sales');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login. Please check your credentials.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: signupRole,
          department: signupDepartment
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register account.');
      }

      setSuccessMessage('Account created successfully! Logging you in...');
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    setLoginEmail(email);
    setLoginPassword(pass);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Header Section */}
        <div className="p-6 bg-slate-900 border-b border-slate-800 text-center relative">
          {onCancel && (
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Close
            </button>
          )}

          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3 shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">LeadFlow Pro CRM</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Sales Pipeline & Team Role Access</p>

          {/* Mode Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Preset Accounts */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2.5">
                  Quick Demo Access Cards
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin@company.com', 'password123')}
                    className="p-2.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left transition-colors group"
                  >
                    <div className="flex items-center space-x-1.5 text-purple-400 font-bold text-[11px] mb-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin Role</span>
                    </div>
                    <p className="text-xs font-semibold text-white group-hover:text-blue-400">Sarah Connor</p>
                    <p className="text-[10px] text-slate-500">admin@company.com</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('john@company.com', 'password123')}
                    className="p-2.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left transition-colors group"
                  >
                    <div className="flex items-center space-x-1.5 text-blue-400 font-bold text-[11px] mb-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Sales Member</span>
                    </div>
                    <p className="text-xs font-semibold text-white group-hover:text-blue-400">John Doe</p>
                    <p className="text-[10px] text-slate-500">john@company.com</p>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* --- SIGN UP FORM --- */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <select
                      value={signupDepartment}
                      onChange={(e) => setSignupDepartment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="Enterprise Sales">Enterprise Sales</option>
                      <option value="Mid-Market Sales">Mid-Market Sales</option>
                      <option value="Inbound Growth">Inbound Growth</option>
                      <option value="Sales Management">Sales Leadership</option>
                      <option value="Customer Success">Customer Success</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role Privilege</label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as Role)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="member">Sales Member</option>
                    <option value="admin">Sales Admin</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                {signupRole === 'admin' ? (
                  <p className="flex items-start gap-1.5 text-purple-300">
                    <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Admin privileges</strong>: Full authority to delete leads, assign leads to any rep, and change team roles.</span>
                  </p>
                ) : (
                  <p className="flex items-start gap-1.5 text-blue-300">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Member privileges</strong>: Manage assigned pipeline leads, update lead stage, and log internal activity notes.</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 mt-1"
              >
                {loading ? (
                  <span>Creating account...</span>
                ) : (
                  <>
                    <span>Create Account & Enter CRM</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
