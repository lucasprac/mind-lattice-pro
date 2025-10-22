-- Migration: fallback to ensure core tables exist (appointments, eemm_processes, roadmap)
-- Description: Idempotent creation for tables and basic columns

BEGIN;

-- appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL,
  patient_id uuid,
  title text NOT NULL,
  description text,
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz NOT NULL,
  status text CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) NOT NULL,
  appointment_type text,
  notes text,
  recurrence_rule text,
  recurrence_group_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- eemm_processes
CREATE TABLE IF NOT EXISTS public.eemm_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL,
  patient_id uuid,
  dimension text CHECK (dimension IN ('afeto','cognicao','atencao','self','motivacao','comportamento')) NOT NULL,
  evolutionary_process text CHECK (evolutionary_process IN ('variacao','selecao','retencao')) NOT NULL,
  analysis_level text CHECK (analysis_level IN ('biofisiologico','sociocultural','psicologico')) NOT NULL DEFAULT 'psicologico',
  process_name text NOT NULL,
  intensity integer DEFAULT 3 CHECK (intensity BETWEEN 1 AND 5),
  evidence text,
  intervention text,
  status text CHECK (status IN ('active','inactive','completed')) DEFAULT 'active',
  process_context text CHECK (process_context IN ('matrix','assessment','intervention')) DEFAULT 'matrix',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- roadmap (corpo mínimo)
CREATE TABLE IF NOT EXISTS public.roadmap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  therapist_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date,
  description text,
  objective text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
