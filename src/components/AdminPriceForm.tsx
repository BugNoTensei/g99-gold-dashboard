import { SYS_ROLES } from "../config/constants";
import type { UserRole } from "../types";

interface Props {
  userRole: UserRole | null;
  saveMode: UserRole;
  setSaveMode: (mode: UserRole) => void;
  formData: {
    barBuy: string;
    barSale: string;
    ornaReturn: string;
  };
  handleInputChange: (
    field: "barBuy" | "barSale" | "ornaReturn",
    value: string,
  ) => void;
  isAutoFetch: boolean;
}

export default function AdminPriceForm({
  userRole,
  saveMode,
  setSaveMode,
  formData,
  handleInputChange,
  isAutoFetch,
}: Props) {
  const isReadOnly = isAutoFetch && userRole !== SYS_ROLES.ADMIN;

  return (
    <div className="space-y-4">
      {userRole === SYS_ROLES.ADMIN ? (
        <div className="flex space-x-1.5 rounded-lg bg-gray-100 p-1 ring-1 ring-gray-200 mt-2">
          <button
            onClick={() => setSaveMode(SYS_ROLES.BRANCH)}
            className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${saveMode === SYS_ROLES.BRANCH ? "bg-white text-gray-950 shadow ring-1 ring-gray-900/5" : "text-gray-600 hover:text-gray-800"}`}
          >
            ปรับราคาสาขา
          </button>
          <button
            onClick={() => setSaveMode(SYS_ROLES.ADMIN)}
            className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${saveMode === SYS_ROLES.ADMIN ? "bg-white text-red-600 shadow ring-1 ring-red-900/5" : "text-gray-600 hover:text-red-700 hover:bg-white/50"}`}
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
              disabled={isReadOnly}
              value={formData.barBuy}
              onChange={(e) => handleInputChange("barBuy", e.target.value)}
              className={`block w-full rounded-lg border-0 py-3 pl-4 pr-12 ring-1 ring-inset ring-gray-300 sm:text-sm font-semibold transition-colors focus:outline-none ${isReadOnly ? "bg-gray-100 text-gray-700 cursor-not-allowed" : "bg-white text-gray-950 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600"}`}
              placeholder="0"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-sm font-medium text-gray-700">บาท</span>
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
              disabled={isReadOnly}
              value={formData.barSale}
              onChange={(e) => handleInputChange("barSale", e.target.value)}
              className={`block w-full rounded-lg border-0 py-3 pl-4 pr-12 ring-1 ring-inset ring-gray-300 sm:text-sm font-semibold transition-colors focus:outline-none ${isReadOnly ? "bg-gray-100 text-gray-700 cursor-not-allowed" : "bg-white text-gray-950 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600"}`}
              placeholder="0"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-sm font-medium text-gray-700">บาท</span>
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
              disabled={isReadOnly}
              value={formData.ornaReturn}
              onChange={(e) => handleInputChange("ornaReturn", e.target.value)}
              className={`block w-full rounded-lg border-0 py-3 pl-4 pr-12 ring-1 ring-inset ring-gray-300 sm:text-sm font-semibold transition-colors focus:outline-none ${isReadOnly ? "bg-gray-100 text-gray-700 cursor-not-allowed" : "bg-gray-50 text-gray-950 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-red-600"}`}
              placeholder="ระบบจะคำนวณอัตโนมัติหากเว้นว่าง"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-sm font-medium text-gray-700">บาท</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
