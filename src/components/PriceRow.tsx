interface Props {
  label?: string;
  type?: "buy" | "sell" | "plain" | "gold" | "silver" | "red" | "green";
  price: number | string;
  compact?: boolean;
}

const TYPE_COLORS = {
  buy: "bg-gradient-to-r from-[#fdfbfb] to-[#ebedee]",
  sell: "bg-gradient-to-r from-gold-light to-[#e6c27a]",
  gold: "bg-gradient-to-r from-gold-light to-[#e6c27a]",
  silver: "bg-gradient-to-r from-[#fdfbfb] to-[#ebedee]",
  plain: "bg-white",
  red: "bg-gradient-to-r from-red-400 to-red-600 text-white",
  green: "bg-gradient-to-r from-green-400 to-green-600 text-white",
};

export default function PriceRow({
  label,
  type = "buy",
  price,
  compact = false,
}: Props) {
  const isPlain = type === "plain";
  const hasLabel = !!label;

  const labelBg =
    TYPE_COLORS[type as keyof typeof TYPE_COLORS] || TYPE_COLORS.buy;
  const priceJustify = isPlain ? "justify-center" : "justify-end";
  const isDarkText = !["red", "green"].includes(type);

  return (
    <div
      className={`flex items-center w-full shrink-0 ${
        compact
          ? "mb-[0.6vh] h-[clamp(40px,8.5vh,100px)]"
          : "mb-[1vh] md:mb-[1vh] h-[clamp(40px,10vh,110px)] md:h-[10.5vh]"
      }`}
    >
      {hasLabel && (
        <div
          className={`w-[35%] flex-none h-full flex items-center justify-center font-semibold rounded-l-[45px] shadow-[-4px_4px_10px_rgba(0,0,0,0.2)] z-10 whitespace-nowrap tracking-wide ${isDarkText ? "text-text-dark" : "text-white"} ${labelBg} ${
            compact
              ? "text-[clamp(1rem,2.2vh,1.8rem)]"
              : "text-[clamp(0.9rem,2.2vh,1.8rem)] md:text-[clamp(1.3rem,3.5vh,2.4rem)]"
          }`}
        >
          {label}
        </div>
      )}
      <div
        className={`flex-1 h-full bg-white flex items-center ${priceJustify} pr-[5%] font-bold text-text-dark ${hasLabel ? "rounded-r-[45px]" : "rounded-[45px]"} shadow-[4px_4px_10px_rgba(0,0,0,0.2)] ${hasLabel ? "-ml-2.5" : ""} transition-colors duration-300 leading-none whitespace-nowrap font-roboto tabular-nums ${
          compact
            ? "text-[clamp(1.6rem,5.5vh,3rem)]"
            : "text-[clamp(1.5rem,5.5vh,3rem)] md:text-[clamp(2.5rem,6.5vh,4.5rem)]"
        }`}
      >
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
