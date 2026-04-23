import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Trash2, Eye, CheckCircle, Clock, XCircle, AlertTriangle, AlertCircle, ChevronDown, Check, Link2 } from 'lucide-react';
import { Report, ReportStatus, Match } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, cn } from '../lib/utils';
import { ReportModal } from '../components/ReportModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../lib/toastStore';

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<'lost' | 'found' | 'All'>('All');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [reportToReject, setReportToReject] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedReportForMatch, setSelectedReportForMatch] = useState<Report | null>(null);
  const [compatibleReports, setCompatibleReports] = useState<Report[]>([]);
  const { addToast } = useToast();
  const navigate = useNavigate();

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

  const handleUpdateStatus = async (id: string, status: ReportStatus, reason?: string) => {
    try {
      const res = await fetch(`/api/reports/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      if (res.ok) {
        addToast(`Report status updated to ${status}`, 'success');
        fetchReports();
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      const res = await fetch(`/api/reports/${reportToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        addToast('Report permanently deleted', 'success');
        fetchReports();
      }
    } catch (err) {
      addToast('Failed to delete report', 'error');
    }
  };

  const handleBulkStatus = async (status: ReportStatus) => {
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(`/api/reports/${id}/status`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          },
          body: JSON.stringify({ status }),
        })
      ));
      addToast(`Updated ${selectedIds.length} reports`, 'success');
      setSelectedIds([]);
      fetchReports();
    } catch (err) {
      addToast('Bulk update failed', 'error');
    }
  };

  const handleCreateMatch = async (otherId: string) => {
    if (!selectedReportForMatch) return;
    try {
      const lostId = selectedReportForMatch.type === 'lost' ? selectedReportForMatch.id : otherId;
      const foundId = selectedReportForMatch.type === 'found' ? selectedReportForMatch.id : otherId;
      
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ lostReportId: lostId, foundReportId: foundId }),
      });
      if (res.ok) {
        addToast('Manual match suggestion created!', 'success');
        setIsMatchModalOpen(false);
        navigate('/admin/matches');
      }
    } catch (err) {
      addToast('Failed to create match', 'error');
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.itemName.toLowerCase().includes(search.toLowerCase()) || 
                         r.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesType = typeFilter === 'All' || r.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Report Repository</h1>
          <p className="text-slate-500 font-medium mt-1">Full database of campus lost and found activities.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 outline-none w-[300px] font-medium"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-[11px] font-bold uppercase tracking-wider outline-none hover:bg-slate-50 transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Reviewing</option>
            <option value="Matched">Matched</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-extralight p-4 rounded-3xl border border-primary/10 flex items-center justify-between shadow-lg shadow-primary/5"
        >
          <div className="flex items-center gap-4">
            <span className="p-2 bg-primary text-white rounded-xl text-xs font-black min-w-[2rem] text-center">{selectedIds.length}</span>
            <span className="font-bold text-primary">Items Selected</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleBulkStatus('Resolved')} className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-dark transition-all">Mark Resolved</button>
            <button onClick={() => handleBulkStatus('Under Review')} className="bg-white text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">Mark Reviewing</button>
            <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-slate-400 text-xs font-bold hover:text-slate-600">Clear</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-6 w-12">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-primary accent-primary" 
                  checked={selectedIds.length === filteredReports.length && filteredReports.length > 0}
                  onChange={(e) => setSelectedIds(e.target.checked ? filteredReports.map(r => r.id) : [])}
                />
              </th>
              <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Item Details</th>
              <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Type</th>
              <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
              <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</th>
              <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={7} className="px-6 py-10 bg-slate-50/50">&nbsp;</td></tr>)
            ) : filteredReports.map((rep) => (
              <tr key={rep.id} className="group hover:bg-primary-extralight/5 transition-colors">
                <td className="px-6 py-6">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-primary accent-primary" 
                    checked={selectedIds.includes(rep.id)}
                    onChange={() => toggleSelect(rep.id)}
                  />
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-sm border border-white group-hover:scale-105 transition-transform">
                      {rep.imageUrl ? (
                        <img src={rep.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><AlertCircle className="text-slate-300 w-6 h-6" /></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-none tracking-tight group-hover:text-primary transition-colors">{rep.itemName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(rep.createdAt)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    rep.type === 'lost' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                  }`}>
                    {rep.type}
                  </span>
                </td>
                <td className="px-6 py-6">
                  <span className="text-sm font-bold text-slate-600">#{rep.category}</span>
                </td>
                <td className="px-6 py-6">
                  <span className="text-sm font-medium text-slate-500 block truncate max-w-[200px]">{rep.location}</span>
                </td>
                <td className="px-6 py-6">
                  <StatusBadge status={rep.status} />
                </td>
                <td className="px-6 py-6 px-12">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setSelectedReport(rep)}
                      className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-200 transition-all shadow-sm"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    <button 
                      onClick={() => {
                        const oppositeType = rep.type === 'lost' ? 'found' : 'lost';
                        setSelectedReportForMatch(rep);
                        const compatible = reports.filter(r => r.type === oppositeType && r.status !== 'Rejected' && r.status !== 'Resolved' && r.status !== 'Matched');
                        setCompatibleReports(compatible);
                        setIsMatchModalOpen(true);
                      }}
                      className="p-3 bg-primary-extralight text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                      title="Match Report"
                    >
                      <Link2 className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-slate-100 mx-1" />

                    <button 
                      onClick={() => handleUpdateStatus(rep.id, 'Resolved')}
                      className="p-3 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                      title="Resolve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => { setReportToReject(rep.id); setIsRejectDialogOpen(true); }}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => { setReportToDelete(rep.id); setIsDeleteDialogOpen(true); }}
                      className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredReports.length === 0 && !isLoading && (
          <div className="py-32 text-center">
            <h3 className="text-2xl font-black text-slate-200 uppercase tracking-tight">No match found in repository</h3>
            <p className="text-slate-400 font-medium mt-1">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} isAdmin />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Record?"
        message="This action is permanent and cannot be undone."
        confirmText="Flush Record"
      />

      <ConfirmDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={() => handleUpdateStatus(reportToReject!, 'Rejected', rejectionReason)}
        title="Reject Submission?"
        message="Please provide a feedback reason for the student."
        confirmText="Confirm Rejection"
      >
        <div className="mt-4">
          <textarea
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 outline-none font-medium"
          />
        </div>
      </ConfirmDialog>

      {/* Manual Match Modal */}
      <AnimatePresence>
        {isMatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsMatchModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl relative z-10 flex flex-col max-h-[85vh] border border-slate-100"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Match Selection</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Suggested matches for: <span className="font-bold text-primary">{selectedReportForMatch?.itemName}</span></p>
                </div>
                <button onClick={() => setIsMatchModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
                  <XCircle className="w-7 h-7" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-4 pr-1 scrollbar-hide py-2">
                {compatibleReports.length > 0 ? (
                  compatibleReports.map(comp => (
                    <div key={comp.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-primary transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                          {comp.imageUrl && <img src={comp.imageUrl} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 tracking-tight">{comp.itemName}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" /> {formatDate(comp.createdAt)} • {comp.location}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCreateMatch(comp.id)}
                        className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md hover:bg-primary-dark transition-all"
                      >
                        Link
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Link2 className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No compatible items found in database</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
