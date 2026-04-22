'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageCircle, Heart, Share2, History, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

interface MemoryWallProps {
  mediaId?: string;
}

export default function MemoryWall({ mediaId }: MemoryWallProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!mediaId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('media_messages')
          .select('*')
          .eq('media_id', mediaId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setComments(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [mediaId]);

  const handleSend = async () => {
    if (!mediaId || !newAuthor || !newContent || isSending) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase
        .from('media_messages')
        .insert([
          {
            media_id: mediaId,
            author: newAuthor,
            content: newContent
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setComments([data, ...comments]);
        setNewAuthor('');
        setNewContent('');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Không thể gửi lời nhắn: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <p className="text-zinc-600 text-xs uppercase tracking-widest font-bold">Đang tải lời nhắn...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] uppercase tracking-widest font-bold">
          <History size={12} />
          Lời nhắn từ người thương
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-white font-outfit">Bức tường kỷ niệm</h2>
        <p className="text-zinc-500 text-sm max-w-sm">
          Nơi lưu giữ những tâm tình và lời nhắn gửi dành riêng cho khoảnh khắc này.
        </p>
      </div>

      <div className="space-y-8">
        {/* Comment List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group "
              >
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-rose-500/20 rounded-full group-hover:bg-rose-500/40 transition-colors" />
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <User size={14} />
                      </div>
                      <h3 className="text-rose-200 font-bold text-sm tracking-wide">{comment.author}</h3>
                    </div>
                    <span className="text-zinc-600 font-mono text-[10px] tabular-nums">
                      {isMounted && new Date(comment.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed font-light italic">
                    "{comment.content}"
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-rose-400 transition-colors">
                      <Heart size={12} /> Yêu thích
                    </button>
                    <button className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-rose-400 transition-colors">
                      <Share2 size={12} /> Chia sẻ
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {comments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-700">
              <MessageCircle size={32} />
            </div>
            <p className="text-zinc-600 text-sm italic">"Kỉ niệm này chưa có lời nhắn nào..."</p>
          </div>
        )}

        {/* Input Form */}
        <div ref={formRef} className="mt-12 pt-12 border-t border-white/5 space-y-8 pb-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                <Sparkles size={18} />
             </div>
             <h3 className="text-lg font-bold text-white font-outfit uppercase tracking-widest text-xs">
               Để lại lời nhắn của bạn
             </h3>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 px-1">Tên của bạn</label>
                <input 
                  type="text" 
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  onFocus={() => {
                    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-rose-500/50 outline-none transition-all placeholder:text-zinc-700 font-be-vietnam-pro"
                  placeholder="Gấu con, Anh xã, ..."
                />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 px-1">Lời nhắn gửi</label>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  onFocus={() => {
                    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-rose-500/50 outline-none transition-all placeholder:text-zinc-700 resize-none font-be-vietnam-pro"
                  placeholder="Viết điều gì đó thật ngọt ngào..."
                  rows={4}
                />
              </div>
            </div>
            <button 
              onClick={handleSend}
              disabled={!newAuthor || !newContent || isSending}
              className="w-full py-4 bg-gradient-to-r from-rose-400 to-rose-600 rounded-2xl text-zinc-950 font-bold text-xs tracking-widest uppercase shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale font-be-vietnam-pro"
            >
              {isSending ? (
                <>Đang gửi... <Loader2 size={14} className="animate-spin" /></>
              ) : (
                <>Gửi lời nhắn <Send size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
