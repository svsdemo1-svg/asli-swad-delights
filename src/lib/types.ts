export interface Product {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  short_description: string;
  long_description: string | null;
  ingredients: string[];
  benefits: string[];
  suitable_for: string[];
  nutritional_info: Record<string, string>;
  weight_grams: number;
  price_inr: number;
  image_key: string;
  is_best_seller: boolean;
  is_featured: boolean;
  in_stock: boolean;
  sort_order: number;
  categories?: { slug: string; name: string } | null;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_title: string | null;
  body: string;
  rating: number;
  sort_order: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}
