import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, ShoppingBag, Video, ArrowRight, CheckCircle2, X, Film, Image as ImageIcon, Heart, Check } from 'lucide-react';

interface ViewerSuccessProps {
  onReplay?: () => void;
  onManage?: () => void;
  momentId?: string;
  playlist?: any[];
  title?: string;
}

export default function ViewerSuccess({ onReplay, onManage, momentId, playlist = [], title = "Kỉ niệm vô giá" }: ViewerSuccessProps) {
  const [copied, setCopied] = useState(false);
  const [showDownloadList, setShowDownloadList] = useState(false);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Omemo - ${title}`,
          text: 'Xem khoảnh khắc tuyệt vời này cùng tôi nhé!',
          url: shareUrl,
        });
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {}
    }
  };

  const executeDownload = async (url: string, fileName?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const ext = url.split('.').pop() || 'file';
      link.download = `omemo-${momentId || 'memory'}-${fileName || 'moment'}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 flex flex-col items-center justify-center px-6 md:px-8 py-10 text-center w-full max-w-4xl mx-auto"
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-zinc-800/20 blur-[140px] rounded-full" />
      </div>

      {/* Check Icon Animation */}
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full scale-150" />
        <div className="relative w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.3)]">
          <CheckCircle2 size={40} className="text-zinc-950" strokeWidth={2.5} />
        </div>
      </motion.div>

      <div className="space-y-4 mb-12">
        <h2 className="text-4xl md:text-5xl font-bold font-outfit text-white tracking-tight">Ôm trọn từng <span className="text-rose-500">ký ức</span></h2>
        <p className="text-zinc-400 max-w-sm mx-auto text-sm md:text-base font-light italic opacity-80">"Có những lời chất chứa ngọt ngào… để Omemo thay bạn gửi trao 💌"</p>
      </div>

      {/* Memory Gallery Grid - TRÁI TIM CỦA MÀN HÌNH KẾT THÚC */}
      <div className="w-full mb-16 px-4">
        <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-2xl mx-auto">
          {playlist.slice(0, 9).map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, zIndex: 10, rotate: idx % 2 === 0 ? 2 : -2 }}
              className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 group cursor-pointer"
            >
              <img 
                src={item.thumbnail_url || item.url} 
                alt="Memory thumbnail" 
                className="w-full h-full object-cover transition-all duration-500 group-hover:saturate-150 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {item.type === 'video' && (
                <div className="absolute top-2 right-2 p-1 rounded-md bg-black/40 backdrop-blur-sm border border-white/10">
                  <Film size={10} className="text-white" />
                </div>
              )}
            </motion.div>
          ))}
          {/* Nút giả lập thêm nếu playlist ít */}
          {playlist.length < 3 && Array.from({ length: 3 - playlist.length }).map((_, i) => (
            <div key={`placeholder-${i}`} className="aspect-square rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
              <Heart size={20} className="text-white/5" />
            </div>
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mt-6 font-bold">Bộ sưu tập {title}</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-16 max-w-3xl">
        <button 
          onClick={onReplay}
          className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group active:scale-95"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
            <Video size={24} />
          </div>
          <span className="font-bold text-sm tracking-wide">Xem lại kỉ niệm</span>
        </button>

        <a 
          href="https://omemo.id.vn/shop"
          target="_blank"
          className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-rose-500 text-zinc-950 hover:brightness-110 transition-all group active:scale-95 shadow-[0_20px_50px_rgba(244,63,94,0.2)]"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-950/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingBag size={24} />
          </div>
          <span className="font-bold text-sm tracking-wide">Mua sắm Omemo</span>
        </a>

        <button 
          onClick={onManage}
          className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all group active:scale-95"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
            <ArrowRight size={24} />
          </div>
          <span className="font-bold text-sm tracking-wide text-zinc-400">Quản trị kỉ niệm</span>
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center gap-8 md:gap-12">
        <button 
          onClick={handleShare}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:border-rose-500/30 transition-all active:scale-90">
            {copied ? <Check size={20} className="text-emerald-400" /> : <Share2 size={20} className="text-zinc-500 group-hover:text-rose-400" />}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 group-hover:text-rose-400">{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
        </button>

        <button 
          onClick={() => setShowDownloadList(true)}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:border-rose-500/30 transition-all active:scale-90">
            <Download size={20} className="text-zinc-500 group-hover:text-rose-400" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 group-hover:text-rose-400">Tải về</span>
        </button>
      </div>

      {/* Download Modal */}
      <AnimatePresence>
        {showDownloadList && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDownloadList(false)}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-950 border-t border-white/10 rounded-t-[3rem] p-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8" />
              <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
                <div className="text-left">
                  <h2 className="text-2xl font-bold font-outfit text-white">Lưu giữ kỉ niệm</h2>
                  <p className="text-zinc-500 text-sm">Tải về các hình ảnh và video gốc của bạn</p>
                </div>
                <button onClick={() => setShowDownloadList(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pb-10">
                {playlist.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
                      <img src={item.thumbnail_url || item.url} alt="Thumb" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{item.title_memory || `Khoảnh khắc ${idx + 1}`}</h4>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-1">{item.type === 'video' ? 'Video MP4' : 'Hình ảnh JPG'}</p>
                    </div>
                    <button 
                      onClick={() => executeDownload(item.url, item.title_memory || `moment-${idx + 1}`)}
                      className="w-12 h-12 rounded-full bg-rose-500 text-zinc-950 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-lg shadow-rose-500/20"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
