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
      functional_analysis: {
        Row: {
          biofisiologico_retention: string | null
          biofisiologico_selection: string | null
          biofisiologico_variation: string | null
          created_at: string
          dimension: string
          id: string
          patient_id: string
          process_name: string
          retention_analysis: string | null
          selection_analysis: string | null
          sociocultural_retention: string | null
          sociocultural_selection: string | null
          sociocultural_variation: string | null
          therapist_id: string
          updated_at: string
          variation_analysis: string | null
        }
        Insert: {
          biofisiologico_retention?: string | null
          biofisiologico_selection?: string | null
          biofisiologico_variation?: string | null
          created_at?: string
          dimension: string
          id?: string
          patient_id: string
          process_name: string
          retention_analysis?: string | null
          selection_analysis?: string | null
          sociocultural_retention?: string | null
          sociocultural_selection?: string | null
          sociocultural_variation?: string | null
          therapist_id: string
          updated_at?: string
          variation_analysis?: string | null
        }
        Update: {
          biofisiologico_retention?: string | null
          biofisiologico_selection?: string | null
          biofisiologico_variation?: string | null
          created_at?: string
          dimension?: string
          id?: string
          patient_id?: string
          process_name?: string
          retention_analysis?: string | null
          selection_analysis?: string | null
          sociocultural_retention?: string | null
          sociocultural_selection?: string | null
          sociocultural_variation?: string | null
          therapist_id?: string
          updated_at?: string
          variation_analysis?: string | null
        }
        Relationships: []
      }
      interventions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          notes: string | null
          patient_id: string
          start_date: string | null
          status: string | null
          target_process: string | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          patient_id: string
          start_date?: string | null
          status?: string | null
          target_process?: string | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          patient_id?: string
          start_date?: string | null
          status?: string | null
          target_process?: string | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      networks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          network_data: Json
          patient_id: string
          therapist_id: string
          updated_at: string
          version: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          network_data?: Json
          patient_id: string
          therapist_id: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          network_data?: Json
          patient_id?: string
          therapist_id?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "networks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "networks_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_assessments: {
        Row: {
          assessment_date: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          q1: number | null
          q10: number | null
          q11: number | null
          q12: number | null
          q13: number | null
          q14: number | null
          q15: number | null
          q16: number | null
          q17: number | null
          q18: number | null
          q19: number | null
          q2: number | null
          q20: number | null
          q21: number | null
          q22: number | null
          q23: number | null
          q24: number | null
          q25: number | null
          q26: number | null
          q27: number | null
          q28: number | null
          q29: string | null
          q3: number | null
          q30: number | null
          q31: number | null
          q32: number | null
          q33: number | null
          q34: number | null
          q4: number | null
          q5: number | null
          q6: number | null
          q7: number | null
          q8: number | null
          q9: number | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          assessment_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          q1?: number | null
          q10?: number | null
          q11?: number | null
          q12?: number | null
          q13?: number | null
          q14?: number | null
          q15?: number | null
          q16?: number | null
          q17?: number | null
          q18?: number | null
          q19?: number | null
          q2?: number | null
          q20?: number | null
          q21?: number | null
          q22?: number | null
          q23?: number | null
          q24?: number | null
          q25?: number | null
          q26?: number | null
          q27?: number | null
          q28?: number | null
          q29?: string | null
          q3?: number | null
          q30?: number | null
          q31?: number | null
          q32?: number | null
          q33?: number | null
          q34?: number | null
          q4?: number | null
          q5?: number | null
          q6?: number | null
          q7?: number | null
          q8?: number | null
          q9?: number | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          assessment_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          q1?: number | null
          q10?: number | null
          q11?: number | null
          q12?: number | null
          q13?: number | null
          q14?: number | null
          q15?: number | null
          q16?: number | null
          q17?: number | null
          q18?: number | null
          q19?: number | null
          q2?: number | null
          q20?: number | null
          q21?: number | null
          q22?: number | null
          q23?: number | null
          q24?: number | null
          q25?: number | null
          q26?: number | null
          q27?: number | null
          q28?: number | null
          q29?: string | null
          q3?: number | null
          q30?: number | null
          q31?: number | null
          q32?: number | null
          q33?: number | null
          q34?: number | null
          q4?: number | null
          q5?: number | null
          q6?: number | null
          q7?: number | null
          q8?: number | null
          q9?: number | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_mediators: {
        Row: {
          created_at: string
          dimension: string
          id: string
          mediator: string
          patient_id: string
          processes: string[]
          therapist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dimension: string
          id?: string
          mediator: string
          patient_id: string
          processes?: string[]
          therapist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dimension?: string
          id?: string
          mediator?: string
          patient_id?: string
          processes?: string[]
          therapist_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          status: string | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          specialty: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      records: {
        Row: {
          created_at: string
          description: string
          id: string
          keywords: string[] | null
          observations: string | null
          patient_id: string
          session_date: string
          session_number: number | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          keywords?: string[] | null
          observations?: string | null
          patient_id: string
          session_date?: string
          session_number?: number | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          keywords?: string[] | null
          observations?: string | null
          patient_id?: string
          session_date?: string
          session_number?: number | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
