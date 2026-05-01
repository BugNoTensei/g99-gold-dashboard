import { useState, useEffect, useCallback } from "react";
import {
  StorefrontIcon,
  LockKeyIcon,
  CheckCircleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { getBranches, setupBranchInitial, type Branch } from "../services/api";
import { APP_CONFIG } from "../config";

interface Props {
  onSetupComplete: (config: { id: string; name: string }) => void;
}

export default function SetupScreen({ onSetupComplete }: Props) {
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [selectedSetupId, setSelectedSetupId] = useState("");
  const [setupPin, setSetupPin] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  const loadBranches = useCallback(async () => {
    try {
      const branches = await getBranches();
      setAvailableBranches(branches);
    } catch {
      showToast("ไม่สามารถดึงข้อมูลรายชื่อสาขาได้", "error");
    }
  }, [showToast]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await loadBranches();
    };
    fetchInitialData();
  }, [loadBranches]);

  const handleCompleteSetup = async () => {
    if (!selectedSetupId || setupPin.length < 4) {
      showToast("กรุณาเลือกสาขาและระบุรหัสผ่าน 4-6 หลัก", "error");
      return;
    }

    setIsSettingUp(true);
    try {
      await setupBranchInitial(selectedSetupId, setupPin);
      const branch = availableBranches.find((b) => b.id === selectedSetupId);
      if (branch) {
        const config = { id: branch.id, name: branch.branch_name };
        localStorage.setItem("g99_branch_config", JSON.stringify(config));
        showToast("ตั้งค่าสาขาเสร็จสมบูรณ์", "success");
        setTimeout(() => onSetupComplete(config), 1500);
      }
    } catch {
      showToast("รหัสผ่านไม่ถูกต้อง หรือเกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
      setIsSettingUp(false);
    }
  };

  return (
    <main className="flex w-full h-dvh bg-linear-to-br from-primary to-secondary items-center justify-center font-prompt relative overflow-hidden">
      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all px-8 py-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-2xl bg-gray-950 p-4 shadow-inner">
            <img
              src={APP_CONFIG.STORE_LOGO_URL}
              alt="Store Logo"
              className="h-14 w-auto drop-shadow-lg"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            ตั้งค่าเริ่มต้นการแสดงผล
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            ระบุสาขาของคุณเพื่อแสดงราคาทองที่ถูกต้องบนหน้าจอ
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              <StorefrontIcon
                size={18}
                weight="bold"
                className="text-red-600"
              />
              เลือกสาขาของคุณ
            </label>
            <select
              className="block w-full rounded-xl border-0 py-3.5 px-4 ring-1 ring-inset ring-gray-300 text-gray-900 font-medium focus:ring-2 focus:ring-red-600 bg-gray-50 outline-none cursor-pointer"
              value={selectedSetupId}
              onChange={(e) => setSelectedSetupId(e.target.value)}
            >
              <option value="" disabled>
                -- กรุณาเลือกสาขา --
              </option>
              {availableBranches
                .filter((b) => !b.is_configured)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branch_name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              <LockKeyIcon size={18} weight="bold" className="text-red-600" />
              รหัสผ่านสาขา (PIN)
            </label>
            <input
              type="password"
              maxLength={6}
              placeholder="ระบุตัวเลข 4-6 หลัก"
              className={`block w-full rounded-xl border-0 py-3.5 px-4 ring-1 ring-inset ring-gray-300 text-gray-900 text-center text-xl font-bold outline-none ${setupPin.length > 0 ? "tracking-[0.5em]" : "tracking-normal"}`}
              value={setupPin}
              onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <button
            onClick={handleCompleteSetup}
            disabled={isSettingUp || !selectedSetupId || setupPin.length < 4}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex justify-center items-center"
          >
            {isSettingUp ? "กำลังบันทึก..." : "ยืนยันการตั้งค่า"}
          </button>
        </div>
      </div>

      <div
        className={`fixed top-8 right-8 z-50 transition-all duration-500 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl text-white font-medium ${toast ? "translate-x-0 opacity-100" : "translate-x-[150%] opacity-0"} ${toast?.type === "success" ? "bg-green-600" : "bg-red-600"}`}
      >
        {toast?.type === "success" ? (
          <CheckCircleIcon size={32} weight="fill" />
        ) : (
          <WarningCircleIcon size={32} weight="fill" />
        )}
        <span className="text-xl">{toast?.message}</span>
      </div>
    </main>
  );
}
