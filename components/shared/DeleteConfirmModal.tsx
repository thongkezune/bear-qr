"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xóa kỉ niệm này?",
  description = "Hành động này không thể hoàn tác. Nội dung này sẽ bị xóa vĩnh viễn khỏi kho lưu trữ của bạn."
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Header/Icon Section */}
          <div className="p-8 pb-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 relative">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full bg-rose-500/5"
              />
              <Trash2 size={32} className="text-rose-500 relative z-10" />
            </div>
            
            <h3 className="text-2xl font-extrabold text-white leading-tight font-outfit">
              {title}
            </h3>
            <p className="mt-3 text-zinc-500 text-sm font-light leading-relaxed">
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="p-8 pt-0 flex flex-col gap-3">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="w-full py-5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-zinc-950 font-bold text-sm shadow-xl shadow-rose-500/20 active:scale-[0.98] transition-all"
            >
              XÓA VĨNH VIỄN
            </button>
            <button
              onClick={onClose}
              className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              HỦY BỎ
            </button>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-zinc-600 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
