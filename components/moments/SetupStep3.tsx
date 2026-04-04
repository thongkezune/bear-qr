"use client";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Volume2 } from "lucide-react";

export const AUDIO_MOODS = [
  { id: "chill", name: "Chill", label: "Êm đềm", icon: "filter_drama", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQlYORel8laJ4WI6nkLzO2G5yrho4uggjuwKd0mrVxFg12tePYygCEPBqs8HSKuA7YWDSaxQQPAkccy8d23Ib2cXn95kPZbBaKhYDl2zFTs70nh9Oi97HiGuW-x9iffW-yU3pBvBQflSdxmA5uyg6KwLsnlUlvrbCA7dg3er3SDxof27rMdUYjk94hxsVIuvIgGyDDQjBrpUCCtkJRW9PCElegSiSIQKdaISbLszOIjek_g4TlKuUE61M2vag_ad-hjP2g_ieE5qr1", 
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
  { id: "romantic", name: "Lãng mạn", label: "Ngọt ngào", icon: "favorite", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3rX7zxJgZDP4WMizR-6LFCs1Y2LtKvioEEGfSJTIDItJiCX1Q5jx-8EqUMMy-8cogw5ffea1ushZQWl03d7Ktqt_GYnzuEK3756M2FwaK6KsYd7zO1xK4w4PXZ8sUNwTlg4Oc_vUmofyEVtuj5nhMqgycxfro_MFh9SRdpqOqiYl5ZFTww7iETfpfDfn2rvooUAem9yLzmSgXnTaNMZIkOovlIMdqZ_iTg02amYM755x_6v09g99VfscJSIbkqBVaCOkb-VvGrpHc", 
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" },
  { id: "happy", name: "Vui vẻ", label: "Rạng rỡ", icon: "celebration", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0aB50hMuIodjcpfmT1LWTQA4foyUUisjlJkV6fGJXBPMzaolAPhVZkVkxuxC3yUiRckaNmfYMf-mqqJiuWjs1ebi2pT-OQD6zYqAN8OKSIiIFU6dDymBNtjtEQQA7joijN9DnCPc9DMcfCnvy8TX0csIbQnAJ33sUbJ-bahF6-0IIC8Oc1pIjI3Aczr2N8bgbVbIo5pHfSL23xkD-CuWuf-LekajxAH-UMl9tVFLxITS6d3k1l8M9nVE3X1RfOIf0eu23JGnvrjdZ", 
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "memory", name: "Ký ức", label: "Hoài niệm", icon: "history_edu", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBSjg_-4bKHinA0oAql4hKl0ONOg2vKUexffT8YCtezrPSqNUJj3oN8fQXeKSM6q7ZDxXcbQrPOxt15y8Fj21gy6eBT43qxhnQm5U-3N9eGCygob0I3dGVTy3XtWSnGGDhgrv0Qi0OLr7KvjN9tbKzpYE6QjEsNUzl88XYTiKaLwW7f1NhZDj1OEbK4i2S-S2as7__XYhElb9Z6cMJQrV3GP1-KiCiNGsbBwTD5_Dxr6MvLTd3PIn0ATvF26XtlMT0l1ApBJzqpvTZ", 
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
];

interface SetupStep3Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export const SetupStep3 = ({ formData, updateFormData }: SetupStep3Props) => {
  const selectedMood = formData.mood.toLowerCase();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeMoodData = AUDIO_MOODS.find(m => m.id === selectedMood) || AUDIO_MOODS[0];

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = (formData.music_volume ?? 60) / 100;
      audioRef.current.play().catch(err => console.log("Audio play error", err));
    }
  }, [selectedMood, isPlaying, formData.music_volume]);

  const togglePreview = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch(err => console.log(err));
      setIsPlaying(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <header className="mb-12 space-y-3 px-1">
        <span className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] opacity-80">
          Giai điệu kỷ niệm
        </span>
        <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface leading-tight">
          Chọn cảm xúc
        </h1>
        <p className="text-on-surface-variant/70 text-sm font-light leading-relaxed max-w-[280px]">
          Âm nhạc là sợi dây kết nối ký ức. Hãy chọn một giai điệu để đánh thức những khoảnh khắc quý giá nhất.
        </p>
      </header>

      <div className="flex overflow-x-auto no-scrollbar gap-6 py-8 px-2 -mx-2 items-center">
        {AUDIO_MOODS.map((mood) => (
          <div
            key={mood.id}
            onClick={() => {
              updateFormData({ mood: mood.id });
              setIsPlaying(true); // Tự động phát khi chọn
            }}
            className={`flex-none rounded-3xl flex flex-col items-center justify-end p-6 relative group transition-all duration-300 cursor-pointer ${
              selectedMood === mood.id
                ? "w-52 aspect-[3/4] scale-110 bg-gradient-to-b from-primary/20 to-secondary-container/40 ring-2 ring-primary/50 shadow-2xl"
                : "w-48 aspect-[3/4] bg-surface-container-high hover:brightness-110"
            }`}
          >
            <div className={`absolute inset-0 transition-all duration-500 rounded-3xl overflow-hidden ${
              selectedMood === mood.id ? "opacity-60" : "opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40"
            }`}>
              <img
                alt={mood.name}
                className="w-full h-full object-cover"
                src={mood.image}
              />
            </div>

            {selectedMood === mood.id && (
              <div className="absolute top-4 right-4 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </div>
            )}

            <div className={`z-10 text-center w-full px-2 py-3 rounded-2xl ${
              selectedMood === mood.id ? "bg-zinc-950/60 backdrop-blur-md" : ""
            }`}>
              <span className={`material-symbols-outlined mb-1 block ${
                selectedMood === mood.id ? "text-primary" : "text-rose-200/50"
              }`}>
                {mood.icon}
              </span>
              <h3 className="text-lg font-bold text-white tracking-wide">{mood.name}</h3>
              <p className={`text-[10px] uppercase tracking-widest mt-1 font-bold ${
                selectedMood === mood.id ? "text-primary" : "text-rose-300/40"
              }`}>
                {mood.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Volume Control - Mới thêm vào theo yêu cầu */}
      <div className="mx-2 mt-12 bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4 shadow-inner backdrop-blur-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Âm lượng nhạc nền</span>
          </div>
          <span className="text-xl font-mono font-bold text-primary">{formData.music_volume ?? 60}%</span>
        </div>
        
        <div className="relative flex items-center group">
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1"
            value={formData.music_volume ?? 60}
            onChange={(e) => updateFormData({ music_volume: parseInt(e.target.value) })}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          {/* Track trang trí */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-primary rounded-l-lg pointer-events-none" 
            style={{ width: `${formData.music_volume ?? 60}%` }}
          />
        </div>
        <p className="text-[10px] text-zinc-500 font-medium italic">
          * Đây là âm lượng mặc định. Bạn vẫn có thể chỉnh riêng cho từng video ở bước trước.
        </p>
      </div>

      {/* Audio Player Element */}
      <audio 
        ref={audioRef} 
        src={activeMoodData.audio} 
        loop 
        onEnded={() => setIsPlaying(false)}
      />

      {/* Preview Player Card */}
      <div 
        onClick={togglePreview}
        className="mt-16 glass-morphism p-6 rounded-3xl border border-white/5 flex items-center gap-6 shadow-xl cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isPlaying ? 'bg-rose-500 text-white' : 'bg-primary/20 text-primary'}`}>
          <span className="material-symbols-outlined fill-1">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-primary/60 uppercase tracking-widest font-bold mb-1">
            {isPlaying ? 'ĐANG NGHE THỬ' : 'CHỌN ĐỂ NGHE THỬ'}
          </div>
          <div className="text-on-surface font-semibold">{activeMoodData.name} - Giai điệu thời gian</div>
        </div>
        <div className="flex gap-2 h-6 items-end">
          <motion.div
            animate={{ height: isPlaying ? [8, 16, 12, 18, 8] : 8 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-1 bg-primary/40 rounded-full"
          />
          <motion.div
            animate={{ height: isPlaying ? [12, 24, 16, 20, 12] : 12 }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="w-1 bg-primary rounded-full"
          />
          <motion.div
            animate={{ height: isPlaying ? [6, 12, 8, 14, 6] : 6 }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-1 bg-primary/60 rounded-full"
          />
          <motion.div
            animate={{ height: isPlaying ? [10, 20, 14, 22, 10] : 10 }}
            transition={{ repeat: Infinity, duration: 1.1 }}
            className="w-1 bg-primary/80 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};
