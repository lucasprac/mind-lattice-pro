import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Network, Grid3x3, TrendingUp, FileText, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Network,
      title: "Redes de Processos",
      description: "Editor visual interativo para mapear relações causais entre processos psicológicos",
    },
    {
      icon: Grid3x3,
      title: "Matriz EEMM",
      description: "Framework organizacional multidimensional baseado no Extended Evolutionary Meta-Model",
    },
    {
      icon: TrendingUp,
      title: "Análise Preditiva",
      description: "Modelagem dinâmica e sugestões automáticas de pontos de intervenção eficazes",
    },
    {
      icon: FileText,
      title: "Prontuário Integrado",
      description: "Documentação clínica conectada diretamente à rede de processos do paciente",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6">
            <Brain className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Sistema PBT
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Plataforma SAAS para Terapia Baseada em Processos
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gerencie pacientes, construa redes de processos e utilize o framework EEMM 
            (Extended Evolutionary Meta-Model) para intervenções precisas baseadas em evidências.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 text-lg" onClick={() => navigate("/auth")}>
              Entrar / Cadastrar
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg" onClick={() => navigate("/dashboard")}>
              Ver Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 hover:shadow-lg transition-all hover:border-primary/50">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
          <div className="max-w-3xl mx-auto text-center">
            <Users className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-4">
              Pronto para transformar sua prática clínica?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Baseado no modelo de Steven Hayes "Aprendendo a Terapia Baseada em Processos", 
              este sistema integra as dimensões Cognição, Emoção, Self, Motivação e Comportamento 
              nos níveis Biologia, Psicologia e Cultura.
            </p>
            <Button size="lg" className="gap-2" onClick={() => navigate("/auth")}>
              Começar Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Sistema PBT - Terapia Baseada em Processos</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
