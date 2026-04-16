interface UNASPLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  dark?: boolean;
}

export function UNASPLogo({ size = "md", showText = true, dark = false }: UNASPLogoProps) {
  const sizes = {
    sm: { circle: "h-12 w-12", image: "h-[3rem] w-[3rem]", text: "text-xs", sub: "text-[10px]" },
    md: { circle: "h-14 w-14", image: "h-[3.5rem] w-[3.5rem]", text: "text-sm", sub: "text-[11px]" },
    lg: { circle: "h-20 w-20", image: "h-[4.75rem] w-[4.75rem]", text: "text-base", sub: "text-xs" },
  };

  const s = sizes[size];
  const textColor = dark ? "text-white" : "text-blue-900";
  const subColor = dark ? "text-blue-200" : "text-blue-600";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${s.circle} flex items-center justify-center rounded-full bg-orange-500 ring-2 ring-orange-200 flex-shrink-0`}
      >
        <img src="/logounasp.png" alt="UNASP Logo" className={`${s.image} object-contain`} />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`${s.text} font-black tracking-wide uppercase ${textColor}`}>
            UNASP
          </span>
          <span className={`${s.sub} font-medium ${subColor}`}>
            Correio Interno
          </span>
        </div>
      )}
    </div>
  );
}
