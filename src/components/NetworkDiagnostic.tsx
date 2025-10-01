import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Users, 
  Database, 
  CheckCircle, 
  XCircle, 
  Info,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePatients } from "@/hooks/usePatients";
import { NetworkDialog } from "./NetworkDialog";

export const NetworkDiagnostic: React.FC = () => {
  const { user } = useAuth();
  const { patients, loading, error, refetch } = usePatients();
  
  const activePatients = patients.filter(p => p.status === 'active');
  const inactivePatients = patients.filter(p => p.status === 'inactive');
  const dischargedPatients = patients.filter(p => p.status === 'discharged');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-blue-900">
              Diagnóstico - Problema com Seleção de Pacientes
            </h2>
            <p className="text-sm text-blue-800">
              Este componente ajuda a identificar problemas na criação de redes.
            </p>
          </div>
        </div>
      </Card>

      {/* User Authentication Status */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5" />
          <h3 className="font-semibold">Status de Autenticação</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Usuário autenticado</span>
                <Badge variant="secondary">{user.email}</Badge>
                <Badge variant="outline">ID: {user.id.slice(0, 8)}...</Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Usuário não autenticado</span>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Patients Loading Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="font-semibold">Status dos Pacientes</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <div className="space-y-4">
          {/* Loading State */}
          {loading && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Carregando pacientes...
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-800">
                <strong>Erro ao carregar pacientes:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success State */}
          {!loading && !error && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Pacientes carregados com sucesso</span>
              </div>

              {/* Patient Counts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{activePatients.length}</div>
                  <div className="text-sm text-green-600">Ativos</div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">{inactivePatients.length}</div>
                  <div className="text-sm text-yellow-600">Inativos</div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">{dischargedPatients.length}</div>
                  <div className="text-sm text-gray-600">Alta Médica</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{patients.length}</div>
                  <div className="text-sm text-blue-600">Total</div>
                </div>
              </div>

              {/* Patient List */}
              {activePatients.length > 0 ? (
                <div>
                  <h4 className="font-medium mb-2">Pacientes Ativos ({activePatients.length})</h4>
                  <div className="space-y-1">
                    {activePatients.map((patient) => (
                      <div key={patient.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-sm font-medium">{patient.full_name}</span>
                        <Badge variant="outline" className="text-xs">
                          ID: {patient.id.slice(0, 8)}...
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Criado: {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Nenhum paciente ativo encontrado.</strong><br/>
                    Você precisa cadastrar pelo menos um paciente com status "ativo" para criar redes.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Network Creation Test */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">Teste de Criação de Rede</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Use o botão abaixo para testar a criação de uma nova rede. 
            Se houver problemas, eles serão identificados:
          </p>

          <div className="flex gap-2">
            <NetworkDialog 
              trigger={
                <Button 
                  className="gap-2"
                  disabled={!user || loading || activePatients.length === 0}
                >
                  <Users className="h-4 w-4" />
                  Testar Criação de Rede
                </Button>
              }
            />
            
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('=== DEBUG INFO ===');
                console.log('User:', user);
                console.log('Patients loading:', loading);
                console.log('Patients error:', error);
                console.log('Total patients:', patients.length);
                console.log('Active patients:', activePatients.length);
                console.log('Patients data:', patients);
                console.log('Active patients data:', activePatients);
                console.log('==================');
              }}
              className="gap-2"
            >
              <Info className="h-4 w-4" />
              Log Debug Info
            </Button>
          </div>

          {/* Status Messages */}
          <div className="space-y-2">
            {!user && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-800">
                  <strong>Problema:</strong> Usuário não autenticado
                </AlertDescription>
              </Alert>
            )}
            
            {user && loading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Status:</strong> Carregando pacientes...
                </AlertDescription>
              </Alert>
            )}
            
            {user && !loading && error && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-800">
                  <strong>Problema:</strong> Erro ao carregar pacientes - {error}
                </AlertDescription>
              </Alert>
            )}
            
            {user && !loading && !error && activePatients.length === 0 && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Problema:</strong> Nenhum paciente ativo - 
                  cadastre um paciente com status "ativo" primeiro
                </AlertDescription>
              </Alert>
            )}
            
            {user && !loading && !error && activePatients.length > 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-800">
                  <strong>Tudo pronto!</strong> Você pode criar redes normalmente.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </Card>

      {/* Troubleshooting Guide */}
      <Card className="p-6 bg-gray-50">
        <h3 className="font-semibold mb-4">Guia de Solução de Problemas</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
              1
            </div>
            <div>
              <strong>Problema:</strong> "Nenhum paciente ativo"<br/>
              <strong>Solução:</strong> Vá para a página de Pacientes e cadastre pelo menos um paciente com status "Ativo"
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
              2
            </div>
            <div>
              <strong>Problema:</strong> "Erro ao carregar pacientes"<br/>
              <strong>Solução:</strong> Verifique sua conexão com a internet e clique em "Atualizar"
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
              3
            </div>
            <div>
              <strong>Problema:</strong> "Usuário não autenticado"<br/>
              <strong>Solução:</strong> Faça logout e login novamente na plataforma
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
              ✓
            </div>
            <div>
              <strong>Dica:</strong> Use o botão "Log Debug Info" para ver informações detalhadas no console do navegador (F12)
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};