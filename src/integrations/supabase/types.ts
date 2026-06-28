export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          line1: string
          line2: string | null
          mobile: string
          pincode: string
          state: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          line1: string
          line2?: string | null
          mobile: string
          pincode: string
          state: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          line1?: string
          line2?: string | null
          mobile?: string
          pincode?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          body_markdown: string
          cover_image_key: string
          created_at: string
          excerpt: string
          id: string
          is_published: boolean
          published_at: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          body_markdown: string
          cover_image_key: string
          created_at?: string
          excerpt: string
          id?: string
          is_published?: boolean
          published_at?: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          body_markdown?: string
          cover_image_key?: string
          created_at?: string
          excerpt?: string
          id?: string
          is_published?: boolean
          published_at?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          mobile: string | null
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          mobile?: string | null
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          mobile?: string | null
          name?: string
        }
        Relationships: []
      }
      corporate_inquiries: {
        Row: {
          company_name: string
          created_at: string
          email: string
          id: string
          mobile: string
          name: string
          requirement: string
        }
        Insert: {
          company_name: string
          created_at?: string
          email: string
          id?: string
          mobile: string
          name: string
          requirement: string
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          mobile?: string
          name?: string
          requirement?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          expires_at: string | null
          id: string
          is_active: boolean
          min_order_inr: number
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          min_order_inr?: number
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          min_order_inr?: number
          value?: number
        }
        Relationships: []
      }
      gift_hampers: {
        Row: {
          contents: Json
          created_at: string
          description: string
          id: string
          image_key: string
          is_published: boolean
          name: string
          occasion: string
          price_inr: number
          slug: string
          sort_order: number
        }
        Insert: {
          contents?: Json
          created_at?: string
          description: string
          id?: string
          image_key: string
          is_published?: boolean
          name: string
          occasion?: string
          price_inr: number
          slug: string
          sort_order?: number
        }
        Update: {
          contents?: Json
          created_at?: string
          description?: string
          id?: string
          image_key?: string
          is_published?: boolean
          name?: string
          occasion?: string
          price_inr?: number
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          image_key: string
          kind: string
          line_total_inr: number
          order_id: string
          product_id: string | null
          product_name: string
          product_slug: string
          quantity: number
          unit_price_inr: number
          weight_grams: number
        }
        Insert: {
          id?: string
          image_key: string
          kind?: string
          line_total_inr: number
          order_id: string
          product_id?: string | null
          product_name: string
          product_slug: string
          quantity: number
          unit_price_inr: number
          weight_grams?: number
        }
        Update: {
          id?: string
          image_key?: string
          kind?: string
          line_total_inr?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_slug?: string
          quantity?: number
          unit_price_inr?: number
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_inr: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          ship_city: string
          ship_full_name: string
          ship_line1: string
          ship_line2: string | null
          ship_mobile: string
          ship_pincode: string
          ship_state: string
          shipping_inr: number
          status: string
          subtotal_inr: number
          total_inr: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_inr?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          ship_city: string
          ship_full_name: string
          ship_line1: string
          ship_line2?: string | null
          ship_mobile: string
          ship_pincode: string
          ship_state: string
          shipping_inr?: number
          status?: string
          subtotal_inr: number
          total_inr: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_inr?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          ship_city?: string
          ship_full_name?: string
          ship_line1?: string
          ship_line2?: string | null
          ship_mobile?: string
          ship_pincode?: string
          ship_state?: string
          shipping_inr?: number
          status?: string
          subtotal_inr?: number
          total_inr?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          body: string
          created_at: string
          id: string
          product_id: string
          rating: number
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          product_id: string
          rating: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          benefits: string[]
          category_id: string | null
          created_at: string
          delivery_eta: string | null
          gallery_image_keys: string[]
          id: string
          image_key: string
          in_stock: boolean
          ingredients: string[]
          is_best_seller: boolean
          is_featured: boolean
          long_description: string | null
          name: string
          nutrition_facts: Json | null
          nutritional_info: Json
          price_inr: number
          related_slugs: string[]
          seo_description: string | null
          seo_title: string | null
          shelf_life: string | null
          short_description: string
          slug: string
          sort_order: number
          storage_instructions: string | null
          suitable_for: string[]
          weight_grams: number
        }
        Insert: {
          benefits?: string[]
          category_id?: string | null
          created_at?: string
          delivery_eta?: string | null
          gallery_image_keys?: string[]
          id?: string
          image_key: string
          in_stock?: boolean
          ingredients?: string[]
          is_best_seller?: boolean
          is_featured?: boolean
          long_description?: string | null
          name: string
          nutrition_facts?: Json | null
          nutritional_info?: Json
          price_inr: number
          related_slugs?: string[]
          seo_description?: string | null
          seo_title?: string | null
          shelf_life?: string | null
          short_description: string
          slug: string
          sort_order?: number
          storage_instructions?: string | null
          suitable_for?: string[]
          weight_grams?: number
        }
        Update: {
          benefits?: string[]
          category_id?: string | null
          created_at?: string
          delivery_eta?: string | null
          gallery_image_keys?: string[]
          id?: string
          image_key?: string
          in_stock?: boolean
          ingredients?: string[]
          is_best_seller?: boolean
          is_featured?: boolean
          long_description?: string | null
          name?: string
          nutrition_facts?: Json | null
          nutritional_info?: Json
          price_inr?: number
          related_slugs?: string[]
          seo_description?: string | null
          seo_title?: string | null
          shelf_life?: string | null
          short_description?: string
          slug?: string
          sort_order?: number
          storage_instructions?: string | null
          suitable_for?: string[]
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          mobile: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          mobile?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          mobile?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          author_title: string | null
          body: string
          created_at: string
          id: string
          is_published: boolean
          rating: number
          sort_order: number
        }
        Insert: {
          author_name: string
          author_title?: string | null
          body: string
          created_at?: string
          id?: string
          is_published?: boolean
          rating?: number
          sort_order?: number
        }
        Update: {
          author_name?: string
          author_title?: string | null
          body?: string
          created_at?: string
          id?: string
          is_published?: boolean
          rating?: number
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_super: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "customer" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer", "super_admin"],
    },
  },
} as const
