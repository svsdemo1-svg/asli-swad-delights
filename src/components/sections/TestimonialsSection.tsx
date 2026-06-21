import { useEffect, useState } from "react";
import type { Testimonial } from "@/lib/types";
import { SectionHeading } from "@/components/SectionHeading";

interface Props {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: Props) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (testimonials.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;
  const current = testimonials[idx];

  return (
    <section className="bg-brand-cream px-6 py-16">
      <SectionHeading eyebrow="Kind Words" title="From Our Customers" />
      <div className="mx-auto max-w-2xl">
        <div className="relative rounded-[40px] border border-brand-gold/10 bg-brand-beige p-10">
          <div className="mb-3 font-serif text-5xl leading-none text-brand-gold">“</div>
          <p className="mb-6 font-serif text-lg italic leading-relaxed text-brand-brown md:text-xl">
            {current.body}
          </p>
          <div className="text-xs font-bold uppercase tracking-widest text-brand-brown/80">
            — {current.author_name}
            {current.author_title && (
              <span className="text-brand-brown/50">, {current.author_title}</span>
            )}
          </div>
        </div>
        {testimonials.length > 1 && (
          <div className="mt-5 flex justify-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-6 bg-brand-gold" : "w-1.5 bg-brand-brown/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
