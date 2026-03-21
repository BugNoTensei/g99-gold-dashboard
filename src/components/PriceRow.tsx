import React from "react";

interface Props {
  label: string;
  type?: "buy" | "sell";
  price: number | string;
}

export default function PriceRow({ label, type = "buy", price }: Props) {
  const isBuy = type === "buy";
  const labelBg = isBuy
    ? "bg-gradient-to-r from-[#fdfbfb] to-[#ebedee]"
    : "bg-gradient-to-r from-gold-light to-[#e6c27a]";

  return (
    <div className="flex items-center mb-[1.5vh] h-[12vh] min-h-17.5 max-h-27.5 w-full shrink-0">
      <div
        className={`w-[35%] flex-none h-full flex items-center justify-center text-[clamp(1.3rem,3.5vh,2rem)] font-semibold rounded-l-[45px] shadow-[-4px_4px_10px_rgba(0,0,0,0.2)] z-10 whitespace-nowrap tracking-wide text-text-dark ${labelBg}`}
      >
        {label}
      </div>
      <div className="flex-1 h-full bg-white flex items-center justify-end pr-[5%] text-[clamp(2.5rem,6.5vh,4.5rem)] font-bold text-text-dark rounded-r-[45px] shadow-[4px_4px_10px_rgba(0,0,0,0.2)] -ml-2.5 transition-colors duration-300 leading-none whitespace-nowrap font-roboto tabular-nums">
        {price
          ? Number(price).toLocaleString("th-TH", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          : "--,--"}
      </div>
    </div>
  );
}
