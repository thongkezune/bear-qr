"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Part8_QuickAccess = () => {
  const [shortId, setShortId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = shortId.trim().toLowerCase();
    
    if (!cleanId) return;

    setError(null);
    setIsValidating(true);

    try {
      // Kiểm tra sự tồn tại của ID trong Database
      const { data, error: fetchError } = await supabase
        .from("moments")
        .select("short_id")
        .ilike("short_id", cleanId)
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        // Nếu tồn tại, mở trong tab mới
        window.open(`/m/${cleanId}`, '_blank');
        setShortId("");
      } else {
        // Nếu không tồn tại, báo lỗi
        setError("Mã số này không tồn tại trên hệ thống Omemo.");
      }
    } catch (err) {
      console.error("QuickAccess Error:", err);
      setError("Đã xảy ra lỗi khi kiểm tra mã. Vui lòng thử lại.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <section className="py-24 px-6 border-t border-white/5 bg-background relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
        <div className="space-y-4">
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black font-outfit text-white uppercase tracking-tight"
          >
            Bạn đã sở hữu <span className="text-primary">kỷ vật Omemo?</span>
          </motion.h3>
          <p className="text-zinc-500 font-be-vietnam max-w-lg mx-auto">
            Nhập mã ID định danh dưới mã QR để mở nhanh không gian ký ức của bạn trong cửa sổ mới.
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <form onSubmit={handleSearch} className="relative group">
            <motion.div
              animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <input 
                type="text" 
                placeholder="Ví dụ: bear01" 
                value={shortId}
                onChange={(e) => {
                  setShortId(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isValidating}
                className={`w-full h-16 bg-white/5 border rounded-2xl px-8 text-white font-bold tracking-widest placeholder:text-zinc-700 focus:outline-none transition-all uppercase ${
                  error ? 'border-primary/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-white/10 focus:border-primary/50'
                }`}
              />
            </motion.div>
            
            <button 
              type="submit"
              disabled={isValidating || !shortId.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              {isValidating ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 text-primary text-xs font-be-vietnam font-medium bg-primary/10 py-3 px-4 rounded-xl border border-primary/20 shadow-lg"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700">
            OMEMO PREMIUM IDENTIFICATION
          </p>
        </div>
      </div>
    </section>
  );
};
