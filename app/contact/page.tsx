"use client";

import { motion } from "framer-motion";
import { MessageSquare, Phone, Mail, MapPin, Send, ArrowRight } from "lucide-react";
import Image from "next/image";
import { STORE_CONFIG } from "@/constants/store-config";
import { Part0_Header } from "@/components/marketing/Part0_Header";
import { Part9_Footer } from "@/components/marketing/Part9_Footer";

export default function ContactPage() {
  const zaloLink = `https://zalo.me/${STORE_CONFIG.contact.phone.replace(/\s/g, '')}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-be-vietnam">
      <Part0_Header />
      
      <main className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-20 space-y-6">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold tracking-[0.2em] uppercase border border-rose-500/20"
            >
              Kết nối với Omemo
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-outfit font-bold"
            >
              Hãy để chúng tôi giúp bạn<br/>
              <span className="text-rose-500 italic">kể lại câu chuyện của mình</span>
            </motion.h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="glass-panel p-10 rounded-[3rem] border border-white/5 space-y-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                
                <h2 className="text-3xl font-outfit font-bold relative z-10">Thông tin liên hệ</h2>
                
                <div className="space-y-6 relative z-10">
                  <a href={zaloLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group/item">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all duration-300">
                      <Image src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" width={24} height={24} className="brightness-0 invert group-hover/item:brightness-100 group-hover/item:invert-0" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Zalo Tư Vấn</p>
                      <p className="text-xl font-bold font-outfit text-blue-400 group-hover/item:text-blue-300 transition-colors">Chat với Omemo</p>
                    </div>
                    <ArrowRight className="ml-auto opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-2 transition-all" />
                  </a>

                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Hotline</p>
                      <p className="text-xl font-bold font-outfit">{STORE_CONFIG.contact.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Email</p>
                      <p className="text-xl font-bold font-outfit">{STORE_CONFIG.contact.email}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 relative z-10">
                  <p className="text-zinc-400 leading-relaxed italic">
                    "Mỗi chú gấu Omemo là một chương mới trong cuốn nhật ký cảm xúc của bạn. Hãy để chúng tôi đồng hành cùng bạn thiết kế nên món quà hoàn hảo nhất."
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick QR Section */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center space-y-8"
            >
              <div className="glass-panel p-12 rounded-[4rem] border border-white/10 relative group">
                <div className="absolute inset-0 bg-rose-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 bg-white p-6 rounded-3xl shadow-2xl">
                  {/* Thay thế bằng mã QR Zalo thực tế nếu bạn có */}
                  <div className="w-64 h-64 bg-zinc-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <Image 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${zaloLink}`}
                      alt="Zalo QR"
                      width={256}
                      height={256}
                      className="object-contain"
                    />
                  </div>
                </div>
                
                <div className="mt-8 text-center space-y-2 relative z-10">
                  <p className="text-xl font-bold font-outfit">Quét để kết nối Zalo</p>
                  <p className="text-sm text-zinc-500">Tư vấn 24/7 về các mẫu gấu & kỷ vật</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full bg-rose-500/20" />
                <div className="w-3 h-3 rounded-full bg-rose-500/40" />
                <div className="w-3 h-3 rounded-full bg-rose-500/60" />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Part9_Footer />
    </div>
  );
}
