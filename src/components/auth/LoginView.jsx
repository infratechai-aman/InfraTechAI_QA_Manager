import React, { useState } from 'react';
import { CheckCircle, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle, UserPlus, LogIn } from 'lucide-react';
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
        await login(email, password);
      }
    } catch (err) {
      console.warn('Auth exception handled:', err);

      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password provider is not enabled yet in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method and enable "Email/Password".');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // If login failed, prompt to register or auto-try signup
        setError('Account not found with this password. Click "Create Account" below if this is your first time signing in.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please verify your password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Switching to Sign In.');
        setIsSignUp(false);
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccountDirectly = async () => {
    setError('');
    setLoading(true);
    try {
      await signup(email, password);
    } catch (err) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password provider is not enabled yet in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method and enable "Email/Password".');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Account already exists! Please click "Sign In".');
        setIsSignUp(false);
      } else {
        setError(err.message || 'Failed to create account.');
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
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl p-8 relative z-10 animate-fadeIn text-slate-100">
        
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
        <div className="mb-6 p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-indigo-400 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-indigo-300">Target Workspace User</p>
              <p className="text-[11px] text-slate-300 font-mono">aman@abhyascore.com</p>
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
          <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex flex-col gap-2 text-xs text-rose-300">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
            {error.includes('Create Account') && (
              <button
                type="button"
                onClick={handleCreateAccountDirectly}
                className="self-end px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Create Account Now →
              </button>
            )}
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

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : isSignUp ? (
                <>
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {!isSignUp && (
              <button
                type="button"
                onClick={handleCreateAccountDirectly}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={14} /> First time? Register Account
              </button>
            )}
          </div>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Already registered?' : 'Need to switch mode?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
            >
              {isSignUp ? 'Sign In instead' : 'Toggle Sign Up'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
