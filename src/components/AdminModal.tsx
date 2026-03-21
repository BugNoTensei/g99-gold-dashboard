import { useState } from "react";
import type { GoldPrices } from "../services/api";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentPrices: GoldPrices;
  onSave: (payload: GoldPrices) => Promise<void>;
}

export default function AdminModal({
  isOpen,
  onClose,
  currentPrices,
  onSave,
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
    if (!formData.barBuy || !formData.barSale)
      return alert("กรุณากรอกราคาแท่งให้ครบ");
    setIsSaving(true);
    await onSave({
      barBuy: Number(formData.barBuy),
      barSale: Number(formData.barSale),
      ornaReturn: formData.ornaReturn
        ? Number(formData.ornaReturn)
        : Number(formData.barBuy) * 0.95,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-1000 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-10 rounded-[20px] w-125 shadow-2xl">
        <h2 className="text-primary text-center text-2xl font-bold mb-6">
          ตั้งค่าราคาทองคำด้วยตนเอง
        </h2>

        <div className="mb-5">
          <label className="block mb-2 font-semibold text-gray-700">
            รับซื้อ ทองคำแท่ง
          </label>
          <input
            type="number"
            value={formData.barBuy}
            onChange={(e) =>
              setFormData({ ...formData, barBuy: e.target.value })
            }
            className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
          />
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-semibold text-gray-700">
            ขายออก ทองคำแท่ง
          </label>
          <input
            type="number"
            value={formData.barSale}
            onChange={(e) =>
              setFormData({ ...formData, barSale: e.target.value })
            }
            className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
          />
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-semibold text-gray-700">
            รับซื้อ ทองรูปพรรณ
          </label>
          <input
            type="number"
            value={formData.ornaReturn}
            onChange={(e) =>
              setFormData({ ...formData, ornaReturn: e.target.value })
            }
            className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
            placeholder="ปล่อยว่างเพื่อคำนวณอัตโนมัติ"
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-lg transition-colors"
          >
            {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );
}
