/**
 * Barrel exports para feature de pacientes
 * Centraliza todos os exports públicos da feature
 */

// Hooks
export * from './hooks/usePatients';

// Services
export * from './services/patients.service';

// Types (re-export para conveniência)
export type { Patient, PatientStats } from './services/patients.service';
export type {
  PatientCreateInput,
  PatientUpdateInput,
  PatientsSearchInput
} from '@/shared/schemas/validation.schemas';