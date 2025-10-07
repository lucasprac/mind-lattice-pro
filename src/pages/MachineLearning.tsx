import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Activity, BarChart3, LineChart, Settings2, Sparkles, Database, PlayCircle, Users, Download } from 'lucide-react';

const MachineLearning: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: 'Análise Preditiva',
      description:
        'Previsões baseadas em dados históricos para antecipar necessidades terapêuticas.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Activity,
      title: 'Monitoramento de Padrões',
      description:
        'Identificação automática de padrões comportamentais e evolutivos no tratamento.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: BarChart3,
      title: 'Tendências e Correlações',
      description: 'Exploração de tendências e correlações entre métricas clínicas.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: LineChart,
      title: 'Predição de Resultados',
      description: 'Estimativas de eficácia de intervenções baseadas em dados similares.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Machine Learning</h1>
            <Badge variant="secondary" className="ml-1">Beta</Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Sistema integrado de análise preditiva e apoio à decisão clínica, com UX otimizada para fluxo de trabalho.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-sm transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" /> Dados e Features
              </CardTitle>
              <CardDescription>Importe/valide dados e configure features</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" /> Importar CSV
              </Button>
              <Button variant="ghost" size="sm">
                <Settings2 className="h-4 w-4 mr-1" /> Configurar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Treinar/Atualizar Modelo
              </CardTitle>
              <CardDescription>Execute pipelines e valide métricas</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Button size="sm">
                <PlayCircle className="h-4 w-4 mr-1" /> Rodar Treino
              </Button>
              <Button variant="outline" size="sm">Ver Métricas</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" /> Aplicar em Pacientes
              </CardTitle>
              <CardDescription>Gere predições e insights por paciente</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Input placeholder="Buscar paciente..." className="h-9" />
              <Button variant="secondary" size="sm" onClick={() => navigate('/patients')}>
                Abrir Lista
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" /> Sobre Machine Learning Clínico
            </CardTitle>
            <CardDescription>
              As predições são suporte ao julgamento clínico. Privacidade e segurança seguindo LGPD.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tabs: Overview | Treino | Predições */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-xl">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="training">Treinamento</TabsTrigger>
            <TabsTrigger value="inference">Predições</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 flex items-center justify-center mb-3 rounded-lg ${feature.bgColor}`}>
                      {React.createElement(feature.icon, { className: `h-6 w-6 ${feature.color}` })}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="pt-1">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline de Treinamento</CardTitle>
                <CardDescription>Preparação ➝ Treino ➝ Validação ➝ Métricas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Fonte de dados</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Importar CSV</Button>
                      <Button variant="ghost" size="sm">Validar</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Configurações</p>
                    <div className="flex gap-2">
                      <Button size="sm"><Settings2 className="h-4 w-4 mr-1" /> Hiperparâmetros</Button>
                      <Button variant="outline" size="sm">Cross-Validation</Button>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">AUC</Badge>
                  <Badge variant="outline">F1</Badge>
                  <Badge variant="outline">Recall</Badge>
                  <Badge variant="outline">Precision</Badge>
                </div>
                <div className="flex gap-2">
                  <Button><PlayCircle className="h-4 w-4 mr-1" /> Iniciar Treino</Button>
                  <Button variant="secondary">Ver Relatório</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inference" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Geração de Predições</CardTitle>
                <CardDescription>Selecione paciente e gere insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 items-center">
                  <Input placeholder="ID ou nome do paciente" className="max-w-sm" />
                  <Button variant="secondary" onClick={() => navigate('/patients')}>Procurar</Button>
                  <Button>Gerar Predição</Button>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Risco</CardTitle>
                      <CardDescription>Probabilidade estimada</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-semibold">--%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Fatores-chave</CardTitle>
                      <CardDescription>Top features</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm list-disc pl-4 space-y-1 text-muted-foreground">
                        <li>—</li>
                        <li>—</li>
                        <li>—</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recomendações</CardTitle>
                      <CardDescription>Guidelines sugeridas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm list-disc pl-4 space-y-1 text-muted-foreground">
                        <li>—</li>
                        <li>—</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">Dados Seguros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Processamento seguro e anonimizado, em conformidade com a LGPD.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">Modelos Validados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Validação contínua com dados clínicos para precisão e confiabilidade.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">Apoio à Decisão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Predições complementam, não substituem, o julgamento clínico profissional.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MachineLearning;
