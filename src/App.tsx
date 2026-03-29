import { useState, useRef, useEffect } from "react";
import PriceCategory from "./components/PriceCategory";
import PriceRow from "./components/PriceRow";
import AdsSlider from "./components/AdsSlider";
import AdminModal from "./components/AdminModal";
import { APP_CONFIG } from "./config";
import { useGoldPrice } from "./hooks/useGoldPrice";
import {
  CheckCircleIcon,
  WarningCircleIcon,
  DeviceMobileIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react";

export default function App() {
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [panelOpacity, setPanelOpacity] = useState(1);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(
        "https://actions.google.com/sounds/v1/alarms/dinner_bell_triangle.ogg",
      );
    }
  }, []);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePriceChange = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    setPanelOpacity(0.7);
    setTimeout(() => setPanelOpacity(1), 300);
  };

  const {
    prices,
    fetchPrice,
    isAutoFetch,
    setIsAutoFetch,
    isUsingLocal,
    saveBranchPrice,
    saveAdminPrice,
    clearLocalPrice,
  } = useGoldPrice(isSystemReady, handlePriceChange);

  const initSystem = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    if (audioRef.current) {
      audioRef.current.muted = true;
      audioRef.current
        .play()
        .then(() => {
          audioRef.current?.pause();
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.muted = false;
          }
        })
        .catch(() => {});
    }

    setIsSystemReady(true);
    fetchPrice();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const dateObj = prices.priceAt ? new Date(prices.priceAt) : null;
  const displayTime = dateObj
    ? `ข้อมูลล่าสุด ณ วันที่ ${dateObj.toLocaleDateString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit" })} เวลา ${dateObj.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} น.`
    : "กำลังอัปเดตข้อมูล...";
  return (
    <div className="flex flex-row w-full h-dvh relative font-prompt overflow-hidden bg-black overscroll-none pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]">
      <div className="portrait:flex landscape:hidden fixed inset-0 z-99999 bg-black text-white flex-col items-center justify-center p-8 text-center overscroll-none">
        <div className="flex items-center justify-center gap-4 mb-6 text-gold-light">
          <DeviceMobileIcon size={64} className="animate-pulse" />
          <ArrowsClockwiseIcon size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gold-light mb-4">
          โปรดหมุนหน้าจอเป็นแนวนอน
        </h2>
        <p className="text-lg text-gray-300">
          ระบบถูกออกแบบมาเพื่อแสดงผลแนวนอนเท่านั้น
        </p>
      </div>

      {!isSystemReady && (
        <div
          onClick={initSystem}
          className="absolute inset-0 bg-black/90 text-white flex flex-col items-center justify-center z-9999 cursor-pointer overscroll-none"
        >
          <h2 className="text-gold-light text-[clamp(1.5rem,4vh,3rem)] mb-4 text-center px-4">
            คลิกหน้าจอ 1 ครั้งเพื่อเริ่มใช้งาน
          </h2>
          <p className="text-[clamp(1rem,2vh,1.5rem)] text-center px-4 text-gray-300">
            (ระบบต้องการรับการอนุญาตเพื่อเล่นเสียงแจ้งเตือน)
          </p>
        </div>
      )}

      <div
        className="w-1/2 h-full bg-linear-to-br from-primary to-secondary p-[2vh_2vw] flex flex-col justify-center gap-[2vh] border-r-8 border-gold-dark z-10 transition-opacity duration-300 md:p-[clamp(1rem,4vh,6rem)] md:justify-evenly"
        style={{ opacity: panelOpacity }}
      >
        <div className="text-center flex-none">
          {APP_CONFIG.STORE_LOGO_URL ? (
            <img
              src={APP_CONFIG.STORE_LOGO_URL}
              alt="Store Logo"
              className="max-h-[clamp(40px,10vh,120px)] w-auto mx-auto mb-[0.5vh] drop-shadow-lg md:max-h-[clamp(60px,15vh,180px)]"
            />
          ) : (
            <div className="text-gold-light text-[clamp(1.5rem,4vh,4rem)] font-bold drop-shadow-lg mb-[0.5vh] md:text-[clamp(2.5rem,7vh,6rem)]">
              GOLDEN99
            </div>
          )}

          <div className="text-white text-[clamp(1.2rem,3.5vh,3rem)] font-medium mb-[0.5vh] leading-none tracking-tight md:text-[clamp(1.8rem,5vh,4rem)]">
            ราคาทองคำวันนี้
          </div>
          <div className="text-[#ffcccc] text-[clamp(0.6rem,1.5vh,1.2rem)] font-light mt-[0.5vh] md:text-[clamp(0.9rem,2.2vh,1.8rem)] md:mt-[1vh]">
            {displayTime}
          </div>
        </div>

        <div className="flex-none w-full px-[5vw] flex flex-col gap-[2vh] md:gap-[3vh] landscape:px-[1vw] landscape:gap-[1vh]">
          <PriceCategory title="ทองคำแท่ง">
            <PriceRow label="รับซื้อ" type="buy" price={prices.barBuy} />
            <PriceRow label="ขายออก" type="sell" price={prices.barSale} />
          </PriceCategory>

          <div className="mt-0 md:mt-[4vh] landscape:mt-[1vh]">
            <PriceCategory title="ทองรูปพรรณ">
              <PriceRow label="รับซื้อ" type="buy" price={prices.ornaReturn} />
            </PriceCategory>
          </div>
        </div>
      </div>

      <div className="w-1/2 h-full relative bg-black">
        <AdsSlider
          images={APP_CONFIG.ADS_IMAGES}
          interval={APP_CONFIG.SLIDER_INTERVAL_MS}
          onOpenSettings={() => setIsModalOpen(true)}
          onToggleFullscreen={handleToggleFullscreen}
        />
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPrices={prices}
        onShowToast={showToast}
        isAutoFetch={isAutoFetch}
        onToggleAutoFetch={setIsAutoFetch}
        saveBranchPrice={saveBranchPrice}
        saveAdminPrice={saveAdminPrice}
        clearLocalPrice={clearLocalPrice}
        isUsingLocal={isUsingLocal}
      />
      <div
        className={`fixed top-8 right-8 z-10000 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl text-white font-medium min-w-[320px] ${
          toast
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-[150%] opacity-0 scale-90"
        } ${toast?.type === "success" ? "bg-green-600" : "bg-red-600"}`}
      >
        {toast?.type === "success" ? (
          <CheckCircleIcon
            size={32}
            weight="fill"
            className="text-white drop-shadow-md"
          />
        ) : (
          <WarningCircleIcon
            size={32}
            weight="fill"
            className="text-white drop-shadow-md"
          />
        )}
        <span className="text-xl drop-shadow-md md:text-xl">
          {toast?.message}
        </span>
      </div>
    </div>
  );
}
