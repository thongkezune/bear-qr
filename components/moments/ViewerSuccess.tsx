'use client';

import { motion } from 'framer-motion';
import { Heart, Share2, Download, ShoppingBag, Video, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ViewerSuccessProps {
  onReplay?: () => void;
  onManage?: () => void;
}

export default function ViewerSuccess({ onReplay, onManage }: ViewerSuccessProps) {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 flex-grow flex flex-col items-center justify-center px-8 py-20 text-center w-full max-w-2xl mx-auto"
    >
      {/* Success Celebration Icon */}
      <motion.div 
        initial={{ scale: 0.5, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="mb-12 relative"
      >
        <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full scale-110 animate-pulse" />
        <div className="relative bg-white/5 backdrop-blur-2xl p-6 rounded-full border border-white/10 shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-rose-400 fill-rose-400/10" />
        </div>
      </motion.div>

      {/* Hero Visual Section */}
      <div className="relative w-full max-w-lg mb-12 group">
        <div className="absolute -inset-4 bg-rose-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <img 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            src="https://images.unsplash.com/photo-1516589174184-c685266e430c?q=80&w=2070&auto=format&fit=crop"
            alt="Memory Ending"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
          
          {/* Floating Label */}
          <div className="absolute bottom-4 right-4 bg-rose-500/20 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-lg">
            <p className="text-[10px] uppercase tracking-widest text-rose-300 font-bold">Lưu trữ số #2024</p>
          </div>
        </div>
      </div>

      {/* Typography Stack */}
      <div className="space-y-6">
        <h2 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight leading-tight text-white">
          Kỉ niệm này <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-500">dành riêng</span> cho bạn
        </h2>
        <p className="text-lg md:text-xl font-light text-zinc-400 leading-relaxed italic font-be-vietnam-pro">
          Cảm ơn bạn đã ở đây, lắng nghe và giữ gìn những khoảnh khắc quý giá nhất.
        </p>
      </div>

      {/* Action Cards (Main CTAs) */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <button 
          onClick={onReplay}
          className="group relative bg-white/5 text-white p-[1px] rounded-2xl border border-white/10 hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
        >
          <div className="rounded-2xl p-6 flex flex-col items-start gap-3 text-left">
            <Video className="w-8 h-8 text-rose-400" />
            <div>
              <h3 className="font-bold text-lg">Xem lại video</h3>
              <p className="text-xs text-zinc-500">Sống lại những khoảnh khắc vừa rồi</p>
            </div>
          </div>
        </button>

        <button className="group relative bg-gradient-to-r from-rose-400 to-rose-600 text-white p-[1px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-rose-950/20">
          <div className="bg-zinc-950 rounded-2xl p-6 flex flex-col items-start gap-3 text-left group-hover:bg-transparent transition-all">
            <ShoppingBag className="w-8 h-8 text-rose-400 group-hover:text-white" />
            <div>
              <h3 className="font-bold text-lg">Tiếp tục mua sắm</h3>
              <p className="text-xs text-zinc-500 group-hover:text-rose-200">Khám phá bộ sưu tập BearQR</p>
            </div>
          </div>
        </button>

        <button 
          onClick={onManage}
          className="group relative bg-zinc-900 text-white p-[1px] rounded-2xl border border-white/10 hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <div className="rounded-2xl p-6 flex flex-col items-start gap-3 text-left">
            <ArrowRight className="w-8 h-8 text-rose-400" />
            <div>
              <h3 className="font-bold text-lg">Quản lý kỉ niệm</h3>
              <p className="text-xs text-zinc-500">Dành cho chính chủ sở hữu</p>
            </div>
          </div>
        </button>
      </div>

      {/* Secondary Interactions */}
      <div className="mt-12 flex items-center justify-center gap-8">
        <button className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:border-rose-500/30 transition-all">
            <Heart className="w-5 h-5 text-zinc-400 group-hover:text-rose-400 fill-transparent group-hover:fill-rose-400/20" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Thích</span>
        </button>

        <button className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:border-rose-500/30 transition-all">
            <Share2 className="w-5 h-5 text-zinc-400 group-hover:text-rose-400" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Chia sẻ</span>
        </button>

        <button className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:border-rose-500/30 transition-all">
            <Download className="w-5 h-5 text-zinc-400 group-hover:text-rose-400" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Tải về</span>
        </button>
      </div>

      {/* Semantic Ending Badge */}
      <div className="mt-20 opacity-40">
        <span className="text-[10px] tracking-[0.4em] uppercase font-medium text-zinc-500">
          The End • The Luminous Archive
        </span>
      </div>
    </motion.main>
  );
}
