"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function Intro({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  const [decorativeHearts, setDecorativeHearts] = useState<any[]>([]);

  useEffect(() => {
    // Generate random elements on the client side only to avoid hydration mismatch
    const hearts = [...Array(6)].map((_, i) => ({
      id: i,
      x: Math.random() * 50 - 25,
      duration: 5 + Math.random() * 5,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 20 + 10}px`
    }));
    setDecorativeHearts(hearts);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1000); // Wait for exit animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-zinc-950"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* Logo Placeholder */}
            <div className="relative mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <Heart className="h-20 w-20 text-rose-500 fill-rose-500" />
              </motion.div>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute -bottom-2 left-0 h-1 bg-rose-500 rounded-full"
              />
            </div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white"
            >
              Omemo
            </motion.h1>
            
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-2 text-zinc-500 dark:text-zinc-400 font-medium"
            >
              Ôm trọn từng ký ức
            </motion.p>
          </motion.div>

          {/* Decorative elements */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {decorativeHearts.map((heart) => (
              <motion.div
                key={heart.id}
                animate={{ 
                  y: [0, -100, 0],
                  x: [0, heart.x, 0],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ 
                  duration: heart.duration, 
                  repeat: Infinity,
                  delay: heart.id * 0.5
                }}
                className="absolute text-rose-500"
                style={{
                  left: heart.left,
                  bottom: `-10%`,
                  fontSize: heart.size
                }}
              >
                ♥
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
