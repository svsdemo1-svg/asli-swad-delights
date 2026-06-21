import { Dumbbell, Cookie, Coffee, Users, Gift, Briefcase } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";

const benefits = [
  { icon: Dumbbell, title: "Perfect Pre-Workout", body: "Natural energy for active lifestyles." },
  { icon: Cookie, title: "Healthy Sweet Cravings", body: "Guilt-free indulgence, no white sugar." },
  { icon: Coffee, title: "Evening Hunger Solution", body: "The nourishing 4 PM snack." },
  { icon: Users, title: "Family Nutrition", body: "Suitable for kids to seniors." },
  { icon: Gift, title: "Festive Gifting", body: "A healthy way to celebrate." },
  { icon: Briefcase, title: "Corporate Wellness", body: "Premium gifts that mean it." },
];

export function HealthBenefits() {
  return (
    <section className="bg-brand-beige/40 px-6 py-16">
      <SectionHeading
        eyebrow="Made for Every Day"
        title="A Nutrient Boost for Every Moment"
      />
      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map(({ icon: Icon, title, body }, i) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-3xl bg-brand-cream p-5 ring-1 ring-brand-brown/5 animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-brown text-brand-gold-soft">
              <Icon className="size-4" />
            </div>
            <div>
              <h4 className="mb-1 font-serif text-base font-bold text-brand-brown">{title}</h4>
              <p className="text-xs leading-relaxed text-brand-brown/70">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
