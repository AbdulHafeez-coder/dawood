export type SourcingRequest = {
  id: string;
  customer_name: string;
  customer_phone: string;
  product_query: string | null;
  image_url: string | null;
  quantity: string | null;
  specs: string | null;
  status: string;
  supplier_availability: boolean | null;
  supplier_cost: number | null;
  quoted_price: number | null;
  advance_amount: number | null;
  estimated_delivery: string | null;
  internal_notes: string | null;
  created_at: string;
};
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      sourcing_requests: {
        Row: SourcingRequest;
        Insert: Partial<SourcingRequest> &
          Pick<SourcingRequest, "id" | "customer_name" | "customer_phone">;
        Update: Partial<SourcingRequest>;
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          image_url: string;
          name: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          image_url?: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          image_url?: string;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          created_at: string;
          device_id: string;
          extra_count: number;
          id: string;
          item_count: number;
          kind: string;
          message: string;
          primary_bg: string | null;
          primary_img: string | null;
          primary_name: string;
          status: string;
          total: number;
          url: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          device_id?: string;
          extra_count?: number;
          id: string;
          item_count?: number;
          kind: string;
          message: string;
          primary_bg?: string | null;
          primary_img?: string | null;
          primary_name?: string;
          status?: string;
          total?: number;
          url: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          device_id?: string;
          extra_count?: number;
          id?: string;
          item_count?: number;
          kind?: string;
          message?: string;
          primary_bg?: string | null;
          primary_img?: string | null;
          primary_name?: string;
          status?: string;
          total?: number;
          url?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          status?: string;
          subcategory?: string;
          storefront_category?: string;
          availability_rank?: number;
          bg: string;
          category: string;
          created_at: string;
          description: string;
          details: string[];
          gallery: string[];
          id: string;
          img: string;
          name: string;
          price: number;
          rating: number;
          tag: string;
          tagline: string;
          slug: string | null;
          seo_title: string | null;
          seo_description: string | null;
        };
        Insert: {
          status?: string;
          subcategory?: string;
          storefront_category?: string;
          availability_rank?: number;
          bg?: string;
          category: string;
          created_at?: string;
          description?: string;
          details?: string[];
          gallery?: string[];
          id: string;
          img?: string;
          name: string;
          price?: number;
          rating?: number;
          tag?: string;
          tagline?: string;
          slug?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Update: {
          status?: string;
          subcategory?: string;
          storefront_category?: string;
          availability_rank?: number;
          bg?: string;
          category?: string;
          created_at?: string;
          description?: string;
          details?: string[];
          gallery?: string[];
          id?: string;
          img?: string;
          name?: string;
          price?: number;
          rating?: number;
          tag?: string;
          tagline?: string;
          slug?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_fkey";
            columns: ["category"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["name"];
          },
        ];
      };
      promotions: {
        Row: {
          bg_color: string;
          chip_style: string;
          created_at: string;
          headline: string;
          id: string;
          image_url: string | null;
          is_active: boolean;
          label: string;
          link_category: string | null;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          bg_color?: string;
          chip_style?: string;
          created_at?: string;
          headline: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          label: string;
          link_category?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          bg_color?: string;
          chip_style?: string;
          created_at?: string;
          headline?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          label?: string;
          link_category?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          address: string;
          brand_name: string;
          contact_email: string;
          contact_phone: string;
          id: string;
          logo_url: string;
          socials: Json;
          tagline: string;
          updated_at: string;
          whatsapp_number: string;
        };
        Insert: {
          address?: string;
          brand_name?: string;
          contact_email?: string;
          contact_phone?: string;
          id?: string;
          logo_url?: string;
          socials?: Json;
          tagline?: string;
          updated_at?: string;
          whatsapp_number?: string;
        };
        Update: {
          address?: string;
          brand_name?: string;
          contact_email?: string;
          contact_phone?: string;
          id?: string;
          logo_url?: string;
          socials?: Json;
          tagline?: string;
          updated_at?: string;
          whatsapp_number?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "moderator" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const;
