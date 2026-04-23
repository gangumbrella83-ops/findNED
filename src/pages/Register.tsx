import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, User, Hash, School, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { setAuthToken, setAuthUser } from '../lib/auth';
import { useToast } from '../lib/toastStore';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const rollNumberRegex = /^[A-Z]{2}-\d{5}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!rollNumberRegex.test(formData.rollNumber)) {
      setError('Invalid Roll Number format. Use e.g. SE-24015');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setAuthToken(data.token);
      setAuthUser(data.user);
      addToast(`Welcome to NEDUET Portal, ${data.user.name}!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel: App Branding */}
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
            The Smartest <br /> 
            <span className="text-primary font-display">Recovery</span> <br /> 
            System.
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
            Register your student account to join the network and help the community keep the campus organized and lost-item-free.
          </p>
        </div>
        
        <div className="relative z-10 flex gap-12">
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white font-display">Secure</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Encrypted Auth</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white font-display">Simple</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Easy Reporting</span>
          </div>
        </div>

        {/* Abstract background mesh */}
        <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[80px]" />
        </div>
      </div>

      {/* Right Panel: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg py-12"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Join findNED</h1>
            <p className="text-slate-500 font-medium">Create your secure student account to start reporting items.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-semibold"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-700 shadow-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Roll Number</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-700 shadow-sm"
                  placeholder="SE-24015"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Department</label>
              <div className="relative group">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-700 shadow-sm appearance-none"
                >
                  <option value="">Select Department</option>
                  <option value="CS">Computer Science</option>
                  <option value="SE">Software Engineering</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-700 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-700 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:col-span-2 py-4 mt-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center lg:text-left">
            <p className="text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
