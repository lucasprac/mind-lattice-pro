/**
 * App Component - Ponto de entrada principal da aplicação
 * Implementa clean code com configurações otimizadas e imports organizados
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Import das páginas
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import EEMMMatrix from "./pages/EEMMMatrix";
import Networks from "./pages/Networks";
import Interventions from "./pages/Interventions";
import Records from "./pages/Records";
import Settings from "./pages/Settings";
import PatientRoadmapList from "./pages/PatientRoadmapList";
import PatientSession from "./pages/PatientSession";
import SessionRoadmap from "./pages/SessionRoadmap";
import SessionNetwork from "./pages/SessionNetwork";
import SessionMediators from "./pages/SessionMediators";
import PatientAssessment from "./pages/PatientAssessment";
import PatientFunctionalAnalysis from "./pages/PatientFunctionalAnalysis";
import Mediators from "./pages/Mediators";
import FunctionalAnalysis from "./pages/FunctionalAnalysis";
import NotFound from "./pages/NotFound";

// Configuração otimizada do React Query
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados permanecem fresh
      gcTime: 10 * 60 * 1000, // 10 minutos - garbage collection
      retry: (failureCount, error) => {
        // Não tentar novamente para erros de autenticação
        if (error && 'status' in error && error.status === 401) {
          return false;
        }
        // Limitar tentativas para evitar spam
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // Evitar refetch ao focar janela
      refetchOnReconnect: true // Refetch ao reconectar
    },
    mutations: {
      retry: 1 // Uma tentativa apenas para mutations
    }
  }
});

// Rotas da aplicação organizadas
const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  PATIENT_DETAIL: '/patients/:patientId',
  PATIENT_SESSION_NEW: '/patients/:patientId/session/new',
  PATIENT_SESSION: '/patients/:patientId/session/:recordId',
  SESSION_ROADMAP: '/patients/:patientId/session/:recordId/roadmap',
  SESSION_ASSESSMENT: '/patients/:patientId/session/:recordId/assessment',
  SESSION_NETWORK: '/patients/:patientId/session/:recordId/network',
  SESSION_MEDIATORS: '/patients/:patientId/session/:recordId/mediators',
  SESSION_FUNCTIONAL: '/patients/:patientId/session/:recordId/functional',
  EEMM_MATRIX: '/eemm',
  NETWORKS: '/networks',
  MEDIATORS: '/mediators',
  FUNCTIONAL_ANALYSIS: '/functional-analysis',
  INTERVENTIONS: '/interventions',
  RECORDS: '/records',
  SETTINGS: '/settings'
} as const;

// Wrapper para rotas protegidas - evita repetição de código
const ProtectedPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>
      {children}
    </AppLayout>
  </ProtectedRoute>
);

/**
 * Componente principal da aplicação
 * Implementa providers, roteamento e configurações globais
 */
const App = () => {
  const queryClient = createQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {/* Toast notifications */}
          <Toaster />
          <Sonner />
          
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas */}
              <Route path={ROUTES.HOME} element={<Index />} />
              <Route path={ROUTES.AUTH} element={<Auth />} />
              
              {/* Rotas protegidas */}
              <Route 
                path={ROUTES.DASHBOARD} 
                element={
                  <ProtectedPageWrapper>
                    <Dashboard />
                  </ProtectedPageWrapper>
                } 
              />
              
              {/* Gestão de Pacientes */}
              <Route 
                path={ROUTES.PATIENTS} 
                element={
                  <ProtectedPageWrapper>
                    <Patients />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.PATIENT_DETAIL} 
                element={
                  <ProtectedPageWrapper>
                    <PatientRoadmapList />
                  </ProtectedPageWrapper>
                } 
              />
              
              {/* Sessões */}
              <Route 
                path={ROUTES.PATIENT_SESSION_NEW} 
                element={
                  <ProtectedPageWrapper>
                    <PatientSession />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.PATIENT_SESSION} 
                element={
                  <ProtectedPageWrapper>
                    <PatientSession />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.SESSION_ROADMAP} 
                element={
                  <ProtectedPageWrapper>
                    <SessionRoadmap />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.SESSION_ASSESSMENT} 
                element={
                  <ProtectedPageWrapper>
                    <PatientAssessment />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.SESSION_NETWORK} 
                element={
                  <ProtectedPageWrapper>
                    <SessionNetwork />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.SESSION_MEDIATORS} 
                element={
                  <ProtectedPageWrapper>
                    <SessionMediators />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.SESSION_FUNCTIONAL} 
                element={
                  <ProtectedPageWrapper>
                    <PatientFunctionalAnalysis />
                  </ProtectedPageWrapper>
                } 
              />
              
              {/* Ferramentas de Análise */}
              <Route 
                path={ROUTES.EEMM_MATRIX} 
                element={
                  <ProtectedPageWrapper>
                    <EEMMMatrix />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.NETWORKS} 
                element={
                  <ProtectedPageWrapper>
                    <Networks />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.MEDIATORS} 
                element={
                  <ProtectedPageWrapper>
                    <Mediators />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.FUNCTIONAL_ANALYSIS} 
                element={
                  <ProtectedPageWrapper>
                    <FunctionalAnalysis />
                  </ProtectedPageWrapper>
                } 
              />
              
              {/* Outras funcionalidades */}
              <Route 
                path={ROUTES.INTERVENTIONS} 
                element={
                  <ProtectedPageWrapper>
                    <Interventions />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.RECORDS} 
                element={
                  <ProtectedPageWrapper>
                    <Records />
                  </ProtectedPageWrapper>
                } 
              />
              <Route 
                path={ROUTES.SETTINGS} 
                element={
                  <ProtectedPageWrapper>
                    <Settings />
                  </ProtectedPageWrapper>
                } 
              />
              
              {/* Catch-all route - deve ser sempre a última */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;