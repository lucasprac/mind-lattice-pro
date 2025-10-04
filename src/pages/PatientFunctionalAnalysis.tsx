import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { ArrowLeft, Save } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { usePatientMediators } from "@/hooks/usePatientMediators";
import { usePatientFunctionalAnalysis } from "@/hooks/usePatientFunctionalAnalysis";

// Guiding questions organized by dimension and aspect
const GUIDING_QUESTIONS = {
  cognition: {
    name: "Cognição",
    color: "bg-blue-100 border-blue-300 text-blue-800",
    selection: `Explore problemas na seleção — A que funções servem esses padrões de pensamento ou forma de ajustamento aos pensamentos? Inicie com as dominantes, repetitivas e mal-adaptativas, mas depois passe para os pensamentos ou as formas de ajustamento mais adaptativos, embora eles possam ocorrer esporadicamente.`,
    variation: `Explore problemas na variação — Quais são os pensamentos (e as estratégias para lidar com os pensamentos) que surgem para o cliente quando ele está em sua luta? Quais se tornam dominantes? Há algum senso de rigidez presente em cognições particulares (p. ex., "esquemas" dominantes ou pensamento negativo repetitivo) ou formas de ajustamento a elas (p. ex., tratá-las como todas literalmente verdadeiras)?`,
    retention: `Explore problemas na retenção — Como esses padrões de pensamentos e formas de ajustamento dominantes se mantêm e facilitam os problemas do cliente no modelo de rede? No caso de pensamentos e padrões de ajustamento que são adaptativos, por que eles não são retidos quando ocorrem? Que outras características da rede estão interferindo na retenção dos ganhos que podem ocorrer ocasionalmente?`
  },
  emotion: {
    name: "Afeto",
    color: "bg-red-100 border-red-300 text-red-800",
    selection: `Explore problemas na seleção — A que funções servem essas emoções e esses padrões de resposta às emoções? Inicie com as dominantes, repetitivas e mal-adaptativas, mas depois passe para as formas adaptativas, embora elas possam ocorrer esporadicamente.`,
    variation: `Explore problemas na variação — Quais são as emoções e as estratégias para se ajustar a elas que surgem para o cliente quando ele está em sua batalha? Quais se tornam dominantes? Está presente algum sentimento de rigidez em padrões emocionais particulares e/ou formas de ajustamento a eles (p. ex., uma gama restrita de afeto, estratégias de regulação emocional dominantes)?`,
    retention: `Explore problemas na retenção — Como esses padrões dominantes de emoção e ajustamento à emoção facilitam os problemas do cliente no modelo de rede? No caso de emoções e ajustamento às emoções que são adaptativas, por que elas não são retidas quando ocorrem? Que outras características da rede estão interferindo na retenção dos ganhos que podem ocorrer ocasionalmente?`
  },
  attention: {
    name: "Atenção",
    color: "bg-yellow-100 border-yellow-300 text-yellow-800",
    selection: `Explore problemas na seleção — A que funções servem esses padrões atencionais dentro da rede de eventos do cliente? Comece com padrões atencionais dominantes e problemáticos, mas depois prossiga para padrões atencionais mais adaptativos que sejam mais flexíveis, fluidos e voluntários.`,
    variation: `Explore problemas na variação — Onde o cliente coloca seu foco atencional quando está em sua batalha? Há alguma sensação de rigidez presente em seu processo atencional (p. ex. ser incapaz de manter o foco ou mudar o foco de uma área particular, ser atraído pelo passado interpretado ou o futuro imaginado enquanto deixa passar o presente em curso, ou ser excessivamente abrangente ou limitado no foco atencional)?`,
    retention: `Explore problemas na retenção — Como os padrões atencionais facilitam a ocorrência crônica dos problemas do cliente no modelo de rede? Por que os padrões atencionais adaptativos não são retidos quando ocorrem? Que outras características da rede estão interferindo na retenção saída do ganho?`
  },
  self: {
    name: "Self",
    color: "bg-green-100 border-green-300 text-green-800",
    selection: `Explore problemas na seleção — Quais são as funções de um senso de self problemático? Se ou quando um senso de self ou autoconceito mais saudável aparece, a que funções ele pode servir?`,
    variation: `Explore problemas na variação — Há um senso de self, ou um autoconceito, que aparece para o cliente quando ele está em sua luta, ou que não aparece e poderia ser útil? Há algum senso de rigidez ou falta de variação saudável no domínio do self?`,
    retention: `Explore problemas na retenção — Na área do self, como esses padrões dominantes apoiam, facilitam ou mantêm os problemas do cliente no modelo de rede? No caso de um senso de self ou autoconceito mais adaptativo, por que ele não é retido quando ocorre? Que outras características da rede estão interferindo na retenção dos ganhos que podem ocorrer ocasionalmente?`
  },
  motivation: {
    name: "Motivação",
    color: "bg-purple-100 border-purple-300 text-purple-800",
    selection: `Explore problemas na seleção — Quais são as funções das formas de motivação mal-adaptativas que estão presentes na rede? Quando formas de motivação mais saudáveis aparecem, a que funções elas podem servir?`,
    variation: `Explore problemas na variação — Há padrões de motivação mal-adaptativos característicos para o cliente quando ele está com dificuldades ou padrões mais adaptativos que não aparecem e que poderiam ser úteis? Há algum senso de rigidez ou falta de variação saudável no domínio da motivação?`,
    retention: `Explore problemas na retenção — Como esses padrões dominantes na área da motivação apoiam, facilitam ou mantêm os problemas do cliente no modelo de rede? No caso de formas de motivação mais adaptativas, por que elas não são retidas quando ocorrem? Que outras características da rede estão interferindo na retenção dos ganhos que podem ocorrer ocasionalmente?`
  },
  behavior: {
    name: "Comportamento",
    color: "bg-orange-100 border-orange-300 text-orange-800",
    selection: `Explore problemas na seleção — Quais são as funções de formas problemáticas de comportamento explícito na rede do cliente? Se ou quando aparecerem formas mais adaptativas de comportamento explícito, a que funções servem esses padrões de ação explícitos?`,
    variation: `Explore problemas na variação — Que padrões de comportamento explícito aparecem para o cliente quando ele está em dificuldades ou não aparecem e podem ser úteis? Há algum senso de rigidez ou falta de variação saudável no domínio de padrões ou hábitos comportamentais explícitos?`,
    retention: `Explore problemas na retenção — Como esses padrões comportamentais explícitos dominantes apoiam, facilitam ou mantêm os problemas do cliente no modelo de rede? No caso de padrões de ação explícitos mais adaptativos, por que eles não são retidos quando ocorrem? Que outras características da rede estão interferindo na retenção dos ganhos comportamentais que ocasionalmente podem ocorrer?`
  },
  biophysiological: {
    name: "Nível Biofisiológico",
    color: "bg-slate-100 border-slate-300 text-slate-800",
    selection: `Explore problemas na seleção — Quais são as funções de ações problemáticas biofisiologicamente relevantes na rede do cliente? Por exemplo, não fazer exercícios lhe possibilita evitar experienciar vergonha em relação ao seu corpo? Os padrões de maus hábitos alimentares são culturais? Se ou quando aparecem formas mais adaptativas do nível biofisiológico, a que funções esses padrões poderiam servir?`,
    variation: `Explore problemas na variação — Que padrões biofisiológicos relevantes aparecem para o cliente quando ele está em meio às suas dificuldades ou não aparecem e poderiam ser úteis? Há algum senso de rigidez ou falta de variação saudável no nível dessas ações biofisiologicamente relevantes (p. ex., falha em tentar uma alimentação mais saudável, relutância em explorar formas de se exercitar)?`,
    retention: `Explore problemas na retenção — Como esses padrões biofisiologicamente relevantes dominantes apoiam, facilitam ou mantêm os problemas do cliente no modelo de rede? No caso de padrões biofisiológicos mais adaptativos, por que eles não são retidos quando ocorrem? Que outras características da rede estão interferindo na retenção dos ganhos biofisiologicamente relevantes que podem ocorrer ocasionalmente?`,
    extraSections: [
      {
        title: "Padrões adaptativos e mal-adaptativos na dieta",
        questions: [
          "O que você come que é saudável/não saudável em um dia normal?",
          "Com que frequência e quando você come em excesso ou restringe o que come?",
          "O que você bebe? E quanto?"
        ]
      },
      {
        title: "Padrões adaptativos e mal-adaptativos no exercício",
        questions: [
          "Você se exercita? Com que frequência?",
          "Que tipo de exercícios você faz?",
          "Com que intensidade você se exercita?",
          "Há quanto tempo você se exercita/não se exercita?"
        ]
      },
      {
        title: "Explore problemas no sono",
        questions: [
          "Você dorme bem?",
          "Você tem dificuldade para adormecer?",
          "A que horas você vai dormir/acorda?",
          "Você se sente descansado depois de dormir?"
        ]
      },
      {
        title: "Explore problemas em outros hábitos relacionados à saúde",
        questions: [
          "Você usa algum tipo de droga? Em caso afirmativo, o que, com que frequência e quanto você usa?",
          "Quanto tempo por dia você passa sentado?",
          "Você medita? Em caso afirmativo, com que frequência e por quanto tempo?",
          "Quanto tempo você passa ao ar livre?",
          "Como você relaxa?"
        ]
      }
    ]
  },
  sociocultural: {
    name: "Nível Sociocultural",
    color: "bg-stone-100 border-stone-300 text-stone-800",
    selection: `Explore problemas na seleção — Quais são as funções de padrões socioculturais problemáticos na rede do cliente? Se ou quando formas mais adaptativas do nível sociocultural aparecem, a que funções esses padrões podem servir?`,
    variation: `Explore problemas na variação — Que padrões socioculturais aparecem para o cliente quando ele está em meio à suas dificuldades ou não aparecem e poderiam ser úteis? Há algum senso de rigidez ou falta de variação saudável no nível sociocultural?`,
    retention: `Explore problemas na retenção — Como esses padrões socioculturais apoiam, facilitam ou mantêm os problemas do cliente no modelo de rede? No caso de padrões socioculturais mais adaptativos, por que eles não são retidos quando ocorrem? Que outras características da rede estão interferindo na retenção dos ganhos socioculturais que podem ocorrer ocasionalmente?`,
    extraSections: [
      {
        title: "Explore problemas nas crenças culturais",
        questions: [
          "Qual é seu contexto sociocultural?",
          "Quais são suas crenças religiosas?",
          "Como sua cultura e/ou religião é crítico de relevância para a rede?",
          "Como problemas como estes são discutidos com a sua família e seus amigos?",
          "Você sente vergonha isolando normas culturais ou que precisaria fazer isso para abordar estas área-problema?"
        ]
      },
      {
        title: "Explore problemas no apoio social",
        questions: [
          "Como você descreveria a relação com sua família e seus amigos?",
          "O quanto você pode contar ativamente com a mesma família e seus amigos?",
          "Quantos amigos próximos você tem?",
          "Quem você procura quando tem problemas pessoais?"
        ]
      },
      {
        title: "Explore problemas com estigma",
        questions: [
          "Qual foi sua experiência com preconceito?",
          "Você já foi alvo de preconceito?",
          "De que formas você foi estigmatizado?",
          "Como o preconceito o afetou pessoalmente?"
        ]
      }
    ]
  }
};

