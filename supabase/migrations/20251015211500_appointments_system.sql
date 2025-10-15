-- Criar tabela de consultas
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    appointment_type VARCHAR(50) DEFAULT 'consultation',
    notes TEXT,
    recurrence_rule TEXT, -- Para armazenar regras de recorrência
    recurrence_group_id UUID, -- Para agrupar consultas recorrentes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_appointments_therapist_id ON appointments(therapist_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_start_datetime ON appointments(start_datetime);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_recurrence_group ON appointments(recurrence_group_id);

-- Criar tabela para processos EEMM
CREATE TABLE IF NOT EXISTS eemm_processes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    dimension VARCHAR(50) NOT NULL CHECK (dimension IN ('afeto', 'cognicao', 'atencao', 'self', 'motivacao', 'comportamento')),
    evolutionary_process VARCHAR(50) NOT NULL CHECK (evolutionary_process IN ('variacao', 'selecao', 'retencao')),
    analysis_level VARCHAR(50) NOT NULL DEFAULT 'psicologico' CHECK (analysis_level IN ('biofisiologico', 'sociocultural', 'psicologico')),
    process_name VARCHAR(255) NOT NULL,
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
    evidence TEXT,
    intervention TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para processos EEMM
CREATE INDEX idx_eemm_processes_therapist_id ON eemm_processes(therapist_id);
CREATE INDEX idx_eemm_processes_patient_id ON eemm_processes(patient_id);
CREATE INDEX idx_eemm_processes_dimension ON eemm_processes(dimension);
CREATE INDEX idx_eemm_processes_evolutionary_process ON eemm_processes(evolutionary_process);
CREATE INDEX idx_eemm_processes_status ON eemm_processes(status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE eemm_processes ENABLE ROW LEVEL SECURITY;

-- Policies para appointments
CREATE POLICY "Users can view their own appointments" ON appointments
    FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Users can insert their own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Users can update their own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = therapist_id);

CREATE POLICY "Users can delete their own appointments" ON appointments
    FOR DELETE USING (auth.uid() = therapist_id);

-- Policies para eemm_processes
CREATE POLICY "Users can view their own eemm processes" ON eemm_processes
    FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Users can insert their own eemm processes" ON eemm_processes
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Users can update their own eemm processes" ON eemm_processes
    FOR UPDATE USING (auth.uid() = therapist_id);

CREATE POLICY "Users can delete their own eemm processes" ON eemm_processes
    FOR DELETE USING (auth.uid() = therapist_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_eemm_processes_updated_at BEFORE UPDATE ON eemm_processes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();