import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Activity } from 'lucide-react';

interface PBATMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingProgress: number;
  predictions: number;
}

export const PBATTracker: React.FC = () => {
  const [metrics, setMetrics] = useState<PBATMetrics>({
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
    trainingProgress: 0,
    predictions: 0
  });

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        accuracy: Math.min(prev.accuracy + Math.random() * 2, 98.5),
        precision: Math.min(prev.precision + Math.random() * 2, 96.8),
        recall: Math.min(prev.recall + Math.random() * 2, 95.2),
        f1Score: Math.min(prev.f1Score + Math.random() * 2, 96.0),
        trainingProgress: Math.min(prev.trainingProgress + 1, 100),
        predictions: prev.predictions + Math.floor(Math.random() * 5)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            PBAT Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Accuracy"
              value={metrics.accuracy.toFixed(2)}
              icon={<TrendingUp className="h-4 w-4" />}
              color="purple"
            />
            <MetricCard
              label="Precision"
              value={metrics.precision.toFixed(2)}
              icon={<Activity className="h-4 w-4" />}
              color="blue"
            />
            <MetricCard
              label="Recall"
              value={metrics.recall.toFixed(2)}
              icon={<Activity className="h-4 w-4" />}
              color="green"
            />
            <MetricCard
              label="F1 Score"
              value={metrics.f1Score.toFixed(2)}
              icon={<TrendingUp className="h-4 w-4" />}
              color="orange"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Training Progress</span>
              <span className="text-gray-600">{metrics.trainingProgress.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.trainingProgress} className="h-2" />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-gray-600">Total Predictions</span>
            <Badge variant="secondary" className="text-lg">
              {metrics.predictions}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, color }) => {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="flex flex-col space-y-2 p-4 bg-white rounded-lg border">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}%</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

export default PBATTracker;
