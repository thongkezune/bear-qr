"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import { SetupStep1 } from "./SetupStep1";
import { SetupStep2 } from "./SetupStep2";
import { SetupStep3 } from "./SetupStep3";
import { SetupStep4 } from "./SetupStep4";
import { SetupStep5 } from "./SetupStep5";
import { AdminHome } from "./AdminHome";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/utils";

interface MomentWizardProps {
  onBack?: () => void;
  initialStep?: number;
  momentId?: string;
  adminPassword?: string;
}

export const MomentWizard = ({ onBack, initialStep = 2, momentId, adminPassword = "" }: MomentWizardProps) => {
  const [step, setStep] = useState(initialStep);
  const totalSteps = 6;
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    adminPassword: adminPassword,
    adminHint: "",
    title: "Kỉ niệm của tôi",
    isPrivate: true,
    viewerPassword: "BEAR2024",
    viewerHint: "",
    media: [] as { 
      id?: string; 
      url: string; 
      type: string; 
      title_memory?: string; 
      admin_author?: string; 
      admin_content?: string; 
      storage_path?: string;
      thumbnail_url?: string; // Thêm trường ảnh đại diện
      isPlaceholder?: boolean; 
    }[],
  });

  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: number}>({});

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const [isSaving, setIsSaving] = useState(false);

  // 1. Nạp dữ liệu cũ (Hydrate) khi vào trang Admin
  useEffect(() => {
    const hydrateData = async () => {
      if (!momentId) return;
      
      console.log(`[MomentWizard] Hydrating data for: ${momentId}`);
      try {
        const { data: moment, error: mError } = await supabase
          .from('moments')
          .select('*, media:moment_media(*, messages:media_messages(*))')
          .ilike('short_id', momentId.trim().toLowerCase())
          .limit(1)
          .maybeSingle();

        if (mError) throw mError;

        if (moment) {
          // Sắp xếp media theo index và lấy danh sách tin nhắn
          const sortedMedia = (moment.media || []).sort((a: any, b: any) => a.order_index - b.order_index).map((m: any) => {
            // Lấy tin nhắn cuối cùng (mới nhất) làm mặc định cho ô nhập
            const lastMsg = m.messages && m.messages.length > 0 
              ? [...m.messages].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
              : null;
              
            return {
              ...m,
              messages: m.messages || [], // Giữ lại toàn bộ để hiện lịch sử
              admin_author: m.admin_author || lastMsg?.author || "",
              admin_content: m.admin_content || lastMsg?.content || ""
            };
          });
          
          setFormData(prev => ({
            ...prev,
            adminPassword: adminPassword || prev.adminPassword,
            adminHint: moment.admin_hint || prev.adminHint || "",
            isPrivate: moment.is_private ?? prev.isPrivate,
            viewerHint: moment.viewer_hint || prev.viewerHint || "",
            media: sortedMedia,
          }));
          console.log(`[MomentWizard] Successfully loaded ${sortedMedia.length} media items.`);
        }
      } catch (err) {
        console.error("[MomentWizard] Hydration failed:", err);
      }
    };

    hydrateData();
  }, [momentId, adminPassword]);

  const handleFinalSave = async () => {
    if (!momentId) return;
    
    setIsSaving(true);
    try {
      const adminHash = await hashPassword(formData.adminPassword || "admin123");
      
      // 1. Kích hoạt và cập nhật thông tin cơ bản
      const resMeta = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          momentId,
          adminPasswordHash: adminHash,
          action: 'ACTIVATE_OR_UPDATE',
          payload: {
            admin_hint: formData.adminHint,
            viewer_password_hash: formData.isPrivate ? await hashPassword(formData.viewerPassword || "BEAR2024") : null,
            viewer_hint: formData.isPrivate ? formData.viewerHint : null,
            is_private: formData.isPrivate,
            title: formData.title || "Kỉ niệm của tôi"
          }
        })
      });

      if (!resMeta.ok) {
        const errData = await resMeta.json();
        throw new Error(errData.error || 'Cập nhật thất bại.');
      }

      // 2. Lưu danh sách media (Playlist)
      if (formData.media && formData.media.length > 0) {
        const resMedia = await fetch('/api/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            momentId,
            adminPasswordHash: adminHash,
            action: 'SAVE_MEDIA_LIST',
            payload: { media: formData.media }
          })
        });
        if (!resMedia.ok) {
          const errData = await resMedia.json();
          throw new Error(errData.error || 'Không thể lưu danh sách media.');
        }
      }
      
      setStep(6);
    } catch (err: any) {
      console.error("Error activating moment:", err);
      alert("Có lỗi xảy ra: " + (err.message || "Vui lòng thử lại."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSettingsSave = async (newSettings: { isPrivate: boolean, viewerPassword?: string, viewerHint?: string }) => {
    if (!momentId) return;
    try {
      const adminHash = await hashPassword(formData.adminPassword || "admin123");
      const resMeta = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          momentId,
          adminPasswordHash: adminHash,
          action: 'ACTIVATE_OR_UPDATE',
          payload: {
            admin_hint: formData.adminHint,
            viewer_password_hash: newSettings.isPrivate ? await hashPassword(newSettings.viewerPassword || "BEAR2024") : null,
            viewer_hint: newSettings.isPrivate ? newSettings.viewerHint : null,
            is_private: newSettings.isPrivate,
            title: formData.title || "Kỉ niệm của tôi"
          }
        })
      });

      if (!resMeta.ok) throw new Error('Cập nhật thất bại.');
      updateFormData(newSettings);
    } catch (err: any) {
      console.error("[Settings] Error:", err);
      alert("Không thể lưu cài đặt: " + err.message);
      throw err;
    }
  };

  const nextStep = async () => {
    if (step === 1) {
      if (!formData.adminPassword || formData.adminPassword.length < 1) {
        alert("Vui lòng thiết lập mật khẩu quản lý (tối thiểu 1 ký tự) trước khi tiếp tục!");
        return;
      }

      // TỰ ĐỘNG LƯU MẬT KHẨU VÀ KÍCH HOẠT NGAY BƯỚC 1
      setIsSaving(true);
      try {
        const adminHash = await hashPassword(formData.adminPassword);
        const res = await fetch('/api/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            momentId,
            adminPasswordHash: adminHash,
            action: 'ACTIVATE_OR_UPDATE',
            payload: {
              admin_hint: formData.adminHint,
              is_activated: true,
              title: "Kỉ niệm của tôi"
            }
          })
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Không thể khởi tạo Gấu.");
        }
        
        setStep(2);
      } catch (err: any) {
        alert(err.message);
        return;
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (step === 5) {
      handleFinalSave();
    } else if (step === 3) {
      // Nếu có ảnh mới tải lên, bắt đầu chỉnh sửa từ ảnh mới đầu tiên
      if (formData.media && formData.media.length > uploadStartIndex.current) {
        setEditingIndex(uploadStartIndex.current);
        setStep(4);
      } else {
        // Nếu không có ảnh mới, có thể sang bước cài đặt hoặc giữ nguyên
        setStep(step + 1);
      }
    } else if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step === 4) setStep(2); // Quay về trang chủ khi hủy bỏ chỉnh sửa
    else if (step > 1) setStep(step - 1);
  };

  // Ghi nhớ vị trí bắt đầu của các ảnh mới tải lên trong phiên này
  const uploadStartIndex = useRef<number>(0);
  useEffect(() => {
    if (step === 3) {
      uploadStartIndex.current = formData.media?.length || 0;
    }
  }, [step]);

  // HÀM TRÍCH XUẤT ẢNH TỪ VIDEO
  const generateVideoThumbnail = (file: File): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const url = URL.createObjectURL(file);

      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        // Chụp tại giây đầu tiên
        video.currentTime = 1;
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          resolve(blob);
        }, "image/jpeg", 0.7);
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
    });
  };

  // HÀM TẢI LÊN TOÀN CỤC (Background Upload)
  const handleGlobalUpload = async (files: FileList) => {
    if (!momentId) return;

    // 1. Ghi nhớ vị trí bắt đầu để tự động chuyển bước sau này
    const currentLength = formData.media?.length || 0;
    uploadStartIndex.current = currentLength;

    // 2. Tạo Placeholder ngay lập tức để SetupStep3 nhận diện được
    const newPlaceholders = Array.from(files).map((file, i) => ({
      url: "", // Trống vì chưa có URL
      type: file.type.startsWith('video') ? 'video' : 'image',
      storage_path: `pending-${Date.now()}-${i}`,
      name: file.name,
      title_memory: "",
      isPlaceholder: true
    }));

    const updatedMedia = [...(formData.media || []), ...newPlaceholders];
    updateFormData({ media: updatedMedia });

    try {
      // Hàm xử lý tải lên cho từng tệp riêng biệt
      const uploadSingleFile = async (file: File, placeholderPath: string) => {
      try {
        setUploadingFiles(prev => ({ ...prev, [placeholderPath]: 5 }));

        // A. Lấy Signed URL
        const res = await fetch('/api/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            momentId,
            adminPasswordHash: await hashPassword(formData.adminPassword || "admin123"),
            action: 'GET_UPLOAD_SIGNED_URL',
            payload: { fileName: `${Date.now()}_${file.name}` }
          })
        });

        if (!res.ok) throw new Error("Không thể lấy URL tải lên");
        const { signedUrl, token, path: storagePath } = await res.json();

        // B. Upload XHR (0-100%)
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadingFiles(prev => ({ ...prev, [placeholderPath]: Math.min(percent, 99) }));
          }
        };

        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = () => xhr.status === 200 ? resolve(true) : reject();
          xhr.onerror = () => reject();
          xhr.send(file);
        });

        await uploadPromise;
        setUploadingFiles(prev => ({ ...prev, [placeholderPath]: 100 }));

        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/moments/${storagePath}`;
        
        // C. Cập nhật State chính (Video/Ảnh đã hiện lên!)
        setFormData(prev => {
          const newMedia = [...prev.media];
          const idx = newMedia.findIndex((m: any) => m.storage_path === placeholderPath);
          if (idx !== -1) {
            newMedia[idx] = { ...newMedia[idx], url: publicUrl, storage_path: storagePath, isPlaceholder: false };
          }
          
          // Đồng bộ DB đồng thời
          syncMediaList(newMedia);
          return { ...prev, media: newMedia };
        });

        // D. Xử lý Thumbnail ngầm (Nếu là Video)
        if (file.type.startsWith('video/')) {
          generateAndUploadThumbnail(file, storagePath);
        }

        // Dọn dẹp tiến trình UI sau 1s
        setTimeout(() => {
          setUploadingFiles(prev => {
            const next = { ...prev };
            delete next[placeholderPath];
            return next;
          });
        }, 1000);

      } catch (err: any) {
        console.error(`Lỗi tải tệp ${file.name}:`, err);
        setUploadingFiles(prev => {
          const next = { ...prev };
          delete next[placeholderPath];
          return next;
        });
      }
    };

    // Hàm tạo và upload thumbnail ngầm
    const generateAndUploadThumbnail = async (file: File, videoStoragePath: string) => {
      try {
        const thumbBlob = await generateVideoThumbnail(file);
        if (!thumbBlob) return;

        const thumbFileName = `thumb_${Date.now()}.jpg`;
        const res = await fetch('/api/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            momentId,
            adminPasswordHash: await hashPassword(formData.adminPassword || "admin123"),
            action: 'GET_UPLOAD_SIGNED_URL',
            payload: { fileName: thumbFileName }
          })
        });

        const { signedUrl: tUrl, token: tToken, path: tPath } = await res.json();
        await fetch(tUrl, { method: 'PUT', body: thumbBlob, headers: { 'Authorization': `Bearer ${tToken}` } });
        const finalThumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/moments/${tPath}`;

        // Cập nhật lại thumbnail vào state và DB
        setFormData(prev => {
          const newMedia = prev.media.map((m: any) => 
            m.storage_path === videoStoragePath ? { ...m, thumbnail_url: finalThumbnailUrl } : m
          );
          syncMediaList(newMedia);
          return { ...prev, media: newMedia };
        });
      } catch (e) {
        console.error("Lỗi tạo ảnh thu nhỏ ngầm:", e);
      }
    };

    // Hàm đồng bộ DB tách riêng
    const syncMediaList = async (latestMedia: any[]) => {
      try {
        const adminHash = await hashPassword(formData.adminPassword || "admin123");
        const syncRes = await fetch('/api/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            momentId,
            adminPasswordHash: adminHash,
            action: 'SAVE_MEDIA_LIST',
            payload: { media: latestMedia }
          })
        });
        const result = await syncRes.json();
        if (result.success && result.media) {
           setFormData(f => ({ ...f, media: result.media }));
        }
      } catch (err) { console.error("Sync DB Error:", err); }
    };

    // 3. Khởi chạy tất cả các tiến trình tải lên song song
    files.forEach((file, i) => {
      uploadSingleFile(file, newPlaceholders[i].storage_path);
    });
    } catch (err: any) {
      console.error("Upload Error:", err);
      alert("Lỗi tải lên: " + (err.message || "Vui lòng thử lại"));
    }
  };

  const handleRemoveMedia = async (storagePath: string) => {
    if (!momentId) return;

    // Tìm item cụ thể để lấy ID database nếu có
    const itemToRemove = formData.media.find((m: any) => m.storage_path === storagePath);
    const newList = formData.media.filter((m: any) => m.storage_path !== storagePath);
    
    // Cập nhật UI ngay lập tức
    updateFormData({ media: newList });

    try {
      const adminHash = await hashPassword(formData.adminPassword || "admin123");
      
      if (itemToRemove?.id) {
        // Trường hợp tin nhắn đã tồn tại trong DB -> Gọi xóa vật lý (DB + Storage)
        await fetch('/api/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            momentId,
            adminPasswordHash: adminHash,
            action: 'DELETE_MEDIA',
            payload: { 
              mediaId: itemToRemove.id,
              storagePath: itemToRemove.storage_path // Optional, API sẽ tự tìm nếu thiếu
            }
          })
        });
        console.log(`[MomentWizard] Physically deleted media: ${itemToRemove.id}`);
      } else {
        // Trường hợp tệp chưa có ID (vừa upload) -> Đồng bộ lại danh sách
        await fetch('/api/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            momentId,
            adminPasswordHash: adminHash,
            action: 'SAVE_MEDIA_LIST',
            payload: { media: newList }
          })
        });
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const renderStep = () => {
    const props = { formData, updateFormData, momentId };
    switch (step) {
      case 1:
        return <SetupStep1 {...props} />;
      case 2:
        return (
          <AdminHome 
            momentId={momentId} 
            onAdd={() => setStep(3)} 
            onEdit={(id) => {
              const idx = formData.media.findIndex(m => m.id === id);
              setEditingIndex(idx >= 0 ? idx : 0);
              setStep(4);
            }} 
            onRemove={handleRemoveMedia}
            settings={{
              isPrivate: formData.isPrivate,
              viewerPassword: formData.viewerPassword,
              viewerHint: formData.viewerHint
            }}
            onSaveSettings={handleQuickSettingsSave}
          />
        );
      case 3:
        return (
          <SetupStep2 
            {...props} 
            onUpload={handleGlobalUpload}
            uploadingFiles={uploadingFiles}
            onEditItem={(idx) => {
              setEditingIndex(idx);
              setStep(4);
            }}
          />
        );
      case 4:
        return (
          <SetupStep3 
            {...props} 
            editingIndex={editingIndex ?? 0}
            uploadingFiles={uploadingFiles}
            onBack={() => setStep(3)}
          />
        );
      case 5:
        return <SetupStep4 {...props} />;
      case 6:
        return <SetupStep5 onGoToStep={(n) => setStep(n)} onHome={() => onBack?.()} />;
      default:
        return <SetupStep1 {...props} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-zinc-950/20 backdrop-blur-xl bg-gradient-to-b from-zinc-900/50 to-transparent shadow-2xl flex justify-between items-center px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={step <= 2 ? onBack : prevStep}
            className={`hover:opacity-80 transition-opacity active:scale-95 duration-200 text-primary ${
              (step === 1) ? "opacity-0 pointer-events-none" : ""
            }`}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-primary font-bold tracking-widest uppercase text-xs">
            BearQR Portal
          </span>
        </div>
        <div className="flex flex-col items-center">
          <StepIndicator currentStep={step} totalSteps={totalSteps} />
          {step === 4 && (
            <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest mt-1 animate-pulse">
              Đang biên tập nội dung
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-40 px-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Actions - Hidden on Step 2 (Home) and Step 6 (Done) */}
      {step !== 2 && step < 6 && (
        <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-8 pb-10 pt-6 bg-zinc-950/40 backdrop-blur-3xl rounded-t-[2.5rem] border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
          <button
            onClick={step === 1 ? onBack : prevStep}
            className={`flex items-center justify-center text-rose-200/60 bg-white/5 rounded-2xl px-6 py-4 hover:bg-white/10 transition-all active:scale-[0.98] duration-150 ${
              (step === 1) ? "opacity-0 pointer-events-none" : ""
            }`}
          >
            <ArrowLeft size={16} className="mr-2" />
            <span className="font-be-vietnam text-xs font-bold uppercase tracking-widest">
              {step === 4 ? "Hủy bỏ" : (step === 1 ? "Thoát" : "Quay lại")}
            </span>
          </button>

          <button
            onClick={nextStep}
            disabled={isSaving}
            className="flex items-center justify-center bg-gradient-to-r from-rose-300 to-rose-500 text-zinc-950 rounded-2xl px-10 py-4 shadow-xl shadow-rose-500/20 hover:brightness-110 transition-all active:scale-[0.98] duration-150 disabled:opacity-70"
          >
            <span className="font-be-vietnam text-xs font-bold uppercase tracking-widest mr-2">
              {isSaving ? "Đang xử lý..." : (step === 5 ? "Lưu và kích hoạt" : (step === 4 ? "Lưu lời nhắn" : "Tiếp theo"))}
            </span>
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              step === 5 ? <Check size={18} /> : <ArrowRight size={18} />
            )}
          </button>
        </footer>
      )}

      {/* Background Decorative Elements */}
      <div className="fixed top-1/4 -right-20 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-1/4 -left-20 w-80 h-80 bg-rose-900/10 blur-[140px] rounded-full -z-10" />
    </div>
  );
};
