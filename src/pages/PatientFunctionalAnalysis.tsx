import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Lock, Grid3x3, CheckCircle } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { usePatientMediators } from "@/hooks/usePatientMediators";
import { usePatientFunctionalAnalysis } from "@/hooks/usePatientFunctionalAnalysis";
import { useRecords } from "@/hooks/useRecords";

const GUIDING_QUESTIONS = {
  cognition: {
    name: "Cognição",
    color: "bg-blue-100 border-blue-300 text-blue-800",
    selection: `Explore problemas na seleção — A que funções servem esses padrões de pensamento ou forma de ajustamento aos pensamentos? Inicie com as dominantes, repetitivas e mal-adaptativas, mas depois passe para os pensamentos ou as formas de ajustamento mais adaptativos, embora eles possam ocorrer esporadicamente.`,
    variation: `Explore problemas na variação — Quais são os pensamentos (e as estratégias para lidar com os pensamentos) que surgem para o cliente quando ele está em sua luta? Quais se tornam dominantes? Há algum senso de rigidez presente em cognições particulares ou formas de ajustamento a elas?`,
    retention: `Explore problemas na retenção — Como esses padrões de pensamentos e formas de ajustamento dominantes se mantêm e facilitam os problemas do cliente no modelo de rede? No caso de pensamentos e padrões de ajustamento que são adaptativos, por que eles não são retidos quando ocorrem?`
  },
  emotion: {
    name: "Emoção",
    color: "bg-red-100 border-red-300 text-red-800",
    selection: `Explore problemas na seleção — A que funções servem essas emoções e esses padrões de resposta às emoções? Inicie com as dominantes, repetitivas e mal-adaptativas, mas depois passe para as formas adaptativas.`,
    variation: `Explore problemas na variação — Quais são as emoções e as estratégias para se ajustar a elas que surgem para o cliente quando ele está em sua batalha? Quais se tornam dominantes?`,
    retention: `Explore problemas na retenção — Como esses padrões dominantes de emoção e ajustamento à emoção facilitam os problemas do cliente no modelo de rede?`
  },
  attention: {
    name: "Atenção & Consciencia",
    color: "bg-yellow-100 border-yellow-300 text-yellow-800",
    selection: `Explore problemas na seleção — A que funções servem esses padrões atencionais dentro da rede de eventos do cliente? Comece com padrões atencionais dominantes e problemáticos.`,
    variation: `Explore problemas na variação — Onde o cliente coloca seu foco atencional quando está em sua batalha? Há alguma sensação de rigidez presente em seu processo atencional?`,
    retention: `Explore problemas na retenção — Como os padrões atencionais facilitam a ocorrência crônica dos problemas do cliente no modelo de rede?`
  },
  self: {
    name: "Self",
    color: "bg-purple-100 border-purple-300 text-purple-800",
    selection: `Explore problemas na seleção — Quais são as funções de um senso de self problemático? Se ou quando um senso de self mais saudável aparece, a que funções ele pode servir?`,
    variation: `Explore problemas na variação — Há um senso de self que aparece para o cliente quando ele está em sua luta, ou que não aparece e poderia ser útil?`,
    retention: `Explore problemas na retenção — Na área do self, como esses padrões dominantes apoiam, facilitam ou mantêm os problemas do cliente no modelo de rede?`
  },
  motivation: {
    name: "Motivação",
    color: "bg-green-100 border-green-300 text-green-800",
    selection: `Explore problemas na seleção — Quais são as funções das formas de motivação mal-adaptativas que estão presentes na rede?`,
    variation: `Explore problemas na variação — Há padrões de motivação mal-adaptativos característicos para o cliente quando ele está com dificuldades?`,
    retention: `Explore problemas na retenção — Como esses padrões dominantes na área da motivação apoiam, facilitam ou mantêm os problemas do cliente?`
  },
  behavior: {
    name: "Comportamento",
    color: "bg-orange-100 border-orange-300 text-orange-800",
    selection: `Explore problemas na seleção — Quais são as funções de formas problemáticas de comportamento explícito na rede do cliente?`,
    variation: `Explore problemas na variação — Que padrões de comportamento explícito aparecem para o cliente quando ele está em dificuldades?`,
    retention: `Explore problemas na retenção — Como esses padrões comportamentais explícitos dominantes apoiam, facilitam ou mantêm os problemas do cliente?`
  }
} as const;

