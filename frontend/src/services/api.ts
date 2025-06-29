import type { 
  Study, 
  Series, 
  Instance, 
  QueryRequest, 
  InsertResponse, 
  StudiesResponse,
  SeriesResponse,
  InstancesResponse,
  ApiResponse 
} from '../types/dicom';

// API Configuration
const API_BASE_URL = 'http://localhost:8001';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Studies API
export const studiesApi = {
  // Get all studies with pagination and sorting
  async getStudies(params: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<Study[]> {
    // Use the query endpoint since GET /studies doesn't exist
    const query: Record<string, any> = {};
    
    // Add sorting if specified (MongoDB sort syntax)
    if (params.sort) {
      const sortDirection = params.order === 'asc' ? 1 : -1;
      query.$sort = { [params.sort]: sortDirection };
    }
    
    // Add pagination if specified (MongoDB skip/limit syntax)
    if (params.page && params.limit) {
      query.$skip = (params.page - 1) * params.limit;
      query.$limit = params.limit;
    }

    return apiCall<Study[]>('/query', {
      method: 'POST',
      body: JSON.stringify({
        collection: 'studies',
        query: query
      }),
    });
  },

  // Get a specific study by ID
  async getStudy(studyId: string): Promise<Study> {
    return apiCall<Study>(`/studies/${studyId}`);
  },

  // Create a new study
  async createStudy(study: Omit<Study, 'id' | 'created_at' | 'updated_at'>): Promise<InsertResponse> {
    return apiCall<InsertResponse>('/studies', {
      method: 'POST',
      body: JSON.stringify(study),
    });
  },
};

// Series API
export const seriesApi = {
  // Get a specific series by ID
  async getSeries(seriesId: string): Promise<Series> {
    return apiCall<Series>(`/series/${seriesId}`);
  },

  // Create a new series
  async createSeries(series: Omit<Series, 'id' | 'created_at' | 'updated_at'>): Promise<InsertResponse> {
    return apiCall<InsertResponse>('/series', {
      method: 'POST',
      body: JSON.stringify(series),
    });
  },

  // Get series for a specific study (custom endpoint - may need to be added to backend)
  async getStudySeries(studyId: string): Promise<Series[]> {
    // This endpoint might need to be added to your backend
    // For now, we'll use the query endpoint
    return queryApi.runQuery({
      collection: 'series',
      query: { study_id: studyId }
    });
  },
};

// Instances API
export const instancesApi = {
  // Get a specific instance by ID
  async getInstance(instanceId: string): Promise<Instance> {
    return apiCall<Instance>(`/instances/${instanceId}`);
  },

  // Create a new instance
  async createInstance(instance: Omit<Instance, 'id' | 'created_at' | 'updated_at'>): Promise<InsertResponse> {
    return apiCall<InsertResponse>('/instances', {
      method: 'POST',
      body: JSON.stringify(instance),
    });
  },

  // Get instances for a specific series (custom endpoint - may need to be added to backend)
  async getSeriesInstances(seriesId: string): Promise<Instance[]> {
    return queryApi.runQuery({
      collection: 'instances',
      query: { series_id: seriesId }
    });
  },
};

// Collections API
export const collectionsApi = {
  // Get a specific collection by ID
  async getCollection(collectionId: string): Promise<any> {
    return apiCall<any>(`/collections/${collectionId}`);
  },

  // Create a new collection
  async createCollection(collection: any): Promise<InsertResponse> {
    return apiCall<InsertResponse>('/collections', {
      method: 'POST',
      body: JSON.stringify(collection),
    });
  },
};

// Query API for custom MongoDB queries
export const queryApi = {
  // Run custom MongoDB queries
  async runQuery<T = any>(queryRequest: QueryRequest): Promise<T[]> {
    return apiCall<T[]>('/query', {
      method: 'POST',
      body: JSON.stringify(queryRequest),
    });
  },

  // Convenience methods for common queries
  async getStudiesByModality(modality: string): Promise<Study[]> {
    return this.runQuery<Study>({
      collection: 'studies',
      query: { modality: modality }
    });
  },

  async getStudiesByPatientId(patientId: string): Promise<Study[]> {
    return this.runQuery<Study>({
      collection: 'studies',
      query: { patient_id: patientId }
    });
  },

  async getStudiesByDateRange(startDate: string, endDate: string): Promise<Study[]> {
    return this.runQuery<Study>({
      collection: 'studies',
      query: {
        study_date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    });
  },
};

// Main API export
export const api = {
  studies: studiesApi,
  series: seriesApi,
  instances: instancesApi,
  collections: collectionsApi,
  query: queryApi,
};

// Error types for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utility function to check if API is reachable
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/docs`);
    return response.ok;
  } catch {
    return false;
  }
} 