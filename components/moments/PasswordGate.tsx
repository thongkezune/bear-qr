'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Key, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { hashPassword } from '@/lib/utils';

interface PasswordGateProps {
  onUnlock: (password: string) => void;
  onAdminLogin: () => void;
  viewerHint?: string;
  hashedPassword?: string;
}

export default function PasswordGate({ onUnlock, onAdminLogin, viewerHint, hashedPassword }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleUnlock = async () => {
    // So khớp mã băm mật khẩu
    if (!hashedPassword) {
      setError(true);
      return;
    }

    const inputHash = await hashPassword(password);
    if (inputHash === hashedPassword) {
      onUnlock(password);
    } else {
      setError(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 w-full max-w-md px-8 pt-20 pb-40 flex flex-col items-center"
    >
      {/* Imagery Section */}
      <div className="mb-12 relative w-full aspect-square max-w-[280px]">
        <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full scale-75" />
        <div className="w-full h-full rounded-2xl overflow-hidden bg-white/5 backdrop-blur-2xl flex items-center justify-center relative border border-white/10">
          <motion.img 
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop"
            alt="Locked memory"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-80" />
          
          {/* Lock Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-rose-300 border border-white/20"
            >
              <Lock className="w-8 h-8 fill-rose-400/20" />
            </motion.div>
          </div>
        </div>
        
        {/* Asymmetric Label Decor */}
        <div className="absolute -bottom-4 -right-4 bg-rose-500/20 backdrop-blur-xl text-rose-300 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/5 shadow-lg">
          Private Archive
        </div>
      </div>

      {/* Textual Content */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight font-outfit">
          Kỉ niệm này được bảo vệ
        </h1>
        <p className="text-zinc-400 font-be-vietnam-pro text-sm leading-relaxed max-w-[280px] mx-auto opacity-80 italic">
          Vui lòng xác thực quyền truy cập để mở lại những khoảnh khắc quý giá.
        </p>
      </div>

      {/* Input Section */}
      <div className="w-full space-y-4">
        <div className="space-y-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-rose-400/60">
              <Key className="w-5 h-5" />
            </div>
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              className={`w-full bg-white/5 border-none ring-1 ${error ? 'ring-rose-500' : 'ring-zinc-800'} focus:ring-rose-500/50 rounded-xl py-4 pl-12 pr-12 text-base text-white placeholder:text-zinc-600 font-be-vietnam-pro transition-all duration-300 backdrop-blur-md`}
              placeholder="Nhập mật khẩu truy cập"
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-rose-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 px-1 py-1"
              >
                <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
                  Mật khẩu không chính xác. Vui lòng thử lại.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Viewer Hint Toggle */}
          {viewerHint && (
            <div className="px-1">
              <button 
                onClick={() => setShowHint(!showHint)}
                className="text-[10px] text-rose-300/60 hover:text-rose-300 transition-colors uppercase tracking-widest font-bold flex items-center gap-1.5"
              >
                {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý về mật khẩu?'}
              </button>
              <AnimatePresence>
                {showHint && (
                  <motion.p 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 text-xs text-zinc-500 italic bg-white/5 p-3 rounded-lg border border-white/5"
                  >
                    Gợi ý: {viewerHint}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4">
          {/* Action Button */}
          <button 
            onClick={handleUnlock}
            className="w-full bg-gradient-to-r from-rose-400 to-rose-600 text-white font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(251,113,133,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group font-be-vietnam-pro"
          >
            <span>Mở khóa kỷ niệm</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Admin Login Shortcut - Spaced for "Swipe down" feel */}
          <div className="pt-24 w-full border-t border-white/5 flex flex-col items-center gap-4">
            <span className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-medium">Bạn là người tạo kỉ niệm?</span>
            <button 
              onClick={onAdminLogin}
              className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-rose-300 text-xs font-bold tracking-widest uppercase transition-all active:scale-[0.98] font-be-vietnam-pro"
            >
              Chế độ quản lý
            </button>
          </div>
        </div>
      </div>

      {/* Footer Aesthetic */}
      <footer className="mt-20 w-full text-center px-6 z-10 pointer-events-none opacity-40">
        <p className="text-[10px] font-medium text-zinc-500 tracking-[0.2em] uppercase">
          Mã hóa đầu cuối • Bảo mật bởi Omemo
        </p>
      </footer>
    </motion.div>
  );
}
