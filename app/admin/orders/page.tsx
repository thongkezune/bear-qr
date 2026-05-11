"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Truck, 
  X,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_price: number;
  status: 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';
  created_at: string;
  product_id: string;
  store_products: {
    name: string;
    image_url: string;
  } | null;
}

const statusConfig = {
  pending: { label: "Chờ thanh toán", color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
  paid: { label: "Đã thanh toán", color: "text-blue-500", bg: "bg-blue-500/10", icon: CheckCircle2 },
  shipping: { label: "Đang giao", color: "text-purple-500", bg: "bg-purple-500/10", icon: Truck },
  completed: { label: "Hoàn thành", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", color: "text-zinc-500", bg: "bg-zinc-500/10", icon: X },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("store_orders")
      .select(`
        *,
        store_products (
          name,
          image_url
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) setOrders(data as any);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await (supabase
      .from("store_orders") as any)
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) alert("Lỗi cập nhật trạng thái: " + error.message);
    else fetchOrders();
  };

  const filteredOrders = orders.filter(order => 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Đơn hàng Mới</h1>
          <p className="text-zinc-500 text-sm">Theo dõi và quản lý các giao dịch mua kỷ vật</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="p-4 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên khách hoặc số điện thoại..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-rose-500 transition-colors"
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <p className="text-zinc-500">Chưa có đơn hàng nào khớp với tìm kiếm</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 hover:bg-white/[0.07] transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* Product Info */}
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                    {order.store_products?.image_url ? (
                      <img src={order.store_products.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800"><Package size={24}/></div>
                    )}
                  </div>
                  <div>
                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Mã đơn: #{order.id.slice(0,8)}</div>
                    <h3 className="text-lg font-bold text-white mb-1">{order.store_products?.name || "Sản phẩm không xác định"}</h3>
                    <div className="text-rose-500 font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price)}</div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-12 flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <User size={14} className="text-rose-500" />
                      <span className="font-bold">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Phone size={14} className="text-zinc-600" />
                      <span>{order.customer_phone}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-zinc-400 text-sm">
                    <MapPin size={14} className="text-zinc-600 mt-1 flex-shrink-0" />
                    <span className="line-clamp-2">{order.customer_address}</span>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
                  <div className="relative group/status">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs ${statusConfig[order.status].bg} ${statusConfig[order.status].color}`}>
                      {statusConfig[order.status].label}
                      <ChevronDown size={14} />
                    </div>
                    
                    {/* Status Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all z-50 p-2">
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <button 
                          key={key}
                          onClick={() => updateStatus(order.id, key)}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <config.icon size={14} className={config.color} />
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-zinc-600 text-[10px] font-bold uppercase whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
