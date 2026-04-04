"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import { SetupStep1 } from "./SetupStep1";
import { SetupStep2 } from "./SetupStep2";
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
  const totalSteps = 5;
  const [formData, setFormData] = useState({
    adminPassword: adminPassword,
    adminHint: "",
    isPrivate: true,
    viewerPassword: "BEAR2024",
    viewerHint: "",
    media: [],
  });

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
          .select('*, media:moment_media(*)')
          .ilike('short_id', momentId.trim().toLowerCase())
          .limit(1)
          .maybeSingle();

        if (mError) throw mError;

        if (moment) {
          // Sắp xếp media theo index
          const sortedMedia = (moment.media || []).sort((a: any, b: any) => a.order_index - b.order_index);
          
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
            title: "Kỉ niệm của tôi"
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
        if (!resMedia.ok) throw new Error('Không thể lưu danh sách media.');
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
            title: "Kỉ niệm của tôi"
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

    if (step === 4) {
      handleFinalSave();
    } else if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
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
            onEdit={() => setStep(3)} 
            settings={{
              isPrivate: formData.isPrivate,
              viewerPassword: formData.viewerPassword,
              viewerHint: formData.viewerHint
            }}
            onSaveSettings={handleQuickSettingsSave}
          />
        );
      case 3:
        return <SetupStep2 {...props} />;
      case 4:
        return <SetupStep4 {...props} />;
      case 5:
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
        <StepIndicator currentStep={step} totalSteps={totalSteps} />
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
              {step === 1 ? "Thoát" : "Quay lại"}
            </span>
          </button>

          <button
            onClick={nextStep}
            disabled={isSaving}
            className="flex items-center justify-center bg-gradient-to-r from-rose-300 to-rose-500 text-zinc-950 rounded-2xl px-10 py-4 shadow-xl shadow-rose-500/20 hover:brightness-110 transition-all active:scale-[0.98] duration-150 disabled:opacity-70"
          >
            <span className="font-be-vietnam text-xs font-bold uppercase tracking-widest mr-2">
              {isSaving ? "Đang xử lý..." : (step === 4 ? "Lưu và kích hoạt" : "Tiếp theo")}
            </span>
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              step === 4 ? <Check size={18} /> : <ArrowRight size={18} />
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
