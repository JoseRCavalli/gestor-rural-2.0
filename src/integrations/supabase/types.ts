export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      animals: {
        Row: {
          birth_date: string
          created_at: string
          id: string
          name: string | null
          phase: string
          tag: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date: string
          created_at?: string
          id?: string
          name?: string | null
          phase: string
          tag: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string
          created_at?: string
          id?: string
          name?: string | null
          phase?: string
          tag?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          completed: boolean | null
          created_at: string
          date: string
          description: string | null
          icon: string | null
          id: string
          time: string
          title: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          date: string
          description?: string | null
          icon?: string | null
          id?: string
          time: string
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          date?: string
          description?: string | null
          icon?: string | null
          id?: string
          time?: string
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      import_logs: {
        Row: {
          created_at: string
          errors: Json | null
          file_name: string | null
          id: string
          import_type: string
          records_failed: number | null
          records_processed: number | null
          records_success: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          errors?: Json | null
          file_name?: string | null
          id?: string
          import_type: string
          records_failed?: number | null
          records_processed?: number | null
          records_success?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          errors?: Json | null
          file_name?: string | null
          id?: string
          import_type?: string
          records_failed?: number | null
          records_processed?: number | null
          records_success?: number | null
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          alert_advance_minutes: number | null
          created_at: string
          default_reminder_time: string | null
          email_notifications: boolean | null
          id: string
          stock_alerts: boolean | null
          updated_at: string
          user_id: string
          weather_alerts: boolean | null
          whatsapp_notifications: boolean | null
        }
        Insert: {
          alert_advance_minutes?: number | null
          created_at?: string
          default_reminder_time?: string | null
          email_notifications?: boolean | null
          id?: string
          stock_alerts?: boolean | null
          updated_at?: string
          user_id: string
          weather_alerts?: boolean | null
          whatsapp_notifications?: boolean | null
        }
        Update: {
          alert_advance_minutes?: number | null
          created_at?: string
          default_reminder_time?: string | null
          email_notifications?: boolean | null
          id?: string
          stock_alerts?: boolean | null
          updated_at?: string
          user_id?: string
          weather_alerts?: boolean | null
          whatsapp_notifications?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channel: string
          created_at: string
          id: string
          message: string
          read: boolean | null
          sent_at: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          sent_at?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          sent_at?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          property_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name: string
          phone?: string | null
          property_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          property_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          data: Json
          generated_at: string
          id: string
          report_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          generated_at?: string
          id?: string
          report_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          generated_at?: string
          id?: string
          report_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      stock_items: {
        Row: {
          available_stock: number | null
          average_cost: number | null
          category: string
          code: string | null
          created_at: string
          id: string
          min_stock: number
          name: string
          quantity: number
          reserved_stock: number | null
          selling_price: number | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          available_stock?: number | null
          average_cost?: number | null
          category?: string
          code?: string | null
          created_at?: string
          id?: string
          min_stock?: number
          name: string
          quantity?: number
          reserved_stock?: number | null
          selling_price?: number | null
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          available_stock?: number | null
          average_cost?: number | null
          category?: string
          code?: string | null
          created_at?: string
          id?: string
          min_stock?: number
          name?: string
          quantity?: number
          reserved_stock?: number | null
          selling_price?: number | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          animal_id: string
          application_date: string
          batch_number: string | null
          created_at: string
          id: string
          manufacturer: string | null
          next_dose_date: string | null
          notes: string | null
          responsible: string | null
          updated_at: string
          user_id: string
          vaccine_type_id: string
        }
        Insert: {
          animal_id: string
          application_date: string
          batch_number?: string | null
          created_at?: string
          id?: string
          manufacturer?: string | null
          next_dose_date?: string | null
          notes?: string | null
          responsible?: string | null
          updated_at?: string
          user_id: string
          vaccine_type_id: string
        }
        Update: {
          animal_id?: string
          application_date?: string
          batch_number?: string | null
          created_at?: string
          id?: string
          manufacturer?: string | null
          next_dose_date?: string | null
          notes?: string | null
          responsible?: string | null
          updated_at?: string
          user_id?: string
          vaccine_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_vaccine_type_id_fkey"
            columns: ["vaccine_type_id"]
            isOneToOne: false
            referencedRelation: "vaccine_types"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccine_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          interval_months: number | null
          max_age_months: number | null
          min_age_months: number | null
          name: string
          phases: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          interval_months?: number | null
          max_age_months?: number | null
          min_age_months?: number | null
          name: string
          phases?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          interval_months?: number | null
          max_age_months?: number | null
          min_age_months?: number | null
          name?: string
          phases?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
