import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  children?: React.ReactNode;
}

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  children 
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-purple-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-purple-50"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
              <X size={20} />
            </button>
          </div>

          <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{message}</p>

          {children}

          <div className="flex gap-4 mt-8">
            <button 
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-2xl bg-gray-50 text-gray-500 font-bold hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-4 px-6 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
