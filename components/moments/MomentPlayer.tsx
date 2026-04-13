"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Download, SkipForward, Play, Loader2, AlertCircle, ShoppingCart, CheckCircle, Sparkles, MessageCircle } from "lucide-react";
import ViewerEntry from "./ViewerEntry";
import PasswordGate from "./PasswordGate";
import ViewerSuccess from "./ViewerSuccess";
import AdminLogin from "./AdminLogin";
import MemoryWall from "./MemoryWall";
import { MomentWizard } from "./MomentWizard";
import { DanmakuLayer } from "./DanmakuLayer";
import { supabase } from "@/lib/supabase";
import { AUDIO_MOODS } from "./constants";

type ViewState = "loading" | "error" | "not_found" | "entry" | "password" | "admin_login" | "admin_dashboard" | "intro" | "player" | "success";

interface MomentPlayerProps {
  momentId: string;
}

export const MomentPlayer = ({ momentId }: MomentPlayerProps) => {
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWallExpanded, setIsWallExpanded] = useState(false);
  const [momentData, setMomentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [isMediaEnded, setIsMediaEnded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [replayKey, setReplayKey] = useState(0); 
  const [isDanmakuEnabled, setIsDanmakuEnabled] = useState(true); // Mặc định bật Ký ức trôi
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);

  const transitionConfig = {
    duration: 0.4,
    ease: "circOut" as const,
  };

  // 1. Fetch dữ liệu TỐI ƯU (Gộp lệnh gọi Supabase)
  const loadMomentData = async (shouldResetState = true) => {
    try {
      if (shouldResetState) setViewState("loading");
      
      const { data: moments, error: fetchError } = await supabase
        .from("moments")
        .select("*, playlist:moment_media(*, messages:media_messages(*))")
        .eq("short_id", momentId.toLowerCase())
        .limit(1);

      if (fetchError) throw fetchError;
      const data = moments && moments.length > 0 ? moments[0] : null;

      if (!data) {
        setViewState("not_found");
        return;
      }

      const sortedPlaylist = (data.playlist || []).sort((a: any, b: any) => a.order_index - b.order_index);

      setMomentData({
        ...data,
        playlist: sortedPlaylist,
      });

      if (shouldResetState) {
        if (!data.is_activated) {
          setViewState("admin_dashboard");
        } else {
          setViewState("entry");
        }
      }
    } catch (err: any) {
      console.error("Error fetching moment:", err);
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu.");
      setViewState("error");
    }
  };

  useEffect(() => {
    if (momentId) {
      loadMomentData();
    }
  }, [momentId]);

  // 2. Intro Transition
  useEffect(() => {
    if (viewState === "intro") {
      const timer = setTimeout(() => {
        setViewState("player");
        setIsPlaying(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [viewState]);

  const handleMediaEnd = () => {
    setIsMediaEnded(true);
  };

  const replayMedia = () => {
    setReplayKey(prev => prev + 1);
    setIsMediaEnded(false);
    setIsPlaying(true);
  };

  const goToNextMedia = () => {
    if (momentData?.playlist && currentMediaIndex < momentData.playlist.length - 1) {
      setCurrentMediaIndex((prev) => prev + 1);
      setIsMediaEnded(false);
      setReplayKey(prev => prev + 1);
    } else {
      setViewState("success");
    }
  };

  const goToPrevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1);
      setIsMediaEnded(false);
      setReplayKey(prev => prev + 1);
    }
  };

  // 3. Tự động Pause/Resume video khi bật/tắt Overlay
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isMediaEnded) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => console.log("Auto-play blocked:", err));
    }
  }, [isMediaEnded]);

  // 4. Background Music Manager (Nhạc nền riệng cho từng Video/Ảnh)
  useEffect(() => {
    if (!bgAudioRef.current || !momentData?.playlist) return;
    
    const shouldPlay = ["intro", "player", "success"].includes(viewState);
    const currentMedia = momentData.playlist[currentMediaIndex] || momentData.playlist[0];
    const moodId = currentMedia?.mood || 'none';
    
    // Điều kiện dừng nhạc:
    // 1. Không ở trạng thái cần phát
    // 2. Mood là 'none'
    // 3. Media là Video và đang bị Pause hoặc End
    const isActuallyPaused = currentMedia?.type === 'video' && (isPaused || isMediaEnded);
    
    if (shouldPlay && moodId !== 'none' && !isActuallyPaused) {
      const volume = (currentMedia?.music_volume ?? 60) / 100;
      const moodData = AUDIO_MOODS.find((m: any) => m.id === moodId) || AUDIO_MOODS[0];
      
      if (bgAudioRef.current.src !== moodData.audio) {
        bgAudioRef.current.src = moodData.audio;
      }
      
      bgAudioRef.current.volume = volume;
      bgAudioRef.current.play().catch(err => console.log("Bg audio blocked:", err));
    } else {
      bgAudioRef.current.pause();
    }
  }, [viewState, currentMediaIndex, momentData, isPaused, isMediaEnded]);

  if (viewState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
        <p className="text-sm font-medium tracking-widest uppercase opacity-50 font-outfit">Đang chuẩn bị kỉ niệm...</p>
      </div>
    );
  }

  // Trang Báo lỗi / Đặt mua gấu mới (ID không tồn tại)
  if (viewState === "not_found") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-8 text-center font-outfit">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-8">
          <AlertCircle className="w-12 h-12 text-amber-500" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-4">Mã kỉ niệm chưa hợp lệ</h2>
        <p className="text-zinc-400 max-w-sm mb-12 text-lg">
          Mã số này không tồn tại trong hệ thống. Có thể mã QR bị lỗi hoặc chưa được đăng ký.
        </p>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-full max-w-md space-y-6">
          <p className="text-sm uppercase tracking-widest font-bold text-rose-400">Bạn muốn tạo kỉ niệm riêng?</p>
          <div className="text-left space-y-4">
            <h3 className="text-xl font-bold">Đặt mua BearQR ngay</h3>
            <p className="text-zinc-500 text-sm">Sở hữu ngay mẫu gấu BearQR phiên bản giới hạn để lưu giữ những khoảnh khắc chân tình nhất.</p>
          </div>
          <button className="w-full py-4 bg-white text-zinc-950 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform">
             <ShoppingCart size={18} /> Đi tới cửa hàng
          </button>
        </div>
      </div>
    );
  }

  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Đã có lỗi xảy ra</h2>
        <p className="text-zinc-400 max-w-xs mb-8">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase active:scale-95 transition-transform font-be-vietnam-pro">Thử lại</button>
      </div>
    );
  }

  const currentMedia = momentData?.playlist?.[currentMediaIndex];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-zinc-950 text-white font-be-vietnam-pro">
      <AnimatePresence mode="wait">
        {viewState === "entry" && (
          <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full h-full flex items-center justify-center px-6">
            <ViewerEntry onStart={() => setViewState(momentData.is_private ? "password" : "intro")} onAdmin={() => setViewState("admin_login")} />
          </motion.div>
        )}

        {viewState === "password" && (
          <motion.div key="password" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full h-full flex items-center justify-center px-6">
            <PasswordGate viewerHint={momentData.viewer_hint} hashedPassword={momentData.viewer_password_hash} onUnlock={() => setViewState("intro")} onAdminLogin={() => setViewState("admin_login")} />
          </motion.div>
        )}

        {viewState === "admin_login" && (
          <motion.div key="admin_login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={transitionConfig} className="w-full h-full flex items-center justify-center px-6">
            <AdminLogin 
              adminHint={momentData.admin_hint}
              hashedPassword={momentData.admin_password_hash}
              onLogin={(pw) => {
                setAdminPassword(pw);
                setViewState("admin_dashboard");
              }}
              onBack={() => setViewState(momentData.is_private ? "password" : "entry")}
            />
          </motion.div>
        )}

        {viewState === "admin_dashboard" && (
          <motion.div key="admin_wizard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={transitionConfig} className="w-full h-full">
            <MomentWizard 
              onBack={() => {
                if (momentData.is_activated) {
                  loadMomentData(false); // Cập nhật data ngầm trước khi ra ngoài
                  setViewState("entry");
                } else {
                  window.location.reload();
                }
              }} 
              initialStep={momentData.is_activated ? 2 : 1} 
              momentId={momentId} 
              adminPassword={adminPassword}
            />
          </motion.div>
        )}

        {viewState === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transitionConfig} className="flex flex-col items-center gap-6 text-center">
            <motion.h1 initial={{ letterSpacing: "0.5em", opacity: 0 }} animate={{ letterSpacing: "0.2em", opacity: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} className="text-6xl md:text-8xl font-bold text-white tracking-[0.2em] font-outfit">BearQR</motion.h1>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 1 }} className="h-px w-48 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1 }} className="text-rose-300 uppercase tracking-[0.4em] text-xs font-medium">Gói trọn chân tình</motion.p>
          </motion.div>
        )}

        {viewState === "player" && (
          <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transitionConfig} className="relative w-full h-screen flex flex-col bg-black overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src={currentMedia?.thumbnail_url || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80"} alt="Cinematic Background" className="w-full h-full object-cover opacity-40 shadow-inner blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
            </div>

            <motion.div 
              animate={{ height: isWallExpanded ? "40%" : "100%" }} 
              transition={{ duration: 0.5, ease: "circOut" }} 
              className="relative z-10 w-full flex items-center justify-center p-4 md:p-8"
            >
              <div 
                onClick={() => setIsMediaEnded(!isMediaEnded)}
                className="relative w-full h-full max-w-5xl aspect-video md:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-900/40 cursor-pointer group"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {currentMedia?.url ? (
                    currentMedia.type === "video" ? (
                      <video 
                        ref={videoRef}
                        key={`${currentMedia.id}-${replayKey}`}
                        src={currentMedia.url} 
                        autoPlay 
                        className="w-full h-full object-cover" 
                        onEnded={handleMediaEnd} 
                        onPlay={() => setIsPaused(false)}
                        onPause={() => setIsPaused(true)}
                      />
                    ) : (
                      <img 
                        key={`${currentMedia.id}-${replayKey}`}
                        src={currentMedia.url} 
                        className="w-full h-full object-cover" 
                        alt={momentData.title} 
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-zinc-500">
                      <Loader2 className="animate-spin" />
                      <span className="text-xs uppercase tracking-widest">Đang tải kỉ niệm...</span>
                    </div>
                  )}
                </div>

                {/* Danmaku Layer - Tin nhắn trôi */}
                <DanmakuLayer 
                  messages={currentMedia?.messages || []} 
                  isEnabled={isDanmakuEnabled && !isMediaEnded && isPlaying} 
                  resetKey={replayKey}
                />

                {/* Video Playback Overlay */}
                <AnimatePresence>
                  {isMediaEnded && (
                    <motion.div 
                      key="overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 bg-black/70 backdrop-blur-md flex items-center justify-center px-4"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-lg w-full">
                        {/* 1. Trước đó */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); goToPrevMedia(); }}
                          disabled={currentMediaIndex === 0}
                          className={`flex flex-col items-center gap-3 group transition-transform active:scale-95 ${currentMediaIndex === 0 ? 'opacity-20 pointer-events-none' : ''}`}
                        >
                          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-rose-500/20 group-hover:border-rose-500/40 transition-colors">
                             <SkipForward size={20} className="text-white fill-white rotate-180" />
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white">Trước đó</span>
                        </button>

                        {/* 2. Xem lại */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); replayMedia(); }}
                          className="flex flex-col items-center gap-3 group transition-transform active:scale-95"
                        >
                          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-rose-500/20 group-hover:border-rose-500/40 transition-colors">
                            <Play size={20} className="text-white fill-white ml-0.5 rotate-180" /> 
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white">Xem lại</span>
                        </button>

                        {/* 3. Tiếp theo */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); goToNextMedia(); }}
                          className="flex flex-col items-center gap-3 group transition-transform active:scale-95"
                        >
                          <div className="w-14 h-14 rounded-full bg-rose-500 border border-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                            <SkipForward size={20} className="text-zinc-950 fill-zinc-950" />
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-rose-400 group-hover:text-rose-400">Tiếp theo</span>
                        </button>

                        {/* 4. Hoàn thành */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewState("success"); }}
                          className="flex flex-col items-center gap-3 group transition-transform active:scale-95"
                        >
                          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-rose-500/20 group-hover:border-rose-500/40 transition-colors">
                            <CheckCircle size={20} className="text-white" />
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white">Kết thúc</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>


                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 pt-20 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none">
                  <div className="flex justify-between items-end mb-3">
                    <div className="space-y-1.5 flex-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-rose-400/80">Nội dung {currentMediaIndex + 1} / {momentData?.playlist?.length || 1}</span>
                      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight font-outfit pt-2">
                        {currentMedia?.title_memory || momentData?.title || "Kỉ niệm vô giá"}
                      </h2>
                    </div>
                  </div>
                  {/* Progress Bar - Chỉ dành cho video */}
                  {currentMedia?.type === "video" && (
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        key={`${currentMedia?.id}-${replayKey}`}
                        initial={{ width: 0 }} 
                        animate={{ width: (isPlaying && !isMediaEnded) ? "100%" : 0 }} 
                        transition={{ duration: 999999, ease: "linear" }} 
                        className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Sidebar - Thuận tay cái bên phải */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDanmakuEnabled(!isDanmakuEnabled)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all shadow-xl ${
                  isDanmakuEnabled 
                    ? "bg-rose-500 border-rose-400 text-white shadow-rose-500/20" 
                    : "bg-zinc-900/40 border-white/10 text-zinc-500"
                }`}
              >
                <div className="relative">
                  <Sparkles size={20} className={isDanmakuEnabled ? "fill-white" : ""} />
                  {isDanmakuEnabled && (
                    <motion.div 
                      layoutId="active-dot" 
                      className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border border-rose-500"
                    />
                  )}
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsWallExpanded(!isWallExpanded)}
                className="w-12 h-12 rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center shadow-xl hover:bg-white/5"
              >
                 <MessageCircle size={20} />
              </motion.button>
            </div>

            <motion.div animate={{ height: isWallExpanded ? "60%" : "100px", backgroundColor: isWallExpanded ? "rgba(9, 9, 11, 0.98)" : "rgba(9, 9, 11, 0.2)" }} className="relative z-20 w-full backdrop-blur-3xl border-t border-white/10 rounded-t-[2.5rem] overflow-hidden">
              <div onClick={() => setIsWallExpanded(!isWallExpanded)} className="w-full p-6 flex flex-col items-center cursor-pointer">
                <div className="w-12 h-1 bg-white/20 rounded-full mb-4" />
                <div className="flex items-center justify-between w-full max-w-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400"><Heart size={14} className={isWallExpanded ? "fill-rose-400" : ""} /></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{isWallExpanded ? "Lời nhắn dành riêng cho khoảnh khắc này" : "Bấm để xem lời nhắn"}</span>
                  </div>
                  <motion.span animate={{ rotate: isWallExpanded ? 180 : 0 }} className="text-zinc-500"><SkipForward size={14} className="rotate-90" /></motion.span>
                </div>
              </div>
              <div className={`w-full overflow-y-auto px-6 pb-24 transition-opacity duration-300 ${isWallExpanded ? "opacity-100 h-[calc(100%-80px)]" : "opacity-0 h-0 pointer-events-none"}`}>
                <MemoryWall mediaId={currentMedia?.id} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {viewState === "success" && (
          <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={transitionConfig} className="w-full h-full overflow-y-auto custom-scrollbar bg-black">
            <div className="py-20 px-6">
              <ViewerSuccess 
                onReplay={() => { setCurrentMediaIndex(0); setViewState("player"); }} 
                onManage={() => setViewState("admin_login")} 
                momentId={momentId}
                playlist={momentData?.playlist || []}
              />
              <footer className="text-center pt-20 pb-10 opacity-30 font-be-vietnam-pro"><p className="text-[9px] tracking-[0.4em] uppercase font-light text-zinc-500">BearQR Moments . Lưu giữ chân tình</p></footer>
            </div>
          </motion.div>
        )}
        {/* Background Audio Player */}
        {momentData?.mood && (
          <audio 
            ref={bgAudioRef}
            src={AUDIO_MOODS.find((m: any) => m.id === momentData.mood.toLowerCase())?.audio || AUDIO_MOODS[0].audio}
            loop 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
