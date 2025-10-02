import React from 'react';
import { EnhancedNetworkCanvas } from './EnhancedNetworkCanvas';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Edit, 
  ArrowLeftRight, 
  Zap,
  Target,
  MousePointer
} from 'lucide-react';

const NetworkEditorDemo = () => {
  const handleSave = (data: any) => {
    console.log('Network data saved:', data);
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🥰 Otimizações Implementadas!
          </h1>
          <p className="text-lg text-gray-600">Editor de Redes com Funcionalidades Avançadas</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature 1: Connection Editing */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                1. Edição de Conexões
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-blue-500" />
                <span className="text-sm"><strong>Clique na linha da conexão</strong> para editar</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="text-sm"><strong>Intensidade 0-5</strong> com slider interativo</span>
              </div>
              
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-purple-500" />
                <span className="text-sm"><strong>Ambivalência</strong> - setas bidirecionais</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-red-500" />
                <span className="text-sm"><strong>Exclusão</strong> de conexões inúteis</span>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 font-medium">Números aparecem nas linhas indicando a intensidade!</p>
              </div>
            </div>
          </div>
          
          {/* Feature 2: Text Editing */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-full">
                <Edit className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                2. Edição de Texto
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-green-500" />
                <span className="text-sm"><strong>Botão editar</strong> (ícone lápis) em cada processo</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-green-500" />
                <span className="text-sm"><strong>Clique direto no texto</strong> para editar</span>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-2"><strong>Atalhos de teclado:</strong></p>
                <div className="flex gap-4">
                  <Badge variant="outline" className="text-xs">
                    Enter = Salvar
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Esc = Cancelar
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800 font-medium">Edição inline sem abrir janelas extras!</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* How to Use */}
        <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            🎮 Tutorial Rápido
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Criar Processos</h4>
              <p className="text-sm text-gray-600">
                Preencha formulário → escolha dimensão/nível → "Adicionar Processo"
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Conectar Processos</h4>
              <p className="text-sm text-gray-600">
                Clique ícone link → escolha tipo conexão → clique processo destino
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Editar & Ajustar</h4>
              <p className="text-sm text-gray-600">
                Clique conexão → ajuste intensidade/ambivalência → edite textos
              </p>
            </div>
          </div>
        </div>
        
        {/* New Features Highlight */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">✨</span>
            <h4 className="font-semibold text-gray-900">Novidades desta Atualização:</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ul className="space-y-1 text-gray-700">
              <li>✅ Dialog de edição de conexões</li>
              <li>✅ Slider para intensidade 0-5</li>
              <li>✅ Checkbox para ambivalência</li>
              <li>✅ Indicador visual de intensidade</li>
            </ul>
            <ul className="space-y-1 text-gray-700">
              <li>✅ Edição inline de texto</li>
              <li>✅ Botão editar em cada processo</li>
              <li>✅ Setas bidirecionais</li>
              <li>✅ Validação de texto vazio</li>
            </ul>
          </div>
        </div>
      </Card>
      
      {/* The actual enhanced canvas */}
      <EnhancedNetworkCanvas onSave={handleSave} />
    </div>
  );
};

export default NetworkEditorDemo;