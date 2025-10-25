/**
 * Hook CRUD genérico para eliminar duplicação de código
 * Resolve o problema de hooks similares (usePatients, useNetworks, useRecords)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Interface para serviços CRUD simples
 */
export interface BaseCRUDService<TEntity, TInsert, TUpdate> {
  getAll(): Promise<TEntity[]>;
  getById(id: string): Promise<TEntity | null>;
  create(data: TInsert): Promise<TEntity>;
  update(id: string, data: TUpdate): Promise<TEntity>;
  delete(id: string): Promise<boolean>;
}

/**
 * Configurações do hook CRUD
 */
export interface CRUDHookConfig {
  entityName: string;
  queryKeyBase: string;
  cacheTime?: number;
}

/**
 * Hook CRUD genérico que elimina duplicação entre usePatients, useNetworks, etc.
 */
export function useBaseCRUD<TEntity, TInsert, TUpdate>(
  service: BaseCRUDService<TEntity, TInsert, TUpdate>,
  config: CRUDHookConfig
) {
  const queryClient = useQueryClient();
  const { entityName, queryKeyBase, cacheTime = 5 * 60 * 1000 } = config;

  // === QUERIES ===
  
  // Query principal - listar todas as entidades
  const {
    data: entities = [],
    isLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: [queryKeyBase, 'all'],
    queryFn: () => service.getAll(),
    staleTime: cacheTime,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para erros de autenticação
      if (error && error.status === 401) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Getter por ID (usando cache)
  const getById = (id: string): TEntity | undefined => {
    return entities.find((entity: any) => entity.id === id);
  };

  // === MUTATIONS ===

  // Criar entidade
  const createMutation = useMutation({
    mutationFn: (data: TInsert) => service.create(data),
    onSuccess: (newEntity) => {
      // Atualizar cache
      queryClient.setQueryData([queryKeyBase, 'all'], (old: TEntity[] = []) => [...old, newEntity]);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: [queryKeyBase] });
      
      toast.success(`${entityName} criado com sucesso`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar ${entityName}: ${error.message}`);
      console.error(`Error creating ${entityName}:`, error);
    }
  });

  // Atualizar entidade
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdate }) => service.update(id, data),
    onSuccess: (updatedEntity: any) => {
      // Atualizar cache
      queryClient.setQueryData([queryKeyBase, 'all'], (old: TEntity[] = []) => 
        old.map(entity => (entity as any).id === updatedEntity.id ? updatedEntity : entity)
      );
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: [queryKeyBase] });
      
      toast.success(`${entityName} atualizado com sucesso`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar ${entityName}: ${error.message}`);
      console.error(`Error updating ${entityName}:`, error);
    }
  });

  // Deletar entidade
  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache
      queryClient.setQueryData([queryKeyBase, 'all'], (old: TEntity[] = []) => 
        old.filter(entity => (entity as any).id !== deletedId)
      );
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: [queryKeyBase] });
      
      toast.success(`${entityName} excluído com sucesso`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir ${entityName}: ${error.message}`);
      console.error(`Error deleting ${entityName}:`, error);
    }
  });

  return {
    // Queries
    entities,
    isLoading,
    error: queryError?.message || null,
    refetch,
    
    // Getters
    getById,
    
    // Mutations
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    
    // Estados das operações
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Erros
    createError: createMutation.error?.message || null,
    updateError: updateMutation.error?.message || null,
    deleteError: deleteMutation.error?.message || null
  };
}
