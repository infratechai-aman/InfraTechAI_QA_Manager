import React, { useState } from 'react';
import { CheckCircle, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginView = () => {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('aman@abhyascore.com');
  const [password, setPassword] = useState('Macbook@M4');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        try {
          await login(email, password);
        } catch (loginErr) {
          // If user doesn't exist yet, try creating it automatically!
          if (
            loginErr.code === 'auth/user-not-found' || 
            loginErr.code === 'auth/invalid-credential' ||
            loginErr.message?.includes('user-not-found')
          ) {
            try {
              await signup(email, password);
              return;
            } catch (signupErr) {
              throw loginErr;
            }
          }
          throw loginErr;
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please verify your password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Switching to Sign In.');
        setIsSignUp(false);
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to authenticate. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDefault = () => {
    setEmail('aman@abhyascore.com');
    setPassword('Macbook@M4');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden font-sans">
      
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/70 rounded-3xl shadow-2xl p-8 relative z-10 animate-fadeIn text-slate-100">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-500/30 mb-3">
            <CheckCircle size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            InfratechAI QA Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Private QA Workspace & Defect Tracking
          </p>
        </div>

        {/* Credentials Pill / Quick Fill */}
        <div className="mb-6 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-400 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-indigo-300">Target Workspace User</p>
              <p className="text-[10px] text-slate-400 font-mono">aman@abhyascore.com</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDefault}
            className="px-2.5 py-1 bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Sparkles size={11} /> Auto-fill
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Create Secured Account' : 'Sign In to Workspace'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Already registered?' : 'New to this workspace?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
            >
              {isSignUp ? 'Sign In instead' : 'Create Account'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
