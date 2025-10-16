-- Criar tabela para processos do roadmap (diferentes dos processos EEMM)
CREATE TABLE IF NOT EXISTS roadmap_processes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    record_id UUID REFERENCES records(id) ON DELETE CASCADE, -- Vinculado a uma sessão específica
    process_type VARCHAR(100) NOT NULL, -- Tipo genérico do processo (ex: "assessment", "intervention", "monitoring")
    category VARCHAR(100), -- Categoria mais específica
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_area TEXT, -- Área alvo da intervenção
    methodology TEXT, -- Metodologia utilizada
    expected_outcomes TEXT, -- Resultados esperados
    actual_outcomes TEXT, -- Resultados obtidos
    notes TEXT,
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5), -- Prioridade 1-5
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'paused', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para processos do roadmap
CREATE INDEX idx_roadmap_processes_therapist_id ON roadmap_processes(therapist_id);
CREATE INDEX idx_roadmap_processes_patient_id ON roadmap_processes(patient_id);
CREATE INDEX idx_roadmap_processes_record_id ON roadmap_processes(record_id);
CREATE INDEX idx_roadmap_processes_type ON roadmap_processes(process_type);
CREATE INDEX idx_roadmap_processes_status ON roadmap_processes(status);
CREATE INDEX idx_roadmap_processes_priority ON roadmap_processes(priority);

-- Habilitar RLS
ALTER TABLE roadmap_processes ENABLE ROW LEVEL SECURITY;

-- Policies para roadmap_processes
CREATE POLICY "Users can view their own roadmap processes" ON roadmap_processes
    FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Users can insert their own roadmap processes" ON roadmap_processes
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Users can update their own roadmap processes" ON roadmap_processes
    FOR UPDATE USING (auth.uid() = therapist_id);

CREATE POLICY "Users can delete their own roadmap processes" ON roadmap_processes
    FOR DELETE USING (auth.uid() = therapist_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_roadmap_processes_updated_at BEFORE UPDATE ON roadmap_processes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Adicionar campo para distinguir processos na tabela eemm_processes (opcional para clareza)
ALTER TABLE eemm_processes ADD COLUMN IF NOT EXISTS process_context VARCHAR(20) DEFAULT 'matrix' CHECK (process_context IN ('matrix', 'assessment', 'intervention'));

-- Criar índice para o novo campo
CREATE INDEX IF NOT EXISTS idx_eemm_processes_context ON eemm_processes(process_context);