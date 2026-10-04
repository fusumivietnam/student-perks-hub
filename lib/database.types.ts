export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_memberships: {
        Row: { created_at: string; role: string; user_id: string }
        Insert: { created_at?: string; role?: string; user_id: string }
        Update: { created_at?: string; role?: string; user_id?: string }
        Relationships: []
      }
      bookmarks: {
        Row: { created_at: string; offer_id: string; user_id: string }
        Insert: { created_at?: string; offer_id: string; user_id: string }
        Update: { created_at?: string; offer_id?: string; user_id?: string }
        Relationships: [{ foreignKeyName: "bookmarks_offer_id_fkey"; columns: ["offer_id"]; isOneToOne: false; referencedRelation: "offers"; referencedColumns: ["id"] }]
      }
      categories: {
        Row: { created_at: string; description: string | null; icon: string | null; id: string; name: string; slug: string; sort_order: number }
        Insert: { created_at?: string; description?: string | null; icon?: string | null; id?: string; name: string; slug: string; sort_order?: number }
        Update: { created_at?: string; description?: string | null; icon?: string | null; id?: string; name?: string; slug?: string; sort_order?: number }
        Relationships: []
      }
      offers: {
        Row: { audience: string[]; benefit_text: string | null; benefit_type: string; category_id: string | null; created_at: string; description: string | null; eligibility: string | null; how_to_claim: string | null; id: string; is_featured: boolean; last_verified_at: string | null; logo_url: string | null; official_url: string; provider: string; published_at: string | null; slug: string; status: string; summary: string; tags: string[]; title: string; updated_at: string; view_count: number }
        Insert: { audience?: string[]; benefit_text?: string | null; benefit_type: string; category_id?: string | null; created_at?: string; description?: string | null; eligibility?: string | null; how_to_claim?: string | null; id?: string; is_featured?: boolean; last_verified_at?: string | null; logo_url?: string | null; official_url: string; provider: string; published_at?: string | null; slug: string; status?: string; summary: string; tags?: string[]; title: string; updated_at?: string; view_count?: number }
        Update: { audience?: string[]; benefit_text?: string | null; benefit_type?: string; category_id?: string | null; created_at?: string; description?: string | null; eligibility?: string | null; how_to_claim?: string | null; id?: string; is_featured?: boolean; last_verified_at?: string | null; logo_url?: string | null; official_url?: string; provider?: string; published_at?: string | null; slug?: string; status?: string; summary?: string; tags?: string[]; title?: string; updated_at?: string; view_count?: number }
        Relationships: [{ foreignKeyName: "offers_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] }]
      }
      profiles: {
        Row: { avatar_url: string | null; created_at: string; display_name: string | null; id: string; updated_at: string }
        Insert: { avatar_url?: string | null; created_at?: string; display_name?: string | null; id: string; updated_at?: string }
        Update: { avatar_url?: string | null; created_at?: string; display_name?: string | null; id?: string; updated_at?: string }
        Relationships: []
      }
      submissions: {
        Row: { created_at: string; description: string | null; id: string; official_url: string; provider: string; reviewed_at: string | null; reviewed_by: string | null; status: string; submitter_note: string | null; submitter_user_id: string | null; title: string }
        Insert: { created_at?: string; description?: string | null; id?: string; official_url: string; provider: string; reviewed_at?: string | null; reviewed_by?: string | null; status?: string; submitter_note?: string | null; submitter_user_id?: string | null; title: string }
        Update: { created_at?: string; description?: string | null; id?: string; official_url?: string; provider?: string; reviewed_at?: string | null; reviewed_by?: string | null; status?: string; submitter_note?: string | null; submitter_user_id?: string | null; title?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R } ? R : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R } ? R : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I } ? I : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I } ? I : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U } ? U : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U } ? U : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
