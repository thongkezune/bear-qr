"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  author: string;
  content: string;
  created_at?: string;
}

interface DanmakuLayerProps {
  messages: Message[];
  isEnabled: boolean;
  resetKey?: any;
}

interface FloatingMessage extends Message {
  lane: number;
  duration: number;
  startTime: number;
  targetX?: string;
  targetY?: string;
}

export const DanmakuLayer = ({ messages, isEnabled, resetKey }: DanmakuLayerProps) => {
  const [activeMessages, setActiveMessages] = useState<FloatingMessage[]>([]);
  const displayedIdsRef = useRef<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Phát hiện thiết bị di động
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset danh sách đã hiển thị khi danh sách tin nhắn thay đổi hoặc bấm Xem lại (resetKey)
  useEffect(() => {
    displayedIdsRef.current = new Set();
    setActiveMessages([]);
  }, [messages, resetKey]);

  useEffect(() => {
    if (!isEnabled || !messages.length) {
      return;
    }

    const spawnMessage = () => {
      const now = Date.now();
      const availableMessages = messages.filter((m: any) => !displayedIdsRef.current.has(m.id));
      if (availableMessages.length === 0) return;

      const nextMsg = availableMessages[0];
      const uniqueId = `${nextMsg.id}-${now}-${Math.random().toString(36).substring(2, 9)}`;
      
      const duration = 10; 
      // Luôn xuất phát ở trung tâm (50vw)
      const lane = 50;
      
      const jitterAmount = isMobile ? 8 : 12;
      const targetXOffset = (Math.random() - 0.5) * jitterAmount;
      const targetYOffset = (Math.random() - 0.5) * 8;

      const newMessage: FloatingMessage = {
        ...nextMsg,
        id: uniqueId,
        lane,
        duration,
        startTime: now,
        targetX: `${50 + targetXOffset}vw`,
        targetY: `${15 + targetYOffset}vh`
      };

      displayedIdsRef.current.add(nextMsg.id);
      setActiveMessages((prev) => [...prev, newMessage]);
    };

    const interval = setInterval(() => {
      spawnMessage();
    }, 10000); 

    if (displayedIdsRef.current.size === 0 && messages.length > 0) {
      const timer = setTimeout(() => {
        spawnMessage();
      }, 1000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }

    return () => clearInterval(interval);
  }, [messages, isEnabled, isMobile]);

  const handleAnimationComplete = (id: string) => {
    setActiveMessages((prev) => prev.filter((m) => m.id !== id));
  };

  if (!isEnabled) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden perspective-[1000px]">
      <AnimatePresence>
        {activeMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ 
              x: `${msg.lane}vw`, 
              y: "70vh",
            }}
            animate={{ 
              x: [ `${msg.lane}vw`, `${msg.lane}vw`, `${msg.lane}vw`, msg.targetX || "50vw" ], 
              y: [ "70vh", "70vh", "70vh", msg.targetY || "15vh" ],         
            }}
            transition={{ 
              duration: msg.duration, 
              ease: "easeInOut",
              times: [0, 0.1, 0.2, 1] 
            }}
            onAnimationComplete={() => handleAnimationComplete(msg.id)}
            className="absolute top-0 left-0"
          >
            {/* Nội dung được bọc kín để ổn định layout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateX: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0],               
                scale: [0.8, 1, 1, 0.1],             
                rotateX: [0, 0, 0, 30]
              }}
              transition={{ 
                duration: msg.duration, 
                ease: "easeInOut",
                times: [0, 0.1, 0.2, 1] 
              }}
              style={{ x: "-50%", y: "-50%" }}
              className="flex flex-col items-center gap-1 w-max"
            >
              <div className="flex flex-col items-center gap-3 text-center pointer-events-none group">
                <div className="px-4 py-1.5 bg-zinc-950/40 backdrop-blur-xl border border-rose-500/20 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.1)] flex items-center gap-2.5">
                  <span className="text-[11px] md:text-sm font-bold uppercase tracking-[0.2em] text-rose-700 drop-shadow-sm font-outfit whitespace-nowrap">
                    {msg.author}
                  </span>
                  {msg.created_at && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-rose-500/30" />
                      <span className="text-[10px] md:text-xs font-semibold text-rose-400/50 uppercase tracking-widest font-outfit">
                        {new Date(msg.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </>
                  )}
                </div>

                <div className="relative px-4 max-w-[75vw] md:max-w-[70vw]">
                  <span className="text-rose-400 font-bold text-lg md:text-3xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] whitespace-normal leading-tight font-outfit block py-1 tracking-tight break-words">
                    {msg.content}
                  </span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
                </div>
              </div>
              <div className="w-px h-24 bg-gradient-to-t from-transparent via-rose-500/20 to-transparent mt-4 opacity-50" />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
