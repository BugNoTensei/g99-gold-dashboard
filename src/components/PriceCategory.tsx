interface Props {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}

export default function PriceCategory({
  title,
  children,
  compact = false,
}: Props) {
  return (
    <div className={compact ? "mb-[0.2vh]" : ""}>
      <h3
        className={`text-gold-light font-bold text-center drop-shadow-md ${
          compact
            ? "text-[clamp(1.4rem,2.8vh,2.5rem)] mb-[0.2vh]"
            : "text-[clamp(1.8rem,3.5vh,4rem)] mb-[0.5vh]"
        }`}
      >
        {title}
      </h3>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
