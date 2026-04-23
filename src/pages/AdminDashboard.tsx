import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  FileText, Clock, Link as LinkIcon, CheckCircle, UserX, AlertCircle, ChevronRight,
  BarChart3, PieChart as PieChartIcon, LayoutDashboard
} from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { Report, Match, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repRes, matchRes, userRes] = await Promise.all([
          fetch('/api/reports', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
          fetch('/api/matches', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
          fetch('/api/users', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        ]);
        const [repData, matchData, userData] = await Promise.all([
          repRes.json(), matchRes.json(), userRes.json()
        ]);
        setReports(repData);
        setMatches(matchData);
        setUsers(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Reports', value: reports.length, icon: FileText, color: 'purple' as const },
    { label: 'Pending Review', value: reports.filter(r => r.status === 'Pending').length, icon: Clock, color: 'amber' as const },
    { label: 'Confirmed Matches', value: matches.filter(m => m.status === 'Confirmed').length, icon: LinkIcon, color: 'green' as const },
    { label: 'Resolved', value: reports.filter(r => r.status === 'Resolved').length, icon: CheckCircle, color: 'blue' as const },
    { label: 'Blocked Users', value: users.filter(u => u.status === 'Blocked').length, icon: UserX, color: 'red' as const },
  ];

  const categoryData = Object.entries(
    reports.reduce((acc: any, rep) => {
      acc[rep.category] = (acc[rep.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const statusData = [
    { name: 'Pending', value: reports.filter(r => r.status === 'Pending').length },
    { name: 'Reviewing', value: reports.filter(r => r.status === 'Under Review').length },
    { name: 'Matched', value: reports.filter(r => r.status === 'Matched').length },
    { name: 'Resolved', value: reports.filter(r => r.status === 'Resolved').length },
    { name: 'Rejected', value: reports.filter(r => r.status === 'Rejected').length },
  ];

  const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#6366F1', '#EF4444'];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
            <LayoutDashboard size={16} />
            ADMIN PANEL
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Overview Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time metrics and system management for findNED.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/reports')} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-sm hover:bg-primary-dark transition-all">Manage Reports</button>
          <button onClick={() => navigate('/admin/matches')} className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Match Grid</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <StatsCard key={stat.label} {...stat} delay={i * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900">Category Distribution</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Item classification breakdown</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-extralight flex items-center justify-center text-primary">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }} 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    padding: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={40} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900">Report Status</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Completion metrics</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <PieChartIcon size={20} />
            </div>
          </div>
          <div className="h-[300px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Pending Actions</h2>
            <button onClick={() => navigate('/admin/reports')} className="text-sm font-bold text-primary hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-[13px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-5">Reported Item</th>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5 text-right pr-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reports.filter(r => r.status === 'Pending').slice(0, 5).map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 shadow-sm border border-white group-hover:scale-105 transition-transform overflow-hidden">
                          {rep.imageUrl ? <img src={rep.imageUrl} className="w-full h-full object-cover" /> : <AlertCircle className="w-4 h-4 text-slate-300" />}
                        </div>
                        <span className="font-bold text-slate-800">{rep.itemName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full",
                        rep.type === 'lost' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                      )}>
                        {rep.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-medium">{formatDate(rep.createdAt)}</td>
                    <td className="px-6 py-5 text-right pr-6">
                      <button 
                        onClick={() => navigate('/admin/reports')}
                        className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-100 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {reports.filter(r => r.status === 'Pending').length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium">Everything is in order. No pending reports.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Matches</h2>
          <div className="space-y-3">
            {matches.slice(0, 4).map((match) => (
              <div key={match.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-2xl ${match.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                    <LinkIcon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">Match Found</h4>
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{match.status} • {formatDate(match.createdAt)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/admin/matches')}
                  className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
