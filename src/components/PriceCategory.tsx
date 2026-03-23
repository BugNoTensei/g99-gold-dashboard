interface Props {
  title: string;
  children: React.ReactNode;
}

export default function PriceCategory({ title, children }: Props) {
  return (
    <div className="mb-[1vh]">
      <h3 className="text-gold-light text-[clamp(1.2rem,3vh,2.5rem)] font-bold text-center mb-[1vh] drop-shadow-md landscape:text-[clamp(1.2rem,3vh,2.5rem)] md:text-[clamp(1.6rem,4vh,3.5rem)] md:mb-[1.5vh]">
        {title}
      </h3>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
