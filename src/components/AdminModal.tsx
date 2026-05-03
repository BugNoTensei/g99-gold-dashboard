import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { SYS_ROLES } from "../config/constants";
import type { GoldPrices, UserRole } from "../types";
import ConfirmModal from "./ConfirmModal";
import { BannerManagerModal } from "./BannerManagerModal";
import { BranchManagerModal } from "./BranchManagerModal";
import AdminModalHeader from "./AdminModalHeader";
import AdminSettingsSection from "./AdminSettingsSection";
import AdminPriceForm from "./AdminPriceForm";
import { useBannerManagement } from "../hooks/useBannerManagement";
import { usePriceForm } from "../hooks/usePriceForm";
import { WarningCircleIcon } from "@phosphor-icons/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentPrices: GoldPrices;
  onShowToast: (msg: string, type: "success" | "error") => void;
  isAutoFetch: boolean;
  onToggleAutoFetch: (status: boolean) => void;
  saveBranchPrice: (payload: GoldPrices) => void;
  saveAdminPrice: (
    payload: GoldPrices,
    forceUpdateAll: boolean,
  ) => Promise<void>;
  clearLocalPrice: () => void;
  isUsingLocal: boolean;
  userRole: UserRole | null;
  fetchPrice: () => Promise<void>;
  branchId: string;
  branchName: string;
}

export default function AdminModal({
  isOpen,
  onClose,
  currentPrices,
  onShowToast,
  isAutoFetch,
  onToggleAutoFetch,
  saveBranchPrice,
  saveAdminPrice,
  clearLocalPrice,
  isUsingLocal,
  userRole,
  fetchPrice,
  branchId,
  branchName,
}: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saveMode, setSaveMode] = useState<UserRole>(SYS_ROLES.BRANCH);
  const [forceUpdate, setForceUpdate] = useState(false);

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isBranchManagerOpen, setIsBranchManagerOpen] = useState(false);

  const {
    banners,
    useAdminBanners,
    setUseAdminBanners,
    fetchBanners,
    handleUploadBanner,
    handleDeleteBanner,
  } = useBannerManagement(userRole, branchId, onShowToast);

  const { formData, handleInputChange, resetForm } = usePriceForm({
    currentPrices,
    userRole,
    isAutoFetch,
    onToggleAutoFetch,
  });

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    resetForm();
    if (userRole === SYS_ROLES.BRANCH) {
      setSaveMode(SYS_ROLES.BRANCH);
    }
    setShowConfirm(false);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  useEffect(() => {
    if (isOpen) {
      fetchBanners();
    }
  }, [isOpen, fetchBanners]);

  const handlePreSubmit = () => {
    if (!formData.barBuy || !formData.barSale) {
      onShowToast("กรุณาระบุราคาทองคำแท่งให้ครบถ้วน", "error");
      return;
    }
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const currentTime = new Date().toISOString();
    const payload = {
      barBuy: Number(formData.barBuy),
      barSale: Number(formData.barSale),
      ornaReturn: formData.ornaReturn ? Number(formData.ornaReturn) : 0,
      priceAt: currentTime,
    };

    try {
      if (saveMode === SYS_ROLES.BRANCH) {
        saveBranchPrice(payload);
        onShowToast("บันทึกข้อมูลระดับสาขาเรียบร้อยแล้ว", "success");
      } else {
        await saveAdminPrice(payload, forceUpdate);
        onShowToast("ประกาศราคากลางเข้าสู่ระบบเรียบร้อยแล้ว", "success");
      }
      setShowConfirm(false);
      onClose();
    } catch {
      onShowToast("พบข้อผิดพลาดขณะบันทึกข้อมูล", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const isSubmitDisabled = isAutoFetch && userRole !== SYS_ROLES.ADMIN;

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
        />

        <div className="fixed inset-0 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
            <DialogPanel
              transition
              className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:my-8 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <AdminModalHeader onClose={onClose} />

              <div className="px-6 py-6 sm:p-6 space-y-4 bg-white">
                <AdminSettingsSection
                  userRole={userRole}
                  isAutoFetch={isAutoFetch}
                  onToggleAutoFetch={onToggleAutoFetch}
                  isUsingLocal={isUsingLocal}
                  clearLocalPrice={clearLocalPrice}
                  onOpenBannerManager={() => setIsBannerModalOpen(true)}
                  onOpenBranchManager={() => setIsBranchManagerOpen(true)}
                  onRefreshPrice={async () => {
                    try {
                      await fetchPrice();
                      onShowToast("ดึงราคาล่าสุดเรียบร้อย", "success");
                    } catch {
                      onShowToast("ดึงราคาไม่สำเร็จ กรุณาลองใหม่", "error");
                    }
                  }}
                  isSaving={isSaving}
                />

                <AdminPriceForm
                  userRole={userRole}
                  saveMode={saveMode}
                  setSaveMode={setSaveMode}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  isAutoFetch={isAutoFetch}
                />

                {saveMode === SYS_ROLES.ADMIN &&
                  userRole === SYS_ROLES.ADMIN && (
                    <div className="relative flex items-start pt-5 border-t border-red-100 bg-red-50/50 p-4 rounded-xl mt-4">
                      <div className="flex h-6 items-center">
                        <input
                          id="forceUpdate"
                          type="checkbox"
                          checked={forceUpdate}
                          onChange={() => setForceUpdate(!forceUpdate)}
                          className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-600 cursor-pointer transition-all"
                        />
                      </div>
                      <div
                        className="ml-3 text-sm leading-6 cursor-pointer"
                        onClick={() => setForceUpdate(!forceUpdate)}
                      >
                        <label
                          htmlFor="forceUpdate"
                          className="font-bold text-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <WarningCircleIcon size={18} weight="fill" />
                          อันตราย: บังคับอัปเดตราคาทุกสาขาทันที (Force Global
                          Sync)
                        </label>
                        <p className="text-red-600 font-medium text-xs mt-1">
                          คำเตือน: คำสั่งนี้จะทำการ "ล้างราคาทุกสาขา"
                          ที่ตั้งไว้เองทั้งหมด
                          และบังคับให้กลับมาใช้ราคากลางนี้ทันที!
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              <div className="bg-gray-50 px-6 py-5 sm:flex sm:flex-row-reverse sm:gap-x-3 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handlePreSubmit}
                  disabled={isSubmitDisabled}
                  className={`inline-flex w-full justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm sm:w-auto transition-all cursor-pointer ${saveMode === SYS_ROLES.BRANCH ? "bg-gray-950 hover:bg-gray-800" : "bg-red-600 hover:bg-red-700"} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saveMode === SYS_ROLES.BRANCH
                    ? "บันทึกราคาสาขา"
                    : "ประกาศราคากลาง"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-gray-950 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100 sm:mt-0 sm:w-auto transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
        isSaving={isSaving}
        saveMode={saveMode}
        formData={formData}
        forceUpdate={forceUpdate}
      />

      <BannerManagerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        branchName={
          userRole === SYS_ROLES.ADMIN ? "ส่วนกลาง (Admin)" : `${branchName}`
        }
        banners={banners}
        onUploadBanner={handleUploadBanner}
        onDeleteBanner={handleDeleteBanner}
        userRole={userRole}
        useAdminBanners={useAdminBanners}
        onToggleAdminBanners={setUseAdminBanners}
      />

      <BranchManagerModal
        isOpen={isBranchManagerOpen}
        onClose={() => setIsBranchManagerOpen(false)}
        onShowToast={onShowToast}
      />
    </>
  );
}
