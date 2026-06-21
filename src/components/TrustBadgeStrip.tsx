const badges = [
  "100% Natural",
  "Handmade",
  "No Preservatives",
  "Eco-Friendly",
];

export function TrustBadgeStrip() {
  return (
    <section className="grid grid-cols-2 gap-px border-b border-brand-brown/5 bg-brand-brown/5">
      {badges.map((b, i) => (
        <div
          key={b}
          className={`flex flex-col items-center bg-brand-cream p-6 text-center ${i >= 2 ? "border-t border-brand-brown/5" : ""}`}
        >
          <div className="mb-2 text-lg text-brand-gold">✧</div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown">
            {b}
          </span>
        </div>
      ))}
    </section>
  );
}
