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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      card_designs: {
        Row: {
          active: boolean
          country_id: string
          created_at: string
          id: string
          image_front_url: string | null
          language_code: string
          thank_you_text: string | null
          title: string | null
          view_no: number
        }
        Insert: {
          active?: boolean
          country_id: string
          created_at?: string
          id?: string
          image_front_url?: string | null
          language_code?: string
          thank_you_text?: string | null
          title?: string | null
          view_no: number
        }
        Update: {
          active?: boolean
          country_id?: string
          created_at?: string
          id?: string
          image_front_url?: string | null
          language_code?: string
          thank_you_text?: string | null
          title?: string | null
          view_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "designs_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          active: boolean
          created_at: string
          id: string
          iso2: string
          iso3: string | null
          name_pl: string
          slug: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          iso2: string
          iso3?: string | null
          name_pl: string
          slug?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          iso2?: string
          iso3?: string | null
          name_pl?: string
          slug?: string | null
        }
        Relationships: []
      }
      inventory_units: {
        Row: {
          business_status: Database["public"]["Enums"]["business_status"] | null
          card_design_id: string
          created_at: string
          fulfillment_status: Database["public"]["Enums"]["fulfillment_status"]
          id: string
          internal_inventory_code: string
          order_id: string | null
          order_item_id: string | null
          public_claim_code: string | null
          public_claim_token_hash: string | null
          qr_applied_at: string | null
          qr_generated_at: string | null
          registered_at: string | null
          shipment_id: string | null
          shipped_at: string | null
          stock_batch_id: string
          traveler_user_id: string | null
          updated_at: string
        }
        Insert: {
          business_status?:
            | Database["public"]["Enums"]["business_status"]
            | null
          card_design_id: string
          created_at?: string
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          internal_inventory_code: string
          order_id?: string | null
          order_item_id?: string | null
          public_claim_code?: string | null
          public_claim_token_hash?: string | null
          qr_applied_at?: string | null
          qr_generated_at?: string | null
          registered_at?: string | null
          shipment_id?: string | null
          shipped_at?: string | null
          stock_batch_id: string
          traveler_user_id?: string | null
          updated_at?: string
        }
        Update: {
          business_status?:
            | Database["public"]["Enums"]["business_status"]
            | null
          card_design_id?: string
          created_at?: string
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          internal_inventory_code?: string
          order_id?: string | null
          order_item_id?: string | null
          public_claim_code?: string | null
          public_claim_token_hash?: string | null
          qr_applied_at?: string | null
          qr_generated_at?: string | null
          registered_at?: string | null
          shipment_id?: string | null
          shipped_at?: string | null
          stock_batch_id?: string
          traveler_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_units_card_design_id_fkey"
            columns: ["card_design_id"]
            isOneToOne: false
            referencedRelation: "card_designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_units_stock_batch_id_fkey"
            columns: ["stock_batch_id"]
            isOneToOne: false
            referencedRelation: "stock_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          card_design_id: string
          created_at: string
          id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          card_design_id: string
          created_at?: string
          id?: string
          order_id: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          card_design_id?: string
          created_at?: string
          id?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_card_design_id_fkey"
            columns: ["card_design_id"]
            isOneToOne: false
            referencedRelation: "card_designs"
            referencedColumns: ["id"]
          },
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
          cancelled_at: string | null
          created_at: string
          currency: string
          fulfilled_at: string | null
          id: string
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipping_address: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_name: string | null
          shipping_postal_code: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_name?: string | null
          shipping_postal_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_name?: string | null
          shipping_postal_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_stats: {
        Row: {
          id: string
          total_countries: number
          total_given: number
          total_members: number
          total_purchased: number
          total_registered: number
          updated_at: string
        }
        Insert: {
          id?: string
          total_countries?: number
          total_given?: number
          total_members?: number
          total_purchased?: number
          total_registered?: number
          updated_at?: string
        }
        Update: {
          id?: string
          total_countries?: number
          total_given?: number
          total_members?: number
          total_purchased?: number
          total_registered?: number
          updated_at?: string
        }
        Relationships: []
      }
      postcards: {
        Row: {
          buyer_display_name: string | null
          buyer_id: string | null
          created_at: string
          design_id: string
          id: string
          order_reference: string | null
          purchased_at: string | null
          qr_token: string
          recipient_email: string | null
          recipient_message: string | null
          recipient_name: string | null
          registered_at: string | null
          serial_number: number
          status: string
          updated_at: string
        }
        Insert: {
          buyer_display_name?: string | null
          buyer_id?: string | null
          created_at?: string
          design_id: string
          id?: string
          order_reference?: string | null
          purchased_at?: string | null
          qr_token: string
          recipient_email?: string | null
          recipient_message?: string | null
          recipient_name?: string | null
          registered_at?: string | null
          serial_number: number
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_display_name?: string | null
          buyer_id?: string | null
          created_at?: string
          design_id?: string
          id?: string
          order_reference?: string | null
          purchased_at?: string | null
          qr_token?: string
          recipient_email?: string | null
          recipient_message?: string | null
          recipient_name?: string | null
          registered_at?: string | null
          serial_number?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "postcards_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "card_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          postcards_purchased: number
          postcards_received: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          postcards_purchased?: number
          postcards_received?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          postcards_purchased?: number
          postcards_received?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stock_batches: {
        Row: {
          card_design_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          quantity: number
          updated_at: string
        }
        Insert: {
          card_design_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          card_design_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_batches_card_design_id_fkey"
            columns: ["card_design_id"]
            isOneToOne: false
            referencedRelation: "card_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      generate_tracking_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reserve_inventory_for_order: {
        Args: { _order_id: string }
        Returns: Json
      }
      update_country_count: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "traveler" | "admin"
      business_status: "purchased" | "registered"
      fulfillment_status:
        | "in_stock"
        | "reserved"
        | "qr_generated"
        | "qr_applied"
        | "shipped"
        | "voided"
        | "damaged"
      order_status: "pending" | "paid" | "fulfilled" | "cancelled"
      payment_status: "unpaid" | "paid" | "refunded" | "failed"
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
      app_role: ["traveler", "admin"],
      business_status: ["purchased", "registered"],
      fulfillment_status: [
        "in_stock",
        "reserved",
        "qr_generated",
        "qr_applied",
        "shipped",
        "voided",
        "damaged",
      ],
      order_status: ["pending", "paid", "fulfilled", "cancelled"],
      payment_status: ["unpaid", "paid", "refunded", "failed"],
    },
  },
} as const
