import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RoadmapStep } from '@/types';
import { useLocation, useNavigate } from 'react-router-dom';

// ===========================
// INTERFACES
// ===========================

interface RoadmapContextType {
  currentStep: number;
  completedSteps: number[];
  steps: RoadmapStep[];
  canAdvanceTo: (step: number) => boolean;
  markStepAsCompleted: (step: number) => void;
  navigateToStep: (step: number) => void;
  getStepStatus: (step: number) => 'completed' | 'active' | 'locked' | 'available';
  resetProgress: () => void;
  getTotalProgress: () => number;
  getCurrentStepInfo: () => RoadmapStep | null;
}

interface RoadmapProviderProps {
  children: ReactNode;
  sessionId?: string;
}

// ===========================
// DEFAULT STEPS
// ===========================

const DEFAULT_STEPS: Omit<RoadmapStep, 'isCompleted' | 'isActive' | 'canAccess'>[] = [
  {
    id: 1,
    title: 'Informações da Sessão',
    description: 'Configure os detalhes básicos da sessão terapêutica',
  },
  {
    id: 2,
    title: 'Formulário PBAT',
    description: 'Complete a avaliação de qualidade de vida do paciente',
  },
  {
    id: 3,
    title: 'Rede de Relações',
    description: 'Construa o mapa visual das relações comportamentais',
  },
  {
    id: 4,
    title: 'Mediadores',
    description: 'Identifique e configure os mediadores terapêuticos',
  },
  {
    id: 5,
    title: 'Revisão e Finalização',
    description: 'Revise todos os dados e finalize a sessão',
  },
];

// ===========================
// CONTEXT
// ===========================

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

// ===========================
// PROVIDER
// ===========================

export const RoadmapProvider: React.FC<RoadmapProviderProps> = ({ 
  children, 
  sessionId 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Inicializar ou restaurar progresso
  useEffect(() => {
    if (sessionId) {
      const savedProgress = localStorage.getItem(`roadmap_progress_${sessionId}`);
      if (savedProgress) {
        try {
          const { currentStep: saved, completedSteps: savedCompleted } = JSON.parse(savedProgress);
          setCurrentStep(saved || 1);
          setCompletedSteps(savedCompleted || []);
        } catch (error) {
          console.warn('Erro ao restaurar progresso do roadmap:', error);
        }
      }
    }
  }, [sessionId]);

  // Salvar progresso automaticamente
  useEffect(() => {
    if (sessionId) {
      const progress = {
        currentStep,
        completedSteps,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`roadmap_progress_${sessionId}`, JSON.stringify(progress));
    }
  }, [currentStep, completedSteps, sessionId]);

  // Sincronizar com rota atual
  useEffect(() => {
    const path = location.pathname;
    
    // Mapear rotas para etapas
    const routeStepMapping: Record<string, number> = {
      '/session': 1,
      '/pbat': 2,
      '/network': 3,
      '/mediators': 4,
      '/review': 5,
    };

    const matchedStep = Object.entries(routeStepMapping).find(([route]) => 
      path.includes(route)
    )?.[1];

    if (matchedStep && matchedStep !== currentStep) {
      setCurrentStep(matchedStep);
    }
  }, [location.pathname, currentStep]);

  // Funções do contexto
  const canAdvanceTo = (step: number): boolean => {
    if (step === 1) return true;
    if (step <= currentStep + 1) return true;
    return completedSteps.includes(step - 1);
  };

  const markStepAsCompleted = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step].sort((a, b) => a - b));
    }
  };

  const navigateToStep = (step: number) => {
    if (!canAdvanceTo(step)) {
      console.warn(`Não é possível navegar para a etapa ${step}`);
      return;
    }

    setCurrentStep(step);

    // Navegar para a rota correspondente
    const stepRoutes: Record<number, string> = {
      1: sessionId ? `/session/${sessionId}` : '/session',
      2: sessionId ? `/session/${sessionId}/pbat` : '/pbat',
      3: sessionId ? `/session/${sessionId}/network` : '/network',
      4: sessionId ? `/session/${sessionId}/mediators` : '/mediators',
      5: sessionId ? `/session/${sessionId}/review` : '/review',
    };

    const route = stepRoutes[step];
    if (route && location.pathname !== route) {
      navigate(route);
    }
  };

  const getStepStatus = (step: number) => {
    if (completedSteps.includes(step)) return 'completed';
    if (step === currentStep) return 'active';
    if (canAdvanceTo(step)) return 'available';
    return 'locked';
  };

  const resetProgress = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    if (sessionId) {
      localStorage.removeItem(`roadmap_progress_${sessionId}`);
    }
  };

  const getTotalProgress = (): number => {
    return Math.round((completedSteps.length / DEFAULT_STEPS.length) * 100);
  };

  const getCurrentStepInfo = (): RoadmapStep | null => {
    const baseStep = DEFAULT_STEPS.find(step => step.id === currentStep);
    if (!baseStep) return null;

    return {
      ...baseStep,
      isCompleted: completedSteps.includes(currentStep),
      isActive: true,
      canAccess: canAdvanceTo(currentStep),
    };
  };

  // Gerar steps com status calculado
  const steps: RoadmapStep[] = DEFAULT_STEPS.map(step => ({
    ...step,
    isCompleted: completedSteps.includes(step.id),
    isActive: step.id === currentStep,
    canAccess: canAdvanceTo(step.id),
  }));

  const contextValue: RoadmapContextType = {
    currentStep,
    completedSteps,
    steps,
    canAdvanceTo,
    markStepAsCompleted,
    navigateToStep,
    getStepStatus,
    resetProgress,
    getTotalProgress,
    getCurrentStepInfo,
  };

  return (
    <RoadmapContext.Provider value={contextValue}>
      {children}
    </RoadmapContext.Provider>
  );
};

// ===========================
// HOOK
// ===========================

export const useRoadmap = (): RoadmapContextType => {
  const context = useContext(RoadmapContext);
  if (context === undefined) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
};

// ===========================
// UTILIDADES
// ===========================

/**
 * Hook para auto-completar etapas com base em condições
 */
export const useAutoCompleteSteps = () => {
  const { markStepAsCompleted } = useRoadmap();

  const completeStepIf = (step: number, condition: boolean) => {
    if (condition) {
      markStepAsCompleted(step);
    }
  };

  return { completeStepIf };
};

/**
 * Hook para navegação com validação
 */
export const useRoadmapNavigation = () => {
  const { navigateToStep, canAdvanceTo, currentStep } = useRoadmap();

  const goNext = () => {
    const nextStep = currentStep + 1;
    if (canAdvanceTo(nextStep)) {
      navigateToStep(nextStep);
    }
  };

  const goPrevious = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      navigateToStep(prevStep);
    }
  };

  const canGoNext = () => canAdvanceTo(currentStep + 1);
  const canGoPrevious = () => currentStep > 1;

  return {
    goNext,
    goPrevious,
    canGoNext,
    canGoPrevious,
    navigateToStep,
  };
};
