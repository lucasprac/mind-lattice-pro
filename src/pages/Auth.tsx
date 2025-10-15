import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa"),
  fullName: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo").optional(),
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  // Página de destino após login
  const redirectTo = (location.state as any)?.from || "/dashboard";

  // Debug logging
  const debugLog = (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[Auth] ${message}`, data || '');
    }
  };

  // Verificar se usuário já está autenticado
  useEffect(() => {
    const checkAndRedirectUser = async () => {
      if (!loading && user && !isRedirecting) {
        debugLog('Usuário já autenticado, redirecionando...', { 
          userId: user.id, 
          redirectTo 
        });
        
        setIsRedirecting(true);
        
        // Pequeno delay para evitar tela branca
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 500);
      }
    };

    checkAndRedirectUser();
  }, [user, loading, navigate, redirectTo, isRedirecting]);

  const handleSuccessfulAuth = async (message: string) => {
    try {
      debugLog('Login bem-sucedido, iniciando redirecionamento...');
      
      toast({
        title: "Sucesso!",
        description: message,
      });

      setIsRedirecting(true);
      
      // Aguardar um momento para o estado ser atualizado
      setTimeout(() => {
        debugLog('Executando redirecionamento para:', redirectTo);
        navigate(redirectTo, { replace: true });
      }, 1000);
      
    } catch (error) {
      debugLog('Erro no redirecionamento:', error);
      toast({
        variant: "destructive",
        title: "Erro no redirecionamento",
        description: "Tente recarregar a página",
      });
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || isRedirecting) return;
    
    setIsLoading(true);
    debugLog('Iniciando processo de login...');

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const validation = authSchema.omit({ fullName: true }).parse({ email, password });
      
      debugLog('Dados validados, fazendo login no Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validation.email,
        password: validation.password,
      });

      if (error) {
        debugLog('Erro no login:', error);
        throw error;
      }

      if (data.user) {
        debugLog('Login realizado com sucesso:', { userId: data.user.id });
        await handleSuccessfulAuth("Login realizado com sucesso! Redirecionando...");
      }
    } catch (error: any) {
      debugLog('Erro capturado:', error);
      setIsLoading(false);
      
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: error.errors[0]?.message || "Verifique os dados inseridos",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: error.message === "Invalid login credentials" 
            ? "Email ou senha incorretos" 
            : error.message,
        });
      }
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || isRedirecting) return;
    
    setIsLoading(true);
    debugLog('Iniciando processo de cadastro...');

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    try {
      const validation = authSchema.parse({ email, password, fullName });
      
      debugLog('Dados validados, fazendo cadastro no Supabase...');
      const { data, error } = await supabase.auth.signUp({
        email: validation.email,
        password: validation.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validation.fullName,
          },
        },
      });

      if (error) {
        debugLog('Erro no cadastro:', error);
        throw error;
      }

      if (data.user) {
        debugLog('Cadastro realizado com sucesso:', { userId: data.user.id });
        await handleSuccessfulAuth("Cadastro realizado com sucesso! Redirecionando...");
      }
    } catch (error: any) {
      debugLog('Erro capturado:', error);
      setIsLoading(false);
      
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: error.errors[0]?.message || "Verifique os dados inseridos",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: error.message === "User already registered" 
            ? "Este email já está cadastrado" 
            : error.message,
        });
      }
    }
  };

  // Mostrar loading se já está autenticado ou redirecionando
  if (loading || (user && !isRedirecting)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar tela de redirecionamento
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Login realizado com sucesso!</p>
            <p className="text-muted-foreground">Redirecionando para o sistema...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Sistema PBT
          </h1>
          <p className="text-muted-foreground mt-2">
            Acesse sua conta para continuar
          </p>
          {redirectTo !== "/dashboard" && (
            <p className="text-xs text-muted-foreground mt-1">
              Você será redirecionado para: {redirectTo}
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Autenticação</CardTitle>
            <CardDescription>
              Entre com sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" disabled={isLoading}>Entrar</TabsTrigger>
                <TabsTrigger value="signup" disabled={isLoading}>Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      maxLength={255}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="Sua senha"
                      required
                      minLength={6}
                      maxLength={100}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      required
                      minLength={2}
                      maxLength={100}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      maxLength={255}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      maxLength={100}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Criando Conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            disabled={isLoading}
          >
            ← Voltar para página inicial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;