import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Atualiza o state para mostrar a UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para debugging
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Em produção, você poderia enviar isso para um serviço de logging
    if (import.meta.env.PROD) {
      // Exemplo: logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  }

  handleReload = () => {
    window.location.reload();
  }

  handleGoHome = () => {
    window.location.href = '/dashboard';
  }

  render() {
    if (this.state.hasError) {
      // Fallback customizado ou padrão
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-xl border-red-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-900">Ops! Algo deu errado</CardTitle>
              <p className="text-red-700">Ocorreu um erro inesperado na aplicação</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-medium text-red-900 mb-2">Detalhes do erro:</h3>
                <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded break-words">
                  {this.state.error?.message || 'Erro desconhecido'}
                </p>
                
                {import.meta.env.DEV && this.state.errorInfo && (
                  <details className="mt-3">
                    <summary className="text-sm font-medium text-red-800 cursor-pointer hover:text-red-900">
                      Stack trace (desenvolvimento)
                    </summary>
                    <pre className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Home className="h-4 w-4" />
                  Voltar ao Início
                </Button>
              </div>
              
              <div className="pt-4 border-t border-red-200">
                <p className="text-xs text-red-500 text-center">
                  Se o problema persistir, recarregue a página ou entre em contato com o suporte.
                </p>
                <div className="mt-2 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={this.handleReload}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Recarregar Página
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook alternativo para componentes funcionais
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Erro capturado:', error, errorInfo);
    
    if (import.meta.env.PROD) {
      // Enviar para serviço de logging em produção
    }
  };

  return { handleError };
};