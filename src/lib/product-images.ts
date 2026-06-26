import panjiri from "@/assets/product-panjiri.jpg";
import dryFruit from "@/assets/product-dry-fruit.jpg";
import gond from "@/assets/product-gond.jpg";
import ragi from "@/assets/product-ragi.jpg";
import dates from "@/assets/product-dates.jpg";
import millet from "@/assets/product-millet.jpg";
import flax from "@/assets/product-flax.jpg";
import makhana from "@/assets/product-makhana.jpg";
import methi from "@/assets/product-methi.jpg";
import figs from "@/assets/product-figs.jpg";
import rajgira from "@/assets/product-rajgira.jpg";
import sattu from "@/assets/product-sattu.jpg";
import nourishmentMix from "@/assets/product-nourishment-mix.jpg";

export const productImages: Record<string, string> = {
  "product-panjiri": panjiri,
  panjiri,
  "product-dry-fruit": dryFruit,
  "dry-fruit": dryFruit,
  "product-gond": gond,
  gond,
  "product-ragi": ragi,
  ragi,
  "product-dates": dates,
  dates,
  "product-millet": millet,
  millet,
  "product-flax": flax,
  flax,
  "product-makhana": makhana,
  makhana,
  "product-methi": methi,
  methi,
  "product-figs": figs,
  figs,
  "product-rajgira": rajgira,
  rajgira,
  "product-sattu": sattu,
  sattu,
  "product-nourishment-mix": nourishmentMix,
  "nourishment-mix": nourishmentMix,
};

/**
 * Resolve an image key. Supports:
 *  - bundled key (e.g. "product-gond") → imported asset URL
 *  - full URL (https://...) → used as-is (admin override)
 */
export function getProductImage(key: string | null | undefined): string {
  if (!key) return panjiri;
  if (key.startsWith("http://") || key.startsWith("https://") || key.startsWith("/")) {
    return key;
  }
  return productImages[key] ?? panjiri;
}
