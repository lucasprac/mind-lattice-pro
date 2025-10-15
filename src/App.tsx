import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
    },
  },
});

const App = () => {
  // Log de debug para rotas em desenvolvimento
  if (import.meta.env.DEV) {
    console.log('App rendered - current path:', window.location.pathname);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Rotas principais protegidas */}
              <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/patients" element={<ProtectedRoute><AppLayout><Patients /></AppLayout></ProtectedRoute>} />
              
              {/* Rotas de pacientes */}
              <Route path="/patients/:patientId" element={<ProtectedRoute><AppLayout><PatientRoadmapList /></AppLayout></ProtectedRoute>} />
              <Route path="/patients/:patientId/session/new" element={<ProtectedRoute><AppLayout><PatientSession /></AppLayout></ProtectedRoute>} />
              <Route path="/patients/:patientId/session/:recordId" element={<ProtectedRoute><AppLayout><PatientSession /></AppLayout></ProtectedRoute>} />
              
              {/* Rotas de sessões */}
              <Route path="/patients/:patientId/session/:recordId/roadmap" element={<ProtectedRoute><AppLayout><SessionRoadmap /></AppLayout></ProtectedRoute>} />
              <Route path="/patients/:patientId/session/:recordId/assessment" element={<ProtectedRoute><AppLayout><PatientAssessment /></AppLayout></ProtectedRoute>} />
              <Route path="/patients/:patientId/session/:recordId/network" element={<ProtectedRoute><AppLayout><SessionNetwork /></AppLayout></ProtectedRoute>} />
              <Route path="/patients/:patientId/session/:recordId/mediators" element={<ProtectedRoute><AppLayout><SessionMediators /></AppLayout></ProtectedRoute>} />
              <Route path="/patients/:patientId/session/:recordId/functional" element={<ProtectedRoute><AppLayout><PatientFunctionalAnalysis /></AppLayout></ProtectedRoute>} />
              
              {/* Rotas de ferramentas */}
              <Route path="/eemm" element={<ProtectedRoute><AppLayout><EEMMMatrix /></AppLayout></ProtectedRoute>} />
              <Route path="/networks" element={<ProtectedRoute><AppLayout><Networks /></AppLayout></ProtectedRoute>} />
              <Route path="/mediators" element={<ProtectedRoute><AppLayout><Mediators /></AppLayout></ProtectedRoute>} />
              <Route path="/functional-analysis" element={<ProtectedRoute><AppLayout><FunctionalAnalysis /></AppLayout></ProtectedRoute>} />
              <Route path="/interventions" element={<ProtectedRoute><AppLayout><Interventions /></AppLayout></ProtectedRoute>} />
              <Route path="/records" element={<ProtectedRoute><AppLayout><Records /></AppLayout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
              
              {/* Rota catch-all para 404 - DEVE SER A ÚNIMA */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;