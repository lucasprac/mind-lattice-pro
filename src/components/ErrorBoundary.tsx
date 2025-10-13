import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

/**
 * Error Boundary global com recovery automático e telemetria
 */
export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Gera um ID único para o erro
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Chama callback personalizado se fornecido
    this.props.onError?.(error, errorInfo);
    
    // Log do erro para telemetria
    this.logError(error, errorInfo);
    
    // Tenta recovery automático para erros não críticos
    this.attemptAutoRecovery(error);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
    };

    // Em produção, enviar para serviço de telemetria
    if (process.env.NODE_ENV === 'production') {
      this.sendToTelemetry(errorData);
    } else {
      console.group('🚨 Error Boundary - Erro Capturado');
      console.error('Erro:', error);
      console.error('Info do Componente:', errorInfo);
      console.error('Dados completos:', errorData);
      console.groupEnd();
    }
  };

  private getUserId = () => {
    try {
      // Tentar obter ID do usuário do localStorage ou contexto
      return localStorage.getItem('supabase.auth.token') ? 'authenticated' : 'anonymous';
    } catch {
      return 'unknown';
    }
  };

  private sendToTelemetry = async (errorData: any) => {
    try {
      // Implementar envio para serviço de telemetria (Sentry, LogRocket, etc.)
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      });
    } catch (telemetryError) {
      console.error('Falha ao enviar erro para telemetria:', telemetryError);
    }
  };

  private attemptAutoRecovery = (error: Error) => {
    // Tipos de erro que podem ser recuperados automaticamente
    const recoverableErrors = [
      'ChunkLoadError',
      'NetworkError',
      'TypeError: Failed to fetch',
    ];

    const isRecoverable = recoverableErrors.some(type => 
      error.name.includes(type) || error.message.includes(type)
    );

    if (isRecoverable && this.retryCount < this.maxRetries) {
      this.retryCount++;
      
      this.retryTimeout = setTimeout(() => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }, 2000 * this.retryCount); // Backoff exponencial
    }
  };

  private handleRetry = () => {
    this.retryCount = 0;
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: ''
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      // Se um fallback personalizado foi fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Oops! Algo deu errado</CardTitle>
              <CardDescription>
                Encontramos um erro inesperado. Não se preocupe, vamos resolver isso!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {this.retryCount > 0 && this.retryCount < this.maxRetries && (
                <Alert>
                  <RefreshCw className="h-4 w-4" />
                  <AlertDescription>
                    Tentando recuperação automática... (Tentativa {this.retryCount}/{this.maxRetries})
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">ID do Erro: <code className="bg-muted px-1 py-0.5 rounded">{errorId}</code></p>
                <p>Use este ID ao relatar o problema.</p>
              </div>

              {isDevelopment && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    Detalhes técnicos (desenvolvimento)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      <strong>Erro:</strong> {error.message}\n\n
                      <strong>Stack Trace:</strong>\n{error.stack}\n\n
                      {errorInfo && (
                        <span>
                          <strong>Component Stack:</strong>\n{errorInfo.componentStack}
                        </span>
                      )}
                    </pre>
                  </div>
                </details>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={this.handleRetry} 
                variant="default" 
                className="w-full sm:w-auto"
                disabled={this.retryCount >= this.maxRetries}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              
              <Button 
                onClick={this.handleGoHome} 
                variant="outline" 
                className="w-full sm:w-auto"
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
              
              <Button 
                onClick={this.handleReload} 
                variant="ghost" 
                className="w-full sm:w-auto"
              >
                Recarregar Página
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para usar Error Boundary de forma programática
 */
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: any) => {
    // Força um erro que será capturado pelo Error Boundary
    throw error;
  };

  return handleError;
};

/**
 * Error Boundary específico para componentes de dados
 */
export const DataErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar os dados. Tente novamente ou contate o suporte.
          </AlertDescription>
        </Alert>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Error Boundary para componentes de canvas/network
 */
export const CanvasErrorBoundary: React.FC<{ children: ReactNode; onError?: () => void }> = ({ 
  children, 
  onError 
}) => {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Erro no canvas:', error);
        onError?.();
      }}
      fallback={
        <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Erro ao carregar o canvas. Recarregue a página.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};
