"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Video, Edit2, Trash2, Calendar, Loader2, X, Play, Settings } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface MemoryItem {
  id: string;
  url: string;
  thumbnail_url?: string;
  type: string;
  order_index: number;
  created_at: string;
  storage_path: string;
  title_memory?: string;
  // Các trường ảo để tương thích giao diện cũ
  title?: string;
}

interface AdminHomeProps {
  momentId?: string;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRemove?: (storagePath: string) => void;
  settings?: {
    isPrivate: boolean;
    viewerPassword?: string;
    viewerHint?: string;
  };
  onSaveSettings?: (s: any) => Promise<void>;
}

export const AdminHome = ({ momentId, onAdd, onEdit, onRemove, settings, onSaveSettings }: AdminHomeProps) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<MemoryItem | null>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [editingSettings, setEditingSettings] = useState({
    isPrivate: settings?.isPrivate ?? true,
    viewerPassword: settings?.viewerPassword ?? "",
    viewerHint: settings?.viewerHint ?? ""
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!momentId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('moment_media')
          .select('*')
          .eq('moment_id', momentId)
          .order('order_index', { ascending: true });

        if (error) throw error;
        setMemories(data || []);
      } catch (err) {
        console.error("Error fetching media:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [momentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">Đang tải danh sách...</p>
      </div>
    );
  }

  const isEmpty = memories.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <section className="px-1 flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2 font-outfit">
            Trang chủ
          </h2>
          <p className="text-zinc-500 text-sm font-medium">Quản lý kho tàng kỉ niệm của bạn</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setEditingSettings({
                isPrivate: settings?.isPrivate ?? true,
                viewerPassword: settings?.viewerPassword ?? "",
                viewerHint: settings?.viewerHint ?? ""
              });
              setShowSettings(true);
            }}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 shadow-lg active:scale-95 transition-all"
            title="Cài đặt Quyền riêng tư & Kỉ niệm"
          >
            <Settings size={22} className="animate-[spin_4s_linear_infinite] hover:animate-none" style={{ animationPlayState: 'paused' }} />
          </button>
          <button 
            onClick={onAdd}
            className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-rose-500/20 active:scale-90 transition-transform"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      </section>

      {isEmpty ? (
        <div className="bg-zinc-900/40 border border-dashed border-white/10 rounded-[2.5rem] p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <Video size={32} className="text-zinc-700" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-zinc-400">Chưa có kỉ niệm nào</h3>
            <p className="text-zinc-600 text-xs">Hãy bắt đầu lưu giữ những khoảnh khắc đầu tiên</p>
          </div>
          <button 
            onClick={onAdd}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
          >
            Tạo kỉ niệm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Danh sách nội dung ({memories.length})
            </span>
          </div>
          
          <div className="grid gap-4">
            {memories.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setPreviewItem(item)}
                className="group relative overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-white/5 p-4 flex gap-4 transition-all hover:bg-zinc-900/80 cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-800">
                  {item.thumbnail_url || item.type === 'image' ? (
                    <img 
                      src={item.thumbnail_url || item.url} 
                      alt="Media" 
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Video size={24} />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[8px] font-mono text-white">
                    {item.type === 'video' ? 'VIDEO' : 'IMAGE'}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="text-base font-bold text-white line-clamp-1 group-hover:text-rose-400 transition-colors">
                      {item.title_memory || `Kỉ niệm #${item.order_index + 1}`}
                    </h4>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                        <Calendar size={10} />
                        {isMounted && new Date(item.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(item.id); }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (confirm("Bạn có chắc chắn muốn xóa kỉ niệm này không?")) {
                          // Cập nhật giao diện cục bộ ngay lập tức
                          setMemories(prev => prev.filter((m: any) => m.storage_path !== item.storage_path));
                          // Gọi hàm xóa ở cấp độ quản lý (Wizard) để đồng bộ DB
                          onRemove?.(item.storage_path); 
                        }
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-20 transition-opacity">
                  <Video size={40} className="text-white" />
                </div>
              </motion.div>
            ))}
          </div>

          <button 
            onClick={onAdd}
            className="w-full py-5 rounded-[2rem] border-2 border-dashed border-rose-500/20 text-rose-400/50 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all text-sm font-bold flex items-center justify-center gap-2 mt-4"
          >
            <Plus size={18} />
            Thêm nội dung mới
          </button>
        </div>
      )}

      {/* Stats/Footer */}
      <div className="pt-8 grid grid-cols-2 gap-4 opacity-50">
        <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-white tracking-tight">0</span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Lượt xem</span>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-white tracking-tight">0</span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Lời nhắn</span>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {previewItem.type === 'video' ? (
                <video 
                  src={previewItem.url} 
                  autoPlay 
                  controls 
                  playsInline
                  webkit-playsinline="true"
                  className="w-full h-full object-contain"
                />
              ) : (
                <img 
                  src={previewItem.url} 
                  className="w-full h-full object-contain" 
                  alt="Preview" 
                />
              )}
              
              <button 
                onClick={() => setPreviewItem(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-rose-500 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => !isSavingSettings && setShowSettings(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold font-outfit text-white mb-2">Quyền truy cập</h3>
                  <p className="text-sm text-zinc-500 font-light">Cài đặt mật khẩu cho người xem kỉ niệm này.</p>
                </div>

                <div className="flex items-center justify-between gap-4 py-4 border-y border-white/5">
                  <div>
                    <h4 className="text-sm font-bold text-white">Bật yêu cầu mật khẩu</h4>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Chế độ riêng tư</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={editingSettings.isPrivate}
                      onChange={() => setEditingSettings(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <AnimatePresence>
                  {editingSettings.isPrivate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Mật khẩu</label>
                        <input
                          type="text"
                          value={editingSettings.viewerPassword}
                          onChange={(e) => setEditingSettings(prev => ({ ...prev, viewerPassword: e.target.value }))}
                          placeholder="Mật khẩu xem kỉ niệm..."
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Gợi ý cho người nhận</label>
                        <input
                          type="text"
                          value={editingSettings.viewerHint}
                          onChange={(e) => setEditingSettings(prev => ({ ...prev, viewerHint: e.target.value }))}
                          placeholder="Ví dụ: Ngày kỉ niệm..."
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={() => setShowSettings(false)}
                    disabled={isSavingSettings}
                    className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 text-sm font-bold transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={async () => {
                      setIsSavingSettings(true);
                      try {
                        await onSaveSettings?.(editingSettings);
                        setShowSettings(false);
                      } finally {
                        setIsSavingSettings(false);
                      }
                    }}
                    disabled={isSavingSettings}
                    className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {isSavingSettings && <Loader2 size={16} className="animate-spin" />}
                    Lưu cài đặt
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
