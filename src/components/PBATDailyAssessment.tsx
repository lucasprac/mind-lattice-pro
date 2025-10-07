import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { usePBATResponses } from '@/hooks/usePBATResponses';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PBATQuestion {
  id: string;
  question: string;
  description?: string;
}

const PBAT_QUESTIONS: PBATQuestion[] = [
  {
    id: 'mood',
    question: 'Como está seu humor hoje?',
    description: '1 = Muito ruim, 5 = Excelente'
  },
  {
    id: 'energy',
    question: 'Qual seu nível de energia?',
    description: '1 = Muito baixo, 5 = Muito alto'
  },
  {
    id: 'anxiety',
    question: 'Como está sua ansiedade?',
    description: '1 = Nenhuma, 5 = Muito alta'
  },
  {
    id: 'sleep_quality',
    question: 'Como foi a qualidade do seu sono?',
    description: '1 = Muito ruim, 5 = Excelente'
  },
  {
    id: 'stress',
    question: 'Qual seu nível de estresse?',
    description: '1 = Nenhum, 5 = Muito alto'
  },
  {
    id: 'concentration',
    question: 'Como está sua capacidade de concentração?',
    description: '1 = Muito baixa, 5 = Excelente'
  },
  {
    id: 'motivation',
    question: 'Qual seu nível de motivação?',
    description: '1 = Nenhuma, 5 = Muito alta'
  },
  {
    id: 'social_interaction',
    question: 'Como foram suas interações sociais?',
    description: '1 = Muito difíceis, 5 = Muito boas'
  }
];

interface FormValues {
  [key: string]: number;
}

export const PBATDailyAssessment: React.FC = () => {
  const { responses, addResponse, hasResponseForToday, loading } = usePBATResponses();
  const [formValues, setFormValues] = useState<FormValues>(
    PBAT_QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: 3 }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    if (!loading) {
      const completedToday = hasResponseForToday();
      setAlreadyCompleted(completedToday);
    }
  }, [loading, hasResponseForToday, responses]);

  const handleSliderChange = (questionId: string, value: number[]) => {
    setFormValues(prev => ({
      ...prev,
      [questionId]: value[0]
    }));
  };

  const validateForm = (): boolean => {
    return PBAT_QUESTIONS.every(q => {
      const value = formValues[q.id];
      return value >= 1 && value <= 5;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitError('Por favor, responda todas as perguntas.');
      return;
    }

    if (alreadyCompleted) {
      setSubmitError('Você já completou a avaliação de hoje.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addResponse({
        date: new Date().toISOString(),
        responses: formValues,
        timestamp: Date.now()
      });
      
      setSubmitSuccess(true);
      setAlreadyCompleted(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting PBAT assessment:', error);
      setSubmitError('Erro ao salvar a avaliação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormValues(
      PBAT_QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: 3 }), {})
    );
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Avaliação Diária PBAT</CardTitle>
        <CardDescription>
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alreadyCompleted && !submitSuccess && (
          <Alert className="mb-6">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Você já completou sua avaliação de hoje. Volte amanhã para uma nova avaliação.
            </AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Avaliação salva com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {PBAT_QUESTIONS.map((question) => (
            <div key={question.id} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor={question.id} className="text-base font-medium">
                  {question.question}
                </Label>
                {question.description && (
                  <p className="text-sm text-muted-foreground">
                    {question.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground min-w-[20px]">1</span>
                <Slider
                  id={question.id}
                  min={1}
                  max={5}
                  step={1}
                  value={[formValues[question.id]]}
                  onValueChange={(value) => handleSliderChange(question.id, value)}
                  disabled={alreadyCompleted || isSubmitting}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground min-w-[20px]">5</span>
                <span className="text-lg font-semibold min-w-[30px] text-center">
                  {formValues[question.id]}
                </span>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={alreadyCompleted || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Avaliação'}
            </Button>
            
            {!alreadyCompleted && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Resetar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PBATDailyAssessment;
