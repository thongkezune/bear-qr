"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShoppingBag, ArrowRight, Loader2, AlertCircle } from "lucide-react";

interface StoreLoginProps {
  onLogin: (password: string) => void;
}

export default function StoreLogin({ onLogin }: StoreLoginProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setIsLoading(true);
    setError(null);
    
    // Giả lập delay một chút cho "sang"
    setTimeout(() => {
      onLogin(password);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 px-6 relative overflow-hidden font-be-vietnam">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-zinc-800/10 blur-[140px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12 space-y-4">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-rose-500/10 rounded-3xl mx-auto flex items-center justify-center border border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]"
          >
            <ShoppingBag size={32} className="text-rose-500" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black font-outfit uppercase tracking-tighter text-white">
              Store <span className="text-rose-500">Admin</span>
            </h1>
            <p className="text-zinc-500 text-sm font-light">Vui lòng nhập mật khẩu quản trị để truy cập kệ hàng</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-rose-500/20 blur-xl opacity-0 group-focus-within:opacity-30 transition-opacity" />
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Lock size={18} />
              </div>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu cửa hàng"
                className="w-full h-16 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-rose-500/40 outline-none transition-all shadow-inner"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-rose-500 text-xs px-4"
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={!password || isLoading}
            className="w-full h-16 bg-rose-500 hover:bg-rose-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black uppercase tracking-widest rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-rose-500/10 group overflow-hidden"
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                Tiếp tục
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-12 text-[10px] uppercase tracking-[0.3em] text-zinc-700 font-bold">
          Omemo Moments . Bảo mật đa lớp
        </p>
      </motion.div>
    </div>
  );
}
