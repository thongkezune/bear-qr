# Marketing Components Structure

Tài liệu này mô tả cấu trúc và thứ tự hiển thị của các thành phần (components) trong trang Landing Page của Omemo.

## 1. Quy tắc đặt tên
Các tệp được đặt tên theo định dạng `PartX_FunctionName.tsx` trong đó `X` là thứ tự hiển thị từ trên xuống dưới trên trang chủ.

## 2. Sơ đồ cấu trúc (Layout Flow)

| Component | Tên file | Chức năng |
| :--- | :--- | :--- |
| **Header** | `Part0_Header.tsx` | Thanh điều hướng (Global Marketing Layout) |
| **Hero** | `Part1_Hero.tsx` | Banner chính, Cinematic video background |
| **Narrative** | `Part2_Narrative.tsx` | Lời dẫn dắt, thông điệp cảm xúc |
| **Product** | `Part3_Product.tsx` | Trưng bày sản phẩm (Bear & QR Card) |
| **Journey** | `Part4_Journey.tsx` | Timeline hành trình khách hàng (API-driven) |
| **Video** | `Part5_Video.tsx` | Khu vực video giới thiệu chi tiết |
| **Bento** | `Part6_Bento.tsx` | Lưới tính năng (Bento Grid) |
| **CTA** | `Part7_CTA.tsx` | Nút kêu gọi hành động cuối trang |
| **Quick Access** | `Part8_QuickAccess.tsx` | Tiện ích truy cập nhanh qua Short ID |
| **Footer** | `Part9_Footer.tsx` | Chân trang (Global Marketing Layout) |

## 3. Nhật ký thay đổi (Dọn dẹp hệ thống)

Vào ngày 2026-05-09, các tệp sau đã được xóa do trùng lặp hoặc không còn sử dụng:
- `HeroSection.tsx`: Thay thế bởi `Part1_Hero.tsx` (Cinematic version).
- `BentoJourney.tsx`: Thay thế bởi logic linh hoạt hơn trong `Part4_Journey.tsx`.
- `InteractivePhoneDemo.tsx`: Tính năng cũ không còn nằm trong luồng hiển thị chính.

## 4. Lưu ý phát triển
- Toàn bộ components sử dụng **Tailwind CSS 4** và **Framer Motion 12**.
- Các hiệu ứng **Magnetic** được ưu tiên cho các nút bấm chính để tăng cảm giác "Premium".
- Đảm bảo giữ chuẩn SEO (Heading H1-H3) khi chỉnh sửa các phần này.
