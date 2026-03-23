import { useState } from "react";
import type { GoldPrices } from "../services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentPrices: GoldPrices;
  onSave: (payload: GoldPrices) => Promise<void>;
  onShowToast: (msg: string, type: "success" | "error") => void;
}

export default function AdminModal({
  isOpen,
  onClose,
  currentPrices,
  onSave,
  onShowToast,
}: Props) {
  const [formData, setFormData] = useState({
    barBuy: "",
    barSale: "",
    ornaReturn: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (isOpen && !prevIsOpen) {
    setFormData({
      barBuy: currentPrices.barBuy ? String(currentPrices.barBuy) : "",
      barSale: currentPrices.barSale ? String(currentPrices.barSale) : "",
      ornaReturn: currentPrices.ornaReturn
        ? String(currentPrices.ornaReturn)
        : "",
    });
    setPrevIsOpen(true);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.barBuy || !formData.barSale) {
      return onShowToast("กรุณากรอกราคาแท่งให้ครบ", "error");
    }

    setIsSaving(true);
    try {
      await onSave({
        barBuy: Number(formData.barBuy),
        barSale: Number(formData.barSale),
        ornaReturn: formData.ornaReturn
          ? Number(formData.ornaReturn)
          : Number(formData.barBuy) * 0.95,
      });
      onShowToast("อัปเดตราคาสำเร็จ!", "success");
      onClose();
    } catch {
      onShowToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-1000 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-primary text-center text-lg md:text-2xl font-bold mb-5 md:mb-6">
          ตั้งค่าราคาทองคำด้วยตนเอง
        </h2>

        <div className="mb-4">
          <label className="block mb-1 text-xs md:text-base font-semibold text-gray-700">
            รับซื้อ ทองคำแท่ง
          </label>
          <input
            type="number"
            value={formData.barBuy}
            onChange={(e) =>
              setFormData({ ...formData, barBuy: e.target.value })
            }
            className="w-full p-2.5 text-base md:text-lg border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-xs md:text-base font-semibold text-gray-700">
            ขายออก ทองคำแท่ง
          </label>
          <input
            type="number"
            value={formData.barSale}
            onChange={(e) =>
              setFormData({ ...formData, barSale: e.target.value })
            }
            className="w-full p-2.5 text-base md:text-lg border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-xs md:text-base font-semibold text-gray-700">
            รับซื้อ ทองรูปพรรณ (ไม่จำเป็นต้องกรอก)
          </label>
          <input
            type="number"
            value={formData.ornaReturn}
            onChange={(e) =>
              setFormData({ ...formData, ornaReturn: e.target.value })
            }
            className="w-full p-2.5 text-base md:text-lg border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
            placeholder="ระบบจะคำนวณให้โดยอัตโนมัติ"
          />
        </div>

        <div className="flex justify-end gap-3 md:gap-4 mt-6 md:mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs md:text-base font-semibold rounded-lg transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-primary hover:bg-secondary text-white text-xs md:text-base font-semibold rounded-lg transition-colors"
          >
            {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );
}
