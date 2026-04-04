"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Video, Settings, Home, CheckCircle2, ChevronRight } from "lucide-react";

interface SetupStep5Props {
  onGoToStep: (step: number) => void;
  onHome: () => void;
}

export const SetupStep5 = ({ onGoToStep, onHome }: SetupStep5Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      {/* Success Header - Compact */}
      <div className="text-center space-y-2 mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 size={32} className="text-rose-400" />
        </motion.div>
        <h2 className="text-2xl font-black tracking-tight text-white font-outfit uppercase">
          Kích hoạt thành công!
        </h2>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Main Card - Upload More */}
        <button
          onClick={() => onGoToStep(2)}
          className="col-span-2 relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-500/20 to-rose-600/5 border border-rose-500/20 p-8 flex flex-col items-start justify-between min-h-[160px] transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
            <Home size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Trang chủ</h3>
            <p className="text-rose-200/50 text-xs font-medium">Tải thêm video kỉ niệm mới</p>
          </div>
          <div className="absolute top-8 right-8 text-rose-500/30">
            <ChevronRight size={32} />
          </div>
        </button>

        {/* Shopping Card */}
        <a
          href="https://bearqr.vn/shop" 
          target="_blank"
          className="relative group overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-white/5 p-6 flex flex-col items-start justify-between min-h-[140px] transition-all hover:bg-zinc-900/80 hover:scale-[1.02] active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-2">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mua sắm</h3>
            <p className="text-zinc-600 text-[10px]">BearQR Store</p>
          </div>
        </a>

        {/* Management Card */}
        <button
          onClick={() => onGoToStep(1)}
          className="relative group overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-white/5 p-6 flex flex-col items-start justify-between min-h-[140px] transition-all hover:bg-zinc-900/80 hover:scale-[1.02] active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cài đặt</h3>
            <p className="text-zinc-600 text-[10px]">Mật khẩu & Quyền riêng tư</p>
          </div>
        </button>

        {/* Exit Action */}
        <button
          onClick={onHome}
          className="col-span-2 relative group overflow-hidden rounded-[2rem] bg-white/5 border border-white/5 p-5 flex items-center justify-center gap-3 transition-all hover:bg-white/10 active:scale-95 mt-4"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors">
            Thoát về trang xem
          </span>
        </button>
      </div>

      {/* Footer Decoration */}
      <div className="pt-6 text-center opacity-20 pointer-events-none">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">
          BearQR Premium Moment
        </p>
      </div>
    </motion.div>
  );
};
