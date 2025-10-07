import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { usePBATResponses } from '@/hooks/usePBATResponses';
import { useMLPredictions } from '@/hooks/useMLPredictions';
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
    id: 'social_interaction',
    question: 'Como foi sua interação social hoje?',
    description: '1 = Nenhuma/Ruim, 5 = Muito boa'
  }
];

const PBATDailyAssessment: React.FC = () => {
  const { responses, addResponse, loading, error } = usePBATResponses();
  const { trainModel, getPredictions, modelMetrics } = useMLPredictions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, number>>(
    PBAT_QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: 3 }), {})
  );

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayResponse = responses.find(
      (r) => format(new Date(r.date), 'yyyy-MM-dd') === today
    );

    if (todayResponse) {
      setAlreadyCompleted(true);
      setFormValues(todayResponse.responses);
    }
  }, [responses]);

  // Train model when we have enough responses
  useEffect(() => {
    if (responses.length >= 7) {
      trainModel();
    }
  }, [responses, trainModel]);

  const handleSliderChange = (id: string, value: number[]) => {
    setFormValues((prev) => ({ ...prev, [id]: value[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await addResponse({
        date: new Date(),
        responses: formValues,
      });

      setSubmitSuccess(true);
      setAlreadyCompleted(true);

      // Retrain model after new response
      setTimeout(() => {
        trainModel();
      }, 500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormValues(
      PBAT_QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: 3 }), {})
    );
  };

  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Avaliação Diária PBAT</CardTitle>
        <CardDescription>
          {today}
          {alreadyCompleted && (
            <span className="block mt-2 text-green-600 font-medium">
              ✓ Avaliação de hoje já foi concluída
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <Alert>
            <AlertDescription>Carregando dados...</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Avaliação salva com sucesso! O modelo de ML será atualizado.
            </AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {PBAT_QUESTIONS.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={question.id} className="text-base font-medium">
                {question.question}
                {question.description && (
                  <span className="block text-sm text-muted-foreground font-normal mt-1">
                    {question.description}
                  </span>
                )}
              </Label>
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
