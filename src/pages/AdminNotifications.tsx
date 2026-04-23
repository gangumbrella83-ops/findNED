import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Trash2, AlertCircle, Eye, Inbox } from 'lucide-react';
import { Notification } from '../types';
import { formatDate } from '../lib/utils';
import { useToast } from '../lib/toastStore';
import { useNavigate } from 'react-router-dom';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setNotifications(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Notification Feed</h1>
        <p className="text-slate-500 font-medium mt-1">Live updates and student claims from the community.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-3xl animate-pulse" />)
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-6 rounded-[2rem] border transition-all flex items-center gap-6 ${
                n.read ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-primary shadow-lg shadow-primary/5'
              }`}
            >
              <div className={`p-4 rounded-2xl ${n.type === 'flag' ? 'bg-amber-50 text-amber-500 shadow-sm border border-amber-100' : 'bg-primary-extralight text-primary shadow-sm border border-primary/10'}`}>
                {n.type === 'flag' ? <AlertCircle size={24} /> : <Bell size={24} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">System Notice</span>
                  <span className="text-[10px] font-medium text-slate-400">{formatDate(n.createdAt)}</span>
                </div>
                <p className="font-bold text-slate-900 leading-relaxed truncate text-lg tracking-tight">{n.message}</p>
              </div>

              <div className="flex items-center gap-2">
                {!n.read && (
                  <button 
                    onClick={() => markAsRead(n.id)}
                    className="p-3 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm group"
                    title="Mark as Read"
                  >
                    <Check size={20} className="group-hover:scale-110 transition-transform" />
                  </button>
                )}
                {n.reportId && (
                  <button 
                    onClick={() => navigate('/admin/reports')}
                    className="p-3 bg-primary-extralight text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm group"
                    title="View Report"
                  >
                    <Eye size={20} className="group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-[3rem] border border-slate-100 p-24 text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-slate-100">
              <Inbox size={48} className="text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Inbox Empty</h3>
            <p className="text-slate-500 mt-2 font-medium">All notifications have been processed. Great work!</p>
          </div>
        )}
      </div>
    </div>
  );
}
