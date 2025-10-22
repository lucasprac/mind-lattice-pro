export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "13.0.5" }
  public: {
    Tables: {
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
          analysis_level: 'biofisiologico' | 'sociocultural' | 'psicologico'
          process_name: string
          intensity?: number | null
          evidence?: string | null
          intervention?: string | null
          status?: 'active' | 'inactive' | 'completed' | null
          process_context?: 'matrix' | 'assessment' | 'intervention' | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['eemm_processes']['Insert']>
        Relationships: []
      }
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
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string, created_at?: string, updated_at?: string }
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
        Relationships: []
      }
      // ... keep existing tables from previous file
    }
    Views: { [key: string]: never }
    Functions: { [key: string]: never }
    Enums: { [key: string]: never }
    CompositeTypes: { [key: string]: never }
  }
}
