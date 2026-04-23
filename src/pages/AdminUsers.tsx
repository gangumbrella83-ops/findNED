import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ShieldAlert, UserX, UserCheck, Eye, Clock, Mail, Hash, School, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { formatDate, cn } from '../lib/utils';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../lib/toastStore';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const { addToast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockUser = async () => {
    if (!userToBlock) return;
    try {
      const res = await fetch(`/api/users/${userToBlock}/block`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ reason: blockReason }),
      });
      if (res.ok) {
        addToast('User has been blocked', 'warning');
        setBlockReason('');
        fetchUsers();
      }
    } catch (err) {
      addToast('Action failed', 'error');
    }
  };

  const handleUnblockUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}/unblock`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        addToast('User restored to Active state', 'success');
        fetchUsers();
      }
    } catch (err) {
      addToast('Action failed', 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Student Directory</h1>
          <p className="text-slate-500 font-medium mt-1">Manage student access and account security.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 outline-none w-[350px] font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[2.5rem] animate-pulse" />)
        ) : filteredUsers.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-3xl bg-primary-extralight flex items-center justify-center text-primary font-black text-2xl border-4 border-white shadow-sm">
                {user.name[0]}
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {user.status}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 tracking-tight">{user.name}</h3>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-bold uppercase tracking-wider">
                <Hash className="w-4 h-4 text-primary" />
                {user.rollNumber}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-bold uppercase tracking-wider">
                <School className="w-4 h-4 text-primary" />
                {user.department}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 font-medium tracking-tight">
                <Clock className="w-4 h-4" />
                Member since {formatDate(user.createdAt)}
              </div>
            </div>

            {user.status === 'Blocked' && (
              <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-wider mb-1">
                  <ShieldAlert size={14} />
                  Block Reason
                </div>
                <p className="text-xs text-red-500 font-semibold">"{user.blockReason}"</p>
              </div>
            )}

            <div className="flex gap-2">
              {user.status === 'Active' ? (
                <button 
                  onClick={() => { setUserToBlock(user.id); setIsBlockDialogOpen(true); }}
                  className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <UserX size={14} />
                  Block Access
                </button>
              ) : (
                <button 
                  onClick={() => handleUnblockUser(user.id)}
                  className="flex-1 py-3 bg-emerald-50 text-emerald-500 rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck size={14} />
                  Restore
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={isBlockDialogOpen}
        onClose={() => setIsBlockDialogOpen(false)}
        onConfirm={handleBlockUser}
        title="Block Student Access?"
        message="This will revoke portal access for this student immediately."
        confirmText="Block Student"
      >
        <div className="mt-4">
          <textarea
            required
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Enter reason for blocking..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 outline-none font-medium"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
