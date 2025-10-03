import React from 'react';
import { OptimizedNetworkCanvas } from './OptimizedNetworkCanvas';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Edit, 
  ArrowLeftRight, 
  Zap,
  Target,
  MousePointer,
  Maximize2,
  Eye,
  Palette
} from 'lucide-react';

const OptimizedNetworkDemo = () => {
  const handleSave = (data: any) => {
    console.log('Optimized network data saved:', data);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 border-purple-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Canvas Otimizado - Mind Lattice Pro
          </h1>
          <p className="text-lg text-gray-600">Todas as Otimizações Implementadas Conforme Solicitado</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Optimization 1: Individual Marker Selection */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-full">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Marcadores Individuais
              </h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <span><strong>Clique na conexão</strong> → Dialog de edição</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <span><strong>Escolha marcador inicial</strong> independente</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <span><strong>Escolha marcador final</strong> independente</span>
              </div>
              
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-800 font-medium">
                  🎯 5 tipos disponíveis: Nenhum, Seta, Círculo, Quadrado, Triângulo
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Exemplos possíveis:</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• Seta → Círculo (direção com ciclo)</div>
                  <div>• Quadrado → Triângulo (estrutura hierarquizada)</div>
                  <div>• Nenhum → Seta (influência unidirecional)</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Optimization 2: Improved Intensity Visualization */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Visualização Inteligente
              </h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span><strong>Badge circular</strong> com fundo contrastante</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span><strong>Posicionamento dinâmico</strong> evita sobreposição</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-purple-500" />
                <span><strong>Ângulos especiais</strong> (90°) otimizados</span>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 font-medium mb-2">
                  🔍 Algoritmos Implementados:
                </p>
                <div className="space-y-1 text-xs text-blue-700">
                  <div>• Detecção de orientação da linha</div>
                  <div>• Offset perpendicular inteligente</div>
                  <div>• Ajuste para linhas verticais/horizontais</div>
                  <div>• Badge com bordas coloridas por tipo</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-2 rounded text-center">
                <span className="text-xs font-medium text-gray-600">
                  Sempre legível, independente do ângulo!
                </span>
              </div>
            </div>
          </div>
          
          {/* Optimization 3: Responsive Process Sizing */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-full">
                <Maximize2 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Layout Responsivo
              </h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-green-500" />
                <span><strong>Tamanho automático</strong> baseado no conteúdo</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-500" />
                <span><strong>Ícones organizados</strong> sem sobreposição</span>
              </div>
              
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-green-500" />
                <span><strong>Padding inteligente</strong> adaptatívo</span>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800 font-medium mb-2">
                  📜 Melhorias de Layout:
                </p>
                <div className="space-y-1 text-xs text-green-700">
                  <div>• Cálculo otimizado de largura/altura</div>
                  <div>• Espaço reservado para botões</div>
                  <div>• Flexbox interno organizado</div>
                  <div>• Redimensionamento automático no texto</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-2 rounded text-center">
                <span className="text-xs font-medium text-gray-600">
                  Tudo encaixa perfeitamente!
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary of all improvements */}
        <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            🏆 Resumo das Otimizações Implementadas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Palette className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Marcadores Flexíveis</h4>
              <Badge variant="secondary" className="text-xs">
                5 tipos × 2 pontas = 25 combinações
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Visualização Clara</h4>
              <Badge variant="secondary" className="text-xs">
                Sempre legível
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Maximize2 className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Layout Otimizado</h4>
              <Badge variant="secondary" className="text-xs">
                Zero overflow
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Experiência UX</h4>
              <Badge variant="secondary" className="text-xs">
                Estilo Miro
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-center">
            🚀 Como Testar as Otimizações
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <h5 className="font-medium text-gray-900 mb-2">🎯 Marcadores Individuais:</h5>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Crie conexão entre processos</li>
                <li>Clique na linha da conexão</li>
                <li>Escolha marcadores diferentes para cada ponta</li>
                <li>Veja resultado instantâneo</li>
              </ol>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h5 className="font-medium text-gray-900 mb-2">🔍 Visualização Melhorada:</h5>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Crie conexões em ângulos diferentes</li>
                <li>Observe badges de intensidade</li>
                <li>Teste linhas verticais/horizontais</li>
                <li>Veja posicionamento inteligente</li>
              </ol>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h5 className="font-medium text-gray-900 mb-2">📝 Layout Responsivo:</h5>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Digite textos de tamanhos variados</li>
                <li>Observe ajuste automático das caixas</li>
                <li>Teste edição inline</li>
                <li>Veja organização dos ícones</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>
      
      {/* The optimized canvas */}
      <OptimizedNetworkCanvas onSave={handleSave} />
    </div>
  );
};

export default OptimizedNetworkDemo;