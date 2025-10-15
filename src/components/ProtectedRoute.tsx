import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, error, retryAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Debug logging
  const debugLog = (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[ProtectedRoute] ${message}`, data || '');
    }
  };

  // Timeout para loading excessivo
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        debugLog('Loading timeout detectado');
        setLoadingTimeout(true);
      }, 15000); // 15 segundos

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  // Efeito de redirecionamento
  useEffect(() => {
    debugLog('Estado atual:', { 
      user: !!user, 
      loading, 
      error: !!error, 
      pathname: location.pathname,
      redirectAttempted 
    });

    // Não redirecionar se ainda está carregando ou se já tentou redirecionar
    if (loading || redirectAttempted || error) {
      return;
    }

    // Se não há usuário autenticado, redirecionar para /auth
    if (!user) {
      debugLog('Usuário não autenticado, redirecionando para /auth');
      setRedirectAttempted(true);
      
      // Salvar a rota atual para redirecionamento após login
      const currentPath = location.pathname !== '/auth' ? location.pathname : '/dashboard';
      navigate('/auth', { 
        state: { from: currentPath },
        replace: true 
      });
    }
  }, [user, loading, navigate, location.pathname, redirectAttempted, error]);

  // Reset redirect flag quando user state mudar
  useEffect(() => {
    if (user) {
      setRedirectAttempted(false);
    }
  }, [user]);

  // Tela de erro com retry
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Erro de Autenticação</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Houve um problema ao verificar sua autenticação. Tente novamente.
            </p>
            <div className="space-y-2">
              <Button onClick={retryAuth} className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')} 
                className="w-full"
              >
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de loading com timeout
  if (loading || loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            {loadingTimeout && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
            )}
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {loadingTimeout ? 'Carregamento demorado...' : 'Verificando autenticação...'}
            </p>
            <p className="text-sm text-muted-foreground">
              {loadingTimeout 
                ? 'Se o problema persistir, tente recarregar a página' 
                : 'Aguarde um momento'
              }
            </p>
          </div>
          
          {loadingTimeout && (
            <div className="pt-4 space-y-2">
              <Button 
                variant="outline" 
                onClick={retryAuth}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                Recarregar Página
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Se não há usuário mas não está carregando, aguardar o redirecionamento
  if (!user) {
    debugLog('Aguardando redirecionamento...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Usuário autenticado, renderizar children
  debugLog('Renderizando conteúdo protegido para usuário autenticado');
  return <>{children}</>;
};