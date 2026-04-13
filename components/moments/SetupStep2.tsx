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
  uploadingFiles?: {[key: string]: number};
}

export const SetupStep2 = ({ formData, updateFormData, momentId, onEditItem, onUpload, uploadingFiles = {} }: SetupStep2Props) => {
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
    // Note: Ở đây có thể đồng bộ DB nếu cần, nhưng tạm thời để Wizard xử lý hoặc Gallery xử lý
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
             <div className="w-full max-w-sm space-y-6 z-10">
                <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-rose-500 animate-spin mx-auto" />
                <div className="space-y-4">
                   <h3 className="text-white font-bold font-outfit">Đang tải tệp...</h3>
                   <div className="space-y-3">
                      {Object.entries(uploadingFiles).map(([name, progress]) => (
                        <div key={name} className="space-y-1.5">
                           <div className="flex justify-between text-[9px] font-bold text-rose-300/60 uppercase">
                              <span className="truncate max-w-[150px]">{name}</span>
                              <span>{progress}%</span>
                           </div>
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-rose-500" />
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
                       <video 
                        src={item.url} 
                        poster={item.thumbnail_url}
                        className="w-full h-full object-cover" 
                       />
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
                         <span className="text-[8px] font-bold text-white uppercase tracking-widest">
                            {item.isPlaceholder ? `Đang tải ${uploadingFiles[item.storage_path] || 0}%` : "Thành công"}
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
