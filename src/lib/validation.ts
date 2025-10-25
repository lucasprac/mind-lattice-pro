/**
 * Utilitários de validação
 * Funções reutilizáveis para validação de dados da aplicação
 */

import { z } from 'zod';

// Constantes de validação
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CPF_LENGTH: 11
} as const;

// Mensagens de erro padrão
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo é obrigatório',
  EMAIL_INVALID: 'Email inválido',
  PHONE_INVALID: 'Telefone deve estar no formato (XX) XXXXX-XXXX',
  PASSWORD_TOO_SHORT: `Senha deve ter pelo menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`,
  NAME_TOO_SHORT: `Nome deve ter pelo menos ${VALIDATION_RULES.NAME_MIN_LENGTH} caracteres`,
  NAME_TOO_LONG: `Nome deve ter no máximo ${VALIDATION_RULES.NAME_MAX_LENGTH} caracteres`,
  PASSWORDS_NOT_MATCH: 'Senhas não coincidem',
  DATE_INVALID: 'Data inválida'
} as const;

// Schemas básicos reutilizáveis
export const baseSchemas = {
  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID)
    .regex(VALIDATION_RULES.EMAIL_REGEX, VALIDATION_MESSAGES.EMAIL_INVALID),
    
  optionalEmail: z
    .string()
    .email(VALIDATION_MESSAGES.EMAIL_INVALID)
    .regex(VALIDATION_RULES.EMAIL_REGEX, VALIDATION_MESSAGES.EMAIL_INVALID)
    .optional()
    .or(z.literal('')),
    
  password: z
    .string()
    .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, VALIDATION_MESSAGES.PASSWORD_TOO_SHORT),
    
  fullName: z
    .string()
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, VALIDATION_MESSAGES.NAME_TOO_SHORT)
    .max(VALIDATION_RULES.NAME_MAX_LENGTH, VALIDATION_MESSAGES.NAME_TOO_LONG)
    .trim(),
    
  phone: z
    .string()
    .regex(VALIDATION_RULES.PHONE_REGEX, VALIDATION_MESSAGES.PHONE_INVALID)
    .optional()
    .or(z.literal('')),
    
  birthDate: z
    .string()
    .date(VALIDATION_MESSAGES.DATE_INVALID)
    .optional()
    .or(z.literal('')),
    
  uuid: z.string().uuid('ID inválido'),
  
  nonEmptyString: z.string().min(1, VALIDATION_MESSAGES.REQUIRED).trim(),
  
  optionalString: z.string().optional().or(z.literal(''))
};

// Schemas de autenticação
export const authSchemas = {
  signIn: z.object({
    email: baseSchemas.email,
    password: baseSchemas.password
  }),
  
  signUp: z.object({
    email: baseSchemas.email,
    password: baseSchemas.password,
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH,
    path: ['confirmPassword']
  }),
  
  resetPassword: z.object({
    email: baseSchemas.email
  })
};

// Schemas para pacientes
export const patientSchemas = {
  create: z.object({
    full_name: baseSchemas.fullName,
    email: baseSchemas.optionalEmail,
    phone: baseSchemas.phone,
    birth_date: baseSchemas.birthDate,
    gender: z
      .enum(['male', 'female', 'other', 'prefer_not_to_say'])
      .optional(),
    status: z
      .enum(['active', 'inactive', 'discharged'])
      .default('active')
      .optional(),
    notes: baseSchemas.optionalString,
    emergency_contact_name: baseSchemas.optionalString,
    emergency_contact_phone: baseSchemas.phone
  }),
  
  update: z.object({
    full_name: baseSchemas.fullName.optional(),
    email: baseSchemas.optionalEmail,
    phone: baseSchemas.phone,
    birth_date: baseSchemas.birthDate,
    gender: z
      .enum(['male', 'female', 'other', 'prefer_not_to_say'])
      .optional(),
    status: z
      .enum(['active', 'inactive', 'discharged'])
      .optional(),
    notes: baseSchemas.optionalString,
    emergency_contact_name: baseSchemas.optionalString,
    emergency_contact_phone: baseSchemas.phone
  })
};

