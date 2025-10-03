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
import PatientRoadmap from "./pages/PatientRoadmap";
import PatientNetwork from "./pages/PatientNetwork";
import PatientMediators from "./pages/PatientMediators";
import PatientFunctionalAnalysis from "./pages/PatientFunctionalAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><AppLayout><Patients /></AppLayout></ProtectedRoute>} />
            <Route path="/patients/:patientId" element={<ProtectedRoute><AppLayout><PatientRoadmap /></AppLayout></ProtectedRoute>} />
            <Route path="/patients/:patientId/network" element={<ProtectedRoute><AppLayout><PatientNetwork /></AppLayout></ProtectedRoute>} />
            <Route path="/patients/:patientId/mediators" element={<ProtectedRoute><AppLayout><PatientMediators /></AppLayout></ProtectedRoute>} />
            <Route path="/patients/:patientId/functional" element={<ProtectedRoute><AppLayout><PatientFunctionalAnalysis /></AppLayout></ProtectedRoute>} />
            <Route path="/eemm" element={<ProtectedRoute><AppLayout><EEMMMatrix /></AppLayout></ProtectedRoute>} />
            <Route path="/networks" element={<ProtectedRoute><AppLayout><Networks /></AppLayout></ProtectedRoute>} />
            <Route path="/interventions" element={<ProtectedRoute><AppLayout><Interventions /></AppLayout></ProtectedRoute>} />
            <Route path="/records" element={<ProtectedRoute><AppLayout><Records /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
