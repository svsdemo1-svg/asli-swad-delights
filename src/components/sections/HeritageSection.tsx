import { Sparkles, Wheat } from "lucide-react";

export function HeritageSection() {
  return (
    <section className="bg-brand-brown px-6 py-20 text-brand-beige">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <span className="mb-2 inline-block text-xs font-medium uppercase tracking-[0.25em] text-brand-gold-soft">
            Our Heritage
          </span>
          <h2 className="mb-4 font-serif text-3xl md:text-4xl">दादी-नानी का स्वाद</h2>
          <p className="text-sm leading-relaxed text-brand-beige/70">
            We recreate recipes passed down through generations — slow-fire kitchens, pure A2 ghee,
            cold-pressed oils and a refusal to take shortcuts.
          </p>
        </div>
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-full border border-brand-gold/40">
              <Sparkles className="size-4 text-brand-gold-soft" />
            </div>
            <div>
              <h4 className="mb-1 font-bold text-brand-cream">Purest Ingredients</h4>
              <p className="text-sm italic text-brand-beige/60">
                Only A2 ghee, jaggery and cold-pressed oils enter our kitchen.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-full border border-brand-gold/40">
              <Wheat className="size-4 text-brand-gold-soft" />
            </div>
            <div>
              <h4 className="mb-1 font-bold text-brand-cream">Small Batches</h4>
              <p className="text-sm italic text-brand-beige/60">
                Made fresh in small batches to preserve the true taste of every recipe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
