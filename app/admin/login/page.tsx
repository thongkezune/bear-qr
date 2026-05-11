"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "omemo2024";
    
    if (key === adminKey) {
      // Lưu session vào localStorage
      localStorage.setItem("omemo_admin_session", Date.now().toString());
      localStorage.setItem("omemo_admin_key", key);
      router.push("/admin/store");
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-outfit">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-2xl">
            <Lock className="text-rose-500" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-zinc-500 text-sm">Nhập mã khóa để truy cập hệ thống quản trị Omemo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <input 
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Nhập Admin Key..."
              className={`w-full bg-white/5 border ${error ? 'border-rose-500' : 'border-white/10'} rounded-2xl px-6 py-5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 transition-all text-center tracking-[0.5em] text-xl`}
              autoFocus
            />
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-500 text-xs mt-3 text-center font-bold uppercase tracking-wider"
              >
                Mã khóa không chính xác
              </motion.p>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98]"
          >
            {loading ? "Đang xác thực..." : (
              <>
                <span>Xác nhận truy cập</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 flex items-center justify-center gap-2 text-zinc-600">
          <ShieldCheck size={14} />
          <span className="text-[10px] uppercase font-bold tracking-widest">Protected by Omemo Security</span>
        </div>
      </motion.div>
    </div>
  );
}
