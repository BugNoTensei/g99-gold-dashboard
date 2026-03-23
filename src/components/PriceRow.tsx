interface Props {
  label: string;
  type: "buy" | "sell";
  price: number;
}

export default function PriceRow({ label, type, price }: Props) {
  const leftBg = type === "buy" ? "bg-[#f2f2f2]" : "bg-[#eec15b]";

  return (
    <div className="flex w-full items-stretch rounded-full overflow-hidden shadow-lg bg-white h-[8vh] min-h-10">
      <div
        className={`${leftBg} w-1/3 flex items-center justify-center border-r border-gray-200`}
      >
        <span className="text-gray-800 font-bold text-[2.2vh] md:text-[2.5vh]">
          {label}
        </span>
      </div>
      <div className="w-2/3 flex items-center justify-end pr-[4vw]">
        <span className="text-gray-900 font-extrabold text-[4vh] md:text-[4.5vh] tracking-tight">
          {price > 0 ? price.toLocaleString() : "-"}
        </span>
      </div>
    </div>
  );
}
