/**
 * Hook de autenticação refatorado
 * Inclui melhor tratamento de erros, logs e otimizações
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthSignInInput, AuthSignUpInput } from '@/shared/schemas/validation.schemas';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/shared/constants/app.constants';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: AuthSignInInput) => Promise<{ success: boolean; error?: string }>;
  signUp: (credentials: AuthSignUpInput) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticação melhorado
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!session;

  /**
   * Trata erros de autenticação de forma padronizada
   */
  const handleAuthError = useCallback((error: AuthError | Error): string => {
    console.error('Erro de autenticação:', error);
    
    // Mapear códigos de erro específicos
    if ('message' in error) {
      switch (error.message) {
        case 'Invalid login credentials':
          return 'Credenciais inválidas. Verifique seu email e senha.';
        case 'Email not confirmed':
          return 'Email não confirmado. Verifique sua caixa de entrada.';
        case 'User already registered':
          return 'Usuário já cadastrado com este email.';
        case 'Password should be at least 6 characters':
          return 'A senha deve ter pelo menos 6 caracteres.';
        case 'Only an email address is allowed':
          return 'Formato de email inválido.';
        case 'Signup is disabled':
          return 'Cadastro desabilitado no momento.';
        default:
          if (error.message.includes('rate limit')) {
            return 'Muitas tentativas. Tente novamente em alguns minutos.';
          }
          return error.message;
      }
    }
    
    return ERROR_MESSAGES.SERVER_ERROR;
  }, []);

  /**
   * Função de login
   */
  const signIn = useCallback(async (credentials: AuthSignInInput) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        const errorMessage = handleAuthError(error);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (data.user && data.session) {
        toast.success('Login realizado com sucesso!');
        return { success: true };
      }

      return { success: false, error: ERROR_MESSAGES.SERVER_ERROR };
    } catch (error) {
      const errorMessage = handleAuthError(error as Error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  /**
   * Função de cadastro
   */
  const signUp = useCallback(async (credentials: AuthSignUpInput) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        const errorMessage = handleAuthError(error);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          toast.success('Conta criada com sucesso!');
        } else {
          toast.success('Conta criada! Verifique seu email para ativá-la.');
        }
        return { success: true };
      }

      return { success: false, error: ERROR_MESSAGES.SERVER_ERROR };
    } catch (error) {
      const errorMessage = handleAuthError(error as Error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  /**
   * Função de logout
   */
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
        toast.error('Erro ao fazer logout');
      } else {
        toast.success('Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
      toast.error('Erro inesperado ao fazer logout');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Função para resetar senha
   */
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      });

      if (error) {
        const errorMessage = handleAuthError(error);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      toast.success('Email de recuperação enviado!');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error as Error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [handleAuthError]);

  /**
   * Efeito para gerenciar estado de autenticação
   */
  useEffect(() => {
    let mounted = true;

    // Configura listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Logs detalhados apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          if (event === 'SIGNED_IN') {
            console.log('Usuário logado:', session?.user?.email);
          } else if (event === 'SIGNED_OUT') {
            console.log('Usuário deslogado');
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token renovado');
          }
        }
        
        setLoading(false);
      }
    );

    // Obtém sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Erro ao obter sessão inicial:', error);
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro inesperado ao obter sessão:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};