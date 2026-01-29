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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action_type: string
          created_at: string
          id: string
          metadata: Json | null
          service_id: string | null
          status: Database["public"]["Enums"]["ActivityStatus"]
          target_resource: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["ActivityStatus"]
          target_resource: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["ActivityStatus"]
          target_resource?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      dinn_post_tags: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      dinn_post_tags_connect: {
        Row: {
          created_at: string | null
          post_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dinn_post_tags_connect_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "dinn_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dinn_post_tags_connect_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "dinn_post_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      dinn_posts: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          author_role: string | null
          content: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          like_count: number
          published_at: string | null
          read_time: number
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          author_role?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          like_count?: number
          published_at?: string | null
          read_time?: number
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          author_role?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          like_count?: number
          published_at?: string | null
          read_time?: number
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      dinn_reviews: {
        Row: {
          contents: string
          created_at: string
          deleted_at: string | null
          email: string
          id: number
          nickname: string
        }
        Insert: {
          contents?: string
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: number
          nickname?: string
        }
        Update: {
          contents?: string
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: number
          nickname?: string
        }
        Relationships: []
      }
      service_features: {
        Row: {
          created_at: string
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          path: string
          service_id: string
          table_name: Database["public"]["Enums"]["FeatureTableName"]
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          path: string
          service_id: string
          table_name: Database["public"]["Enums"]["FeatureTableName"]
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          path?: string
          service_id?: string
          table_name?: Database["public"]["Enums"]["FeatureTableName"]
        }
        Relationships: [
          {
            foreignKeyName: "service_features_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["ServiceStatus"]
          thumbnail: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["ServiceStatus"]
          thumbnail?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["ServiceStatus"]
          thumbnail?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_view_count: { Args: { post_id: string }; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      ActivityStatus: "Draft" | "Visible" | "Active"
      FeatureTableName: "dinn_reviews" | "dinn_posts"
      ServiceStatus: "Draft" | "Inactive" | "Active"
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
      ActivityStatus: ["Draft", "Visible", "Active"],
      FeatureTableName: ["dinn_reviews", "dinn_posts"],
      ServiceStatus: ["Draft", "Inactive", "Active"],
    },
  },
} as const
