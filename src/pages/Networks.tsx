import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Plus, Info } from "lucide-react";

const Networks = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Redes de Processos</h1>
          <p className="text-muted-foreground">
            Visualize e edite as redes de processos psicológicos dos pacientes
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nova Rede
        </Button>
      </div>

      <Card className="p-6 bg-accent/30 border-accent">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1 text-accent-foreground">Editor de Rede Interativo</h3>
            <p className="text-sm text-accent-foreground/80">
              Use o editor visual estilo Miro para criar e modificar conexões entre processos. 
              Você pode arrastar elementos, conectar caixas de texto e visualizar as relações 
              causais e funcionais entre diferentes dimensões psicológicas.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-6">
            <Network className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhuma rede criada</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Crie sua primeira rede de processos para um paciente. O editor visual 
            permite mapear relações complexas entre processos psicológicos.
          </p>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Criar Primeira Rede
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Networks;
