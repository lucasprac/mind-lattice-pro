/**
 * Constantes globais da aplicação Mind Lattice Pro
 * Centraliza todas as constantes para evitar magic numbers e strings
 */

// Estados dos pacientes
export const PATIENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCHARGED: 'discharged'
} as const;

export type PatientStatus = typeof PATIENT_STATUS[keyof typeof PATIENT_STATUS];

// Estados dos agendamentos
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

// Dimensões EEMM
export const EEMM_DIMENSIONS = {
  AFFECT: 'afeto',
  COGNITION: 'cognicao',
  ATTENTION: 'atencao',
  SELF: 'self',
  MOTIVATION: 'motivacao',
  BEHAVIOR: 'comportamento'
} as const;

export type EEMMDimension = typeof EEMM_DIMENSIONS[keyof typeof EEMM_DIMENSIONS];

// Processos evolutivos
export const EVOLUTIONARY_PROCESSES = {
  VARIATION: 'variacao',
  SELECTION: 'selecao',
  RETENTION: 'retencao'
} as const;

export type EvolutionaryProcess = typeof EVOLUTIONARY_PROCESSES[keyof typeof EVOLUTIONARY_PROCESSES];

// Níveis de análise
export const ANALYSIS_LEVELS = {
  BIOPHYSIOLOGICAL: 'biofisiologico',
  SOCIOCULTURAL: 'sociocultural', 
  PSYCHOLOGICAL: 'psicologico'
} as const;

export type AnalysisLevel = typeof ANALYSIS_LEVELS[keyof typeof ANALYSIS_LEVELS];

// Estados dos processos
export const PROCESS_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed'
} as const;

export type ProcessStatus = typeof PROCESS_STATUS[keyof typeof PROCESS_STATUS];

// Contextos dos processos
export const PROCESS_CONTEXTS = {
  MATRIX: 'matrix',
  ASSESSMENT: 'assessment',
  INTERVENTION: 'intervention'
} as const;

export type ProcessContext = typeof PROCESS_CONTEXTS[keyof typeof PROCESS_CONTEXTS];

// Limites de intensidade
export const INTENSITY_LIMITS = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 3
} as const;

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5
} as const;

// Configurações de UI
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200
} as const;

// Rotas da aplicação
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  PATIENT_DETAIL: '/patients/:patientId',
  PATIENT_SESSION_NEW: '/patients/:patientId/session/new',
  PATIENT_SESSION: '/patients/:patientId/session/:recordId',
  SESSION_ROADMAP: '/patients/:patientId/session/:recordId/roadmap',
  SESSION_ASSESSMENT: '/patients/:patientId/session/:recordId/assessment',
  SESSION_NETWORK: '/patients/:patientId/session/:recordId/network',
  SESSION_MEDIATORS: '/patients/:patientId/session/:recordId/mediators',
  SESSION_FUNCTIONAL: '/patients/:patientId/session/:recordId/functional',
  EEMM_MATRIX: '/eemm',
  NETWORKS: '/networks',
  MEDIATORS: '/mediators',
  FUNCTIONAL_ANALYSIS: '/functional-analysis',
  INTERVENTIONS: '/interventions',
  RECORDS: '/records',
  SETTINGS: '/settings'
} as const;

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Usuário não autenticado',
  NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
  NOT_FOUND: 'Recurso não encontrado',
  SERVER_ERROR: 'Erro interno do servidor',
  PERMISSION_DENIED: 'Acesso negado'
} as const;

// Mensagens de sucesso padrão
export const SUCCESS_MESSAGES = {
  CREATED: 'Criado com sucesso',
  UPDATED: 'Atualizado com sucesso', 
  DELETED: 'Deletado com sucesso',
  SAVED: 'Salvo com sucesso'
} as const;

// Configurações de validação
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CPF_LENGTH: 11
} as const;