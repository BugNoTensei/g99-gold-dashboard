import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function PriceCategory({ title, children }: Props) {
  return (
    <div className="mb-[2vh] flex-1 flex flex-col justify-center">
      <div className="text-gold-light text-[clamp(1.8rem,3.5vh,2.2rem)] font-semibold text-center mb-[2vh] drop-shadow-md">
        {title}
      </div>
      {children}
    </div>
  );
}
