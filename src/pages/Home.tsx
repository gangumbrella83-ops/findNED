import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, PlusCircle, ShieldCheck, Zap, ArrowRight, Github } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Empowering NEDUET Campus
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8 font-display">
              Recover what matters <span className="text-primary">most.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-xl leading-relaxed mb-10">
              The smartest way to find lost belongings at NED University. Seamlessly report found items and search for your missing treasures.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center gap-2 group">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all">
                Sign In
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 w-full aspect-square bg-gradient-to-br from-primary-extralight to-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden flex items-center justify-center p-12">
               <div className="grid grid-cols-2 gap-6 w-full">
                  {[
                    { icon: Search, label: "Search Items", color: "bg-blue-500" },
                    { icon: PlusCircle, label: "Fast Report", color: "bg-emerald-500" },
                    { icon: Zap, label: "Smart Match", color: "bg-amber-500" },
                    { icon: ShieldCheck, label: "Secure Auth", color: "bg-primary" }
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-lg transition-all"
                    >
                      <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                        <item.icon size={24} />
                      </div>
                      <span className="font-bold text-slate-800">{item.label}</span>
                    </motion.div>
                  ))}
               </div>
            </div>
            {/* Background dynamic blobs */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />
          </motion.div>
        </div>
      </section>

      {/* Stats/Proof Section */}
      <section className="bg-slate-50 py-24 border-y border-slate-100 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Active Users", div: "1,200+" },
              { label: "Items Found", div: "850+" },
              { label: "Recovery Rate", div: "92%" },
              { label: "Response Time", div: "< 24h" }
            ].map((stat) => (
              <div key={stat.label}>
                <h3 className="text-4xl font-black text-slate-900 mb-2 font-display">{stat.div}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white font-black text-xs">f</div>
            <span className="font-display font-black text-lg text-slate-900 tracking-tight">findNED</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-wider">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-400 font-medium">© 2026 findNED Team. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
