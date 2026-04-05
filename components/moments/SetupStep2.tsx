"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Plus, Image as ImageIcon, Video as VideoIcon, AlertCircle, Music, Volume2 } from "lucide-react";
import { hashPassword } from "@/lib/utils";
import { AUDIO_MOODS } from "./SetupStep3";

interface SetupStep2Props {
  formData: any;
  updateFormData: (data: any) => void;
  momentId?: string;
}

export const SetupStep2 = ({ formData, updateFormData, momentId }: SetupStep2Props) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_SIZE_MB = 100;

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempSettings, setTempSettings] = useState({ mood: 'chill', volume: 60 });

  // Hàm đồng bộ danh sách media xuống DB lập tức
  const syncMediaToDB = async (updatedMedia: any[]) => {
    if (!momentId) return;
    try {
      const adminHash = await hashPassword(formData.adminPassword || "admin123");
      const res = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          momentId,
          adminPasswordHash: adminHash,
          action: 'SAVE_MEDIA_LIST',
          payload: { media: updatedMedia }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể đồng bộ danh sách vào Database.');
      
      // QUAN TRỌNG: Cập nhật lại ID từ DB vào State để giữ liên kết tin nhắn
      if (data.media) {
        updateFormData({ media: data.media });
      }
    } catch (err: any) {
      console.error("[Sync Error]:", err);
      setError("Đã tải xong nhưng không thể lưu vào Database: " + err.message);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0 || !momentId) return;

      setUploading(true);
      setError(null);
      const newMedia = [...(formData.media || [])];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`File ${file.name} quá lớn (Tối đa ${MAX_SIZE_MB}MB)`);
          continue;
        }

        const adminHash = await hashPassword(formData.adminPassword || "admin123");

        // 1. Lấy Signed URL từ Server (Bảo mật: Chỉ Admin mới lấy được)
        const res = await fetch('/api/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            momentId,
            adminPasswordHash: adminHash,
            action: 'GET_UPLOAD_SIGNED_URL',
            payload: { fileName: `${Math.random().toString(36).substring(2)}-${file.name}` }
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server không phản hồi.');

        // 2. Tải trực tiếp lên Storage bằng Signed URL (Bypass RLS an toàn)
        const uploadRes = await fetch(data.signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        });

        if (!uploadRes.ok) throw new Error('Tải lên Storage thất bại.');

        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/moments/${data.path}`;

        newMedia.push({
          url: publicUrl,
          type: file.type.startsWith('video') ? 'video' : 'image',
          storage_path: data.path,
          name: file.name,
          mood: 'none',
          music_volume: 60
        });
      }

      updateFormData({ media: newMedia });
      await syncMediaToDB(newMedia); // Đồng bộ ngay sau khi up xong
    } catch (err: any) {
      console.error('Error uploading:', err);
      setError(err.message || 'Lỗi khi tải lên.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = async (index: number) => {
    const item = formData.media[index];
    const newMedia = [...formData.media];
    newMedia.splice(index, 1);
    updateFormData({ media: newMedia });
    
    // Đồng bộ ngay sau khi xoá
    await syncMediaToDB(newMedia);
    
    // Nếu tệp đã được tải lên server, hãy thông báo xóa (Tùy chọn: có thể xóa triệt để trên server ở đây)
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <header className="mb-12 space-y-3 px-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-widest font-outfit">
            Giai đoạn lưu trữ (An toàn)
          </span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight font-outfit">
          Thêm nội dung kỉ niệm
        </h2>
        <p className="text-zinc-500 text-lg leading-relaxed max-w-md font-light font-outfit">
          Dữ liệu của bạn được bảo vệ bởi cổng Admin an toàn. Chỉ bạn mới có quyền tải tệp lên.
        </p>
      </header>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm font-medium mb-6">
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,video/*" 
          multiple
          onChange={handleUpload}
        />

        <div className="md:col-span-3">
          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="relative group cursor-pointer"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-400 to-rose-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative rounded-3xl border-2 border-dashed border-rose-400/50 bg-zinc-950/40 backdrop-blur-2xl p-10 flex flex-col items-center justify-center text-center space-y-6 glow-pulse transition-all duration-300 hover:border-rose-400">
              {uploading ? (
                <Loader2 className="w-20 h-20 text-rose-500 animate-spin" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-rose-400/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-rose-400">cloud_upload</span>
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white font-outfit">
                  {uploading ? "Đang xác thực & tải lên..." : "Tải lên tệp tin (Giao diện Admin)"}
                </h3>
                <p className="text-rose-300/60 font-medium">Hỗ trợ ảnh & video chất lượng cao (100MB)</p>
              </div>
            </div>
          </div>
        </div>

        {formData.media?.map((item: any, idx: number) => (
          <div key={idx} className="bg-zinc-900/50 rounded-2xl overflow-hidden group relative aspect-square shadow-xl border border-white/5">
            {item.type === 'video' ? (
              <video src={item.url} className="w-full h-full object-cover" />
            ) : (
              <img src={item.url} alt="Memory" className="w-full h-full object-cover" />
            )}
            {/* Overlay luôn hiển thị các nút chức năng */}
            <div className="absolute inset-0 flex flex-col justify-between p-3">
              {/* Nút chức năng ở góc trên */}
              <div className="flex justify-end gap-2">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditingIndex(idx);
                    setTempSettings({ 
                      mood: item.mood || 'chill', 
                      volume: item.music_volume || 60 
                    });
                  }}
                  className="p-2.5 rounded-xl bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:bg-rose-500 hover:border-rose-400 text-white transition-all shadow-lg shadow-black/20"
                  title="Cài đặt nhạc nền"
                >
                  <Music size={14} className={item.mood !== 'none' ? "text-rose-400" : "text-white"} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeMedia(idx); }}
                  className="p-2.5 rounded-xl bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:bg-red-500 hover:border-red-400 text-white transition-all shadow-lg shadow-black/20"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Thông tin trạng thái ở góc dưới */}
              <div className="space-y-2">
                <div className="flex items-center justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <div className="px-2 py-1 rounded-lg bg-zinc-950/60 backdrop-blur-md border border-white/10 inline-flex items-center gap-1.5 shadow-lg shadow-black/20">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.mood !== 'none' ? 'bg-rose-500 glow-rose' : 'bg-zinc-500'}`} />
                      <span className="text-[9px] font-black tracking-widest text-white uppercase font-outfit">
                        {item.mood === 'none' ? 'NO MUSIC' : item.mood}
                      </span>
                    </div>
                    {item.mood !== 'none' && (
                      <div className="px-2 py-0.5 rounded-lg bg-rose-500/10 backdrop-blur-sm border border-rose-500/20 inline-flex items-center gap-1">
                        <Volume2 size={8} className="text-rose-400" />
                        <span className="text-[8px] font-bold text-rose-300">{item.music_volume}%</span>
                      </div>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-950/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-rose-400 shadow-lg shadow-black/20">
                    {item.type === 'video' ? <VideoIcon size={14} /> : <ImageIcon size={14} />}
                  </div>
                </div>
              </div>
            </div>

            </div>
        ))}

        {/* Modal Chỉnh sửa nhạc nền cho từng file */}
        <AnimatePresence>
          {editingIndex !== null && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white font-outfit">Cài đặt âm thanh riêng</h3>
                  <button onClick={() => setEditingIndex(null)} className="text-zinc-500 hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                {/* Mood Selector Mini */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Giai điệu nền</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTempSettings(prev => ({ ...prev, mood: 'none' }))}
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                        tempSettings.mood === 'none' 
                          ? "bg-zinc-800 border-zinc-700 text-white" 
                          : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">block</span>
                      <span className="text-xs font-bold">Không nhạc</span>
                    </button>
                    {AUDIO_MOODS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setTempSettings(prev => ({ ...prev, mood: m.id }))}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                          tempSettings.mood === m.id 
                            ? "bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]" 
                            : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{m.icon}</span>
                        <span className="text-xs font-bold">{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Audio Logic */}
                {tempSettings.mood !== 'none' && (
                   <audio 
                     autoPlay 
                     src={AUDIO_MOODS.find(m => m.id === tempSettings.mood)?.audio} 
                     style={{ display: 'none' }}
                     ref={(el) => {
                       if (el) el.volume = tempSettings.volume / 100;
                     }}
                   />
                )}

                {/* Volume Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Âm lượng nhạc</label>
                    <span className="text-xs font-mono text-rose-400">{tempSettings.volume}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Volume2 size={16} className="text-zinc-500" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={tempSettings.volume}
                      onChange={(e) => setTempSettings(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                      className="flex-1 accent-rose-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setEditingIndex(null)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={async () => {
                      const newMedia = [...formData.media];
                      newMedia[editingIndex] = {
                        ...newMedia[editingIndex],
                        mood: tempSettings.mood,
                        music_volume: tempSettings.volume
                      };
                      updateFormData({ media: newMedia });
                      await syncMediaToDB(newMedia);
                      setEditingIndex(null);
                    }}
                    className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                  >
                    Lưu cấu hình
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {!uploading && formData.media?.length > 0 && (
          <div className="md:col-span-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full aspect-square rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all group"
            >
              <div className="w-12 h-12 rounded-full border border-rose-400/30 flex items-center justify-center group-hover:scale-110 transition-transform text-rose-400">
                <Plus size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-outfit">
                Thêm nội dung
              </span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
