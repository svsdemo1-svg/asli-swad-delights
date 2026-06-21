import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";

interface Props {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: Props) {
  const addToCart = useCart((s) => s.addToCart);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price_inr,
      imageKey: product.image_key,
      weightGrams: product.weight_grams,
    });
    toast.success(`${product.name} added to bag`);
  };

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group relative block rounded-[32px] bg-brand-cream p-4 shadow-sm ring-1 ring-brand-brown/5 transition-shadow hover:shadow-md animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {product.is_best_seller && (
        <span className="absolute top-6 left-6 z-10 rounded-full bg-brand-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-cream shadow">
          Best Seller
        </span>
      )}
      <div className="mb-5 aspect-square w-full overflow-hidden rounded-[24px] bg-brand-beige/40">
        <img
          src={getProductImage(product.image_key)}
          alt={product.name}
          width={768}
          height={768}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="px-1">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg font-bold leading-tight text-brand-brown">
            {product.name}
          </h3>
          <span className="shrink-0 font-bold text-brand-gold">{formatINR(product.price_inr)}</span>
        </div>
        <p className="mb-5 line-clamp-2 text-xs text-brand-brown/60">
          {product.short_description}{" "}
          <span className="opacity-80">({product.weight_grams}g)</span>
        </p>
        <button
          onClick={handleAdd}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-brown/20 py-3 text-xs font-bold uppercase tracking-widest text-brand-brown transition-colors hover:bg-brand-brown hover:text-brand-cream"
        >
          <Plus className="size-3.5" /> Add to Bag
        </button>
      </div>
    </Link>
  );
}
