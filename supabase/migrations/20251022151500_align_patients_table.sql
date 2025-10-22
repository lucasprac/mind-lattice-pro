-- Migration: align patients table with application expectations
-- Description: adds missing columns, enables RLS and policies if absent

BEGIN;

-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  therapist_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Columns expected by app/hooks (added if missing)
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS emergency_phone text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('active','inactive','discharged'));

-- Minimal foreign key to profiles if exists (optional, not failing if missing)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- add FK if not present
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='patients' AND constraint_name='patients_therapist_id_fkey'
    ) THEN
      ALTER TABLE public.patients
      ADD CONSTRAINT patients_therapist_id_fkey
      FOREIGN KEY (therapist_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END$$;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_patients_updated_at'
  ) THEN
    CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent creation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND polname='therapists_can_view_own_patients') THEN
    CREATE POLICY "therapists_can_view_own_patients" ON public.patients
    FOR SELECT USING (auth.uid() = therapist_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND polname='therapists_can_insert_patients') THEN
    CREATE POLICY "therapists_can_insert_patients" ON public.patients
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND polname='therapists_can_update_own_patients') THEN
    CREATE POLICY "therapists_can_update_own_patients" ON public.patients
    FOR UPDATE USING (auth.uid() = therapist_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND polname='therapists_can_delete_own_patients') THEN
    CREATE POLICY "therapists_can_delete_own_patients" ON public.patients
    FOR DELETE USING (auth.uid() = therapist_id);
  END IF;
END$$;

COMMIT;
