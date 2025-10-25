-- Migration: fix patients basic fields
-- Description: Ensure the patients table has all the basic fields needed by the app

BEGIN;

-- Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  notes text,
  status text CHECK (status IN ('active', 'inactive', 'discharged')) DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if they don't exist (idempotent)
DO $$
BEGIN
  -- Add email column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'patients' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.patients ADD COLUMN email text;
  END IF;
  
  -- Add phone column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'patients' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.patients ADD COLUMN phone text;
  END IF;
  
  -- Add notes column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'patients' 
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.patients ADD COLUMN notes text;
  END IF;
  
  -- Add status column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'patients' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.patients ADD COLUMN status text CHECK (status IN ('active', 'inactive', 'discharged')) DEFAULT 'active';
  END IF;
END$$;

-- Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'handle_patients_updated_at'
  ) THEN
    CREATE TRIGGER handle_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END$$;

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (idempotent)
DO $$
BEGIN
  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'patients' 
    AND policyname = 'Users can view own patients'
  ) THEN
    CREATE POLICY "Users can view own patients" 
    ON public.patients FOR SELECT 
    USING (auth.uid() = therapist_id);
  END IF;
  
  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'patients' 
    AND policyname = 'Users can insert own patients'
  ) THEN
    CREATE POLICY "Users can insert own patients" 
    ON public.patients FOR INSERT 
    WITH CHECK (auth.uid() = therapist_id);
  END IF;
  
  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'patients' 
    AND policyname = 'Users can update own patients'
  ) THEN
    CREATE POLICY "Users can update own patients" 
    ON public.patients FOR UPDATE 
    USING (auth.uid() = therapist_id);
  END IF;
  
  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'patients' 
    AND policyname = 'Users can delete own patients'
  ) THEN
    CREATE POLICY "Users can delete own patients" 
    ON public.patients FOR DELETE 
    USING (auth.uid() = therapist_id);
  END IF;
END$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS patients_therapist_id_idx ON public.patients(therapist_id);
CREATE INDEX IF NOT EXISTS patients_status_idx ON public.patients(status);
CREATE INDEX IF NOT EXISTS patients_created_at_idx ON public.patients(created_at);

COMMIT;