"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Zap, X, ShieldAlert, Loader2 } from "lucide-react";

interface StorageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOptimize: () => void;
  isOptional?: boolean;
  onConfirmOriginal?: () => void;
  usedBytes: number;
  totalBytes: number;
  newFilesSize: number;
  estimatedSize: number;
  hasLargeVideos: boolean;
  canFitAfterOptimize: boolean;
}

export const StorageLimitModal = ({
  isOpen,
  onClose,
  onConfirmOptimize,
  onConfirmOriginal,
  isOptional = false,
  usedBytes,
  totalBytes,
  newFilesSize,
  estimatedSize,
  hasLargeVideos,
  canFitAfterOptimize
}: StorageLimitModalProps) => {
  if (!isOpen) return null;

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);
  const usedMB = Number(formatSize(usedBytes));
  const totalMB = Number(formatSize(totalBytes));
  const newMB = Number(formatSize(newFilesSize));
  const estimatedMB = Number(formatSize(estimatedSize));
  const overflowMB = (usedMB + newMB - totalMB).toFixed(1);
  const afterOptimizeMB = (usedMB + estimatedMB).toFixed(1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
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
          className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Header */}
          <div className={`p-8 pb-6 bg-gradient-to-br ${canFitAfterOptimize ? 'from-amber-500/20 to-rose-500/10' : 'from-rose-500/20 to-red-500/10'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${canFitAfterOptimize ? 'bg-amber-500 text-zinc-950' : 'bg-rose-500 text-white'}`}>
                {canFitAfterOptimize ? <Zap size={28} fill="currentColor" /> : <AlertTriangle size={28} />}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} className="text-zinc-500" />
              </button>
            </div>
            
            <h3 className="text-2xl font-extrabold text-white leading-tight">
              {isOptional 
                ? "Tối ưu hóa chất lượng Video?" 
                : (canFitAfterOptimize && hasLargeVideos ? "Cơ hội tối ưu dung lượng!" : "Dung lượng kỉ niệm đã đầy")}
            </h3>
            <p className="mt-2 text-zinc-400 text-sm font-light leading-relaxed">
              {isOptional
                ? "Chúng tôi phát hiện bạn có Video 4K/2K. Nén xuống Full HD sẽ giúp xem mượt hơn và tiết kiệm chỗ cho kỉ niệm sau này."
                : (canFitAfterOptimize && hasLargeVideos 
                  ? "Dự báo cho thấy nén video 4K sẽ giúp bạn tiết kiệm đủ chỗ để tiếp tục."
                  : "Rất tiếc, các tệp bạn chọn vượt quá giới hạn 100MB của bộ nhớ kỉ niệm.")}
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Stats Box */}
            <div className="bg-zinc-950/50 rounded-3xl p-5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Trạng thái hiện tại</span>
                <span className="text-xs font-bold text-white">{usedMB.toFixed(1)}MB / {totalMB.toFixed(0)}MB</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500" 
                  style={{ width: `${Math.min(100, (usedMB / totalMB) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-zinc-400">Dung lượng tệp mới:</span>
                <span className="text-xs font-bold text-rose-400">+{newMB.toFixed(1)}MB</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <span className={`text-[10px] font-bold italic uppercase tracking-widest ${usedMB + newMB <= totalMB ? 'text-emerald-400/60' : 'text-rose-200/60'}`}>
                  {usedMB + newMB <= totalMB ? 'Dung lượng còn trống sau khi tải lên:' : 'Dung lượng vượt quá giới hạn:'}
                </span>
                <span className={`text-sm font-black ${usedMB + newMB <= totalMB ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {Math.abs(Number(overflowMB)).toFixed(1)}MB
                </span>
              </div>
            </div>

            {/* Prediction Box (Always show if large videos exist) */}
            {hasLargeVideos && (
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-amber-500" fill="currentColor" />
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Dự kiến sau nén</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-zinc-400">Tệp mới sau tối ưu:</span>
                  <div className="text-right">
                    <span className="text-zinc-600 line-through text-[10px] mr-2">+{newMB.toFixed(1)}MB</span>
                    <span className="text-sm font-bold text-amber-500">+{estimatedMB.toFixed(1)}MB</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${canFitAfterOptimize ? 'bg-amber-500' : 'bg-zinc-600'}`}
                    style={{ width: `${Math.min(100, ((usedMB + estimatedMB) / totalMB) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px]">
                   <span className="text-zinc-500 italic">Tổng dự kiến: {afterOptimizeMB}MB / {totalMB}MB</span>
                   {!canFitAfterOptimize && (
                     <span className="text-rose-500 font-bold">Vẫn cần xóa: {(usedMB + estimatedMB - 90).toFixed(1)}MB</span>
                   )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {isOptional ? (
                <>
                  <button
                    onClick={onConfirmOptimize}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 font-bold py-5 rounded-2xl shadow-xl shadow-rose-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    <Zap size={18} className="mr-2" fill="currentColor" />
                    NÉN ĐỂ XEM MƯỢT HƠN
                  </button>
                  <button
                    onClick={onConfirmOriginal}
                    className="w-full flex items-center justify-center bg-white/5 border border-white/10 text-white font-bold py-5 rounded-2xl hover:bg-white/10 active:scale-[0.98] transition-all"
                  >
                    GIỮ NGUYÊN BẢN GỐC
                  </button>
                </>
              ) : (
                <>
                  {canFitAfterOptimize && hasLargeVideos ? (
                    <button
                      onClick={onConfirmOptimize}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 font-bold py-5 rounded-2xl shadow-xl shadow-rose-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      <Zap size={18} className="mr-2" fill="currentColor" />
                      NÉN 4K VÀ TIẾP TỤC
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="w-full flex items-center justify-center bg-white/5 border border-white/10 text-white font-bold py-5 rounded-2xl hover:bg-white/10 active:scale-[0.98] transition-all"
                    >
                      {!canFitAfterOptimize && hasLargeVideos ? "DÙ NÉN VẪN KHÔNG ĐỦ CHỖ" : "HIỂU RỒI, ĐỂ TÔI XÓA BỚT"}
                    </button>
                  )}
                </>
              )}
              
              <button
                onClick={onClose}
                className="w-full py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] hover:text-white transition-colors mt-2"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
