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
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
}

export default function PortraitTVLayout({
  prices,
  displayTime,
  panelOpacity,
  onOpenSettings,
  onToggleFullscreen,
}: Props) {
  return (
    <div className="flex flex-col w-full h-dvh bg-black overflow-hidden">
      <div
        className="flex-none bg-linear-to-br from-primary to-secondary border-b-8 border-gold-dark px-[4vw] py-[3vh] flex flex-col gap-[2vh] transition-opacity duration-300"
        style={{ opacity: panelOpacity }}
      >
        <div className="text-center">
          {APP_CONFIG.STORE_LOGO_URL ? (
            <img
              src={APP_CONFIG.STORE_LOGO_URL}
              alt="Store Logo"
              className="max-h-[clamp(50px,8vh,140px)] w-auto mx-auto mb-[1vh] drop-shadow-lg"
            />
          ) : (
            <div className="text-gold-light text-[clamp(2rem,5vh,5rem)] font-bold drop-shadow-lg mb-[1vh]">
              GOLDEN99
            </div>
          )}
          <div className="text-white text-[clamp(1.4rem,3.5vh,3.5rem)] font-medium leading-tight tracking-tight">
            ราคาทองคำวันนี้
          </div>
          <div className="text-[#ffcccc] text-[clamp(0.75rem,1.8vh,1.6rem)] font-light mt-[0.5vh]">
            {displayTime}
          </div>
        </div>

        <div className="flex flex-col gap-[1.5vh]">
          <PriceCategory title="ทองคำแท่ง">
            <PriceRow label="รับซื้อ" type="buy" price={prices.barBuy ?? 0} />
            <PriceRow label="ขายออก" type="sell" price={prices.barSale ?? 0} />
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

      <div className="flex-1 relative bg-black min-h-0">
        <AdsSlider
          images={APP_CONFIG.ADS_IMAGES}
          interval={APP_CONFIG.SLIDER_INTERVAL_MS}
          onOpenSettings={onOpenSettings}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>
    </div>
  );
}
