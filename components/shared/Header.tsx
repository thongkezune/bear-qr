"use client";

import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl">
      <nav className="glass h-16 rounded-2xl flex items-center justify-between px-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Bear<span className="text-rose-500">QR</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Link href="/products" className="hover:text-rose-500 transition-colors">Sản phẩm</Link>
            <Link href="/about" className="hover:text-rose-500 transition-colors">Câu chuyện</Link>
            <Link href="/stores" className="hover:text-rose-500 transition-colors">Hệ thống cửa hàng</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-500 dark:text-zinc-300 hover:text-rose-500 md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          
          <button className="h-10 px-5 rounded-xl bg-zinc-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-all dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm">
            Giỏ hàng <ShoppingBag className="w-4 h-4 ml-1" />
          </button>
        </div>
      </nav>
    </header>
  );
}
