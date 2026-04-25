import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Tag, MapPin, Calendar, FileText, Upload, X, ArrowLeft, Send } from 'lucide-react';
import { useToast } from '../lib/toastStore';
import { useFirebase } from '../lib/FirebaseProvider';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface ReportItemProps {
  type: 'lost' | 'found';
}

export default function ReportItem({ type }: ReportItemProps) {
  const { user } = useFirebase();
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        addToast('Image size must be less than 1MB for direct database storage', 'error');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const newReportData = {
        userId: user.id,
        userName: user.name,
        type,
        ...formData,
        imageUrl: preview || undefined, // Small base64 for demo
        status: 'Pending',
        createdAt: serverTimestamp(),
      };

      const reportRef = await addDoc(collection(db, 'reports'), newReportData);
      
      // Auto-matching logic (Client-side trigger)
      const oppositeType = type === 'lost' ? 'found' : 'lost';
      const q = query(
        collection(db, 'reports'),
        where('type', '==', oppositeType),
        where('category', '==', formData.category)
      );
      
      const potentialMatches = await getDocs(q);
      for (const sameCatDoc of potentialMatches.docs) {
        // Simple name similarity or match category
        await addDoc(collection(db, 'matches'), {
          lostReportId: type === 'lost' ? reportRef.id : sameCatDoc.id,
          foundReportId: type === 'found' ? reportRef.id : sameCatDoc.id,
          status: 'Suggested',
          createdAt: serverTimestamp(),
        });
      }

      addToast(`Item reported as ${type} successfully!`, 'success');
      navigate('/my-reports');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'reports');
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'Electronics', 'Syllabus/Books', 'Personal Items', 'Cards/Wallets', 
    'Keys', 'Clothing', 'Others'
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-semibold">
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black text-gray-900 leading-tight">
              Report <span className={type === 'lost' ? 'text-red-500' : 'text-emerald-500'}>{type}</span> Item
            </h1>
            <p className="text-gray-500 mt-4 text-lg">
              Provide as many details as possible to help our administrators {type === 'lost' ? 'find' : 'return'} your item.
            </p>
          </motion.div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="flex-[2] bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6"
        >
          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Item Image (Max 5MB)</label>
            <div className="relative group">
              {preview ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary/20">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setPreview(null); }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-primary/50 hover:bg-primary-extralight/30 transition-all group">
                  <Upload className="w-12 h-12 text-gray-400 group-hover:text-primary transition-colors mb-4" />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-primary transition-colors">Click to upload photo</span>
                  <span className="text-xs text-gray-400 mt-2">JPEG or PNG format</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Item name</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="What did you {type === 'lost' ? 'lose' : 'find'}?"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl appearance-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Date {type === 'lost' ? 'Lost' : 'Found'}</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where did it happen?"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Full Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide identifiable markings, brand, colors, etc."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all active:scale-95 ${
              type === 'lost' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Submit {type} Report
                <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
