"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Heart, 
  ArrowRight, 
  X, 
  Smartphone, 
  User, 
  Phone, 
  MapPin, 
  CreditCard,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { STORE_CONFIG } from "@/constants/store-config";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Info, 2: Payment, 3: Success

  // Form Checkout
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("store_products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) setProducts(data);
    setLoading(false);
  };

  const categories = ["Tất cả", ...Array.from(new Set(products.map(p => p.category || "Kỷ niệm")))];
  
  const filteredProducts = selectedCategory === "Tất cả" 
    ? products 
    : products.filter(p => (p.category || "Kỷ niệm") === selectedCategory);

  const handleStartCheckout = (product: Product) => {
    setSelectedProduct(product);
    setShowCheckout(true);
    setCheckoutStep(1);
  };

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const totalPrice = selectedProduct!.price + STORE_CONFIG.shipping.fee;

    const { data, error } = await (supabase
      .from("store_orders") as any)
      .insert([{
        product_id: selectedProduct!.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        total_price: totalPrice,
        status: 'pending'
      }])
      .select();

    if (error) {
      alert("Lỗi đặt hàng: " + error.message);
    } else {
      setOrderId(data[0].id);
      setCheckoutStep(2);
    }
    setIsSubmitting(false);
  };

  // Hàm tạo link VietQR
  const getVietQRUrl = () => {
    if (!selectedProduct) return "";
    const amount = selectedProduct.price + STORE_CONFIG.shipping.fee;
    const description = `OMEMO ${orderId.slice(0, 8)}`;
    return `https://img.vietqr.io/image/${STORE_CONFIG.payment.bankId}-${STORE_CONFIG.payment.accountNumber}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${STORE_CONFIG.payment.accountName}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-outfit pb-20">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <ShoppingBag size={14} />
            <span>Omemo Gift Store</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
          >
            Kệ gấu <span className="text-rose-500 italic">Kỷ niệm</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 max-w-2xl mx-auto text-lg"
          >
            Mỗi chú gấu là một chiếc hộp chứa đựng những ký ức vô hình. Hãy chọn một kỷ vật để trao gửi tâm tình.
          </motion.p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-6 mb-12 sticky top-24 z-30">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-bold transition-all ${
                selectedCategory === cat 
                  ? "bg-rose-500 text-black" 
                  : "bg-white/5 text-zinc-500 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/5 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative flex flex-col"
              >
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-rose-500/30 transition-all duration-500 shadow-2xl">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                      <Smartphone size={48} />
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                    <button 
                      onClick={() => handleStartCheckout(product)}
                      className="w-full bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    >
                      <span>Mua ngay</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 px-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{product.category || "Kỷ niệm"}</span>
                    <Heart size={16} className="text-zinc-800 hover:text-rose-500 transition-colors cursor-pointer" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-500 transition-colors">{product.name}</h3>
                  <p className="text-zinc-500 text-sm line-clamp-1 mb-4">{product.description}</p>
                  <div className="text-2xl font-bold text-white">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowCheckout(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {checkoutStep === 1 ? "Thông tin nhận gấu" : 
                     checkoutStep === 2 ? "Thanh toán Kỷ niệm" : "Đã nhận đơn hàng"}
                  </h2>
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">
                    {checkoutStep === 1 ? "Bước 1: Địa chỉ giao hàng" : 
                     checkoutStep === 2 ? "Bước 2: Quét mã QR" : "Thành công"}
                  </p>
                </div>
                <button 
                  onClick={() => setShowCheckout(false)} 
                  className="p-3 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[70vh]">
                {checkoutStep === 1 && (
                  <form onSubmit={handleSubmitInfo} className="space-y-6">
                    {/* Selected Product Summary */}
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{selectedProduct.name}</h4>
                        <p className="text-rose-500 font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-2">Họ và tên</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                          <input 
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-rose-500 transition-colors"
                            placeholder="Tên người nhận..."
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-2">Số điện thoại</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                          <input 
                            required
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-rose-500 transition-colors"
                            placeholder="Số điện thoại nhận gấu..."
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-2">Địa chỉ giao hàng</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-4 text-zinc-600" size={18} />
                          <textarea 
                            required
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-rose-500 transition-colors resize-none"
                            placeholder="Địa chỉ chi tiết..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between mb-2">
                        <span className="text-zinc-500">Tiền gấu</span>
                        <span className="text-white font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span className="text-zinc-500">Phí vận chuyển</span>
                        <span className="text-white font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(STORE_CONFIG.shipping.fee)}</span>
                      </div>
                      <div className="flex justify-between text-xl mb-8">
                        <span className="text-white font-bold">Tổng cộng</span>
                        <span className="text-rose-500 font-black tracking-tight">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price + STORE_CONFIG.shipping.fee)}
                        </span>
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-rose-500 text-black py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-600 transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? "Đang xử lý..." : "Tiến hành thanh toán"}
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </form>
                )}

                {checkoutStep === 2 && (
                  <div className="text-center space-y-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-64 h-64 bg-white p-4 rounded-[2rem] shadow-2xl">
                        <img 
                          src={getVietQRUrl()} 
                          alt="VietQR Payment" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-zinc-500">Mã đơn hàng: <span className="text-white font-bold">#{orderId.slice(0, 8)}</span></p>
                        <p className="text-xs text-zinc-400">Vui lòng quét mã để thanh toán và giữ nguyên nội dung chuyển khoản</p>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Ngân hàng</span>
                        <span className="text-white font-bold">{STORE_CONFIG.payment.bankName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Số tài khoản</span>
                        <span className="text-white font-bold tracking-widest">{STORE_CONFIG.payment.accountNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Chủ tài khoản</span>
                        <span className="text-white font-bold">{STORE_CONFIG.payment.accountName}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setCheckoutStep(3)}
                      className="w-full bg-white text-black py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      <CheckCircle2 size={20} />
                      <span>Tôi đã chuyển khoản</span>
                    </button>
                  </div>
                )}

                {checkoutStep === 3 && (
                  <div className="text-center py-10 space-y-8">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-rose-500/20 blur-[40px] rounded-full" />
                      <div className="relative w-24 h-24 bg-rose-500 text-black rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={48} strokeWidth={3} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-white tracking-tight">Ký ức của bạn đang được chuẩn bị...</h3>
                      <p className="text-zinc-500">Cảm ơn bạn đã tin tưởng Omemo. Đơn hàng của bạn sẽ sớm được xử lý và gửi đi.</p>
                    </div>
                    <div className="pt-6">
                      <button 
                        onClick={() => setShowCheckout(false)}
                        className="w-full border border-white/10 text-white/60 py-5 rounded-2xl font-bold uppercase tracking-widest hover:text-white transition-colors"
                      >
                        Tiếp tục xem gấu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
