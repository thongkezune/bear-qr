import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminPassword, action, payload } = body;

    // 1. Xác thực quyền Admin Store
    // Gợi ý: Bạn nên thêm STORE_ADMIN_PASSWORD vào tệp .env
    const STORE_ADMIN_PASSWORD = process.env.STORE_ADMIN_PASSWORD || 'admin123';

    if (adminPassword !== STORE_ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Mật khẩu quản trị Store không chính xác.' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Cấu hình Server chưa hoàn tất (Thiếu Admin Client).' }, { status: 500 });
    }

    // 2. Thực hiện hành động Admin
    switch (action) {
      case 'FETCH_PRODUCTS':
        const { data: products, error: fetchError } = await (supabaseAdmin
          .from('store_products' as any) as any)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        return NextResponse.json({ products });

      case 'UPSERT_PRODUCT':
        const { id, ...productData } = payload;
        
        if (id) {
          // Update
          const { data: updated, error: updateError } = await (supabaseAdmin
            .from('store_products' as any) as any)
            .update(productData)
            .eq('id', id)
            .select()
            .single();
          if (updateError) throw updateError;
          return NextResponse.json({ product: updated });
        } else {
          // Insert
          const { data: inserted, error: insertError } = await (supabaseAdmin
            .from('store_products' as any) as any)
            .insert([productData])
            .select()
            .single();
          if (insertError) throw insertError;
          return NextResponse.json({ product: inserted });
        }

      case 'DELETE_PRODUCT':
        const { productId } = payload;
        if (!productId) throw new Error('Thiếu ID sản phẩm.');
        
        const { error: deleteError } = await (supabaseAdmin
          .from('store_products' as any) as any)
          .delete()
          .eq('id', productId);
        
        if (deleteError) throw deleteError;
        return NextResponse.json({ success: true });

      case 'GET_UPLOAD_URL':
        const { fileName } = payload;
        if (!fileName) throw new Error('Thiếu tên tệp.');

        // Tạo URL ký danh để upload lên bucket 'store'
        // Mặc định sử dụng bucket 'store', nếu chưa có bạn hãy tạo trong Supabase Dashboard
        const { data: signedData, error: signError } = await supabaseAdmin.storage
          .from('store')
          .createSignedUploadUrl(fileName);
        
        if (signError) {
          // Fallback nếu chưa có bucket 'store', thử dùng 'moments'
          const { data: fallbackData, error: fallbackError } = await supabaseAdmin.storage
            .from('moments')
            .createSignedUploadUrl(`store/${fileName}`);
          
          if (fallbackError) throw fallbackError;
          return NextResponse.json({ 
            signedUrl: fallbackData.signedUrl, 
            path: fallbackData.path,
            bucket: 'moments' 
          });
        }

        return NextResponse.json({ 
          signedUrl: signedData.signedUrl, 
          path: signedData.path,
          bucket: 'store' 
        });

      default:
        return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 });
    }

  } catch (err: any) {
    console.error('Store Manage API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