const PatientFunctionalAnalysis = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords(patientId);
  const { mediatorProcesses, loading: mediatorsLoading } = usePatientMediators(patientId || "", recordId);
  const { analyses: savedAnalyses, saveAnalysis, getAnalysisForProcess, loading: analysisLoading } = usePatientFunctionalAnalysis(patientId || "", recordId);

  const [selectedProcessInfo, setSelectedProcessInfo] = useState<{process: string, dimension: string, mediator: string} | null>(null);
  const [selectionAnalysis, setSelectionAnalysis] = useState("");
  const [variationAnalysis, setVariationAnalysis] = useState("");
  const [retentionAnalysis, setRetentionAnalysis] = useState("");

  const patient = patients.find(p => p.id === patientId);
  const record = records.find(r => r.id === recordId);

  // Build list safely even when mediatorProcesses is empty
  const processesWithMediators: Array<{process: string, dimension: string, mediator: string}> = [];
  if (mediatorProcesses && typeof mediatorProcesses === 'object') {
    Object.entries(mediatorProcesses).forEach(([dimension, mediators]) => {
      if (mediators && typeof mediators === 'object') {
        Object.entries(mediators as Record<string, string[]>).forEach(([mediator, processes]) => {
          (processes || []).forEach(process => {
            if (process) processesWithMediators.push({ process, dimension, mediator });
          });
        });
      }
    });
  }

  useEffect(() => {
    if (selectedProcessInfo) {
      const existing = getAnalysisForProcess(selectedProcessInfo.process);
      if (existing) {
        setSelectionAnalysis(existing.selectionAnalysis || "");
        setVariationAnalysis(existing.variationAnalysis || "");
        setRetentionAnalysis(existing.retentionAnalysis || "");
      } else {
        setSelectionAnalysis("");
        setVariationAnalysis("");
        setRetentionAnalysis("");
      }
    }
  }, [selectedProcessInfo]);

  const handleSave = async () => {
    if (!selectedProcessInfo || !patientId) return;
    const existing = getAnalysisForProcess(selectedProcessInfo.process);
    await saveAnalysis({
      id: existing?.id,
      processName: selectedProcessInfo.process,
      dimension: selectedProcessInfo.dimension,
      mediator: selectedProcessInfo.mediator,
      selectionAnalysis,
      variationAnalysis,
      retentionAnalysis,
    } as any);
  };

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

  const analyzedCount = savedAnalyses.length;
  const totalProcesses = processesWithMediators.length;

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/patients/${patientId}/session/${recordId}/roadmap`)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Roadmap
        </Button>
        <h1 className="text-3xl font-bold mb-2">Análise Funcional - {patient.full_name}</h1>
        <p className="text-muted-foreground">
          Análise idiográfica dos processos através de Seleção, Variação e Retenção
        </p>
      </div>

      <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Etapa 4 de 5
              </Badge>
              <span className="text-sm font-medium">Jornada de Análise</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Processos com Mediadores:</span>
              <Badge variant="outline" className="bg-white">{totalProcesses}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Analisados:</span>
              <Badge variant="outline" className="bg-white">{analyzedCount}/{totalProcesses}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h3 className="font-semibold mb-2">Como usar:</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Selecione um processo que foi organizado na Etapa 3 (Análise de Mediadores).
          A dimensão e mediador já estão pré-definidos e não podem ser alterados.
        </p>
        <p className="text-sm text-muted-foreground">
          Responda às perguntas orientadoras para cada aspecto (Seleção, Variação e Retenção) 
          considerando o contexto específico do paciente.
        </p>
      </Card>

      {processesWithMediators.length > 0 ? (
        <Card className="p-6">
          <div className="space-y-4">
            <label className="text-sm font-medium">Selecione o Processo (da Etapa 3)</label>
            <Select 
              value={selectedProcessInfo ? `${selectedProcessInfo.process}|${selectedProcessInfo.dimension}|${selectedProcessInfo.mediator}` : ""} 
              onValueChange={(value) => {
                if (value) {
                  const [process, dimension, mediator] = value.split('|');
                  setSelectedProcessInfo({ process, dimension, mediator });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um processo para analisar" />
              </SelectTrigger>
              <SelectContent>
                {processesWithMediators.map((item, idx) => {
                  const dimensionInfo = GUIDING_QUESTIONS[item.dimension as keyof typeof GUIDING_QUESTIONS];
                  const isAnalyzed = savedAnalyses.some(a => a.processName === item.process);
                  
                  return (
                    <SelectItem 
                      key={idx} 
                      value={`${item.process}|${item.dimension}|${item.mediator}`}
                      className="py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.process}</span>
                        {isAnalyzed && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dimensionInfo?.name} → {item.mediator}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {selectedProcessInfo && (
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                  <Grid3x3 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{selectedProcessInfo.process}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {GUIDING_QUESTIONS[selectedProcessInfo.dimension as keyof typeof GUIDING_QUESTIONS]?.name}
                      </Badge>
                      <span>→</span>
                      <Badge variant="outline" className="text-xs">{selectedProcessInfo.mediator}</Badge>
                      <Lock className="h-3 w-3" />
                      <span className="text-xs">Pré-definido na Etapa 3</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <Grid3x3 className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800">Nenhum Processo com Mediadores Encontrado</h3>
              <p className="text-sm text-amber-700">
                Não foram encontrados processos organizados na Etapa 3 (Análise de Mediadores) desta sessão.
                Complete a etapa anterior para prosseguir.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/patients/${patientId}/session/${recordId}/mediators`)}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              Ir para Análise de Mediadores
            </Button>
          </div>
        </Card>
      )}

      {selectedProcessInfo && (
        <Card className={`p-4 border-2 ${GUIDING_QUESTIONS[selectedProcessInfo.dimension as keyof typeof GUIDING_QUESTIONS]?.color}`}>
          <h2 className="text-lg font-bold text-center">
            Análise Funcional: {GUIDING_QUESTIONS[selectedProcessInfo.dimension as keyof typeof GUIDING_QUESTIONS]?.name}
          </h2>
        </Card>
      )}

      {selectedProcessInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Seleção</h3>
            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem value="questions">
                <AccordionTrigger className="text-sm">
                  Perguntas Orientadoras
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {GUIDING_QUESTIONS[selectedProcessInfo.dimension as keyof typeof GUIDING_QUESTIONS]?.selection}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Textarea
              value={selectionAnalysis}
              onChange={(e) => setSelectionAnalysis(e.target.value)}
              placeholder="Descreva a análise de seleção..."
              className="min-h-[300px]"
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Variação</h3>
            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem value="questions">
                <AccordionTrigger className="text-sm">
                  Perguntas Orientadoras
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {GUIDING_QUESTIONS[selectedProcessInfo.dimension as keyof typeof GUIDING_QUESTIONS]?.variation}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Textarea
              value={variationAnalysis}
              onChange={(e) => setVariationAnalysis(e.target.value)}
              placeholder="Descreva a análise de variação..."
              className="min-h-[300px]"
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Retenção</h3>
            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem value="questions">
                <AccordionTrigger className="text-sm">
                  Perguntas Orientadoras
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {GUIDING_QUESTIONS[selectedProcessInfo.dimension as keyof typeof GUIDING_QUESTIONS]?.retention}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Textarea
              value={retentionAnalysis}
              onChange={(e) => setRetentionAnalysis(e.target.value)}
              placeholder="Descreva a análise de retenção..."
              className="min-h-[300px]"
            />
          </Card>
        </div>
      )}

      {selectedProcessInfo && (
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={analysisLoading}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Análise
          </Button>
        </div>
      )}

      {!selectedProcessInfo && processesWithMediators.length > 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Selecione um processo da Etapa 3 para iniciar a análise funcional
          </p>
        </Card>
      )}
    </div>
  );
};

export default PatientFunctionalAnalysis;
