import { useState, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
  Transition,
  TransitionChild,
  Switch,
} from "@headlessui/react";
import {
  XIcon,
  TrashIcon,
  PlusIcon,
  CircleNotchIcon,
  WarningIcon,
  BuildingsIcon,
  ImagesSquareIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";

export interface Banner {
  id: string;
  url: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  branchName: string;
  banners: Banner[];
  onUploadBanner: (file: File) => Promise<void>;
  onDeleteBanner: (id: string) => Promise<void>;
  userRole: "admin" | "branch" | null;
  useAdminBanners: boolean;
  onToggleAdminBanners: (val: boolean) => void;
}

const MAX_BANNERS = 5;

export function BannerManagerModal({
  isOpen,
  onClose,
  branchName,
  banners,
  onUploadBanner,
  onDeleteBanner,
  userRole,
  useAdminBanners,
  onToggleAdminBanners,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReadOnly = userRole === "branch" && useAdminBanners;
  const currentCount = banners.length;
  const isAtLimit = currentCount >= MAX_BANNERS;
  const progressPercentage = Math.min((currentCount / MAX_BANNERS) * 100, 100);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isAtLimit) return;

    setIsUploading(true);
    try {
      await onUploadBanner(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Transition show={isOpen}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogBackdrop className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 flex flex-col max-h-[90vh]">
                  <div className="border-b border-gray-100 px-6 py-5 bg-white sticky top-0 z-10 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <DialogTitle
                          as="h3"
                          className="text-xl font-bold text-gray-900 flex items-center gap-2"
                        >
                          จัดการป้ายโฆษณา
                          {isReadOnly && (
                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100 flex items-center gap-1">
                              <LockKeyIcon weight="bold" />
                              โหมดอ่านอย่างเดียว
                            </span>
                          )}
                        </DialogTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          สาขา:{" "}
                          <span className="font-semibold text-gray-700">
                            {branchName}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors"
                      >
                        <XIcon size={20} weight="bold" />
                      </button>
                    </div>

                    {!isReadOnly && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${isAtLimit ? "bg-red-100 text-red-600" : "bg-white text-gray-700 shadow-sm border border-gray-200"}`}
                          >
                            <ImagesSquareIcon size={20} weight="fill" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">
                              จำนวนที่ยังสามารถอัปโหลดได้
                            </span>
                            <span className="text-xs text-gray-500">
                              สามารถใส่ได้สูงสุด {MAX_BANNERS} รูป
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end min-w-35">
                          <span
                            className={`text-sm font-bold ${isAtLimit ? "text-red-600" : "text-gray-900"}`}
                          >
                            {currentCount} / {MAX_BANNERS} รูป
                          </span>
                          <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ease-out ${isAtLimit ? "bg-red-500" : "bg-gray-900"}`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {userRole === "branch" && (
                    <div className="bg-amber-50/50 px-6 py-4 border-b border-amber-100 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <BuildingsIcon
                          size={24}
                          className="text-amber-600"
                          weight="fill"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            ใช้รูปภาพจากสำนักงานใหญ่
                          </p>
                          <p className="text-xs text-gray-500">
                            หากเปิดใช้งาน
                            จะดึงรูปภาพจากส่วนกลางมาแสดงแทนรูปของสาขา
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={useAdminBanners}
                        onChange={onToggleAdminBanners}
                        className={`group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${useAdminBanners ? "bg-amber-500" : "bg-gray-300"}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${useAdminBanners ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </Switch>
                    </div>
                  )}

                  <div className="p-6 bg-gray-50 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {banners.map((banner) => (
                        <div
                          key={banner.id}
                          className="group relative aspect-4/3 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200"
                        >
                          <img
                            src={banner.url}
                            alt="Banner"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {!isReadOnly && (
                            <div className="absolute inset-0 bg-linear-to-t from-gray-950/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                              <button
                                onClick={() => setConfirmDeleteId(banner.id)}
                                disabled={deletingId === banner.id}
                                className="flex items-center justify-center gap-2 w-full bg-red-600/90 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold backdrop-blur-md cursor-pointer transition-colors"
                              >
                                {deletingId === banner.id ? (
                                  <CircleNotchIcon
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <TrashIcon size={16} weight="bold" />
                                )}{" "}
                                ลบรูปนี้
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {!isReadOnly &&
                        (isAtLimit ? (
                          <div className="aspect-4/3 rounded-xl border-2 border-dashed border-red-200 bg-red-50/50 flex flex-col items-center justify-center opacity-80 select-none">
                            <WarningIcon
                              size={28}
                              className="mb-2 text-red-400"
                              weight="fill"
                            />
                            <span className="text-sm font-bold text-red-800">
                              อัพโหลดรูปครบจำนวนแล้ว
                            </span>
                            <span className="text-xs font-medium text-red-600 mt-1">
                              ลบรูปเดิมเพื่อเพิ่มใหม่
                            </span>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              !isUploading && fileInputRef.current?.click()
                            }
                            className="aspect-4/3 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-900 bg-white hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group"
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                              accept="image/*"
                              className="hidden"
                            />
                            {isUploading ? (
                              <div className="flex flex-col items-center text-gray-600">
                                <CircleNotchIcon
                                  size={28}
                                  className="animate-spin mb-2"
                                />
                                <span className="text-sm font-bold">
                                  กำลังอัปโหลด...
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-900 transition-colors">
                                <PlusIcon
                                  size={28}
                                  weight="bold"
                                  className="mb-2"
                                />
                                <span className="text-sm font-bold">
                                  เพิ่มรูปภาพใหม่
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition show={!!confirmDeleteId}>
        <Dialog
          as="div"
          className="relative z-60"
          onClose={() => setConfirmDeleteId(null)}
        >
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogBackdrop className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-sm p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 mb-5 border border-red-100">
                      <WarningIcon
                        size={32}
                        weight="fill"
                        className="text-red-600"
                      />
                    </div>
                    <DialogTitle
                      as="h3"
                      className="text-xl font-bold leading-6 text-gray-900"
                    >
                      ยืนยันการลบรูปภาพ?
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-2">
                      รูปภาพนี้จะถูกลบออกจากระบบอย่างถาวร
                    </p>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      className="flex-1 justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      className="flex-1 justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 cursor-pointer transition-colors"
                      onClick={async () => {
                        if (!confirmDeleteId) return;
                        const id = confirmDeleteId;
                        setConfirmDeleteId(null);
                        setDeletingId(id);
                        try {
                          await onDeleteBanner(id);
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                    >
                      ลบทิ้ง
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
