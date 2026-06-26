import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageKey: string;
  weightGrams: number;
  qty: number;
  kind?: "product" | "hamper";
}

interface CartState {
  items: CartItem[];
  wishlist: string[]; // product slugs (local, merged into DB on login)
  recentlyViewed: string[];
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  setWishlist: (slugs: string[]) => void;
  trackView: (slug: string) => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      recentlyViewed: [],
      addToCart: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, qty, kind: item.kind ?? "product" }] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        })),
      clearCart: () => set({ items: [] }),
      toggleWishlist: (slug) =>
        set((state) => ({
          wishlist: state.wishlist.includes(slug)
            ? state.wishlist.filter((s) => s !== slug)
            : [...state.wishlist, slug],
        })),
      setWishlist: (slugs) => set({ wishlist: slugs }),
      trackView: (slug) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter((s) => s !== slug);
          return { recentlyViewed: [slug, ...filtered].slice(0, 8) };
        }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      totalAmount: () => get().items.reduce((sum, i) => sum + i.qty * i.price, 0),
    }),
    { name: "healthy-delights-cart" },
  ),
);
