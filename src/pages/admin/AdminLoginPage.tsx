import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertTriangle, CheckCircle2, KeyRound } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please provide both administrator email and access credentials.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await adminLogin(email, password);
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onNavigate('/admin/dashboard');
        }, 600);
      } else {
        // Enforce required phrasing when access is denied
        setErrorMsg(result.message || 'Access denied. Administrator privileges are required.');
      }
    } catch (err: any) {
      setErrorMsg('Access denied. Administrator privileges are required.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-red-600/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-xl shadow-red-900/30 border border-red-400/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">
          CarMilan Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Authorized personnel authentication & platform governance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {errorMsg && (
            <div
              id="admin-login-error"
              className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-sm flex items-start space-x-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Authentication Failed</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-sm flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-300">Privileges Verified</p>
                <p className="mt-0.5">Redirecting to administrator console...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@carmilan.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm transition"
                  required
                />
              </div>
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-sm shadow-lg shadow-red-900/40 hover:shadow-red-800/50 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Verify Credentials & Enter Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & Audit notice */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
            <div className="flex items-start space-x-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                All administrative access attempts are cryptographically verified and recorded in the immutable audit log.
              </span>
            </div>
            <div className="text-center pt-2">
              <button
                onClick={() => onNavigate('/')}
                className="text-xs text-slate-400 hover:text-slate-200 transition underline underline-offset-4"
              >
                ← Return to Public CarMilan Platform
              </button>
            </div>
          </div>
        </div>

        {/* Provisioning guidance badge for authorized administrators */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Initial Administrator Setup: Use server CLI script <code className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">node scripts/provision-admin.js</code>
          </p>
        </div>
      </div>
    </div>
  );
};
