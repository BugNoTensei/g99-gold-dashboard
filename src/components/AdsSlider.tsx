import { useState, useEffect } from "react";
import { Gear, CornersOut } from "@phosphor-icons/react";

interface Props {
  images: string[];
  interval?: number;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
}

export default function AdsSlider({
  images,
  interval = 10000,
  onOpenSettings,
  onToggleFullscreen,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="w-full h-[40%] md:w-1/2 md:h-full relative bg-black overflow-hidden group">
      {images.map((src, idx) => {
        const isActive = idx === currentIndex;

        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-1200 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform-opacity ${
              isActive
                ? "opacity-100 translate-x-0 skew-x-0 scale-100 z-10"
                : "opacity-0 translate-x-full -skew-x-12 scale-110 z-0"
            }`}
          >
            <img
              src={src}
              alt={`Ad ${idx}`}
              className={`w-full h-full object-cover transition-transform duration-10000 linear ${
                isActive ? "scale-110" : "scale-100"
              }`}
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20" />
          </div>
        );
      })}

      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex gap-2 md:gap-3 z-50 transition-opacity duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100">
        <button
          onClick={onToggleFullscreen}
          className="bg-black/40 hover:bg-black/80 text-white/80 hover:text-white border border-white/20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl cursor-pointer transition-all active:scale-95 backdrop-blur-md"
          title="เต็มจอ"
        >
          <CornersOut weight="bold" />
        </button>

        <button
          onClick={onOpenSettings}
          className="bg-black/40 hover:bg-black/80 text-white/80 hover:text-white border border-white/20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl cursor-pointer transition-all active:scale-95 backdrop-blur-md"
          title="ตั้งค่า"
        >
          <Gear weight="bold" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-50">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-500 ${
              idx === currentIndex
                ? "w-6 md:w-8 bg-gold-light"
                : "w-1.5 md:w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
