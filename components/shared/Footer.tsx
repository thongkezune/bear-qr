import Link from "next/link";
import { Globe, Send, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-100 py-12 px-6 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="text-2xl font-bold tracking-tight mb-4 inline-block">
            Omemo
          </Link>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
            Hệ sinh thái lưu giữ khoảnh khắc quà tặng số 1 Việt Nam. 
            Trao gửi yêu thương qua từng con gấu bông.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4">Sản phẩm</h4>
          <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li><Link href="/products" className="hover:text-rose-500">Gấu Bông Tình Yêu</Link></li>
            <li><Link href="/products" className="hover:text-rose-500">Gấu Bông Sinh Nhật</Link></li>
            <li><Link href="/products" className="hover:text-rose-500">Gói Lưu Trữ Plus</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">Kết nối</h4>
          <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
            <Link href="#" className="hover:text-rose-500"><Globe className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-rose-500"><Send className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-rose-500"><MessageCircle className="w-5 h-5" /></Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-zinc-50 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 dark:border-zinc-900">
        <p>© 2026 Omemo. Tất cả quyền được bảo lưu.</p>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white">Chính sách bảo mật</Link>
          <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white">Điều khoản sử dụng</Link>
        </div>
      </div>
    </footer>
  );
}
