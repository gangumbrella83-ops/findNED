import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'purple' | 'blue' | 'green' | 'amber' | 'red';
  className?: string;
  delay?: number;
  key?: React.Key;
}

export const StatsCard = ({ label, value, icon: Icon, color, className, delay = 0 }: StatsCardProps) => {
  const valueColors = {
    purple: 'text-purple-600',
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    amber: 'text-amber-500',
    red: 'text-red-500',
  };

  const barColors = {
    purple: 'bg-purple-400',
    blue: 'bg-blue-400',
    green: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "bg-white p-6 rounded-2xl shadow-sm border border-purple-50 flex flex-col group hover:shadow-md transition-all",
        className
      )}
    >
      <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">{label}</span>
      <div className="flex items-center justify-between">
        <span className={cn("text-3xl font-bold transition-all", valueColors[color])}>{value}</span>
        <Icon className={cn("w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity", valueColors[color])} />
      </div>
      <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '60%' }} // Generic percentage for aesthetic
          className={cn("h-full rounded-full", barColors[color])}
        />
      </div>
    </motion.div>
  );
};
