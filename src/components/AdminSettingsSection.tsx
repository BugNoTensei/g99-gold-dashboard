import { Switch } from "@headlessui/react";
import {
  ImagesIcon,
  StorefrontIcon,
  ArrowsClockwiseIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { SYS_ROLES } from "../config/constants";
import type { UserRole } from "../types";

interface Props {
  userRole: UserRole | null;
  isAutoFetch: boolean;
  onToggleAutoFetch: (status: boolean) => void;
  isUsingLocal: boolean;
  clearLocalPrice: () => void;
  onOpenBannerManager: () => void;
  onOpenBranchManager: () => void;
  onRefreshPrice: () => void;
  isSaving: boolean;
}

export default function AdminSettingsSection({
  userRole,
  isAutoFetch,
  onToggleAutoFetch,
  isUsingLocal,
  clearLocalPrice,
  onOpenBannerManager,
  onOpenBranchManager,
  onRefreshPrice,
  isSaving,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
            <ImagesIcon size={20} className="text-gray-700" weight="fill" />
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
          onClick={onOpenBannerManager}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          ตั้งค่ารูปภาพ
        </button>
      </div>

      {userRole === SYS_ROLES.ADMIN && (
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
            onClick={onOpenBranchManager}
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
            onClick={onRefreshPrice}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${!isAutoFetch || isUsingLocal || isSaving ? "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none" : "bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-900"}`}
          >
            <ArrowsClockwiseIcon
              size={16}
              weight="bold"
              className={isSaving ? "animate-spin" : ""}
            />
            <span>
              {!isAutoFetch || isUsingLocal ? "ปิดการซิงค์" : "ซิงค์ทันที"}
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
              onClick={clearLocalPrice}
              className="text-xs font-bold text-red-700 hover:text-red-900 hover:underline transition-colors cursor-pointer"
            >
              ล้างค่าและใช้ราคากลาง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
