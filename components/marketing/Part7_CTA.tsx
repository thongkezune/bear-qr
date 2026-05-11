"use client";

import { motion } from "framer-motion";
import { ChevronRight, Heart } from "lucide-react";
import { MagneticButton } from "../shared/MagneticButton";
import Link from "next/link";

export const Part7_CTA = () => {
  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-[200px] px-margin-mobile md:px-margin-desktop text-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background to-surface-container-lowest"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-container/5 rounded-full blur-[120px] z-0"></div>
      
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8"
        >
          <Heart className="w-12 h-12 text-primary fill-current animate-pulse" />
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-outfit font-semibold text-on-background mb-6"
        >
          Đừng để ký ức chỉ còn trong trí nhớ
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl font-be-vietnam text-on-surface-variant mb-12 max-w-xl opacity-80 leading-relaxed"
        >
          Hãy để Omemo giúp bạn gửi gắm những yêu thương chưa ngỏ thành một món quà vô giá.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-6">
          <MagneticButton distance={0.3}>
            <Link 
              href="/contact"
              className="bg-primary text-on-primary text-lg font-semibold px-12 py-6 rounded-full btn-primary-glow flex items-center gap-3 shadow-[0_0_50px_rgba(244,63,94,0.2)] hover:shadow-[0_0_70px_rgba(244,63,94,0.4)] transition-shadow"
            >
              Liên hệ tư vấn
              <ChevronRight className="w-6 h-6" />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
};
