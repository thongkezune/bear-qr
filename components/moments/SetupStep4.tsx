"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SetupStep4Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export const SetupStep4 = ({ formData, updateFormData }: SetupStep4Props) => {
  const [isPrivate, setIsPrivate] = [
    formData.isPrivate,
    (val: boolean) => updateFormData({ isPrivate: val }),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <section className="mb-12 px-1">
        <div className="inline-flex items-center justify-center bg-secondary-container/30 text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
          BƯỚC CUỐI CÙNG
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-on-surface">
          Quyền truy cập
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed max-w-md font-light">
          Bảo vệ những khoảnh khắc quý giá của bạn. Chỉ những người bạn cho phép mới có thể chạm tới kỉ niệm này.
        </p>
      </section>

      <div className="bg-surface-container-low rounded-3xl p-6 mb-8 relative overflow-hidden group shadow-xl border border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500"></div>
        
        <div className="flex items-center justify-between gap-6 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-primary text-xl">lock</span>
              <h3 className="text-lg font-bold text-on-surface">Yêu cầu mật khẩu khi xem</h3>
            </div>
            <p className="text-on-surface-variant text-xs">Người xem sẽ cần mật khẩu để mở kỉ niệm</p>
          </div>

          {/* iOS Style Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.isPrivate}
              onChange={() => updateFormData({ isPrivate: !formData.isPrivate })}
            />
            <div className="w-14 h-8 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <AnimatePresence>
          {formData.isPrivate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 pt-8 border-t border-white/5 space-y-6"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 px-1">
                  MẬT KHẨU TRUY CẬP (VIEWER)
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-highest/50 border-none rounded-2xl px-5 py-4 text-primary font-mono tracking-[0.3em] focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                    placeholder="••••••••"
                    type="password"
                    value={formData.viewerPassword}
                    onChange={(e) => updateFormData({ viewerPassword: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 px-1">
                  GỢI Ý CHO NGƯỜI NHẬN (VIEWER HINT)
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-highest/50 border-none rounded-2xl px-5 py-4 text-on-surface text-base focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                    placeholder="Ví dụ: Ngày chúng mình lần đầu gặp nhau..."
                    type="text"
                    value={formData.viewerHint}
                    onChange={(e) => updateFormData({ viewerHint: e.target.value })}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-surface-container rounded-3xl p-1 overflow-hidden shadow-2xl">
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-inner">
          <img
            className="w-full h-full object-cover brightness-50 contrast-125 transition-all duration-700"
            alt="Privacy context"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhKiIhi825mvro3fqIRZDuFBXkbYMqjST91XSrYLhl4d_-IBZC-qp2gBhRQctyXTJScDnX3YM9rhRFvmOFiklmAu0G0w1V9aG3ddZnaKB8eQhT803EckwMu_JnbyoP_X58C9WJlh5q3t22h7KH2JjZMfNDI8ntGBD-S53oQeFCHCVLxdqS_ha61ap8yVmd9Ex7zaeLjBHCplV21XvtZ5wbh4BBrNxp_ecVE7DbKvG1vNvHADxLB8mJigZL4q2QfJVGB7bnUw8W4CQv"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Privacy Shield Active
              </span>
            </div>
            <p className="text-white font-medium text-sm leading-tight italic">
              "Kỉ niệm này đã được niêm phong bởi BearQR."
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-3 glass-morphism px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <span className="material-symbols-outlined text-white text-lg font-bold">check</span>
          </div>
          <span className="text-sm font-semibold text-on-surface">Kỉ niệm đã sẵn sàng 💖</span>
        </div>
      </div>
    </motion.div>
  );
};
