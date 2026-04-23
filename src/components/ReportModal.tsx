import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Tag, User, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { Report } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatDate, cn } from '../lib/utils';

interface ReportModalProps {
  report: Report | null;
  onClose: () => void;
  isAdmin?: boolean;
}

export const ReportModal = ({ report, onClose, isAdmin }: ReportModalProps) => {
  const [isFlagging, setIsFlagging] = useState(false);
  const [flagMessage, setFlagMessage] = useState('');

  if (!report) return null;

  const handleFlag = async () => {
    try {
      const res = await fetch('/api/notifications/flag', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ reportId: report.id, message: flagMessage }),
      });
      if (res.ok) {
        setIsFlagging(false);
        setFlagMessage('');
        alert('Report flagged! Admin will review this potential match.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10 border border-purple-50"
        >
          {/* Close button for desktop */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-slate-400 hover:text-slate-900 hidden md:flex"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="md:w-1/2 bg-slate-50 relative overflow-hidden group">
            {report.imageUrl ? (
              <img src={report.imageUrl} alt={report.itemName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-12 text-slate-200">
                <Tag className="w-24 h-24 mb-6 opacity-10" />
                <span className="font-bold uppercase tracking-[0.2em] text-[10px] opacity-30">No Preview Available</span>
              </div>
            )}
            <div className="absolute top-8 left-8 flex gap-2">
              <span className={cn(
                "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg",
                report.type === 'lost' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
              )}>
                {report.type}
              </span>
              <StatusBadge status={report.status} className="shadow-lg" />
            </div>
          </div>

          <div className="md:w-1/2 p-10 md:p-14 overflow-y-auto bg-white flex flex-col">
            <div className="mb-10">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-3">Item Report Details</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                {report.itemName}
              </h2>
              <div className="h-1.5 w-12 bg-primary-extralight rounded-full mb-6" />
              <p className="text-slate-600 font-medium leading-relaxed text-lg whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-10 gap-x-6 mb-12">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-primary" /> Category
                </p>
                <p className="font-bold text-slate-800 text-sm tracking-tight">{report.category}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Date
                </p>
                <p className="font-bold text-slate-800 text-sm tracking-tight">{formatDate(report.date)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Location
                </p>
                <p className="font-bold text-slate-800 text-sm tracking-tight">{report.location}</p>
              </div>
            </div>

            {report.rejectionReason && (
              <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-start gap-4 mb-8">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-700 mb-1 leading-none uppercase text-xs tracking-wider">Rejection Reason</h4>
                  <p className="text-red-600 text-sm font-medium">{report.rejectionReason}</p>
                </div>
              </div>
            )}

            <div className="mt-auto pt-10 border-t border-slate-100">
              {!isAdmin && report.status !== 'Resolved' && report.status !== 'Matched' && (
                <div className="space-y-4">
                  {isFlagging ? (
                    <div className="space-y-4">
                      <textarea
                        value={flagMessage}
                        onChange={(e) => setFlagMessage(e.target.value)}
                        placeholder="Provide details about why this item belongs to you..."
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium placeholder:text-slate-400 min-h-[120px] outline-none"
                      />
                      <div className="flex gap-4">
                        <button onClick={handleFlag} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-lg">Submit Claim</button>
                        <button onClick={() => setIsFlagging(false)} className="px-8 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-800 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsFlagging(true)}
                      className="w-full group flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-primary transition-all duration-500 overflow-hidden relative"
                    >
                      <div className="flex items-center gap-4 relative z-10 text-left">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary group-hover:bg-primary-dark group-hover:text-white transition-all shadow-sm">
                          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 uppercase tracking-tight group-hover:text-white transition-colors">Claim Ownership</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-primary-extralight transition-colors">Notify admin of potential match</p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-white transition-all relative z-10 translate-x-1 group-hover:translate-x-0" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
