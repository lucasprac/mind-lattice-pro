import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const EEMMMatrix = () => {
  // Simplified EEMM Matrix for MVP (5 dimensions x 3 levels)
  const dimensions = [
    "Cognição",
    "Emoção",
    "Self",
    "Motivação",
    "Comportamento Explícito"
  ];

  const levels = [
    "Biologia/Fisiologia",
    "Psicologia",
    "Relacionamentos/Cultura"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Matriz EEMM</h1>
        <p className="text-muted-foreground">
          Extended Evolutionary Meta-Model - Framework organizacional dos processos
        </p>
      </div>

      <Card className="p-6 bg-accent/30 border-accent">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1 text-accent-foreground">Sobre o Modelo EEMM</h3>
            <p className="text-sm text-accent-foreground/80">
              O EEMM organiza os processos psicológicos em uma matriz multidimensional que cruza 
              <strong> dimensões psicológicas</strong> (Cognição, Emoção, etc.) com 
              <strong> níveis de análise</strong> (Biologia, Psicologia, Cultura). 
              Cada célula representa um espaço para mapear processos específicos do paciente.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Matriz Interativa</h2>
            <p className="text-muted-foreground">Versão simplificada 5x3 para MVP</p>
          </div>
          <Button variant="outline">Visualizar 3D</Button>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header Row */}
            <div className="flex mb-2">
              <div className="w-48 shrink-0"></div>
              {levels.map((level) => (
                <div key={level} className="flex-1 min-w-[200px] px-2">
                  <div className="text-center font-semibold text-sm bg-primary/10 text-primary rounded-lg py-3 px-2">
                    {level}
                  </div>
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            {dimensions.map((dimension, dimIndex) => (
              <div key={dimension} className="flex mb-2">
                <div className="w-48 shrink-0 pr-4 flex items-center">
                  <div className="text-sm font-semibold bg-secondary/10 text-secondary rounded-lg py-3 px-4 w-full text-center">
                    {dimension}
                  </div>
                </div>
                {levels.map((level, levelIndex) => (
                  <div key={`${dimension}-${level}`} className="flex-1 min-w-[200px] px-2">
                    <Card className="h-24 p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {dimIndex * levels.length + levelIndex + 1}
                          </Badge>
                          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                            0 processos
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground text-center mt-auto">
                          Clique para adicionar
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold mb-3">Legenda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20"></div>
              <span className="text-muted-foreground">Densidade Baixa (1-2 processos)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/50"></div>
              <span className="text-muted-foreground">Densidade Média (3-5 processos)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/80"></div>
              <span className="text-muted-foreground">Densidade Alta (6+ processos)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-destructive"></div>
              <span className="text-muted-foreground">Área de Intervenção Prioritária</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EEMMMatrix;
