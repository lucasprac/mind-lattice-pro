/**
 * Entidades do domínio baseadas no schema real do banco
 * Corrige inconsistências identificadas na auditoria
 */

import type { Database } from '@/integrations/supabase/types';
import type { BaseEntity, BaseTherapistEntity, BasePatientEntity } from './base';

// === PATIENT ENTITIES ===

// Patient (tabela patients)
export interface Patient extends BaseTherapistEntity {
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'discharged' | null;
}

export type PatientInsert = Database['public']['Tables']['patients']['Insert'];
export type PatientUpdate = Database['public']['Tables']['patients']['Update'];

// Patient Assessment (tabela patient_assessments)
export interface PatientAssessment extends BasePatientEntity {
  assessment_date: string;
  assessment_type: string;
  results: Record<string, unknown> | null;
  notes: string | null;
}

export type PatientAssessmentInsert = Database['public']['Tables']['patient_assessments']['Insert'];
export type PatientAssessmentUpdate = Database['public']['Tables']['patient_assessments']['Update'];

// Patient Functional Analysis (tabela patient_functional_analysis)
export interface PatientFunctionalAnalysis extends BasePatientEntity {
  analysis_date: string;
  target_behavior: string;
  antecedents: string | null;
  consequences: string | null;
  function_hypothesis: string | null;
  intervention_plan: string | null;
}

export type PatientFunctionalAnalysisInsert = Database['public']['Tables']['patient_functional_analysis']['Insert'];
export type PatientFunctionalAnalysisUpdate = Database['public']['Tables']['patient_functional_analysis']['Update'];

// Patient Mediators (tabela patient_mediators)
export interface PatientMediator extends BasePatientEntity {
  mediator_type: string;
  description: string;
  strength: number | null;
  notes: string | null;
}

export type PatientMediatorInsert = Database['public']['Tables']['patient_mediators']['Insert'];
export type PatientMediatorUpdate = Database['public']['Tables']['patient_mediators']['Update'];

// Patient Networks (tabela patient_networks)
export interface PatientNetwork extends BasePatientEntity {
  network_data: Record<string, unknown> | null;
  analysis_date: string;
  notes: string | null;
}

export type PatientNetworkInsert = Database['public']['Tables']['patient_networks']['Insert'];
export type PatientNetworkUpdate = Database['public']['Tables']['patient_networks']['Update'];

// === SESSION & RECORDS ===

// Records/Sessions (tabela records)
export interface Record extends BasePatientEntity {
  session_date: string;
  session_type: string | null;
  duration: number | null;
  notes: string | null;
  mood_before: number | null;
  mood_after: number | null;
  goals: string | null;
  homework: string | null;
}

export type RecordInsert = Database['public']['Tables']['records']['Insert'];
export type RecordUpdate = Database['public']['Tables']['records']['Update'];

// Appointments (tabela appointments)
export interface Appointment extends BaseTherapistEntity {
  patient_id: string | null;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  appointment_type: string | null;
  notes: string | null;
  recurrence_rule: string | null;
  recurrence_group_id: string | null;
}

export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

// === EEMM FRAMEWORK ===

// EEMM Processes (tabela eemm_processes)
export interface EEMMProcess extends BaseTherapistEntity {
  patient_id: string | null;
  dimension: 'afeto' | 'cognicao' | 'atencao' | 'self' | 'motivacao' | 'comportamento';
  evolutionary_process: 'variacao' | 'selecao' | 'retencao';
  analysis_level: 'biofisiologico' | 'sociocultural' | 'psicologico';
  process_name: string;
  intensity: number | null;
  evidence: string | null;
  intervention: string | null;
  status: 'active' | 'inactive' | 'completed' | null;
  process_context: 'matrix' | 'assessment' | 'intervention' | null;
}

export type EEMMProcessInsert = Database['public']['Tables']['eemm_processes']['Insert'];
export type EEMMProcessUpdate = Database['public']['Tables']['eemm_processes']['Update'];

// Roadmap Processes (tabela roadmap_processes)
export interface RoadmapProcess extends BasePatientEntity {
  process_name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: 'planned' | 'active' | 'completed' | 'paused' | null;
  priority: 'low' | 'medium' | 'high' | null;
  progress_percentage: number | null;
  notes: string | null;
}

export type RoadmapProcessInsert = Database['public']['Tables']['roadmap_processes']['Insert'];
export type RoadmapProcessUpdate = Database['public']['Tables']['roadmap_processes']['Update'];

// === NETWORK CANVAS TYPES ===
// (Para o componente OptimizedNetworkCanvas)

export type MarkerType = 'arrow' | 'line' | 'circle';
export type ConnectionType = 'maladaptive' | 'unchanged' | 'adaptive';

export interface ProcessNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  session_id?: string;
  created_in_session?: string;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  type: ConnectionType;
  strength: number;
  ambivalent: boolean;
  startMarker: MarkerType;
  endMarker: MarkerType;
  session_id?: string;
  created_in_session?: string;
}

export interface NetworkCanvasData {
  nodes: ProcessNode[];
  connections: Connection[];
}

// === AGGREGATE TYPES ===
// Para operações que envolvem múltiplas entidades

export interface PatientWithRelations extends Patient {
  records?: Record[];
  assessments?: PatientAssessment[];
  networks?: PatientNetwork[];
  mediators?: PatientMediator[];
  functional_analyses?: PatientFunctionalAnalysis[];
  appointments?: Appointment[];
  eemm_processes?: EEMMProcess[];
  roadmap_processes?: RoadmapProcess[];
}

export interface SessionData {
  record: Record;
  assessments: PatientAssessment[];
  network: PatientNetwork | null;
  mediators: PatientMediator[];
  functional_analysis: PatientFunctionalAnalysis | null;
  eemm_processes: EEMMProcess[];
}

// === VALIDATION SCHEMAS ===
// Para uso com Zod (será implementado posteriormente)

export interface ValidationSchema<T> {
  create: unknown; // ZodSchema<T>
  update: unknown; // ZodSchema<Partial<T>>
}
