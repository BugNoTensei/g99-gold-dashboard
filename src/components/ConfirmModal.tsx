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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 w-screen overflow-y-auto bg-gray-950/60 backdrop-blur-sm transition-opacity">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  ยืนยันการบันทึกข้อมูล
                </h3>
                <div className="mt-4 rounded-lg bg-gray-50 p-4 border border-gray-100">
                  <div className="flex justify-between py-1 text-sm border-b border-gray-200 mb-2 pb-2">
                    <span className="text-gray-500 font-medium">
                      รูปแบบการอัปเดต:
                    </span>
                    <span
                      className={`font-bold ${saveMode === "admin" ? "text-red-600" : "text-gray-900"}`}
                    >
                      {saveMode === "admin" ? "ประกาศราคากลาง" : "ปรับราคาสาขา"}
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
                  </div>{" "}
                </div>
                {saveMode === "admin" && forceUpdate && (
                  <p className="mt-3 text-sm font-semibold text-red-600 flex items-center justify-center sm:justify-start">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    คำสั่งนี้จะบังคับอัปเดตทุกสาขาทันที
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSaving}
              className={`inline-flex w-full justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                saveMode === "admin"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-900 hover:bg-gray-800"
              } ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSaving ? "กำลังดำเนินการ..." : "ยืนยันการบันทึก"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              ย้อนกลับ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
