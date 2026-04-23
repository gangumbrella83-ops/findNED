import React from 'react';
import { motion } from 'motion/react';
import { Match, Report } from '../types';
import { ArrowRight, CheckCircle, XCircle, Clock, MapPin, Calendar, Tag, RefreshCw } from 'lucide-react';
import { formatDate } from '../lib/utils';

interface MatchCardProps {
  match: Match;
  lostReport?: Report;
  foundReport?: Report;
  onConfirm: () => void;
  onReject: () => void;
  key?: React.Key;
}

export function MatchCard({ match, lostReport, foundReport, onConfirm, onReject }: MatchCardProps) {
  if (!lostReport || !foundReport) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {/* Lost Report Side */}
        <div className="flex-1 p-8 bg-red-50/20">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Lost Report</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(lostReport.createdAt)}</span>
          </div>

          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white border border-red-100 overflow-hidden shrink-0">
              {lostReport.imageUrl ? (
                <img src={lostReport.imageUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50"><Tag className="text-gray-300" /></div>
              )}
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 leading-tight mb-1">{lostReport.itemName}</h4>
              <p className="text-xs text-gray-500 line-clamp-2">{lostReport.description}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-gray-600">
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-400" /> {lostReport.location}</div>
            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-red-400" /> {formatDate(lostReport.date)}</div>
          </div>
        </div>

        {/* Transition Area */}
        <div className="flex items-center justify-center p-4 bg-gray-50 relative">
          <div className="bg-white p-4 rounded-full shadow-lg border border-gray-100 z-10 text-primary">
            <RefreshCw className={`w-8 h-8 ${match.status === 'Confirmed' ? '' : 'animate-spin-slow'}`} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-full border-t-2 border-dashed border-gray-400" />
          </div>
        </div>

        {/* Found Report Side */}
        <div className="flex-1 p-8 bg-emerald-50/20">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Found Report</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(foundReport.createdAt)}</span>
          </div>

          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white border border-emerald-100 overflow-hidden shrink-0">
              {foundReport.imageUrl ? (
                <img src={foundReport.imageUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50"><Tag className="text-gray-300" /></div>
              )}
            </div>
            <div>
              <h4 className="text-xl font-black text-emerald-900 leading-tight mb-1">{foundReport.itemName}</h4>
              <p className="text-xs text-emerald-600 line-clamp-2">{foundReport.description}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-emerald-700">
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {foundReport.location}</div>
            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-400" /> {formatDate(foundReport.date)}</div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${match.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-extralight text-primary'}`}>
            {match.status === 'Confirmed' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block leading-none mb-1">Match Integrity</span>
            <span className={`font-black uppercase tracking-tight ${match.status === 'Confirmed' ? 'text-emerald-600' : 'text-primary'}`}>{match.status}</span>
          </div>
        </div>

        {match.status === 'Suggested' ? (
          <div className="flex gap-3">
            <button 
              onClick={onReject}
              className="px-6 py-3 rounded-2xl bg-white text-red-500 font-bold uppercase tracking-widest text-[10px] border border-red-100 hover:bg-red-50 transition-all flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Discard
            </button>
            <button 
              onClick={onConfirm}
              className="px-8 py-3 rounded-2xl bg-emerald-600 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Confirm Match
            </button>
          </div>
        ) : match.status === 'Confirmed' ? (
          <div className="text-emerald-700 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <CheckCircle className="w-5 h-5" />
            Verification Complete
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
