'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowLeft, ArrowRight, CheckCircle, LogIn } from 'lucide-react';
import { hashPassword } from '@/lib/utils';

interface AdminLoginProps {
  onLogin: (password: string) => void;
  onBack: () => void;
  adminHint?: string;
  hashedPassword?: string;
}

export default function AdminLogin({ onLogin, onBack, adminHint, hashedPassword }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setIsError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const inputHash = await hashPassword(password);
      if (inputHash === hashedPassword) {
        onLogin(password);
      } else {
        setIsError(true);
        setTimeout(() => setIsError(false), 2000);
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col text-white bg-zinc-950 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-24 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
      </div>

      {/* Top Navigation Shell */}
      <header className="w-full top-0 sticky z-50 bg-zinc-950/20 flex justify-between items-center px-6 py-4 border-b border-white/5">
        <button 
          onClick={onBack}
          className="flex items-center gap-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="text-rose-400 w-5 h-5" />
          <span className="font-outfit text-xs uppercase tracking-widest text-zinc-500">Admin Access</span>
        </button>
        <div className="text-rose-400 font-bold tracking-tighter text-lg font-outfit">BearQR</div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-[420px] space-y-10"
        >
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-2">
              <Shield className="text-rose-400 w-10 h-10" fill="currentColor" fillOpacity={0.2} />
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white px-2 font-outfit">
              Quản lý ký ức của chúng ta
            </h1>
            <p className="text-zinc-400 font-medium opacity-80 text-sm">
              Đăng nhập để quản lý nội dung và thiết lập
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 px-1">
                  {isError ? <span className="text-rose-500 animate-pulse">Mật khẩu không chính xác</span> : "Mật khẩu quản lý"}
                </label>
                <div className="relative group">
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-white/5 border ${isError ? 'border-rose-500' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none`}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  <Lock className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isError ? 'text-rose-500' : 'text-zinc-600'}`} />
                </div>
                
                {/* Admin Hint */}
                {adminHint ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-3 items-start mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 shadow-inner"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="text-rose-400 w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Gợi ý từ chủ sở hữu</span>
                      <p className="text-sm text-rose-100/90 leading-relaxed italic">{adminHint}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mt-4 p-4 text-center">
                    <p className="text-[10px] text-zinc-600 italic">Không có gợi ý cho mật khẩu này</p>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-rose-400 to-rose-600 text-zinc-950 font-bold rounded-2xl shadow-lg shadow-rose-500/20 active:scale-[0.98] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Đang xác thực...' : 'Đăng nhập quản lý'}</span>
                {!isSubmitting && <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            {/* Security Note */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-[11px] text-zinc-600 font-medium">
                <CheckCircle className="w-3 h-3 text-rose-500" />
                <span>Chỉ dành cho chủ sở hữu được cấp quyền</span>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-rose-400 transition-colors text-sm font-medium group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Quay lại chế độ người xem</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer Decoration */}
      <footer className="relative bottom-0 left-0 w-full p-8 flex justify-center opacity-30 pointer-events-none">
        <div className="h-px w-full max-w-lg bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </footer>
    </div>
  );
}
