import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { momentId, adminPasswordHash, action, payload } = await req.json();

    if (!momentId || !adminPasswordHash) {
      return NextResponse.json({ error: 'Thiếu thông tin xác thực.' }, { status: 400 });
    }

    const cleanId = momentId.trim().toLowerCase();
    console.log(`[API Manage] Processing ID: ${cleanId}, Action: ${action}`);

    // Kiểm tra xem Service Key có tồn tại không
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
       console.error("[API Manage] THIẾU SUPABASE_SERVICE_ROLE_KEY trong môi trường!");
       return NextResponse.json({ error: 'Cấu hình Server chưa hoàn tất (Thiếu Service Key). Vui lòng khởi động lại npm run dev.' }, { status: 500 });
    }

    // 1. Kiểm tra quyền Admin (Verify Password Hash)
    const { data: moments, error: authError } = await supabaseAdmin
      .from('moments')
      .select('short_id, admin_password_hash, is_activated, is_private')
      .ilike('short_id', cleanId)
      .limit(1);

    if (authError) {
      console.error(`[API Manage] Database Error:`, authError);
      return NextResponse.json({ error: `Lỗi kết nối Database: ${authError.message}.` }, { status: 500 });
    }

    const moment = moments && moments.length > 0 ? moments[0] : null;

    if (!moment) {
      console.error(`[API Manage] Moment not found for ID: ${cleanId}`);
      return NextResponse.json({ error: `Không tìm thấy kỉ niệm với mã: ${cleanId}.` }, { status: 404 });
    }

    // LUXURY FIX: Chỉ kiểm tra mật khẩu nếu Gấu đã thực sự được kích hoạt và có mật khẩu lưu sẵn.
    // Nếu gấu chưa có mật khẩu (null/empty), chúng ta cho phép đặt mật khẩu lần đầu (cứu lỗi kẹt).
    if (moment.is_activated && moment.admin_password_hash) {
      if (moment.admin_password_hash !== adminPasswordHash) {
        console.error(`[API Manage] Auth Failed. DB Hash: ${moment.admin_password_hash}, Received: ${adminPasswordHash}`);
        return NextResponse.json({ error: 'Mật khẩu Admin không chính xác. Vui lòng kiểm tra lại.' }, { status: 401 });
      }
    }

    // 2. Thực hiện hành động Admin (Dùng Service Role nên bypass RLS)
    switch (action) {
      case 'ACTIVATE_OR_UPDATE':
        const { error: updateError } = await supabaseAdmin
          .from('moments')
          .update({
            ...payload,
            admin_password_hash: adminPasswordHash,
            is_activated: true
          })
          .ilike('short_id', cleanId);
        
        if (updateError) throw updateError;
        return NextResponse.json({ success: true });

      case 'SAVE_MEDIA_LIST':
        const { media: mediaPayload } = payload;
        if (!mediaPayload || !Array.isArray(mediaPayload)) throw new Error('Danh sách media không hợp lệ.');

        console.log(`[API Manage] Smart Saving playlist for moment: ${cleanId}. Items: ${mediaPayload.length}`);
        
        try {
          // 2. Lấy danh bạ media HIỆN TẠI để đối soát chống xoá nhầm
          const { data: dbMedia } = await supabaseAdmin
            .from('moment_media')
            .select('*')
            .ilike('moment_id', cleanId);

          // 3. THUẬT TOÁN THÔNG MINH (Reclaim IDs): 
          // Nếu Frontend gửi lên file có storage_path khớp với DB nhưng chưa có ID thì gán lại ID cũ.
          const processedMedia = mediaPayload.map((m: any) => {
            if (!m.id && m.storage_path && dbMedia) {
              const existing = dbMedia.find((dbM: any) => dbM.storage_path === m.storage_path);
              if (existing) return { ...m, id: existing.id }; // Tìm thấy 'anh em thất lạc'!
            }
            return m;
          });

          // 4. Xác định các bản ghi thực sự cần giữ lại
          const keptIds = processedMedia
            .filter((m: any) => m.id)
            .map((m: any) => m.id);

          // 5. Xóa những mục KHÔNG còn nằm trong danh sách (Surgical Delete)
          const deleteQuery = supabaseAdmin
            .from('moment_media')
            .delete()
            .ilike('moment_id', cleanId);
          
          if (keptIds.length > 0) {
            // FIX: PostgREST yêu cầu định dạng (id1,id2,...) cho toán tử IN/NOT.IN
            const { error: delErr } = await deleteQuery.filter('id', 'not.in', `(${keptIds.join(',')})`);
            if (delErr) throw delErr;
          } else {
            const { error: delErr } = await deleteQuery;
            if (delErr) throw delErr;
          }

          // 6. Xử lý danh sách mới (Lọc bỏ rác và bảo vệ URL cũ)
          const newItems: any[] = [];
          const existingItems: any[] = [];

          for (let idx = 0; idx < processedMedia.length; idx++) {
            const m = processedMedia[idx];
            
            // CHẶN: Không lưu những tệp không có URL và tệp rác (Placeholders)
            if (!m.url || m.url === "" || m.storage_path?.startsWith('pending-')) {
              console.log(`[API Manage] Skipping placeholder/invalid item: ${m.storage_path}`);
              continue;
            }

            const row: any = {
              moment_id: moment.short_id,
              url: m.url,
              type: m.type,
              storage_path: m.storage_path,
              thumbnail_url: m.thumbnail_url,
              order_index: idx,
              title_memory: m.title_memory || ""
            };

            if (m.id) {
              // BẢO VỆ: Nếu tệp cũ trong DB đã có URL mà tệp gửi lên lại trống (lỗi sync) thì giữ lại URL cũ
              const original = dbMedia?.find((dbM: any) => dbM.id === m.id);
              if (original && (!row.url || row.url === "") && original.url) {
                row.url = original.url;
              }
              // Tương tự cho thumbnail
              if (original && (!row.thumbnail_url || row.thumbnail_url === "") && original.thumbnail_url) {
                row.thumbnail_url = original.thumbnail_url;
              }

              existingItems.push({ ...row, id: m.id }); 
            } else {
              newItems.push(row); 
            }
          }

          // Insert file mới
          if (newItems.length > 0) {
            const { data: insertedItems, error: insErr } = await supabaseAdmin.from('moment_media').insert(newItems).select();
            if (insErr) throw insErr;
            
            // Xử lý lưu tin nhắn Admin cho các file mới
            for (const m of mediaPayload) {
              if (m.admin_author && m.admin_content) {
                const inserted = insertedItems?.find((ins: any) => ins.storage_path === m.storage_path);
                if (inserted) {
                  await supabaseAdmin.from('media_messages').insert([{
                    media_id: inserted.id,
                    author: m.admin_author,
                    content: m.admin_content
                  }]);
                }
              }
            }
          }

          // Update file cũ
          if (existingItems.length > 0) {
            const { error: upsErr } = await supabaseAdmin
              .from('moment_media')
              .upsert(existingItems, { onConflict: 'id' });
            if (upsErr) throw upsErr;

            // Xử lý THÊM MỚI tin nhắn Admin (Không ghi đè, luôn tạo mới theo yêu cầu)
            for (const m of mediaPayload) {
              if (m.id && m.admin_author && m.admin_content) {
                // Kiểm tra xem tin nhắn này có giống hệt tin nhắn cuối cùng không để tránh bị lặp khi nhấn lưu nhiều lần
                const { data: lastMsg } = await supabaseAdmin
                  .from('media_messages')
                  .select('author, content')
                  .eq('media_id', m.id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (!lastMsg || lastMsg.author !== m.admin_author || lastMsg.content !== m.admin_content) {
                  await supabaseAdmin.from('media_messages').insert([{
                    media_id: m.id,
                    author: m.admin_author,
                    content: m.admin_content
                  }]);
                }
              }
            }
          }
          // 4. Lấy lại toàn bộ danh sách MỚI NHẤT kèm ID chuẩn từ DB để trả về cho Frontend
          const { data: finalMedia, error: finalErr } = await supabaseAdmin
            .from('moment_media')
            .select('*')
            .ilike('moment_id', cleanId)
            .order('order_index', { ascending: true });

          if (finalErr) throw finalErr;

          return NextResponse.json({ success: true, media: finalMedia });
        } catch (dbErr: any) {
          console.error(`[API Manage] Database Error during SAVE_MEDIA_LIST:`, dbErr);
          return NextResponse.json({ error: `Lỗi Database: ${dbErr.message}` }, { status: 500 });
        }

      case 'GET_UPLOAD_SIGNED_URL':
        // Tạo URL ký danh để Client tự upload trực tiếp lên Storage an toàn (1 giờ hiệu lực)
        const { data: signedData, error: signError } = await supabaseAdmin.storage
          .from('moments')
          .createSignedUploadUrl(`${momentId}/${payload.fileName}`);
        
        if (signError) throw signError;
        return NextResponse.json({ signedUrl: signedData.signedUrl, token: signedData.token, path: signedData.path });

      case 'DELETE_MEDIA':
        // 1. Lấy thông tin media trước khi xóa để biết storage_path
        const { data: mediaToDelete } = await supabaseAdmin
          .from('moment_media')
          .select('storage_path, thumbnail_url')
          .eq('id', payload.mediaId)
          .maybeSingle();

        if (mediaToDelete) {
          const filesToRemove = [];
          if (mediaToDelete.storage_path) filesToRemove.push(mediaToDelete.storage_path);
          
          // Trích xuất path từ thumbnail_url nếu nó thuộc Supabase Storage
          if (mediaToDelete.thumbnail_url && mediaToDelete.thumbnail_url.includes('/storage/v1/object/public/moments/')) {
            const thumbPath = mediaToDelete.thumbnail_url.split('/storage/v1/object/public/moments/')[1];
            if (thumbPath) filesToRemove.push(thumbPath);
          }

          if (filesToRemove.length > 0) {
            console.log(`[API Manage] Deleting files from Storage:`, filesToRemove);
            await supabaseAdmin.storage.from('moments').remove(filesToRemove);
          }
        }

        // 2. Xóa dòng trong DB (Cascade sẽ tự xóa media_messages nếu đã config, hoặc ta xóa tay)
        await supabaseAdmin.from('media_messages').delete().eq('media_id', payload.mediaId);
        await supabaseAdmin.from('moment_media').delete().eq('id', payload.mediaId);
        
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 });
    }

  } catch (err: any) {
    console.error('API Manage Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
