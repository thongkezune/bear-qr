"use client";

import { motion } from "framer-motion";
import { Edit3, User, MessageCircle, Sparkles, Image as ImageIcon, Video as VideoIcon, History } from "lucide-react";

interface SetupStep3Props {
  formData: any;
  updateFormData: (data: any) => void;
  editingIndex: number;
  uploadingFiles?: {[key: string]: number};
  onBack?: () => void;
}

export const SetupStep3 = ({ formData, updateFormData, editingIndex, uploadingFiles = {} }: SetupStep3Props) => {
  const mediaItem = formData.media[editingIndex];
  const progress = mediaItem?.storage_path ? uploadingFiles[mediaItem.storage_path] : null;

  if (!mediaItem) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <p>Không tìm thấy nội dung để chỉnh sửa.</p>
      </div>
    );
  }

  const updateMediaField = (field: string, val: string) => {
    const newMedia = [...formData.media];
    newMedia[editingIndex] = { ...newMedia[editingIndex], [field]: val };
    updateFormData({ media: newMedia });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-10 pb-20"
    >
      <header className="px-1 space-y-2">
        <div className="flex items-center gap-2 text-rose-400 mb-2">
          <Sparkles size={18} />
          <span className="text-[10px] font-bold uppercase tracking-[.2em]">Biên tập nội dung kỉ niệm</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight font-outfit">
          Lưu giữ khoảnh khắc
        </h1>
        <p className="text-zinc-500 text-sm font-light">Đặt tên và viết những lời nhắn nhủ chân thành nhất gắn liền với bức hình này.</p>
      </header>

      {/* Media Preview Section */}
      <section className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 group">
        {mediaItem.isPlaceholder ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/40 backdrop-blur-2xl space-y-6">
             <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                   <circle className="text-white/5 stroke-current" strokeWidth="2" fill="transparent" r="45" cx="50" cy="50" />
                   <motion.circle 
                      className="text-rose-500 stroke-current" strokeWidth="3" strokeLinecap="round" fill="transparent" r="45" cx="50" cy="50"
                      initial={{ strokeDasharray: "282.6", strokeDashoffset: 282.6 }}
                      animate={{ strokeDashoffset: 282.6 - (282.6 * (progress || 0)) / 100 }}
                      transition={{ duration: 0.5 }}
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                   <span className="text-xl font-black font-outfit">{progress || 0}%</span>
                </div>
             </div>
             <div className="text-center space-y-1">
                <p className="text-white font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Đang truyền tải dữ liệu</p>
                <p className="text-zinc-500 text-[9px]">Vui lòng chờ trong giây lát...</p>
             </div>
          </div>
        ) : (
          <>
            {mediaItem.type === 'video' ? (
              <video 
                src={mediaItem.url} 
                poster={mediaItem.thumbnail_url}
                className="w-full h-full object-cover" 
                muted 
                playsInline 
                autoPlay 
                loop 
              />
            ) : (
              <img src={mediaItem.url} alt="Preview" className="w-full h-full object-cover" />
            )}
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-6 left-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
            {mediaItem.type === 'video' ? <VideoIcon size={18} /> : <ImageIcon size={18} />}
          </div>
          <div className="text-left">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Đang chỉnh sửa</p>
              <p className="text-white text-xs font-medium opacity-60">Thứ tự: {editingIndex + 1}</p>
          </div>
        </div>
      </section>

      {/* Input Form - MemoryWall Style */}
      <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-xl">
        
        {/* FIELD 1: Tên khoảnh khắc (title_memory) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Edit3 size={14} className="text-rose-400" />
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Tên khoảnh khắc / Kỉ niệm</label>
          </div>
          <input 
            type="text" 
            value={mediaItem.title_memory || ""}
            onChange={(e) => updateMediaField('title_memory', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-base text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all placeholder:text-zinc-700 font-be-vietnam-pro"
            placeholder="Ví dụ: Lần đầu đi chơi, Kỉ niệm ngày cưới..."
          />
        </div>

        <div className="h-px bg-white/5 w-full" />

        {/* FIELD 2: Họ tên người nhắn (admin_author) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <User size={14} className="text-rose-400" />
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Họ tên của bạn</label>
          </div>
          <input 
            type="text" 
            value={mediaItem.admin_author || ""}
            onChange={(e) => updateMediaField('admin_author', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all placeholder:text-zinc-700 font-be-vietnam-pro"
            placeholder="Gấu của bạn, Anh xã, Admin..."
          />
        </div>

        {/* FIELD 3: Lời nhắn gửi (admin_content) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <MessageCircle size={14} className="text-rose-400" />
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Lời nhắn chân tình</label>
          </div>
          <textarea 
            value={mediaItem.admin_content || ""}
            onChange={(e) => updateMediaField('admin_content', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all placeholder:text-zinc-700 resize-none font-be-vietnam-pro min-h-[140px]"
            placeholder="Viết những lời yêu thương gắn liền với ảnh này..."
            rows={4}
          />
        </div>

      </section>

      {/* PHẦN LỊCH SỬ LỜI NHẮN */}
      {mediaItem.messages && mediaItem.messages.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <History size={14} className="text-zinc-600" />
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">Lời nhắn đã lưu ({mediaItem.messages.length})</label>
          </div>
          <div className="space-y-4">
            {mediaItem.messages
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((msg: any, idx: number) => (
                <motion.div 
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-950/40 border border-white/5 rounded-[1.5rem] p-5 relative overflow-hidden"
                >
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                          <User size={10} />
                        </div>
                        <span className="text-xs font-bold text-rose-200">{msg.author}</span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-600">{new Date(msg.created_at).toLocaleDateString('vi-VN')}</span>
                   </div>
                   <p className="text-zinc-400 text-sm italic font-light leading-relaxed">"{msg.content}"</p>
                </motion.div>
              ))}
          </div>
        </section>
      )}

      <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2rem] p-6 flex gap-4 items-start">
         <div className="mt-1 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-zinc-950 shrink-0">
            <span className="material-symbols-outlined text-[14px] font-bold">celebration</span>
         </div>
         <p className="text-xs text-rose-200/70 leading-relaxed font-light">
           <b>Gợi ý</b>: Những thông tin này sẽ được lưu như lời nhắn chính thức đầu tiên cho tấm ảnh. Người xem sẽ thấy thông điệp này ngay khi xem ảnh/video.
         </p>
      </div>
    </motion.div>
  );
};
