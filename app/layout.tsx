import type { Metadata } from "next";
import { Outfit, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "Omemo - Ôm trọn từng ký ức",
  description: "Trải nghiệm quà tặng kỉ niệm số hóa độc đáo nhất. Gắn kết yêu thương qua từng mã định danh Omemo.",
  keywords: "gấu bông, quà tặng, nhãn QR, omemo, kỷ niệm, quà tặng số",
  openGraph: {
    title: "Omemo - Lưu giữ khoảnh khắc",
    description: "Quà tặng tích hợp mã lưu trữ video/hình ảnh Omemo.",
    type: "website",
    locale: "vi_VN",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className={`${outfit.variable} ${beVietnam.variable} font-sans antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen flex flex-col relative`}
      >
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
