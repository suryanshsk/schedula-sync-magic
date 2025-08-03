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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          checked_in_at: string
          checked_in_by: string
          event_id: string
          id: string
          location: string | null
          method: string
          notes: string | null
          user_id: string
        }
        Insert: {
          checked_in_at?: string
          checked_in_by: string
          event_id: string
          id?: string
          location?: string | null
          method: string
          notes?: string | null
          user_id: string
        }
        Update: {
          checked_in_at?: string
          checked_in_by?: string
          event_id?: string
          id?: string
          location?: string | null
          method?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          agenda: Json | null
          capacity: number
          category: string
          created_at: string
          description: string
          end_date: string
          id: string
          image_url: string | null
          location: Json
          metrics: Json | null
          organizer_id: string
          pricing: Json
          registration_deadline: string | null
          requirements: string[] | null
          short_description: string | null
          start_date: string
          status: string
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          visibility: string
        }
        Insert: {
          agenda?: Json | null
          capacity?: number
          category: string
          created_at?: string
          description: string
          end_date: string
          id?: string
          image_url?: string | null
          location?: Json
          metrics?: Json | null
          organizer_id: string
          pricing?: Json
          registration_deadline?: string | null
          requirements?: string[] | null
          short_description?: string | null
          start_date: string
          status?: string
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          agenda?: Json | null
          capacity?: number
          category?: string
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          image_url?: string | null
          location?: Json
          metrics?: Json | null
          organizer_id?: string
          pricing?: Json
          registration_deadline?: string | null
          requirements?: string[] | null
          short_description?: string | null
          start_date?: string
          status?: string
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_text: string | null
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          location: string | null
          name: string
          preferences: Json
          role: string
          social_links: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id?: string
          location?: string | null
          name: string
          preferences?: Json
          role?: string
          social_links?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          location?: string | null
          name?: string
          preferences?: Json
          role?: string
          social_links?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          attendance_status: string | null
          checked_in: boolean
          checked_in_at: string | null
          checked_in_by: string | null
          checked_in_method: string | null
          confirmed_at: string | null
          event_id: string
          id: string
          notes: string | null
          qr_code: string | null
          registration_date: string
          status: string
          user_id: string
        }
        Insert: {
          attendance_status?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_in_method?: string | null
          confirmed_at?: string | null
          event_id: string
          id?: string
          notes?: string | null
          qr_code?: string | null
          registration_date?: string
          status?: string
          user_id: string
        }
        Update: {
          attendance_status?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_in_method?: string | null
          confirmed_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          qr_code?: string | null
          registration_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
