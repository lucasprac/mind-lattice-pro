/**
 * Sistema centralizado de tratamento de erros
 * Implementa clean code com logging estruturado e recuperação de erros
 */

import { toast } from 'sonner';

// Tipos de erro da aplicação
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  UNKNOWN = 'UNKNOWN'
}

// Interface para erros estruturados
export interface AppError {
  type: ErrorType;
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: Record<string, any>;
}

// Mensagens de erro amigáveis ao usuário
export const ERROR_MESSAGES = {
  // Autenticação
  INVALID_CREDENTIALS: 'Email ou senha inválidos',
  EMAIL_NOT_CONFIRMED: 'Email não confirmado. Verifique sua caixa de entrada',
  USER_NOT_FOUND: 'Usuário não encontrado',
  SESSION_EXPIRED: 'Sessão expirada. Faça login novamente',
  UNAUTHORIZED: 'Acesso não autorizado',
  
  // Database
  NOT_FOUND: 'Registro não encontrado',
  DUPLICATE_ENTRY: 'Já existe um registro com essas informações',
  DATABASE_ERROR: 'Erro interno do banco de dados',
  
  // Rede
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
  TIMEOUT_ERROR: 'Operação demorou muito para responder',
  
  // Genérico
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente',
  VALIDATION_ERROR: 'Dados inválidos fornecidos',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente'
} as const;

// Mapeamento de códigos de erro do Supabase para mensagens amigáveis
const SUPABASE_ERROR_MAP: Record<string, string> = {
  'invalid_credentials': ERROR_MESSAGES.INVALID_CREDENTIALS,
  'email_not_confirmed': ERROR_MESSAGES.EMAIL_NOT_CONFIRMED,
  'user_not_found': ERROR_MESSAGES.USER_NOT_FOUND,
  'session_not_found': ERROR_MESSAGES.SESSION_EXPIRED,
  'PGRST116': ERROR_MESSAGES.NOT_FOUND,
  '23505': ERROR_MESSAGES.DUPLICATE_ENTRY, // Unique constraint violation
  'network_error': ERROR_MESSAGES.NETWORK_ERROR,
  'timeout': ERROR_MESSAGES.TIMEOUT_ERROR
};

/**
 * Classe principal para tratamento de erros
 */
export class ErrorHandler {
  private static isDevelopment = process.env.NODE_ENV === 'development';
  
  /**
   * Processa e trata um erro de forma centralizada
   */
  static handle(error: any, context?: Record<string, any>): AppError {
    const appError = this.createAppError(error, context);
    
    // Log estruturado (apenas em desenvolvimento)
    if (this.isDevelopment) {
      this.logError(appError);
    }
    
    // Exibir toast para o usuário (exceto para alguns tipos)
    if (this.shouldShowToast(appError)) {
      this.showErrorToast(appError);
    }
    
    return appError;
  }
  
