-- Create patient_assessments table for PBAT scale tracking
CREATE TABLE IF NOT EXISTS public.patient_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  therapist_id UUID NOT NULL,
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- PBAT Questions (1-23) - Scale 0-100
  q1 INTEGER CHECK (q1 >= 0 AND q1 <= 100),
  q2 INTEGER CHECK (q2 >= 0 AND q2 <= 100),
  q3 INTEGER CHECK (q3 >= 0 AND q3 <= 100),
  q4 INTEGER CHECK (q4 >= 0 AND q4 <= 100),
  q5 INTEGER CHECK (q5 >= 0 AND q5 <= 100),
  q6 INTEGER CHECK (q6 >= 0 AND q6 <= 100),
  q7 INTEGER CHECK (q7 >= 0 AND q7 <= 100),
  q8 INTEGER CHECK (q8 >= 0 AND q8 <= 100),
  q9 INTEGER CHECK (q9 >= 0 AND q9 <= 100),
  q10 INTEGER CHECK (q10 >= 0 AND q10 <= 100),
  q11 INTEGER CHECK (q11 >= 0 AND q11 <= 100),
  q12 INTEGER CHECK (q12 >= 0 AND q12 <= 100),
  q13 INTEGER CHECK (q13 >= 0 AND q13 <= 100),
  q14 INTEGER CHECK (q14 >= 0 AND q14 <= 100),
  q15 INTEGER CHECK (q15 >= 0 AND q15 <= 100),
  q16 INTEGER CHECK (q16 >= 0 AND q16 <= 100),
  q17 INTEGER CHECK (q17 >= 0 AND q17 <= 100),
  q18 INTEGER CHECK (q18 >= 0 AND q18 <= 100),
  q19 INTEGER CHECK (q19 >= 0 AND q19 <= 100),
  q20 INTEGER CHECK (q20 >= 0 AND q20 <= 100),
  q21 INTEGER CHECK (q21 >= 0 AND q21 <= 100),
  q22 INTEGER CHECK (q22 >= 0 AND q22 <= 100),
  q23 INTEGER CHECK (q23 >= 0 AND q23 <= 100),
  
  -- Outcome measures (24-28) - Scale 0-100
  q24 INTEGER CHECK (q24 >= 0 AND q24 <= 100),
  q25 INTEGER CHECK (q25 >= 0 AND q25 <= 100),
  q26 INTEGER CHECK (q26 >= 0 AND q26 <= 100),
  q27 INTEGER CHECK (q27 >= 0 AND q27 <= 100),
  q28 INTEGER CHECK (q28 >= 0 AND q28 <= 100),
  
  -- Health status (29) - Multiple choice
  q29 TEXT CHECK (q29 IN ('muito_ruim', 'ruim', 'boa', 'muito_boa', 'excelente')),
  
  -- Vitality and satisfaction (30-34) - Scale 0-100
  q30 INTEGER CHECK (q30 >= 0 AND q30 <= 100),
  q31 INTEGER CHECK (q31 >= 0 AND q31 <= 100),
  q32 INTEGER CHECK (q32 >= 0 AND q32 <= 100),
  q33 INTEGER CHECK (q33 >= 0 AND q33 <= 100),
  q34 INTEGER CHECK (q34 >= 0 AND q34 <= 100),
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Therapists can view own assessments"
  ON public.patient_assessments
  FOR SELECT
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create assessments"
  ON public.patient_assessments
  FOR INSERT
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own assessments"
  ON public.patient_assessments
  FOR UPDATE
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own assessments"
  ON public.patient_assessments
  FOR DELETE
  USING (auth.uid() = therapist_id);

-- Trigger for updated_at
CREATE TRIGGER update_patient_assessments_updated_at
  BEFORE UPDATE ON public.patient_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();