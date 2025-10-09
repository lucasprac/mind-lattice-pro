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

// Questões PBAT exatas do documento oficial (Questões 1-23)
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
  "Eu encontrei formas de me desafiar que eram pessoalmente importantes",
  "Eu me senti preso(a/e) e incapaz de mudar meu comportamento ineficaz",
  "Eu usei meu modo de pensar de uma maneira que me ajudou a viver melhor",
  "Eu tive dificuldade de me conectar ao momento presente no meu dia-a-dia",
  "Eu fiz coisas para me conectar a pessoas que são importantes para mim",
  "Eu escolhi fazer coisas que eram pessoalmente importantes para mim",
  "Eu agi de maneiras que prejudicaram minha saúde física",
  "Eu não encontrei uma maneira apropriada de expressar minhas emoções",
  "Eu fui intolerante com os meus próprios erros",
  "Eu fui gentil e paciente comigo mesmo(a/e)",
  "Eu fui intolerante com os erros das outras pessoas",
  "Eu fui gentil e paciente com as outras pessoas"
];

// Questões de Desfecho/Outcome (Questões 24-28)
const OUTCOME_QUESTIONS = [
  "Se sentir triste, desanimado(a/e) ou desinteressado(a/e) pela vida",
  "Se sentir ansioso(a/e) ou com medo",
  "Se sentir estressado(a/e)",
  "Se sentir com raiva",
  "Não ter o apoio social (dos familiares e/ou amigos) que você acredita que precisa ter"
];

// Questões de Vitalidade (Questões 30-34)
const VITALITY_QUESTIONS = [
  "Eu me senti vitalizado(a/e)",
  "Quase sempre me senti disposto(a/e) e ativo(a/e)",
  "Eu me senti vivo(a/e) e cheio(a/e) de vitalidade",
  "Eu me senti satisfeito(a/e) com minha vida",
  "Eu sinto que meu trabalho está me desgastando"
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
  const [healthStatus, setHealthStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // If there's an existing response for this session, populate the form
    if (response && !showResults) {
      const newAnswers: Record<string, number> = {};
      for (let i = 1; i <= 34; i++) {
        if (i === 29) continue; // Skip health status question (it's a radio)
        const value = response[`q${i}` as keyof typeof response];
        if (typeof value === 'number') {
          newAnswers[`q${i}`] = value;
        }
      }
      setAnswers(newAnswers);
      setHealthStatus((response as any).q29 || "");
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
    const assessmentData: any = {
      patient_id: patientId!,
      session_id: recordId!,
      assessment_date: new Date().toISOString(),
    };

    // Add PBAT questions (1-23)
    for (let i = 1; i <= 23; i++) {
      assessmentData[`q${i}`] = answers[`q${i}`] || 0;
    }

    // Add outcome questions (24-28)
    for (let i = 24; i <= 28; i++) {
      assessmentData[`q${i}`] = answers[`q${i}`] || 0;
    }

    // Add health status (29)
    assessmentData.q29 = healthStatus || 'boa';

    // Add vitality questions (30-34)
    for (let i = 30; i <= 34; i++) {
      assessmentData[`q${i}`] = answers[`q${i}`] || 0;
    }

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

  const calculatePBATScore = () => {
    let total = 0;
    for (let i = 1; i <= 23; i++) {
      total += answers[`q${i}`] || 0;
    }
    return (total / 23).toFixed(1);
  };

  const calculateOutcomeScore = () => {
    let total = 0;
    for (let i = 24; i <= 28; i++) {
      total += answers[`q${i}`] || 0;
    }
    return (total / 5).toFixed(1);
  };

  const calculateVitalityScore = () => {
    let total = 0;
    // Questions 30-33 are positive, 34 is negative (reverse scored)
    for (let i = 30; i <= 33; i++) {
      total += answers[`q${i}`] || 0;
    }
    // Reverse score for question 34
    total += (100 - (answers.q34 || 0));
    return (total / 5).toFixed(1);
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PBAT Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{calculatePBATScore()}</div>
              <p className="text-sm text-muted-foreground">Funcionamento baseado em processos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Outcome Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{calculateOutcomeScore()}</div>
              <p className="text-sm text-muted-foreground">Medidas de resultado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vitality Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{calculateVitalityScore()}</div>
              <p className="text-sm text-muted-foreground">Vitalidade e energia</p>
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
                <span className="text-muted-foreground">Score PBAT:</span>
                <Badge variant="outline" className="bg-white">{calculatePBATScore()}</Badge>
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
              Por favor, marque na linha o quanto você concorda com cada afirmação. Baseie suas respostas em como você tem agido na <strong>última semana</strong>. 
              Lembre-se de que <strong>não existem respostas certas ou erradas</strong>.
            </p>
          </div>
        </div>
      </Card>

      {/* PBAT Questions (1-23) */}
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
                  max={100}
                  step={10}
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

      {/* Outcome Measures (24-28) */}
      <Card>
        <CardHeader>
          <CardTitle>Desfechos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Durante a última semana, o quanto você se incomodou com as seguintes questões:
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {OUTCOME_QUESTIONS.map((question, index) => (
            <div key={index} className="space-y-3">
              <Label className="text-sm font-medium">
                {24 + index}. {question}
              </Label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-24">Nem um pouco</span>
                <Slider
                  value={[answers[`q${24 + index}`] || 0]}
                  onValueChange={(value) => handleSliderChange(24 + index, value)}
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-24 text-right">Severamente</span>
                <Badge variant="outline" className="w-12 justify-center">
                  {answers[`q${24 + index}`] || 0}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Health Status (29) */}
      <Card>
        <CardHeader>
          <CardTitle>29. Durante a última semana, você diria que sua saúde estava:</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={healthStatus} onValueChange={setHealthStatus}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="muito_ruim" id="muito_ruim" />
              <Label htmlFor="muito_ruim">Muito Ruim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ruim" id="ruim" />
              <Label htmlFor="ruim">Ruim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="boa" id="boa" />
              <Label htmlFor="boa">Boa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="muito_boa" id="muito_boa" />
              <Label htmlFor="muito_boa">Muito Boa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excelente" id="excelente" />
              <Label htmlFor="excelente">Excelente</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Vitality Questions (30-34) */}
      <Card>
        <CardHeader>
          <CardTitle>Durante a última semana, o quanto estas afirmações foram verdadeiras para você:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {VITALITY_QUESTIONS.map((question, index) => (
            <div key={index} className="space-y-3">
              <Label className="text-sm font-medium">
                {30 + index}. {question}
              </Label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-24">Nada verdadeira</span>
                <Slider
                  value={[answers[`q${30 + index}`] || 0]}
                  onValueChange={(value) => handleSliderChange(30 + index, value)}
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-32 text-right">Totalmente verdadeira</span>
                <Badge variant="outline" className="w-12 justify-center">
                  {answers[`q${30 + index}`] || 0}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Observações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Adicione observações sobre esta avaliação..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
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
