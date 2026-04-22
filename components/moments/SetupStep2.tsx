"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Plus, Image as ImageIcon, Video as VideoIcon, AlertCircle, Edit2, Check } from "lucide-react";

interface SetupStep2Props {
  formData: any;
  updateFormData: (data: any) => void;
  momentId?: string;
  onEditItem?: (idx: number) => void;
  onUpload?: (files: FileList) => void;
  onRetry?: (storagePath: string) => void; // Thêm prop này
  uploadingFiles?: {[key: string]: number};
  storageInfo?: { usedMB: number, totalMB: number } | null;
}

export const SetupStep2 = ({ 
  formData, 
  updateFormData, 
  momentId, 
  onEditItem, 
  onUpload, 
  onRetry, // Nhận prop này
  uploadingFiles = {},
  storageInfo = null 
}: SetupStep2Props) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ghi nhớ danh sách đã có từ trước khi vào Bước 3 này để ẩn chúng đi
  const initialPaths = useRef<string[]>(formData.media?.map((m: any) => m.storage_path) || []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onUpload?.(files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = async (storagePath: string) => {
    if (!storagePath) return;
    const updatedList = formData.media.filter((m: any) => m.storage_path !== storagePath);
    updateFormData({ media: updatedList });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <header className="space-y-3 px-1">
        <div className="flex items-center gap-2 mb-2 text-rose-400">
           <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Cổng tải lên an toàn</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight font-outfit">
           Thêm nội dung kỉ niệm
        </h2>
        <p className="text-zinc-500 text-sm font-light leading-relaxed max-w-md">Ảnh và video của bạn sẽ được đồng bộ ngay lập tức và bảo mật đa lớp.</p>
      </header>

      {/* HIỂN THỊ DUNG LƯỢNG */}
      {storageInfo && (
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-3 shadow-2xl">
           <div className="flex justify-between items-end">
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dung lượng kỉ niệm</p>
                 <p className="text-xl font-black text-rose-400 font-outfit">
                    {storageInfo.usedMB} <span className="text-xs font-normal text-zinc-600">MB</span>
                    <span className="mx-2 text-zinc-800 text-sm">/</span>
                    <span className="text-zinc-400">{storageInfo.totalMB}</span> <span className="text-[10px] font-normal text-zinc-600">MB</span>
                 </p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Còn trống</p>
                 <p className="text-lg font-bold text-white font-outfit">
                    {(storageInfo.totalMB - storageInfo.usedMB).toFixed(1)} <span className="text-[10px] font-normal text-zinc-600">MB</span>
                 </p>
              </div>
           </div>
           
           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${(storageInfo.usedMB / storageInfo.totalMB) * 100}%` }} 
                className={`h-full rounded-full ${
                  (storageInfo.usedMB / storageInfo.totalMB) > 0.9 ? 'bg-rose-500' : 
                  (storageInfo.usedMB / storageInfo.totalMB) > 0.7 ? 'bg-orange-500' : 'bg-emerald-500'
                } shadow-[0_0_10px_rgba(244,63,94,0.3)]`}
              />
           </div>

           {(storageInfo.usedMB / storageInfo.totalMB) > 0.8 && (
             <p className="text-[9px] text-orange-400/80 italic animate-pulse">
                ⚠️ Dung lượng sắp đầy. Hãy cân nhắc nén video để lưu thêm nhiều kỉ niệm nhé!
             </p>
           )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-xs">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileChange} />

      {/* 1. PREMIUM UPLOAD BOX */}
      <div 
        onClick={() => !Object.keys(uploadingFiles).length && fileInputRef.current?.click()}
        className="relative group cursor-pointer"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-rose-700 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
        <div className="relative rounded-[2.5rem] border-2 border-dashed border-rose-500/30 bg-zinc-950/40 backdrop-blur-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 overflow-hidden min-h-[300px]">
           {Object.keys(uploadingFiles).length > 0 ? (
             <div className="w-full max-w-sm space-y-8 z-10 px-4">
                <div className="relative w-20 h-20 mx-auto">
                   <div className="absolute inset-0 rounded-full border-4 border-rose-500/10" />
                   <div className="absolute inset-0 rounded-full border-4 border-t-rose-500 animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-zinc-500 text-xs font-bold">{Object.keys(uploadingFiles).length}</span>
                   </div>
                </div>
                <div className="space-y-5">
                   <div className="text-center space-y-1">
                      <h3 className="text-white font-bold font-outfit text-lg">Đang đóng gói kỉ niệm...</h3>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em]">Vui lòng không đóng trình duyệt</p>
                   </div>
                   <div className="space-y-4 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(uploadingFiles).map(([id, progress]) => (
                        <div key={id} className="space-y-2">
                           <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                              <span className={progress === -1 ? "text-rose-500" : "text-rose-300/60"}>
                                 {progress === -1 ? "⚠️ Lỗi tải lên" : "Đang xử lý"}
                              </span>
                              <div className="flex items-center gap-2">
                                {progress === -1 && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onRetry?.(id); }}
                                    className="px-2 py-0.5 rounded-md bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all"
                                  >
                                    Thử lại
                                  </button>
                                )}
                                <span className={progress === -1 ? "text-rose-500" : "text-rose-400"}>
                                  {progress === -1 ? "FAIL" : `${progress}%`}
                                </span>
                              </div>
                           </div>
                           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: progress === -1 ? "100%" : `${progress}%` }} 
                                className={`h-full ${progress === -1 ? "bg-rose-900" : "bg-gradient-to-r from-rose-400 to-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.3)]"}`} 
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           ) : (
             <>
               <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 text-rose-500">
                  <span className="material-symbols-outlined text-5xl">cloud_upload</span>
               </div>
               <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-outfit">Tải lên kỉ niệm mới</h3>
                  <p className="text-zinc-500 text-xs">Chạm để chọn ảnh hoặc video (Max 100MB)</p>
               </div>
               <div className="flex gap-4 opacity-30 group-hover:opacity-100 transition-opacity">
                   <img src="https://img.icons8.com/color/48/000000/image-file-add.png" className="w-5 h-5" alt="icon" />
                   <img src="https://img.icons8.com/color/48/000000/video-file.png" className="w-5 h-5" alt="icon" />
               </div>
             </>
           )}
        </div>
      </div>


      {/* 2. RECENT UPLOADS GALLERY */}
      {formData.media?.filter((m: any) => !initialPaths.current.includes(m.storage_path)).length > 0 && (
        <div className="space-y-6 pt-6">
           <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Nội dung vừa thêm</span>
              <div className="h-px flex-1 bg-white/5" />
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.media.filter((m: any) => !initialPaths.current.includes(m.storage_path)).map((item: any) => (
                <motion.div 
                  key={item.storage_path}
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-square rounded-[1.5rem] overflow-hidden group bg-zinc-900 border border-white/5 shadow-xl transition-all hover:ring-2 hover:ring-rose-500/50"
                >
                   {item.isPlaceholder ? (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-950/50 backdrop-blur-md">
                         <div className="w-8 h-8 rounded-full border-2 border-t-rose-500 border-rose-500/10 animate-spin" />
                      </div>
                   ) : (
                     item.type === 'video' ? (
                        <div className="relative w-full h-full group/v">
                           <video 
                              src={item.url} 
                              poster={item.thumbnail_url}
                              playsInline
                              webkit-playsinline="true"
                              muted
                              className="w-full h-full object-cover" 
                           />
                           {!item.thumbnail_url && (
                              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm">
                                 <div className="flex flex-col items-center gap-2 text-rose-400">
                                    <VideoIcon size={32} strokeWidth={1.5} />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Video</span>
                                 </div>
                              </div>
                           )}
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-60 group-hover/v:scale-110 transition-transform">
                                 <span className="material-symbols-outlined ml-0.5">play_arrow</span>
                              </div>
                           </div>
                        </div>
                     ) : (
                       <img src={item.url} alt="New" className="w-full h-full object-cover" />
                     )
                   )}
                   
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                   
                   <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-transform">
                         <button onClick={(e) => { e.stopPropagation(); onEditItem?.(formData.media.indexOf(item)); }} className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/10 text-white hover:bg-rose-500"><Edit2 size={14} /></button>
                         <button onClick={(e) => { e.stopPropagation(); removeMedia(item.storage_path); }} className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/10 text-white hover:bg-red-500"><X size={14} /></button>
                      </div>

                      <div className="flex items-center gap-1.5">
                         <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/40">
                            {item.isPlaceholder ? <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> : <Check size={10} />}
                         </div>
                         <span className={`text-[8px] font-bold uppercase tracking-widest ${uploadingFiles[item.storage_path] === -1 ? "text-rose-500" : "text-white"}`}>
                            {item.isPlaceholder 
                              ? (uploadingFiles[item.storage_path] === -1 ? "Thất bại" : `Đang tải ${uploadingFiles[item.storage_path] || 0}%`) 
                              : "Thành công"}
                         </span>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      )}
    </motion.div>
  );
};
