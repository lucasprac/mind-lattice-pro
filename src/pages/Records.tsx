import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

const Records = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Prontuários</h1>
          <p className="text-muted-foreground">
            Documentação clínica integrada com análise de processos
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nova Consulta
        </Button>
      </div>

      <Card className="p-8">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum prontuário registrado</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Inicie documentando consultas com descrições detalhadas e palavras-chave 
            para construir o histórico clínico integrado à rede de processos.
          </p>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Registrar Primeira Consulta
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Records;
