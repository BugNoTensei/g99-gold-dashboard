interface Props {
  title: string;
  children: React.ReactNode;
}

export default function PriceCategory({ title, children }: Props) {
  return (
    <div>
      <h3 className="text-gold-light text-[clamp(1.8rem,3.5vh,4rem)] font-bold text-center mb-[0.5vh] drop-shadow-md">
        {title}
      </h3>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
