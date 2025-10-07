import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, TrendingUp, Activity, Zap } from 'lucide-react';

interface MLInsightsProps {
  data?: any[];
  predictions?: any[];
  metrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
  };
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export const MLInsights: React.FC<MLInsightsProps> = ({ 
  data = [], 
  predictions = [],
  metrics = {}
}) => {
  // Sample data for demonstration
  const performanceData = [
    { name: 'Jan', accuracy: 85, predictions: 120 },
    { name: 'Feb', accuracy: 88, predictions: 145 },
    { name: 'Mar', accuracy: 90, predictions: 160 },
    { name: 'Apr', accuracy: 92, predictions: 180 },
    { name: 'May', accuracy: 94, predictions: 200 },
    { name: 'Jun', accuracy: 95, predictions: 220 },
  ];

  const categoryData = [
    { name: 'Pattern Recognition', value: 35 },
    { name: 'Anomaly Detection', value: 25 },
    { name: 'Prediction', value: 20 },
    { name: 'Classification', value: 15 },
    { name: 'Clustering', value: 5 },
  ];

  const metricCards = [
    { 
      title: 'Accuracy', 
      value: metrics.accuracy || 94.5, 
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      title: 'Precision', 
      value: metrics.precision || 92.3, 
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      title: 'Recall', 
      value: metrics.recall || 89.7, 
      icon: Activity,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    { 
      title: 'F1 Score', 
      value: metrics.f1Score || 91.0, 
      icon: Zap,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">ML Insights</h2>
        <p className="text-gray-400">Real-time analytics and performance metrics</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div 
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-white">{metric.value}%</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Predictions Volume */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Predictions Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="predictions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">ML Task Distribution</h3>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          <ResponsiveContainer width="100%" height={300} className="lg:w-1/2">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-3 lg:w-1/2">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-white">{category.name}</span>
                </div>
                <span className="text-gray-400 font-semibold">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Predictions</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Prediction #{item}</p>
                  <p className="text-gray-400 text-sm">Model: Neural Network v2.0</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-500 font-semibold">96.{item}%</p>
                <p className="text-gray-400 text-sm">{item} min ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MLInsights;
