import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, UserCircle, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { setAuthToken, setAuthUser } from '../lib/auth';
import { useToast } from '../lib/toastStore';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    if (searchParams.get('reason') === 'blocked') {
      setError('Your account has been blocked. Contact admin.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Admin validation
    if (identifier.includes('@') && !identifier.endsWith('@cloud.neduet.edu.pk')) {
      setError("Only @cloud.neduet.edu.pk email addresses are allowed");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      setAuthToken(data.token);
      setAuthUser(data.user);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel: App Purpose Description */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-16 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-lg">f</div>
          <span className="text-white font-display font-black text-xl tracking-tight">findNED</span>
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-6">
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            Official NEDUET Portal
          </div>
          <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight mb-8 font-display">
            Lost it? <br /> 
            <span className="text-primary font-display">Find it</span> <br /> 
            instantly.
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
            findNED is a community-driven portal designed to help students and faculty recover lost items through real-time reporting and smart matching.
          </p>
        </div>
        
        <div className="relative z-10 flex gap-12">
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white font-display">Fast</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Report in seconds</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white font-display">Secure</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Verified student-only</span>
          </div>
        </div>

        {/* Abstract background mesh */}
        <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[80px]" />
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium tracking-tight">Access your findNED account to manage reports.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-semibold"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Roll Number or Email</label>
              <div className="relative group">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. SE-24015 or admin@cloud.neduet.edu.pk"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-700 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-700 shadow-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Access Helper */}
          <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Access Guide</p>
            <div className="space-y-4">
              <button 
                onClick={() => { setIdentifier('SE-24015'); setPassword('password123'); }}
                className="w-full flex items-center justify-between group p-1"
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">Sign in as Student</p>
                  <p className="text-[10px] text-slate-400 font-medium">Use Roll Number (e.g. SE-24015)</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
              </button>
              <div className="h-px bg-slate-200/50 w-full" />
              <button 
                onClick={() => { setIdentifier('admin@cloud.neduet.edu.pk'); setPassword('admin123'); }}
                className="w-full flex items-center justify-between group p-1"
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">Sign in as Admin</p>
                  <p className="text-[10px] text-slate-400 font-medium">Use Admin Email</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-slate-500 font-medium">
              New to findNED?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
