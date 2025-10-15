import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Save, ClipboardList, AlertCircle, Edit, Eye, CheckCircle } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { usePatientAssessments } from "@/hooks/usePatientAssessments";
import { useRecords } from "@/hooks/useRecords";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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
  "Eu fui gentil e paciente com as outras pessoas",
  "Eu me senti satisfeito(a/e) com minha vida",
];

const OUTCOME_QUESTIONS = [
  "Se sentir triste, desanimado(a/e) ou desinteressado(a/e) pela vida",
  "Se sentir ansioso(a/e) ou com medo",
  "Se sentir estressado(a/e)",
  "Se sentir com raiva",
  "Não ter o apoio social (dos familiares e/ou amigos) que você acredita que precisa ter",
];

const VITALITY_QUESTIONS = [
  "Eu me senti vitalizado(a/e)",
  "Quase sempre me senti disposto(a/e) e ativo(a/e)",
  "Eu me senti vivo(a/e) e cheio(a/e) de vitalidade",
  "Eu sinto que minha vida está me desgastando",
  "Eu sinto que meu trabalho está me desgastando",
];

const PatientAssessment = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords(patientId);
  const { assessments, saveAssessment, loading, getLatestAssessment } = usePatientAssessments(patientId || "", recordId);
  
  const patient = patients.find(p => p.id === patientId);
  const record = records.find(r => r.id === recordId);
  
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [healthStatus, setHealthStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(true); // Always start in edit mode
  const [existingAssessment, setExistingAssessment] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load existing assessment for this session
  useEffect(() => {
    if (!loading && !dataLoaded) {
      const sessionAssessment = assessments.find(a => a.record_id === recordId);
      
      if (sessionAssessment) {
        console.log("Carregando avaliação existente:", sessionAssessment);
        setExistingAssessment(sessionAssessment);
        
        // Load existing data
        const loadedAnswers: Record<string, number> = {};
        for (let i = 1; i <= 34; i++) {
          if (i === 29) continue; // Skip health status
          const value = (sessionAssessment as any)[`q${i}`];
          if (value !== undefined && value !== null) {
            loadedAnswers[`q${i}`] = value;
          }
        }
        
        setAnswers(loadedAnswers);
        setHealthStatus((sessionAssessment as any).q29 || "");
        setNotes(sessionAssessment.notes || "");
        setEditMode(false); // Start in view mode for existing assessments
      } else {
        console.log("Nenhuma avaliação existente encontrada, iniciando nova");
        setExistingAssessment(null);
        setEditMode(true); // Start in edit mode for new assessments
        // Clear form for new assessment
        setAnswers({});
        setHealthStatus("");
        setNotes("");
      }
      
      setDataLoaded(true);
    }
  }, [loading, assessments, recordId, dataLoaded]);

  // Reset data when recordId changes
  useEffect(() => {
    setDataLoaded(false);
  }, [recordId]);

  if (!patient) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Paciente não encontrado</p>
          <Button className="mt-4" onClick={() => navigate("/patients")}>
            Voltar para Pacientes
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate progress based on answered questions
  const totalQuestions = PBAT_QUESTIONS.length + OUTCOME_QUESTIONS.length + VITALITY_QUESTIONS.length + 1;
  const answeredQuestions = Object.keys(answers).length + (healthStatus ? 1 : 0);
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

  const handleSliderChange = (question: number, value: number[]) => {
    setAnswers(prev => ({ ...prev, [`q${question}`]: value[0] }));
  };

  const handleHealthStatusChange = (value: string) => {
    setHealthStatus(value);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
  };

  const validateForm = () => {
    const missingAnswers = [];
    
    for (let i = 1; i <= 23; i++) {
      if (answers[`q${i}`] === undefined) {
        missingAnswers.push(`Questão PBAT ${i}`);
      }
    }
    
    for (let i = 24; i <= 28; i++) {
      if (answers[`q${i}`] === undefined) {
        missingAnswers.push(`Questão de Resultado ${i - 23}`);
      }
    }
    
    if (!healthStatus) {
      missingAnswers.push("Questão de Saúde");
    }
    
    for (let i = 30; i <= 34; i++) {
      if (answers[`q${i}`] === undefined) {
        missingAnswers.push(`Questão de Vitalidade ${i - 29}`);
      }
    }
    
    return missingAnswers;
  };

  const handleSave = async () => {
    if (!editMode) {
      setEditMode(true);
      return;
    }

    const missingAnswers = validateForm();
    
    if (missingAnswers.length > 0) {
      toast.error(`Por favor, responda todas as questões: ${missingAnswers.slice(0, 3).join(", ")}${missingAnswers.length > 3 ? '...' : ''}`);
      return;
    }

    setSaving(true);
    
    try {
      const assessmentData: any = {
        assessment_date: new Date().toISOString(),
        notes,
        record_id: recordId || null,
      };

      if (existingAssessment) {
        assessmentData.id = existingAssessment.id;
      }

      // Add all question responses
      for (let i = 1; i <= 23; i++) {
        assessmentData[`q${i}`] = answers[`q${i}`] || 0;
      }

      for (let i = 24; i <= 28; i++) {
        assessmentData[`q${i}`] = answers[`q${i}`] || 0;
      }

      assessmentData.q29 = healthStatus;

      for (let i = 30; i <= 34; i++) {
        assessmentData[`q${i}`] = answers[`q${i}`] || 0;
      }

      const success = await saveAssessment(assessmentData);
      if (success) {
        setEditMode(false);
        toast.success(existingAssessment ? "Avaliação atualizada com sucesso!" : "Avaliação salva e correlacionada com a sessão!");
        setDataLoaded(false); // Trigger reload of assessment data
      }
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      toast.error("Erro ao salvar avaliação");
    } finally {
      setSaving(false);
    }
  };

  // Show loading state while data is being loaded
  if (loading || !dataLoaded) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Carregando avaliação...</p>
        </Card>
      </div>
    );
  }

  const isReadOnly = existingAssessment && !editMode;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(`/patients/${patientId}/session/${recordId}/roadmap`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Roadmap
          </Button>
          <h1 className="text-3xl font-bold mb-2">Avaliação Inicial - {patient.full_name}</h1>
          <p className="text-muted-foreground">
            Escala PBAT (Process-Based Assessment Tool)
            {record && (
              <span className="block text-sm mt-1">
                Sessão: {format(new Date(record.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            )}
          </p>
        </div>
        
        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-2">
          {existingAssessment && (
            <>
              {editMode ? (
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Assessment Status */}
      {existingAssessment && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">
                {editMode ? "Editando Avaliação Existente" : "Avaliação Concluída"}
              </h3>
              <p className="text-sm text-green-800">
                {editMode 
                  ? "Você pode alterar as respostas e salvar as mudanças."
                  : "Avaliação realizada. Clique em 'Editar' para fazer alterações."}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Progress Indicator */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Progresso da Avaliação</h3>
          <Badge variant={progress === 100 ? "default" : "secondary"}>
            {progress}% completo
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {answeredQuestions} de {totalQuestions} questões respondidas
        </p>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Instruções</h3>
            <p className="text-sm text-blue-800">
              Baseie suas respostas em como você tem agido na <strong>última semana</strong>. 
              Não existem respostas certas ou erradas.
              {recordId && (
                <span className="block mt-1 font-medium">
                  ⚠️ Esta avaliação será correlacionada com a sessão atual para análise comparativa futura.
                </span>
              )}
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
          {PBAT_QUESTIONS.map((question, index) => {
            const hasAnswer = answers[`q${index + 1}`] !== undefined;
            return (
              <div key={index} className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  {!hasAnswer && editMode && <AlertCircle className="h-4 w-4 text-amber-500" />}
                  {index + 1}. {question}
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-32">Discordo completamente</span>
                  <Slider
                    value={[answers[`q${index + 1}`] || 0]}
                    onValueChange={(value) => editMode && handleSliderChange(index + 1, value)}
                    max={100}
                    step={10}
                    className="flex-1"
                    disabled={isReadOnly}
                  />
                  <span className="text-xs text-muted-foreground w-32 text-right">Concordo completamente</span>
                  <Badge 
                    variant={hasAnswer ? "default" : "outline"} 
                    className="w-12 justify-center"
                  >
                    {answers[`q${index + 1}`] || 0}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Outcome Measures */}
      <Card>
        <CardHeader>
          <CardTitle>Durante a última semana, o quanto você se incomodou com:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {OUTCOME_QUESTIONS.map((question, index) => {
            const questionNumber = 24 + index;
            const hasAnswer = answers[`q${questionNumber}`] !== undefined;
            return (
              <div key={index} className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  {!hasAnswer && editMode && <AlertCircle className="h-4 w-4 text-amber-500" />}
                  {questionNumber}. {question}
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-24">Nenhum pouco</span>
                  <Slider
                    value={[answers[`q${questionNumber}`] || 0]}
                    onValueChange={(value) => editMode && handleSliderChange(questionNumber, value)}
                    max={100}
                    step={10}
                    className="flex-1"
                    disabled={isReadOnly}
                  />
                  <span className="text-xs text-muted-foreground w-24 text-right">Severamente</span>
                  <Badge 
                    variant={hasAnswer ? "default" : "outline"} 
                    className="w-12 justify-center"
                  >
                    {answers[`q${questionNumber}`] || 0}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {!healthStatus && editMode && <AlertCircle className="h-4 w-4 text-amber-500" />}
            29. Durante a última semana, você diria que sua saúde estava:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={healthStatus} onValueChange={editMode ? handleHealthStatusChange : undefined}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="muito_ruim" id="muito_ruim" disabled={isReadOnly} />
              <Label htmlFor="muito_ruim" className={isReadOnly ? "text-muted-foreground" : ""}>Muito Ruim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ruim" id="ruim" disabled={isReadOnly} />
              <Label htmlFor="ruim" className={isReadOnly ? "text-muted-foreground" : ""}>Ruim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="boa" id="boa" disabled={isReadOnly} />
              <Label htmlFor="boa" className={isReadOnly ? "text-muted-foreground" : ""}>Boa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="muito_boa" id="muito_boa" disabled={isReadOnly} />
              <Label htmlFor="muito_boa" className={isReadOnly ? "text-muted-foreground" : ""}>Muito Boa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excelente" id="excelente" disabled={isReadOnly} />
              <Label htmlFor="excelente" className={isReadOnly ? "text-muted-foreground" : ""}>Excelente</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Vitality Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Durante a última semana, o quanto estas afirmações foram verdadeiras:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {VITALITY_QUESTIONS.map((question, index) => {
            const questionNumber = 30 + index;
            const hasAnswer = answers[`q${questionNumber}`] !== undefined;
            return (
              <div key={index} className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  {!hasAnswer && editMode && <AlertCircle className="h-4 w-4 text-amber-500" />}
                  {questionNumber}. {question}
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-24">Nada verdadeira</span>
                  <Slider
                    value={[answers[`q${questionNumber}`] || 0]}
                    onValueChange={(value) => editMode && handleSliderChange(questionNumber, value)}
                    max={100}
                    step={10}
                    className="flex-1"
                    disabled={isReadOnly}
                  />
                  <span className="text-xs text-muted-foreground w-32 text-right">Totalmente verdadeira</span>
                  <Badge 
                    variant={hasAnswer ? "default" : "outline"} 
                    className="w-12 justify-center"
                  >
                    {answers[`q${questionNumber}`] || 0}
                  </Badge>
                </div>
              </div>
            );
          })}
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
            onChange={(e) => editMode && handleNotesChange(e.target.value)}
            rows={4}
            disabled={isReadOnly}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(`/patients/${patientId}/session/${recordId}/roadmap`)}>
          Voltar
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving || (editMode && progress < 100)}
          className="min-w-32"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : 
           !editMode ? "Editar" : 
           existingAssessment ? "Salvar Alterações" : "Salvar Avaliação"}
        </Button>
      </div>
      
      {editMode && progress < 100 && (
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">
              Complete todas as questões para habilitar o salvamento da avaliação.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PatientAssessment;