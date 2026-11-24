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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      events: {
        Row: {
          address: string
          artist: string
          blurb: string
          bring: string[]
          capacity: number
          city: string
          cover_image: string | null
          date: string
          end_time: string
          id: string
          online_link: string
          price: number
          sample: boolean
          start_time: string
          status: string
          title: string
          tone: string
          type: string
        }
        Insert: {
          address?: string
          artist: string
          blurb?: string
          bring?: string[]
          capacity?: number
          city?: string
          cover_image?: string | null
          date: string
          end_time?: string
          id?: string
          online_link?: string
          price?: number
          sample?: boolean
          start_time?: string
          status?: string
          title: string
          tone?: string
          type?: string
        }
        Update: {
          address?: string
          artist?: string
          blurb?: string
          bring?: string[]
          capacity?: number
          city?: string
          cover_image?: string | null
          date?: string
          end_time?: string
          id?: string
          online_link?: string
          price?: number
          sample?: boolean
          start_time?: string
          status?: string
          title?: string
          tone?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_artist_fkey"
            columns: ["artist"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          collector: string
          created_at: string
          piece: string
        }
        Insert: {
          collector: string
          created_at?: string
          piece: string
        }
        Update: {
          collector?: string
          created_at?: string
          piece?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          artist: string
          collector: string
          created_at: string
        }
        Insert: {
          artist: string
          collector: string
          created_at?: string
        }
        Update: {
          artist?: string
          collector?: string
          created_at?: string
        }
        Relationships: []
      }
      pieces: {
        Row: {
          artist: string
          city: string
          collection: string
          id: string
          images: string[]
          medium: string
          price: number
          ratio: number
          sample: boolean
          shape: number
          size: string
          status: string
          tags: string[]
          title: string
          tone: string
        }
        Insert: {
          artist: string
          city?: string
          collection?: string
          id?: string
          images?: string[]
          medium?: string
          price?: number
          ratio?: number
          sample?: boolean
          shape?: number
          size?: string
          status?: string
          tags?: string[]
          title: string
          tone?: string
        }
        Update: {
          artist?: string
          city?: string
          collection?: string
          id?: string
          images?: string[]
          medium?: string
          price?: number
          ratio?: number
          sample?: boolean
          shape?: number
          size?: string
          status?: string
          tags?: string[]
          title?: string
          tone?: string
        }
        Relationships: [
          {
            foreignKeyName: "pieces_artist_fkey"
            columns: ["artist"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string
          created_at: string
          display_name: string
          handle: string | null
          id: string
          mediums: string[]
          photo: string | null
          sample: boolean
          user_id: string | null
        }
        Insert: {
          city?: string
          created_at?: string
          display_name?: string
          handle?: string | null
          id?: string
          mediums?: string[]
          photo?: string | null
          sample?: boolean
          user_id?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          display_name?: string
          handle?: string | null
          id?: string
          mediums?: string[]
          photo?: string | null
          sample?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          bio: string
          faq: Json
          handle: string
          id: string
          links: Json
          loves: string[]
          published: boolean
          room_color: string
          section_order: string[]
          tagline: string
          visible_sections: string[]
          wants: string[]
        }
        Insert: {
          bio?: string
          faq?: Json
          handle: string
          id: string
          links?: Json
          loves?: string[]
          published?: boolean
          room_color?: string
          section_order?: string[]
          tagline?: string
          visible_sections?: string[]
          wants?: string[]
        }
        Update: {
          bio?: string
          faq?: Json
          handle?: string
          id?: string
          links?: Json
          loves?: string[]
          published?: boolean
          room_color?: string
          section_order?: string[]
          tagline?: string
          visible_sections?: string[]
          wants?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "rooms_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          artist: string
          description: string
          id: string
          price: number
          price_type: string
          published: boolean
          sample: boolean
          title: string
        }
        Insert: {
          artist: string
          description?: string
          id?: string
          price?: number
          price_type?: string
          published?: boolean
          sample?: boolean
          title: string
        }
        Update: {
          artist?: string
          description?: string
          id?: string
          price?: number
          price_type?: string
          published?: boolean
          sample?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_artist_fkey"
            columns: ["artist"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          collector: string
          created_at: string
          event: string
          id: string
          status: string
        }
        Insert: {
          collector: string
          created_at?: string
          event: string
          id?: string
          status?: string
        }
        Update: {
          collector?: string
          created_at?: string
          event?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_collector_fkey"
            columns: ["collector"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_event_fkey"
            columns: ["event"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      check_in_ticket: { Args: { ticket_id: string }; Returns: undefined }
      complete_registration: { Args: { payload: Json }; Returns: undefined }
      event_spots: { Args: { event_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      my_artist_social_counts: { Args: never; Returns: Json }
      owns_ticket_event: { Args: { event_id: string }; Returns: boolean }
      reserve_ticket: {
        Args: { event_id: string }
        Returns: {
          collector: string
          created_at: string
          event: string
          id: string
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "artist" | "collector"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["artist", "collector"],
    },
  },
} as const
