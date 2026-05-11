"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Smartphone, Scan, Heart, Play, Sparkles, Camera, X } from "lucide-react";
import Image from "next/image";

export const Part2_InteractiveDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPhoneActive, setIsPhoneActive] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax cho ảnh gấu
  const bearY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    if (!isMounted) return;
    
    // CHỈ kích hoạt quét tự động nếu người dùng đã bấm "Dùng thử" (isPhoneActive)
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (v > 0.48 && !isScanned && isPhoneActive) {
        setIsScanned(true);
        // Delay một chút để thấy hiệu ứng Lock-on trước khi hiện video
        setTimeout(() => setShowVideo(true), 1500);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, isScanned, isMounted, isPhoneActive]);

  const startDemo = () => {
    setIsPhoneActive(true);
    setIsScanned(false);
    setShowVideo(false);
    
    // Giả lập quá trình quét sau khi hiện điện thoại
    setTimeout(() => {
      setIsScanned(true);
      setTimeout(() => setShowVideo(true), 1500);
    }, 1500);
  };

  const resetDemo = () => {
    setIsPhoneActive(false);
    setIsScanned(false);
    setShowVideo(false);
  };

  return (
    <section id="interactive-demo" ref={containerRef} className="py-20 md:py-32 px-6 md:px-24 bg-zinc-950 relative overflow-hidden min-h-fit md:min-h-[100vh] flex flex-col justify-center border-t border-white/5">
      {!isMounted ? null : (
        <>
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            
            {/* Column 1: Narrative & Trigger */}
            <div className="space-y-10 order-1">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-px w-8 bg-rose-500" />
                  <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.4em]">Interactive Experience</span>
                </motion.div>
                

                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-7xl font-black font-outfit text-white leading-[1.1] tracking-tight"
                >
                  Chạm vào <br /> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-amber-500">
                    ký ức vô hình
                  </span>
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-zinc-400 font-be-vietnam text-lg md:text-xl max-w-lg leading-relaxed"
                >
                  Mỗi kỷ vật Omemo không chỉ là gấu bông, mà là một chiếc "hộp đen" cảm xúc. Hãy thử trải nghiệm quá trình "đánh thức" ký ức ngay tại đây.
                </motion.p>
              </div>

              {/* Action Button - Desktop Only */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="hidden lg:block"
              >
                {!isPhoneActive ? (
                  <button 
                    onClick={startDemo}
                    className="group relative px-10 py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                  >
                    <Smartphone size={20} className="group-hover:rotate-12 transition-transform" />
                    <span>Dùng thử phép màu</span>
                  </button>
                ) : (
                  <button 
                    onClick={resetDemo}
                    className="px-8 py-4 border border-white/10 text-white/40 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <X size={16} />
                    <span>Đóng Demo</span>
                  </button>
                )}
              </motion.div>
            </div>

            {/* Column 2: Bear & Dynamic Phone Overlay */}
            <div className="relative order-2 flex flex-col items-center lg:items-end justify-center">
              <motion.div
                animate={{ 
                  // Mặc định: 0 (Phải)
                  // Đang quét: -20 (Lách nhẹ)
                  // Đã quét xong: -300 (Vào giữa)
                  x: isScanned 
                    ? (typeof window !== 'undefined' && window.innerWidth < 1024 ? 0 : -300) 
                    : (isPhoneActive ? -20 : 0),
                  
                  scale: isScanned ? 1.05 : 1,
                  rotate: isScanned ? 0 : -2
                }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ y: bearY }}
                className="relative rounded-[3rem] overflow-hidden border border-white/5 bg-zinc-900/20 aspect-[4/5] w-full max-w-md shadow-2xl"
              >
                <Image 
                  src="/assets/marketing/products/omemo_bear_studio.png" 
                  alt="Omemo Bear Premium Studio" 
                  fill
                  sizes="(max-width: 1024px) 100vw, 448px"
                  className="object-cover saturate-[0.8]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Visual Target Marker (Vùng mục tiêu quét) */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none">
                   <motion.div 
                     animate={{ 
                       scale: [1, 1.1, 1],
                       opacity: [0.2, 0.4, 0.2]
                     }}
                     transition={{ repeat: Infinity, duration: 3 }}
                     className="absolute inset-0 border border-white/20 rounded-3xl"
                   />
                </div>
              </motion.div>

              {/* Action Button - Mobile Only */}
              <div className="lg:hidden mt-12 w-full flex justify-center">
                {!isPhoneActive ? (
                  <button 
                    onClick={startDemo}
                    className="group relative px-10 py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-widest flex items-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-transform"
                  >
                    <Smartphone size={20} />
                    <span>Dùng thử phép màu</span>
                  </button>
                ) : (
                  <button 
                    onClick={resetDemo}
                    className="px-8 py-4 border border-white/10 text-white/40 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                  >
                    <X size={16} />
                    <span>Đóng Demo</span>
                  </button>
                )}
              </div>

              {/* THE PHONE: Only visible when isPhoneActive is true */}
              <AnimatePresence>
                {isPhoneActive && (
                  <motion.div 
                    initial={{ x: 100, opacity: 0, rotate: 10 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    exit={{ x: 100, opacity: 0, rotate: 10 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute right-0 lg:-right-10 top-1/2 -translate-y-1/2 w-[280px] h-[580px] z-50 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)]"
                  >
                    {/* iPhone Frame */}
                    <div className="relative w-full h-full p-3 rounded-[3.5rem] bg-zinc-900 border border-white/10 overflow-hidden">
                      <div className="relative w-full h-full rounded-[2.8rem] bg-black overflow-hidden flex flex-col">
                        
                        {/* Dynamic Island */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-50" />
                        
                        {/* CAMERA UI / VIDEO UI */}
                        <AnimatePresence mode="wait">
                          {!showVideo ? (
                            <motion.div 
                              key="camera"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="w-full h-full relative"
                            >
                              {/* Blur preview of the bear */}
                              <div className="absolute inset-0 grayscale opacity-40">
                                <Image 
                                  src="/assets/marketing/products/omemo_bear_studio.png" 
                                  alt="preview" 
                                  fill 
                                  sizes="280px"
                                  className="object-cover blur-sm" 
                                />
                              </div>
                              
                              {/* OMEMO App Branding */}
                              <div className="absolute top-10 left-0 right-0 flex justify-center">
                                 <span className="text-[10px] font-black text-rose-500 tracking-[0.5em] bg-black/50 px-3 py-1 rounded-full border border-rose-500/20 backdrop-blur-md">OMEMO App</span>
                              </div>

                              {/* Viewfinder Overlay */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="relative w-40 h-40">
                                  <motion.div 
                                    animate={isScanned ? { scale: [1, 1.2, 0], opacity: [1, 1, 0] } : {}}
                                    className="absolute inset-0 border-2 border-white/50 rounded-3xl"
                                  >
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-rose-500 -translate-x-1 -translate-y-1" />
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-rose-500 translate-x-1 -translate-y-1" />
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-rose-500 -translate-x-1 translate-y-1" />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-rose-500 translate-x-1 translate-y-1" />
                                  </motion.div>
                                  
                                  {!isScanned && (
                                    <motion.div 
                                      animate={{ top: ["10%", "90%", "10%"] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                      className="absolute left-2 right-2 h-0.5 bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,1)]"
                                    />
                                  )}
                                  
                                  {isScanned && (
                                    <motion.div 
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className="absolute inset-0 flex items-center justify-center text-rose-500"
                                    >
                                      <Sparkles size={48} />
                                    </motion.div>
                                  )}
                                </div>
                                <p className="mt-6 text-[10px] text-white/50 font-bold tracking-widest uppercase">{isScanned ? "Xác thực..." : "Đang quét mã QR"}</p>
                              </div>

                              {/* Camera Footer */}
                              <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8">
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40"><Camera size={18} /></div>
                                <div className="w-12 h-12 rounded-full border-4 border-white/20 p-1"><div className="w-full h-full bg-white rounded-full" /></div>
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40"><Play size={18} /></div>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="result"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="w-full h-full relative overflow-hidden"
                            >
                              <video 
                                src="https://zrixfruukcmahrokwari.supabase.co/storage/v1/object/public/assets/demo-intro.mp4" 
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                                className="w-full h-full object-cover scale-105"
                              />
                              
                              {/* New Dynamic Hearts System */}
                              <div className="absolute inset-0 pointer-events-none z-20">
                                {[...Array(25)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ 
                                      left: "50%", 
                                      top: "70%", 
                                      scale: 0, 
                                      opacity: 0 
                                    }}
                                    animate={{ 
                                      left: [
                                        "50%", 
                                        `${10 + Math.random() * 80}%`
                                      ],
                                      top: [
                                        "70%", 
                                        `${Math.random() * 60}%`
                                      ],
                                      scale: [0, 1, 0.5, 0],
                                      opacity: [0, 1, 1, 0],
                                      rotate: [0, Math.random() * 360]
                                    }}
                                    transition={{ 
                                      duration: 3 + Math.random() * 2, 
                                      delay: i * 0.15, 
                                      repeat: Infinity,
                                      ease: "easeOut"
                                    }}
                                    className="absolute"
                                  >
                                    <Heart 
                                      size={Math.random() * 20 + 10} 
                                      className="text-rose-500 fill-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]" 
                                    />
                                  </motion.div>
                                ))}
                              </div>

                              {/* OMEMO Watermark with smoother placement */}
                              <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                                <p className="text-[9px] font-black text-white/30 tracking-[0.6em] uppercase">Omemo Memories</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
