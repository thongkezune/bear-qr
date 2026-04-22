import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// --- Interfaces ---
interface Moment {
  short_id: string;
  admin_password_hash: string | null;
  is_activated: boolean;
  is_private: boolean;
  title?: string;
  description?: string;
}

interface MomentMedia {
  id?: string;
  moment_id: string;
  url: string;
  type: 'image' | 'video';
  storage_path: string;
  thumbnail_url: string;
  order_index: number;
  title_memory?: string;
  created_at?: string;
}

interface MediaMessage {
  id?: string;
  media_id: string;
  author: string;
  content: string;
  created_at?: string;
}

interface IncomingMediaPayload extends Partial<MomentMedia> {
  admin_author?: string;
  admin_content?: string;
}

interface ActionPayload {
  media?: IncomingMediaPayload[];
  item?: IncomingMediaPayload;
  fileName?: string;
  mediaId?: string;
  [key: string]: unknown; 
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { momentId, adminPasswordHash, action, payload } = body as {
      momentId: string;
      adminPasswordHash: string;
      action: string;
      payload: ActionPayload;
    };

    if (!momentId || !adminPasswordHash) {
      return NextResponse.json({ error: 'Thiếu thông tin xác thực.' }, { status: 400 });
    }

    const cleanId = momentId.trim().toLowerCase();
    console.log(`[DIAGNOSTIC] API received request. ID: ${cleanId}, Action: ${action}`);

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

    const moment = (moments && moments.length > 0 ? moments[0] : null) as Moment | null;

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

          const typedDbMedia = (dbMedia || []) as MomentMedia[];

          // 3. THUẬT TOÁN THÔNG MINH (Reclaim IDs): 
          // Nếu Frontend gửi lên file có storage_path khớp với DB nhưng chưa có ID thì gán lại ID cũ.
          const processedMedia = mediaPayload.map((m: Partial<MomentMedia>) => {
            if (!m.id && m.storage_path && typedDbMedia.length > 0) {
              const existing = typedDbMedia.find((dbM) => dbM.storage_path === m.storage_path);
              if (existing) return { ...m, id: existing.id }; // Tìm thấy 'anh em thất lạc'!
            }
            return m;
          });

          // 4. Xác định các bản ghi thực sự cần giữ lại
          const keptIds = processedMedia
            .filter((m) => m.id)
            .map((m) => m.id as string);

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
          const newItems: Partial<MomentMedia>[] = [];
          const existingItems: Partial<MomentMedia>[] = [];

