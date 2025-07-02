import { useState, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export const useTableSort = (initialSort?: SortConfig) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort || null);

  const handleSort = useCallback((field: string) => {
    setSortConfig(current => {
      if (!current || current.field !== field) {
        // First time sorting this field - sort ascending
        return { field, direction: 'asc' };
      }
      
      if (current.direction === 'asc') {
        // Currently ascending - change to descending
        return { field, direction: 'desc' };
      }
      
      if (current.direction === 'desc') {
        // Currently descending - remove sorting
        return null;
      }
      
      // Fallback - start with ascending
      return { field, direction: 'asc' };
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  const getSortDirection = useCallback((field: string): SortDirection => {
    if (!sortConfig || sortConfig.field !== field) {
      return null;
    }
    return sortConfig.direction;
  }, [sortConfig]);

  const getMongoSort = useCallback((): Record<string, 1 | -1> | undefined => {
    if (!sortConfig) return undefined;
    return { [sortConfig.field]: sortConfig.direction === 'asc' ? 1 : -1 };
  }, [sortConfig]);

  return {
    sortConfig,
    handleSort,
    clearSort,
    getSortDirection,
    getMongoSort,
  };
}; 