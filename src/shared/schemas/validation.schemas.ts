/**
 * Schemas de validação usando Zod
 * Centraliza todas as regras de validação de dados da aplicação
 */

import { z } from 'zod';
import {
  PATIENT_STATUS,
  APPOINTMENT_STATUS,
  EEMM_DIMENSIONS,
  EVOLUTIONARY_PROCESSES,
  ANALYSIS_LEVELS,
  PROCESS_STATUS,
  PROCESS_CONTEXTS,
  INTENSITY_LIMITS,
  VALIDATION_RULES
} from '../constants/app.constants';

// Schema base para campos comuns
const baseSchema = {
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
};

// Schema para autenticação
export const authSchema = {
  signIn: z.object({
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Email inválido')
      .regex(VALIDATION_RULES.EMAIL_REGEX, 'Formato de email inválido'),
    password: z
      .string()
      .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, `Senha deve ter pelo menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`)
  }),

  signUp: z.object({
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Email inválido')
      .regex(VALIDATION_RULES.EMAIL_REGEX, 'Formato de email inválido'),
    password: z
      .string()
      .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, `Senha deve ter pelo menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword']
  })
};

// Schema para pacientes
export const patientSchema = {
  create: z.object({
    full_name: z
      .string()
      .min(VALIDATION_RULES.NAME_MIN_LENGTH, `Nome deve ter pelo menos ${VALIDATION_RULES.NAME_MIN_LENGTH} caracteres`)
      .max(VALIDATION_RULES.NAME_MAX_LENGTH, `Nome deve ter no máximo ${VALIDATION_RULES.NAME_MAX_LENGTH} caracteres`),
    email: z
      .string()
      .email('Email inválido')
      .regex(VALIDATION_RULES.EMAIL_REGEX, 'Formato de email inválido')
      .optional(),
    phone: z
      .string()
      .regex(VALIDATION_RULES.PHONE_REGEX, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
      .optional(),
    birth_date: z
      .string()
      .date('Data inválida')
      .optional(),
    gender: z
      .enum(['male', 'female', 'other', 'prefer_not_to_say'])
      .optional(),
    status: z
      .enum([PATIENT_STATUS.ACTIVE, PATIENT_STATUS.INACTIVE, PATIENT_STATUS.DISCHARGED])
      .default(PATIENT_STATUS.ACTIVE),
    notes: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional()
  }),

  update: z.object({
    full_name: z
      .string()
      .min(VALIDATION_RULES.NAME_MIN_LENGTH)
      .max(VALIDATION_RULES.NAME_MAX_LENGTH)
      .optional(),
    email: z
      .string()
      .email()
      .regex(VALIDATION_RULES.EMAIL_REGEX)
      .optional(),
    phone: z
      .string()
      .regex(VALIDATION_RULES.PHONE_REGEX)
      .optional(),
    birth_date: z.string().date().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    status: z.enum([PATIENT_STATUS.ACTIVE, PATIENT_STATUS.INACTIVE, PATIENT_STATUS.DISCHARGED]).optional(),
    notes: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional()
  })
};

// Schema para agendamentos
export const appointmentSchema = {
  create: z.object({
    patient_id: z.string().uuid().optional(),
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional(),
    start_datetime: z.string().datetime('Data/hora de início inválida'),
    end_datetime: z.string().datetime('Data/hora de fim inválida'),
    status: z
      .enum([APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW])
      .default(APPOINTMENT_STATUS.SCHEDULED),
    appointment_type: z.string().optional(),
    notes: z.string().optional(),
    recurrence_rule: z.string().optional(),
    recurrence_group_id: z.string().optional()
  }).refine(data => {
    const start = new Date(data.start_datetime);
    const end = new Date(data.end_datetime);
    return start < end;
  }, {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['end_datetime']
  }),

  update: z.object({
    patient_id: z.string().uuid().optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    start_datetime: z.string().datetime().optional(),
    end_datetime: z.string().datetime().optional(),
    status: z.enum([APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW]).optional(),
    appointment_type: z.string().optional(),
    notes: z.string().optional(),
    recurrence_rule: z.string().optional(),
    recurrence_group_id: z.string().optional()
  })
};

// Schema para processos EEMM
export const eemmProcessSchema = {
  create: z.object({
    patient_id: z.string().uuid().optional(),
    dimension: z.enum([
      EEMM_DIMENSIONS.AFFECT,
      EEMM_DIMENSIONS.COGNITION,
      EEMM_DIMENSIONS.ATTENTION,
      EEMM_DIMENSIONS.SELF,
      EEMM_DIMENSIONS.MOTIVATION,
      EEMM_DIMENSIONS.BEHAVIOR
    ]),
    evolutionary_process: z.enum([
      EVOLUTIONARY_PROCESSES.VARIATION,
      EVOLUTIONARY_PROCESSES.SELECTION,
      EVOLUTIONARY_PROCESSES.RETENTION
    ]),
    analysis_level: z
      .enum([ANALYSIS_LEVELS.BIOPHYSIOLOGICAL, ANALYSIS_LEVELS.SOCIOCULTURAL, ANALYSIS_LEVELS.PSYCHOLOGICAL])
      .default(ANALYSIS_LEVELS.PSYCHOLOGICAL),
    process_name: z.string().min(1, 'Nome do processo é obrigatório'),
    intensity: z
      .number()
      .min(INTENSITY_LIMITS.MIN, `Intensidade deve ser entre ${INTENSITY_LIMITS.MIN} e ${INTENSITY_LIMITS.MAX}`)
      .max(INTENSITY_LIMITS.MAX, `Intensidade deve ser entre ${INTENSITY_LIMITS.MIN} e ${INTENSITY_LIMITS.MAX}`)
      .default(INTENSITY_LIMITS.DEFAULT)
      .optional(),
    evidence: z.string().optional(),
    intervention: z.string().optional(),
    status: z
      .enum([PROCESS_STATUS.ACTIVE, PROCESS_STATUS.INACTIVE, PROCESS_STATUS.COMPLETED])
      .default(PROCESS_STATUS.ACTIVE)
      .optional(),
    process_context: z
      .enum([PROCESS_CONTEXTS.MATRIX, PROCESS_CONTEXTS.ASSESSMENT, PROCESS_CONTEXTS.INTERVENTION])
      .default(PROCESS_CONTEXTS.MATRIX)
      .optional()
  }),

  update: z.object({
    patient_id: z.string().uuid().optional(),
    dimension: z.enum([
      EEMM_DIMENSIONS.AFFECT,
      EEMM_DIMENSIONS.COGNITION,
      EEMM_DIMENSIONS.ATTENTION,
      EEMM_DIMENSIONS.SELF,
      EEMM_DIMENSIONS.MOTIVATION,
      EEMM_DIMENSIONS.BEHAVIOR
    ]).optional(),
    evolutionary_process: z.enum([
      EVOLUTIONARY_PROCESSES.VARIATION,
      EVOLUTIONARY_PROCESSES.SELECTION,
      EVOLUTIONARY_PROCESSES.RETENTION
    ]).optional(),
    analysis_level: z.enum([ANALYSIS_LEVELS.BIOPHYSIOLOGICAL, ANALYSIS_LEVELS.SOCIOCULTURAL, ANALYSIS_LEVELS.PSYCHOLOGICAL]).optional(),
    process_name: z.string().min(1).optional(),
    intensity: z.number().min(INTENSITY_LIMITS.MIN).max(INTENSITY_LIMITS.MAX).optional(),
    evidence: z.string().optional(),
    intervention: z.string().optional(),
    status: z.enum([PROCESS_STATUS.ACTIVE, PROCESS_STATUS.INACTIVE, PROCESS_STATUS.COMPLETED]).optional(),
    process_context: z.enum([PROCESS_CONTEXTS.MATRIX, PROCESS_CONTEXTS.ASSESSMENT, PROCESS_CONTEXTS.INTERVENTION]).optional()
  })
};

// Schema para busca/filtros
export const searchSchema = {
  patients: z.object({
    query: z.string().optional(),
    status: z.enum([PATIENT_STATUS.ACTIVE, PATIENT_STATUS.INACTIVE, PATIENT_STATUS.DISCHARGED]).optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20)
  }),

  appointments: z.object({
    patient_id: z.string().uuid().optional(),
    status: z.enum([APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW]).optional(),
    start_date: z.string().date().optional(),
    end_date: z.string().date().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20)
  }),

  eemmProcesses: z.object({
    patient_id: z.string().uuid().optional(),
    dimension: z.enum([EEMM_DIMENSIONS.AFFECT, EEMM_DIMENSIONS.COGNITION, EEMM_DIMENSIONS.ATTENTION, EEMM_DIMENSIONS.SELF, EEMM_DIMENSIONS.MOTIVATION, EEMM_DIMENSIONS.BEHAVIOR]).optional(),
    evolutionary_process: z.enum([EVOLUTIONARY_PROCESSES.VARIATION, EVOLUTIONARY_PROCESSES.SELECTION, EVOLUTIONARY_PROCESSES.RETENTION]).optional(),
    analysis_level: z.enum([ANALYSIS_LEVELS.BIOPHYSIOLOGICAL, ANALYSIS_LEVELS.SOCIOCULTURAL, ANALYSIS_LEVELS.PSYCHOLOGICAL]).optional(),
    status: z.enum([PROCESS_STATUS.ACTIVE, PROCESS_STATUS.INACTIVE, PROCESS_STATUS.COMPLETED]).optional(),
    process_context: z.enum([PROCESS_CONTEXTS.MATRIX, PROCESS_CONTEXTS.ASSESSMENT, PROCESS_CONTEXTS.INTERVENTION]).optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20)
  })
};

// Tipos TypeScript derivados dos schemas
export type AuthSignInInput = z.infer<typeof authSchema.signIn>;
export type AuthSignUpInput = z.infer<typeof authSchema.signUp>;
export type PatientCreateInput = z.infer<typeof patientSchema.create>;
export type PatientUpdateInput = z.infer<typeof patientSchema.update>;
export type AppointmentCreateInput = z.infer<typeof appointmentSchema.create>;
export type AppointmentUpdateInput = z.infer<typeof appointmentSchema.update>;
export type EEMMProcessCreateInput = z.infer<typeof eemmProcessSchema.create>;
export type EEMMProcessUpdateInput = z.infer<typeof eemmProcessSchema.update>;
export type PatientsSearchInput = z.infer<typeof searchSchema.patients>;
export type AppointmentsSearchInput = z.infer<typeof searchSchema.appointments>;
export type EEMMProcessesSearchInput = z.infer<typeof searchSchema.eemmProcesses>;