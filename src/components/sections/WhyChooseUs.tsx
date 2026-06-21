import { SectionHeading } from "@/components/SectionHeading";
import { Leaf, Sparkles, BookHeart, HeartPulse, Recycle, HandHeart } from "lucide-react";

const items = [
  { icon: Leaf, title: "100% Natural", body: "No artificial flavours or preservatives." },
  { icon: Sparkles, title: "Premium Ingredients", body: "Carefully sourced quality ingredients." },
  { icon: BookHeart, title: "Traditional Recipes", body: "Authentic Dadi-Nani recipes." },
  { icon: HeartPulse, title: "Healthy Nutrition", body: "Balanced nourishment for modern lifestyles." },
  { icon: Recycle, title: "Eco-Friendly Packaging", body: "Sustainable and responsible." },
  { icon: HandHeart, title: "Handmade with Care", body: "Small-batch preparation, made fresh." },
];

export function WhyChooseUs() {
  return (
    <section className="bg-brand-cream px-6 py-16">
      <SectionHeading
        eyebrow="Why Healthy Delights"
        title="Rooted in Wellness"
        subtitle="Eight years of slow-fire kitchens, traditional recipes and zero shortcuts."
      />
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
        {items.map(({ icon: Icon, title, body }, i) => (
          <div
            key={title}
            className="flex flex-col items-center text-center animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="mb-4 grid size-12 place-items-center rounded-full bg-brand-gold/10 text-brand-gold">
              <Icon className="size-5" />
            </div>
            <h4 className="mb-1 font-serif text-base font-bold text-brand-brown">{title}</h4>
            <p className="text-xs leading-relaxed text-brand-brown/70">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
