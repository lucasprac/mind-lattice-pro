import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Play, MousePointer, ArrowRight, CornerDownRight, Minus } from "lucide-react";
import { EnhancedNetworkCanvas } from "./EnhancedNetworkCanvas";

// Demo data simulating a typical therapeutic process network
const DEMO_NETWORK_DATA = {
  nodes: [
    {
      id: "node-1",
      x: 150,
      y: 100,
      width: 220,
      height: 80,
      text: "Não devo ser egoísta",
      dimension: "cognition" as const,
      level: "psychology" as const,
      intensity: 4,
      frequency: 5
    },
    {
      id: "node-2",
      x: 450,
      y: 80,
      width: 180,
      height: 70,
      text: "Sente-se rejeitada",
      dimension: "emotion" as const,
      level: "psychology" as const,
      intensity: 4,
      frequency: 4
    },
    {
      id: "node-3",
      x: 100,
      y: 280,
      width: 250,
      height: 90,
      text: "Mãe tentou moldá-la como 'boa menina'",
      dimension: "self" as const,
      level: "social" as const,
      intensity: 3,
      frequency: 2
    },
    {
      id: "node-4",
      x: 380,
      y: 250,
      width: 200,
      height: 80,
      text: "Dificuldade de se defender",
      dimension: "behavior" as const,
      level: "psychology" as const,
      intensity: 5,
      frequency: 5
    },
    {
      id: "node-5",
      x: 620,
      y: 220,
      width: 180,
      height: 80,
      text: "Evita conversas difíceis",
      dimension: "behavior" as const,
      level: "psychology" as const,
      intensity: 4,
      frequency: 5
    },
    {
      id: "node-6",
      x: 180,
      y: 450,
      width: 230,
      height: 80,
      text: "Carreira altamente bem-sucedida",
      dimension: "motivation" as const,
      level: "psychology" as const,
      intensity: 5,
      frequency: 3
    },
    {
      id: "node-7",
      x: 450,
      y: 420,
      width: 200,
      height: 80,
      text: "Quero ajudar outras pessoas",
      dimension: "motivation" as const,
      level: "psychology" as const,
      intensity: 4,
      frequency: 4
    },
    {
      id: "node-8",
      x: 680,
      y: 380,
      width: 180,
      height: 80,
      text: "Falta de apoio do marido",
      dimension: "emotion" as const,
      level: "social" as const,
      intensity: 3,
      frequency: 4
    },
    {
      id: "node-9",
      x: 350,
      y: 580,
      width: 250,
      height: 80,
      text: "Recorre a agradar as pessoas",
      dimension: "behavior" as const,
      level: "psychology" as const,
      intensity: 5,
      frequency: 5
    }
  ],
  connections: [
    {
      id: "conn-1",
      from: "node-1",
      to: "node-2",
      type: "maladaptive" as const,
      strength: 3
    },
    {
      id: "conn-2",
      from: "node-3",
      to: "node-1",
      type: "maladaptive" as const,
      strength: 4
    },
    {
      id: "conn-3",
      from: "node-2",
      to: "node-4",
      type: "maladaptive" as const,
      strength: 4
    },
    {
      id: "conn-4",
      from: "node-4",
      to: "node-5",
      type: "maladaptive" as const,
      strength: 5
    },
    {
      id: "conn-5",
      from: "node-6",
      to: "node-7",
      type: "adaptive" as const,
      strength: 4
    },
    {
      id: "conn-6",
      from: "node-7",
      to: "node-9",
      type: "unchanged" as const,
      strength: 3
    },
    {
      id: "conn-7",
      from: "node-8",
      to: "node-5",
      type: "maladaptive" as const,
      strength: 3
    },
    {
      id: "conn-8",
      from: "node-5",
      to: "node-9",
      type: "maladaptive" as const,
      strength: 4
    },
    {
      id: "conn-9",
      from: "node-9",
      to: "node-2",
      type: "maladaptive" as const,
      strength: 3
    }
  ]
};

interface NetworkCanvasDemoProps {
  readOnly?: boolean;
  title?: string;
}

export const NetworkCanvasDemo: React.FC<NetworkCanvasDemoProps> = ({ 
  readOnly = false, 
  title = "Demo - Rede de Processos Psicológicos" 
}) => {
  return (
    <div className="space-y-4">
      {/* Demo Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Play className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">{title}</h3>
            <p className="text-sm text-blue-800 mb-3">
              Demonstração das funcionalidades aprimoradas do editor de redes de processos, 
              baseado em um caso clínico real usando o modelo EEMM.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Redimensionamento de caixas</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-blue-800">3 tipos de conexões especializadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Navegação fluida (pan/zoom)</span>
              </div>
              <div className="flex items-center gap-2">
                <CornerDownRight className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-blue-800">Interface similar ao Miro</span>
              </div>
            </div>
            
            {/* Connection types legend */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-blue-900">Tipos de Conexão (conforme imagem anexa):</h4>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-red-500" />
                  <ArrowRight className="h-3 w-3 text-red-500" />
                  <span className="text-xs font-medium text-red-700">Maladaptativa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 border-t-2 border-dotted border-gray-500" />
                  <ArrowRight className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700">Sem mudança</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-green-500" />
                  <ArrowRight className="h-3 w-3 text-green-500" />
                  <span className="text-xs font-medium text-green-700">Adaptativa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Demo Canvas */}
      <Card className="p-4">
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Exemplo de Rede Clínica</h4>
          <p className="text-sm text-gray-600">
            Caso baseado em ansiedade social e dificuldades de assertividade. 
            {readOnly ? 'Visualização somente leitura.' : 'Modo de edição ativo - você pode modificar os processos.'}
          </p>
        </div>
        
        <EnhancedNetworkCanvas
          networkData={DEMO_NETWORK_DATA}
          readOnly={readOnly}
          onSave={(data) => {
            console.log('Demo network saved:', data);
            // In a real implementation, this would save to database
          }}
        />
      </Card>
      
      {/* Instructions */}
      {!readOnly && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <h4 className="font-medium text-amber-900 mb-2">💡 Como usar o editor aprimorado:</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• <strong>Arrastar:</strong> Clique e arraste as caixas para reposicioná-las</li>
            <li>• <strong>Redimensionar:</strong> Use o handle azul no canto inferior direito de caixas selecionadas</li>
            <li>• <strong>Conectar:</strong> Selecione o tipo de seta e clique nos processos para conectá-los</li>
            <li>• <strong>Navegar:</strong> Clique e arraste no fundo para fazer pan, use zoom in/out</li>
            <li>• <strong>Selecionar:</strong> Clique nas caixas para selecioná-las e acessar ações</li>
            <li>• <strong>Deletar:</strong> Selecione um processo e clique no ícone da lixeira</li>
          </ul>
        </Card>
      )}
    </div>
  );
};