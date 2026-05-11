"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Image as ImageIcon, X, Save, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
}

export default function AdminStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("store_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setProducts(data);
    setLoading(false);
  };

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setPrice(product.price.toString());
      setDescription(product.description);
      setImageUrl(product.image_url);
    } else {
      setEditingProduct(null);
      setName("");
      setPrice("");
      setDescription("");
      setImageUrl("");
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("store-assets")
      .upload(filePath, file);

    if (uploadError) {
      alert("Lỗi upload ảnh: " + uploadError.message);
    } else {
      const { data } = supabase.storage.from("store-assets").getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      name,
      price: parseFloat(price),
      description,
      image_url: imageUrl,
      is_active: true
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("store_products")
        .update(productData)
        .eq("id", editingProduct.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase
        .from("store_products")
        .insert([productData]);
      if (error) alert(error.message);
    }

    setIsModalOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    
    const { error } = await supabase
      .from("store_products")
      .delete()
      .eq("id", id);
    
    if (error) alert(error.message);
    else fetchProducts();
  };

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Kệ Gấu Omemo</h1>
          <p className="text-zinc-500 text-sm">Quản lý các kỷ vật gấu bông đang trưng bày trên cửa hàng</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-black font-bold px-6 py-4 rounded-2xl transition-all shadow-lg shadow-rose-500/20 active:scale-95"
        >
          <Plus size={20} />
          <span>Thêm Gấu mới</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
          <Package size={48} className="text-zinc-700 mb-4" />
          <p className="text-zinc-500">Chưa có chú gấu nào trên kệ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div 
              layout
              key={product.id}
              className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-rose-500/30 transition-all flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-zinc-900">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleOpenModal(product)} className="p-3 bg-black/50 backdrop-blur-md rounded-xl text-white hover:bg-rose-500 hover:text-black transition-all">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-3 bg-black/50 backdrop-blur-md rounded-xl text-white hover:bg-rose-500 hover:text-black transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                <p className="text-rose-500 font-bold text-lg mb-3">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </p>
                <p className="text-zinc-500 text-sm line-clamp-2">{product.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-zinc-950 z-10">
                <h2 className="text-2xl font-bold">{editingProduct ? "Sửa thông tin Gấu" : "Thêm Gấu mới"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
                {/* Image Upload Area */}
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Hình ảnh kỷ vật</label>
                  <div className="relative aspect-video rounded-[2rem] border-2 border-dashed border-white/10 overflow-hidden bg-white/5 group">
                    {imageUrl ? (
                      <img src={imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-zinc-500">
                        <ImageIcon size={48} />
                        <span className="text-sm">Chưa có ảnh</span>
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <div className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold">
                        <Plus size={18} />
                        <span>{uploading ? "Đang tải..." : "Chọn ảnh từ máy"}</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Tên sản phẩm</label>
                    <input 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Gấu Bông Tim Hồng"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Giá bán (VND)</label>
                    <input 
                      required
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ví dụ: 350000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Mô tả câu chuyện</label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Hãy kể về ý nghĩa của chú gấu này..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full bg-rose-500 text-black py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-600 transition-all disabled:opacity-50"
                >
                  <Save size={20} />
                  <span>{loading ? "Đang lưu..." : "Lưu Sản Phẩm"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