          for (let idx = 0; idx < processedMedia.length; idx++) {
            const m = processedMedia[idx];
            
            // CHẶN: Không lưu những tệp không có URL và tệp rác (Placeholders)
            if (!m.url || m.url === "" || m.storage_path?.startsWith('pending-')) {
              console.log(`[API Manage] Skipping placeholder/invalid item: ${m.storage_path}`);
              continue;
            }

            const row: Partial<MomentMedia> = {
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
              const original = typedDbMedia.find((dbM) => dbM.id === m.id);
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
            
            const typedInsertedItems = (insertedItems || []) as MomentMedia[];

            // Xử lý lưu tin nhắn Admin cho các file mới
            for (const m of mediaPayload) {
              if (m.admin_author && m.admin_content) {
                const inserted = typedInsertedItems.find((ins) => ins.storage_path === m.storage_path);
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

                const typedLastMsg = lastMsg as MediaMessage | null;

                if (!typedLastMsg || typedLastMsg.author !== m.admin_author || typedLastMsg.content !== m.admin_content) {
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
        } catch (dbErr: unknown) {
          const error = dbErr as Error;
          console.error(`[API Manage] Database Error during SAVE_MEDIA_LIST:`, error);
          return NextResponse.json({ error: `Lỗi Database: ${error.message}` }, { status: 500 });
        }

      case 'SYNC_SINGLE_MEDIA':
        const { item: syncItem } = payload;
        if (!syncItem || (!syncItem.url && !syncItem.thumbnail_url)) {
          throw new Error('Dữ liệu media không hợp lệ (Thiếu URL hoặc Thumbnail).');
        }

        console.log(`[API Manage] Atomic Sync for item: ${syncItem.storage_path}`);
        
        // 1. Kiểm tra xem item đã tồn tại trong DB chưa dựa trên storage_path
        const { data: existingItem } = await supabaseAdmin
          .from('moment_media')
          .select('id')
          .eq('storage_path', syncItem.storage_path)
          .maybeSingle();

        let resultItem;
        if (existingItem) {
          // 2. Nếu đã có -> Update (Chỉ update các trường có dữ liệu mới)
          const updateData: Partial<MomentMedia> = {};
          if (syncItem.url) updateData.url = syncItem.url;
          if (syncItem.type) updateData.type = syncItem.type;
          if (syncItem.thumbnail_url) updateData.thumbnail_url = syncItem.thumbnail_url;
          if (syncItem.order_index !== undefined) updateData.order_index = syncItem.order_index;
          if (syncItem.title_memory) updateData.title_memory = syncItem.title_memory;

          const { data: updated, error: upErr } = await supabaseAdmin
            .from('moment_media')
            .update(updateData)
            .eq('id', existingItem.id)
            .select()
            .single();
          if (upErr) throw upErr;
          resultItem = updated;
        } else {
          // 3. Nếu chưa có -> Insert
          const { data: inserted, error: inErr } = await supabaseAdmin
            .from('moment_media')
            .insert({
              moment_id: moment.short_id,
              url: syncItem.url,
              type: syncItem.type,
              storage_path: syncItem.storage_path,
              thumbnail_url: syncItem.thumbnail_url,
              order_index: syncItem.order_index ?? 0,
              title_memory: syncItem.title_memory || ""
            })
            .select()
            .single();
          if (inErr) throw inErr;
          resultItem = inserted;
        }

        return NextResponse.json({ success: true, item: resultItem });

      case 'GET_STORAGE_USAGE':
        // 1. Lấy danh sách media đã được ghi vào DB
        const { data: dbMediaUsage } = await supabaseAdmin
          .from('moment_media')
          .select('storage_path')
          .ilike('moment_id', cleanId);
        
        const typedDbMediaUsage = (dbMediaUsage || []) as { storage_path: string }[];
        const activePaths = new Set(typedDbMediaUsage.map((m) => m.storage_path));

        // 2. Lấy danh sách tệp thực tế trong Storage
        const { data: filesUsage, error: listErrorUsage } = await supabaseAdmin.storage
          .from('moments')
          .list(momentId);
        
        if (listErrorUsage) throw listErrorUsage;
        
        // 3. Chỉ tính dung lượng những file CÓ trong Database
        const totalUsedBytes = (filesUsage || []).reduce((acc: number, file: any) => {
          const fullPath = `${momentId}/${file.name}`;
          // Lưu ý: storage_path trong DB có thể bao gồm cả folder prefix hoặc không tùy cách lưu
          const isActive = activePaths.has(fullPath) || activePaths.has(file.name);
          return isActive ? acc + (file.metadata?.size || 0) : acc;
        }, 0);

        return NextResponse.json({ totalUsedBytes });

      case 'CLEANUP_ORPHANED_MEDIA':
        console.log(`[API Manage] Starting cleanup for moment: ${cleanId}`);
        
        // 1. Lấy danh sách file trong DB
        const { data: dbMediaCleanup } = await supabaseAdmin
          .from('moment_media')
          .select('storage_path, thumbnail_url')
          .ilike('moment_id', cleanId);
        
        const typedDbMediaCleanup = (dbMediaCleanup || []) as MomentMedia[];
        const activePathsCleanup = new Set<string>();
        typedDbMediaCleanup.forEach((m) => {
          if (m.storage_path) activePathsCleanup.add(m.storage_path);
          if (m.thumbnail_url && m.thumbnail_url.includes('/storage/v1/object/public/moments/')) {
            const thumbPath = m.thumbnail_url.split('/storage/v1/object/public/moments/')[1];
            if (thumbPath) activePathsCleanup.add(thumbPath);
          }
        });

        // 2. Lấy danh sách file trong Storage
        const { data: storageFiles, error: storageError } = await supabaseAdmin.storage
          .from('moments')
          .list(momentId);
        
        if (storageError) throw storageError;

        // 3. Lọc ra các file "mồ côi" > 5 phút (300.000 ms)
        const now = Date.now();
        const orphanedFiles = (storageFiles || []).filter((file: any) => {
          const fullPath = `${momentId}/${file.name}`;
          const isNotActive = !activePathsCleanup.has(fullPath) && !activePathsCleanup.has(file.name);
          
          // Kiểm tra thời gian tạo (ngưỡng 5 phút)
          const metadata = file.metadata as { created_at?: string } | null;
          const createdAt = new Date(file.created_at || metadata?.created_at || 0).getTime();
          const isOldEnough = (now - createdAt) > 5 * 60 * 1000;

          return isNotActive && isOldEnough;
        }).map((f: any) => `${momentId}/${f.name}`);

        if (orphanedFiles.length > 0) {
          console.log(`[API Manage] Deleting ${orphanedFiles.length} orphaned files:`, orphanedFiles);
          const { error: delError } = await supabaseAdmin.storage.from('moments').remove(orphanedFiles);
          if (delError) throw delError;
        }

        return NextResponse.json({ success: true, cleanedCount: orphanedFiles.length });

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

        const typedMediaToDelete = mediaToDelete as MomentMedia | null;

        if (typedMediaToDelete) {
          const filesToRemove: string[] = [];
          if (typedMediaToDelete.storage_path) filesToRemove.push(typedMediaToDelete.storage_path);
          
          // Trích xuất path từ thumbnail_url nếu nó thuộc Supabase Storage
          if (typedMediaToDelete.thumbnail_url && typedMediaToDelete.thumbnail_url.includes('/storage/v1/object/public/moments/')) {
            const thumbPath = typedMediaToDelete.thumbnail_url.split('/storage/v1/object/public/moments/')[1];
            if (thumbPath) filesToRemove.push(thumbPath);
          }

          if (filesToRemove.length > 0) {
            console.log(`[API Manage] Deleting files from Storage:`, filesToRemove);
            await supabaseAdmin.storage.from('moments').remove(filesToRemove);
          }
        }

        // 2. Xóa dòng trong DB (Cascade sẽ tự xóa media_messages nếu đã config, hoặc ta xóa tay)
        await supabaseAdmin.from('media_messages').delete().eq('media_id', payload.mediaId as string);
        await supabaseAdmin.from('moment_media').delete().eq('id', payload.mediaId as string);
        
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 });
    }

  } catch (err: unknown) {
    const error = err as Error;
    console.error('API Manage Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
