import { Part0_Header } from "@/components/marketing/Part0_Header";
import { Part9_Footer } from "@/components/marketing/Part9_Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Part0_Header />
      <main className="flex-1">
        {children}
      </main>
      <Part9_Footer />
    </div>
  );
}
