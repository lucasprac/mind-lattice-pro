// ===========================
// CORE TYPES
// ===========================

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
  therapist_id: string;
  sessions?: Session[];
  sessionCount: number;
  lastSession?: Session;
}

export interface Session {
  id: string;
  title: string;
  description?: string;
  session_date: string;
  session_type: 'initial' | 'follow_up' | 'final';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  patient_id: string;
  therapist_id: string;
  created_at: string;
  updated_at: string;
  pbat_responses?: PBATResponse[];
  networks?: Network[];
}

// ===========================
// PBAT TYPES
// ===========================

export interface PBATResponse {
  id: string;
  session_id: string;
  // Health questions (1-34)
  question_1: number;
  question_2: number;
  question_3: number;
  question_4: number;
  question_5: number;
  question_6: number;
  question_7: number;
  question_8: number;
  question_9: number;
  question_10: number;
  question_11: number;
  question_12: number;
  question_13: number;
  question_14: number;
  question_15: number;
  question_16: number;
  question_17: number;
  question_18: number;
  question_19: number;
  question_20: number;
  question_21: number;
  question_22: number;
  question_23: number;
  question_24: number;
  question_25: number;
  question_26: number;
  question_27: number;
  question_28: number;
  question_29: number;
  question_30: number;
  question_31: number;
  question_32: number;
  question_33: number;
  question_34: number;
  
  // Health status
  health_status: 'muito_ruim' | 'ruim' | 'regular' | 'boa' | 'excelente';
  
  // Scores
  total_score: number;
  domain_scores: {
    physical: number;
    psychological: number;
    social: number;
    environmental: number;
  };
  
  created_at: string;
  updated_at: string;
}

export type PBATQuestionKey = `question_${number}`;

export interface PBATDomain {
  name: string;
  questions: number[];
  score: number;
  percentage: number;
}

// ===========================
// NETWORK TYPES
// ===========================

export interface NetworkNode {
  id: string;
  text: string;
  position: { x: number; y: number };
  session_id?: string;
  type?: 'default' | 'input' | 'output';
  data?: {
    label: string;
    intensity?: number;
    color?: string;
  };
}

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  type: 'maladaptive' | 'neutral' | 'adaptive';
  intensity: 1 | 2 | 3 | 4 | 5;
  bidirectional?: boolean;
  data?: {
    label?: string;
    color?: string;
  };
}

export interface Network {
  id: string;
  session_id: string;
  name: string;
  description?: string;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  layout?: 'force' | 'hierarchical' | 'circular';
  created_at: string;
  updated_at: string;
}

// ===========================
// UI & STATE TYPES
// ===========================

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  canAccess: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

// ===========================
// API RESPONSE TYPES
// ===========================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface QueryOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

// ===========================
// FORM TYPES
// ===========================

export interface PatientFormData {
  name: string;
  email: string;
  phone?: string;
  birth_date?: string;
}

export interface SessionFormData {
  title: string;
  description?: string;
  session_date: string;
  session_type: Session['session_type'];
  patient_id: string;
}

export interface PBATFormData extends Omit<PBATResponse, 'id' | 'session_id' | 'total_score' | 'domain_scores' | 'created_at' | 'updated_at'> {}

// ===========================
// HOOKS RETURN TYPES
// ===========================

export interface UsePatientsReturn {
  patients: Patient[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addPatient: (data: PatientFormData) => Promise<Patient>;
  updatePatient: (id: string, data: Partial<PatientFormData>) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;
}

export interface UseSessionsReturn {
  sessions: Session[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addSession: (data: SessionFormData) => Promise<Session>;
  updateSession: (id: string, data: Partial<SessionFormData>) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
}

export interface UsePBATReturn {
  responses: PBATResponse[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  saveResponse: (sessionId: string, data: PBATFormData) => Promise<PBATResponse>;
  updateResponse: (id: string, data: Partial<PBATFormData>) => Promise<PBATResponse>;
  deleteResponse: (id: string) => Promise<void>;
}

export interface UseNetworksReturn {
  networks: Network[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  saveNetwork: (sessionId: string, data: Partial<Network>) => Promise<Network>;
  updateNetwork: (id: string, data: Partial<Network>) => Promise<Network>;
  deleteNetwork: (id: string) => Promise<void>;
}

// ===========================
// UTILITY TYPES
// ===========================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===========================
// CONSTANTS
// ===========================

export const PBAT_DOMAINS = {
  PHYSICAL: 'physical',
  PSYCHOLOGICAL: 'psychological', 
  SOCIAL: 'social',
  ENVIRONMENTAL: 'environmental'
} as const;

export const SESSION_TYPES = {
  INITIAL: 'initial',
  FOLLOW_UP: 'follow_up', 
  FINAL: 'final'
} as const;

export const SESSION_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const EDGE_TYPES = {
  MALADAPTIVE: 'maladaptive',
  NEUTRAL: 'neutral',
  ADAPTIVE: 'adaptive'
} as const;
