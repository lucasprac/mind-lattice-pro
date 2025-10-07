import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  TrendingUp,
  Activity,
  BarChart3,
  LineChart,
  Settings2,
  Sparkles,
  Database,
  PlayCircle,
  Users,
  Download,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import actual ML components that exist
import MLAnalytics from '@/components/ml/MLAnalytics';
import MLInsights from '@/components/ml/MLInsights';
import ModelTraining from '@/components/ml/ModelTraining';
import MLPredictionDashboard from '@/components/ml/MLPredictionDashboard';

interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastVisit: string;
}

const mockPatients: Patient[] = [
  { id: '1', name: 'João Silva', age: 45, condition: 'Hipertensão', riskLevel: 'medium', lastVisit: '2024-01-15' },
  { id: '2', name: 'Maria Santos', age: 62, condition: 'Diabetes Tipo 2', riskLevel: 'high', lastVisit: '2024-01-14' },
  { id: '3', name: 'Pedro Oliveira', age: 38, condition: 'Asma', riskLevel: 'low', lastVisit: '2024-01-16' },
];

export default function MachineLearning() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              Machine Learning Analytics
            </h1>
            <p className="text-muted-foreground">Análise preditiva e reconhecimento de padrões</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          <Sparkles className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Patient Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Selecionar Paciente
              </CardTitle>
              <CardDescription>
                Escolha um paciente para análise de ML
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <Card
                    key={patient.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPatient === patient.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedPatient(patient.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.age} anos</p>
                        </div>
                        <Badge className={getRiskColor(patient.riskLevel)}>
                          {patient.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2">{patient.condition}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Última visita: {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de Pacientes</span>
                <span className="font-bold">{mockPatients.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Alto Risco</span>
                <span className="font-bold text-red-500">
                  {mockPatients.filter(p => p.riskLevel === 'high').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Médio Risco</span>
                <span className="font-bold text-yellow-500">
                  {mockPatients.filter(p => p.riskLevel === 'medium').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Baixo Risco</span>
                <span className="font-bold text-green-500">
                  {mockPatients.filter(p => p.riskLevel === 'low').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - ML Analysis */}
        <div className="lg:col-span-2">
          {!selectedPatient ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum Paciente Selecionado</h3>
                <p className="text-muted-foreground">
                  Selecione um paciente na lista ao lado para visualizar as análises de Machine Learning
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="predictive" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="predictive" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Análise Preditiva
                </TabsTrigger>
                <TabsTrigger value="patterns" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Padrões
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Treinamento
                </TabsTrigger>
                <TabsTrigger value="visualization" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Visualização
                </TabsTrigger>
              </TabsList>

              <TabsContent value="predictive" className="space-y-4">
                <MLAnalytics patientId={selectedPatient} />
              </TabsContent>

              <TabsContent value="patterns" className="space-y-4">
                <MLInsights patientId={selectedPatient} />
              </TabsContent>

              <TabsContent value="training" className="space-y-4">
                <ModelTraining />
              </TabsContent>

              <TabsContent value="visualization" className="space-y-4">
                <MLPredictionDashboard patientId={selectedPatient} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Bottom Info Banner */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          As análises de Machine Learning são baseadas em dados históricos e devem ser usadas
          como ferramenta de apoio à decisão clínica. Sempre consulte um profissional de saúde qualificado.
        </AlertDescription>
      </Alert>
    </div>
  );
}
