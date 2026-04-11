import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { LockKeyIcon } from "@phosphor-icons/react";
import { supabase } from "../config/supabase";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: "branch" | "admin") => void;
}

export default function PinModal({
  isOpen,
  onClose,
  onSuccess,
}: PinModalProps) {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError("");
    }
  }, [isOpen]);

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
      const { data, error: rpcError } = await supabase.rpc("verify_login_pin", {
        p_pin: pin,
      });

      if (rpcError) throw rpcError;

      if (data === "branch" || data === "admin") {
        onSuccess(data);
      } else {
        setError("รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง");
        setPin("");
      }
    } catch (err) {
      console.error(err);
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
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <LockKeyIcon size={24} weight="bold" className="text-red-600" />
              </div>
              <DialogTitle
                as="h3"
                className="text-xl font-bold leading-6 text-gray-900"
              >
                กรุณายืนยันตัวตน
              </DialogTitle>
              <p className="mt-2 text-sm text-gray-500">
                ระบุรหัสผ่านเพื่อเข้าสู่หน้าตั้งค่าราคา
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                className="block w-full rounded-xl border-0 py-4 text-center text-3xl tracking-[0.5em] text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••"
                autoFocus
              />
              {error && (
                <p className="text-center text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !pin}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ${
                    isLoading || !pin
                      ? "bg-red-400 cursor-not-allowed opacity-70"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isLoading ? "ตรวจสอบ..." : "ยืนยัน"}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
