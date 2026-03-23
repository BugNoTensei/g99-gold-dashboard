import { useState, useRef } from "react";
import PriceCategory from "./components/PriceCategory";
import PriceRow from "./components/PriceRow";
import AdsSlider from "./components/AdsSlider";
import AdminModal from "./components/AdminModal";
import { APP_CONFIG } from "./config";
import { useGoldPrice } from "./hooks/useGoldPrice";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";

export default function App() {
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [panelOpacity, setPanelOpacity] = useState(1);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const audioRef = useRef(
    new Audio(
      "https://actions.google.com/sounds/v1/alarms/dinner_bell_triangle.ogg",
    ),
  );

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePriceChange = () => {
    audioRef.current.play().catch(() => {});
    setPanelOpacity(0.7);
    setTimeout(() => setPanelOpacity(1), 300);
  };

  const { prices, fetchPrice, handleSavePrice } = useGoldPrice(
    isSystemReady,
    handlePriceChange,
  );

  const initSystem = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    audioRef.current
      .play()
      .then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      })
      .catch(() => {});

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

  const dateObj = prices.priceAt ? new Date(prices.priceAt) : new Date();
  const displayTime = `ข้อมูลล่าสุด ณ วันที่ ${dateObj.toLocaleDateString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit" })} ${dateObj.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} น.`;

  return (
    <div className="flex flex-col md:flex-row w-full h-dvh relative font-prompt overflow-hidden">
      {!isSystemReady && (
        <div
          onClick={initSystem}
          className="absolute inset-0 bg-black/90 text-white flex flex-col items-center justify-center z-9999 cursor-pointer"
        >
          <h2 className="text-gold-light text-xl md:text-3xl mb-4">
            คลิกที่หน้าจอ 1 ครั้งเพื่อเริ่มใช้งาน
          </h2>
          <p className="text-sm md:text-base text-center px-4">
            (ระบบจำเป็นต้องได้รับการอนุญาตเพื่อเล่นเสียงแจ้งเตือน)
          </p>
        </div>
      )}

      <div
        className="w-full h-[60%] md:w-1/2 md:h-full bg-linear-to-br from-primary to-secondary p-4 md:p-[4vh_3vw_0_3vw] flex flex-col justify-center md:justify-start border-b-4 md:border-b-0 md:border-r-8 border-gold-dark z-10 transition-opacity duration-300"
        style={{ opacity: panelOpacity }}
      >
        <div className="text-center mb-[2vh] flex-none">
          {APP_CONFIG.STORE_LOGO_URL ? (
            <img
              src={APP_CONFIG.STORE_LOGO_URL}
              alt="Store Logo"
              className="max-h-[8vh] md:max-h-[12vh] w-auto mx-auto mb-[1vh] drop-shadow-lg"
            />
          ) : (
            <div className="text-gold-light text-3xl md:text-[clamp(2.5rem,5vh,3.5rem)] font-bold drop-shadow-lg mb-[1vh]">
              GOLDEN99
            </div>
          )}

          <div className="text-white text-2xl md:text-[clamp(1.8rem,3.5vh,2.5rem)] font-medium mb-[1vh]">
            ราคาทองคำวันนี้
          </div>
          <div className="text-[#ffcccc] text-sm md:text-[clamp(1rem,2vh,1.2rem)] font-light">
            {displayTime}
          </div>
        </div>

        <PriceCategory title="ทองคำแท่ง">
          <PriceRow label="รับซื้อ" type="buy" price={prices.barBuy} />
          <PriceRow label="ขายออก" type="sell" price={prices.barSale} />
        </PriceCategory>

        <PriceCategory title="ทองรูปพรรณ">
          <PriceRow label="รับซื้อ" type="buy" price={prices.ornaReturn} />
        </PriceCategory>
      </div>

      <AdsSlider
        images={APP_CONFIG.ADS_IMAGES}
        interval={APP_CONFIG.SLIDER_INTERVAL_MS}
        onOpenSettings={() => setIsModalOpen(true)}
        onToggleFullscreen={handleToggleFullscreen}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPrices={prices}
        onSave={handleSavePrice}
        onShowToast={showToast}
      />

      <div
        className={`fixed top-4 right-4 md:top-8 md:right-8 z-10000 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-2xl text-white font-medium min-w-70 md:min-w-[320px] ${
          toast
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-[150%] opacity-0 scale-90"
        } ${toast?.type === "success" ? "bg-green-600" : "bg-red-600"}`}
      >
        {toast?.type === "success" ? (
          <CheckCircleIcon
            size={28}
            weight="fill"
            className="text-white drop-shadow-md"
          />
        ) : (
          <WarningCircleIcon
            size={28}
            weight="fill"
            className="text-white drop-shadow-md"
          />
        )}
        <span className="text-base md:text-lg drop-shadow-md">
          {toast?.message}
        </span>
      </div>
    </div>
  );
}
