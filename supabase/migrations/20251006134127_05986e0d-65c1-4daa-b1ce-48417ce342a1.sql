-- Add record_id to all analysis tables to link them to specific sessions

-- Add record_id to networks table
ALTER TABLE public.networks ADD COLUMN record_id uuid REFERENCES public.records(id) ON DELETE CASCADE;

-- Add record_id to patient_mediators table
ALTER TABLE public.patient_mediators ADD COLUMN record_id uuid REFERENCES public.records(id) ON DELETE CASCADE;

-- Add record_id to functional_analysis table
ALTER TABLE public.functional_analysis ADD COLUMN record_id uuid REFERENCES public.records(id) ON DELETE CASCADE;

-- Add record_id to patient_assessments table
ALTER TABLE public.patient_assessments ADD COLUMN record_id uuid REFERENCES public.records(id) ON DELETE CASCADE;

-- Add is_general flag to networks to distinguish between session-specific and general networks
ALTER TABLE public.networks ADD COLUMN is_general boolean DEFAULT false;

-- Add created_session_id to track which session a process was created in
-- We'll store this in the network_data jsonb, but add an index for performance
CREATE INDEX IF NOT EXISTS idx_networks_record_id ON public.networks(record_id);
CREATE INDEX IF NOT EXISTS idx_patient_mediators_record_id ON public.patient_mediators(record_id);
CREATE INDEX IF NOT EXISTS idx_functional_analysis_record_id ON public.functional_analysis(record_id);
CREATE INDEX IF NOT EXISTS idx_patient_assessments_record_id ON public.patient_assessments(record_id);