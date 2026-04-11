import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { WarningIcon, WarningCircleIcon } from "@phosphor-icons/react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSaving: boolean;
  saveMode: "branch" | "admin";
  formData: { barBuy: string; barSale: string; ornaReturn: string };
  forceUpdate: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isSaving,
  saveMode,
  formData,
  forceUpdate,
}: ConfirmModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => !isSaving && onClose()}
      className="relative z-60"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
      />

      <div className="fixed inset-0 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:my-8 sm:w-full sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <WarningIcon
                    size={24}
                    weight="bold"
                    className="text-red-600"
                  />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold leading-6 text-gray-900"
                  >
                    ยืนยันการบันทึกข้อมูล
                  </DialogTitle>

                  <div className="mt-4 rounded-lg bg-gray-50 p-4 border border-gray-100">
                    <div className="flex justify-between py-1 text-sm border-b border-gray-200 mb-2 pb-2">
                      <span className="text-gray-500 font-medium">
                        รูปแบบการอัปเดต:
                      </span>
                      <span
                        className={`font-bold ${saveMode === "admin" ? "text-red-600" : "text-gray-900"}`}
                      >
                        {saveMode === "admin"
                          ? "ประกาศราคากลาง"
                          : "ปรับราคาสาขา"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-gray-500 font-medium">
                        รับซื้อ ทองแท่ง:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {Number(formData.barBuy).toLocaleString()} บาท
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-gray-500 font-medium">
                        ขายออก ทองแท่ง:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {Number(formData.barSale).toLocaleString()} บาท
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-gray-500 font-medium">
                        รับซื้อ รูปพรรณ:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formData.ornaReturn && Number(formData.ornaReturn) > 0
                          ? `${Number(formData.ornaReturn).toLocaleString()} บาท`
                          : `ประมาณ ${(Number(formData.barBuy) * 0.95).toLocaleString()} บาท`}
                      </span>
                    </div>
                  </div>

                  {saveMode === "admin" && forceUpdate && (
                    <p className="mt-3 text-sm font-semibold text-red-600 flex items-center justify-center sm:justify-start">
                      <WarningCircleIcon
                        size={16}
                        weight="fill"
                        className="mr-1.5 shrink-0"
                      />
                      คำสั่งนี้จะบังคับอัปเดตทุกสาขาทันที
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSaving}
                className={`inline-flex w-full justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto transition-all ${
                  saveMode === "admin"
                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    : "bg-gray-900 hover:bg-gray-800 focus:ring-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isSaving ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSaving ? "กำลังดำเนินการ..." : "ยืนยันการบันทึก"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ย้อนกลับ
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
