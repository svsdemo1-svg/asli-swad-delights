import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  invert?: boolean;
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center", invert = false }: Props) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";
  const accent = invert ? "text-brand-beige/80" : "text-brand-gold";
  const titleColor = invert ? "text-brand-cream" : "text-brand-brown";
  const subColor = invert ? "text-brand-beige/70" : "text-brand-brown/70";

  return (
    <div className={`mb-10 flex flex-col gap-3 ${alignClass}`}>
      {eyebrow && (
        <span className={`text-xs font-medium uppercase tracking-[0.25em] ${accent}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`text-balance font-serif text-3xl leading-tight ${titleColor} md:text-4xl`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`max-w-prose text-sm leading-relaxed ${subColor}`}>{subtitle}</p>
      )}
      <div className={`mt-1 h-px w-12 ${invert ? "bg-brand-gold-soft" : "bg-brand-gold"}`} />
    </div>
  );
}
