import React, { useState } from 'react';
import { Brain, Play, Pause, BarChart3, Settings, Upload, Download } from 'lucide-react';

interface ModelTrainingProps {
  onTrainingComplete?: (metrics: any) => void;
}

const ModelTraining: React.FC<ModelTrainingProps> = ({ onTrainingComplete }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [epochs, setEpochs] = useState(10);
  const [batchSize, setBatchSize] = useState(32);
  const [learningRate, setLearningRate] = useState(0.001);
  const [metrics, setMetrics] = useState({
    accuracy: 0,
    loss: 0,
    valAccuracy: 0,
    valLoss: 0
  });

  const handleStartTraining = async () => {
    setIsTraining(true);
    setProgress(0);

    // Simulate training progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          const finalMetrics = {
            accuracy: 0.92 + Math.random() * 0.05,
            loss: 0.15 + Math.random() * 0.1,
            valAccuracy: 0.88 + Math.random() * 0.05,
            valLoss: 0.2 + Math.random() * 0.1
          };
          setMetrics(finalMetrics);
          onTrainingComplete?.(finalMetrics);
          return 100;
        }
        return prev + 1;
      });
    }, 100);
  };

  const handlePauseTraining = () => {
    setIsTraining(false);
  };

  return (
    <div className="model-training-container">
      <div className="training-header">
        <div className="header-title">
          <Brain className="icon" />
          <h2>Model Training</h2>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" title="Upload Dataset">
            <Upload size={18} />
            Upload Data
          </button>
          <button className="btn-secondary" title="Export Model">
            <Download size={18} />
            Export Model
          </button>
        </div>
      </div>

      <div className="training-content">
        {/* Configuration Panel */}
        <div className="config-panel">
          <div className="panel-header">
            <Settings className="icon" />
            <h3>Training Configuration</h3>
          </div>
          
          <div className="config-grid">
            <div className="config-item">
              <label htmlFor="epochs">Epochs</label>
              <input
                id="epochs"
                type="number"
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
                disabled={isTraining}
                min="1"
                max="100"
              />
            </div>

            <div className="config-item">
              <label htmlFor="batchSize">Batch Size</label>
              <input
                id="batchSize"
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                disabled={isTraining}
                min="1"
                max="128"
              />
            </div>

            <div className="config-item">
              <label htmlFor="learningRate">Learning Rate</label>
              <input
                id="learningRate"
                type="number"
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                disabled={isTraining}
                step="0.0001"
                min="0.0001"
                max="1"
              />
            </div>
          </div>
        </div>

        {/* Training Progress */}
        <div className="progress-panel">
          <div className="progress-header">
            <h3>Training Progress</h3>
            <span className="progress-percentage">{progress}%</span>
          </div>
          
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="training-controls">
            {!isTraining ? (
              <button 
                className="btn-primary"
                onClick={handleStartTraining}
                disabled={progress === 100}
              >
                <Play size={18} />
                Start Training
              </button>
            ) : (
              <button 
                className="btn-secondary"
                onClick={handlePauseTraining}
              >
                <Pause size={18} />
                Pause Training
              </button>
            )}
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="metrics-panel">
          <div className="panel-header">
            <BarChart3 className="icon" />
            <h3>Training Metrics</h3>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Accuracy</div>
              <div className="metric-value">
                {(metrics.accuracy * 100).toFixed(2)}%
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Loss</div>
              <div className="metric-value">
                {metrics.loss.toFixed(4)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Val Accuracy</div>
              <div className="metric-value">
                {(metrics.valAccuracy * 100).toFixed(2)}%
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Val Loss</div>
              <div className="metric-value">
                {metrics.valLoss.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      </div>

            <div className="text-2xl font-bold mt-4 mb-2">Treinamento de Modelos ML</div>
            <p className="text-sm text-muted-foreground">
              Esta seção está em desenvolvimento.
            </p>
    </div>
  );
};

export default ModelTraining;
