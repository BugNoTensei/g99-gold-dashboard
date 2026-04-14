import { useState, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X, Trash, Plus, CircleNotch, Warning } from "@phosphor-icons/react";

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
}

export function BannerManagerModal({
  isOpen,
  onClose,
  branchName,
  banners,
  onUploadBanner,
  onDeleteBanner,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      await onDeleteBanner(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
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
                <DialogPanel className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8">
                  <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                      <DialogTitle
                        as="h3"
                        className="text-xl font-bold text-gray-900"
                      >
                        จัดการป้ายโฆษณา (Carousel)
                      </DialogTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        สาขา: {branchName}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      <X size={20} weight="bold" />
                    </button>
                  </div>

                  <div className="p-6 bg-gray-50 min-h-100">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {banners.map((banner) => (
                        <div
                          key={banner.id}
                          className="group relative aspect-4/3 rounded-xl overflow-hidden bg-gray-200 shadow-sm border border-gray-200"
                        >
                          <img
                            src={banner.url}
                            alt="Banner"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-gray-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                            <button
                              onClick={() => setConfirmDeleteId(banner.id)}
                              disabled={deletingId === banner.id}
                              className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                              {deletingId === banner.id ? (
                                <CircleNotch
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash size={16} weight="bold" />
                              )}
                              ลบรูปภาพ
                            </button>
                          </div>
                        </div>
                      ))}

                      <div
                        onClick={() =>
                          !isUploading && fileInputRef.current?.click()
                        }
                        className="aspect-4/3 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center text-gray-400">
                            <CircleNotch
                              size={32}
                              className="animate-spin mb-3 text-gray-900"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              กำลังอัปเดต...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-600 transition-colors">
                            <div className="p-3 bg-gray-50 rounded-full mb-3 group-hover:bg-white shadow-sm border border-transparent group-hover:border-gray-200 transition-all">
                              <Plus size={24} weight="bold" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              เพิ่มรูปโฆษณา
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white px-6 py-4 flex justify-end border-t border-gray-100">
                    <button
                      onClick={onClose}
                      className="rounded-lg bg-gray-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      เสร็จสิ้น
                    </button>
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
            <DialogBackdrop className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm transition-opacity" />
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
                <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-sm p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4 border border-red-100">
                      <Warning
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
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 leading-relaxed">
                        การดำเนินการนี้ไม่สามารถย้อนกลับได้ <br />
                        รูปภาพจะถูกลบออกจากระบบทันที
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 focus:outline-none transition-colors cursor-pointer"
                      onClick={handleConfirmDelete}
                    >
                      ยืนยันการลบ
                    </button>
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      ยกเลิก
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
