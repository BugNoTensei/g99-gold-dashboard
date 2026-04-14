import PriceCategory from "./PriceCategory";
import PriceRow from "./PriceRow";
import AdsSlider from "./AdsSlider";
import { APP_CONFIG } from "../config";

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
        className="flex-none bg-linear-to-br from-primary to-secondary border-b-8 border-gold-dark px-[5vw] pt-[2vh] pb-[1vh] flex flex-col items-center transition-opacity duration-300 relative z-20"
        style={{ opacity: panelOpacity }}
      >
        <div className="text-center mb-[1vh]">
          {APP_CONFIG.STORE_LOGO_URL ? (
            <img
              src={APP_CONFIG.STORE_LOGO_URL}
              alt="Store Logo"
              className="max-h-[clamp(30px,4vh,60px)] w-auto mx-auto mb-1"
            />
          ) : (
            <div className="text-gold-light text-[clamp(1.4rem,3vh,2.5rem)] font-bold leading-none">
              GOLDEN99
            </div>
          )}
          <div className="text-white text-[clamp(1rem,2.2vh,2rem)] font-medium leading-none">
            ราคาทองคำวันนี้
          </div>
          <div className="text-[#ffcccc] text-[clamp(0.6rem,1.2vh,1rem)] font-light mt-1">
            {displayTime}
          </div>
        </div>

        <div className="w-full max-w-[92%] flex flex-col gap-[1vh]">
          <PriceCategory title="ทองคำแท่ง">
            <div className="flex flex-col gap-[0.5vh]">
              <PriceRow label="รับซื้อ" type="buy" price={prices.barBuy ?? 0} />
              <PriceRow
                label="ขายออก"
                type="sell"
                price={prices.barSale ?? 0}
              />
            </div>
          </PriceCategory>

          <PriceCategory title="ทองรูปพรรณ">
            <PriceRow
              label="รับซื้อ"
              type="buy"
              price={prices.ornaReturn ?? 0}
            />
          </PriceCategory>
        </div>
      </div>
      <div className="flex-1 relative bg-black z-10 overflow-hidden">
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
