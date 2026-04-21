import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  X,
  Plus,
  Storefront,
  CircleNotch,
  Buildings,
  LockKey,
  Trash,
  Warning,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { supabase } from "../config/supabase";
import {
  addNewBranchByAdmin,
  resetBranchPin,
  deleteBranch,
} from "../services/api";

export interface BranchInfo {
  id: string;
  branch_name: string;
  is_configured: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: "success" | "error") => void;
}

type PendingAction =
  | { type: "add"; name: string }
  | { type: "reset"; id: string; name: string }
  | { type: "delete"; id: string; name: string }
  | null;

export function BranchManagerModal({ isOpen, onClose, onShowToast }: Props) {
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const [confirmPin, setConfirmPin] = useState("");
  const [modalNewPin, setModalNewPin] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBranches = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("id, branch_name, is_configured")
        .order("branch_name", { ascending: true });

      if (error) throw error;
      if (data) setBranches(data);
    } catch {
      onShowToast("ไม่สามารถดึงข้อมูลสาขาได้", "error");
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setNewBranchName("");
    setSearchQuery("");
    setConfirmPin("");
    setModalNewPin("");
    setPendingAction(null);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  useEffect(() => {
    if (isOpen) {
      const loadInitialBranches = async () => {
        await fetchBranches();
      };
      loadInitialBranches();
    }
  }, [isOpen, fetchBranches]);

  const handleActionClick = (
    type: "add" | "reset" | "delete",
    data?: { id: string; name: string },
  ) => {
    if (type === "add" && !newBranchName.trim()) return;

    setConfirmPin("");
    setModalNewPin("");

    if (type === "add") {
      setPendingAction({ type: "add", name: newBranchName });
    } else if (data) {
      if (type === "reset")
        setPendingAction({ type: "reset", id: data.id, name: data.name });
      if (type === "delete")
        setPendingAction({ type: "delete", id: data.id, name: data.name });
    }
  };

  const executeAction = async () => {
    if (!pendingAction || confirmPin.length < 4) return;
    if (pendingAction.type === "reset" && modalNewPin.length < 4) {
      onShowToast("กรุณากรอกรหัส PIN ใหม่ให้ครบ 4-6 หลัก", "error");
      return;
    }

    setIsProcessing(true);
    try {
      if (pendingAction.type === "add") {
        await addNewBranchByAdmin(pendingAction.name, confirmPin);
        onShowToast("เพิ่มสาขาใหม่สำเร็จ", "success");
        setNewBranchName("");
      } else if (pendingAction.type === "reset") {
        await resetBranchPin(pendingAction.id, confirmPin, modalNewPin);
        onShowToast("เปลี่ยนรหัสผ่านสาขาเรียบร้อยแล้ว", "success");
      } else if (pendingAction.type === "delete") {
        await deleteBranch(pendingAction.id, confirmPin);
        onShowToast(`ลบสาขา ${pendingAction.name} สำเร็จ`, "success");
      }

      setPendingAction(null);
      await fetchBranches();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดำเนินการ";
      onShowToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredBranches = branches.filter((b) =>
    b.branch_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isExecuteDisabled =
    isProcessing ||
    confirmPin.length < 4 ||
    (pendingAction?.type === "reset" && modalNewPin.length < 4);

  return (
    <>
      <Transition show={isOpen}>
        <Dialog as="div" className="relative z-3000" onClose={onClose}>
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
                <DialogPanel className="relative w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8">
                  <div className="border-b border-gray-100 px-8 py-6 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                      <div className="flex-none rounded-2xl bg-amber-50 p-3 border border-amber-100 shadow-sm">
                        <Storefront
                          size={28}
                          weight="fill"
                          className="text-amber-600"
                        />
                      </div>
                      <div>
                        <DialogTitle
                          as="h2"
                          className="text-2xl font-bold text-gray-950 tracking-tight"
                        >
                          จัดการข้อมูลสาขา
                        </DialogTitle>
                        <p className="text-sm font-medium text-gray-500 mt-1">
                          เลือกรายการที่ต้องการดำเนินการด้านล่าง
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer outline-none"
                    >
                      <X size={24} weight="bold" />
                    </button>
                  </div>

                  <div className="px-8 py-8 bg-gray-50/50 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 self-start">
                        <div className="flex items-center gap-2 mb-4">
                          <Buildings
                            size={20}
                            weight="fill"
                            className="text-gray-700"
                          />
                          <h3 className="text-base font-bold text-gray-900">
                            เพิ่มสาขาใหม่
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                              ชื่อสาขา
                            </label>
                            <input
                              type="text"
                              placeholder="ระบุชื่อสาขา..."
                              value={newBranchName}
                              onChange={(e) => setNewBranchName(e.target.value)}
                              className="block w-full rounded-xl border-0 py-3 px-4 ring-1 ring-inset ring-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 font-medium outline-none bg-gray-50 focus:bg-white"
                            />
                          </div>
                          <button
                            onClick={() => handleActionClick("add")}
                            disabled={!newBranchName.trim()}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                          >
                            <Plus size={18} weight="bold" />
                            สร้างสาขา
                          </button>
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-base font-bold text-gray-900">
                              รายชื่อสาขา
                            </h3>
                            <div className="flex items-center gap-2 relative">
                              <MagnifyingGlass
                                size={16}
                                className="text-gray-400 absolute left-3"
                              />
                              <input
                                type="text"
                                placeholder="ค้นหาสาขา..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-48 rounded-lg border-0 py-1.5 pl-9 pr-3 ring-1 ring-inset ring-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                              />
                            </div>
                          </div>

                          {isLoading ? (
                            <div className="p-12 flex justify-center items-center">
                              <CircleNotch
                                size={32}
                                className="animate-spin text-amber-500"
                              />
                            </div>
                          ) : filteredBranches.length > 0 ? (
                            <ul className="divide-y divide-gray-100 max-h-87.5 overflow-y-auto">
                              {filteredBranches.map((branch) => (
                                <li
                                  key={branch.id}
                                  className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                                        branch.is_configured
                                          ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                          : "bg-gray-100 border-gray-200 text-gray-400"
                                      }`}
                                    >
                                      <Storefront
                                        size={16}
                                        weight={
                                          branch.is_configured
                                            ? "fill"
                                            : "regular"
                                        }
                                      />
                                    </div>
                                    <div>
                                      <span className="font-bold text-gray-900 block leading-tight">
                                        {branch.branch_name}
                                      </span>
                                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                        {branch.is_configured
                                          ? "ตั้งค่ารหัสแล้ว"
                                          : "รอรับรหัสผ่าน"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {branch.is_configured && (
                                      <button
                                        onClick={() =>
                                          handleActionClick("reset", {
                                            id: branch.id,
                                            name: branch.branch_name,
                                          })
                                        }
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                                      >
                                        เปลี่ยน PIN
                                      </button>
                                    )}
                                    <button
                                      onClick={() =>
                                        handleActionClick("delete", {
                                          id: branch.id,
                                          name: branch.branch_name,
                                        })
                                      }
                                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                                    >
                                      <Trash size={18} weight="bold" />
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="p-8 text-center text-sm font-medium text-gray-500">
                              ไม่พบข้อมูลสาขา
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-8 py-4 flex justify-end border-t border-gray-100 rounded-b-3xl">
                    <button
                      onClick={onClose}
                      className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      ปิดหน้าต่าง
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition show={pendingAction !== null}>
        <Dialog
          as="div"
          className="relative z-4000"
          onClose={() => !isProcessing && setPendingAction(null)}
        >
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogBackdrop className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
                  <div className="text-center">
                    <div
                      className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl mb-5 ${
                        pendingAction?.type === "delete"
                          ? "bg-red-50 border border-red-100 text-red-600"
                          : "bg-amber-50 border border-amber-100 text-amber-600"
                      }`}
                    >
                      {pendingAction?.type === "delete" ? (
                        <Warning size={32} weight="fill" />
                      ) : (
                        <LockKey size={32} weight="fill" />
                      )}
                    </div>
                    <DialogTitle
                      as="h3"
                      className="text-xl font-bold text-gray-900"
                    >
                      ยืนยันการดำเนินการ
                    </DialogTitle>
                    <p className="mt-2 text-sm text-gray-500">
                      {pendingAction?.type === "add" &&
                        `ต้องการเพิ่มสาขาใหม่ "${pendingAction.name}"`}
                      {pendingAction?.type === "reset" &&
                        `ตั้งรหัสผ่านใหม่ให้สาขา "${pendingAction.name}"`}
                      {pendingAction?.type === "delete" &&
                        `ยืนยันการลบสาขา "${pendingAction.name}" ข้อมูลจะถูกลบทิ้งถาวร`}
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    {pendingAction?.type === "reset" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 text-center">
                          รหัส PIN ใหม่ (สำหรับสาขานี้)
                        </label>
                        <input
                          type="password"
                          placeholder="••••••"
                          maxLength={6}
                          autoFocus
                          value={modalNewPin}
                          onChange={(e) =>
                            setModalNewPin(e.target.value.replace(/\D/g, ""))
                          }
                          className="block w-full rounded-xl border-0 py-3 text-center text-2xl tracking-[0.5em] ring-1 ring-inset ring-gray-300 text-gray-900 focus:ring-2 focus:ring-amber-500 font-bold outline-none bg-gray-50"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 text-center">
                        กรอกรหัส Admin เพื่อยืนยัน
                      </label>
                      <input
                        type="password"
                        placeholder="••••••"
                        maxLength={6}
                        autoFocus={pendingAction?.type !== "reset"}
                        value={confirmPin}
                        onChange={(e) =>
                          setConfirmPin(e.target.value.replace(/\D/g, ""))
                        }
                        className="block w-full rounded-xl border-0 py-3 text-center text-2xl tracking-[0.5em] ring-1 ring-inset ring-gray-300 text-gray-900 focus:ring-2 focus:ring-red-600 font-bold outline-none bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setPendingAction(null)}
                      className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      disabled={isExecuteDisabled}
                      onClick={executeAction}
                      className={`flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${
                        pendingAction?.type === "delete"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      {isProcessing ? (
                        <CircleNotch size={18} className="animate-spin" />
                      ) : (
                        "ยืนยัน"
                      )}
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
