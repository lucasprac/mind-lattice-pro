import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de fallback
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para debugging
    console.error('[ErrorBoundary] Erro capturado:', error);
    console.error('[ErrorBoundary] Stack trace:', errorInfo.componentStack);
    
    // Salvar estado do erro
    this.setState({ 
      error, 
      errorInfo 
    });

    // Em produção, você poderia enviar isso para um serviço de monitoramento
    if (!import.meta.env.DEV) {
      // Exemplo: Sentry, LogRocket, etc.
      console.error('Erro em produção:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // UI customizada de fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-xl border-red-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-700 mb-2">
                Oops! Algo deu errado
              </CardTitle>
              <p className="text-red-600">
                Ocorreu um erro inesperado na aplicação
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-gray-700">
                  Não se preocupe, isso acontece às vezes. Você pode tentar uma das opções abaixo:
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recarregar Página
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  <Home className="h-4 w-4" />
                  Ir ao Dashboard
                </Button>
              </div>
              
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Bug className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Detalhes do Erro (Desenvolvimento)</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Mensagem:</p>
                      <p className="text-sm text-red-600 bg-white p-2 rounded border font-mono">
                        {this.state.error.message}
                      </p>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Stack Trace:</p>
                        <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Component Stack:</p>
                        <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  Se o problema persistir, entre em contato com o suporte técnico
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Error ID: {Date.now()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;