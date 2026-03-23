interface Props {
  title: string;
  children: React.ReactNode;
}

export default function PriceCategory({ title, children }: Props) {
  return (
    <div className="mb-[1vh]">
      <h3 className="text-gold-light text-[2.8vh] font-bold text-center mb-[1.5vh] drop-shadow-md">
        {title}
      </h3>
      <div className="flex flex-col gap-[1.5vh]">{children}</div>
    </div>
  );
}
