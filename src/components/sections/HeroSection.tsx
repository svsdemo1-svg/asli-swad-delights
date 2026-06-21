import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-laddoos.jpg";

export function HeroSection() {
  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
      <img
        src={heroImg}
        alt="Traditional Indian laddoos on a brass thali with marigold petals and candlelight"
        width={1024}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/90 via-brand-brown/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center px-6 text-center animate-fade-in-up">
        <span className="mb-3 inline-block text-sm font-medium uppercase tracking-[0.25em] text-brand-beige/90">
          असली स्वाद
        </span>
        <h1 className="mb-3 max-w-2xl text-balance font-serif text-4xl leading-[1.1] text-brand-cream md:text-5xl">
          Healthy Traditional <br />
          <span className="italic">Nutrition in Every Bite</span>
        </h1>
        <p className="mb-7 max-w-md text-sm text-brand-beige/90 md:text-base">
          Handcrafted laddoos, panjiri & nutritious snacks made with authentic recipes,
          premium ingredients and zero preservatives.
        </p>
        <div className="flex w-full max-w-xs flex-col gap-3">
          <Link
            to="/products"
            className="rounded-full bg-brand-gold py-4 text-center text-sm font-bold uppercase tracking-widest text-brand-cream shadow-xl transition-transform hover:scale-[1.02]"
          >
            Shop Now
          </Link>
          <Link
            to="/products"
            className="rounded-full border border-brand-beige/40 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-brand-beige/90"
          >
            View Products
          </Link>
        </div>
      </div>
    </section>
  );
}
