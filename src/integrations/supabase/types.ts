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
      artist_mediums: {
        Row: {
          artist_id: string
          is_main: boolean
          medium_id: string
        }
        Insert: {
          artist_id: string
          is_main?: boolean
          medium_id: string
        }
        Update: {
          artist_id?: string
          is_main?: boolean
          medium_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_mediums_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_mediums_medium_id_fkey"
            columns: ["medium_id"]
            isOneToOne: false
            referencedRelation: "taxonomy"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_specialties: {
        Row: {
          artist_id: string
          specialty_id: string
        }
        Insert: {
          artist_id: string
          specialty_id: string
        }
        Update: {
          artist_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_specialties_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "taxonomy"
            referencedColumns: ["id"]
          },
        ]
      }
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
      media_settings: {
        Row: {
          audio_max_bytes: number
          audio_max_seconds: number
          id: string
          video_max_bytes: number
          video_max_seconds: number
        }
        Insert: {
          audio_max_bytes?: number
          audio_max_seconds?: number
          id?: string
          video_max_bytes?: number
          video_max_seconds?: number
        }
        Update: {
          audio_max_bytes?: number
          audio_max_seconds?: number
          id?: string
          video_max_bytes?: number
          video_max_seconds?: number
        }
        Relationships: []
      }
      newsletter_signups: {
        Row: {
          consented_at: string | null
          created_at: string
          marketing_opt_in: boolean
          source: string
          user_id: string
        }
        Insert: {
          consented_at?: string | null
          created_at?: string
          marketing_opt_in?: boolean
          source: string
          user_id: string
        }
        Update: {
          consented_at?: string | null
          created_at?: string
          marketing_opt_in?: boolean
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      piece_specialties: {
        Row: {
          piece_id: string
          specialty_id: string
        }
        Insert: {
          piece_id: string
          specialty_id: string
        }
        Update: {
          piece_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "piece_specialties_piece_id_fkey"
            columns: ["piece_id"]
            isOneToOne: false
            referencedRelation: "pieces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piece_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "taxonomy"
            referencedColumns: ["id"]
          },
        ]
      }
      pieces: {
        Row: {
          artist: string
          city: string
          collection: string
          created_at: string
          format_id: string
          id: string
          images: string[]
          medium: string
          medium_id: string | null
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
          created_at?: string
          format_id?: string
          id?: string
          images?: string[]
          medium?: string
          medium_id?: string | null
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
          created_at?: string
          format_id?: string
          id?: string
          images?: string[]
          medium?: string
          medium_id?: string | null
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
          {
            foreignKeyName: "pieces_medium_id_fkey"
            columns: ["medium_id"]
            isOneToOne: false
            referencedRelation: "taxonomy"
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
          interest_medium_ids: string[]
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
          interest_medium_ids?: string[]
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
          interest_medium_ids?: string[]
          mediums?: string[]
          photo?: string | null
          sample?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      room_media: {
        Row: {
          artist: string
          cover_image: string | null
          created_at: string
          duration_s: number | null
          id: string
          kind: string
          provider: string
          size_bytes: number | null
          sort_order: number
          storage_path: string | null
          title: string
          url: string
        }
        Insert: {
          artist: string
          cover_image?: string | null
          created_at?: string
          duration_s?: number | null
          id?: string
          kind: string
          provider: string
          size_bytes?: number | null
          sort_order?: number
          storage_path?: string | null
          title: string
          url: string
        }
        Update: {
          artist?: string
          cover_image?: string | null
          created_at?: string
          duration_s?: number | null
          id?: string
          kind?: string
          provider?: string
          size_bytes?: number | null
          sort_order?: number
          storage_path?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_media_artist_fkey"
            columns: ["artist"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      taxonomy: {
        Row: {
          id: string
          kind: string
          label_en: string
          label_es: string
          parent_id: string | null
          slug: string
          sort_order: number
          status: string
        }
        Insert: {
          id: string
          kind: string
          label_en: string
          label_es: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          status?: string
        }
        Update: {
          id?: string
          kind?: string
          label_en?: string
          label_es?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "taxonomy"
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
      public_piece_favorite_counts: {
        Args: never
        Returns: {
          favorite_count: number
          piece_id: string
        }[]
      }
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
      save_artist_taxonomy: {
        Args: { main_id: string; medium_ids: string[]; specialty_ids: string[] }
        Returns: undefined
      }
      save_piece_specialties: {
        Args: { specialty_ids: string[]; target_piece: string }
        Returns: undefined
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
