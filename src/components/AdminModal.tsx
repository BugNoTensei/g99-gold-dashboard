import { useState } from "react";
import type { GoldPrices } from "../services/api";
import ConfirmModal from "./ConfirmModal";

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
}: Props) {
  const [formData, setFormData] = useState({
    barBuy: "",
    barSale: "",
    ornaReturn: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saveMode, setSaveMode] = useState<"branch" | "admin">("branch");
  const [forceUpdate, setForceUpdate] = useState(false);

  if (isOpen && !prevIsOpen) {
    setFormData({
      barBuy: currentPrices.barBuy > 0 ? String(currentPrices.barBuy) : "",
      barSale: currentPrices.barSale > 0 ? String(currentPrices.barSale) : "",
      ornaReturn:
        currentPrices.ornaReturn > 0 ? String(currentPrices.ornaReturn) : "",
    });
    setPrevIsOpen(true);
    setShowConfirm(false);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  if (!isOpen) return null;

  const handlePreSubmit = () => {
    if (!formData.barBuy || !formData.barSale) {
      onShowToast("กรุณาระบุราคาทองคำแท่งให้ครบถ้วน", "error");
      return;
    }
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const payload = {
      barBuy: Number(formData.barBuy),
      barSale: Number(formData.barSale),
      ornaReturn: formData.ornaReturn ? Number(formData.ornaReturn) : 0,
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

  return (
    <>
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto bg-gray-950/70 backdrop-blur-sm transition-opacity">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
          <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8">
            <div className="border-b border-gray-100 bg-white px-6 py-5">
              <div className="flex items-center justify-between gap-x-4">
                <div className="flex items-center gap-x-3">
                  <div className="flex-none rounded-lg bg-red-50 p-2 border border-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold leading-6 text-gray-950">
                    ระบบบริหารจัดการราคาทองคำ
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-6 sm:p-6 space-y-6 bg-white">
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    การซิงค์ข้อมูลอัตโนมัติ
                  </span>
                  <span className="text-xs text-gray-500">
                    อัปเดตข้อมูลจากสมาคมค้าทองคำทุก 5 นาที
                  </span>
                </div>
                <button
                  onClick={() => onToggleAutoFetch(!isAutoFetch)}
                  className={`${
                    isAutoFetch ? "bg-red-600" : "bg-gray-300"
                  } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-2 ring-transparent focus:ring-red-600 ring-offset-2`}
                >
                  <span
                    className={`${
                      isAutoFetch ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              {isUsingLocal && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-200 shadow-inner">
                  <div className="flex items-center justify-between gap-x-3">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-red-500 mr-2.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
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
                      className="text-xs font-bold text-red-700 hover:text-red-900 hover:underline transition-colors"
                    >
                      ล้างค่าและใช้ราคากลาง
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-1.5 rounded-lg bg-gray-100 p-1 ring-1 ring-gray-200">
                <button
                  onClick={() => setSaveMode("branch")}
                  className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all duration-150 ${
                    saveMode === "branch"
                      ? "bg-white text-gray-950 shadow ring-1 ring-gray-900/5"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  ปรับราคาสาขา
                </button>
                <button
                  onClick={() => setSaveMode("admin")}
                  className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all duration-150 ${
                    saveMode === "admin"
                      ? "bg-white text-red-600 shadow ring-1 ring-red-900/5"
                      : "text-gray-500 hover:text-red-700 hover:bg-white/50"
                  }`}
                >
                  ประกาศราคากลาง (Admin)
                </button>
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium leading-6 text-gray-950">
                    ราคารับซื้อ (ทองคำแท่ง)
                  </label>
                  <div className="relative mt-2 rounded-lg shadow-sm">
                    <input
                      type="number"
                      value={formData.barBuy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          barBuy: e.target.value,
                          ornaReturn: "",
                        })
                      }
                      className="block w-full rounded-lg border-0 py-3 pl-4 pr-12 text-gray-950 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm font-semibold"
                      placeholder="0"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-sm font-medium text-gray-500">
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
                      value={formData.barSale}
                      onChange={(e) =>
                        setFormData({ ...formData, barSale: e.target.value })
                      }
                      className="block w-full rounded-lg border-0 py-3 pl-4 pr-12 text-gray-950 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm font-semibold"
                      placeholder="0"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-sm font-medium text-gray-500">
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
                      onChange={(e) =>
                        setFormData({ ...formData, ornaReturn: e.target.value })
                      }
                      className="block w-full rounded-lg border-0 py-3 pl-4 pr-12 text-gray-950 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm font-semibold bg-gray-50 focus:bg-white"
                      placeholder="ระบบจะคำนวณอัตโนมัติหากเว้นว่าง"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-sm font-medium text-gray-500">
                        บาท
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    หากเว้นว่าง ระบบจะคำนวณที่ 95% ของราคาทองคำแท่งอัตโนมัติ
                  </p>
                </div>
              </div>

              {saveMode === "admin" && (
                <div className="relative flex items-start pt-5 border-t border-gray-100">
                  <div className="flex h-6 items-center">
                    <input
                      id="forceUpdate"
                      type="checkbox"
                      checked={forceUpdate}
                      onChange={() => setForceUpdate(!forceUpdate)}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer transition-colors"
                    />
                  </div>
                  <div
                    className="ml-3 text-sm leading-6 cursor-pointer"
                    onClick={() => setForceUpdate(!forceUpdate)}
                  >
                    <label
                      htmlFor="forceUpdate"
                      className="font-semibold text-red-900"
                    >
                      บังคับซิงค์ข้อมูลไปยังทุกสาขา (Force Global Sync)
                    </label>
                    <p className="text-gray-600">
                      ข้อมูลนี้จะถูกบังคับใช้แทนที่ข้อมูลที่สาขาตั้งไว้ทั้งหมดในระบบทันที
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-5 sm:flex sm:flex-row-reverse sm:gap-x-3 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={handlePreSubmit}
                className={`inline-flex w-full justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm sm:w-auto transition-all ${
                  saveMode === "branch"
                    ? "bg-gray-950 hover:bg-gray-800"
                    : "bg-red-600 hover:bg-red-700"
                } focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-50`}
              >
                {saveMode === "branch" ? "บันทึกราคาสาขา" : "ประกาศราคากลาง"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-gray-950 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100 sm:mt-0 sm:w-auto transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
        isSaving={isSaving}
        saveMode={saveMode}
        formData={formData}
        forceUpdate={forceUpdate}
      />
    </>
  );
}
