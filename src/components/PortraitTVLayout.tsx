import PriceCategory from "./PriceCategory";
import PriceRow from "./PriceRow";
import AdsSlider from "./AdsSlider";
import { APP_CONFIG } from "../config";
import {
  calculateMaxConsignmentPrice,
  calculateOrnamentsReturnPrice,
} from "../utils/price";

interface Prices {
  barBuy?: number;
  barSale?: number;
  ornaReturn?: number;
  priceAt?: string;
}

interface Props {
  prices: Prices;
  displayTime: string;
  panelOpacity: number;
  displayAds: string[];
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
}

export default function PortraitTVLayout({
  prices,
  displayTime,
  panelOpacity,
  displayAds,
  onOpenSettings,
  onToggleFullscreen,
}: Props) {
  return (
    <div className="flex flex-col w-full h-dvh bg-black overflow-hidden">
      <div
        className="h-[60dvh] flex-none bg-primary border-b-8 border-gold-dark px-[5vw] pt-[3vh] pb-[1vh] flex flex-col items-center justify-start transition-opacity duration-300 relative z-20 overflow-hidden"
        style={{ opacity: panelOpacity }}
      >
        <div className="text-center mb-[1.5vh] flex-none">
          {APP_CONFIG.STORE_LOGO_URL ? (
            <img
              src={APP_CONFIG.STORE_LOGO_URL}
              alt="Store Logo"
              className="h-[clamp(45px,8vh,130px)] w-auto mx-auto mb-[2.5vh] object-contain drop-shadow-lg scale-110"
            />
          ) : (
            <div className="text-gold-light text-[clamp(1.6rem,3.8vh,3rem)] font-bold leading-none mb-[2.5vh]">
              GOLDEN99
            </div>
          )}
          <div className="text-white text-[clamp(1.3rem,3.4vh,2.8rem)] font-medium leading-none mb-[0.8vh]">
            ราคาทองคำวันนี้
          </div>
          <div className="text-[#ffcccc] text-[clamp(0.9rem,2vh,1.5rem)] font-light">
            {displayTime}
          </div>
        </div>

        <div className="w-full max-w-[95%] flex flex-col justify-evenly flex-1 min-h-0 py-[1vh]">
          <PriceCategory title="ทองคำแท่ง" compact>
            <div className="flex flex-col gap-[0.6vh]">
              <PriceRow
                label="รับซื้อ"
                type="gold"
                price={prices.barBuy ?? 0}
                compact
              />
              <PriceRow
                label="ขายออก"
                type="gold"
                price={prices.barSale ?? 0}
                compact
              />
            </div>
          </PriceCategory>

          <PriceCategory title="ทองรูปพรรณ" compact>
            <PriceRow
              label="รับซื้อ"
              type="gold"
              price={calculateOrnamentsReturnPrice(prices.barBuy ?? 0)}
              compact
            />
          </PriceCategory>

          <PriceCategory title="ราคาขายฝากสูงสุดต่อบาท" compact>
            <PriceRow
              label="บาทละ"
              type="gold"
              price={calculateMaxConsignmentPrice(prices.barBuy ?? 0)}
              compact
            />
          </PriceCategory>
        </div>
      </div>
      <div className="h-[40dvh] flex-none relative bg-black z-10 overflow-hidden">
        <AdsSlider
          images={displayAds}
          interval={APP_CONFIG.SLIDER_INTERVAL_MS}
          onOpenSettings={onOpenSettings}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>
    </div>
  );
}
