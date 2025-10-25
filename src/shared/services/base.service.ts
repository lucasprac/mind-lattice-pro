/**
 * Serviço base para operações CRUD
 * Implementa padrões comuns e reutilizáveis para todos os serviços
 */

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { ERROR_MESSAGES } from '@/shared/constants/app.constants';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface ServiceListResponse<T> extends ServiceResponse<T[]> {
  count?: number;
  hasMore?: boolean;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export abstract class BaseService<T extends BaseEntity> {
  protected abstract tableName: keyof Database['public']['Tables'];
  protected abstract userIdField: string;

  /**
   * Busca registros com filtros opcionais
   */
  protected async findMany(
    userId: string,
    filters: Record<string, any> = {},
    options: QueryOptions = {}
  ): Promise<ServiceListResponse<T>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq(this.userIdField, userId);

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      // Aplicar ordenação
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Aplicar paginação
      const page = options.page || 1;
      const limit = options.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error(`Erro ao buscar ${this.tableName}:`, error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: (data as T[]) || [],
        error: null,
        success: true,
        count: count || 0,
        hasMore: count ? (page * limit) < count : false
      };
    } catch (err) {
      console.error(`Erro inesperado ao buscar ${this.tableName}:`, err);
      return {
        data: null,
        error: ERROR_MESSAGES.SERVER_ERROR,
        success: false
      };
    }
  }

  /**
   * Busca um registro por ID
   */
  protected async findById(
    id: string,
    userId: string
  ): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq(this.userIdField, userId)
        .single();

      if (error) {
        console.error(`Erro ao buscar ${this.tableName} por ID:`, error);
        return {
          data: null,
          error: error.code === 'PGRST116' ? ERROR_MESSAGES.NOT_FOUND : error.message,
          success: false
        };
      }

      return {
        data: data as T,
        error: null,
        success: true
      };
    } catch (err) {
      console.error(`Erro inesperado ao buscar ${this.tableName} por ID:`, err);
      return {
        data: null,
        error: ERROR_MESSAGES.SERVER_ERROR,
        success: false
      };
    }
  }

  /**
   * Cria um novo registro
   */
  protected async create(
    data: Omit<T, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<ServiceResponse<T>> {
    try {
      const payload = {
        ...data,
        [this.userIdField]: userId
      };

      const { data: created, error } = await supabase
        .from(this.tableName)
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error(`Erro ao criar ${this.tableName}:`, error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: created as T,
        error: null,
        success: true
      };
    } catch (err) {
      console.error(`Erro inesperado ao criar ${this.tableName}:`, err);
      return {
        data: null,
        error: ERROR_MESSAGES.SERVER_ERROR,
        success: false
      };
    }
  }

  /**
   * Atualiza um registro existente
   */
  protected async update(
    id: string,
    data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>,
    userId: string
  ): Promise<ServiceResponse<T>> {
    try {
      // Remove campos que não devem ser atualizados
      const { id: _, created_at, updated_at, ...safeData } = data as any;

      const { data: updated, error } = await supabase
        .from(this.tableName)
        .update(safeData)
        .eq('id', id)
        .eq(this.userIdField, userId)
        .select()
        .single();

      if (error) {
        console.error(`Erro ao atualizar ${this.tableName}:`, error);
        return {
          data: null,
          error: error.code === 'PGRST116' ? ERROR_MESSAGES.NOT_FOUND : error.message,
          success: false
        };
      }

      return {
        data: updated as T,
        error: null,
        success: true
      };
    } catch (err) {
      console.error(`Erro inesperado ao atualizar ${this.tableName}:`, err);
      return {
        data: null,
        error: ERROR_MESSAGES.SERVER_ERROR,
        success: false
      };
    }
  }

  /**
   * Remove um registro
   */
  protected async delete(
    id: string,
    userId: string
  ): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq(this.userIdField, userId);

      if (error) {
        console.error(`Erro ao deletar ${this.tableName}:`, error);
        return {
          data: null,
          error: error.code === 'PGRST116' ? ERROR_MESSAGES.NOT_FOUND : error.message,
          success: false
        };
      }

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (err) {
      console.error(`Erro inesperado ao deletar ${this.tableName}:`, err);
      return {
        data: null,
        error: ERROR_MESSAGES.SERVER_ERROR,
        success: false
      };
    }
  }

  /**
   * Executa busca com texto livre
   */
  protected async search(
    userId: string,
    query: string,
    searchFields: string[],
    options: QueryOptions = {}
  ): Promise<ServiceListResponse<T>> {
    try {
      let dbQuery = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq(this.userIdField, userId);

      // Aplicar busca textual
      if (query && query.trim()) {
        const searchTerm = `%${query.trim().toLowerCase()}%`;
        const orConditions = searchFields
          .map(field => `${field}.ilike.${searchTerm}`)
          .join(',');
        dbQuery = dbQuery.or(orConditions);
      }

      // Aplicar ordenação
      if (options.orderBy) {
        dbQuery = dbQuery.order(options.orderBy, { ascending: options.order === 'asc' });
      } else {
        dbQuery = dbQuery.order('created_at', { ascending: false });
      }

      // Aplicar paginação
      const page = options.page || 1;
      const limit = options.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      dbQuery = dbQuery.range(from, to);

      const { data, error, count } = await dbQuery;

      if (error) {
        console.error(`Erro na busca de ${this.tableName}:`, error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: (data as T[]) || [],
        error: null,
        success: true,
        count: count || 0,
        hasMore: count ? (page * limit) < count : false
      };
    } catch (err) {
      console.error(`Erro inesperado na busca de ${this.tableName}:`, err);
      return {
        data: null,
        error: ERROR_MESSAGES.SERVER_ERROR,
        success: false
      };
    }
  }
}