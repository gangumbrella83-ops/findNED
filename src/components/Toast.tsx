import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '../lib/toastStore';
import { cn } from '../lib/utils';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] relative group"
          >
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white",
              toast.type === 'success' ? 'bg-emerald-500' :
              toast.type === 'error' ? 'bg-red-500' : 'bg-amber-500'
            )}>
              {toast.type === 'success' ? '✓' : '!'}
            </div>
            
            <div className="flex flex-col flex-1">
              <p className="text-xs font-bold uppercase tracking-widest">{toast.type}</p>
              <p className="text-[11px] text-slate-400 font-medium leading-tight">{toast.message}</p>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
