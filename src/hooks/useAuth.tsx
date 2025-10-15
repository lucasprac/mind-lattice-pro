import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  retryAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Debug logging em desenvolvimento
  const debugLog = useCallback((message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[AuthProvider] ${message}`, data || '');
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handler para mudanças de estado de auth
  const handleAuthStateChange = useCallback((event: string, newSession: Session | null) => {
    debugLog(`Auth state changed: ${event}`, { 
      userId: newSession?.user?.id, 
      hasSession: !!newSession,
      timestamp: new Date().toISOString()
    });

    try {
      // Atualizar estados de forma atômica
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setError(null);
      setRetryCount(0); // Reset retry count on successful auth change
      
      // Garantir que loading seja false apenas após inicialização
      if (initialized) {
        setLoading(false);
      }
    } catch (err) {
      debugLog('Erro ao processar mudança de estado auth:', err);
      setError('Erro interno de autenticação');
      setLoading(false);
    }
  }, [initialized, debugLog]);

  // Inicializar autenticação com retry
  const initializeAuth = useCallback(async (currentRetryCount = 0) => {
    const MAX_RETRIES = 3;
    
    try {
      debugLog('Inicializando autenticação...', { 
        retryCount: currentRetryCount,
        maxRetries: MAX_RETRIES 
      });
      
      setLoading(true);
      setError(null);

      // Configurar listener de mudanças de estado (apenas uma vez)
      if (currentRetryCount === 0) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
        
        // Retornar cleanup function
        return subscription;
      }

      // Obter sessão inicial com timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na obtenção da sessão')), 10000)
      );

      const { data: { session: initialSession }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]);

      if (sessionError) {
        throw sessionError;
      }

      debugLog('Sessão inicial obtida com sucesso:', { 
        hasSession: !!initialSession,
        userId: initialSession?.user?.id 
      });

      // Atualizar estados
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setInitialized(true);
      setLoading(false);
      setRetryCount(currentRetryCount);

      return null; // No subscription to return on retry
    } catch (err: any) {
      debugLog('Erro na inicialização auth:', { error: err.message, retryCount: currentRetryCount });
      
      if (currentRetryCount < MAX_RETRIES) {
        debugLog(`Tentando novamente... (${currentRetryCount + 1}/${MAX_RETRIES})`);
        
        // Retry com backoff exponencial
        const delay = Math.min(1000 * Math.pow(2, currentRetryCount), 5000);
        setTimeout(() => {
          initializeAuth(currentRetryCount + 1);
        }, delay);
        
        return null;
      }

      // Max retries atingido
      const errorMessage = `Erro ao inicializar autenticação após ${MAX_RETRIES} tentativas: ${err.message}`;
      setError(errorMessage);
      setLoading(false);
      setInitialized(true);
      setRetryCount(currentRetryCount);
      
      return null;
    }
  }, [handleAuthStateChange, debugLog]);

  // Retry manual de autenticação
  const retryAuth = useCallback(async () => {
    debugLog('Retry de autenticação solicitado pelo usuário');
    setInitialized(false);
    setRetryCount(0);
    await initializeAuth(0);
  }, [initializeAuth, debugLog]);

  // Efeito de inicialização
  useEffect(() => {
    let subscription: any;
    let mounted = true;
    
    const setup = async () => {
      if (!mounted) return;
      
      try {
        subscription = await initializeAuth(0);
      } catch (error) {
        debugLog('Erro no setup inicial:', error);
        if (mounted) {
          setError('Erro no setup de autenticação');
          setLoading(false);
        }
      }
    };
    
    setup();

    // Cleanup
    return () => {
      mounted = false;
      if (subscription) {
        debugLog('Removendo listener de auth');
        try {
          subscription.unsubscribe();
        } catch (error) {
          debugLog('Erro ao remover subscription:', error);
        }
      }
    };
  }, []); // Empty deps - apenas executar uma vez

  // Sign out
  const signOut = useCallback(async () => {
    try {
      debugLog('Iniciando logout');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      debugLog('Logout realizado com sucesso');
      
      // Estados serão atualizados pelo handleAuthStateChange
    } catch (err: any) {
      debugLog('Erro no logout:', err);
      setError(`Erro ao sair: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [debugLog]);

  // Prevenir renderização de children se houver erro crítico não resolvido
  if (error && !initialized && retryCount >= 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6 max-w-md mx-auto">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-destructive mb-2">Erro de Autenticação</h2>
            <p className="text-sm text-destructive/80 mb-4">{error}</p>
            <div className="space-y-2">
              <button 
                onClick={retryAuth}
                className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
              >
                Tentar Novamente
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signOut,
    retryAuth,
    clearError
  };

  debugLog('AuthProvider renderizando:', { 
    hasUser: !!user, 
    loading, 
    initialized, 
    error: !!error,
    retryCount
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};