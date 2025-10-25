/**
 * Utilitários comuns da aplicação
 * Funções reutilizáveis para operações frequentes
 */

import { UI_CONFIG } from '@/shared/constants/app.constants';

/**
 * Debounce para otimizar buscas e inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = UI_CONFIG.DEBOUNCE_DELAY
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * Throttle para limitar execuções frequentes
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(null, args);
    }
  };
}

/**
 * Formatação de datas
 */
export const dateUtils = {
  /**
   * Formatar data para exibição (DD/MM/AAAA)
   */
  formatDate: (date: string | Date): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Data inválida';
    return d.toLocaleDateString('pt-BR');
  },

  /**
   * Formatar data e hora para exibição (DD/MM/AAAA HH:mm)
   */
  formatDateTime: (date: string | Date): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Data inválida';
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Formatar apenas hora (HH:mm)
   */
  formatTime: (date: string | Date): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Hora inválida';
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Data relativa (há X dias, ontem, hoje)
   */
  formatRelativeDate: (date: string | Date): string => {
    const d = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `Há ${diffInDays} dias`;
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Há ${weeks} semana${weeks > 1 ? 's' : ''}`;
    }
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `Há ${months} mês${months > 1 ? 'es' : ''}`;
    }
    const years = Math.floor(diffInDays / 365);
    return `Há ${years} ano${years > 1 ? 's' : ''}`;
  },

  /**
   * Verificar se a data é hoje
   */
  isToday: (date: string | Date): boolean => {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  },

  /**
   * Calcular idade a partir da data de nascimento
   */
  calculateAge: (birthDate: string | Date): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Adicionar dias a uma data
   */
  addDays: (date: string | Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * Verificar se uma data está em um intervalo
   */
  isDateInRange: (date: string | Date, startDate: string | Date, endDate: string | Date): boolean => {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return d >= start && d <= end;
  }
};

/**
 * Validação de strings
 */
export const stringUtils = {
  /**
   * Verificar se string está vazia ou apenas espaços
   */
  isEmpty: (str: string | null | undefined): boolean => {
    return !str || str.trim().length === 0;
  },

  /**
   * Capitalizar primeira letra
   */
  capitalize: (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Capitalizar cada palavra
   */
  capitalizeWords: (str: string): string => {
    if (!str) return str;
    return str.split(' ').map(word => stringUtils.capitalize(word)).join(' ');
  },

  /**
   * Truncar string com reticências
   */
  truncate: (str: string, maxLength: number): string => {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  },

  /**
   * Remover acentos
   */
  removeAccents: (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  /**
   * Gerar slug a partir de string
   */
  slugify: (str: string): string => {
    return stringUtils.removeAccents(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Mascarar dados sensíveis
   */
  mask: (str: string, visibleChars: number = 4): string => {
    if (!str || str.length <= visibleChars) return str;
    const visible = str.slice(-visibleChars);
    const masked = '*'.repeat(str.length - visibleChars);
    return masked + visible;
  }
};

/**
 * Utilitários numéricos
 */
export const numberUtils = {
  /**
   * Formatar número com separadores de milhares
   */
  formatNumber: (num: number): string => {
    return num.toLocaleString('pt-BR');
  },

  /**
   * Formatar moeda brasileira
   */
  formatCurrency: (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  },

  /**
   * Formatar porcentagem
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    return (value * 100).toFixed(decimals) + '%';
  },

  /**
   * Verificar se é número válido
   */
  isValidNumber: (value: any): boolean => {
    return !isNaN(value) && isFinite(value);
  },

  /**
   * Limitar número a um intervalo
   */
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  }
};

/**
 * Utilitários para arrays
 */
export const arrayUtils = {
  /**
   * Remover duplicatas de array
   */
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)];
  },

  /**
   * Remover duplicatas por propriedade
   */
  uniqueBy: <T, K extends keyof T>(array: T[], key: K): T[] => {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },

  /**
   * Agrupar array por propriedade
   */
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  /**
   * Embaralhar array
   */
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Dividir array em chunks
   */
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
};

/**
 * Utilitários para objetos
 */
export const objectUtils = {
  /**
   * Verificar se objeto está vazio
   */
  isEmpty: (obj: Record<string, any>): boolean => {
    return Object.keys(obj).length === 0;
  },

  /**
   * Remover propriedades undefined/null
   */
  clean: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const cleaned: Partial<T> = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key as keyof T] = value;
      }
    });
    return cleaned;
  },

  /**
   * Pick propriedades de um objeto
   */
  pick: <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  /**
   * Omit propriedades de um objeto
   */
  omit: <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }
};

/**
 * Utilitários para localStorage
 */
export const storageUtils = {
  /**
   * Salvar no localStorage com JSON
   */
  setItem: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Recuperar do localStorage com parse JSON
   */
  getItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  /**
   * Remover item do localStorage
   */
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Limpar todo localStorage
   */
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Utilitário para gerar IDs únicos
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Utilitário para aguardar tempo
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Utilitário para capturar erros de forma segura
 */
export const safeExecute = async <T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.error('Erro na execução segura:', error);
    return fallback;
  }
};

/**
 * Utilitário para detectar dispositivo móvel
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Utilitário para detectar modo escuro do sistema
 */
export const isDarkMode = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};