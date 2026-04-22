"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CinematicCommentProps {
  author: string;
  content: string;
  created_at?: string;
  onComplete?: () => void;
}

export const CinematicComment = ({ author, content, created_at, onComplete }: CinematicCommentProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!content) return;
    
    let index = 0;
    setDisplayedText("");
    setIsTypingComplete(false);

    const typingInterval = setInterval(() => {
      if (index < content.length) {
        setDisplayedText(content.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
        const timeout = setTimeout(() => {
          if (onComplete) onComplete();
        }, 5000); 
        return () => clearTimeout(timeout);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [content, onComplete]);

  if (!isMounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ 
        scaleY: [1, 0.01, 0.01, 0],
        scaleX: [1, 1, 0.01, 0],
        opacity: [1, 1, 1, 0],
        filter: ["brightness(1) blur(0px)", "brightness(2) blur(2px)", "brightness(5) blur(10px)", "brightness(10) blur(20px)"],
        transition: { 
          duration: 0.8, 
          times: [0, 0.4, 0.8, 1],
          ease: "circIn"
        }
      }}
      className="relative w-full max-w-[94vw] md:max-w-[600px] bg-zinc-950/60 backdrop-blur-3xl border-t border-l border-white/5 border-b border-r border-rose-500/5 rounded-2xl p-4 md:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      {/* Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
           style={{ background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.04))", backgroundSize: "100% 4px, 3px 100%" }} />

      {/* Header: Author & Status */}
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <motion.div 
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]" 
          />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-rose-400 font-outfit">
            {author}
          </span>
        </div>
        {created_at && (
          <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest font-outfit">
            {new Date(created_at).toLocaleDateString('vi-VN')}
          </span>
        )}
      </div>

      {/* Body: Terminal Content */}
      <div className="relative z-10">
        <p className="text-zinc-100 font-be-vietnam-pro text-sm md:text-lg leading-relaxed tracking-tight break-words drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
          {displayedText}
          {!isTypingComplete && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-2 h-3.5 md:w-3 md:h-5 bg-white ml-1 align-middle shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            />
          )}
        </p>
      </div>

      {/* Small Decorative Indicator */}
      <div className="mt-3 flex justify-end opacity-20">
        <div className="h-[1px] w-6 bg-rose-500/50" />
      </div>
    </motion.div>
  );
};
