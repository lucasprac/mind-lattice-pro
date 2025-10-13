import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, Search, Filter, BarChart3, Tag, ArrowLeft } from "lucide-react";
import { RecordDialog } from "@/components/RecordDialog";
import { RecordCard } from "@/components/RecordCard";
import { useRecords, Record } from "@/hooks/useRecords";
import { usePatients } from "@/hooks/usePatients";
import { toast } from "sonner";

const Records = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>(patientId || "all");
  const [selectedKeyword, setSelectedKeyword] = useState<string>("all");
  
  const { patients } = usePatients();
  const { 
    records, 
    loading, 
    error, 
    refetch, 
    deleteRecord, 
    searchRecords, 
    getRecordsByPatient,
    getRecordsByKeyword,
    getAllKeywords,
    getKeywordFrequency,
    getRecordStats 
  } = useRecords(patientId);

  const stats = getRecordStats();
  const allKeywords = getAllKeywords();
  const keywordFrequency = getKeywordFrequency();
  
  // Se temos patientId, buscar informações do paciente
  const currentPatient = patientId ? patients.find(p => p.id === patientId) : null;

  // Atualizar filtro quando patientId mudar
  useEffect(() => {
    if (patientId) {
      setSelectedPatient(patientId);
    }
  }, [patientId]);

  // Filter and search records
  const getFilteredAndSearchedRecords = () => {
    let filtered = records;
    
    // Apply patient filter (se não estivermos já filtrados por patientId)
    if (!patientId && selectedPatient !== "all") {
      filtered = getRecordsByPatient(selectedPatient);
    }
    
    // Apply keyword filter
    if (selectedKeyword !== "all") {
      filtered = filtered.filter(record => 
        record.keywords.includes(selectedKeyword)
      );
    }
    
    // Apply search
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.description.toLowerCase().includes(searchTermLower) ||
        record.observations?.toLowerCase().includes(searchTermLower) ||
        record.keywords.some(keyword => keyword.toLowerCase().includes(searchTermLower)) ||
        record.patient?.full_name.toLowerCase().includes(searchTermLower)
      );
    }
    
    return filtered;
  };

  const filteredRecords = getFilteredAndSearchedRecords();

  const handleEditRecord = (record: Record) => {
    navigate(`/patients/${record.patient_id}/session/${record.id}`);
  };

  const handleViewRecord = (record: Record) => {
    navigate(`/patients/${record.patient_id}/session/${record.id}/roadmap`);
  };

  const handleDeleteRecord = async (record: Record) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      await deleteRecord(record.id);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        {currentPatient && (
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(`/patients/${currentPatient.id}`)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para {currentPatient.full_name}
            </Button>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {currentPatient ? `Prontuário - ${currentPatient.full_name}` : 'Prontuários'}
            </h1>
            <p className="text-muted-foreground">
              Documentação clínica integrada com análise de processos
            </p>
          </div>
        </div>
        
        <Card className="p-6">
          <div className="text-center py-16">
            <p className="text-red-600">Erro ao carregar registros: {error}</p>
            <Button onClick={refetch} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      {currentPatient && (
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(`/patients/${currentPatient.id}`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para {currentPatient.full_name}
          </Button>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {currentPatient ? `Prontuário - ${currentPatient.full_name}` : 'Prontuários'}
          </h1>
          <p className="text-muted-foreground">
            Documentação clínica integrada com análise de processos
          </p>
        </div>
        <RecordDialog 
          onRecordAdded={refetch}
          selectedPatient={currentPatient}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total de Registros</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.uniquePatients}</div>
          <div className="text-sm text-muted-foreground">Pacientes Atendidos</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.totalKeywords}</div>
          <div className="text-sm text-muted-foreground">Palavras-chave Únicas</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.avgKeywordsPerRecord}</div>
          <div className="text-sm text-muted-foreground">Média de Palavras/Registro</div>
        </Card>
      </div>

      {/* Keywords Frequency */}
      {keywordFrequency.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5" />
            <h3 className="font-semibold">Palavras-chave Mais Utilizadas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywordFrequency.slice(0, 15).map(({ keyword, count }) => (
              <Badge 
                key={keyword} 
                variant="secondary" 
                className="gap-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedKeyword(keyword)}
              >
                <Tag className="h-3 w-3" />
                {keyword} ({count})
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, observações, palavras-chave ou paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {!patientId && (
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Pacientes</SelectItem>
                  {patients
                    .filter(p => p.status === 'active')
                    .map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            )}
            <Select value={selectedKeyword} onValueChange={setSelectedKeyword}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Palavras-chave</SelectItem>
                {allKeywords.map((keyword) => (
                  <SelectItem key={keyword} value={keyword}>
                    {keyword}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onEdit={handleEditRecord}
                onDelete={handleDeleteRecord}
                onView={handleViewRecord}
                showPatientName={!patientId}
              />
            ))}
          </div>
        ) : searchTerm || (!patientId && selectedPatient !== "all") || selectedKeyword !== "all" ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Não encontramos registros que correspondam aos seus critérios de busca.
              Tente ajustar os filtros ou o termo de busca.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                if (!patientId) setSelectedPatient("all");
                setSelectedKeyword("all");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {patientId ? `Nenhuma sessão registrada para ${currentPatient?.full_name}` : 'Nenhum prontuário registrado'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {patientId 
                ? 'Inicie criando uma nova sessão para este paciente.'
                : 'Inicie documentando consultas com descrições detalhadas e palavras-chave para construir o histórico clínico integrado à rede de processos.'
              }
            </p>
            {patientId ? (
              <Button size="lg" className="gap-2" onClick={() => navigate(`/patients/${patientId}/session/new`)}>
                <Plus className="h-5 w-5" />
                Nova Sessão
              </Button>
            ) : (
              <RecordDialog 
                onRecordAdded={refetch}
                trigger={
                  <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Registrar Primeira Consulta
                  </Button>
                }
              />
            )}
          </div>
        ) : null}
      </Card>
    </div>
  );
};

export default Records;