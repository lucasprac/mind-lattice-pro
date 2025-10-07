import React, { useState, useEffect } from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PBATData {
  timestamp: string;
  attention: number;
  meditation: number;
  delta: number;
  theta: number;
  lowAlpha: number;
  highAlpha: number;
  lowBeta: number;
  highBeta: number;
  lowGamma: number;
  highGamma: number;
}

interface PBATVisualizationProps {
  data?: PBATData[];
  showTrends?: boolean;
  timeRange?: '1h' | '6h' | '24h' | '7d' | 'all';
}

const PBATVisualization: React.FC<PBATVisualizationProps> = ({
  data = [],
  showTrends = true,
  timeRange = '1h'
}) => {
  const [filteredData, setFilteredData] = useState<PBATData[]>([]);
  const [activeView, setActiveView] = useState<'attention' | 'meditation' | 'waves' | 'all'>('all');

  useEffect(() => {
    // Filter data based on time range
    const now = new Date();
    const filtered = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      const diffMs = now.getTime() - itemDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      switch (timeRange) {
        case '1h': return diffHours <= 1;
        case '6h': return diffHours <= 6;
        case '24h': return diffHours <= 24;
        case '7d': return diffHours <= 168;
        default: return true;
      }
    });
    setFilteredData(filtered);
  }, [data, timeRange]);

  // Prepare chart data
  const labels = filteredData.map(d => 
    new Date(d.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  const attentionMeditationData = {
    labels,
    datasets: [
      {
        label: 'Atenção',
        data: filteredData.map(d => d.attention),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Meditação',
        data: filteredData.map(d => d.meditation),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const brainWavesData = {
    labels,
    datasets: [
      {
        label: 'Delta',
        data: filteredData.map(d => d.delta),
        backgroundColor: 'rgba(239, 68, 68, 0.7)'
      },
      {
        label: 'Theta',
        data: filteredData.map(d => d.theta),
        backgroundColor: 'rgba(251, 146, 60, 0.7)'
      },
      {
        label: 'Alpha Baixo',
        data: filteredData.map(d => d.lowAlpha),
        backgroundColor: 'rgba(34, 197, 94, 0.7)'
      },
      {
        label: 'Alpha Alto',
        data: filteredData.map(d => d.highAlpha),
        backgroundColor: 'rgba(16, 185, 129, 0.7)'
      },
      {
        label: 'Beta Baixo',
        data: filteredData.map(d => d.lowBeta),
        backgroundColor: 'rgba(59, 130, 246, 0.7)'
      },
      {
        label: 'Beta Alto',
        data: filteredData.map(d => d.highBeta),
        backgroundColor: 'rgba(37, 99, 235, 0.7)'
      },
      {
        label: 'Gamma Baixo',
        data: filteredData.map(d => d.lowGamma),
        backgroundColor: 'rgba(147, 51, 234, 0.7)'
      },
      {
        label: 'Gamma Alto',
        data: filteredData.map(d => d.highGamma),
        backgroundColor: 'rgba(126, 34, 206, 0.7)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { size: 12 }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: '#94a3b8',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  // Calculate trends
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return { trend: 0, direction: 'stable' };
    const recent = values.slice(-10);
    const avg1 = recent.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const avg2 = recent.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const trend = ((avg2 - avg1) / avg1) * 100;
    
    return {
      trend: Math.abs(trend).toFixed(1),
      direction: trend > 5 ? 'up' : trend < -5 ? 'down' : 'stable'
    };
  };

  const attentionTrend = calculateTrend(filteredData.map(d => d.attention));
  const meditationTrend = calculateTrend(filteredData.map(d => d.meditation));

  return (
    <div className="w-full space-y-6 p-6 bg-slate-900/50 rounded-xl border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Visualização PBAT</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveView('attention')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'attention'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Atenção
          </button>
          <button
            onClick={() => setActiveView('meditation')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'meditation'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Meditação
          </button>
          <button
            onClick={() => setActiveView('waves')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'waves'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Ondas Cerebrais
          </button>
        </div>
      </div>

      {/* Trends Summary */}
      {showTrends && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tendência de Atenção</span>
              <span className={`flex items-center gap-1 text-sm font-semibold ${
                attentionTrend.direction === 'up' ? 'text-green-400' :
                attentionTrend.direction === 'down' ? 'text-red-400' :
                'text-slate-400'
              }`}>
                {attentionTrend.direction === 'up' ? '↑' : attentionTrend.direction === 'down' ? '↓' : '→'}
                {attentionTrend.trend}%
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {filteredData.length > 0 ? filteredData[filteredData.length - 1].attention : 0}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tendência de Meditação</span>
              <span className={`flex items-center gap-1 text-sm font-semibold ${
                meditationTrend.direction === 'up' ? 'text-green-400' :
                meditationTrend.direction === 'down' ? 'text-red-400' :
                'text-slate-400'
              }`}>
                {meditationTrend.direction === 'up' ? '↑' : meditationTrend.direction === 'down' ? '↓' : '→'}
                {meditationTrend.trend}%
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {filteredData.length > 0 ? filteredData[filteredData.length - 1].meditation : 0}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {(activeView === 'all' || activeView === 'attention' || activeView === 'meditation') && (
        <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Atenção e Meditação</h3>
          <div className="h-80">
            <Line data={attentionMeditationData} options={chartOptions} />
          </div>
        </div>
      )}

      {(activeView === 'all' || activeView === 'waves') && (
        <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Ondas Cerebrais</h3>
          <div className="h-80">
            <Bar data={brainWavesData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* No Data Message */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg">Nenhum dado disponível para o período selecionado</div>
          <div className="text-slate-500 text-sm mt-2">Conecte um dispositivo PBAT para começar a coletar dados</div>
        </div>
      )}
    </div>
  );
};

export default PBATVisualization;
