-- Safety migration to ensure eemm_processes exists in the correct schema with required columns
-- This migration is idempotent and will not fail if objects already exist

DO $$
BEGIN
  -- Ensure helper function exists
  CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ language 'plpgsql';
EXCEPTION WHEN others THEN
  -- ignore
  NULL;
END$$;

-- Create table if missing
CREATE TABLE IF NOT EXISTS public.eemm_processes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    dimension VARCHAR(50) NOT NULL CHECK (dimension IN ('afeto', 'cognicao', 'atencao', 'self', 'motivacao', 'comportamento')),
    evolutionary_process VARCHAR(50) NOT NULL CHECK (evolutionary_process IN ('variacao', 'selecao', 'retencao')),
    analysis_level VARCHAR(50) NOT NULL DEFAULT 'psicologico' CHECK (analysis_level IN ('biofisiologico', 'sociocultural', 'psicologico')),
    process_name VARCHAR(255) NOT NULL,
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
    evidence TEXT,
    intervention TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    process_context VARCHAR(20) DEFAULT 'matrix' CHECK (process_context IN ('matrix', 'assessment', 'intervention')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure indexes
CREATE INDEX IF NOT EXISTS idx_eemm_processes_therapist_id ON public.eemm_processes(therapist_id);
CREATE INDEX IF NOT EXISTS idx_eemm_processes_patient_id ON public.eemm_processes(patient_id);
CREATE INDEX IF NOT EXISTS idx_eemm_processes_dimension ON public.eemm_processes(dimension);
CREATE INDEX IF NOT EXISTS idx_eemm_processes_evolutionary_process ON public.eemm_processes(evolutionary_process);
CREATE INDEX IF NOT EXISTS idx_eemm_processes_status ON public.eemm_processes(status);
CREATE INDEX IF NOT EXISTS idx_eemm_processes_context ON public.eemm_processes(process_context);

-- Enable RLS and policies
ALTER TABLE public.eemm_processes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Users can view their own eemm processes" ON public.eemm_processes
      FOR SELECT USING (auth.uid() = therapist_id);
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

DO $$
BEGIN
  CREATE POLICY "Users can insert their own eemm processes" ON public.eemm_processes
      FOR INSERT WITH CHECK (auth.uid() = therapist_id);
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

DO $$
BEGIN
  CREATE POLICY "Users can update their own eemm processes" ON public.eemm_processes
      FOR UPDATE USING (auth.uid() = therapist_id);
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

DO $$
BEGIN
  CREATE POLICY "Users can delete their own eemm processes" ON public.eemm_processes
      FOR DELETE USING (auth.uid() = therapist_id);
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- Trigger for updated_at
DO $$
BEGIN
  CREATE TRIGGER update_eemm_processes_updated_at BEFORE UPDATE ON public.eemm_processes
      FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END$$;
