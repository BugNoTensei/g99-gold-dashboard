import { useState } from "react";
import type { FormEvent } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { LockKeyIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { supabase } from "../config/supabase";
import { verifyBranchPin } from "../services/api";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  onSuccess: (role: "branch" | "admin") => void;
}

export default function PinModal({
  isOpen,
  onClose,
  branchId,
  onSuccess,
}: PinModalProps) {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setPin("");
    setError("");
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pin) return;

    if (!supabase) {
      setError("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data: roleData, error: rpcError } = await supabase.rpc(
        "verify_login_pin",
        {
          p_pin: pin,
        },
      );

      if (!rpcError && roleData === "admin") {
        onSuccess("admin");
        return;
      }

      if (!branchId) {
        setError("ไม่พบข้อมูลสาขา กรุณาตั้งค่าหน้าจอใหม่");
        return;
      }

      const isValidBranch = await verifyBranchPin(branchId, pin);

      if (isValidBranch) {
        onSuccess("branch");
      } else {
        setError("รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง");
        setPin("");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !isLoading && onClose()}
      className="relative z-2000"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
      />

      <div className="fixed inset-0 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 pt-8 text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-100 mb-4">
                <LockKeyIcon size={28} weight="fill" className="text-red-600" />
              </div>
              <DialogTitle
                as="h3"
                className="text-xl font-bold leading-6 text-gray-900"
              >
                กรุณายืนยันตัวตน
              </DialogTitle>
              <p className="mt-2 text-sm text-gray-500">
                ระบุรหัสผ่านเพื่อเข้าสู่หน้าตั้งค่าราคาและโฆษณา
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <input
                type="text"
                name="username"
                autoComplete="username"
                defaultValue="g99_user"
                style={{ display: "none" }}
                aria-hidden="true"
              />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                disabled={isLoading}
                autoComplete="new-password"
                className="block w-full rounded-xl border-0 py-4 text-center text-3xl tracking-[0.5em] text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 focus:bg-white transition-colors"
                placeholder="••••••"
                autoFocus
              />

              {error && (
                <p className="text-center text-sm font-semibold text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-200 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading || pin.length < 4}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 bg-gray-950 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <CircleNotchIcon size={18} className="animate-spin" />
                  ) : (
                    "ยืนยัน"
                  )}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
