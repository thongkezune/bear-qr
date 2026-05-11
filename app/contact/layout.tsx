import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên hệ với Omemo - Hỗ trợ & Tư vấn",
  description: "Kết nối với Omemo qua Zalo, Hotline hoặc Email để được tư vấn về cách tạo nên những món quà ký ức ý nghĩa nhất.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
