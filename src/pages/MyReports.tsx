import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Filter, Search, Tag, AlertCircle } from 'lucide-react';
import { ReportCard } from '../components/ReportCard';
import { ReportModal } from '../components/ReportModal';
import { Report } from '../types';
import { cn } from '../lib/utils';

export default function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setReports(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => filter === 'all' ? true : r.type === filter);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">My Reports</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage your lost and found submissions.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
          {(['all', 'lost', 'found'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                filter === t ? "bg-primary text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report, i) => (
            <ReportCard 
              key={report.id} 
              report={report} 
              index={i} 
              onClick={() => setSelectedReport(report)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-24 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">No reports found</h3>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">
            You haven't submitted any {filter !== 'all' ? filter : ''} reports yet. Use the dashboard to report an item.
          </p>
        </div>
      )}

      <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
}
