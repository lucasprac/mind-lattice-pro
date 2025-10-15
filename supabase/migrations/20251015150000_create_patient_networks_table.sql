-- Create patient_networks table for process network analysis
CREATE TABLE public.patient_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  record_id UUID REFERENCES public.records(id) ON DELETE CASCADE, -- NULL for general network
  nodes JSONB NOT NULL DEFAULT '[]',
  connections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_networks ENABLE ROW LEVEL SECURITY;

-- Patient Networks policies
CREATE POLICY "Therapists can view own patient networks"
  ON public.patient_networks FOR SELECT
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create patient networks"
  ON public.patient_networks FOR INSERT
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own patient networks"
  ON public.patient_networks FOR UPDATE
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own patient networks"
  ON public.patient_networks FOR DELETE
  USING (auth.uid() = therapist_id);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.patient_networks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance on queries
CREATE INDEX idx_patient_networks_patient_therapist 
  ON public.patient_networks(patient_id, therapist_id);
  
CREATE INDEX idx_patient_networks_record_null 
  ON public.patient_networks(patient_id, therapist_id) 
  WHERE record_id IS NULL;