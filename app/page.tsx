"use client";

import { useState } from "react";
import Intro from "@/components/shared/Intro";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Stars, Users } from "lucide-react";

export default function Home() {
  const [showContent, setShowContent] = useState(false);

  return (
    <main className="relative min-h-screen">
      {!showContent && <Intro onComplete={() => setShowContent(true)} />}

      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col"
        >
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto text-center relative z-10">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-sm font-medium mb-6 dark:bg-rose-950/30">
                  <Stars className="w-4 h-4" />
                  <span>Kỉ niệm 1 năm thành lập Omemo</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                  Đánh thức kỉ niệm qua <br />
                  <span className="text-gradient">Từng con Gấu Bông</span>
                </h1>
                
                <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10 dark:text-zinc-400">
                  Omemo không chỉ là quà tặng, đó là nơi Ôm trọn từng ký ức quý giá nhất. 
                  Quét mã, lưu khoảnh khắc, trao gửi yêu thương.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button className="h-14 px-8 rounded-full bg-rose-500 text-white font-semibold flex items-center gap-2 hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 dark:shadow-none hover:scale-105 active:scale-95">
                    Mua Gấu Ngay <ShoppingBag className="w-5 h-5" />
                  </button>
                  <button className="h-14 px-8 rounded-full border border-zinc-200 font-semibold text-zinc-600 hover:bg-zinc-50 transition-all dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900">
                    Xem Câu Chuyện
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
              <div className="absolute top-20 left-10 w-64 h-64 bg-rose-100/50 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl" />
            </div>
          </section>

          {/* Features Grid Preview */}
          <section className="py-20 px-6 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 dark:bg-rose-950/30">
                    <ArrowRight className="w-6 h-6 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Mã QR Nghệ Thuật</h3>
                  <p className="text-zinc-500 dark:text-zinc-400">Kết hợp AI để tạo ra các mã QR hình thù gấu bông độc bản và đẹp mắt.</p>
               </div>
               <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 dark:bg-rose-950/30">
                    <Stars className="w-6 h-6 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Khoảnh Khắc Số</h3>
                  <p className="text-zinc-500 dark:text-zinc-400">Lưu trữ video, hình ảnh và âm thanh chất lượng cao cho mỗi quà tặng.</p>
               </div>
               <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 dark:bg-rose-950/30">
                    <Users className="w-6 h-6 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Độc Quyền Admin</h3>
                  <p className="text-zinc-500 dark:text-zinc-400">Chủ sở hữu có toàn quyền bảo mật và quản lý thông điệp của riêng mình.</p>
               </div>
            </div>
          </section>
        </motion.div>
      )}
    </main>
  );
}
