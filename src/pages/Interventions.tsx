import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Search, BookOpen } from "lucide-react";
import { useState } from "react";

const Interventions = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample intervention library
  const interventionCategories = [
    { name: "Manejo de Contingências", count: 5, color: "bg-primary" },
    { name: "Controle de Estímulos", count: 3, color: "bg-secondary" },
    { name: "Modelagem", count: 4, color: "bg-success" },
    { name: "Autogerenciamento", count: 3, color: "bg-warning" },
    { name: "Redução da Excitação", count: 2, color: "bg-primary" },
    { name: "Regulação Emocional", count: 6, color: "bg-secondary" },
    { name: "Solução de Problemas", count: 4, color: "bg-success" },
    { name: "Estratégias de Exposição", count: 5, color: "bg-warning" },
    { name: "Ativação Comportamental", count: 3, color: "bg-primary" },
    { name: "Competências Interpessoais", count: 4, color: "bg-secondary" },
    { name: "Reavaliação Cognitiva", count: 5, color: "bg-success" },
    { name: "Modificação de Crenças", count: 3, color: "bg-warning" },
    { name: "Desfusão Cognitiva", count: 4, color: "bg-primary" },
    { name: "Aceitação Psicológica", count: 5, color: "bg-secondary" },
    { name: "Valores e Significado", count: 3, color: "bg-success" },
    { name: "Mindfulness", count: 6, color: "bg-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Biblioteca de Intervenções</h1>
        <p className="text-muted-foreground">
          Explore intervenções baseadas em evidências organizadas por processo-alvo
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar intervenções por nome, categoria ou processo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Guia de Uso
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {interventionCategories.map((category) => (
            <Card 
              key={category.name}
              className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${category.color}/10`}>
                  <Brain className={`h-5 w-5 ${category.color.replace('bg-', 'text-')}`} />
                </div>
                <Badge variant="secondary">{category.count}</Badge>
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {category.count} técnica{category.count > 1 ? 's' : ''} disponíve{category.count > 1 ? 'is' : 'l'}
              </p>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary rounded-xl">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Planejamento de Intervenções</h3>
            <p className="text-muted-foreground mb-4">
              Selecione um paciente para criar um plano de intervenção personalizado baseado 
              na análise da rede de processos e evidências científicas.
            </p>
            <Button>Criar Plano de Intervenção</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Interventions;
