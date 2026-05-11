"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ShoppingBag, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

export const Part3_Product = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragX = useMotionValue(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/store/products');
        const data = await res.json();
        const fetchedProducts = data.products || [];
        
        if (fetchedProducts.length > 0) {
          // Đảm bảo có ít nhất 5 item để hiển thị đẹp nhất
          let list = [...fetchedProducts];
          while (list.length < 5 && list.length > 0) {
            list = [...list, ...fetchedProducts.map((p: Product) => ({ ...p, id: p.id + "_copy_" + Math.random() }))];
          }
          setProducts(list);
        } else {
          // Fallback data
          const demo = [
            { id: "1", name: "Gấu Bông Tim Hồng", description: "Mềm mại và ấm áp như vòng tay mẹ.", price: 350000, image_url: "", category: "Tình yêu" },
            { id: "2", name: "Gấu Nâu Kỷ Niệm", description: "Lưu giữ những khoảnh khắc đáng nhớ nhất.", price: 420000, image_url: "", category: "Kỷ niệm" },
            { id: "3", name: "Gấu Trắng Chữa Lành", description: "Xua tan muộn phiền, mang lại bình yên.", price: 380000, image_url: "", category: "Chữa lành" },
            { id: "4", name: "Gấu Xám Tri Kỷ", description: "Người bạn đồng hành trong mọi hành trình.", price: 450000, image_url: "", category: "Bạn bè" },
            { id: "5", name: "Gấu Vàng May Mắn", description: "Mang lại niềm vui và sự thịnh vượng.", price: 390000, image_url: "", category: "May mắn" },
          ];
          setProducts(demo);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) nextSlide();
    else if (info.offset.x > threshold) prevSlide();
  };

  if (loading && products.length === 0) {
    return (
      <div className="py-32 flex justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  const getPosition = (index: number) => {
    const total = products.length;
    const diff = (index - currentIndex + total) % total;
    
    if (diff === 0) return "center";
    if (diff === 1) return "innerRight";
    if (diff === 2) return "outerRight";
    if (diff === total - 1) return "innerLeft";
    if (diff === total - 2) return "outerLeft";
    return "hidden";
  };

  const variants = {
    center: { x: "0%", scale: 1, zIndex: 10, opacity: 1, filter: "blur(0px)", rotateY: 0 },
    innerLeft: { x: "-55%", scale: 0.75, zIndex: 5, opacity: 0.6, filter: "blur(3px)", rotateY: 25 },
    innerRight: { x: "55%", scale: 0.75, zIndex: 5, opacity: 0.6, filter: "blur(3px)", rotateY: -25 },
    outerLeft: { x: "-95%", scale: 0.5, zIndex: 2, opacity: 0.2, filter: "blur(8px)", rotateY: 45 },
    outerRight: { x: "95%", scale: 0.5, zIndex: 2, opacity: 0.2, filter: "blur(8px)", rotateY: -45 },
    hidden: { x: "0%", scale: 0.3, zIndex: 0, opacity: 0, filter: "blur(15px)", rotateY: 0 },
  };

  return (
    <section id="products" className="py-24 px-margin-mobile md:px-margin-desktop bg-zinc-950 overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="inline-block px-4 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold tracking-[0.2em] uppercase border border-rose-500/20"
          >
            BỘ SƯU TẬP QUÀ TẶNG
          </motion.span>
          <h3 className="text-4xl md:text-6xl font-outfit font-semibold text-white">
            Những người bạn <span className="text-rose-500 italic">giữ hộ ký ức</span>
          </h3>
        </div>

        <div className="relative h-[550px] md:h-[650px] flex items-center justify-center perspective-1000">
          {/* Invisible Drag Area */}
          <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing"
            style={{ x: dragX }}
          />

          {/* Carousel Items Container */}
          <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => {
                const pos = getPosition(index);
                if (pos === "hidden") return null;

                return (
                  <motion.div
                    key={product.id}
                    initial="hidden"
                    animate={pos}
                    exit="hidden"
                    variants={variants}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute w-[260px] md:w-[380px] aspect-[3/4.2] pointer-events-none"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div className="w-full h-full glass-panel rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative group">
                      <Image
                        src={product.image_url || "https://images.unsplash.com/photo-1559454403-b8fb88521f11?q=80&w=800"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 380px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-80" />
                      
                      {/* Product Info - Only fully visible in center */}
                      <div className={`absolute bottom-0 left-0 right-0 p-8 transition-all duration-700 ${pos === "center" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-2">{product.category}</span>
                        <h4 className="text-2xl md:text-3xl font-outfit font-bold text-white mb-2">{product.name}</h4>
                        <p className="text-white/60 text-sm mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-black text-rose-500 font-outfit tracking-tighter">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                          </div>
                          <Link 
                            href="/shop"
                            className="p-4 bg-white text-black rounded-2xl hover:bg-rose-500 transition-all pointer-events-auto shadow-lg"
                          >
                            <ShoppingBag size={24} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-3 mt-4">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1 rounded-full transition-all duration-500 ${currentIndex === i ? "w-12 bg-rose-500" : "w-4 bg-white/10"}`}
            />
          ))}
        </div>

        {/* Call to Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex justify-center"
        >
          <Link 
            href="/shop"
            className="group relative px-12 py-5 bg-rose-500 text-black font-bold rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.3)] hover:shadow-[0_0_70px_rgba(244,63,94,0.5)] transition-all flex items-center gap-3"
          >
            <span className="relative z-10 text-lg uppercase tracking-widest">Thăm Cửa Hàng</span>
            <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-black rounded-full group-hover:translate-x-1 transition-transform duration-300">
              <ChevronRight size={18} className="text-rose-500" />
            </div>
            
            {/* Glossy Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Link>
        </motion.div>
      </div>
      
      {/* Background Decorative Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-outfit font-black text-white/[0.02] pointer-events-none select-none uppercase -z-10 tracking-tighter">
        Omemo
      </div>
    </section>
  );
};
