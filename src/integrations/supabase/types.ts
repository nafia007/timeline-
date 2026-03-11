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
      donations: {
        Row: {
          amount: number
          chain: string | null
          created_at: string
          currency: string
          donated_at: string
          donor_name: string | null
          filmmaker_id: string
          id: string
          note: string | null
        }
        Insert: {
          amount: number
          chain?: string | null
          created_at?: string
          currency?: string
          donated_at?: string
          donor_name?: string | null
          filmmaker_id: string
          id?: string
          note?: string | null
        }
        Update: {
          amount?: number
          chain?: string | null
          created_at?: string
          currency?: string
          donated_at?: string
          donor_name?: string | null
          filmmaker_id?: string
          id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_filmmaker_id_fkey"
            columns: ["filmmaker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_filmmaker_id_fkey"
            columns: ["filmmaker_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      films: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          filmmaker_id: string
          genre: string | null
          id: string
          is_vertical: boolean
          requires_auth: boolean
          status: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          trailer_url: string | null
          updated_at: string
          video_url: string | null
          view_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          filmmaker_id: string
          genre?: string | null
          id?: string
          is_vertical?: boolean
          requires_auth?: boolean
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          trailer_url?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          filmmaker_id?: string
          genre?: string | null
          id?: string
          is_vertical?: boolean
          requires_auth?: boolean
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          trailer_url?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "films_filmmaker_id_fkey"
            columns: ["filmmaker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "films_filmmaker_id_fkey"
            columns: ["filmmaker_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          message: string
          read: boolean
          recipient_id: string
          reference_id: string | null
          type: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          message: string
          read?: boolean
          recipient_id: string
          reference_id?: string | null
          type: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          recipient_id?: string
          reference_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          content: string | null
          created_at: string
          id: string
          media_type: string | null
          media_url: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content?: string | null
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string | null
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bank_details: string | null
          bio: string | null
          bitcoin_wallet: string | null
          created_at: string
          crypto_wallet: string | null
          display_name: string | null
          featured_filmmaker: boolean
          id: string
          role: string
          show_bank_details: boolean
          show_bitcoin_wallet: boolean
          show_crypto_wallet: boolean
          show_solana_wallet: boolean
          solana_wallet: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bank_details?: string | null
          bio?: string | null
          bitcoin_wallet?: string | null
          created_at?: string
          crypto_wallet?: string | null
          display_name?: string | null
          featured_filmmaker?: boolean
          id?: string
          role?: string
          show_bank_details?: boolean
          show_bitcoin_wallet?: boolean
          show_crypto_wallet?: boolean
          show_solana_wallet?: boolean
          solana_wallet?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bank_details?: string | null
          bio?: string | null
          bitcoin_wallet?: string | null
          created_at?: string
          crypto_wallet?: string | null
          display_name?: string | null
          featured_filmmaker?: boolean
          id?: string
          role?: string
          show_bank_details?: boolean
          show_bitcoin_wallet?: boolean
          show_crypto_wallet?: boolean
          show_solana_wallet?: boolean
          solana_wallet?: string | null
          updated_at?: string
          user_id?: string
          username?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bank_details: string | null
          bio: string | null
          bitcoin_wallet: string | null
          created_at: string | null
          crypto_wallet: string | null
          display_name: string | null
          featured_filmmaker: boolean | null
          id: string | null
          role: string | null
          show_bank_details: boolean | null
          show_bitcoin_wallet: boolean | null
          show_crypto_wallet: boolean | null
          show_solana_wallet: boolean | null
          solana_wallet: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bank_details?: never
          bio?: string | null
          bitcoin_wallet?: never
          created_at?: string | null
          crypto_wallet?: never
          display_name?: string | null
          featured_filmmaker?: boolean | null
          id?: string | null
          role?: string | null
          show_bank_details?: boolean | null
          show_bitcoin_wallet?: boolean | null
          show_crypto_wallet?: boolean | null
          show_solana_wallet?: boolean | null
          solana_wallet?: never
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bank_details?: never
          bio?: string | null
          bitcoin_wallet?: never
          created_at?: string | null
          crypto_wallet?: never
          display_name?: string | null
          featured_filmmaker?: boolean | null
          id?: string | null
          role?: string | null
          show_bank_details?: boolean | null
          show_bitcoin_wallet?: boolean | null
          show_crypto_wallet?: boolean | null
          show_solana_wallet?: boolean | null
          solana_wallet?: never
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
