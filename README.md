# Omemo - Ôm trọn từng ký ức 🧸✨

Omemo là nền tảng thương mại điện tử quà tặng kỷ vật số hóa cao cấp. Chúng tôi kết hợp giữa những chú gấu bông thủ công tinh xảo và công nghệ mã hóa ký ức (Video, Hình ảnh, Âm thanh) thông qua mã định danh thông minh.

## 🚀 Tính năng nổi bật

- **Modern Luxury Noir UI**: Giao diện tối sang trọng với hiệu ứng Glassmorphism và Framer Motion mượt mà.
- **3D Product Carousel**: Trải nghiệm xem sản phẩm xoay vòng 3D trực quan và cao cấp.
- **Interactive Demo**: Giả lập quá trình quét mã QR để "đánh thức" ký ức ngay trên trình duyệt.
- **Admin Dashboard**: Quản lý sản phẩm, đơn hàng và cấu hình cửa hàng thông qua giao diện quản trị bảo mật.
- **VietQR Integration**: Tự động tạo mã QR thanh toán ngân hàng chính xác cho từng đơn hàng.
- **Zalo Connect**: Tích hợp kênh tư vấn trực tiếp qua Zalo cho khách hàng.

## 🛠 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS 4.0
- **Database & Storage**: Supabase
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Payment**: VietQR API

## 📦 Hướng dẫn cài đặt

1. **Clone dự án**:
   ```bash
   git clone https://github.com/your-username/bear-qr-web.git
   cd bear-qr-web
   ```

2. **Cài đặt phụ thuộc**:
   ```bash
   npm install
   ```

3. **Cấu hình môi trường**:
   Tạo file `.env.local` và điền các thông số sau:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_ADMIN_KEY=your_admin_secret_key
   ```

4. **Chạy thực tế**:
   ```bash
   npm run dev
   ```

## 🗄 Cấu trúc Database

Dự án yêu cầu các bảng sau trong Supabase:
- `store_products`: Lưu danh sách gấu bông.
- `store_orders`: Lưu thông tin đơn hàng khách đặt.
- `marketing_journey`: (Tùy chọn) Lưu lịch sử thương hiệu.

## 📄 Bản quyền

Dự án được phát triển bởi **Saitama** & Team Omemo. Toàn bộ giao diện và ý tưởng thuộc bản quyền của Omemo Brand.
