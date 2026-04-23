import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Tag, LayoutGrid, List, SlidersHorizontal, PackageOpen } from 'lucide-react';
import { ReportCard } from '../components/ReportCard';
import { ReportModal } from '../components/ReportModal';
import { Report } from '../types';
import { cn } from '../lib/utils';

export default function SearchItems() {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const categories = ['All', 'Electronics', 'Syllabus/Books', 'Personal Items', 'Cards/Wallets', 'Keys', 'Clothing', 'Others'];

  const fetchPublicReports = async () => {
    try {
      const res = await fetch('/api/reports/public');
      const data = await res.json();
      setReports(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicReports();
  }, []);

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Search Directory</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Explore all reported items across the campus.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-slate-400 text-sm uppercase tracking-widest">{filteredReports.length} Results</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, descriptions, or locations..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 font-medium"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {(['all', 'lost', 'found'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                  typeFilter === t ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:bg-white/50"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-slate-700 outline-none hover:bg-white transition-all shadow-sm"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[4/5] bg-gray-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="py-24 text-center">
          <div className="w-32 h-32 bg-primary-extralight/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <PackageOpen className="w-16 h-16 text-primary/40" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4">No Matches Found</h3>
          <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
            We couldn't find any items matching your search criteria. Try a broader search or check your spelling.
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setTypeFilter('all'); }} 
            className="mt-8 text-primary font-bold hover:underline underline-offset-8"
          >
            Clear All Filters
          </button>
        </div>
      )}

      <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
}
