import type { Study, Series, TableState } from '../types/dicom';
import { api } from './api';

// Table-specific API functions
export const tableApi = {
  // Get studies for the table with pagination and sorting
  async getStudiesForTable(params: {
    page: number;
    limit: number;
    sortField?: keyof Study;
    sortDirection?: 'asc' | 'desc';
    filters?: {
      modality?: string;
      patientId?: string;
      studyDescription?: string;
      dateRange?: [string, string];
    };
  }): Promise<{
    studies: Study[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Build query parameters
      const queryParams: Record<string, any> = {
        page: params.page,
        limit: params.limit,
      };

      if (params.sortField) {
        queryParams.sort = params.sortField;
        queryParams.order = params.sortDirection || 'desc';
      }

      // Get studies
      const studies = await api.studies.getStudies(queryParams);

      // Apply filters if provided
      let filteredStudies = studies;
      if (params.filters) {
        filteredStudies = studies.filter(study => {
          if (params.filters?.modality && study.modality !== params.filters.modality) {
            return false;
          }
          if (params.filters?.patientId && !study.patient_id?.includes(params.filters.patientId)) {
            return false;
          }
          if (params.filters?.studyDescription && !study.study_description?.toLowerCase().includes(params.filters.studyDescription.toLowerCase())) {
            return false;
          }
          if (params.filters?.dateRange && study.study_date) {
            const studyDate = study.study_date;
            if (studyDate < params.filters.dateRange[0] || studyDate > params.filters.dateRange[1]) {
              return false;
            }
          }
          return true;
        });
      }

      // For now, we'll return a mock total count
      // In a real implementation, you'd get this from the backend
      const total = filteredStudies.length;

      return {
        studies: filteredStudies,
        total,
        page: params.page,
        limit: params.limit,
      };
    } catch (error) {
      console.error('Failed to fetch studies for table:', error);
      throw error;
    }
  },

  // Get series for a specific study (for expandable rows)
  async getStudySeries(studyId: string): Promise<Series[]> {
    try {
      return await api.series.getStudySeries(studyId);
    } catch (error) {
      console.error(`Failed to fetch series for study ${studyId}:`, error);
      throw error;
    }
  },

  // Get studies by modality (for filtering)
  async getStudiesByModality(modality: string): Promise<Study[]> {
    try {
      return await api.query.getStudiesByModality(modality);
    } catch (error) {
      console.error(`Failed to fetch studies by modality ${modality}:`, error);
      throw error;
    }
  },

  // Get studies by patient ID (for filtering)
  async getStudiesByPatientId(patientId: string): Promise<Study[]> {
    try {
      return await api.query.getStudiesByPatientId(patientId);
    } catch (error) {
      console.error(`Failed to fetch studies by patient ID ${patientId}:`, error);
      throw error;
    }
  },

  // Get studies by date range (for filtering)
  async getStudiesByDateRange(startDate: string, endDate: string): Promise<Study[]> {
    try {
      return await api.query.getStudiesByDateRange(startDate, endDate);
    } catch (error) {
      console.error(`Failed to fetch studies by date range ${startDate}-${endDate}:`, error);
      throw error;
    }
  },
}; 