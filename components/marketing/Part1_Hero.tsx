"use client";

import { useState } from "react";
import { Play, ArrowRight, X } from "lucide-react";
import { MagneticButton } from "../shared/MagneticButton";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export const Part1_Hero = () => {
  const [showIntro, setShowIntro] = useState(false);


  const openDemo = () => {
    const element = document.getElementById('interactive-demo');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <AnimatePresence>
        {!showIntro ? (
          <motion.div
            key="hero-stage"
            initial={{ opacity: 1, x: 0 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full flex items-center justify-center"
          >
            {/* Cinematic Full-frame Video Background - Now part of the sliding stage */}
            <div className="absolute inset-0 z-0">
              <div 
                className="absolute inset-0 bg-cover bg-center scale-105" 
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1lviKtvjD3MjAZA9doqzgu5vQyXSFfjfUIHJGABJEshY69CPj5sGPeD2VsLLM09P81GPAKv_-lrMStgL6cbXUYfXS1kk1HlYVF1IXaUrgWWQVAIcb5eF8ugJlE9DjJkUP9jWiZ5uaUz2AGi58JzN4r2paaOHkt1jAYlmYn5-QlhS85yEcH-2_1eD1kCns8-cUbYdjIKUHsqyFauBnm9WeHY0zwtxPkI46eEf2_8dW4JWmkJmEUiHTNEwrPDgQxF_Q7bM3ZGpB4Yo')` }}
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
              </div>
            </div>

            <div className="w-full max-w-6xl mx-auto relative z-10 px-margin-mobile md:px-margin-desktop flex flex-col items-center">
              {/* Headline and CTA Overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10 text-secondary text-xs font-semibold tracking-widest uppercase mb-6">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Hãy để Omemo
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="text-6xl md:text-8xl font-outfit font-bold text-on-background mb-8 drop-shadow-[0_0_30px_rgba(244,63,94,0.3)] text-center leading-[1.1]"
              >
                Ôm trọn từng<br/>
                <span className="text-gradient">ký ức của chúng ta</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="text-xl md:text-2xl font-be-vietnam text-on-surface-variant mb-12 max-w-2xl opacity-90 text-center leading-relaxed drop-shadow-md"
              >
                Mỗi khoảnh khắc đều xứng đáng được kể lại như một tác phẩm nghệ thuật.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6"
              >
                <MagneticButton distance={0.2}>
                  <Link 
                    href="/shop"
                    className="bg-primary-container text-on-primary-container text-lg font-bold px-10 py-5 rounded-full btn-primary-glow flex items-center gap-3 group relative overflow-hidden"
                  >
                    <span className="relative z-10">Chọn kỷ vật</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </Link>
                </MagneticButton>

                <MagneticButton distance={0.3}>
                  <button 
                    onClick={openDemo}
                    className="glass-panel text-on-surface text-lg font-semibold px-10 py-5 rounded-full border border-white/20 hover:bg-white/10 transition-all flex items-center gap-3 group"
                  >
                    <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                    <span>Xem Demo</span>
                  </button>
                </MagneticButton>
              </motion.div>
            </div>
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10" />
          </motion.div>
        ) : (
          <motion.div
            key="video-stage"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full bg-black z-50 cursor-pointer"
            onClick={() => setShowIntro(false)}
          >
            {/* Full-screen Video Player - Clean Experience */}
            <video 
              src="/assets/videos/introduction/introduction.mp4" 
              className="w-full h-full object-cover"
              autoPlay
              onEnded={() => setShowIntro(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
