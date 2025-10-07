import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MLPredictionsDashboard from '../components/MLPredictionsDashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const MLPredictions: React.FC = () => {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const handleBack = () => {
    if (patientId) {
      navigate(`/patients/${patientId}`);
    } else {
      navigate('/patients');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Predições de Machine Learning
                </h1>
                <p className="text-muted-foreground mt-1">
                  Análise preditiva e tendências baseadas em dados clínicos
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="h-4 w-4 mr-2" />
              Sobre os Modelos
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {showInfo && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Sobre os Modelos de Machine Learning</p>
                <p className="text-sm">
                  Os modelos de predição utilizam algoritmos de aprendizado de máquina treinados com dados clínicos históricos.
                  Cada modelo é especializado em diferentes aspectos:
                </p>
                <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                  <li><strong>Predição de Readmissão:</strong> Avalia o risco de o paciente necessitar readmissão hospitalar</li>
                  <li><strong>Risco de Complicações:</strong> Identifica fatores que podem levar a complicações no tratamento</li>
                  <li><strong>Resposta ao Tratamento:</strong> Prevê a probabilidade de resposta positiva às intervenções</li>
                </ul>
                <p className="text-sm mt-2">
                  Todos os modelos passam por validação contínua e são atualizados regularmente para manter alta precisão.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {patientId ? (
          <MLPredictionsDashboard patientId={patientId} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Selecione um Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Para visualizar as predições de machine learning, você precisa selecionar um paciente específico.
              </p>
              <Button onClick={() => navigate('/patients')}>
                Ir para Lista de Pacientes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer Info */}
      <div className="container mx-auto px-4 pb-8">
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Atualização dos Dados</h3>
                <p className="text-muted-foreground">
                  As predições são atualizadas automaticamente quando novos dados clínicos são adicionados ao sistema.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Interpretação dos Resultados</h3>
                <p className="text-muted-foreground">
                  Cada predição inclui um nível de confiança e fatores de risco identificados para auxiliar na tomada de decisão.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Uso Responsável</h3>
                <p className="text-muted-foreground">
                  As predições devem ser usadas como ferramenta complementar ao julgamento clínico profissional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MLPredictions;
