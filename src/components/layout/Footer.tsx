import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-brand-brown/5 bg-brand-cream px-6 pt-16 pb-32 md:pb-16">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-3 font-serif text-2xl font-bold text-brand-brown">Healthy Delights</div>
          <p className="mb-2 text-sm italic text-brand-brown/70">"Asli Dadi Nani Ka Swad"</p>
          <p className="text-sm text-brand-brown/60">
            Handcrafted laddoos, panjiri & traditional snacks. Made with love by Menka Singh.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-brand-brown/80">
            Shop
          </h4>
          <ul className="space-y-2 text-sm text-brand-brown/70">
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/corporate-gifting">Corporate Gifting</Link></li>
            <li><Link to="/festive-gifting">Festive Hampers</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-brand-brown/80">
            Kitchen
          </h4>
          <ul className="space-y-2 text-sm text-brand-brown/70">
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-x-6 gap-y-2 border-t border-brand-brown/10 pt-6 text-xs text-brand-brown/60">
        <Link to="/privacy" className="hover:text-brand-brown">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-brand-brown">Terms & Conditions</Link>
        <Link to="/refund-policy" className="hover:text-brand-brown">Refund Policy</Link>
        <Link to="/shipping-policy" className="hover:text-brand-brown">Shipping Policy</Link>
      </div>
      <div className="mx-auto mt-4 max-w-5xl text-center">
        <p className="text-xs text-brand-brown/60">
          © {new Date().getFullYear()} Healthy Delights by Menka Singh. Crafting wellness, one bite at a time.
        </p>
      </div>
    </footer>
  );
}
