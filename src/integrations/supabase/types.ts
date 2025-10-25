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
      appointments: {
        Row: {
          id: string
          therapist_id: string
          patient_id: string | null
          title: string
          description: string | null
          start_datetime: string
          end_datetime: string
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          appointment_type: string | null
          notes: string | null
          recurrence_rule: string | null
          recurrence_group_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          patient_id?: string | null
          title: string
          description?: string | null
          start_datetime: string
          end_datetime: string
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          appointment_type?: string | null
          notes?: string | null
          recurrence_rule?: string | null
          recurrence_group_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          therapist_id?: string
          patient_id?: string | null
          title?: string
          description?: string | null
          start_datetime?: string
          end_datetime?: string
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          appointment_type?: string | null
          notes?: string | null
          recurrence_rule?: string | null
          recurrence_group_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      eemm_processes: {
        Row: {
          id: string
          therapist_id: string
          patient_id: string | null
          dimension: 'afeto' | 'cognicao' | 'atencao' | 'self' | 'motivacao' | 'comportamento'
          evolutionary_process: 'variacao' | 'selecao' | 'retencao'
          analysis_level: 'biofisiologico' | 'sociocultural' | 'psicologico'
          process_name: string
          intensity: number | null
          evidence: string | null
          intervention: string | null
          status: 'active' | 'inactive' | 'completed' | null
          process_context: 'matrix' | 'assessment' | 'intervention' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          patient_id?: string | null
          dimension: 'afeto' | 'cognicao' | 'atencao' | 'self' | 'motivacao' | 'comportamento'
          evolutionary_process: 'variacao' | 'selecao' | 'retencao'
          analysis_level?: 'biofisiologico' | 'sociocultural' | 'psicologico'
          process_name: string
          intensity?: number | null
          evidence?: string | null
          intervention?: string | null
          status?: 'active' | 'inactive' | 'completed' | null
          process_context?: 'matrix' | 'assessment' | 'intervention' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          therapist_id?: string
          patient_id?: string | null
          dimension?: 'afeto' | 'cognicao' | 'atencao' | 'self' | 'motivacao' | 'comportamento'
          evolutionary_process?: 'variacao' | 'selecao' | 'retencao'
          analysis_level?: 'biofisiologico' | 'sociocultural' | 'psicologico'
          process_name?: string
          intensity?: number | null
          evidence?: string | null
          intervention?: string | null
          status?: 'active' | 'inactive' | 'completed' | null
          process_context?: 'matrix' | 'assessment' | 'intervention' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eemm_processes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eemm_processes_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      patients: {
        Row: {
          id: string
          therapist_id: string
          full_name: string
          email: string | null
          phone: string | null
          birth_date: string | null
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          status: 'active' | 'inactive' | 'discharged' | null
          notes: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          full_name: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          status?: 'active' | 'inactive' | 'discharged' | null
          notes?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          therapist_id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          status?: 'active' | 'inactive' | 'discharged' | null
          notes?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_assessments: {
        Row: {
          id: string
          patient_id: string
          therapist_id: string
          assessment_date: string
          assessment_type: string
          results: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          therapist_id: string
          assessment_date: string
          assessment_type: string
          results?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          therapist_id?: string
          assessment_date?: string
          assessment_type?: string
          results?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_assessments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_functional_analysis: {
        Row: {
          id: string
          patient_id: string
          therapist_id: string
          analysis_date: string
          target_behavior: string
          antecedents: string | null
          consequences: string | null
          function_hypothesis: string | null
          intervention_plan: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          therapist_id: string
          analysis_date: string
          target_behavior: string
          antecedents?: string | null
          consequences?: string | null
          function_hypothesis?: string | null
          intervention_plan?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          therapist_id?: string
          analysis_date?: string
          target_behavior?: string
          antecedents?: string | null
          consequences?: string | null
          function_hypothesis?: string | null
          intervention_plan?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_functional_analysis_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_functional_analysis_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_mediators: {
        Row: {
          id: string
          patient_id: string
          therapist_id: string
          mediator_type: string
          description: string
          strength: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          therapist_id: string
          mediator_type: string
          description: string
          strength?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          therapist_id?: string
          mediator_type?: string
          description?: string
          strength?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_mediators_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_mediators_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_networks: {
        Row: {
          id: string
          patient_id: string
          therapist_id: string
          network_data: Json | null
          analysis_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          therapist_id: string
          network_data?: Json | null
          analysis_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          therapist_id?: string
          network_data?: Json | null
          analysis_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_networks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_networks_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      records: {
        Row: {
          id: string
          patient_id: string
          therapist_id: string
          session_date: string
          session_type: string | null
          duration: number | null
          notes: string | null
          mood_before: number | null
          mood_after: number | null
          goals: string | null
          homework: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          therapist_id: string
          session_date: string
          session_type?: string | null
          duration?: number | null
          notes?: string | null
          mood_before?: number | null
          mood_after?: number | null
          goals?: string | null
          homework?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          therapist_id?: string
          session_date?: string
          session_type?: string | null
          duration?: number | null
          notes?: string | null
          mood_before?: number | null
          mood_after?: number | null
          goals?: string | null
          homework?: string | null
          created_at?: string
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      roadmap_processes: {
        Row: {
          id: string
          patient_id: string
          therapist_id: string
          process_name: string
          description: string | null
          start_date: string
          end_date: string | null
          status: 'planned' | 'active' | 'completed' | 'paused' | null
          priority: 'low' | 'medium' | 'high' | null
          progress_percentage: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          therapist_id: string
          process_name: string
          description?: string | null
          start_date: string
          end_date?: string | null
          status?: 'planned' | 'active' | 'completed' | 'paused' | null
          priority?: 'low' | 'medium' | 'high' | null
          progress_percentage?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          therapist_id?: string
          process_name?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          status?: 'planned' | 'active' | 'completed' | 'paused' | null
          priority?: 'low' | 'medium' | 'high' | null
          progress_percentage?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_processes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_processes_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never