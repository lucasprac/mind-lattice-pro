import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Calendar, Eye, BarChart3 } from 'lucide-react';

interface PBATAssessment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  scores: {
    depression: number;
    anxiety: number;
    stress: number;
    hopelessness: number;
    suicidalIdeation: number;
  };
  responses: Record<string, number>;
  totalScore: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Severe';
  recommendations: string[];
}

interface PBATAssessmentsProps {
  patientId?: string;
}

const PBATAssessments: React.FC<PBATAssessmentsProps> = ({ patientId }) => {
  const [assessments, setAssessments] = useState<PBATAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<PBATAssessment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, [patientId]);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockAssessments: PBATAssessment[] = [
        {
          id: '1',
          patientId: 'patient-1',
          patientName: 'João Silva',
          date: '2024-01-15',
          scores: {
            depression: 12,
            anxiety: 8,
            stress: 15,
            hopelessness: 6,
            suicidalIdeation: 2
          },
          responses: {
            'q1': 2, 'q2': 1, 'q3': 3, 'q4': 2, 'q5': 1,
            'q6': 2, 'q7': 3, 'q8': 1, 'q9': 2, 'q10': 1
          },
          totalScore: 43,
          severity: 'Moderate',
          recommendations: [
            'Monitoramento regular dos sintomas depressivos',
            'Técnicas de mindfulness para ansiedade',
            'Estratégias de manejo do estresse'
          ]
        },
        {
          id: '2',
          patientId: 'patient-1',
          patientName: 'João Silva',
          date: '2024-02-20',
          scores: {
            depression: 8,
            anxiety: 5,
            stress: 10,
            hopelessness: 3,
            suicidalIdeation: 0
          },
          responses: {
            'q1': 1, 'q2': 1, 'q3': 2, 'q4': 1, 'q5': 0,
            'q6': 1, 'q7': 2, 'q8': 1, 'q9': 1, 'q10': 0
          },
          totalScore: 26,
          severity: 'Low',
          recommendations: [
            'Manutenção das estratégias atuais',
            'Continuidade do acompanhamento',
            'Foco em prevenção de recaídas'
          ]
        }
      ];

      // Filter by patientId if provided
      const filteredAssessments = patientId 
        ? mockAssessments.filter(a => a.patientId === patientId)
        : mockAssessments;

      setAssessments(filteredAssessments);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAssessment = async (assessmentId: string) => {
    try {
      // Replace with actual API call
      setAssessments(prev => prev.filter(a => a.id !== assessmentId));
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Avaliações PBAT
        </h2>
        <Badge variant="outline" className="text-sm">
          {assessments.length} avaliação{assessments.length !== 1 ? 'ões' : ''}
        </Badge>
      </div>

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma avaliação encontrada
            </h3>
            <p className="text-gray-500">
              {patientId 
                ? 'Este paciente ainda não possui avaliações PBAT realizadas.'
                : 'Não há avaliações PBAT no sistema.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {assessment.patientName}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(assessment.date)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(assessment.severity)}>
                      {assessment.severity === 'Low' && 'Baixo'}
                      {assessment.severity === 'Moderate' && 'Moderado'}
                      {assessment.severity === 'High' && 'Alto'}
                      {assessment.severity === 'Severe' && 'Severo'}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Avaliação</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteAssessment(assessment.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {assessment.scores.depression}
                    </p>
                    <p className="text-sm text-gray-600">Depressão</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {assessment.scores.anxiety}
                    </p>
                    <p className="text-sm text-gray-600">Ansiedade</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {assessment.scores.stress}
                    </p>
                    <p className="text-sm text-gray-600">Estresse</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {assessment.scores.hopelessness}
                    </p>
                    <p className="text-sm text-gray-600">Desesperança</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {assessment.scores.suicidalIdeation}
                    </p>
                    <p className="text-sm text-gray-600">Ideação Suicida</p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Ver detalhes da avaliação
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div>
                          <h4 className="font-medium mb-2">Pontuação Total</h4>
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 rounded-lg px-3 py-2">
                              <span className="text-lg font-bold">
                                {assessment.totalScore}
                              </span>
                              <span className="text-sm text-gray-600 ml-1">pontos</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Respostas Detalhadas</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {Object.entries(assessment.responses).map(([question, score]) => (
                              <div key={question} className="text-center p-2 bg-gray-50 rounded">
                                <div className="text-xs text-gray-600">{question.toUpperCase()}</div>
                                <div className="font-medium">{score}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Recomendações</h4>
                          <ul className="space-y-1">
                            {assessment.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span className="text-sm text-gray-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PBATAssessments;