// Schemas para agendamentos
export const appointmentSchemas = {
  create: z.object({
    patient_id: baseSchemas.uuid.optional(),
    title: baseSchemas.nonEmptyString,
    description: baseSchemas.optionalString,
    start_datetime: z.string().datetime('Data/hora de início inválida'),
    end_datetime: z.string().datetime('Data/hora de fim inválida'),
    status: z
      .enum(['scheduled', 'completed', 'cancelled', 'no_show'])
      .default('scheduled')
      .optional(),
    appointment_type: baseSchemas.optionalString,
    notes: baseSchemas.optionalString,
    recurrence_rule: baseSchemas.optionalString,
    recurrence_group_id: baseSchemas.optionalString
  }).refine(data => {
    const start = new Date(data.start_datetime);
    const end = new Date(data.end_datetime);
    return start < end;
  }, {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['end_datetime']
  }),
  
  update: z.object({
    patient_id: baseSchemas.uuid.optional(),
    title: baseSchemas.nonEmptyString.optional(),
    description: baseSchemas.optionalString,
    start_datetime: z.string().datetime().optional(),
    end_datetime: z.string().datetime().optional(),
    status: z
      .enum(['scheduled', 'completed', 'cancelled', 'no_show'])
      .optional(),
    appointment_type: baseSchemas.optionalString,
    notes: baseSchemas.optionalString,
    recurrence_rule: baseSchemas.optionalString,
    recurrence_group_id: baseSchemas.optionalString
  })
};

// Utilitários de validação
export const validationUtils = {
  /**
   * Valida email de forma simples
   */
  isValidEmail: (email: string): boolean => {
    return VALIDATION_RULES.EMAIL_REGEX.test(email);
  },
  
  /**
   * Valida telefone brasileiro
   */
  isValidPhone: (phone: string): boolean => {
    return VALIDATION_RULES.PHONE_REGEX.test(phone);
  },
  
  /**
   * Valida se string não está vazia
   */
  isNotEmpty: (value: string | null | undefined): boolean => {
    return Boolean(value && value.trim().length > 0);
  },
  
  /**
   * Valida senha forte
   */
  isStrongPassword: (password: string): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      issues.push(`Deve ter pelo menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`);
    }
    
    if (!/[A-Z]/.test(password)) {
      issues.push('Deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      issues.push('Deve conter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      issues.push('Deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      issues.push('Deve conter pelo menos um caractere especial');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  },
  
  /**
   * Valida data de nascimento
   */
  isValidBirthDate: (date: string): boolean => {
    const birthDate = new Date(date);
    const today = new Date();
    const maxAge = 150;
    const minAge = 0;
    
    // Verifica se a data é válida
    if (isNaN(birthDate.getTime())) {
      return false;
    }
    
    // Verifica se não é no futuro
    if (birthDate > today) {
      return false;
    }
    
    // Verifica idade máxima
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age > maxAge || age < minAge) {
      return false;
    }
    
    return true;
  },
  
  /**
   * Sanitiza string removendo caracteres especiais
   */
  sanitizeString: (input: string): string => {
    return input
      .trim()
      .replace(/[<>"'&]/g, '') // Remove caracteres HTML perigosos
      .slice(0, 1000); // Limita tamanho
  },
  
  /**
   * Valida UUID
   */
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },
  
  /**
   * Formata telefone brasileiro
   */
  formatPhone: (phone: string): string => {
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');
    
    // Formata baseado no tamanho
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    
    return phone; // Retorna original se não conseguir formatar
  }
};

// Tipos derivados dos schemas
export type AuthSignInInput = z.infer<typeof authSchemas.signIn>;
export type AuthSignUpInput = z.infer<typeof authSchemas.signUp>;
export type AuthResetPasswordInput = z.infer<typeof authSchemas.resetPassword>;
export type PatientCreateInput = z.infer<typeof patientSchemas.create>;
export type PatientUpdateInput = z.infer<typeof patientSchemas.update>;
export type AppointmentCreateInput = z.infer<typeof appointmentSchemas.create>;
export type AppointmentUpdateInput = z.infer<typeof appointmentSchemas.update>;