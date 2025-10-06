import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { usePatients } from '@/hooks/usePatients';
import { NetworkPhaseManager } from '@/components/NetworkPhaseManager';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Network,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const NetworkAnalysis: React.FC = () => {
  const { patientId, sessionId } = useParams<{ patientId: string; sessionId: string }>();
  const { patients, loading, error } = usePatients();

  if (!patientId || !sessionId) {
    return <Navigate to="/patients" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando informações do paciente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao Carregar Dados</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link to="/patients">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Pacientes
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const patient = patients.find(p => p.id === patientId);

  if (!patient) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Paciente Não Encontrado</h2>
            <p className="text-gray-600 mb-4">O paciente solicitado não foi encontrado ou pode ter sido removido.</p>
            <Button asChild>
              <Link to="/patients">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Pacientes
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/patients/${patientId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            
            <div className="flex items-center gap-2">
              <Network className="h-6 w-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">Análise de Rede</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              Sessão #{sessionId}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{patient.full_name}</h2>
              <p className="text-sm text-gray-600">
                {patient.email} • {patient.status === 'active' ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
          
          <div className="flex-1" />
          
          <div className="text-right text-sm text-gray-500">
            <p>Idade: {patient.birth_date ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear() : 'N/A'} anos</p>
            <p>Telefone: {patient.phone || 'N/A'}</p>
          </div>
        </div>
      </Card>
      
      {/* Network Analysis Information */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Network className="h-5 w-5" />
              2. Análise de Rede
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Criar e conectar processos psicológicos</li>
              <li>• Alternar entre rede da sessão e geral</li>
              <li>• Prevenção de nomes duplicados</li>
              <li>• Sistema simplificado de 3 marcadores</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Network className="h-5 w-5" />
              3. Análise de Mediadores
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Vincular mediadores aos processos existentes</li>
              <li>• NÃO pode adicionar novos processos</li>
              <li>• Define força da relação processo-mediador</li>
              <li>• Usa apenas processos da sessão atual</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Network className="h-5 w-5" />
              4. Análise Funcional
            </h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Escolher apenas o processo para análise</li>
              <li>• Mediadores já estão vinculados</li>
              <li>• NÃO pode alterar vínculos processo-mediador</li>
              <li>• Foco na análise funcional do processo</li>
            </ul>
          </div>
        </div>
      </Card>
      
      {/* Phase Manager */}
      <NetworkPhaseManager 
        patientId={patientId} 
        sessionId={sessionId}
      />
      
      {/* Footer Information */}
      <Card className="p-4 bg-gray-50">
        <div className="text-center text-sm text-gray-600">
          <p>
            <strong>Otimizações Implementadas:</strong> 
            Marcadores simplificados (3 tipos), edição de texto melhorada, confirmação de exclusão, 
            prevenção de nomes duplicados, e fluxo de fases com restrições adequadas.
          </p>
          <p className="mt-2">
            <strong>Fluxo:</strong> Complete a Análise de Rede → Vincule Mediadores → Realize Análise Funcional
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NetworkAnalysis;