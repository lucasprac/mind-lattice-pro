import React, { useState } from 'react';
import { useMLPredictions } from '../hooks/useMLPredictions';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MLPredictionsDashboardProps {
  patientId: string;
}

interface PredictionCard {
  id: string;
  type: string;
  title: string;
  value: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
  explanation: string;
  riskFactors: string[];
}

const MLPredictionsDashboard: React.FC<MLPredictionsDashboardProps> = ({ patientId }) => {
  const { predictions, loading, error, requestPrediction, historicalData } = useMLPredictions(patientId);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [requestingNew, setRequestingNew] = useState(false);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleRequestPrediction = async (predictionType: string) => {
    setRequestingNew(true);
    try {
      await requestPrediction(predictionType);
    } catch (err) {
      console.error('Error requesting prediction:', err);
    } finally {
      setRequestingNew(false);
    }
  };

  if (loading && !predictions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando predições...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar predições: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Predições de Machine Learning</h2>
          <p className="text-muted-foreground">Análise preditiva baseada em dados clínicos do paciente</p>
        </div>
        <Button
          onClick={() => handleRequestPrediction('comprehensive')}
          disabled={requestingNew}
        >
          {requestingNew && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Solicitar Nova Predição
        </Button>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions?.map((prediction: PredictionCard) => (
          <Card
            key={prediction.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedPrediction(prediction.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {prediction.title}
              </CardTitle>
              {getTrendIcon(prediction.trend)}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">
                    {(prediction.value * 100).toFixed(1)}%
                  </span>
                  <Badge className={getRiskColor(prediction.riskLevel)}>
                    {prediction.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confiança:</span>
                  <span className={`font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                    {(prediction.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {prediction.explanation}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View for Selected Prediction */}
      {selectedPrediction && predictions?.find((p: PredictionCard) => p.id === selectedPrediction) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  {predictions.find((p: PredictionCard) => p.id === selectedPrediction)?.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Análise detalhada da predição
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPrediction(null)}>
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Explanation */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Explicação</h3>
              <p className="text-sm text-muted-foreground">
                {predictions.find((p: PredictionCard) => p.id === selectedPrediction)?.explanation}
              </p>
            </div>

            {/* Risk Factors */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Fatores de Risco Identificados</h3>
              <ul className="space-y-1">
                {predictions.find((p: PredictionCard) => p.id === selectedPrediction)?.riskFactors.map((factor: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Historical Trend Chart */}
            {historicalData?.[selectedPrediction] && (
              <div>
                <h3 className="text-sm font-semibold mb-4">Tendência Histórica</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={historicalData[selectedPrediction]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Probabilidade (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Confiança (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Confidence Metrics */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Métricas de Confiança</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'Qualidade dos Dados', value: 85 },
                  { name: 'Completude', value: 92 },
                  { name: 'Acurácia do Modelo', value: 88 },
                  { name: 'Confiança Geral', value: (predictions.find((p: PredictionCard) => p.id === selectedPrediction)?.confidence || 0) * 100 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleRequestPrediction('readmission')}
              disabled={requestingNew}
            >
              Predição de Readmissão
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleRequestPrediction('complication')}
              disabled={requestingNew}
            >
              Risco de Complicações
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleRequestPrediction('treatment')}
              disabled={requestingNew}
            >
              Resposta ao Tratamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Footer */}
      <Alert>
        <AlertDescription className="text-xs">
          <strong>Nota:</strong> As predições são baseadas em modelos de machine learning treinados com dados clínicos.
          Estas análises devem ser usadas como ferramenta de apoio à decisão clínica e não substituem o julgamento médico profissional.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MLPredictionsDashboard;
