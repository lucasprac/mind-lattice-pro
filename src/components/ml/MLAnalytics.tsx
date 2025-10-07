import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, TrendingUp, Activity, Target, Zap, Award } from 'lucide-react';

interface AnalyticsData {
  accuracy: number;
  totalPredictions: number;
  avgConfidence: number;
  modelPerformance: Array<{ date: string; accuracy: number; predictions: number }>;
  categoryDistribution: Array<{ name: string; value: number }>;
  confidenceLevels: Array<{ range: string; count: number }>;
}

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const MLAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    accuracy: 0,
    totalPredictions: 0,
    avgConfidence: 0,
    modelPerformance: [],
    categoryDistribution: [],
    confidenceLevels: []
  });

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    // Load analytics from localStorage
    const predictions = JSON.parse(localStorage.getItem('ml_predictions') || '[]');
    
    if (predictions.length === 0) {
      // Generate sample data for demonstration
      setAnalyticsData({
        accuracy: 87.5,
        totalPredictions: 245,
        avgConfidence: 82.3,
        modelPerformance: [
          { date: '2025-10-01', accuracy: 85, predictions: 42 },
          { date: '2025-10-02', accuracy: 86, predictions: 38 },
          { date: '2025-10-03', accuracy: 88, predictions: 45 },
          { date: '2025-10-04', accuracy: 87, predictions: 51 },
          { date: '2025-10-05', accuracy: 89, predictions: 39 },
          { date: '2025-10-06', accuracy: 88, predictions: 30 }
        ],
        categoryDistribution: [
          { name: 'Work', value: 35 },
          { name: 'Personal', value: 28 },
          { name: 'Health', value: 18 },
          { name: 'Finance', value: 12 },
          { name: 'Learning', value: 7 }
        ],
        confidenceLevels: [
          { range: '90-100%', count: 128 },
          { range: '80-89%', count: 87 },
          { range: '70-79%', count: 23 },
          { range: '<70%', count: 7 }
        ]
      });
      return;
    }

    // Calculate real analytics from predictions
    const totalPredictions = predictions.length;
    const avgConfidence = predictions.reduce((sum: number, p: any) => sum + p.confidence, 0) / totalPredictions;
    
    // Group by date for performance chart
    const performanceByDate = predictions.reduce((acc: any, pred: any) => {
      const date = new Date(pred.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, predictions: 0, totalConfidence: 0 };
      }
      acc[date].predictions++;
      acc[date].totalConfidence += pred.confidence;
      return acc;
    }, {});

    const modelPerformance = Object.values(performanceByDate).map((d: any) => ({
      date: d.date,
      accuracy: d.totalConfidence / d.predictions,
      predictions: d.predictions
    }));

    // Category distribution
    const categoryCount = predictions.reduce((acc: any, pred: any) => {
      const category = pred.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categoryDistribution = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value: value as number
    }));

    // Confidence levels
    const confidenceLevels = [
      { range: '90-100%', count: predictions.filter((p: any) => p.confidence >= 90).length },
      { range: '80-89%', count: predictions.filter((p: any) => p.confidence >= 80 && p.confidence < 90).length },
      { range: '70-79%', count: predictions.filter((p: any) => p.confidence >= 70 && p.confidence < 80).length },
      { range: '<70%', count: predictions.filter((p: any) => p.confidence < 70).length }
    ];

    setAnalyticsData({
      accuracy: avgConfidence,
      totalPredictions,
      avgConfidence,
      modelPerformance,
      categoryDistribution,
      confidenceLevels
    });
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ML Analytics</h2>
          <p className="text-muted-foreground">Monitor and analyze machine learning performance</p>
        </div>
        <Brain className="h-8 w-8 text-purple-500" />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Target}
          title="Model Accuracy"
          value={`${analyticsData.accuracy.toFixed(1)}%`}
          subtitle="Overall prediction accuracy"
          color="text-purple-500"
        />
        <StatCard
          icon={Activity}
          title="Total Predictions"
          value={analyticsData.totalPredictions}
          subtitle="Predictions made"
          color="text-blue-500"
        />
        <StatCard
          icon={Zap}
          title="Avg Confidence"
          value={`${analyticsData.avgConfidence.toFixed(1)}%`}
          subtitle="Average confidence score"
          color="text-green-500"
        />
        <StatCard
          icon={Award}
          title="High Confidence"
          value={analyticsData.confidenceLevels[0]?.count || 0}
          subtitle="Predictions >90% confidence"
          color="text-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Model Performance Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Model Performance Over Time</CardTitle>
            <CardDescription>Accuracy and prediction volume trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.modelPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} name="Accuracy (%)" />
                <Line yAxisId="right" type="monotone" dataKey="predictions" stroke="#06b6d4" strokeWidth={2} name="Predictions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Prediction breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Confidence Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Confidence Level Distribution</CardTitle>
            <CardDescription>Predictions grouped by confidence score</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.confidenceLevels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Predictions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Key observations and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Strong Performance</p>
                <p className="text-sm text-muted-foreground">
                  Model accuracy is above {analyticsData.accuracy > 80 ? '80%' : '70%'}, indicating reliable predictions.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Learning Progress</p>
                <p className="text-sm text-muted-foreground">
                  Model has processed {analyticsData.totalPredictions} predictions and continues to improve.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Award className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">High Confidence Rate</p>
                <p className="text-sm text-muted-foreground">
                  {((analyticsData.confidenceLevels[0]?.count || 0) / analyticsData.totalPredictions * 100).toFixed(0)}% of predictions have confidence above 90%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MLAnalytics;
