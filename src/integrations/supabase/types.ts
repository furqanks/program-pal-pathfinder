export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_insights: {
        Row: {
          confidence_score: number | null
          content: string
          created_at: string
          expires_at: string | null
          id: string
          insight_type: string
          is_active: boolean | null
          related_notes: string[] | null
          related_programs: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type: string
          is_active?: boolean | null
          related_notes?: string[] | null
          related_programs?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_active?: boolean | null
          related_notes?: string[] | null
          related_programs?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_notes: {
        Row: {
          ai_categories: Json | null
          ai_insights: Json | null
          ai_summary: string | null
          attachments: Json | null
          content: string
          context_type: string | null
          created_at: string
          folder_id: string | null
          id: string
          is_archived: boolean | null
          is_pinned: boolean | null
          last_ai_analysis: string | null
          last_viewed_at: string | null
          priority_score: number | null
          program_id: string | null
          rich_content: Json | null
          shared_with: string[] | null
          tags: Json | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          ai_categories?: Json | null
          ai_insights?: Json | null
          ai_summary?: string | null
          attachments?: Json | null
          content: string
          context_type?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          last_ai_analysis?: string | null
          last_viewed_at?: string | null
          priority_score?: number | null
          program_id?: string | null
          rich_content?: Json | null
          shared_with?: string[] | null
          tags?: Json | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          ai_categories?: Json | null
          ai_insights?: Json | null
          ai_summary?: string | null
          attachments?: Json | null
          content?: string
          context_type?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          last_ai_analysis?: string | null
          last_viewed_at?: string | null
          priority_score?: number | null
          program_id?: string | null
          rich_content?: Json | null
          shared_with?: string[] | null
          tags?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_notes_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs_saved"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_note_folder"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      note_collaborations: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_by: string | null
          note_id: string
          permission: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_by?: string | null
          note_id: string
          permission: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_by?: string | null
          note_id?: string
          permission?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_collaborations_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "ai_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_folders: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      note_templates: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_content: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_content: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_content?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programs_saved: {
        Row: {
          country: string
          created_at: string
          custom_tags: string[] | null
          deadline: string | null
          degree_type: string
          id: string
          notes: string | null
          program_name: string
          status_tag: string | null
          tuition: string | null
          university: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country: string
          created_at?: string
          custom_tags?: string[] | null
          deadline?: string | null
          degree_type: string
          id?: string
          notes?: string | null
          program_name: string
          status_tag?: string | null
          tuition?: string | null
          university: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string
          created_at?: string
          custom_tags?: string[] | null
          deadline?: string | null
          degree_type?: string
          id?: string
          notes?: string | null
          program_name?: string
          status_tag?: string | null
          tuition?: string | null
          university?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      smart_reminders: {
        Row: {
          ai_generated: boolean | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          priority: number | null
          program_id: string | null
          reminder_type: string
          title: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: number | null
          program_id?: string | null
          reminder_type: string
          title: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: number | null
          program_id?: string | null
          reminder_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_reminders_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs_saved"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          created_at: string
          document_type: string
          feedback_summary: string | null
          file_name: string | null
          id: string
          improvement_points: string[] | null
          original_text: string
          program_id: string | null
          quoted_improvements: Json | null
          score: number | null
          user_id: string
          version_number: number
        }
        Insert: {
          created_at?: string
          document_type: string
          feedback_summary?: string | null
          file_name?: string | null
          id?: string
          improvement_points?: string[] | null
          original_text: string
          program_id?: string | null
          quoted_improvements?: Json | null
          score?: number | null
          user_id: string
          version_number: number
        }
        Update: {
          created_at?: string
          document_type?: string
          feedback_summary?: string | null
          file_name?: string | null
          id?: string
          improvement_points?: string[] | null
          original_text?: string
          program_id?: string | null
          quoted_improvements?: Json | null
          score?: number | null
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs_saved"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_note: {
        Args: { note_id: string; user_id: string }
        Returns: boolean
      }
      get_next_version_number: {
        Args: {
          p_user_id: string
          p_document_type: string
          p_program_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
