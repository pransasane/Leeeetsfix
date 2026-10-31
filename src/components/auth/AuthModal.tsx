import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, MapPin, Phone, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { AuthService, DEMO_CITIZENS } from '../../services/authService';
import { SupabaseAuthService } from '../../services/supabaseAuthService';
import { CitizenUser } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: CitizenUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'login', onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupWard, setSignupWard] = useState('Ward 12 - Metro Central');
  const [signupPhone, setSignupPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) { setMode(initialMode); setError(null); }
  }, [isOpen, initialMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getAuthErrorMessage = (err: unknown, action: 'login' | 'signup') => {
    const message = err instanceof Error ? err.message : '';
    const normalized = message.toLowerCase();
    if (normalized.includes('rate limit') || normalized.includes('too many requests') || normalized.includes('over_email_send_rate_limit')) {
      return 'Email service is temporarily rate-limited. Please wait a few minutes and try again. Your account may already have been created; do not register repeatedly with the same email.';
    }
    if (action === 'login') {
      if (normalized.includes('invalid login credentials') || normalized.includes('user not found') || normalized.includes('email not found')) {
        return 'Email not found or password is incorrect. Please check your details or register first.';
      }
      if (normalized.includes('email not confirmed')) {
        return 'This account was created but the email is not confirmed. Please confirm it before signing in.';
      }
      return message || 'Unable to sign in. Please check your email and password.';
    }
    if (normalized.includes('user already registered') || normalized.includes('already been registered') || normalized.includes('already exists')) {
      return 'This email is already registered. Please log in.';
    }
    return message || 'Registration failed. Please try again.';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!loginEmail.trim() || !loginPassword) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const user = isSupabaseConfigured
        ? await SupabaseAuthService.login(loginEmail, loginPassword)
        : AuthService.login(loginEmail, loginPassword).user;
      if (!user) throw new Error('Failed to authenticate. Please check your credentials.');
      onSuccess(user); onClose();
    } catch (err) { setError(getAuthErrorMessage(err, 'login')); }
    finally { setLoading(false); }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!signupName.trim()) { setError('Please enter your full name.'); return; }
    if (!signupEmail.trim() || !signupEmail.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (signupPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!agreedToTerms) { setError('Please accept the civic community guidelines.'); return; }
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const result = await SupabaseAuthService.signup({ name: signupName, email: signupEmail, password: signupPassword, ward: signupWard, phone: signupPhone });
        if (result.needsEmailConfirmation) {
          setError('Account created. Please confirm your email before signing in.');
          setMode('login');
          setLoginEmail(signupEmail.trim().toLowerCase());
          setLoginPassword('');
          return;
        }
        onSuccess(result.user); onClose();
      } else {
        const res = AuthService.signup({ name: signupName, email: signupEmail, password: signupPassword, ward: signupWard, phone: signupPhone });
        if (!res.success || !res.user) throw new Error(res.error || 'Registration failed.');
        onSuccess(res.user); onClose();
      }
    } catch (err) { setError(getAuthErrorMessage(err, 'signup')); }
    finally { setLoading(false); }
  };

  const handleSelectDemoUser = (demoId: string) => {
    setError(null); setLoading(true);
    const user = AuthService.loginAsDemo(demoId);
    setLoading(false);
    if (user) { onSuccess(user); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-6 py-5 relative">
          <button onClick={onClose} aria-label="Close dialog" className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"><X className="w-5 h-5" /></button>
          <div className="flex items-center gap-2 mb-1.5"><span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" /><span className="text-[11px] font-bold tracking-widest uppercase text-teal-400">Let'sFix Citizen Network</span></div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{mode === 'login' ? 'Citizen Sign In' : 'Create Citizen Account'}</h2>
          <p className="text-xs text-slate-300 mt-0.5">{mode === 'login' ? 'Log in to track your grievances and municipal updates.' : 'Join fellow residents in improving civic infrastructure.'}</p>
        </div>
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button type="button" onClick={() => { setMode('login'); setError(null); }} className={`py-2 rounded-xl cursor-pointer ${mode === 'login' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80' : 'text-slate-500'}`}>Log In</button>
          <button type="button" onClick={() => { setMode('signup'); setError(null); }} className={`py-2 rounded-xl cursor-pointer ${mode === 'signup' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80' : 'text-slate-500'}`}>Sign Up</button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 text-rose-500" /><span>{error}</span></div>}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div><label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label><div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" /><input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" /></div></div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1">Password</label><div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" /><input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" /></div></div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl disabled:opacity-60">{loading ? 'Authenticating...' : 'Sign In'}</button>
              {!isSupabaseConfigured && <div className="pt-3 border-t border-slate-100"><span className="text-[11px] font-bold text-slate-500 uppercase block mb-2">Demo Login</span><div className="grid grid-cols-2 gap-2">{DEMO_CITIZENS.slice(0, 2).map(c => <button key={c.id} type="button" onClick={() => handleSelectDemoUser(c.id)} className="p-2 border rounded-xl text-left text-[11px] font-bold">{c.name}</button>)}</div></div>}
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div><label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label><input required value={signupName} onChange={e => setSignupName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" /></div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1">Email</label><input required type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" /></div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1">Password</label><input required minLength={6} type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" /></div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1">Ward</label><input value={signupWard} onChange={e => setSignupWard(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" /></div>
              <div><label className="block text-xs font-semibold text-slate-700 mb-1">Phone (optional)</label><input value={signupPhone} onChange={e => setSignupPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" /></div>
              <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} /> I accept the civic community guidelines.</label>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl disabled:opacity-60">{loading ? 'Creating account...' : 'Create Account'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
