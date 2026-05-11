"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Kiểm tra session (đơn giản bằng localStorage cho MVP)
    const session = localStorage.getItem("omemo_admin_session");
    const key = localStorage.getItem("omemo_admin_key");
    const validKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "omemo2024";

    if (!session || key !== validKey) {
      if (pathname !== "/admin/login") {
        router.push("/admin/login");
      } else {
        setIsLoading(false);
      }
    } else {
      setIsAuthorized(true);
      setIsLoading(false);
      if (pathname === "/admin/login") {
        router.push("/admin/store");
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("omemo_admin_session");
    localStorage.removeItem("omemo_admin_key");
    router.push("/admin/login");
  };

  if (isLoading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Không hiển thị layout cho trang login
  if (pathname === "/admin/login") return <>{children}</>;

  const menuItems = [
    { name: "Sản phẩm (Bears)", icon: Package, href: "/admin/store" },
    { name: "Đơn hàng (Orders)", icon: ShoppingCart, href: "/admin/orders" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-outfit flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 border-r border-white/5 flex-col p-6 bg-zinc-950">
        <div className="mb-12 flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-black">O</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Omemo Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                pathname === item.href 
                  ? "bg-rose-500 text-black font-bold shadow-[0_10px_20px_rgba(244,63,94,0.2)]" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 text-zinc-500 hover:text-rose-500 transition-colors mt-auto border-t border-white/5 pt-6"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header - Mobile */}
        <header className="lg:hidden h-16 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-rose-500 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-black">O</span>
            </div>
            <span className="font-bold text-sm uppercase tracking-widest">Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-400">
            <Menu size={24} />
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.aside 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-80 bg-zinc-950 z-[60] p-8 flex flex-col lg:hidden"
              >
                <div className="flex justify-between items-center mb-12">
                  <span className="text-xl font-bold">Omemo Admin</span>
                  <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
                </div>
                <nav className="flex-1 space-y-4">
                  {menuItems.map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-4 text-lg p-2 ${pathname === item.href ? "text-rose-500 font-bold" : "text-zinc-500"}`}
                    >
                      <item.icon size={24} />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
                <button 
                  onClick={handleLogout}
                  className="mt-auto flex items-center gap-4 text-zinc-500"
                >
                  <LogOut size={24} />
                  <span>Đăng xuất</span>
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
