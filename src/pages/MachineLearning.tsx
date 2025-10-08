import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
  pbatScore?: number;
  pbatData?: any;
}

const MachineLearning = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real patients from Supabase
  const { data: patientsData, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['ml-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch patient assessments (PBAT data)
  const { data: assessmentsData, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['patient-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_assessments')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch records for additional patient data
  const { data: recordsData } = useQuery({
    queryKey: ['patient-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Transform Supabase data to Patient interface
  const patients: Patient[] = React.useMemo(() => {
    if (!patientsData) return [];

    return patientsData.map((patient) => {
      // Find PBAT assessment for this patient
      const assessment = assessmentsData?.find(
        (a) => a.patient_id === patient.id
      );

      // Calculate PBAT score from q1-q34 (sum of all questions)
      let pbatScore = 0;
      if (assessment) {
        for (let i = 1; i <= 34; i++) {
          const questionKey = `q${i}` as keyof typeof assessment;
          const value = assessment[questionKey];
          if (typeof value === 'number') {
            pbatScore += value;
          }
        }
      }

      // Calculate age from birth_date
      const birthDate = patient.birth_date ? new Date(patient.birth_date) : null;
      const age = birthDate
        ? Math.floor(
            (new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
          )
        : 0;

      // Get most recent record for this patient
      const latestRecord = recordsData?.find((r) => r.patient_id === patient.id);

      // Determine risk level based on PBAT score and other factors
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (pbatScore > 68) {
        riskLevel = 'high';
      } else if (pbatScore > 34) {
        riskLevel = 'medium';
      }

      // Get condition from latest record or default
      const condition = latestRecord?.diagnosis || patient.medical_conditions || 'Não especificado';

      return {
        id: patient.id,
        name: patient.full_name || 'Paciente sem nome',
        age,
        condition,
        riskLevel,
        lastVisit: latestRecord?.created_at || patient.created_at || new Date().toISOString(),
        pbatScore,
        pbatData: assessment,
      };
    });
  }, [patientsData, assessmentsData, recordsData]);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'Alto Risco';
      case 'medium':
        return 'Médio Risco';
      case 'low':
        return 'Baixo Risco';
      default:
        return 'Não Avaliado';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                Machine Learning Analytics
              </h1>
              <p className="text-muted-foreground">
                Análises preditivas e insights baseados em IA para otimização do tratamento
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pacientes
            </CardTitle>
            <CardDescription>
              Selecione um paciente para análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Buscar paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            {isLoadingPatients ? (
              <div className="text-center py-4 text-muted-foreground">
                Carregando pacientes...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <Card
                    key={patient.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPatient === patient.id
                        ? 'border-primary bg-accent'
                        : ''
                    }`}
                    onClick={() => setSelectedPatient(patient.id)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.age} anos • {patient.condition}
                          </p>
                          {patient.pbatScore !== undefined && (
                            <p className="text-xs text-muted-foreground">
                              PBAT: {patient.pbatScore} pontos
                            </p>
                          )}
                        </div>
                        <Badge variant={getRiskColor(patient.riskLevel) as any}>
                          {getRiskLabel(patient.riskLevel)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        Última visita: {formatDate(patient.lastVisit)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Content */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedPatient ? (
            <Card className="h-[600px] flex items-center justify-center">
              <CardContent className="text-center space-y-4">
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
};

export default MachineLearning;
