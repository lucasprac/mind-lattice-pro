import { z } from 'zod';

// ===========================
// PATIENT SCHEMAS
// ===========================

export const PatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  therapist_id: z.string().uuid(),
});

export const PatientFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
});

// ===========================
// SESSION SCHEMAS
// ===========================

export const SessionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  session_date: z.string(),
  session_type: z.enum(['initial', 'follow_up', 'final']),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  patient_id: z.string().uuid(),
  therapist_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SessionFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  session_date: z.string(),
  session_type: z.enum(['initial', 'follow_up', 'final']),
  patient_id: z.string().uuid(),
});

// ===========================
// PBAT SCHEMAS
// ===========================

const pbatQuestionSchema = z.number().min(0, 'Valor mínimo é 0').max(100, 'Valor máximo é 100');

export const PBATResponseSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  
  // 34 Health questions
  question_1: pbatQuestionSchema,
  question_2: pbatQuestionSchema,
  question_3: pbatQuestionSchema,
  question_4: pbatQuestionSchema,
  question_5: pbatQuestionSchema,
  question_6: pbatQuestionSchema,
  question_7: pbatQuestionSchema,
  question_8: pbatQuestionSchema,
  question_9: pbatQuestionSchema,
  question_10: pbatQuestionSchema,
  question_11: pbatQuestionSchema,
  question_12: pbatQuestionSchema,
  question_13: pbatQuestionSchema,
  question_14: pbatQuestionSchema,
  question_15: pbatQuestionSchema,
  question_16: pbatQuestionSchema,
  question_17: pbatQuestionSchema,
  question_18: pbatQuestionSchema,
  question_19: pbatQuestionSchema,
  question_20: pbatQuestionSchema,
  question_21: pbatQuestionSchema,
  question_22: pbatQuestionSchema,
  question_23: pbatQuestionSchema,
  question_24: pbatQuestionSchema,
  question_25: pbatQuestionSchema,
  question_26: pbatQuestionSchema,
  question_27: pbatQuestionSchema,
  question_28: pbatQuestionSchema,
  question_29: pbatQuestionSchema,
  question_30: pbatQuestionSchema,
  question_31: pbatQuestionSchema,
  question_32: pbatQuestionSchema,
  question_33: pbatQuestionSchema,
  question_34: pbatQuestionSchema,
  
  health_status: z.enum(['muito_ruim', 'ruim', 'regular', 'boa', 'excelente']),
  
  total_score: z.number().min(0).max(3400),
  domain_scores: z.object({
    physical: z.number(),
    psychological: z.number(),
    social: z.number(),
    environmental: z.number(),
  }),
  
  created_at: z.string(),
  updated_at: z.string(),
});

export const PBATFormSchema = z.object({
  question_1: pbatQuestionSchema,
  question_2: pbatQuestionSchema,
  question_3: pbatQuestionSchema,
  question_4: pbatQuestionSchema,
  question_5: pbatQuestionSchema,
  question_6: pbatQuestionSchema,
  question_7: pbatQuestionSchema,
  question_8: pbatQuestionSchema,
  question_9: pbatQuestionSchema,
  question_10: pbatQuestionSchema,
  question_11: pbatQuestionSchema,
  question_12: pbatQuestionSchema,
  question_13: pbatQuestionSchema,
  question_14: pbatQuestionSchema,
  question_15: pbatQuestionSchema,
  question_16: pbatQuestionSchema,
  question_17: pbatQuestionSchema,
  question_18: pbatQuestionSchema,
  question_19: pbatQuestionSchema,
  question_20: pbatQuestionSchema,
  question_21: pbatQuestionSchema,
  question_22: pbatQuestionSchema,
  question_23: pbatQuestionSchema,
  question_24: pbatQuestionSchema,
  question_25: pbatQuestionSchema,
  question_26: pbatQuestionSchema,
  question_27: pbatQuestionSchema,
  question_28: pbatQuestionSchema,
  question_29: pbatQuestionSchema,
  question_30: pbatQuestionSchema,
  question_31: pbatQuestionSchema,
  question_32: pbatQuestionSchema,
  question_33: pbatQuestionSchema,
  question_34: pbatQuestionSchema,
  
  health_status: z.enum(['muito_ruim', 'ruim', 'regular', 'boa', 'excelente']),
});

// ===========================
// NETWORK SCHEMAS
// ===========================

export const NetworkNodeSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Texto do nó é obrigatório'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  session_id: z.string().uuid().optional(),
  type: z.enum(['default', 'input', 'output']).optional(),
  data: z.object({
    label: z.string(),
    intensity: z.number().min(1).max(5).optional(),
    color: z.string().optional(),
  }).optional(),
});

export const NetworkEdgeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: z.enum(['maladaptive', 'neutral', 'adaptive']),
  intensity: z.number().min(1).max(5),
  bidirectional: z.boolean().optional(),
  data: z.object({
    label: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
});

export const NetworkSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  name: z.string().min(1, 'Nome da rede é obrigatório'),
  description: z.string().optional(),
  nodes: z.array(NetworkNodeSchema),
  edges: z.array(NetworkEdgeSchema),
  layout: z.enum(['force', 'hierarchical', 'circular']).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const NetworkFormSchema = z.object({
  name: z.string().min(1, 'Nome da rede é obrigatório'),
  description: z.string().optional(),
  nodes: z.array(NetworkNodeSchema),
  edges: z.array(NetworkEdgeSchema),
  layout: z.enum(['force', 'hierarchical', 'circular']).optional(),
});

// ===========================
// AUTH SCHEMAS
// ===========================

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const RegisterSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

// ===========================
// UTILITY SCHEMAS
// ===========================

export const UUIDSchema = z.string().uuid('ID inválido');

export const PaginationSchema = z.object({
  page: z.number().min(1),
  perPage: z.number().min(1).max(100),
  total: z.number().min(0),
});

export const DateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

// ===========================
// TYPE EXPORTS
// ===========================

export type PatientFormData = z.infer<typeof PatientFormSchema>;
export type SessionFormData = z.infer<typeof SessionFormSchema>;
export type PBATFormData = z.infer<typeof PBATFormSchema>;
export type NetworkFormData = z.infer<typeof NetworkFormSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type PaginationData = z.infer<typeof PaginationSchema>;
export type DateRangeData = z.infer<typeof DateRangeSchema>;
