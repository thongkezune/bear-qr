import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, ShoppingBag, Video, ArrowRight, CheckCircle2, Copy, Check, X, Film, Image as ImageIcon } from 'lucide-react';

interface ViewerSuccessProps {
  onReplay?: () => void;
  onManage?: () => void;
  momentId?: string;
  playlist?: any[]; // Danh sách toàn bộ media
}

export default function ViewerSuccess({ onReplay, onManage, momentId, playlist = [] }: ViewerSuccessProps) {
  const [copied, setCopied] = useState(false);
  const [showDownloadList, setShowDownloadList] = useState(false);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: 'BearQR Moments',
      text: 'Xem kỉ niệm tuyệt đẹp này từ BearQR!',
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled or failed:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert("Không thể sao chép liên kết.");
      }
    }
  };

  const executeDownload = async (url: string, title?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      
      const ext = url.split('.').pop()?.split('?')[0] || 'file';
      const safeTitle = (title || 'Moment').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `BearQR_${safeTitle}.${ext}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      window.open(url, '_blank');
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 flex-grow flex flex-col items-center justify-center px-8 py-20 text-center w-full max-w-2xl mx-auto"
    >
      {/* Success Celebration Icon */}
      <motion.div 
        initial={{ scale: 0.5, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="mb-12 relative"
      >
        <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full scale-110 animate-pulse" />
        <div className="relative bg-white/5 backdrop-blur-2xl p-6 rounded-full border border-white/10 shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-rose-400 fill-rose-400/10" />
        </div>
      </motion.div>

      {/* Hero Visual Section */}
      <div className="relative w-full max-w-lg mb-12 group">
        <div className="absolute -inset-4 bg-rose-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <img 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            src="https://images.unsplash.com/photo-1516589174184-c685266e430c?q=80&w=2070&auto=format&fit=crop"
            alt="Memory Ending"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
          
          <div className="absolute bottom-4 right-4 bg-rose-500/20 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-lg">
            <p className="text-[10px] uppercase tracking-widest text-rose-300 font-bold">Lưu trữ số #2024</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight leading-tight text-white">
          Kỉ niệm này <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-500">dành riêng</span> cho bạn
        </h2>
        <p className="text-lg md:text-xl font-light text-zinc-400 leading-relaxed italic font-be-vietnam-pro">
          Cảm ơn bạn đã ở đây, lắng nghe và giữ gìn những khoảnh khắc quý giá nhất.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <button 
          onClick={onReplay}
          className="group relative bg-white/5 text-white p-[1px] rounded-2xl border border-white/10 hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
        >
          <div className="rounded-2xl p-6 flex flex-col items-start gap-3 text-left">
            <Video className="w-8 h-8 text-rose-400" />
            <div>
              <h3 className="font-bold text-lg">Xem lại video</h3>
              <p className="text-xs text-zinc-500">Sống lại những khoảnh khắc vừa rồi</p>
            </div>
          </div>
        </button>

        <a 
          href="https://bearqr.vn/shop"
          target="_blank"
          className="group relative bg-gradient-to-r from-rose-400 to-rose-600 text-white p-[1px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-rose-950/20"
        >
          <div className="bg-zinc-950 rounded-2xl p-6 flex flex-col items-start gap-3 text-left group-hover:bg-transparent transition-all h-full">
            <ShoppingBag className="w-8 h-8 text-rose-400 group-hover:text-white" />
            <div>
              <h3 className="font-bold text-lg">Tiếp tục mua sắm</h3>
              <p className="text-xs text-zinc-500 group-hover:text-rose-200">Khám phá bộ sưu tập BearQR</p>
            </div>
          </div>
        </a>

        <button 
          onClick={onManage}
          className="group relative bg-zinc-900 text-white p-[1px] rounded-2xl border border-white/10 hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <div className="rounded-2xl p-6 flex flex-col items-start gap-3 text-left">
            <ArrowRight className="w-8 h-8 text-rose-400" />
            <div>
              <h3 className="font-bold text-lg">Quản lý kỉ niệm</h3>
              <p className="text-xs text-zinc-500">Dành cho chính chủ sở hữu</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-12 flex items-center justify-center gap-12">
        <button 
          onClick={handleShare}
          className="flex flex-col items-center gap-3 group relative"
        >
          <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:border-rose-500/30 transition-all shadow-lg active:scale-90">
            {copied ? <Check className="w-6 h-6 text-emerald-400" /> : <Share2 className="w-6 h-6 text-zinc-400 group-hover:text-rose-400" />}
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 group-hover:text-rose-400 transition-colors">
            {copied ? "Đã sao chép" : "Chia sẻ"}
          </span>
        </button>

        <button 
          onClick={() => setShowDownloadList(true)}
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:border-rose-500/30 transition-all shadow-lg active:scale-90">
            <Download className="w-6 h-6 text-zinc-400 group-hover:text-rose-400" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 group-hover:text-rose-400 transition-colors">Tải về</span>
        </button>
      </div>

      <div className="mt-20 opacity-40">
        <span className="text-[10px] tracking-[0.4em] uppercase font-medium text-zinc-500">
          The End • The Luminous Archive
        </span>
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
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-900 border-t border-white/10 rounded-t-[2.5rem] p-8 max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="text-left">
                  <h2 className="text-2xl font-bold font-outfit text-white">Lưu giữ kỉ niệm</h2>
                  <p className="text-zinc-500 text-sm">Chọn nội dung bạn muốn tải về máy</p>
                </div>
                <button 
                  onClick={() => setShowDownloadList(false)}
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {playlist.length > 0 ? (
                  playlist.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="group p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                        <img 
                          src={item.thumbnail_url || item.url} 
                          alt={item.title_memory} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          {item.type === 'video' ? <Film size={16} className="text-white" /> : <ImageIcon size={16} className="text-white" />}
                        </div>
                      </div>
                      
                      <div className="flex-1 text-left">
                        <h4 className="font-bold text-white text-sm line-clamp-1">{item.title_memory || `Kỉ niệm #${idx + 1}`}</h4>
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">
                          {item.type === 'video' ? 'Video' : 'Hình ảnh'}
                        </p>
                      </div>

                      <button 
                        onClick={() => executeDownload(item.url, item.title_memory)}
                        className="w-10 h-10 rounded-full bg-rose-500 text-zinc-950 flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg shadow-rose-500/20"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-zinc-500">
                    Chưa có kỉ niệm để tải về
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
