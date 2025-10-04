-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table for patient mediators (processes organized by EEMM dimensions and mediators)
CREATE TABLE IF NOT EXISTS public.patient_mediators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  therapist_id UUID NOT NULL,
  dimension TEXT NOT NULL,
  mediator TEXT NOT NULL,
  processes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for functional analysis
CREATE TABLE IF NOT EXISTS public.functional_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  therapist_id UUID NOT NULL,
  process_name TEXT NOT NULL,
  dimension TEXT NOT NULL,
  selection_analysis TEXT,
  variation_analysis TEXT,
  retention_analysis TEXT,
  biofisiologico_selection TEXT,
  biofisiologico_variation TEXT,
  biofisiologico_retention TEXT,
  sociocultural_selection TEXT,
  sociocultural_variation TEXT,
  sociocultural_retention TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_mediators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functional_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_mediators
CREATE POLICY "Therapists can view own patient mediators"
ON public.patient_mediators
FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create patient mediators"
ON public.patient_mediators
FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own patient mediators"
ON public.patient_mediators
FOR UPDATE
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own patient mediators"
ON public.patient_mediators
FOR DELETE
USING (auth.uid() = therapist_id);

-- RLS Policies for functional_analysis
CREATE POLICY "Therapists can view own functional analysis"
ON public.functional_analysis
FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create functional analysis"
ON public.functional_analysis
FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own functional analysis"
ON public.functional_analysis
FOR UPDATE
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own functional analysis"
ON public.functional_analysis
FOR DELETE
USING (auth.uid() = therapist_id);

-- Create indexes for better performance
CREATE INDEX idx_patient_mediators_patient ON public.patient_mediators(patient_id);
CREATE INDEX idx_patient_mediators_therapist ON public.patient_mediators(therapist_id);
CREATE INDEX idx_functional_analysis_patient ON public.functional_analysis(patient_id);
CREATE INDEX idx_functional_analysis_therapist ON public.functional_analysis(therapist_id);

-- Trigger for updated_at
CREATE TRIGGER update_patient_mediators_updated_at
BEFORE UPDATE ON public.patient_mediators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_functional_analysis_updated_at
BEFORE UPDATE ON public.functional_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();