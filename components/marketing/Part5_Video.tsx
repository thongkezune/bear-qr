"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Film } from "lucide-react";

const demoVideos = [
  {
    id: 1,
    title: "Trải nghiệm Omemo",
    thumbnail: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&q=80&w=1000",
    videoUrl: "/assets/videos/experience/experience.mp4",
  },
  {
    id: 2,
    title: "Chế tác thủ công",
    thumbnail: "https://images.unsplash.com/photo-1535572290543-960a8046f5af?auto=format&fit=crop&q=80&w=1000",
    videoUrl: "/assets/videos/craft/craft.mp4",
  }
];

export const Part5_Video = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenDemo = () => {
      setActiveVideo(demoVideos[0].videoUrl);
    };
    window.addEventListener('open-demo-video', handleOpenDemo);
    return () => window.removeEventListener('open-demo-video', handleOpenDemo);
  }, []);

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-[0.2em] uppercase border border-primary/20">
              TRẢI NGHIỆM THỰC TẾ
            </span>
            <h3 className="text-4xl md:text-6xl font-outfit font-semibold text-white">
              Xem cách Omemo <br/>
              <span className="text-primary italic">chạm vào cảm xúc</span>
            </h3>
          </div>
          <p className="text-zinc-500 font-be-vietnam max-w-sm mb-2">
            Khám phá những khoảnh khắc chân thực nhất khi Omemo kết nối những trái tim qua từng chú gấu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {demoVideos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="group relative aspect-video rounded-[3rem] overflow-hidden cursor-pointer shadow-2xl"
              onClick={() => setActiveVideo(video.videoUrl)}
            >
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60"
              />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_50px_rgba(244,63,94,0.5)] group-hover:scale-110 transition-all duration-500">
                  <Play size={32} fill="currentColor" />
                </div>
                <h4 className="text-2xl font-outfit font-bold text-white uppercase tracking-wider">
                  {video.title}
                </h4>
              </div>

              {/* Decorative Film Overlay */}
              <div className="absolute top-8 right-8 text-white/20">
                <Film size={24} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal Overlay */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
          >
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary transition-colors z-[110]"
            >
              <X size={24} />
            </button>

            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-zinc-900 border border-white/10"
            >
              <video 
                src={activeVideo} 
                className="w-full h-full object-contain"
                controls 
                autoPlay
              >
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
