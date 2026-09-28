/*
 * Generated from the Supabase schema — do not edit by hand.
 * Regenerate after schema changes (Supabase CLI: `supabase gen types typescript`).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_action_log: {
        Row: { action_type: Database["public"]["Enums"]["admin_action_type"]; admin_id: string; created_at: string; details: Json | null; id: string; target_id: string; target_type: string }
        Insert: { action_type: Database["public"]["Enums"]["admin_action_type"]; admin_id: string; created_at?: string; details?: Json | null; id?: string; target_id: string; target_type: string }
        Update: { action_type?: Database["public"]["Enums"]["admin_action_type"]; admin_id?: string; created_at?: string; details?: Json | null; id?: string; target_id?: string; target_type?: string }
        Relationships: [
          { foreignKeyName: "admin_action_log_admin_id_fkey"; columns: ["admin_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      company_profiles: {
        Row: { contact_email: string; created_at: string; id: string; name: string; status: Database["public"]["Enums"]["account_status"]; updated_at: string }
        Insert: { contact_email: string; created_at?: string; id: string; name: string; status?: Database["public"]["Enums"]["account_status"]; updated_at?: string }
        Update: { contact_email?: string; created_at?: string; id?: string; name?: string; status?: Database["public"]["Enums"]["account_status"]; updated_at?: string }
        Relationships: [
          { foreignKeyName: "company_profiles_id_fkey"; columns: ["id"]; isOneToOne: true; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      conversations: {
        Row: { archived_by_company: boolean; archived_by_creator: boolean; company_id: string; created_at: string; creator_id: string; id: string }
        Insert: { archived_by_company?: boolean; archived_by_creator?: boolean; company_id: string; created_at?: string; creator_id: string; id?: string }
        Update: { archived_by_company?: boolean; archived_by_creator?: boolean; company_id?: string; created_at?: string; creator_id?: string; id?: string }
        Relationships: [
          { foreignKeyName: "conversations_company_id_fkey"; columns: ["company_id"]; isOneToOne: false; referencedRelation: "company_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "conversations_creator_id_fkey"; columns: ["creator_id"]; isOneToOne: false; referencedRelation: "creator_profiles"; referencedColumns: ["id"] },
        ]
      }
      creator_languages: {
        Row: { creator_id: string; language_id: string; proficiency: Database["public"]["Enums"]["language_proficiency"] }
        Insert: { creator_id: string; language_id: string; proficiency: Database["public"]["Enums"]["language_proficiency"] }
        Update: { creator_id?: string; language_id?: string; proficiency?: Database["public"]["Enums"]["language_proficiency"] }
        Relationships: [
          { foreignKeyName: "creator_languages_creator_id_fkey"; columns: ["creator_id"]; isOneToOne: false; referencedRelation: "creator_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "creator_languages_language_id_fkey"; columns: ["language_id"]; isOneToOne: false; referencedRelation: "languages"; referencedColumns: ["id"] },
        ]
      }
      creator_niches: {
        Row: { creator_id: string; niche_id: string }
        Insert: { creator_id: string; niche_id: string }
        Update: { creator_id?: string; niche_id?: string }
        Relationships: [
          { foreignKeyName: "creator_niches_creator_id_fkey"; columns: ["creator_id"]; isOneToOne: false; referencedRelation: "creator_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "creator_niches_niche_id_fkey"; columns: ["niche_id"]; isOneToOne: false; referencedRelation: "niches"; referencedColumns: ["id"] },
        ]
      }
      creator_profiles: {
        Row: { bio: string | null; city: string | null; country: string; created_at: string; display_name: string; id: string; is_available: boolean; photo_url: string | null; prefecture: string | null; status: Database["public"]["Enums"]["account_status"]; updated_at: string }
        Insert: { bio?: string | null; city?: string | null; country: string; created_at?: string; display_name: string; id: string; is_available?: boolean; photo_url?: string | null; prefecture?: string | null; status?: Database["public"]["Enums"]["account_status"]; updated_at?: string }
        Update: { bio?: string | null; city?: string | null; country?: string; created_at?: string; display_name?: string; id?: string; is_available?: boolean; photo_url?: string | null; prefecture?: string | null; status?: Database["public"]["Enums"]["account_status"]; updated_at?: string }
        Relationships: [
          { foreignKeyName: "creator_profiles_id_fkey"; columns: ["id"]; isOneToOne: true; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      creator_services: {
        Row: { created_at: string; creator_id: string; id: string; rate_amount_jpy: number; rate_type: Database["public"]["Enums"]["rate_type"]; service_id: string; updated_at: string }
        Insert: { created_at?: string; creator_id: string; id?: string; rate_amount_jpy: number; rate_type: Database["public"]["Enums"]["rate_type"]; service_id: string; updated_at?: string }
        Update: { created_at?: string; creator_id?: string; id?: string; rate_amount_jpy?: number; rate_type?: Database["public"]["Enums"]["rate_type"]; service_id?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: "creator_services_creator_id_fkey"; columns: ["creator_id"]; isOneToOne: false; referencedRelation: "creator_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "creator_services_service_id_fkey"; columns: ["service_id"]; isOneToOne: false; referencedRelation: "services"; referencedColumns: ["id"] },
        ]
      }
      languages: {
        Row: { id: string; is_active: boolean; name: string }
        Insert: { id?: string; is_active?: boolean; name: string }
        Update: { id?: string; is_active?: boolean; name?: string }
        Relationships: []
      }
      messages: {
        Row: { content: string; conversation_id: string; created_at: string; id: string; read_at: string | null; sender_id: string }
        Insert: { content: string; conversation_id: string; created_at?: string; id?: string; read_at?: string | null; sender_id: string }
        Update: { content?: string; conversation_id?: string; created_at?: string; id?: string; read_at?: string | null; sender_id?: string }
        Relationships: [
          { foreignKeyName: "messages_conversation_id_fkey"; columns: ["conversation_id"]; isOneToOne: false; referencedRelation: "conversations"; referencedColumns: ["id"] },
          { foreignKeyName: "messages_sender_id_fkey"; columns: ["sender_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      niches: {
        Row: { id: string; is_active: boolean; name: string }
        Insert: { id?: string; is_active?: boolean; name: string }
        Update: { id?: string; is_active?: boolean; name?: string }
        Relationships: []
      }
      notifications: {
        Row: { created_at: string; id: string; payload: Json | null; read_at: string | null; type: Database["public"]["Enums"]["notification_type"]; user_id: string }
        Insert: { created_at?: string; id?: string; payload?: Json | null; read_at?: string | null; type: Database["public"]["Enums"]["notification_type"]; user_id: string }
        Update: { created_at?: string; id?: string; payload?: Json | null; read_at?: string | null; type?: Database["public"]["Enums"]["notification_type"]; user_id?: string }
        Relationships: [
          { foreignKeyName: "notifications_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      portfolio_items: {
        Row: { content_type: string | null; created_at: string; creator_id: string; description: string | null; id: string; media_type: string; media_url: string; title: string | null }
        Insert: { content_type?: string | null; created_at?: string; creator_id: string; description?: string | null; id?: string; media_type: string; media_url: string; title?: string | null }
        Update: { content_type?: string | null; created_at?: string; creator_id?: string; description?: string | null; id?: string; media_type?: string; media_url?: string; title?: string | null }
        Relationships: [
          { foreignKeyName: "portfolio_items_creator_id_fkey"; columns: ["creator_id"]; isOneToOne: false; referencedRelation: "creator_profiles"; referencedColumns: ["id"] },
        ]
      }
      profiles: {
        Row: { created_at: string; id: string; role: Database["public"]["Enums"]["user_role"] }
        Insert: { created_at?: string; id: string; role: Database["public"]["Enums"]["user_role"] }
        Update: { created_at?: string; id?: string; role?: Database["public"]["Enums"]["user_role"] }
        Relationships: []
      }
      reports: {
        Row: { created_at: string; details: string | null; id: string; reason: Database["public"]["Enums"]["report_reason"]; reporter_id: string; resolution: Database["public"]["Enums"]["report_resolution"] | null; resolved_at: string | null; resolved_by: string | null; status: Database["public"]["Enums"]["report_status"]; target_company_id: string | null; target_conversation_id: string | null; target_creator_id: string | null }
        Insert: { created_at?: string; details?: string | null; id?: string; reason: Database["public"]["Enums"]["report_reason"]; reporter_id: string; resolution?: Database["public"]["Enums"]["report_resolution"] | null; resolved_at?: string | null; resolved_by?: string | null; status?: Database["public"]["Enums"]["report_status"]; target_company_id?: string | null; target_conversation_id?: string | null; target_creator_id?: string | null }
        Update: { created_at?: string; details?: string | null; id?: string; reason?: Database["public"]["Enums"]["report_reason"]; reporter_id?: string; resolution?: Database["public"]["Enums"]["report_resolution"] | null; resolved_at?: string | null; resolved_by?: string | null; status?: Database["public"]["Enums"]["report_status"]; target_company_id?: string | null; target_conversation_id?: string | null; target_creator_id?: string | null }
        Relationships: [
          { foreignKeyName: "reports_reporter_id_fkey"; columns: ["reporter_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "reports_resolved_by_fkey"; columns: ["resolved_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "reports_target_company_id_fkey"; columns: ["target_company_id"]; isOneToOne: false; referencedRelation: "company_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "reports_target_conversation_id_fkey"; columns: ["target_conversation_id"]; isOneToOne: false; referencedRelation: "conversations"; referencedColumns: ["id"] },
          { foreignKeyName: "reports_target_creator_id_fkey"; columns: ["target_creator_id"]; isOneToOne: false; referencedRelation: "creator_profiles"; referencedColumns: ["id"] },
        ]
      }
      saved_creators: {
        Row: { company_id: string; created_at: string; creator_id: string }
        Insert: { company_id: string; created_at?: string; creator_id: string }
        Update: { company_id?: string; created_at?: string; creator_id?: string }
        Relationships: [
          { foreignKeyName: "saved_creators_company_id_fkey"; columns: ["company_id"]; isOneToOne: false; referencedRelation: "company_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "saved_creators_creator_id_fkey"; columns: ["creator_id"]; isOneToOne: false; referencedRelation: "creator_profiles"; referencedColumns: ["id"] },
        ]
      }
      services: {
        Row: { id: string; is_active: boolean; name: string }
        Insert: { id?: string; is_active?: boolean; name: string }
        Update: { id?: string; is_active?: boolean; name?: string }
        Relationships: []
      }
      social_accounts: {
        Row: { created_at: string; creator_id: string; follower_count: number | null; handle: string; id: string; platform: string; profile_url: string | null }
        Insert: { created_at?: string; creator_id: string; follower_count?: number | null; handle: string; id?: string; platform: string; profile_url?: string | null }
        Update: { created_at?: string; creator_id?: string; follower_count?: number | null; handle?: string; id?: string; platform?: string; profile_url?: string | null }
        Relationships: [
          { foreignKeyName: "social_accounts_creator_id_fkey"; columns: ["creator_id"]; isOneToOne: false; referencedRelation: "creator_profiles"; referencedColumns: ["id"] },
        ]
      }
      subscription_tiers: {
        Row: { conversation_quota: number; id: string; is_active: boolean; monthly_price_jpy: number; name: string }
        Insert: { conversation_quota: number; id?: string; is_active?: boolean; monthly_price_jpy: number; name: string }
        Update: { conversation_quota?: number; id?: string; is_active?: boolean; monthly_price_jpy?: number; name?: string }
        Relationships: []
      }
      subscriptions: {
        Row: { company_id: string; created_at: string; current_period_end: string; current_period_start: string; id: string; status: Database["public"]["Enums"]["subscription_status"]; stripe_subscription_id: string | null; tier_id: string }
        Insert: { company_id: string; created_at?: string; current_period_end: string; current_period_start: string; id?: string; status?: Database["public"]["Enums"]["subscription_status"]; stripe_subscription_id?: string | null; tier_id: string }
        Update: { company_id?: string; created_at?: string; current_period_end?: string; current_period_start?: string; id?: string; status?: Database["public"]["Enums"]["subscription_status"]; stripe_subscription_id?: string | null; tier_id?: string }
        Relationships: [
          { foreignKeyName: "subscriptions_company_id_fkey"; columns: ["company_id"]; isOneToOne: false; referencedRelation: "company_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "subscriptions_tier_id_fkey"; columns: ["tier_id"]; isOneToOne: false; referencedRelation: "subscription_tiers"; referencedColumns: ["id"] },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      my_conversation_usage: {
        Args: never
        Returns: { period_end: string; quota: number; tier_name: string; used: number }[]
      }
      start_conversation: {
        Args: { p_creator_id: string; p_message: string }
        Returns: string
      }
    }
    Enums: {
      account_status: "active" | "paused" | "deleted"
      admin_action_type:
        | "profile_paused"
        | "profile_unpublished"
        | "account_banned"
        | "subscription_granted"
        | "subscription_extended"
        | "subscription_canceled"
        | "subscription_tier_changed"
        | "category_created"
        | "category_updated"
        | "category_removed"
      language_proficiency: "native" | "fluent" | "conversational"
      notification_type: "new_message" | "report_outcome"
      rate_type: "flat" | "starting_from"
      report_reason: "fake_profile" | "spam" | "inappropriate_content" | "harassment" | "no_response" | "other"
      report_resolution: "dismissed" | "paused" | "banned"
      report_status: "pending" | "resolved"
      subscription_status: "active" | "canceled" | "expired"
      user_role: "creator" | "company" | "admin"
    }
    CompositeTypes: { [_ in never]: never }
  }
}
