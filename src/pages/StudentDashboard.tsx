import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlusCircle, Search, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useFirebase } from '../lib/FirebaseProvider';
import { StatsCard } from '../components/StatsCard';
import { Report } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, cn } from '../lib/utils';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export default function StudentDashboard() {
  const { user } = useFirebase();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reports'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(reportsData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reports');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const stats = [
    { label: 'Total Reports', value: reports.length, icon: Clock, color: 'purple' as const },
    { label: 'Pending', value: reports.filter(r => r.status === 'Pending').length, icon: Clock, color: 'amber' as const },
    { label: 'Matched', value: reports.filter(r => r.status === 'Matched').length, icon: RefreshCw, color: 'green' as const },
    { label: 'Resolved', value: reports.filter(r => r.status === 'Resolved').length, icon: PlusCircle, color: 'blue' as const },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-primary rounded-[2.5rem] p-10 md:p-14 text-white shadow-xl overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-none">Welcome back, {user?.name}!</h1>
          <p className="text-primary-extralight text-lg font-medium opacity-90 leading-relaxed mb-10">
            {user?.rollNumber} • {user?.department} Department
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/report-lost" className="px-6 py-3 bg-white text-primary rounded-xl font-bold shadow-sm hover:shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Report Lost Item
            </Link>
            <Link to="/report-found" className="px-6 py-3 bg-primary-dark/50 backdrop-blur-sm border border-primary-light/30 text-white rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-inner">
              <Search className="w-5 h-5" />
              Report Found Item
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-primary-light/20 rounded-full -mb-16" />
        <div className="absolute -left-10 top-1/2 w-32 h-32 bg-white/5 rounded-3xl rotate-12" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatsCard key={stat.label} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Activity</h2>
            <Link to="/my-reports" className="text-sm font-bold text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-[11px] uppercase font-bold tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date Reported</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i}>
                        <td colSpan={4} className="px-6 py-4 h-16 bg-gray-50/50 animate-pulse" />
                      </tr>
                    ))
                  ) : reports.length > 0 ? (
                    reports.slice(0, 5).map((report) => (
                      <tr 
                        key={report.id}
                        onClick={() => navigate('/my-reports')}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group uppercase"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-sm">
                              {report.imageUrl ? (
                                <img src={report.imageUrl} className="w-full h-full object-cover" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                            <span className="font-bold text-slate-700 text-sm">{report.itemName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-[10px]">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full inline-block",
                            report.type === 'lost' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                          )}>
                            {report.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-bold text-slate-400 uppercase">{formatDate(report.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StatusBadge status={report.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium">
                        No reports found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Shortcuts</h2>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
            <button 
              onClick={() => navigate('/search')}
              className="w-full p-4 rounded-2xl border border-slate-100 hover:border-primary/30 hover:bg-primary-extralight transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-all">
                <Search className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm">Browse All</p>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Search database</p>
              </div>
            </button>

            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start gap-4">
              <RefreshCw className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Matching Active</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Real-time matching system is enabled for your reports.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
