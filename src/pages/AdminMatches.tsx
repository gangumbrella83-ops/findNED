import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link2, LayoutGrid, List, SlidersHorizontal, PackageOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { Match, Report } from '../types';
import { MatchCard } from '../components/MatchCard';
import { cn } from '../lib/utils';
import { useToast } from '../lib/toastStore';

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Match['status'] | 'All'>('All');
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [matchRes, reportRes] = await Promise.all([
        fetch('/api/matches', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/reports', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
      ]);
      const [matchData, reportData] = await Promise.all([matchRes.json(), reportRes.json()]);
      setMatches(matchData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setReports(reportData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmMatch = async (id: string) => {
    try {
      const res = await fetch(`/api/matches/${id}/confirm`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        addToast('Match confirmed and reports updated!', 'success');
        fetchData();
      }
    } catch (err) {
      addToast('Failed to confirm match', 'error');
    }
  };

  const handleRejectMatch = async (id: string) => {
    try {
      const res = await fetch(`/api/matches/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        addToast('Match discarded', 'warning');
        fetchData();
      }
    } catch (err) {
      addToast('Failed to reject match', 'error');
    }
  };

  const filteredMatches = matches.filter(m => statusFilter === 'All' ? true : m.status === statusFilter);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Item Matches</h1>
          <p className="text-slate-500 font-medium mt-1">Cross-referencing lost and found items for verification.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {(['All', 'Suggested', 'Confirmed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                statusFilter === s ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          {[1,2].map(i => <div key={i} className="h-96 bg-slate-50 rounded-[2.5rem] animate-pulse" />)}
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="space-y-8">
          {filteredMatches.map(match => {
            const lostReport = reports.find(r => r.id === match.lostReportId);
            const foundReport = reports.find(r => r.id === match.foundReportId);
            return (
              <MatchCard 
                key={match.id}
                match={match}
                lostReport={lostReport}
                foundReport={foundReport}
                onConfirm={() => handleConfirmMatch(match.id)}
                onReject={() => handleRejectMatch(match.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 p-24 text-center shadow-xl shadow-slate-200/40">
          <div className="w-24 h-24 bg-primary-extralight rounded-full flex items-center justify-center mx-auto mb-6">
            <Link2 className="w-12 h-12 text-primary/40" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Matches Found</h3>
          <p className="text-slate-500 mt-2 font-medium">Any suggested or confirmed item matches will appear here.</p>
        </div>
      )}
    </div>
  );
}