const PatientFunctionalAnalysis = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { getAllProcesses, loading: mediatorsLoading } = usePatientMediators(patientId || "");
  const { analyses: savedAnalyses, saveAnalysis, getAnalysisForProcess, loading: analysisLoading } = usePatientFunctionalAnalysis(patientId || "");

  const [selectedProcess, setSelectedProcess] = useState("");
  const [selectedDimension, setSelectedDimension] = useState<keyof typeof GUIDING_QUESTIONS>("cognition");
  
  // Form state
  const [selectionAnalysis, setSelectionAnalysis] = useState("");
  const [variationAnalysis, setVariationAnalysis] = useState("");
  const [retentionAnalysis, setRetentionAnalysis] = useState("");
  const [biofisiologicoSelection, setBiofisiologicoSelection] = useState("");
  const [biofisiologicoVariation, setBiofisiologicoVariation] = useState("");
  const [biofisiologicoRetention, setBiofisiologicoRetention] = useState("");
  const [socioculturalSelection, setSocioculturalSelection] = useState("");
  const [socioculturalVariation, setSocioculturalVariation] = useState("");
  const [socioculturalRetention, setSocioculturalRetention] = useState("");

  const patient = patients.find(p => p.id === patientId);
  const availableProcesses = getAllProcesses();

  // Load existing analysis when process is selected
  useEffect(() => {
    if (selectedProcess) {
      const existing = getAnalysisForProcess(selectedProcess);
      if (existing) {
        setSelectionAnalysis(existing.selectionAnalysis);
        setVariationAnalysis(existing.variationAnalysis);
        setRetentionAnalysis(existing.retentionAnalysis);
        setBiofisiologicoSelection(existing.biofisiologicoSelection);
        setBiofisiologicoVariation(existing.biofisiologicoVariation);
        setBiofisiologicoRetention(existing.biofisiologicoRetention);
        setSocioculturalSelection(existing.socioculturalSelection);
        setSocioculturalVariation(existing.socioculturalVariation);
        setSocioculturalRetention(existing.socioculturalRetention);
        setSelectedDimension(existing.dimension as keyof typeof GUIDING_QUESTIONS);
      } else {
        // Clear form for new analysis
        setSelectionAnalysis("");
        setVariationAnalysis("");
        setRetentionAnalysis("");
        setBiofisiologicoSelection("");
        setBiofisiologicoVariation("");
        setBiofisiologicoRetention("");
        setSocioculturalSelection("");
        setSocioculturalVariation("");
        setSocioculturalRetention("");
      }
    }
  }, [selectedProcess]);

  const handleSave = async () => {
    if (!selectedProcess || !patientId) return;

    const existing = getAnalysisForProcess(selectedProcess);
    const success = await saveAnalysis({
      id: existing?.id,
      processName: selectedProcess,
      dimension: selectedDimension,
      selectionAnalysis,
      variationAnalysis,
      retentionAnalysis,
      biofisiologicoSelection,
      biofisiologicoVariation,
      biofisiologicoRetention,
      socioculturalSelection,
      socioculturalVariation,
      socioculturalRetention,
    });

    if (success) {
      // Analysis saved successfully
    }
  };

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
        <h1 className="text-3xl font-bold mb-2">Análise Funcional - {patient.full_name}</h1>
        <p className="text-muted-foreground">
          Análise idiográfica dos processos através de Seleção, Variação e Retenção
        </p>
      </div>

      {/* Instructions */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h3 className="font-semibold mb-2">Como usar:</h3>
        <p className="text-sm text-muted-foreground">
          Selecione um processo catalogado na etapa anterior e sua dimensão correspondente. 
          Responda às perguntas orientadoras para cada aspecto (Seleção, Variação e Retenção) 
          considerando o contexto específico do paciente.
        </p>
      </Card>

      {/* Process Selection */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecione o Processo</label>
            <Select value={selectedProcess} onValueChange={setSelectedProcess}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um processo para analisar" />
              </SelectTrigger>
              <SelectContent>
                {mediatorsLoading ? (
                  <SelectItem value="loading">Carregando...</SelectItem>
                ) : availableProcesses.length === 0 ? (
                  <SelectItem value="none">Nenhum processo disponível</SelectItem>
                ) : (
                  availableProcesses.map(process => (
                    <SelectItem key={process} value={process}>{process}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Dimensão/Nível</label>
            <Select value={selectedDimension} onValueChange={(v) => setSelectedDimension(v as keyof typeof GUIDING_QUESTIONS)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GUIDING_QUESTIONS).map(([key, data]) => (
                  <SelectItem key={key} value={key}>{data.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Dimension Badge */}
      {selectedProcess && (
        <Card className={`p-4 border-2 ${GUIDING_QUESTIONS[selectedDimension].color}`}>
          <h2 className="text-lg font-bold text-center">
            {GUIDING_QUESTIONS[selectedDimension].name}
          </h2>
        </Card>
      )}

      {/* Functional Analysis Grid */}
      {selectedProcess && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selection */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Seleção</h3>
            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem value="questions">
                <AccordionTrigger className="text-sm">
                  Perguntas Orientadoras
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {GUIDING_QUESTIONS[selectedDimension].selection}
                  </p>
                </AccordionContent>
              </AccordionItem>
              {('extraSections' in GUIDING_QUESTIONS[selectedDimension]) && (GUIDING_QUESTIONS[selectedDimension] as any).extraSections?.map((section: any, idx: number) => (
                <AccordionItem key={`sel-extra-${idx}`} value={`sel-extra-${idx}`}>
                  <AccordionTrigger className="text-sm">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                      {section.questions.map((q, qIdx) => (
                        <li key={qIdx}>{q}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Textarea
              value={selectionAnalysis}
              onChange={(e) => setSelectionAnalysis(e.target.value)}
              placeholder="Descreva a análise de seleção..."
              className="min-h-[300px]"
            />
          </Card>

          {/* Variation */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Variação</h3>
            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem value="questions">
                <AccordionTrigger className="text-sm">
                  Perguntas Orientadoras
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {GUIDING_QUESTIONS[selectedDimension].variation}
                  </p>
                </AccordionContent>
              </AccordionItem>
              {('extraSections' in GUIDING_QUESTIONS[selectedDimension]) && (GUIDING_QUESTIONS[selectedDimension] as any).extraSections?.map((section: any, idx: number) => (
                <AccordionItem key={`var-extra-${idx}`} value={`var-extra-${idx}`}>
                  <AccordionTrigger className="text-sm">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                      {section.questions.map((q, qIdx) => (
                        <li key={qIdx}>{q}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Textarea
              value={variationAnalysis}
              onChange={(e) => setVariationAnalysis(e.target.value)}
              placeholder="Descreva a análise de variação..."
              className="min-h-[300px]"
            />
          </Card>

          {/* Retention */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Retenção</h3>
            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem value="questions">
                <AccordionTrigger className="text-sm">
                  Perguntas Orientadoras
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {GUIDING_QUESTIONS[selectedDimension].retention}
                  </p>
                </AccordionContent>
              </AccordionItem>
              {('extraSections' in GUIDING_QUESTIONS[selectedDimension]) && (GUIDING_QUESTIONS[selectedDimension] as any).extraSections?.map((section: any, idx: number) => (
                <AccordionItem key={`ret-extra-${idx}`} value={`ret-extra-${idx}`}>
                  <AccordionTrigger className="text-sm">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                      {section.questions.map((q, qIdx) => (
                        <li key={qIdx}>{q}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
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

      {selectedProcess && (
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Salvar Análise
          </Button>
        </div>
      )}

      {!selectedProcess && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Selecione um processo e sua dimensão para iniciar a análise funcional
          </p>
        </Card>
      )}
    </div>
  );
};

export default PatientFunctionalAnalysis;
