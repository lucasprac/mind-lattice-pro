import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, ClipboardList, CheckCircle2, Clock, Eye, ArrowRight } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { useSessionPBATResponses } from "@/hooks/useSessionPBATResponses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PBAT_QUESTIONS = [
  "Eu consegui mudar meu comportamento e isso ajudou em minha vida",
  "Eu fiz coisas que prejudicaram minha conexão com pessoas que são importantes para mim",
  "Eu fui capaz de experienciar uma variedade de emoções apropriadas ao momento",
  "Eu tive dificuldade de me manter fazendo coisas que eram boas para mim",
  "Eu não encontrei uma forma de me desafiar que fosse significativa para mim",
  "Eu agi de maneiras que beneficiaram minha saúde física",
  "Meu modo de pensar atrapalhou coisas que eram importantes para mim",
  "Eu prestei atenção em coisas importantes no meu dia-a-dia",
  "Eu fiz coisas apenas porque cedi ao que os outros queriam que eu fizesse",
  "Eu continuei usando estratégias que pareciam ter funcionado",
];

const PatientAssessment = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords(patientId);
  
  // Use session-specific PBAT responses
  const { 
    response,
    isLoading,
    saveResponse,
    isSaving,
    hasResponse,
    currentScore
  } = useSessionPBATResponses(patientId || "", recordId || "");

  const patient = patients.find(p => p.id === patientId);
  const record = records.find(r => r.id === recordId);
  
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // If there's an existing response for this session, populate the form
    if (response && !showResults) {
      const newAnswers: Record<string, number> = {};
      for (let i = 1; i <= 10; i++) {
        const value = response[`q${i}` as keyof typeof response];
        if (typeof value === 'number') {
          newAnswers[`q${i}`] = value;
        }
      }
      setAnswers(newAnswers);
    }
  }, [response, showResults]);

  if (!patient || !record) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {!patient ? "Paciente não encontrado" : "Sessão não encontrada"}
          </p>
          <Button className="mt-4" onClick={() => navigate("/patients")}>
            Voltar para Pacientes
          </Button>
        </Card>
      </div>
    );
  }

  const handleSliderChange = (question: number, value: number[]) => {
    setAnswers(prev => ({ ...prev, [`q${question}`]: value[0] }));
  };

  const handleSave = async () => {
    const assessmentData = {
      patient_id: patientId!,
      session_id: recordId!,
      assessment_date: new Date().toISOString(),
      q1: answers.q1 || 0,
      q2: answers.q2 || 0,
      q3: answers.q3 || 0,
      q4: answers.q4 || 0,
      q5: answers.q5 || 0,
      q6: answers.q6 || 0,
      q7: answers.q7 || 0,
      q8: answers.q8 || 0,
      q9: answers.q9 || 0,
      q10: answers.q10 || 0,
    };

    saveResponse(assessmentData);
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  const navigateToNextStep = () => {
    navigate(`/patients/${patientId}/session/${recordId}/network`);
  };

  const navigateToRoadmap = () => {
    navigate(`/patients/${patientId}/session/${recordId}/roadmap`);
  };

  // Calculate average score from current answers
  const calculateCurrentScore = () => {
    const scores = Object.values(answers).filter(val => typeof val === 'number');
    if (scores.length === 0) return 0;
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length / 10).toFixed(1);
  };

  // If assessment exists and user wants to see results
  if (response && showResults) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Button
              variant="ghost"
              onClick={() => setShowResults(false)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Formulário
            </Button>
            <h1 className="text-3xl font-bold mb-2">Resultados da Avaliação - {patient.full_name}</h1>
            <p className="text-muted-foreground">
              Sessão: {record.name} | Avaliação realizada em {format(new Date(response.assessment_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          
          {/* Botão para avançar etapa */}
          <Button onClick={navigateToNextStep} className="mt-8">
            Próxima Etapa
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Score PBAT desta Sessão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{(currentScore / 10).toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">Funcionamento baseado em processos (0-10)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status da Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Concluída
              </Badge>
              <p className="text-sm text-muted-foreground">
                Sessão: {record.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Data: {format(new Date(response.assessment_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={navigateToRoadmap}>
            Voltar para Roadmap
          </Button>
          <Button onClick={navigateToNextStep}>
            Continuar para Análise de Rede
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Button
            variant="ghost"
            onClick={navigateToRoadmap}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Roadmap
          </Button>
          <h1 className="text-3xl font-bold mb-2">Avaliação Inicial - {patient.full_name}</h1>
          <p className="text-muted-foreground">
            Sessão: {record.name} | Escala PBAT (Process-Based Assessment Tool)
          </p>
        </div>
        
        {/* Botão para avançar etapa - só aparece se já foi preenchido */}
        {response && (
          <Button onClick={navigateToNextStep} className="mt-8">
            Próxima Etapa
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Journey Progress Card */}
      <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Etapa 1 de 5
              </Badge>
              <span className="text-sm font-medium">Jornada de Análise</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Sessão:</span>
              <Badge variant="outline" className="bg-white">{record.name}</Badge>
            </div>
            {hasResponse() && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Score:</span>
                <Badge variant="outline" className="bg-white">{(currentScore / 10).toFixed(1)}</Badge>
              </div>
            )}
          </div>
        </div>
      </Card>

      {response && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Avaliação já preenchida para esta sessão</h3>
                <p className="text-sm text-green-800">
                  Preenchida em {format(new Date(response.assessment_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowResults}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Resultados
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResults(false)}
              >
                Editar Respostas
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Instruções</h3>
            <p className="text-sm text-blue-800">
              Baseie suas respostas em como você tem agido na <strong>última semana</strong>. 
              Não existem respostas certas ou erradas. <strong>Esta avaliação é específica desta sessão.</strong>
            </p>
          </div>
        </div>
      </Card>

      {/* PBAT Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Durante a última semana...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {PBAT_QUESTIONS.map((question, index) => (
            <div key={index} className="space-y-3">
              <Label className="text-sm font-medium">
                {index + 1}. {question}
              </Label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-32">Discordo completamente</span>
                <Slider
                  value={[answers[`q${index + 1}`] || 0]}
                  onValueChange={(value) => handleSliderChange(index + 1, value)}
                  max={50}
                  step={5}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-32 text-right">Concordo completamente</span>
                <Badge variant="outline" className="w-12 justify-center">
                  {answers[`q${index + 1}`] || 0}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={navigateToRoadmap}>
          Voltar para Roadmap
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar Avaliação"}
        </Button>
        {hasResponse() && (
          <Button onClick={navigateToNextStep}>
            Continuar para Análise de Rede
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default PatientAssessment;
