import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  retryAuth: () => Promise<void>;
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

  // Debug logging em desenvolvimento
  const debugLog = (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[AuthProvider] ${message}`, data || '');
    }
  };

  const handleAuthStateChange = (event: string, newSession: Session | null) => {
    debugLog(`Auth state changed: ${event}`, { 
      userId: newSession?.user?.id, 
      hasSession: !!newSession 
    });

    try {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setError(null);
      
      // Garantir que loading seja false após mudança de estado
      if (initialized) {
        setLoading(false);
      }
    } catch (err) {
      debugLog('Erro ao processar mudança de estado auth:', err);
      setError('Erro interno de autenticação');
      setLoading(false);
    }
  };

  const initializeAuth = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    
    try {
      debugLog('Inicializando autenticação...', { retryCount });
      setLoading(true);
      setError(null);

      // Configurar listener de mudanças de estado
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

      // Obter sessão inicial com timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na obtenção da sessão')), 10000)
      );

      const { data: { session: initialSession }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;

      if (sessionError) {
        throw sessionError;
      }

      debugLog('Sessão inicial obtida:', { 
        hasSession: !!initialSession,
        userId: initialSession?.user?.id 
      });

      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setInitialized(true);
      setLoading(false);

      return subscription;
    } catch (err: any) {
      debugLog('Erro na inicialização auth:', err);
      
      if (retryCount < MAX_RETRIES) {
        debugLog(`Tentando novamente... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => initializeAuth(retryCount + 1), 1000 * (retryCount + 1));
        return null;
      }

      setError(`Erro ao inicializar autenticação: ${err.message}`);
      setLoading(false);
      setInitialized(true);
      return null;
    }
  };

  const retryAuth = async () => {
    debugLog('Retry de autenticação solicitado');
    setInitialized(false);
    await initializeAuth();
  };

  useEffect(() => {
    let subscription: any;
    
    const setup = async () => {
      subscription = await initializeAuth();
    };
    
    setup();

    // Cleanup
    return () => {
      if (subscription) {
        debugLog('Removendo listener de auth');
        subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      debugLog('Iniciando logout');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      debugLog('Logout realizado com sucesso');
    } catch (err: any) {
      debugLog('Erro no logout:', err);
      setError(`Erro ao sair: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Prevenir renderização de children se houver erro crítico não resolvido
  if (error && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6 max-w-md mx-auto">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-destructive mb-2">Erro de Autenticação</h2>
            <p className="text-sm text-destructive/80 mb-4">{error}</p>
            <button 
              onClick={retryAuth}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
            >
              Tentar Novamente
            </button>
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
    retryAuth
  };

  debugLog('AuthProvider renderizando:', { 
    hasUser: !!user, 
    loading, 
    initialized, 
    error: !!error 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};