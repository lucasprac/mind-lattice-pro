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
import PredictiveAnalysis from '@/components/ml/PredictiveAnalysis';
import PatternRecognition from '@/components/ml/PatternRecognition';
import MLModelTraining from '@/components/ml/MLModelTraining';
import DataVisualization from '@/components/ml/DataVisualization';

const MachineLearning: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const features = [
    {
      icon: TrendingUp,
      title: 'Análise Preditiva',
      description:
        'Previsões baseadas em dados históricos para antecipar necessidades terapêuticas e outcomes de tratamento.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: 'predictive',
    },
    {
      icon: Activity,
      title: 'Monitoramento de Padrões',
      description:
        'Identificação automática de padrões comportamentais, emocionais e evolutivos durante o tratamento.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: 'patterns',
    },
    {
      icon: BarChart3,
      title: 'Treinamento de Modelos',
      description:
        'Sistema de treinamento e validação de modelos ML com dados clínicos anonimizados.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: 'training',
    },
    {
      icon: LineChart,
      title: 'Visualização de Dados',
      description:
        'Dashboards interativos com métricas, tendências e correlações entre variáveis clínicas.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: 'visualization',
    },
  ];

  const mlStats = [
    {
      label: 'Modelos Ativos',
      value: '4',
      icon: Brain,
      color: 'text-blue-600',
    },
    {
      label: 'Acurácia Média',
      value: '87.3%',
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      label: 'Predições/Mês',
      value: '1,247',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      label: 'Dados Processados',
      value: '15.2k',
      icon: Database,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Machine Learning</h1>
                  <p className="text-muted-foreground">
                    Inteligência Artificial Aplicada à Saúde Mental
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Sistema Ativo
          </Badge>
        </div>

        {/* Alert Info */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Todos os modelos de ML operam em conformidade com LGPD, utilizando
            dados anonimizados e criptografados. As predições são ferramentas de
            apoio à decisão clínica.
          </AlertDescription>
        </Alert>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {mlStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="predictive">Análise Preditiva</TabsTrigger>
            <TabsTrigger value="patterns">Padrões</TabsTrigger>
            <TabsTrigger value="training">Treinamento</TabsTrigger>
            <TabsTrigger value="visualization">Visualização</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recursos de Machine Learning</CardTitle>
                  <CardDescription>
                    Ferramentas avançadas de IA para otimizar o acompanhamento
                    terapêutico e melhorar os outcomes clínicos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <Card
                          key={index}
                          className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                          onClick={() => setActiveTab(feature.action)}
                        >
                          <CardHeader>
                            <div className="flex items-start gap-4">
                              <div
                                className={`p-3 rounded-lg ${feature.bgColor}`}
                              >
                                <Icon className={`h-6 w-6 ${feature.color}`} />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {feature.title}
                                </CardTitle>
                                <CardDescription className="mt-2">
                                  {feature.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Guidelines */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Dados Seguros
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Processamento seguro e anonimizado, em conformidade com a
                      LGPD. Criptografia end-to-end em todas as operações.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Modelos Validados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Validação contínua com dados clínicos para garantir
                      precisão e confiabilidade dos algoritmos.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Apoio à Decisão
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Predições complementam, não substituem, o julgamento
                      clínico profissional e a experiência terapêutica.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Predictive Analysis Tab */}
          <TabsContent value="predictive">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Análise Preditiva</CardTitle>
                    <CardDescription>
                      Previsões de outcomes e identificação de riscos potenciais
                      no tratamento
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PredictiveAnalysis patientId={selectedPatient} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pattern Recognition Tab */}
          <TabsContent value="patterns">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-50">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Reconhecimento de Padrões</CardTitle>
                    <CardDescription>
                      Identificação automática de padrões comportamentais e
                      emocionais
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PatternRecognition patientId={selectedPatient} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ML Training Tab */}
          <TabsContent value="training">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Treinamento de Modelos</CardTitle>
                    <CardDescription>
                      Sistema de treinamento e validação de modelos de Machine
                      Learning
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MLModelTraining />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Visualization Tab */}
          <TabsContent value="visualization">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <LineChart className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>Visualização de Dados</CardTitle>
                    <CardDescription>
                      Dashboards interativos com métricas e tendências clínicas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataVisualization patientId={selectedPatient} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MachineLearning;
