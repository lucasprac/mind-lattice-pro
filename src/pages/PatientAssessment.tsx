import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, ClipboardList } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { usePatientAssessments } from "@/hooks/usePatientAssessments";
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
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { saveAssessment } = usePatientAssessments(patientId || "");
  
  const patient = patients.find(p => p.id === patientId);
  
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [healthStatus, setHealthStatus] = useState<string>("");
  const [notes, setNotes] = useState("");

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

  const handleSliderChange = (question: number, value: number[]) => {
    setAnswers(prev => ({ ...prev, [`q${question}`]: value[0] }));
  };

  const handleSave = async () => {
    const assessmentData: any = {
      assessment_date: new Date().toISOString(),
      notes,
    };

    // Add PBAT questions
    for (let i = 1; i <= 23; i++) {
      assessmentData[`q${i}`] = answers[`q${i}`] || 0;
    }

    // Add outcome questions
    for (let i = 24; i <= 28; i++) {
      assessmentData[`q${i}`] = answers[`q${i}`] || 0;
    }

    // Add health status
    assessmentData.q29 = healthStatus || 'boa';

    // Add vitality questions
    for (let i = 30; i <= 34; i++) {
      assessmentData[`q${i}`] = answers[`q${i}`] || 0;
    }

    const success = await saveAssessment(assessmentData);
    if (success) {
      navigate(`/patients/${patientId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/patients/${patientId}`)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Roadmap
        </Button>
        <h1 className="text-3xl font-bold mb-2">Avaliação Inicial - {patient.full_name}</h1>
        <p className="text-muted-foreground">
          Escala PBAT (Process-Based Assessment Tool)
        </p>
      </div>

      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Instruções</h3>
            <p className="text-sm text-blue-800">
              Baseie suas respostas em como você tem agido na <strong>última semana</strong>. 
              Não existem respostas certas ou erradas.
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

      {/* Outcome Measures */}
      <Card>
        <CardHeader>
          <CardTitle>Durante a última semana, o quanto você se incomodou com:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {OUTCOME_QUESTIONS.map((question, index) => (
            <div key={index} className="space-y-3">
              <Label className="text-sm font-medium">
                {24 + index}. {question}
              </Label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-24">Nenhum pouco</span>
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

      {/* Health Status */}
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

      {/* Vitality Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Durante a última semana, o quanto estas afirmações foram verdadeiras:</CardTitle>
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
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(`/patients/${patientId}`)}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Avaliação
        </Button>
      </div>
    </div>
  );
};

export default PatientAssessment;
