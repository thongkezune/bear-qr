"use client";

import { useState } from "react";
import Intro from "@/components/shared/Intro";
import { motion } from "framer-motion";
import { Part1_Hero } from "@/components/marketing/Part1_Hero";
import { Part2_InteractiveDemo } from "@/components/marketing/Part2_InteractiveDemo";
import { Part3_Product } from "@/components/marketing/Part3_Product";
import { Part5_Video } from "@/components/marketing/Part5_Video";
import { Part6_Bento } from "@/components/marketing/Part6_Bento";
import { Part7_CTA } from "@/components/marketing/Part7_CTA";
import { Part8_QuickAccess } from "@/components/marketing/Part8_QuickAccess";

export default function Home() {
  const [showContent, setShowContent] = useState(false);

  return (
    <main className="relative min-h-screen bg-background">
      {!showContent && <Intro onComplete={() => setShowContent(true)} />}

      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col"
        >
          <Part1_Hero />
          
          <Part2_InteractiveDemo />
          
          <Part3_Product />

          <Part5_Video />
          
          <Part6_Bento />
          
          <Part7_CTA />
          
          {/* Quick Access remains as a utility */}
          <Part8_QuickAccess />
        </motion.div>
      )}
    </main>
  );
}
