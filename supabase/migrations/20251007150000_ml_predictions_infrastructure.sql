-- Migration: ML Predictions Infrastructure
-- Description: Creates tables and policies for ML predictions and PBAT responses
-- Date: 2025-10-07

-- Create pbat_responses table for daily PBAT data collection
CREATE TABLE IF NOT EXISTS public.pbat_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_date DATE NOT NULL,
  
  -- PBAT Questions (1-5 scale)
  difficulty_concentrating INTEGER CHECK (difficulty_concentrating BETWEEN 1 AND 5),
  difficulty_remembering INTEGER CHECK (difficulty_remembering BETWEEN 1 AND 5),
  difficulty_thinking_clearly INTEGER CHECK (difficulty_thinking_clearly BETWEEN 1 AND 5),
  difficulty_finding_words INTEGER CHECK (difficulty_finding_words BETWEEN 1 AND 5),
  mental_fatigue INTEGER CHECK (mental_fatigue BETWEEN 1 AND 5),
  physical_fatigue INTEGER CHECK (physical_fatigue BETWEEN 1 AND 5),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  mood_state INTEGER CHECK (mood_state BETWEEN 1 AND 5),
  anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 5),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one response per user per day
  UNIQUE(user_id, response_date)
);

-- Create index for faster queries
CREATE INDEX idx_pbat_responses_user_id ON public.pbat_responses(user_id);
CREATE INDEX idx_pbat_responses_date ON public.pbat_responses(response_date);

-- Create ml_models table for model metadata
CREATE TABLE IF NOT EXISTS public.ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(255) NOT NULL UNIQUE,
  model_version VARCHAR(50) NOT NULL,
  model_type VARCHAR(100) NOT NULL, -- e.g., 'random_forest', 'neural_network', 'gradient_boosting'
  target_variable VARCHAR(100) NOT NULL, -- e.g., 'cognitive_decline_risk', 'mood_prediction'
  
  -- Model performance metrics
  accuracy DECIMAL(5,4),
  precision_score DECIMAL(5,4),
  recall_score DECIMAL(5,4),
  f1_score DECIMAL(5,4),
  auc_roc DECIMAL(5,4),
  
  -- Model configuration
  hyperparameters JSONB,
  features_used TEXT[],
  
  -- Model status
  is_active BOOLEAN NOT NULL DEFAULT false,
  training_date TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure unique version per model
  UNIQUE(model_name, model_version)
);

CREATE INDEX idx_ml_models_active ON public.ml_models(is_active) WHERE is_active = true;

-- Create ml_predictions table for storing predictions
CREATE TABLE IF NOT EXISTS public.ml_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES public.ml_models(id) ON DELETE CASCADE,
  
  -- Prediction details
  prediction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prediction_value DECIMAL(5,4) NOT NULL, -- Normalized prediction value (0-1)
  prediction_label VARCHAR(100), -- e.g., 'low_risk', 'medium_risk', 'high_risk'
  confidence_score DECIMAL(5,4), -- Model confidence (0-1)
  
  -- Input features used for this prediction
  input_features JSONB NOT NULL,
  
  -- Additional insights
  risk_factors TEXT[],
  recommendations TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_ml_predictions_user_id ON public.ml_predictions(user_id);
CREATE INDEX idx_ml_predictions_model_id ON public.ml_predictions(model_id);
CREATE INDEX idx_ml_predictions_date ON public.ml_predictions(prediction_date);
CREATE INDEX idx_ml_predictions_user_date ON public.ml_predictions(user_id, prediction_date DESC);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pbat_responses_updated_at
  BEFORE UPDATE ON public.pbat_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ml_models_updated_at
  BEFORE UPDATE ON public.ml_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ml_predictions_updated_at
  BEFORE UPDATE ON public.ml_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.pbat_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pbat_responses
-- Users can only read their own responses
CREATE POLICY "Users can view own PBAT responses"
  ON public.pbat_responses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own responses
CREATE POLICY "Users can insert own PBAT responses"
  ON public.pbat_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own responses
CREATE POLICY "Users can update own PBAT responses"
  ON public.pbat_responses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own responses
CREATE POLICY "Users can delete own PBAT responses"
  ON public.pbat_responses
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ml_models
-- All authenticated users can view active models
CREATE POLICY "Authenticated users can view active models"
  ON public.ml_models
  FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Only service role can manage models (insert/update/delete)
-- This is handled at the service level, not through RLS

-- RLS Policies for ml_predictions
-- Users can only view their own predictions
CREATE POLICY "Users can view own predictions"
  ON public.ml_predictions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert predictions
-- Users should not directly insert predictions

-- Users can delete their own predictions if needed
CREATE POLICY "Users can delete own predictions"
  ON public.ml_predictions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a view for latest predictions per user
CREATE OR REPLACE VIEW public.latest_user_predictions AS
SELECT DISTINCT ON (p.user_id, p.model_id)
  p.id,
  p.user_id,
  p.model_id,
  m.model_name,
  m.target_variable,
  p.prediction_date,
  p.prediction_value,
  p.prediction_label,
  p.confidence_score,
  p.risk_factors,
  p.recommendations
FROM public.ml_predictions p
INNER JOIN public.ml_models m ON p.model_id = m.id
WHERE m.is_active = true
ORDER BY p.user_id, p.model_id, p.prediction_date DESC;

-- Grant access to the view
GRANT SELECT ON public.latest_user_predictions TO authenticated;

-- RLS for the view
ALTER VIEW public.latest_user_predictions SET (security_invoker = true);

-- Create a function to calculate PBAT total score
CREATE OR REPLACE FUNCTION calculate_pbat_score(pbat_row public.pbat_responses)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(pbat_row.difficulty_concentrating, 0) +
         COALESCE(pbat_row.difficulty_remembering, 0) +
         COALESCE(pbat_row.difficulty_thinking_clearly, 0) +
         COALESCE(pbat_row.difficulty_finding_words, 0) +
         COALESCE(pbat_row.mental_fatigue, 0) +
         COALESCE(pbat_row.physical_fatigue, 0) +
         COALESCE(pbat_row.sleep_quality, 0) +
         COALESCE(pbat_row.mood_state, 0) +
         COALESCE(pbat_row.anxiety_level, 0) +
         COALESCE(pbat_row.stress_level, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comments for documentation
COMMENT ON TABLE public.pbat_responses IS 'Stores daily PBAT (Patient-Based Assessment Tool) responses for cognitive and emotional tracking';
COMMENT ON TABLE public.ml_models IS 'Stores metadata and performance metrics for machine learning models';
COMMENT ON TABLE public.ml_predictions IS 'Stores ML predictions generated for users';
COMMENT ON VIEW public.latest_user_predictions IS 'View showing the most recent prediction for each user and model combination';
COMMENT ON FUNCTION calculate_pbat_score IS 'Calculates total PBAT score from individual question responses (range: 0-50)';
