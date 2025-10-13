import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardSkeleton } from '@/components/ui/skeleton';

// ===========================
// LAZY IMPORTS
// ===========================

// Páginas principais - carregamento imediato
import Index from './pages/Index';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

// Páginas secundárias - lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Patients = lazy(() => import('./pages/Patients'));
const EEMMMatrix = lazy(() => import('./pages/EEMMMatrix'));
const Networks = lazy(() => import('./pages/Networks'));
const Interventions = lazy(() => import('./pages/Interventions'));
const Records = lazy(() => import('./pages/Records'));
const Settings = lazy(() => import('./pages/Settings'));

// Páginas de sessão - lazy loading
const PatientRoadmapList = lazy(() => import('./pages/PatientRoadmapList'));
const PatientSession = lazy(() => import('./pages/PatientSession'));
const SessionRoadmap = lazy(() => import('./pages/SessionRoadmap'));
const SessionNetwork = lazy(() => import('./pages/SessionNetwork'));
const SessionMediators = lazy(() => import('./pages/SessionMediators'));
const PatientAssessment = lazy(() => import('./pages/PatientAssessment'));
const PatientFunctionalAnalysis = lazy(() => import('./pages/PatientFunctionalAnalysis'));

// Páginas avançadas - lazy loading
const Mediators = lazy(() => import('./pages/Mediators'));
const FunctionalAnalysis = lazy(() => import('./pages/FunctionalAnalysis'));
const MachineLearning = lazy(() => import('./pages/MachineLearning'));

// ===========================
// QUERY CLIENT CONFIG
// ===========================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Manter cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Não refetch automaticamente no foco da janela
      refetchOnWindowFocus: false,
      // Retry apenas 2 vezes
      retry: 2,
      // Intervalo de retry
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations apenas 1 vez
      retry: 1,
    },
  },
});

// ===========================
// LOADING COMPONENTS
// ===========================

const PageSkeleton = () => (
  <div className="p-6">
    <DashboardSkeleton />
  </div>
);

const AppSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-muted rounded mx-auto mb-4" />
        <div className="h-4 w-48 bg-muted rounded mx-auto" />
      </div>
      <p className="text-sm text-muted-foreground">Carregando Mind Lattice Pro...</p>
    </div>
  </div>
);

// ===========================
// PROTECTED ROUTE WRAPPER
// ===========================

const ProtectedPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>
      <Suspense fallback={<PageSkeleton />}>
        {children}
      </Suspense>
    </AppLayout>
  </ProtectedRoute>
);

// ===========================
// MAIN APP COMPONENT
// ===========================

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            
            <BrowserRouter>
              <Suspense fallback={<AppSkeleton />}>
                <Routes>
                  {/* Páginas públicas */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Dashboard */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedPageWrapper>
                        <Dashboard />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  {/* Pacientes */}
                  <Route 
                    path="/patients" 
                    element={
                      <ProtectedPageWrapper>
                        <Patients />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/patients/:patientId" 
                    element={
                      <ProtectedPageWrapper>
                        <PatientRoadmapList />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  {/* Prontuário do paciente */}
                  <Route 
                    path="/patients/:patientId/records" 
                    element={
                      <ProtectedPageWrapper>
                        <Records />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  {/* Sessões */}
                  <Route 
                    path="/patients/:patientId/session/new" 
                    element={
                      <ProtectedPageWrapper>
                        <PatientSession />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/patients/:patientId/session/:recordId" 
                    element={
                      <ProtectedPageWrapper>
                        <PatientSession />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/patients/:patientId/session/:recordId/roadmap" 
                    element={
                      <ProtectedPageWrapper>
                        <SessionRoadmap />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/patients/:patientId/session/:recordId/assessment" 
                    element={
                      <ProtectedPageWrapper>
                        <PatientAssessment />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/patients/:patientId/session/:recordId/network" 
                    element={
                      <ProtectedPageWrapper>
                        <SessionNetwork />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/patients/:patientId/session/:recordId/mediators" 
                    element={
                      <ProtectedPageWrapper>
                        <SessionMediators />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/patients/:patientId/session/:recordId/functional" 
                    element={
                      <ProtectedPageWrapper>
                        <PatientFunctionalAnalysis />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  {/* Ferramentas */}
                  <Route 
                    path="/eemm" 
                    element={
                      <ProtectedPageWrapper>
                        <EEMMMatrix />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/networks" 
                    element={
                      <ProtectedPageWrapper>
                        <Networks />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/mediators" 
                    element={
                      <ProtectedPageWrapper>
                        <Mediators />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/functional-analysis" 
                    element={
                      <ProtectedPageWrapper>
                        <FunctionalAnalysis />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/interventions" 
                    element={
                      <ProtectedPageWrapper>
                        <Interventions />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/records" 
                    element={
                      <ProtectedPageWrapper>
                        <Records />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/machine-learning" 
                    element={
                      <ProtectedPageWrapper>
                        <MachineLearning />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedPageWrapper>
                        <Settings />
                      </ProtectedPageWrapper>
                    } 
                  />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            
            {/* React Query DevTools - apenas em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;