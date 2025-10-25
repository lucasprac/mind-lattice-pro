/**
 * Tipos base compartilhados para todo o sistema
 * Implementa clean architecture com tipagem forte
 */

// Base Entity Interface
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Base Entity with Therapist (todas as entidades pertencem a um terapeuta)
export interface BaseTherapistEntity extends BaseEntity {
  therapist_id: string;
}

// Base Entity with Patient (entidades relacionadas a pacientes)
export interface BasePatientEntity extends BaseTherapistEntity {
  patient_id: string;
}

// Service Response Pattern
export interface ServiceResponse<T> {
  data?: T;
  error?: ServiceError;
  success: boolean;
}

// Padronização de erros
export interface ServiceError {
  message: string;
  code: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

// CRUD Operations Generic Types
export interface CRUDOperations<T, CreateData, UpdateData> {
  getAll(): Promise<ServiceResponse<T[]>>;
  getById(id: string): Promise<ServiceResponse<T | null>>;
  create(data: CreateData): Promise<ServiceResponse<T>>;
  update(id: string, data: UpdateData): Promise<ServiceResponse<T>>;
  delete(id: string): Promise<ServiceResponse<boolean>>;
}

// Query Options
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

// Pagination Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Status Types (padronizados)
export type EntityStatus = 'active' | 'inactive' | 'archived';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type ProcessStatus = 'planned' | 'active' | 'completed' | 'paused';
export type Priority = 'low' | 'medium' | 'high';

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  isValidating?: boolean;
}

// Form States
export interface FormState<T> extends LoadingState {
  data: T;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

// Database Types Aliases (mapped from Supabase)
export type DatabaseRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type DatabaseInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type DatabaseUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

// Re-export Database from types
export type { Database } from '@/integrations/supabase/types';
