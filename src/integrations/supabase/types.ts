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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          language: string
          published: boolean
          short_desc: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          language?: string
          published?: boolean
          short_desc?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          language?: string
          published?: boolean
          short_desc?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          content: string
          id: string
          image_url: string | null
          language: string
          section_key: string
          short_desc: string
          slug: string
          sort_order: number
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string
          id?: string
          image_url?: string | null
          language?: string
          section_key: string
          short_desc?: string
          slug: string
          sort_order?: number
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string
          id?: string
          image_url?: string | null
          language?: string
          section_key?: string
          short_desc?: string
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          active: boolean
          availability_status: string
          created_at: string
          full_name: string
          id: string
          license_number: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          availability_status?: string
          created_at?: string
          full_name: string
          id?: string
          license_number?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          availability_status?: string
          created_at?: string
          full_name?: string
          id?: string
          license_number?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_number: string
          pdf_url: string | null
          shipment_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          invoice_number?: string
          pdf_url?: string | null
          shipment_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_number?: string
          pdf_url?: string | null
          shipment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_emails: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          active: boolean
          email: string
          id: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          active?: boolean
          email: string
          id?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          active?: boolean
          email?: string
          id?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          created_at: string
          description: string | null
          destination: string
          email: string
          id: string
          name: string
          origin: string
          package_type: string | null
          phone: string | null
          quote_notes: string | null
          quote_price: number | null
          status: string
          user_id: string | null
          valid_until: string | null
          weight: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          destination: string
          email: string
          id?: string
          name: string
          origin: string
          package_type?: string | null
          phone?: string | null
          quote_notes?: string | null
          quote_price?: number | null
          status?: string
          user_id?: string | null
          valid_until?: string | null
          weight?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          destination?: string
          email?: string
          id?: string
          name?: string
          origin?: string
          package_type?: string | null
          phone?: string | null
          quote_notes?: string | null
          quote_price?: number | null
          status?: string
          user_id?: string | null
          valid_until?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          image_url: string | null
          language: string
          name: string
          price_info: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          language?: string
          name: string
          price_info?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          language?: string
          name?: string
          price_info?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      shipment_pallets: {
        Row: {
          client_name: string | null
          cost: number | null
          created_at: string
          delivery_address: string | null
          delivery_contact: string | null
          description: string
          destination_city: string | null
          dimensions: string | null
          id: string
          load_type: string
          origin_city: string | null
          payment_status: string
          position: number
          shipment_id: string
          special_handling: string | null
          weight_kg: number | null
        }
        Insert: {
          client_name?: string | null
          cost?: number | null
          created_at?: string
          delivery_address?: string | null
          delivery_contact?: string | null
          description?: string
          destination_city?: string | null
          dimensions?: string | null
          id?: string
          load_type?: string
          origin_city?: string | null
          payment_status?: string
          position?: number
          shipment_id: string
          special_handling?: string | null
          weight_kg?: number | null
        }
        Update: {
          client_name?: string | null
          cost?: number | null
          created_at?: string
          delivery_address?: string | null
          delivery_contact?: string | null
          description?: string
          destination_city?: string | null
          dimensions?: string | null
          id?: string
          load_type?: string
          origin_city?: string | null
          payment_status?: string
          position?: number
          shipment_id?: string
          special_handling?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_pallets_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_status_log: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          location: string | null
          notes: string | null
          shipment_id: string
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          shipment_id: string
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          shipment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_status_log_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery_at: string | null
          created_at: string
          current_location: string | null
          delay_reason: string | null
          destination: string
          driver_id: string | null
          driver_notes: string | null
          estimated_delivery_at: string | null
          id: string
          notes: string | null
          origin: string
          quote_request_id: string | null
          status: string
          tracking_number: string
          truck_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actual_delivery_at?: string | null
          created_at?: string
          current_location?: string | null
          delay_reason?: string | null
          destination: string
          driver_id?: string | null
          driver_notes?: string | null
          estimated_delivery_at?: string | null
          id?: string
          notes?: string | null
          origin: string
          quote_request_id?: string | null
          status?: string
          tracking_number?: string
          truck_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          actual_delivery_at?: string | null
          created_at?: string
          current_location?: string | null
          delay_reason?: string | null
          destination?: string
          driver_id?: string | null
          driver_notes?: string | null
          estimated_delivery_at?: string | null
          id?: string
          notes?: string | null
          origin?: string
          quote_request_id?: string | null
          status?: string
          tracking_number?: string
          truck_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      trucks: {
        Row: {
          active: boolean
          assigned_driver_id: string | null
          capacity_kg: number | null
          capacity_pallets: number | null
          created_at: string
          current_status: string
          id: string
          last_maintenance_date: string | null
          model: string | null
          plate_number: string
          updated_at: string
          vehicle_type: string
          vin: string | null
        }
        Insert: {
          active?: boolean
          assigned_driver_id?: string | null
          capacity_kg?: number | null
          capacity_pallets?: number | null
          created_at?: string
          current_status?: string
          id?: string
          last_maintenance_date?: string | null
          model?: string | null
          plate_number: string
          updated_at?: string
          vehicle_type?: string
          vin?: string | null
        }
        Update: {
          active?: boolean
          assigned_driver_id?: string | null
          capacity_kg?: number | null
          capacity_pallets?: number | null
          created_at?: string
          current_status?: string
          id?: string
          last_maintenance_date?: string | null
          model?: string | null
          plate_number?: string
          updated_at?: string
          vehicle_type?: string
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trucks_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
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
      get_driver_id_for_user: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "driver" | "logistics_manager" | "executive"
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
      app_role: ["admin", "user", "driver", "logistics_manager", "executive"],
    },
  },
} as const
