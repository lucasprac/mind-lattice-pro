import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Activity, BarChart3, LineChart } from 'lucide-react';

const MachineLearning: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: 'Análise Preditiva',
      description: 'Previsões baseadas em dados históricos dos pacientes para antecipação de necessidades terapêuticas.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Activity,
      title: 'Monitoramento de Padrões',
      description: 'Identificação automática de padrões comportamentais e evolutivos ao longo do tratamento.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: BarChart3,
      title: 'Análise de Tendências',
      description: 'Visualização de tendências e correlações entre diferentes métricas clínicas.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: LineChart,
      title: 'Predição de Resultados',
      description: 'Estimativas de eficácia de intervenções baseadas em dados similares.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Machine Learning</h1>
          </div>
          <p className="text-muted-foreground">
            Análises avançadas e predições baseadas em inteligência artificial para apoio à decisão clínica
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Sobre Machine Learning Clínico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O sistema de Machine Learning analisa dados históricos dos pacientes, identifica padrões comportamentais
              e fornece insights preditivos para auxiliar na tomada de decisões terapêuticas. Todas as predições são
              ferramentas complementares ao julgamento clínico profissional.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Em Desenvolvimento</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Estamos desenvolvendo modelos de machine learning específicos para análise de processos terapêuticos.
                Em breve você terá acesso a:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-sm">Predição de resposta ao tratamento</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-sm">Identificação de fatores de risco</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-sm">Recomendações personalizadas de intervenção</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-sm">Análise de efetividade comparativa</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/patients')} variant="outline">
                Ver Pacientes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guidelines Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">Dados Seguros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Todos os dados são processados de forma segura e anônima, respeitando rigorosamente a LGPD.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">Modelos Validados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Os modelos são continuamente validados com dados clínicos para garantir precisão e confiabilidade.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">Apoio à Decisão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                As predições são ferramentas complementares, nunca substituindo o julgamento clínico profissional.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MachineLearning;
