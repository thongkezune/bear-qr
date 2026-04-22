# 🐻 Cẩm nang sử dụng: Cỗ máy Sản Xuất Mã Omemo (Bulk QR Generator)

Document này sẽ hướng dẫn bạn cách vận hành kịch bản tự động (Script) để tạo ra hàng loạt mã QR theo ý muốn. Các mã QR này được chèn sẵn Logo, bo góc mềm mại ở giữa và tự động ghi vào Database dưới trạng thái rỗng để chờ phân phát cho người dùng.

## 🌟 Tính năng chính

- **Tùy biến SLL:** Sinh 1 mã hay 500 mã cùng một lúc đều được.
- **Tuỳ biến Đích đến:** Nối mã QR vào đường dẫn thử nghiệm (`localhost`) hoặc Website sống (`omemo.id.vn`).
- **Nghệ thuật & Sắc nét:** Sinh ra file SVG (Vector), giúp bạn in lên biển bạt khổng lồ hay tờ rơi đều giữ được đường nét sắc sảo, không bao giờ bị rỗ (vỡ pixel). Có sẵn lỗ hổng giữa mãng để chèn một tấm hình Đại diện tuỳ ý.
- **Tự Động Đăng Ký Kho:** Chạy xong là mã đã lọt vào CSDL Supabase, khách nhận mã quét là chui thẳng vào quy trình setup.

---

## 🚀 Hướng Dẫn Sử Dụng Nhập Môn

Bạn chỉ cần mở Terminal (cửa sổ lệnh) tại ổ thư mục **`bear-qr-web`** và gõ lệnh sau:

### 1. Dùng lúc đang test Web (Localhost)

Lệnh này ra lệnh cho cỗ máy: "Hãy sinh cho tôi **10** mã, trỏ về địa chỉ máy tính của tôi đang chạy dev!"

```bash
node scripts/generate_qrs.mjs --count 1 --url http://localhost:3000/m/
```

### 2. Dùng để in bán thật sự (Production)

Lệnh này ra lệnh cho cỗ máy: "Hãy sinh cho lô hàng **50** thẻ để tôi đem đi in, trỏ thẳng về website tên miền thật của dự án!".

```bash
node scripts/generate_qrs.mjs --count 50 --url https://omemo.id.vn/m/
```

_(Lưu ý: Bạn sửa chữ `omemo.id.vn` thành tên miền bạn đã mua)_

---

## 🛠 Giải phẫu các thông số tinh chỉnh (Parameters)

Script này chấp nhận các cơ chế điều khiển sau:

- `--count [số_lượng]` (Mặc định: 1): Số lượng mã cần tạo ra.
- `--url [tiền_tố_đường_dẫn_link]` (Mặc định: `http://localhost:3000/m/`): Điểm đến cuối cùng. Lệnh sẽ tự động móc nối chuỗi UUID độ dài 8 ký tự vào mép phải của URL này. (Ví dụ: `http://.../m/5a8b79f2`)

---

## 🎨 Thay đổi Logo Gấu ở tâm khối QR

Nếu bạn muốn thay đổi "bức hình trắng ở tâm" của mã bằng hình bạn đã vẽ, hãy làm quy trình này:

1. Mở file `scripts/generate_qrs.mjs` bằng VS Code.
2. Tìm đến dòng số **20**:
   ```javascript
   let logoUrl = "/assets/brand/logo.png";
   ```
3. Bạn có thể thay bằng các phương pháp:
   - Dùng đường dẫn tĩnh trên Internet (Ví dụ: `https://imgur.com/anh_gau.png`).
   - Đổi thành `../public/logo.svg` với đường dẫn file ở ổ cứng.
   - Hoặc mã hóa hình bằng dạng chuỗi (Base64 Data URI) nếu bạn là một cao thủ.

---

## 📂 Thành quả lấy máy chém (Output)

Tất cả các con bài thành phẩm sẽ ngoan ngoãn nằm rạp tại:
📁 `bear-qr-web/scripts/output_qrs/`

Tại đó, bạn sẽ thấy chúng dưới định dạng `.svg`. Bạn có thể copy vô Illustrator (AI) hay Photoshop, hoặc kéo vô chèn trực tiếp trên Canva để trang trí in ấn card nha! Chúc lô gấu nhà bạn tung hỉ gặt tiền ngập kho! 🤑
