import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
  Switch,
} from "@headlessui/react";
import {
  getPromotionBanners,
  uploadPromotionBanner,
  deletePromotionBanner,
} from "../services/api";
import type { GoldPrices } from "../services/api";
import ConfirmModal from "./ConfirmModal";
import { BannerManagerModal, type Banner } from "./BannerManagerModal";
import { BranchManagerModal } from "./BranchManagerModal";
import {
  FadersIcon,
  XIcon,
  WarningCircleIcon,
  ArrowsClockwiseIcon,
  ImagesIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";

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
  userRole: "branch" | "admin" | null;
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
  const [formData, setFormData] = useState({
    barBuy: "",
    barSale: "",
    ornaReturn: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saveMode, setSaveMode] = useState<"branch" | "admin">("branch");
  const [forceUpdate, setForceUpdate] = useState(false);

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isBranchManagerOpen, setIsBranchManagerOpen] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);

  const [useAdminBanners, setUseAdminBanners] = useState(() => {
    return (
      localStorage.getItem(`g99_use_admin_banners_${branchId}`) !== "false"
    );
  });

  const fetchBanners = useCallback(async () => {
    const targetBranch =
      userRole === "admin" ? "main" : useAdminBanners ? "main" : branchId;
    try {
      const banners = await getPromotionBanners(targetBranch);
      setBanners(
        banners.map((b) => ({
          id: b.id,
          url: `${b.imageUrl}?t=${new Date().getTime()}`,
        })),
      );
    } catch {
      setBanners([]);
    }
  }, [userRole, branchId, useAdminBanners]);

  useEffect(() => {
    localStorage.setItem(
      `g99_use_admin_banners_${branchId}`,
      String(useAdminBanners),
    );
    const loadBanners = async () => {
      await fetchBanners();
    };
    loadBanners();
  }, [useAdminBanners, fetchBanners, branchId]);

  const handleUploadBanner = async (file: File) => {
    try {
      const targetBranch = userRole === "admin" ? "main" : branchId;
      await uploadPromotionBanner(file, targetBranch);
      await fetchBanners();
      onShowToast("เพิ่มรูปโฆษณาสำเร็จ", "success");
    } catch {
      onShowToast("อัปโหลดไม่สำเร็จ", "error");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const bannerToDelete = banners.find((b) => b.id === id);
      if (bannerToDelete) {
        const targetBranch = userRole === "admin" ? "main" : branchId;
        await deletePromotionBanner(id, bannerToDelete.url, targetBranch);
        setBanners(banners.filter((b) => b.id !== id));
        onShowToast("ลบรูปโฆษณาสำเร็จ", "success");
      }
    } catch {
      onShowToast("ลบข้อมูลไม่สำเร็จ", "error");
    }
  };

  useEffect(() => {
    localStorage.setItem(
      `g99_use_admin_banners_${branchId}`,
      String(useAdminBanners),
    );
    const loadBanners = async () => {
      await fetchBanners();
    };
    loadBanners();
  }, [useAdminBanners, fetchBanners, branchId]);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setFormData({
      barBuy: currentPrices.barBuy > 0 ? String(currentPrices.barBuy) : "",
      barSale: currentPrices.barSale > 0 ? String(currentPrices.barSale) : "",
      ornaReturn:
        currentPrices.ornaReturn > 0 ? String(currentPrices.ornaReturn) : "",
    });
    if (userRole === "branch") {
      setSaveMode("branch");
    }
    setShowConfirm(false);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }
  useEffect(() => {
    if (isOpen) {
      const loadInitialBanners = async () => {
        await fetchBanners();
      };
      loadInitialBanners();
    }
  }, [isOpen, fetchBanners]);

  const handleInputChange = (
    field: "barBuy" | "barSale" | "ornaReturn",
    value: string,
  ) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "barBuy") {
        const buyPrice = Number(value);
        if (buyPrice > 0) {
          const calculatedOrna = Math.floor(buyPrice * 0.95);
          newData.ornaReturn = String(calculatedOrna);
        } else {
          newData.ornaReturn = "";
        }
      }

      return newData;
    });

    if (userRole === "admin" && isAutoFetch) {
      onToggleAutoFetch(false);
    }
  };
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
      if (saveMode === "branch") {
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

  const isSubmitDisabled = isAutoFetch && userRole !== "admin";

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
              <div className="border-b border-gray-100 bg-white px-6 py-5">
                <div className="flex items-center justify-between gap-x-4">
                  <div className="flex items-center gap-x-3">
                    <div className="flex-none rounded-lg bg-red-50 p-2 border border-red-100">
                      <FadersIcon
                        size={24}
                        weight="bold"
                        className="text-red-600"
                      />
                    </div>
                    <DialogTitle
                      as="h2"
                      className="text-xl font-bold leading-6 text-gray-950"
                    >
                      ระบบบริหารจัดการราคาทองคำ
                    </DialogTitle>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <XIcon size={24} weight="bold" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6 sm:p-6 space-y-4 bg-white">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                      <ImagesIcon
                        size={20}
                        className="text-gray-700"
                        weight="fill"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        จัดการป้ายโฆษณา
                      </span>
                      <span className="text-xs text-gray-600 mt-0.5">
                        เพิ่ม/ลบ รูปภาพโฆษณา
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsBannerModalOpen(true)}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    ตั้งค่ารูปภาพ
                  </button>
                </div>

                {userRole === "admin" && (
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-amber-100">
                        <StorefrontIcon
                          size={20}
                          className="text-amber-700"
                          weight="fill"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-amber-900">
                          จัดการสาขา (Branches)
                        </span>
                        <span className="text-xs text-amber-700 mt-0.5">
                          เพิ่มสาขาใหม่ในระบบ
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsBranchManagerOpen(true)}
                      className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm ring-1 ring-inset ring-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      จัดการสาขา
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition-all mt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      การซิงค์ข้อมูลอัตโนมัติ
                    </span>
                    <span className="text-xs text-gray-600">
                      {isAutoFetch
                        ? "กำลังอัปเดตจากสมาคมค้าทองคำ"
                        : "ปิดการซิงค์ (กำหนดราคาเอง)"}
                    </span>
                  </div>
                  <Switch
                    checked={isAutoFetch}
                    onChange={onToggleAutoFetch}
                    className={`group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ${isAutoFetch ? "bg-red-600" : "bg-gray-300"}`}
                  >
                    <span className="sr-only">เปิด/ปิด ดึงราคาอัตโนมัติ</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAutoFetch ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      ดึงข้อมูลล่าสุด
                    </span>
                  </div>
                  <div className="relative group">
                    <button
                      type="button"
                      disabled={!isAutoFetch || isUsingLocal || isSaving}
                      onClick={async () => {
                        try {
                          await fetchPrice();
                          onShowToast("ดึงราคาล่าสุดเรียบร้อย", "success");
                        } catch {
                          onShowToast("ดึงราคาไม่สำเร็จ กรุณาลองใหม่", "error");
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${!isAutoFetch || isUsingLocal || isSaving ? "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none" : "bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-900"}`}
                    >
                      <ArrowsClockwiseIcon
                        size={16}
                        weight="bold"
                        className={isSaving ? "animate-spin" : ""}
                      />
                      <span>
                        {!isAutoFetch || isUsingLocal
                          ? "ปิดการซิงค์"
                          : "ซิงค์ทันที"}
                      </span>
                    </button>
                  </div>
                </div>

                {isUsingLocal && (
                  <div className="rounded-xl bg-red-50 p-4 border border-red-200 shadow-inner">
                    <div className="flex items-center justify-between gap-x-3">
                      <div className="flex items-center">
                        <WarningCircleIcon
                          size={20}
                          weight="fill"
                          className="text-red-500 mr-2.5"
                        />
                        <span className="text-sm font-semibold text-red-900">
                          แจ้งเตือน: สาขานี้กำลังใช้ "ราคากำหนดเอง"
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          clearLocalPrice();
                          onClose();
                          onShowToast(
                            "คืนค่าสู่ราคากลางเรียบร้อยแล้ว",
                            "success",
                          );
                        }}
                        className="text-xs font-bold text-red-700 hover:text-red-900 hover:underline transition-colors cursor-pointer"
                      >
                        ล้างค่าและใช้ราคากลาง
                      </button>
                    </div>
                  </div>
                )}

                {userRole === "admin" ? (
                  <div className="flex space-x-1.5 rounded-lg bg-gray-100 p-1 ring-1 ring-gray-200 mt-2">
                    <button
                      onClick={() => setSaveMode("branch")}
                      className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${saveMode === "branch" ? "bg-white text-gray-950 shadow ring-1 ring-gray-900/5" : "text-gray-600 hover:text-gray-800"}`}
                    >
                      ปรับราคาสาขา
                    </button>
                    <button
                      onClick={() => setSaveMode("admin")}
                      className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${saveMode === "admin" ? "bg-white text-red-600 shadow ring-1 ring-red-900/5" : "text-gray-600 hover:text-red-700 hover:bg-white/50"}`}
                    >
                      ประกาศราคากลาง (Admin)
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200 text-center border-l-4 border-gray-900 mt-2">
                    <span className="text-sm font-bold text-gray-800">
                      โหมดตั้งค่า: ปรับราคาสาขาหน้าร้าน
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium leading-6 text-gray-950">
                      ราคารับซื้อ (ทองคำแท่ง)
                    </label>
                    <div className="relative mt-2 rounded-lg shadow-sm">
                      <input
                        type="number"
                        disabled={isAutoFetch && userRole !== "admin"}
                        value={formData.barBuy}
                        onChange={(e) =>
                          handleInputChange("barBuy", e.target.value)
                        }
                        className={`block w-full rounded-lg border-0 py-3 pl-4 pr-12 ring-1 ring-inset ring-gray-300 sm:text-sm font-semibold transition-colors focus:outline-none ${isAutoFetch && userRole !== "admin" ? "bg-gray-100 text-gray-700 cursor-not-allowed" : "bg-white text-gray-950 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600"}`}
                        placeholder="0"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-sm font-medium text-gray-700">
                          บาท
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium leading-6 text-gray-950">
                      ราคาขายออก (ทองคำแท่ง)
                    </label>
                    <div className="relative mt-2 rounded-lg shadow-sm">
                      <input
                        type="number"
                        disabled={isAutoFetch && userRole !== "admin"}
                        value={formData.barSale}
                        onChange={(e) =>
                          handleInputChange("barSale", e.target.value)
                        }
                        className={`block w-full rounded-lg border-0 py-3 pl-4 pr-12 ring-1 ring-inset ring-gray-300 sm:text-sm font-semibold transition-colors focus:outline-none ${isAutoFetch && userRole !== "admin" ? "bg-gray-100 text-gray-700 cursor-not-allowed" : "bg-white text-gray-950 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600"}`}
                        placeholder="0"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-sm font-medium text-gray-700">
                          บาท
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium leading-6 text-gray-950">
                      ราคารับซื้อ (ทองรูปพรรณ)
                    </label>
                    <div className="relative mt-2 rounded-lg shadow-sm">
                      <input
                        type="number"
                        disabled={isAutoFetch && userRole !== "admin"}
                        value={formData.ornaReturn}
                        onChange={(e) =>
                          handleInputChange("ornaReturn", e.target.value)
                        }
                        className={`block w-full rounded-lg border-0 py-3 pl-4 pr-12 ring-1 ring-inset ring-gray-300 sm:text-sm font-semibold transition-colors focus:outline-none ${isAutoFetch && userRole !== "admin" ? "bg-gray-100 text-gray-700 cursor-not-allowed" : "bg-gray-50 text-gray-950 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-red-600"}`}
                        placeholder="ระบบจะคำนวณอัตโนมัติหากเว้นว่าง"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-sm font-medium text-gray-700">
                          บาท
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {saveMode === "admin" && userRole === "admin" && (
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
                  className={`inline-flex w-full justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm sm:w-auto transition-all cursor-pointer ${saveMode === "branch" ? "bg-gray-950 hover:bg-gray-800" : "bg-red-600 hover:bg-red-700"} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saveMode === "branch" ? "บันทึกราคาสาขา" : "ประกาศราคากลาง"}
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
        branchName={userRole === "admin" ? "ส่วนกลาง (Admin)" : `${branchName}`}
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
