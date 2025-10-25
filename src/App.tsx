import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "@/shared/hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ROUTES } from "@/shared/constants/app.constants";
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

// Configurar Query Client com opções otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (renomeado de cacheTime)
      retry: (failureCount, error) => {
        // Não tentar novamente para erros 401 (não autorizado)
        if (error && 'status' in error && error.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false // Evitar refetch desnecessários
    },
    mutations: {
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.HOME} element={<Index />} />
            <Route path={ROUTES.AUTH} element={<Auth />} />
            <Route 
              path={ROUTES.DASHBOARD} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.PATIENTS} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Patients />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.PATIENT_DETAIL} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PatientRoadmapList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.PATIENT_SESSION_NEW} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PatientSession />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.PATIENT_SESSION} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PatientSession />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.SESSION_ROADMAP} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SessionRoadmap />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.SESSION_ASSESSMENT} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PatientAssessment />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.SESSION_NETWORK} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SessionNetwork />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.SESSION_MEDIATORS} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SessionMediators />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.SESSION_FUNCTIONAL} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PatientFunctionalAnalysis />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.EEMM_MATRIX} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EEMMMatrix />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.NETWORKS} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Networks />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.MEDIATORS} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Mediators />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.FUNCTIONAL_ANALYSIS} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <FunctionalAnalysis />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.INTERVENTIONS} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Interventions />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.RECORDS} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Records />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.SETTINGS} 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            {/* Catch-all route deve ser a última */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;