  /**
   * Cria um AppError estruturado a partir de qualquer tipo de erro
   */
  private static createAppError(error: any, context?: Record<string, any>): AppError {
    const timestamp = new Date();
    
    // Erro já é um AppError
    if (error?.type && error?.code) {
      return { ...error, timestamp, context };
    }
    
    // Erro do Supabase
    if (error?.code || error?.message?.includes('supabase')) {
      return this.handleSupabaseError(error, context, timestamp);
    }
    
    // Erro de rede
    if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        code: 'NETWORK_ERROR',
        message: ERROR_MESSAGES.NETWORK_ERROR,
        details: error.message,
        timestamp,
        context
      };
    }
    
    // Erro de validação (Zod)
    if (error?.issues || error?.name === 'ZodError') {
      return {
        type: ErrorType.VALIDATION,
        code: 'VALIDATION_ERROR',
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        details: error.issues || error.message,
        timestamp,
        context
      };
    }
    
    // Erro genérico
    return {
      type: ErrorType.UNKNOWN,
      code: 'UNKNOWN_ERROR',
      message: error?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      details: error,
      timestamp,
      context
    };
  }
  
  /**
   * Trata erros específicos do Supabase
   */
  private static handleSupabaseError(error: any, context?: Record<string, any>, timestamp?: Date): AppError {
    const code = error.code || 'SUPABASE_ERROR';
    const userMessage = SUPABASE_ERROR_MAP[code] || error.message || ERROR_MESSAGES.SERVER_ERROR;
    
    // Determinar tipo do erro baseado no código
    let type = ErrorType.DATABASE;
    if (['invalid_credentials', 'email_not_confirmed', 'user_not_found'].includes(code)) {
      type = ErrorType.AUTHENTICATION;
    } else if (code === 'session_not_found') {
      type = ErrorType.AUTHORIZATION;
    }
    
    return {
      type,
      code,
      message: userMessage,
      details: {
        originalMessage: error.message,
        hint: error.hint,
        details: error.details
      },
      timestamp: timestamp || new Date(),
      context
    };
  }
  
  /**
   * Faz log estruturado do erro (apenas desenvolvimento)
   */
  private static logError(appError: AppError): void {
    const logData = {
      timestamp: appError.timestamp.toISOString(),
      type: appError.type,
      code: appError.code,
      message: appError.message,
      context: appError.context,
      details: appError.details
    };
    
    console.group(`🔴 [${appError.type}] ${appError.code}`);
    console.error('Message:', appError.message);
    if (appError.context) {
      console.error('Context:', appError.context);
    }
    if (appError.details) {
      console.error('Details:', appError.details);
    }
    console.error('Full Error:', logData);
    console.groupEnd();
  }
  
  /**
   * Determina se deve exibir toast para o erro
   */
  private static shouldShowToast(appError: AppError): boolean {
    // Não exibir toast para erros de validação (são tratados nos forms)
    if (appError.type === ErrorType.VALIDATION) {
      return false;
    }
    
    // Não exibir toast para alguns códigos específicos
    const silentCodes = ['PGRST116']; // Not found - geralmente tratado na UI
    return !silentCodes.includes(appError.code);
  }
  
  /**
   * Exibe toast de erro para o usuário
   */
  private static showErrorToast(appError: AppError): void {
    const toastOptions = {
      duration: 5000,
      description: this.isDevelopment ? `Código: ${appError.code}` : undefined
    };
    
    toast.error(appError.message, toastOptions);
  }
  
  /**
   * Cria erro personalizado da aplicação
   */
  static createError(
    type: ErrorType,
    code: string,
    message: string,
    details?: any,
    context?: Record<string, any>
  ): AppError {
    return {
      type,
      code,
      message,
      details,
      context,
      timestamp: new Date()
    };
  }
  
  /**
   * Handler para erros não capturados do React
   */
  static handleReactError(error: Error, errorInfo: any): void {
    const appError = this.handle(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });
    
    // Em produção, poderia enviar para serviço de monitoramento
    if (!this.isDevelopment) {
      // TODO: Integrar com Sentry, LogRocket, etc.
      console.error('React Error captured:', appError);
    }
  }
  
  /**
   * Tenta recuperar de um erro com retry
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: Record<string, any>
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Não fazer retry para alguns tipos de erro
        if (this.shouldNotRetry(error)) {
          break;
        }
        
        // Última tentativa
        if (attempt === maxRetries) {
          break;
        }
        
        // Log da tentativa (apenas desenvolvimento)
        if (this.isDevelopment) {
          console.warn(`Tentativa ${attempt}/${maxRetries} falhou:`, error);
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    // Todas as tentativas falharam
    throw this.handle(lastError, { ...context, maxRetries, finalAttempt: true });
  }
  
  /**
   * Determina se não deve fazer retry para um erro
   */
  private static shouldNotRetry(error: any): boolean {
    // Não fazer retry para erros de autenticação/autorização
    const noRetryMessages = [
      'invalid_credentials',
      'email_not_confirmed',
      'user_not_found',
      'session_not_found',
      'unauthorized'
    ];
    
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code?.toLowerCase() || '';
    
    return noRetryMessages.some(msg => 
      errorMessage.includes(msg) || errorCode.includes(msg)
    );
  }
}

// Utility functions para uso direto
export const handleError = (error: any, context?: Record<string, any>) => 
  ErrorHandler.handle(error, context);

export const createError = (
  type: ErrorType,
  code: string,
  message: string,
  details?: any,
  context?: Record<string, any>
) => ErrorHandler.createError(type, code, message, details, context);

export const withRetry = <T>(
  operation: () => Promise<T>,
  maxRetries?: number,
  delay?: number,
  context?: Record<string, any>
) => ErrorHandler.withRetry(operation, maxRetries, delay, context);