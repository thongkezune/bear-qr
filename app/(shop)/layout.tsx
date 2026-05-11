import type { Metadata } from "next";
import { Part0_Header } from "@/components/marketing/Part0_Header";
import { Part9_Footer } from "@/components/marketing/Part9_Footer";

export const metadata: Metadata = {
  title: "Cửa hàng Omemo - Chọn kỷ vật yêu thương",
  description: "Khám phá bộ sưu tập gấu bông Omemo tích hợp công nghệ lưu giữ ký ức số. Món quà hoàn hảo cho người thân yêu.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <Part0_Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Part9_Footer />
    </div>
  );
}
