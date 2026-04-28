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
import { VideoOptimizer } from "@/lib/videoProcessor";
import { StorageLimitModal } from "./StorageLimitModal";

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
  
  // Ref để lưu trữ tệp tin phục vụ việc Retry (vì File object không thể lưu vào State dễ dàng)
  const filesMapRef = useRef<{[key: string]: File}>({});
  // Ref lưu tệp đã nén thành công để không phải nén lại khi Retry
  const optimizedBlobsRef = useRef<{[key: string]: File}>({});

  const [formData, setFormData] = useState({
    adminPassword: adminPassword,
    adminHint: "",
    title: "Kỉ niệm của tôi",
    isPrivate: true,
    viewerPassword: "",
    viewerHint: "",
    media: [] as { 
      id?: string; 
      url: string; 
      type: string; 
      title_memory?: string; 
      admin_author?: string; 
      admin_content?: string; 
      storage_path?: string;
      thumbnail_url?: string;
      isPlaceholder?: boolean; 
    }[],
  });

  const MAX_STORAGE_MB = 100; // Giới hạn cứng 100MB theo yêu cầu
  const [comeFromStep, setComeFromStep] = useState<number>(2);
  const [sessionMediaStartIndex, setSessionMediaStartIndex] = useState<number | null>(null);

  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: number}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ usedMB: number, totalMB: number } | null>(null);

  // States cho Storage Limit Modal
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitModalData, setLimitModalData] = useState({
    usedBytes: 0,
    newFilesSize: 0,
    estimatedSize: 0,
    hasLargeVideos: false,
    canFitAfterOptimize: true,
    isOptional: false,
    pendingFiles: [] as File[],
    pendingPlaceholders: [] as any[]
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const fetchStorageUsage = async () => {
    if (!momentId) return;
    try {
      const adminHash = await hashPassword(formData.adminPassword || "admin123");
      
      // THỰC HIỆN DỌN DẸP NGẦM TRƯỚC KHI TÍNH DUNG LƯỢNG
      await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ momentId, adminPasswordHash: adminHash, action: 'CLEANUP_ORPHANED_MEDIA' })
      });

      const res = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ momentId, adminPasswordHash: adminHash, action: 'GET_STORAGE_USAGE' })
      });
      if (res.ok) {
        const data = await res.json();
        setStorageInfo({ 
          usedMB: Number((data.totalUsedBytes / (1024 * 1024)).toFixed(1)), 
          totalMB: MAX_STORAGE_MB 
        });
      }
    } catch (e) {
      console.error("Lỗi lấy dung lượng:", e);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = "Tiến trình tải lên đang diễn ra. Nếu rời đi, dữ liệu sẽ bị mất. Bạn có chắc chắn không?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]);

  useEffect(() => {
    const hydrateData = async () => {
      if (!momentId) return;
      try {
        const { data: moment, error: mError } = await supabase
          .from('moments')
          .select('*, media:moment_media(*, messages:media_messages(*))')
          .ilike('short_id', momentId.trim().toLowerCase())
          .limit(1)
          .maybeSingle();

        if (mError) throw mError;
        if (moment) {
          const sortedMedia = (moment.media || []).sort((a: any, b: any) => a.order_index - b.order_index).map((m: any) => {
            const lastMsg = m.messages && m.messages.length > 0 
              ? [...m.messages].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
              : null;
            return {
              ...m,
              messages: m.messages || [],
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
          fetchStorageUsage();
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
      
      const payload: any = {
        admin_hint: formData.adminHint,
        viewer_hint: formData.isPrivate ? formData.viewerHint : null,
        is_private: formData.isPrivate,
        title: formData.title || "Kỉ niệm của tôi",
        mood: 'none'
      };

      // CHỈ CẬP NHẬT MẬT KHẨU NẾU CÓ NHẬP MỚI
      if (formData.isPrivate && formData.viewerPassword) {
        payload.viewer_password_hash = await hashPassword(formData.viewerPassword);
      } else if (!formData.isPrivate) {
        // Nếu chuyển sang công khai, xóa mật khẩu
        payload.viewer_password_hash = null;
      }

      const resMeta = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          momentId,
          adminPasswordHash: adminHash,
          action: 'ACTIVATE_OR_UPDATE',
          payload
        })
      });
      if (!resMeta.ok) throw new Error('Cập nhật thất bại.');
      if (formData.media && formData.media.length > 0) {
        await fetch('/api/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            momentId,
            adminPasswordHash: adminHash,
            action: 'SAVE_MEDIA_LIST',
            payload: { media: formData.media }
          })
        });
      }
      setSessionMediaStartIndex(null);
      setStep(6);
    } catch (err: any) {
      alert("Có lỗi xảy ra: " + (err.message || "Vui lòng thử lại."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSettingsSave = async (newSettings: { isPrivate: boolean, viewerPassword?: string, viewerHint?: string }) => {
    if (!momentId) return;
    try {
      const adminHash = await hashPassword(formData.adminPassword || "admin123");
      
      const payload: any = {
        admin_hint: formData.adminHint,
        viewer_hint: newSettings.isPrivate ? newSettings.viewerHint : null,
        is_private: newSettings.isPrivate,
        title: formData.title || "Kỉ niệm của tôi"
      };

      if (newSettings.isPrivate && newSettings.viewerPassword) {
        payload.viewer_password_hash = await hashPassword(newSettings.viewerPassword);
      } else if (!newSettings.isPrivate) {
        payload.viewer_password_hash = null;
      }

      const resMeta = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          momentId,
          adminPasswordHash: adminHash,
          action: 'ACTIVATE_OR_UPDATE',
          payload
        })
      });
      if (!resMeta.ok) throw new Error('Cập nhật thất bại.');
      updateFormData(newSettings);
    } catch (err: any) {
      alert("Không thể lưu cài đặt: " + err.message);
      throw err;
    }
  };

  const nextStep = async () => {
    if (step === 1) {
      if (!formData.adminPassword) {
        alert("Vui lòng thiết lập mật khẩu quản lý!");
        return;
      }
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
            payload: { admin_hint: formData.adminHint, is_activated: true, title: "Kỉ niệm của tôi" }
          })
        });
        if (!res.ok) throw new Error("Không thể khởi tạo Gấu.");
        setStep(2);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsSaving(false);
      }
      return;
    }
    if (step === 5) handleFinalSave();
    else if (step === 3) {
      if (formData.media.length > 0) {
        setEditingIndex(sessionMediaStartIndex !== null ? sessionMediaStartIndex : 0);
        setStep(4);
      } else {
        setStep(5);
      }
    }
    else if (step === 4) {
      if (editingIndex !== null && editingIndex < formData.media.length - 1) {
        setEditingIndex(editingIndex + 1);
      } else {
        setStep(5);
      }
    }
    else if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step === 4) {
      if (comeFromStep === 2) {
        setStep(2);
      } else {
        const startIndex = sessionMediaStartIndex !== null ? sessionMediaStartIndex : 0;
        if (editingIndex !== null && editingIndex > startIndex) {
          setEditingIndex(editingIndex - 1);
        } else {
          setStep(3);
        }
      }
    }
    else if (step === 5) {
      if (formData.media.length > 0) {
        setEditingIndex(formData.media.length - 1);
        setStep(4);
      } else {
        setStep(3);
      }
    }
    else if (step > 1) setStep(step - 1);
  };

  const generateVideoThumbnail = (file: File): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const url = URL.createObjectURL(file);
      const timeout = setTimeout(() => { cleanup(); resolve(null); }, 5000);
      const cleanup = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        if (video.parentNode) document.body.removeChild(video);
      };
      video.style.display = "none";
      video.muted = true;
      video.playsInline = true;
      video.src = url;
      document.body.appendChild(video);
      video.onloadedmetadata = () => { 
        // Lấy frame ở giây thứ 1 để tránh màn hình đen ở giây 0
        video.currentTime = Math.min(1, video.duration || 1); 
      };
      video.onseeked = () => {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => { cleanup(); resolve(blob); }, "image/jpeg", 0.7);
        } catch { cleanup(); resolve(null); }
      };
      video.onerror = () => { cleanup(); resolve(null); };
    });
  };

  // HÀM TẢI LÊN ĐƠN LẺ (Đưa ra ngoài để dùng chung cho Retry)
  const uploadSingleFile = async (file: File, pPath: string, index: number, adminHash: string) => {
    try {
      setUploadingFiles(prev => ({ ...prev, [pPath]: 1 }));

      // A. Lấy Signed URL
      const res = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          momentId, 
          adminPasswordHash: adminHash, 
          action: 'GET_UPLOAD_SIGNED_URL', 
          payload: { fileName: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}` } 
        })
      });
      
      if (!res.ok) throw new Error(`Lỗi khởi tạo Storage (${res.status})`);
      const { signedUrl, path: sPath } = await res.json();

      // B. Upload bằng XHR (để lấy progress)
      const xhr = new XMLHttpRequest();
      const uploadResult = await new Promise((resolve, reject) => {
        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadingFiles(prev => ({ ...prev, [pPath]: Math.max(percent, 1) }));
          }
        };
        xhr.onload = () => (xhr.status === 200 || xhr.status === 201) ? resolve(true) : reject(new Error(`Server Error ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Lỗi kết nối mạng"));
        xhr.timeout = 180000; // 3 phút cho video lớn
        xhr.ontimeout = () => reject(new Error("Quá thời gian tải lên"));
        xhr.send(file);
      });

      // C. Sau khi tải Storage thành công -> Cập nhật URL và Sync DB TỨC THÌ
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/moments/${sPath}`;
      const currentType = file.type.startsWith('image') ? 'image' : 'video';
      
      const syncRes = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          momentId,
          adminPasswordHash: adminHash,
          action: 'SYNC_SINGLE_MEDIA',
          payload: { 
            item: {
              url: publicUrl,
              type: currentType,
              storage_path: sPath,
              order_index: (formData.media?.length || 0) + index
            }
          }
        })
      });

      if (!syncRes.ok) console.warn("[Sync] Không thể đồng bộ database ngay lập tức cho:", file.name);
      const syncData = await syncRes.json();
      const finalItem = syncData.item || { url: publicUrl, storage_path: sPath, type: currentType };

      // D. Cập nhật UI State
      setFormData(prev => ({
        ...prev,
        media: prev.media.map((m: any) => 
          m.storage_path === pPath 
            ? { ...m, ...finalItem, isPlaceholder: false } 
            : m
        )
      }));

      // E. Xử lý Thumbnail Video (Ngầm)
      if (currentType === 'video') {
        generateAndUploadThumbnail(file, sPath, adminHash);
      }

      // Xoá progress sau 1s thành công
      setTimeout(() => setUploadingFiles(prev => {
        const n = { ...prev }; delete n[pPath]; return n;
      }), 1500);

    } catch (err: any) {
      console.error(`[Upload Error] ${file.name}:`, err);
      setUploadingFiles(prev => ({ ...prev, [pPath]: -1 }));
    }
  };

  const syncMediaList = async (latestMedia: any[], adminHash: string) => {
    const finalizedOnly = latestMedia.filter((m: any) => !m.isPlaceholder && m.url);
    if (finalizedOnly.length === 0 && latestMedia.length > 0) return;
    try {
      const syncRes = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ momentId, adminPasswordHash: adminHash, action: 'SAVE_MEDIA_LIST', payload: { media: finalizedOnly } })
      });
      const result = await syncRes.json();
      if (result.success && result.media) {
        setFormData(f => {
          const serverMedia = result.media;
          const localPlaceholders = f.media.filter((m: any) => m.isPlaceholder);
          const mergedMedia = [...serverMedia];
          localPlaceholders.forEach((lp: any) => {
            if (!mergedMedia.find((sm: any) => sm.storage_path === lp.storage_path)) mergedMedia.push(lp);
          });
          return { ...f, media: mergedMedia };
        });
      }
    } catch (err) { console.error("Sync DB Error:", err); }
  };

  const generateAndUploadThumbnail = async (file: File, videoStoragePath: string, adminHash: string) => {
    try {
      console.log(`[Thumbnail] Bắt đầu trích xuất cho: ${videoStoragePath}`);
      const thumbBlob = await generateVideoThumbnail(file);
      if (!thumbBlob) return;
      
      const thumbFileName = `thumb_${Date.now()}.jpg`;
      const res = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ momentId, adminPasswordHash: adminHash, action: 'GET_UPLOAD_SIGNED_URL', payload: { fileName: thumbFileName } })
      });
      
      if (!res.ok) return;
      const { signedUrl: tUrl, path: tPath } = await res.json();
      
      // QUAN TRỌNG: Không gửi Authorization header kèm signed URL
      await fetch(tUrl, { 
        method: 'PUT', 
        body: thumbBlob, 
        headers: { 'Content-Type': 'image/jpeg' } 
      });
      
      const finalThumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/moments/${tPath}`;
      console.log(`[Thumbnail] Đã tải lên thành công: ${finalThumbnailUrl}`);
      
      // Atomic sync thumbnail vào DB
      await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          momentId,
          adminPasswordHash: adminHash,
          action: 'SYNC_SINGLE_MEDIA',
          payload: { 
            item: {
              storage_path: videoStoragePath,
              thumbnail_url: finalThumbnailUrl
            }
          }
        })
      });

      setFormData(prev => ({
        ...prev,
        media: prev.media.map((m: any) => m.storage_path === videoStoragePath ? { ...m, thumbnail_url: finalThumbnailUrl } : m)
      }));

    } catch (e) { 
      console.error("[Thumbnail] Lỗi:", e); 
    }
  };

  // HÀM TẢI LÊN TOÀN CỤC (TỐI ƯU SONG SONG & ATOMIC SYNC)
  const handleGlobalUpload = async (files: FileList) => {
    if (!momentId) return;
    
    // 1. SNAPSHOT FILE LIST NGAY LẬP TỨC
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (sessionMediaStartIndex === null) {
      setSessionMediaStartIndex(formData.media?.length || 0);
    }

    // 2. Tạo nhanh Placeholders và Lưu vào Ref để Retry
    const newPlaceholders = fileArray.map((file, i) => {
      const pPath = `pending-${Date.now()}-${i}`;
      filesMapRef.current[pPath] = file; // Lưu tệp vào ref
      return {
        url: "", 
        type: file.type.startsWith('video') ? 'video' : 'image',
        storage_path: pPath, 
        name: file.name,
        isPlaceholder: true
      };
    });

    setFormData(prev => ({ ...prev, media: [...(prev.media || []), ...newPlaceholders] }));
    setIsUploading(true);
    setIsCalculating(true);

    try {
      const adminHash = await hashPassword(formData.adminPassword || "admin123");
      
      const usageRes = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ momentId, adminPasswordHash: adminHash, action: 'GET_STORAGE_USAGE' })
      });
      
      let usedBytes = 0;
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        usedBytes = usageData.totalUsedBytes || 0;
        // CẬP NHẬT STATE ĐỂ ĐỒNG BỘ VỚI CÁC LUỒNG KHÁC
        setStorageInfo({ usedMB: usedBytes / (1024 * 1024), totalMB: MAX_STORAGE_MB });
      }
      
      const newFilesTotalSize = fileArray.reduce((acc, f) => acc + f.size, 0);
      const hasLargeVideos = await VideoOptimizer.hasLargeVideos(fileArray);
      const isLimitExceeded = (usedBytes + newFilesTotalSize > MAX_STORAGE_MB * 1024 * 1024);

      if (isLimitExceeded || hasLargeVideos) {
        // ƯỚC TÍNH DUNG LƯỢNG SAU NÉN (CORE BITRATE ESTIMATION)
        let totalEstimatedSize = 0;
        for (const file of fileArray) {
            if (file.type.startsWith('video/')) {
                totalEstimatedSize += await VideoOptimizer.estimateOptimizedSize(file);
            } else {
                totalEstimatedSize += file.size;
            }
        }

        setIsCalculating(false);
        // QUY TẮC CHỐT CHẶN: DƯ 10MB SAU NÉN (Mức 90MB)
        const SAFE_THRESHOLD = 90 * 1024 * 1024;
        const canFitAfterOptimize = (usedBytes + totalEstimatedSize) <= SAFE_THRESHOLD;
        
        setLimitModalData({
          usedBytes,
          newFilesSize: newFilesTotalSize,
          estimatedSize: totalEstimatedSize,
          hasLargeVideos,
          canFitAfterOptimize,
          isOptional: !isLimitExceeded && hasLargeVideos,
          pendingFiles: fileArray,
          pendingPlaceholders: newPlaceholders
        });
        setLimitModalOpen(true);
        return;
      }

      setIsCalculating(false);
      await startUploadFlow(fileArray, newPlaceholders);
    } catch (err: any) {
      console.error("[Upload] Lỗi hệ thống:", err);
      setIsUploading(false);
      setIsCalculating(false);
    }
  };

  const startUploadFlow = async (files: File[], placeholders: any[], skipOptimize = false) => {
    try {
      const adminHash = await hashPassword(formData.adminPassword || "admin123");
      const CONCURRENCY = 3;
      const queue = [...files.map((f, i) => ({ file: f, placeholder: placeholders[i], index: i }))];
      
      const runner = async () => {
        // Biến cục bộ để theo dõi dung lượng tăng dần trong quá trình upload
        let currentLocalUsedBytes = (storageInfo?.usedMB || 0) * 1024 * 1024;

        while (queue.length > 0) {
          const task = queue.shift();
          if (task) {
            let fileToUpload = task.file;
            const pPath = task.placeholder.storage_path;

            // KIỂM TRA CACHE NÉN
            if (optimizedBlobsRef.current[pPath]) {
              fileToUpload = optimizedBlobsRef.current[pPath];
            } else if (!skipOptimize && task.file.type.startsWith('video/')) {
              // CHỐT CHẶN TRƯỚC KHI NÉN (PRE-COMPRESSION GUARD)
              const estimated = await VideoOptimizer.estimateOptimizedSize(task.file);
              const MAX_BYTES = MAX_STORAGE_MB * 1024 * 1024;
              
              if (currentLocalUsedBytes + estimated > MAX_BYTES) {
                  console.warn(`[Storage] Pre-check: ${fileToUpload.name} skipped (Estimated ${(estimated/1024/1024).toFixed(1)}MB exceeds limit)`);
                  setUploadingFiles(prev => ({ ...prev, [pPath]: -1 }));
                  setFormData(prev => ({ ...prev, media: prev.media.filter(m => m.storage_path !== pPath) }));
                  alert(`⚠️ DUNG LƯỢNG KHÔNG ĐỦ!\nVideo ${fileToUpload.name} dự kiến nén xong (${(estimated/1024/1024).toFixed(1)}MB) vẫn vượt quá giới hạn 100MB.\nHệ thống đã tự động bỏ qua để tiết kiệm thời gian cho bạn.`);
                  continue;
              }

              setUploadingFiles(prev => ({ ...prev, [pPath]: -2 }));
              fileToUpload = await VideoOptimizer.optimizeVideo(task.file);
              // LƯU VÀO CACHE ĐỂ PHỤC VỤ RETRY
              optimizedBlobsRef.current[pPath] = fileToUpload;
            }

            // CHỐT CHẶN DUNG LƯỢNG ĐỘNG (KIỂM TRA TRƯỚC KHI ĐẨY LÊN)
            if (currentLocalUsedBytes + fileToUpload.size > MAX_STORAGE_MB * 1024 * 1024) {
                console.error(`[Storage] Dynamic Block: ${fileToUpload.name} exceeded limit.`);
                setUploadingFiles(prev => ({ ...prev, [pPath]: -1 }));
                // Xóa placeholder để người dùng biết tệp này không được upload
                setFormData(prev => ({ ...prev, media: prev.media.filter(m => m.storage_path !== pPath) }));
                alert(`❌ DUNG LƯỢNG VƯỢT MỨC!\nKhông thể upload ${fileToUpload.name} (${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB) vì sẽ vượt quá giới hạn 100MB.`);
                continue;
            }

            // Tiến hành upload
            await uploadSingleFile(fileToUpload, pPath, task.index, adminHash);
            
            // Cập nhật dung lượng đã dùng để tệp tiếp theo đối soát chính xác
            currentLocalUsedBytes += fileToUpload.size;
          }
        }
      };

      await Promise.all(Array(Math.min(CONCURRENCY, queue.length)).fill(null).map(runner));
      await fetchStorageUsage();
    } catch (err) {
      console.error("[Upload Flow] Error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmOptimize = () => {
    setLimitModalOpen(false);
    startUploadFlow(limitModalData.pendingFiles, limitModalData.pendingPlaceholders, false);
  };

  const handleConfirmOriginal = () => {
    setLimitModalOpen(false);
    startUploadFlow(limitModalData.pendingFiles, limitModalData.pendingPlaceholders, true);
  };

  const handleCancelUpload = () => {
    setLimitModalOpen(false);
    setFormData(prev => ({ 
      ...prev, 
      media: prev.media.filter(m => !limitModalData.pendingPlaceholders.find(p => p.storage_path === m.storage_path)) 
    }));
    setIsUploading(false);
  };

  // HÀM THỬ LẠI (RETRY)
  const handleRetryUpload = async (storagePath: string) => {
    const file = filesMapRef.current[storagePath];
    if (!file || !momentId) return;

    console.log(`[Retry] Đang tải lại tệp: ${file.name}`);
    const adminHash = await hashPassword(formData.adminPassword || "admin123");
    
    // Tìm index hiện tại của item trong list để sync đúng vị trí
    const index = formData.media.findIndex((m: any) => m.storage_path === storagePath);
    
    // Ưu tiên tệp đã nén sẵn từ cache
    let fileToUpload = optimizedBlobsRef.current[storagePath] || file;
    
    if (!optimizedBlobsRef.current[storagePath] && file.type.startsWith('video/')) {
      setUploadingFiles(prev => ({ ...prev, [storagePath]: -2 }));
      fileToUpload = await VideoOptimizer.optimizeVideo(file);
      optimizedBlobsRef.current[storagePath] = fileToUpload;
    }
    
    setIsUploading(true);
    await uploadSingleFile(fileToUpload, storagePath, index >= 0 ? index : 0, adminHash);
    setIsUploading(false);
    await fetchStorageUsage();
  };


  const handleRemoveMedia = async (storagePath: string) => {
    if (!momentId) return;
    const itemToRemove = formData.media.find((m: any) => m.storage_path === storagePath);
    const newList = formData.media.filter((m: any) => m.storage_path !== storagePath);
    updateFormData({ media: newList });
    try {
      const adminHash = await hashPassword(formData.adminPassword || "admin123");
      if (itemToRemove?.id) {
        await fetch('/api/manage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ momentId, adminPasswordHash: adminHash, action: 'DELETE_MEDIA', payload: { mediaId: itemToRemove.id } }) });
      } else {
        await fetch('/api/manage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ momentId, adminPasswordHash: adminHash, action: 'SAVE_MEDIA_LIST', payload: { media: newList.filter((m: any) => !m.isPlaceholder && m.url) } }) });
      }
      // CẬP NHẬT DUNG LƯỢNG MỚI NGAY LẬP TỨC
      await fetchStorageUsage();
    } catch (err) { console.error("Delete Error:", err); }
  };

  const renderStep = () => {
    const props = { formData, updateFormData, momentId };
    switch (step) {
      case 1: return <SetupStep1 {...props} />;
      case 2: return <AdminHome momentId={momentId} onAdd={() => { setComeFromStep(2); setStep(3); setSessionMediaStartIndex(null); }} onEdit={(id) => { const idx = formData.media.findIndex(m => m.id === id); setEditingIndex(idx >= 0 ? idx : 0); setComeFromStep(2); setStep(4); }} onRemove={handleRemoveMedia} settings={{ isPrivate: formData.isPrivate, viewerPassword: formData.viewerPassword, viewerHint: formData.viewerHint }} onSaveSettings={handleQuickSettingsSave} />;
      case 3: return <SetupStep2 {...props} onUpload={handleGlobalUpload} onRetry={handleRetryUpload} onRemove={handleRemoveMedia} uploadingFiles={uploadingFiles} storageInfo={storageInfo} onEditItem={(idx) => { setEditingIndex(idx); setComeFromStep(3); setStep(4); }} />;
      case 4: return <SetupStep3 {...props} editingIndex={editingIndex ?? 0} uploadingFiles={uploadingFiles} onBack={() => setStep(comeFromStep)} />;
      case 5: return <SetupStep4 {...props} />;
      case 6: return <SetupStep5 onGoToStep={(n) => setStep(n)} onHome={() => onBack?.()} />;
      default: return <SetupStep1 {...props} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-zinc-950/20 backdrop-blur-xl bg-gradient-to-b from-zinc-900/50 to-transparent shadow-2xl flex justify-between items-center px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={step <= 2 ? onBack : prevStep} className={`hover:opacity-80 transition-opacity active:scale-95 duration-200 text-primary ${step === 1 ? "opacity-0 pointer-events-none" : ""}`}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-primary font-bold tracking-widest uppercase text-xs">Omemo Portal</span>
        </div>
        <div className="flex flex-col items-center">
          <StepIndicator currentStep={step} totalSteps={totalSteps} />
          {step === 4 && <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest mt-1 animate-pulse">Đang biên tập nội dung</span>}
        </div>
      </header>
      <main className="flex-1 pt-32 pb-40 px-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {isCalculating && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Loader2 className="text-rose-500 animate-spin" size={32} />
          </div>
          <div className="text-center space-y-1">
            <p className="text-white font-bold tracking-tight">Đang phân tích tệp...</p>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Vui lòng không tắt trình duyệt</p>
          </div>
        </div>
      )}

      <StorageLimitModal 
        isOpen={limitModalOpen}
        onClose={handleCancelUpload}
        onConfirmOptimize={handleConfirmOptimize}
        onConfirmOriginal={handleConfirmOriginal}
        isOptional={limitModalData.isOptional}
        usedBytes={limitModalData.usedBytes}
        totalBytes={MAX_STORAGE_MB * 1024 * 1024}
        newFilesSize={limitModalData.newFilesSize}
        estimatedSize={limitModalData.estimatedSize}
        hasLargeVideos={limitModalData.hasLargeVideos}
        canFitAfterOptimize={limitModalData.canFitAfterOptimize}
      />
      {step !== 2 && step < 6 && (
        <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-8 pb-10 pt-6 bg-zinc-950/40 backdrop-blur-3xl rounded-t-[2.5rem] border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
          <button onClick={step === 1 ? onBack : prevStep} className={`flex items-center justify-center text-rose-200/60 bg-white/5 rounded-2xl px-6 py-4 hover:bg-white/10 transition-all active:scale-[0.98] duration-150 ${step === 1 ? "opacity-0 pointer-events-none" : ""}`}>
            <ArrowLeft size={16} className="mr-2" />
            <span className="font-be-vietnam text-xs font-bold uppercase tracking-widest">{step === 4 ? "Hủy bỏ" : (step === 1 ? "Thoát" : "Quay lại")}</span>
          </button>
          <button
            onClick={nextStep}
            disabled={
              isSaving || 
              (step === 4 && formData.media[editingIndex ?? 0]?.isPlaceholder) ||
              (step === 5 && isUploading)
            }
            className="flex items-center justify-center bg-gradient-to-r from-rose-300 to-rose-500 text-zinc-950 rounded-2xl px-10 py-4 shadow-xl shadow-rose-500/20 hover:brightness-110 transition-all active:scale-[0.98] duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-be-vietnam text-xs font-bold uppercase tracking-widest mr-2">
              {isSaving ? "Đang xử lý..." : 
               (step === 5 ? "Lưu và kích hoạt" : 
               (step === 4 ? ((editingIndex ?? 0) < (formData.media?.length || 0) - 1 ? "Tiếp theo (Tệp)" : "Xong biên tập") : 
               "Tiếp theo"))}
            </span>
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <div className="flex items-center gap-1.5">{(isUploading || Object.keys(uploadingFiles).length > 0) && <Loader2 size={14} className="animate-spin text-zinc-950/50" />} {step === 5 ? <Check size={18} /> : <ArrowRight size={18} />}</div>}
          </button>
        </footer>
      )}
      <div className="fixed top-1/4 -right-20 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-1/4 -left-20 w-80 h-80 bg-rose-900/10 blur-[140px] rounded-full -z-10" />
    </div>
  );
};
