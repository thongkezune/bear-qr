"use client";

import { motion } from "framer-motion";

interface SetupStep1Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export const SetupStep1 = ({ formData, updateFormData }: SetupStep1Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="mb-12 space-y-3 px-1">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-on-surface">
          Thiết lập kỉ niệm
        </h1>
        <p className="text-on-surface-variant text-lg font-light">
          Tạo không gian lưu giữ dành riêng cho bạn
        </p>
      </div>

      <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-10 shadow-2xl border border-white/5">
        <img
          className="w-full h-full object-cover opacity-60"
          alt="Vintage memory background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdB7ITz_JyD1tUXKOb-NWbaLCo8GWGDUKQs9GYciZ7Oz0dBaKZjfSL0E0b8-Y_fZbo2iKBXjusnQ3sYKo3aIgQpbT_n52MupZSdKq-Ltw40uc-U8poPTtMr0uVI1uqTjeURXG548T9oDJaJG2b1qglVACjfV0jpy0XS44pFfMBvz4XPgp7DtdjDW87OHcgKwlr4q-2SBZG2ySH2Jtbr1yOGagIlnFu0GK2UDwfzhKxItdB7QBk2dwiXIO_D9JO5OhCNe9CkdUUOzK3"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
      </div>

      <div className="space-y-6">
        <div className="group">
          <label className="block text-xs font-semibold text-on-surface-variant mb-2 tracking-widest uppercase px-1">
            Tên kỉ niệm
          </label>
          <div className="relative">
            <input
              className="w-full px-5 py-4 rounded-2xl border-none text-on-surface placeholder:text-zinc-600 focus:ring-2 focus:ring-primary/50 text-base glass-morphism outline-none transition-all"
              placeholder="Ví dụ: Kỉ niệm ngày cưới, Tặng người thương..."
              type="text"
              value={formData.title || ""}
              onChange={(e) => updateFormData({ title: e.target.value })}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500">
              edit
            </span>
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-semibold text-on-surface-variant mb-2 tracking-widest uppercase px-1">
            Mật khẩu quản trị
          </label>
          <div className="relative">
            <input
              className="w-full px-5 py-4 rounded-2xl border-none text-on-surface placeholder:text-zinc-600 focus:ring-2 focus:ring-primary/50 text-base glass-morphism outline-none transition-all"
              placeholder="Nhập mật khẩu để bảo vệ kỉ niệm"
              type="password"
              value={formData.adminPassword}
              onChange={(e) => updateFormData({ adminPassword: e.target.value })}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500">
              lock
            </span>
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-semibold text-on-surface-variant mb-2 tracking-widest uppercase px-1">
            Gợi ý về mật khẩu (Admin Hint)
          </label>
          <div className="relative">
            <input
              className="w-full px-5 py-4 rounded-2xl border-none text-on-surface placeholder:text-zinc-600 focus:ring-2 focus:ring-primary/50 text-base glass-morphism outline-none transition-all"
              placeholder="Ví dụ: Tên thú cưng đầu tiên của bạn..."
              type="text"
              value={formData.adminHint}
              onChange={(e) => updateFormData({ adminHint: e.target.value })}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500">
              help
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-secondary-container/20 px-5 py-4 rounded-3xl border border-secondary/10">
        <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-secondary">security</span>
        </div>
        <p className="text-xs text-on-secondary-container leading-relaxed font-medium">
          Mật khẩu và gợi ý này dùng để bạn quản lý kỉ niệm sau này. Hãy đặt câu hỏi gợi ý mà chỉ mình bạn biết câu trả lời.
        </p>
      </div>
    </motion.div>
  );
};
