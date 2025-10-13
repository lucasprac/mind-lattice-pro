import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { usePatients } from '../usePatients';
import { supabase } from '@/integrations/supabase/client';

// Mock do supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
    })),
  },
}));

// Mock do useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

// Mock do useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('usePatients', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });

  it('should fetch patients successfully', async () => {
    const mockPatientsData = [
      {
        id: '1',
        name: 'Paciente Teste 1',
        email: 'teste1@email.com',
        created_at: '2024-01-01',
        therapist_id: 'test-user-id',
        sessions: [{ count: 2 }],
        latest_session: [{
          id: 'session-1',
          title: 'Última sessão',
          session_date: '2024-01-15',
          created_at: '2024-01-15',
        }],
      },
      {
        id: '2',
        name: 'Paciente Teste 2',
        email: 'teste2@email.com',
        created_at: '2024-01-02',
        therapist_id: 'test-user-id',
        sessions: [{ count: 1 }],
        latest_session: [],
      },
    ];

    // Mock da resposta do Supabase
    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockPatientsData,
        error: null,
      }),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    const { result } = renderHook(() => usePatients(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.patients).toHaveLength(2);
    expect(result.current.patients[0]).toMatchObject({
      id: '1',
      name: 'Paciente Teste 1',
      email: 'teste1@email.com',
      sessionCount: 2,
    });
    expect(result.current.patients[1]).toMatchObject({
      id: '2', 
      name: 'Paciente Teste 2',
      email: 'teste2@email.com',
      sessionCount: 1,
    });
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Erro de rede');
    
    const mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseChain);

    const { result } = renderHook(() => usePatients(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.patients).toEqual([]);
  });

  it('should add patient successfully', async () => {
    const newPatientData = {
      name: 'Novo Paciente',
      email: 'novo@email.com',
    };

    const mockCreatedPatient = {
      id: '3',
      ...newPatientData,
      created_at: '2024-01-03',
      therapist_id: 'test-user-id',
    };

    // Mock para busca inicial (vazia)
    const mockFetchChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    // Mock para criação
    const mockCreateChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockCreatedPatient,
        error: null,
      }),
    };

    (supabase.from as any)
      .mockReturnValueOnce(mockFetchChain) // Primeira chamada (fetch)
      .mockReturnValueOnce(mockCreateChain); // Segunda chamada (create)

    const { result } = renderHook(() => usePatients(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Adicionar paciente
    result.current.addPatient(newPatientData);

    await waitFor(() => {
      expect(result.current.isAddingPatient).toBe(false);
    });

    // Verificar se foi adicionado ao cache
    expect(queryClient.getQueryData(['patients'])).toContainEqual(
      expect.objectContaining({
        id: '3',
        name: 'Novo Paciente',
        email: 'novo@email.com',
      })
    );
  });

  it('should update patient successfully', async () => {
    const initialPatient = {
      id: '1',
      name: 'Paciente Original',
      email: 'original@email.com',
      created_at: '2024-01-01',
      therapist_id: 'test-user-id',
    };

    const updatedData = {
      name: 'Paciente Atualizado',
    };

    // Configurar dados iniciais no cache
    queryClient.setQueryData(['patients'], [initialPatient]);

    const mockUpdateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...initialPatient, ...updatedData },
        error: null,
      }),
    };

    (supabase.from as any).mockReturnValue(mockUpdateChain);

    const { result } = renderHook(() => usePatients(), { wrapper });

    // Atualizar paciente
    result.current.updatePatient({ id: '1', data: updatedData });

    await waitFor(() => {
      expect(result.current.isUpdatingPatient).toBe(false);
    });

    // Verificar se foi atualizado no cache
    const cachedPatients = queryClient.getQueryData(['patients']) as any[];
    expect(cachedPatients[0]).toMatchObject({
      id: '1',
      name: 'Paciente Atualizado',
      email: 'original@email.com',
    });
  });

  it('should delete patient successfully', async () => {
    const initialPatients = [
      {
        id: '1',
        name: 'Paciente 1',
        email: 'paciente1@email.com',
      },
      {
        id: '2',
        name: 'Paciente 2',
        email: 'paciente2@email.com',
      },
    ];

    // Configurar dados iniciais no cache
    queryClient.setQueryData(['patients'], initialPatients);

    const mockDeleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: null,
      }),
    };

    (supabase.from as any).mockReturnValue(mockDeleteChain);

    const { result } = renderHook(() => usePatients(), { wrapper });

    // Deletar paciente
    result.current.deletePatient('1');

    await waitFor(() => {
      expect(result.current.isDeletingPatient).toBe(false);
    });

    // Verificar se foi removido do cache
    const cachedPatients = queryClient.getQueryData(['patients']) as any[];
    expect(cachedPatients).toHaveLength(1);
    expect(cachedPatients[0].id).toBe('2');
  });
});
