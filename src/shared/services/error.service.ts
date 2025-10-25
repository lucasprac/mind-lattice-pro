/**
 * Serviço centralizado de tratamento de erros
 * Resolve o problema de tratamento inconsistente identificado na auditoria
 */

import type { ServiceError } from '../types/base';
import { toast } from 'sonner';

// Error Categories
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK', 
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN'
}

// Error Severity
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Structured Error Interface
export interface StructuredError extends ServiceError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  technicalMessage: string;
  shouldReport: boolean;
  retryable: boolean;
}

class ErrorService {
  private static instance: ErrorService;
  private errorLog: StructuredError[] = [];

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Cria erro estruturado a partir de erro genérico
   */
  public createError(
    error: unknown,
    category: ErrorCategory,
    context?: Record<string, unknown>
  ): StructuredError {
    const timestamp = new Date().toISOString();
    const baseError = this.parseError(error);
    
    const structuredError: StructuredError = {
      ...baseError,
      category,
      severity: this.determineSeverity(category, baseError.code),
      userMessage: this.getUserMessage(category, baseError.code),
      technicalMessage: baseError.message,
      shouldReport: this.shouldReport(category),
      retryable: this.isRetryable(category, baseError.code),
      context,
      timestamp
    };

    this.logError(structuredError);
    return structuredError;
  }

  /**
   * Exibe erro para o usuário de forma consistente
   */
  public showUserError(error: StructuredError): void {
    const { severity, userMessage, retryable } = error;
    
    const toastOptions = {
      description: retryable ? 'Tente novamente em alguns instantes.' : undefined,
      duration: this.getToastDuration(severity)
    };

    switch (severity) {
      case ErrorSeverity.LOW:
        toast.info(userMessage, toastOptions);
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning(userMessage, toastOptions);
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        toast.error(userMessage, toastOptions);
        break;
    }
  }

  /**
   * Manipula erro de forma completa
   */
  public handleError(
    error: unknown,
    category: ErrorCategory,
    context?: Record<string, unknown>,
    showToUser = true
  ): StructuredError {
    const structuredError = this.createError(error, category, context);
    
    if (showToUser) {
      this.showUserError(structuredError);
    }

    if (structuredError.shouldReport) {
      this.reportError(structuredError);
    }

    return structuredError;
  }

  /**
   * Wrapper para ações assíncronas com tratamento de erro
   */
  public async withErrorHandling<T>(
    action: () => Promise<T>,
    category: ErrorCategory,
    context?: Record<string, unknown>
  ): Promise<T | null> {
    try {
      return await action();
    } catch (error) {
      this.handleError(error, category, context);
      return null;
    }
  }

  // === MÉTODOS PRIVADOS ===

  private parseError(error: unknown): ServiceError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: error.name || 'UnknownError',
        timestamp: new Date().toISOString()
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        code: 'StringError',
        timestamp: new Date().toISOString()
      };
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return {
        message: String(error.message),
        code: 'code' in error ? String(error.code) : 'ObjectError',
        timestamp: new Date().toISOString()
      };
    }

    return {
      message: 'Erro desconhecido',
      code: 'UnknownError',
      timestamp: new Date().toISOString()
    };
  }

  private determineSeverity(category: ErrorCategory, code: string): ErrorSeverity {
    // Erros críticos
    if (category === ErrorCategory.DATABASE && code.includes('connection')) {
      return ErrorSeverity.CRITICAL;
    }
    
    if (category === ErrorCategory.AUTHENTICATION) {
      return ErrorSeverity.HIGH;
    }

    // Erros de validação são de baixa severidade
    if (category === ErrorCategory.VALIDATION) {
      return ErrorSeverity.LOW;
    }

    // Not found é médio
    if (category === ErrorCategory.NOT_FOUND) {
      return ErrorSeverity.MEDIUM;
    }

    // Default
    return ErrorSeverity.MEDIUM;
  }

  private getUserMessage(category: ErrorCategory): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.VALIDATION]: 'Verifique os dados informados e tente novamente.',
      [ErrorCategory.NETWORK]: 'Problema de conexão. Verifique sua internet.',
      [ErrorCategory.DATABASE]: 'Erro no servidor. Nossa equipe foi notificada.',
      [ErrorCategory.AUTHENTICATION]: 'Sessão expirada. Faça login novamente.',
      [ErrorCategory.AUTHORIZATION]: 'Você não tem permissão para esta ação.',
      [ErrorCategory.NOT_FOUND]: 'Recurso não encontrado.',
      [ErrorCategory.UNKNOWN]: 'Algo deu errado. Tente novamente.'
    };

    return messages[category] || messages[ErrorCategory.UNKNOWN];
  }

  private shouldReport(category: ErrorCategory): boolean {
    // Não reportar erros de validação e not found
    return ![
      ErrorCategory.VALIDATION, 
      ErrorCategory.NOT_FOUND
    ].includes(category);
  }

  private isRetryable(category: ErrorCategory): boolean {
    // Erros de rede e alguns de banco são retryáveis
    const retryableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.DATABASE
    ];

    // Autenticação não é retryável automaticamente
    if (category === ErrorCategory.AUTHENTICATION) {
      return false;
    }

    return retryableCategories.includes(category);
  }

  private getToastDuration(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.LOW: return 3000;
      case ErrorSeverity.MEDIUM: return 4000;
      case ErrorSeverity.HIGH: return 6000;
      case ErrorSeverity.CRITICAL: return 8000;
      default: return 4000;
    }
  }

  private logError(error: StructuredError): void {
    // Log no console para desenvolvimento
    console.group(`🚨 ${error.category} Error [${error.severity}]`);
    console.error('Technical:', error.technicalMessage);
    console.error('User:', error.userMessage);
    console.error('Context:', error.context);
    console.error('Timestamp:', error.timestamp);
    console.groupEnd();

    // Adiciona ao log interno
    this.errorLog.push(error);
    
    // Mantém apenas os últimos 100 erros
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }

  private reportError(error: StructuredError): void {
    // Aqui seria implementada integração com Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Error reported to monitoring service:', error.code);
    }
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance();

// Convenience hooks para React components
export const useErrorHandler = () => {
  return {
    handleError: errorService.handleError.bind(errorService),
    showError: errorService.showUserError.bind(errorService),
    withErrorHandling: errorService.withErrorHandling.bind(errorService)
  };
};
