import { Card } from "@/components/ui/card";
import { Users, Network, Grid3x3, FileText, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const stats = [
    { label: "Pacientes Ativos", value: "0", icon: Users, color: "text-primary" },
    { label: "Redes Criadas", value: "0", icon: Network, color: "text-secondary" },
    { label: "Consultas este Mês", value: "0", icon: Calendar, color: "text-success" },
    { label: "Intervenções Planejadas", value: "0", icon: TrendingUp, color: "text-warning" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu sistema de Terapia Baseada em Processos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-12 w-12 ${stat.color} opacity-80`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Pacientes Recentes</h2>
              <p className="text-sm text-muted-foreground">Últimos pacientes cadastrados</p>
            </div>
          </div>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>Nenhum paciente cadastrado ainda</p>
            <Button className="mt-4" variant="outline">Adicionar Paciente</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Próximas Consultas</h2>
              <p className="text-sm text-muted-foreground">Agenda dos próximos dias</p>
            </div>
          </div>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>Nenhuma consulta agendada</p>
            <Button className="mt-4" variant="outline">Ver Agenda</Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary rounded-xl">
              <Grid3x3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Modelo EEMM</h2>
              <p className="text-muted-foreground max-w-2xl">
                O Extended Evolutionary Meta-Model organiza os processos psicológicos em uma matriz 
                multidimensional, permitindo análise e intervenção precisas baseadas em evidências.
              </p>
            </div>
          </div>
          <Button size="lg" className="shrink-0">
            Explorar Matriz EEMM
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
