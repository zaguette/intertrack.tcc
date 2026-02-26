interface UNASPLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  dark?: boolean;
}

export function UNASPLogo({ size = "md", showText = true, dark = false }: UNASPLogoProps) {
  const sizes = {
    sm: { circle: "h-8 w-8", text: "text-xs", sub: "text-[10px]" },
    md: { circle: "h-10 w-10", text: "text-sm", sub: "text-[11px]" },
    lg: { circle: "h-14 w-14", text: "text-base", sub: "text-xs" },
  };

  const s = sizes[size];
  const textColor = dark ? "text-white" : "text-blue-900";
  const subColor = dark ? "text-blue-200" : "text-blue-600";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${s.circle} flex items-center justify-center rounded-full bg-blue-900 ring-2 ring-blue-700 flex-shrink-0`}
      >
        <span className="font-black text-white" style={{ fontSize: size === "lg" ? "1.5rem" : size === "md" ? "1.1rem" : "0.85rem" }}>
          A
        </span>
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
