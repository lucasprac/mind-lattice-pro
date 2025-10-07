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

      <style jsx>{`
        .model-training-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .training-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-title h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .header-title .icon {
          color: #6366f1;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .training-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .config-panel,
        .progress-panel,
        .metrics-panel {
          background: #f9fafb;
          border-radius: 8px;
          padding: 1.25rem;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
        }

        .panel-header .icon {
          color: #6366f1;
        }

        .config-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .config-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .config-item label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .config-item input {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .config-item input:focus {
          outline: none;
          border-color: #6366f1;
        }

        .config-item input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
        }

        .progress-percentage {
          font-size: 1.25rem;
          font-weight: 700;
          color: #6366f1;
        }

        .progress-bar-container {
          width: 100%;
          height: 12px;
          background-color: #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: width 0.3s ease;
        }

        .training-controls {
          display: flex;
          justify-content: center;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          background: #ffffff;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .metric-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .btn-primary,
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background-color: #6366f1;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #4f46e5;
        }

        .btn-primary:disabled {
          background-color: #d1d5db;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: #ffffff;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background-color: #f9fafb;
        }

        @media (max-width: 768px) {
          .training-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .config-grid,
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ModelTraining;
