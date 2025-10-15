import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Não tentar novamente para erros 404
        if (error?.status === 404) return false;
        // Tentar até 3 vezes para outros erros
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false, // Evitar refetch desnecessário
      refetchOnMount: true,
    },
    mutations: {
      retry: 1, // Tentar apenas 1 vez em mutações
    },
  },
});

const App = () => {
  // Log de debug para rotas em desenvolvimento
  if (import.meta.env.DEV) {
    console.log('App rendered - current path:', window.location.pathname);
    console.log('Environment:', {
      mode: import.meta.env.MODE,
      prod: import.meta.env.PROD,
      dev: import.meta.env.DEV
    });
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AuthProvider>
            <ErrorBoundary>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ErrorBoundary>
                    <Routes>
                      {/* Rotas públicas */}
                      <Route 
                        path="/" 
                        element={
                          <ErrorBoundary>
                            <Index />
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/auth" 
                        element={
                          <ErrorBoundary>
                            <Auth />
                          </ErrorBoundary>
                        } 
                      />
                      
                      {/* Rotas principais protegidas */}
                      <Route 
                        path="/dashboard" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <Dashboard />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/patients" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <Patients />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      
                      {/* Rotas de pacientes */}
                      <Route 
                        path="/patients/:patientId" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <PatientRoadmapList />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/patients/:patientId/session/new" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <PatientSession />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/patients/:patientId/session/:recordId" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <PatientSession />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      
                      {/* Rotas de sessões */}
                      <Route 
                        path="/patients/:patientId/session/:recordId/roadmap" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <SessionRoadmap />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/patients/:patientId/session/:recordId/assessment" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <PatientAssessment />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/patients/:patientId/session/:recordId/network" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <SessionNetwork />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/patients/:patientId/session/:recordId/mediators" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <SessionMediators />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/patients/:patientId/session/:recordId/functional" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <PatientFunctionalAnalysis />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      
                      {/* Rotas de ferramentas */}
                      <Route 
                        path="/eemm" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <EEMMMatrix />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/networks" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <Networks />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/mediators" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <Mediators />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/functional-analysis" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <FunctionalAnalysis />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/interventions" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <Interventions />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/records" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <Records />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/settings" 
                        element={
                          <ErrorBoundary>
                            <ProtectedRoute>
                              <AppLayout>
                                <Settings />
                              </AppLayout>
                            </ProtectedRoute>
                          </ErrorBoundary>
                        } 
                      />
                      
                      {/* Rota catch-all para 404 - DEVE SER A ÚNIMA */}
                      <Route 
                        path="*" 
                        element={
                          <ErrorBoundary>
                            <NotFound />
                          </ErrorBoundary>
                        } 
                      />
                    </Routes>
                  </ErrorBoundary>
                </BrowserRouter>
              </TooltipProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;