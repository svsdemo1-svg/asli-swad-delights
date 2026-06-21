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
  panjiri,
  "dry-fruit": dryFruit,
  gond,
  ragi,
  dates,
  millet,
  flax,
  makhana,
  methi,
  figs,
  rajgira,
  sattu,
  "nourishment-mix": nourishmentMix,
};

export function getProductImage(key: string): string {
  return productImages[key] ?? panjiri;
}
