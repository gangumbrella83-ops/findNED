import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Tag, ChevronRight } from 'lucide-react';
import { Report } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatDate, cn } from '../lib/utils';

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
  index?: number;
  key?: React.Key;
}

export const ReportCard = ({ report, onClick, index = 0 }: ReportCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="card-base group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
    >
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {report.imageUrl ? (
          <img 
            src={report.imageUrl} 
            alt={report.itemName} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 blur-0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Tag className="w-10 h-10 opacity-20" />
          </div>
        )}
        <div className="absolute top-4 left-4 z-10">
          <span className={cn(
            "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl",
            report.type === 'lost' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
          )}>
            {report.type}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <p className="text-white text-xs font-bold tracking-wider flex items-center gap-2">
            View Details <ChevronRight className="w-4 h-4" />
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg font-black text-slate-800 leading-tight tracking-tight truncate">
            {report.itemName}
          </h3>
          <StatusBadge status={report.status} />
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-slate-400">
            <Tag className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider">{report.category}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider truncate">{report.location}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Reported On</span>
            <span className="text-[11px] font-bold text-slate-600">{formatDate(report.date)}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-extralight flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
