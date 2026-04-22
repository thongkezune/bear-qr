"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { CinematicComment } from "./CinematicComment";

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

export const DanmakuLayer = ({ messages, isEnabled, resetKey }: DanmakuLayerProps) => {
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const displayedIdsRef = useRef<Set<string>>(new Set());

  // Phát hiện thiết bị di động
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset danh sách khi resetKey thay đổi
  useEffect(() => {
    displayedIdsRef.current = new Set();
    setCurrentMessage(null);
  }, [messages, resetKey]);

  useEffect(() => {
    if (!isEnabled || !messages.length) return;

    const showNextMessage = () => {
      if (currentMessage) return;

      const availableMessages = messages.filter(m => !displayedIdsRef.current.has(m.id));
      
      if (availableMessages.length > 0) {
        const next = availableMessages[0];
        displayedIdsRef.current.add(next.id);
        setCurrentMessage(next);
      }
    };

    const interval = setInterval(() => {
      showNextMessage();
    }, 3000);

    if (!currentMessage && displayedIdsRef.current.size === 0) {
      showNextMessage();
    }

    return () => clearInterval(interval);
  }, [messages, isEnabled, currentMessage]);

  const handleMessageComplete = () => {
    setCurrentMessage(null);
  };

  if (!isEnabled) return null;

  return (
    <div className={`z-20 pointer-events-none overflow-hidden flex flex-col items-center px-4 ${
      isMobile 
        ? "relative w-full h-40 flex items-center justify-center mt-4 mb-2" 
        : "absolute inset-0 justify-end pb-[15vh] md:pb-[10vh]"
    }`}>
      <AnimatePresence mode="wait">
        {currentMessage && (
          <CinematicComment
            key={currentMessage.id}
            author={currentMessage.author}
            content={currentMessage.content}
            created_at={currentMessage.created_at}
            onComplete={handleMessageComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

