-- Create EEMM Processes table with complete structure
-- This migration ensures the table exists and is properly configured

-- Helper function for timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop table if exists to ensure clean creation
DROP TABLE IF EXISTS public.eemm_processes CASCADE;

-- Create eemm_processes table
CREATE TABLE public.eemm_processes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    dimension VARCHAR(50) NOT NULL CHECK (dimension IN ('afeto', 'cognicao', 'atencao', 'self', 'motivacao', 'comportamento')),
    evolutionary_process VARCHAR(50) NOT NULL CHECK (evolutionary_process IN ('variacao', 'selecao', 'retencao')),
    analysis_level VARCHAR(50) NOT NULL DEFAULT 'psicologico' CHECK (analysis_level IN ('biofisiologico', 'sociocultural', 'psicologico')),
    process_name VARCHAR(255) NOT NULL,
    intensity INTEGER DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5),
    evidence TEXT,
    intervention TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    process_context VARCHAR(20) DEFAULT 'matrix' CHECK (process_context IN ('matrix', 'assessment', 'intervention')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for optimal performance
CREATE INDEX idx_eemm_processes_therapist_id ON public.eemm_processes(therapist_id);
CREATE INDEX idx_eemm_processes_patient_id ON public.eemm_processes(patient_id);
CREATE INDEX idx_eemm_processes_dimension ON public.eemm_processes(dimension);
CREATE INDEX idx_eemm_processes_evolutionary_process ON public.eemm_processes(evolutionary_process);
CREATE INDEX idx_eemm_processes_status ON public.eemm_processes(status);
CREATE INDEX idx_eemm_processes_context ON public.eemm_processes(process_context);

-- Enable Row Level Security
ALTER TABLE public.eemm_processes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own eemm processes" ON public.eemm_processes
    FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Users can insert their own eemm processes" ON public.eemm_processes
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Users can update their own eemm processes" ON public.eemm_processes
    FOR UPDATE USING (auth.uid() = therapist_id);

CREATE POLICY "Users can delete their own eemm processes" ON public.eemm_processes
    FOR DELETE USING (auth.uid() = therapist_id);

-- Create trigger for updating updated_at field
CREATE TRIGGER update_eemm_processes_updated_at 
    BEFORE UPDATE ON public.eemm_processes
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Insert some example data to validate table structure
-- This will be cleaned up in production but helps validate the table works
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Try to get a valid user ID for testing
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        INSERT INTO public.eemm_processes (
            therapist_id,
            dimension,
            evolutionary_process,
            analysis_level,
            process_name,
            intensity,
            evidence,
            intervention,
            status,
            process_context
        ) VALUES (
            test_user_id,
            'afeto',
            'variacao',
            'psicologico',
            'Processo de teste para validação',
            3,
            'Evidência de teste',
            'Intervenção de teste',
            'active',
            'matrix'
        ) ON CONFLICT DO NOTHING;
        
        -- Remove the test data immediately
        DELETE FROM public.eemm_processes WHERE process_name = 'Processo de teste para validação';
    END IF;
END $$;

-- Verify table exists and is properly configured
DO $$
BEGIN
    -- This will raise an exception if the table doesn't exist
    PERFORM 1 FROM public.eemm_processes LIMIT 1;
    RAISE NOTICE 'Table eemm_processes created successfully and is accessible';
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create or access eemm_processes table: %', SQLERRM;
END $$;