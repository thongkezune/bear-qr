"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Youtube } from "lucide-react";

export const Part9_Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes("#")) {
      const hash = href.split("#")[1];
      const element = document.getElementById(hash);
      
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer id="footer" className="w-full py-20 border-t border-white/5 bg-zinc-950 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-6">
          <button onClick={scrollToTop} className="relative w-32 h-10 group">
            <Image 
              src="/assets/brand/only_logo_transparent.png" 
              alt="Omemo Logo" 
              fill
              className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </button>
          <p className="text-zinc-500 text-xs font-be-vietnam tracking-widest uppercase">
            Đừng để ký ức chỉ còn trong trí nhớ.
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap justify-center gap-8">
          <Link 
            href="/" 
            className="text-sm font-outfit font-bold text-zinc-400 hover:text-primary transition-colors tracking-widest uppercase"
          >
            Trang chủ
          </Link>
          <Link 
            href="/shop" 
            className="text-sm font-outfit font-bold text-zinc-400 hover:text-primary transition-colors tracking-widest uppercase"
          >
            Cửa hàng
          </Link>
          <Link 
            href="/contact" 
            className="text-sm font-outfit font-bold text-zinc-400 hover:text-primary transition-colors tracking-widest uppercase"
          >
            Liên hệ
          </Link>
        </nav>

        {/* Social & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-6">
          <div className="flex gap-6">
            <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Facebook size={20} /></a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Youtube size={20} /></a>
          </div>
          <div className="text-[10px] font-medium text-zinc-600 font-be-vietnam uppercase tracking-[0.2em]">
            © 2024 OMEMO BRAND. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </footer>
  );
};
