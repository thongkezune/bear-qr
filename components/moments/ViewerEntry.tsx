'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

interface ViewerEntryProps {
  onStart: () => void;
  onAdmin: () => void;
}

export default function ViewerEntry({ onStart, onAdmin }: ViewerEntryProps) {
  return (
    <div className="relative z-10 flex flex-col items-center px-8 max-w-lg text-center">
      {/* Iconic Floating Element */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="mb-12 relative"
      >
        <div className="absolute inset-0 bg-rose-500/20 blur-3xl scale-150 animate-pulse pointer-events-none" />
        <div className="relative bg-white/5 backdrop-blur-2xl p-8 rounded-full border border-white/10 shadow-2xl">
          <Sparkles className="w-12 h-12 text-rose-400 fill-rose-400/20" />
        </div>
        
        {/* Floating Decorative Particles (Simulated) */}
        <div className="absolute -top-4 -right-2 w-2 h-2 bg-rose-400/40 rounded-full blur-[1px] pointer-events-none" />
        <div className="absolute bottom-4 -left-6 w-3 h-3 bg-rose-500/30 rounded-full blur-[2px] pointer-events-none" />
        <div className="absolute -bottom-8 right-8 w-1.5 h-1.5 bg-white/20 rounded-full pointer-events-none" />
      </motion.div>

      {/* Typography Stack */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="space-y-6"
      >
        <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white font-outfit">
          Bạn vừa nhận được một kỉ niệm
        </h2>
        <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-md mx-auto italic font-be-vietnam-pro">
          Một điều đặc biệt đang chờ bạn khám phá trong kho lưu trữ ánh sáng.
        </p>
      </motion.div>

      {/* Primary Action */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-16 w-full"
      >
        <div className="flex flex-col gap-4">
          <button 
            onClick={onStart}
            className="group relative w-full overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(251,113,133,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-rose-600 animate-gradient" />
            <div className="relative flex items-center justify-center gap-3 bg-zinc-950 py-5 px-10 rounded-2xl transition-all group-hover:bg-transparent">
              <span className="text-white font-bold text-lg tracking-wide uppercase font-be-vietnam-pro">
                Mở kỉ niệm
              </span>
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400/20 group-hover:fill-white group-hover:text-white transition-all" />
            </div>
          </button>

          <button 
            onClick={onAdmin}
            className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-rose-300/60 hover:text-rose-300 text-xs font-bold tracking-[0.2em] uppercase transition-all"
          >
            Chế độ quản lý
          </button>
        </div>

        {/* Secondary Hint */}
        <p className="mt-8 text-zinc-500 font-medium text-xs tracking-widest uppercase flex items-center justify-center gap-2">
          <span className="w-4 h-px bg-zinc-800" />
          <span className="w-4 h-px bg-zinc-800" />
        </p>
      </motion.div>

      {/* Footer Detail */}
      <footer className="fixed bottom-12 flex flex-col items-center gap-2 opacity-40 pointer-events-none">
        <div className="w-px h-12 bg-gradient-to-b from-rose-400/60 to-transparent" />
        <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-zinc-500">
          Lời nhắn từ quá khứ của chúng ta
        </span>
      </footer>
    </div>
  );
}
