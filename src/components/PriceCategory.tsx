interface Props {
  title: string;
  children: React.ReactNode;
}

export default function PriceCategory({ title, children }: Props) {
  return (
    <div className="mb-[1vh]">
      <h3 className="text-gold-light text-[clamp(2rem,4vh,4.8rem)] font-bold text-center mb-[1vh] drop-shadow-md">
        {title}
      </h3>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
