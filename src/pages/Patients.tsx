import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Users, UserCheck, UserX, UserMinus, FileText, Network, Activity, TrendingUp, Eye } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { PatientCard } from "@/components/PatientCard";
import { PatientDialog } from "@/components/PatientDialog";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { patients, loading } = usePatients();
  const navigate = useNavigate();

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === "active").length,
    inactive: patients.filter(p => p.status === "inactive").length,
    discharged: patients.filter(p => p.status === "discharged").length,
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-3">Gestão de Pacientes</h1>
            <p className="text-lg text-muted-foreground">Gerencie os pacientes e seus prontuários</p>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-6 w-16 bg-muted rounded"></div>
                  <div className="h-4 w-20 bg-muted rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-muted rounded"></div>
                  <div className="h-8 w-16 bg-muted rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Gestão de Pacientes
          </h1>
          <p className="text-lg text-muted-foreground">
            Gerencie seus pacientes e acompanhe o progresso terapêutico
          </p>
        </div>
        <PatientDialog trigger={
          <Button size="lg" className="gap-2 shadow-lg">
            <Plus className="h-5 w-5" />
            Novo Paciente
          </Button>
        } />
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-800">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</div>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Total de Pacientes</div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full -translate-y-10 translate-x-10"></div>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-200 dark:border-green-800">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.active}</div>
                <div className="text-sm font-medium text-green-600 dark:text-green-400">Ativos</div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/20 rounded-full -translate-y-10 translate-x-10"></div>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-800">
                <UserX className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{stats.inactive}</div>
                <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Inativos</div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/20 rounded-full -translate-y-10 translate-x-10"></div>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-800">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats.discharged}</div>
                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Alta</div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/20 rounded-full -translate-y-10 translate-x-10"></div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-6 shadow-sm border-0 bg-gradient-to-r from-background to-muted/5">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, telefone ou observações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base border-0 bg-background shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 h-12 border-0 bg-background shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🔍 Todos os Status</SelectItem>
                <SelectItem value="active">✅ Ativos</SelectItem>
                <SelectItem value="inactive">⏸️ Inativos</SelectItem>
                <SelectItem value="discharged">🎓 Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Enhanced Patients Grid */}
        {filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => {
              const statusConfig = {
                active: { color: "bg-green-500", label: "Ativo", icon: "✅" },
                inactive: { color: "bg-orange-500", label: "Inativo", icon: "⏸️" },
                discharged: { color: "bg-purple-500", label: "Alta", icon: "🎓" }
              }[patient.status] || { color: "bg-gray-500", label: "Desconhecido", icon: "❓" };

              return (
                <Card key={patient.id} className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-background to-muted/5">
                  <div className="p-6">
                    {/* Header with status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {patient.full_name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 ${statusConfig.color} rounded-full`}></div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Patient Info */}
                    <div className="space-y-2 mb-6">
                      {patient.email && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          📧 {patient.email}
                        </p>
                      )}
                      {patient.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          📱 {patient.phone}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        📅 Criado em {format(new Date(patient.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button 
                        size="sm"
                        className="flex-1 gap-2 shadow-sm"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        <FileText className="h-4 w-4" />
                        Roadmap
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline" 
                        className="flex-1 gap-2 shadow-sm border-primary/20 hover:bg-primary/5"
                        onClick={() => navigate(`/patients/${patient.id}/session/new/network`)}
                      >
                        <Network className="h-4 w-4" />
                        Rede
                      </Button>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Card>
              );
            })}
          </div>
        ) : searchTerm || statusFilter !== "all" ? (
          // No results state
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
              <Search className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Nenhum paciente encontrado</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
              Não encontramos pacientes que correspondam aos seus critérios de busca.
              Tente ajustar os filtros ou o termo de busca.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              <Filter className="h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        ) : (
          // Empty state
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-8">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Bem-vindo ao Sistema PBT!</h3>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
              Comece criando seu primeiro paciente para gerenciar o acompanhamento terapêutico.
              Você poderá criar prontuários, análises de rede e intervenções.
            </p>
            <PatientDialog trigger={
              <Button size="lg" className="gap-3 shadow-lg text-base px-8 py-3">
                <Plus className="h-5 w-5" />
                Cadastrar Primeiro Paciente
              </Button>
            } />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Patients;