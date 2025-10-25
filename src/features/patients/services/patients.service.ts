/**
 * Serviço especializado para gestão de pacientes
 * Extende o serviço base com funcionalidades específicas
 */

import { BaseService, ServiceResponse, ServiceListResponse, QueryOptions } from '@/shared/services/base.service';
import { Tables } from '@/integrations/supabase/types';
import { PatientCreateInput, PatientUpdateInput, PatientsSearchInput } from '@/shared/schemas/validation.schemas';
import { PATIENT_STATUS, ERROR_MESSAGES } from '@/shared/constants/app.constants';

export type Patient = Tables<'patients'>;

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  discharged: number;
}

export interface PatientsWithStats extends ServiceListResponse<Patient> {
  stats?: PatientStats;
}

class PatientsService extends BaseService<Patient> {
  protected tableName = 'patients' as const;
  protected userIdField = 'therapist_id';

  /**
   * Lista todos os pacientes do terapeuta com filtros opcionais
   */
  async getPatients(
    userId: string,
    filters: Partial<PatientsSearchInput> = {}
  ): Promise<PatientsWithStats> {
    const { query, status, page, limit } = filters;
    const options: QueryOptions = { page, limit };

    let result: ServiceListResponse<Patient>;

    if (query && query.trim()) {
      // Busca textual
      result = await this.search(
        userId,
        query,
        ['full_name', 'email', 'phone', 'notes'],
        options
      );
    } else {
      // Busca com filtros
      const dbFilters: Record<string, any> = {};
      if (status) dbFilters.status = status;
      
      result = await this.findMany(userId, dbFilters, options);
    }

    // Calcular estatísticas se for a primeira página
    let stats: PatientStats | undefined;
    if ((!page || page === 1) && result.success && result.data) {
      stats = await this.calculateStats(userId);
    }

    return {
      ...result,
      stats
    };
  }

  /**
   * Busca um paciente específico
   */
  async getPatient(patientId: string, userId: string): Promise<ServiceResponse<Patient>> {
    return this.findById(patientId, userId);
  }

  /**
   * Cria um novo paciente
   */
  async createPatient(
    patientData: PatientCreateInput,
    userId: string
  ): Promise<ServiceResponse<Patient>> {
    return this.create(patientData, userId);
  }

  /**
   * Atualiza um paciente existente
   */
  async updatePatient(
    patientId: string,
    patientData: PatientUpdateInput,
    userId: string
  ): Promise<ServiceResponse<Patient>> {
    return this.update(patientId, patientData, userId);
  }

  /**
   * Remove um paciente
   */
  async deletePatient(
    patientId: string,
    userId: string
  ): Promise<ServiceResponse<null>> {
    return this.delete(patientId, userId);
  }

  /**
   * Busca pacientes por status
   */
  async getPatientsByStatus(
    userId: string,
    status: keyof typeof PATIENT_STATUS,
    options: QueryOptions = {}
  ): Promise<ServiceListResponse<Patient>> {
    const statusValue = PATIENT_STATUS[status];
    return this.findMany(userId, { status: statusValue }, options);
  }

  /**
   * Calcula estatísticas dos pacientes
   */
  private async calculateStats(userId: string): Promise<PatientStats> {
    try {
      // Buscar todos os pacientes para calcular estatísticas
      const allPatientsResult = await this.findMany(userId, {}, { limit: 1000 });
      
      if (!allPatientsResult.success || !allPatientsResult.data) {
        return {
          total: 0,
          active: 0,
          inactive: 0,
          discharged: 0
        };
      }

      const patients = allPatientsResult.data;
      const stats: PatientStats = {
        total: patients.length,
        active: patients.filter(p => p.status === PATIENT_STATUS.ACTIVE).length,
        inactive: patients.filter(p => p.status === PATIENT_STATUS.INACTIVE).length,
        discharged: patients.filter(p => p.status === PATIENT_STATUS.DISCHARGED).length
      };

      return stats;
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        discharged: 0
      };
    }
  }

  /**
   * Verifica se um paciente existe e pertence ao usuário
   */
  async patientExists(patientId: string, userId: string): Promise<boolean> {
    const result = await this.findById(patientId, userId);
    return result.success && result.data !== null;
  }

  /**
   * Busca pacientes recentes (criados nos últimos N dias)
   */
  async getRecentPatients(
    userId: string,
    days: number = 30,
    limit: number = 5
  ): Promise<ServiceListResponse<Patient>> {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      const { data, error, count } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq(this.userIdField, userId)
        .gte('created_at', dateThreshold.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar pacientes recentes:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: (data as Patient[]) || [],
        error: null,
        success: true,
        count: count || 0,
        hasMore: false
      };
    } catch (err) {
      console.error('Erro inesperado ao buscar pacientes recentes:', err);
      return {
        data: null,
        error: ERROR_MESSAGES.SERVER_ERROR,
        success: false
      };
    }
  }

  /**
   * Altera o status de um paciente
   */
  async changePatientStatus(
    patientId: string,
    newStatus: keyof typeof PATIENT_STATUS,
    userId: string
  ): Promise<ServiceResponse<Patient>> {
    const statusValue = PATIENT_STATUS[newStatus];
    return this.update(patientId, { status: statusValue }, userId);
  }
}

// Exportar instância única (singleton)
export const patientsService = new PatientsService();