"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, Heart, X, MessageSquare, ShoppingBag, Home } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "../shared/MagneticButton";

export const Part0_Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Trang chủ", href: "/", icon: Home },
    { name: "Cửa hàng", href: "/shop", icon: ShoppingBag },
    { name: "Liên hệ", href: "/contact", icon: MessageSquare },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    if (href.includes("#")) {
      const hash = href.split("#")[1];
      const element = document.getElementById(hash);
      
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false);
      }
      // Nếu không tìm thấy element (đang ở trang khác), hãy để Link mặc định xử lý chuyển trang
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/10 backdrop-blur-xl h-20 flex justify-between items-center px-margin-mobile md:px-margin-desktop transition-all duration-700 animate-in fade-in slide-in-from-top-4">
        <MagneticButton distance={0.5}>
          <button 
            onClick={() => setIsOpen(true)}
            className="text-on-surface-variant hover:text-secondary transition-colors duration-300 p-2 relative group"
          >
            <Menu className="w-6 h-6" />
            <div className="absolute inset-0 bg-secondary/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
          </button>
        </MagneticButton>
        
        <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform duration-500 group-hover:scale-110">
              <Image 
                src="/assets/brand/only_logo_transparent.png" 
                alt="Omemo Logo" 
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
          <span className="text-2xl font-outfit font-bold tracking-[0.2em] text-foreground uppercase pt-1 group-hover:text-secondary transition-colors duration-300">
            Omemo
          </span>
        </Link>

        <MagneticButton distance={0.5}>
          <Link 
            href="/shop"
            className="text-on-surface-variant hover:text-secondary transition-colors duration-300 p-2 relative group flex items-center justify-center"
          >
            <Heart className="w-6 h-6" />
            <div className="absolute inset-0 bg-secondary/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
          </Link>
        </MagneticButton>
      </header>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] z-[70] bg-zinc-950 border-r border-white/5 p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-xl font-outfit font-black tracking-widest text-primary uppercase">Menu</span>
                <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="flex items-center gap-4 text-2xl font-outfit font-bold text-zinc-400 hover:text-primary transition-colors group"
                  >
                    <link.icon className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-white/5">
                <p className="text-xs text-zinc-600 font-be-vietnam uppercase tracking-widest mb-4">Omemo brand</p>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5" />
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
