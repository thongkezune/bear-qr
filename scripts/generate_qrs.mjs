import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Thiết lập môi trường
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Khởi tạo Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Lỗi: Không tìm thấy biến môi trường Supabase trong .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tham số đầu vào default
let count = 1;
let urlPrefix = "http://localhost:3000/m/";
let logoUrl = "https://bearqr.com/logo.png"; // Có thể thay bằng base64 hoặc logo local

// Parse arguments
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--count' && args[i + 1]) count = parseInt(args[++i], 10);
  if (args[i] === '--url' && args[i + 1]) urlPrefix = args[++i];
}

// Hàm sinh logo/QR svg
function renderArtisticSVG(qrData, shortId) {
  const size = qrData.modules.size;
  const data = qrData.modules.data;
  const margin = 4; // Tăng Quiet Zone lên chuẩn 4
  const viewSize = size + margin * 2;
  const blockSize = 10;
  const docSize = viewSize * blockSize;

  let svgPaths = [];

  // Anchor logic (3 ô vuông lớn ở góc)
  function isAnchor(r, c) {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= size - 7) return true;
    if (r >= size - 7 && c < 7) return true;
    return false;
  }

  // Vẽ 3 ô định vị chuẩn xác (Black -> White -> Black)
  const anchors = [
    { x: margin, y: margin },
    { x: margin + size - 7, y: margin },
    { x: margin, y: margin + size - 7 }
  ];

  for (let a of anchors) {
    const ax = a.x * blockSize;
    const ay = a.y * blockSize;
    
    // 1. Lớp ngoài (7x7)
    svgPaths.push(`<rect x="${ax}" y="${ay}" width="${7 * blockSize}" height="${7 * blockSize}" rx="${1.5 * blockSize}" fill="#18181b" />`);
    // 2. Lớp giữa trắng (5x5) - Tạo khoảng rỗng
    svgPaths.push(`<rect x="${ax + blockSize}" y="${ay + blockSize}" width="${5 * blockSize}" height="${5 * blockSize}" rx="${blockSize}" fill="#ffffff" />`);
    // 3. Lớp trong cùng (3x3)
    svgPaths.push(`<rect x="${ax + 2 * blockSize}" y="${ay + 2 * blockSize}" width="${3 * blockSize}" height="${3 * blockSize}" rx="${0.8 * blockSize}" fill="#18181b" />`);
  }

  // Lỗ ở giữa chừa khoảng cho logo (Chỉ chừa 7x7 để an toàn dữ liệu)
  const centerStart = Math.floor(size / 2) - 3;
  const centerEnd = Math.floor(size / 2) + 3;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isAnchor(r, c)) continue;
      
      // Không vẽ module vào vùng logo
      if (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) {
        continue;
      }

      if (data[r * size + c]) {
        // Vẽ module tròn cho dữ liệu và alignment patterns
        const cx = (c + margin) * blockSize + blockSize / 2;
        const cy = (r + margin) * blockSize + blockSize / 2;
        svgPaths.push(`<circle cx="${cx}" cy="${cy}" r="${blockSize * 0.48}" fill="#18181b" />`);
      }
    }
  }

  // Thêm Logo BearQR (Thu nhỏ hơn một chút để tăng tính bền vững dữ liệu)
  const logoSize = 6 * blockSize;
  const logoCenter = (margin + size / 2) * blockSize - logoSize / 2;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${docSize} ${docSize}" width="1024" height="1024">
  <rect width="100%" height="100%" fill="#ffffff" />
  ${svgPaths.join('\n  ')}
  <circle cx="${docSize/2}" cy="${docSize/2}" r="${logoSize/1.7}" fill="#ffffff" />
  <image href="${logoUrl}" x="${logoCenter}" y="${logoCenter}" width="${logoSize}" height="${logoSize}" />
</svg>
  `.trim();
}

async function bulkGenerate() {
  console.log(`Bắt đầu chiến dịch tạo ${count} mã QR...`);
  console.log(`Đích đến link (Tiền tố): ${urlPrefix}`);

  const outputDir = path.join(__dirname, 'output_qrs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Tiền xử lý: Rút toàn bộ ID trong CSDL để đảm bảo bọc lót chống trùng lặp tuyệt đối
  console.log("Đang quét đối chiếu danh bạ DB để tự động chống trùng lặp mã...");
  const { data: existingMoments } = await supabase.from('moments').select('short_id');
  const usedIds = new Set(existingMoments?.map(m => m.short_id) || []);

  let successCount = 0;

  for (let i = 0; i < count; i++) {
    let shortId;
    // Thuật toán gác cổng: Sinh mã mới liên tục cho đến khi tìm được mã độc nhất chưa ai dùng
    do {
      shortId = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
    } while (usedIds.has(shortId));
    
    // Ghi nhớ mã vừa sinh để chống trùng trong chính đợt chạy này
    usedIds.add(shortId);

    const link = `${urlPrefix}${shortId}`;

    try {
      // 1. Lưu vào Database (chưa kích hoạt)
      const { error } = await supabase.from('moments').insert({
        short_id: shortId,
        is_activated: false,
        title: "Kỉ niệm bí ẩn", // Tên ngẫu nhiên cho có
      });

      if (error) {
        console.error(`[Lỗi] Không thể nạp ${shortId} lên CSDL:`, error.message);
        continue;
      }

      // 2. Tạo logic dữ liệu ma trận mã QR mức H
      const qrData = QRCode.create(link, { errorCorrectionLevel: 'H' });
      
      // 3. Render file Vector
      const svg = renderArtisticSVG(qrData, shortId);
      const filePath = path.join(outputDir, `bearqr_${shortId}.svg`);
      
      fs.writeFileSync(filePath, svg);
      console.log(`✅ [${i+1}/${count}] Đã sinh QR: ${filePath}`);
      successCount++;
    } catch (err) {
      console.error(`[Lỗi vòng lặp ${i+1}] ${err.message}`);
    }
  }

  console.log(`\n🎉 Hoàn tất! Đã tạo thành công ${successCount}/${count} Gấu. Lấy file tại "scripts/output_qrs/".`);
}

bulkGenerate();
