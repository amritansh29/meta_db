import type { 
  Study, 
  Series, 
  Instance, 
  QueryRequest, 
  InsertResponse, 
  Collection,
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
  async getStudies(params: { limit?: number; skip?: number; filters?: any; sort?: Record<string, 1 | -1> }) {
    const query: Record<string, any> = {};

    if (params.filters) {
      const { modality, patientId, dateRange, description } = params.filters;
      if (modality) query.modality = modality;
      if (patientId) query.patient_id = { $regex: patientId, $options: 'i' };
      if (dateRange && dateRange[0] && dateRange[1]) {
        query.study_date = { $gte: dateRange[0], $lte: dateRange[1] };
      }
      if (description) query.study_description = { $regex: description, $options: 'i' };
    }

    return apiCall<{ results: Study[]; total: number; sort?: Record<string, 1 | -1> }>('/query', {
      method: 'POST',
      body: JSON.stringify({
        collection: 'studies',
        query,
        limit: params.limit,
        skip: params.skip,
        sort: params.sort || {},
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
  // Get all series with pagination and sorting
  async getAllSeries(params: { limit?: number; skip?: number; filters?: any; sort?: Record<string, 1 | -1> }) {
    const query: Record<string, any> = {};

    if (params.filters) {
      const { seriesNumber, dateRange, description, studyId } = params.filters;
      if (seriesNumber) query.series_number = seriesNumber;
      if (dateRange && dateRange[0] && dateRange[1]) {
        query.series_date = { $gte: dateRange[0], $lte: dateRange[1] };
      }
      if (description) query.series_description = { $regex: description, $options: 'i' };
      if (studyId) query.study_id = studyId;
    }

    return apiCall<{ results: Series[]; total: number; sort?: Record<string, 1 | -1> }>('/query', {
      method: 'POST',
      body: JSON.stringify({
        collection: 'series',
        query,
        limit: params.limit,
        skip: params.skip,
        sort: params.sort || {},
      }),
    });
  },

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
    // Query series where study_id matches the given studyId
    return queryApi.runQuery({
      collection: 'series',
      query: { study_id: studyId }
    });
  },
};

// Instances API
export const instancesApi = {
  // Get all instances with pagination and sorting
  async getAllInstances(params: { limit?: number; skip?: number; filters?: any; sort?: Record<string, 1 | -1> }) {
    const query: Record<string, any> = {};

    if (params.filters) {
      const { instanceNumber, dateRange, sopClass, seriesId } = params.filters;
      if (instanceNumber) query.instance_number = instanceNumber;
      if (dateRange && dateRange[0] && dateRange[1]) {
        query.acquisition_datetime = { $gte: dateRange[0], $lte: dateRange[1] };
      }
      if (sopClass) query.sop_class_uid = { $regex: sopClass, $options: 'i' };
      if (seriesId) query.series_id = seriesId;
    }

    return apiCall<{ results: Instance[]; total: number; sort?: Record<string, 1 | -1> }>('/query', {
      method: 'POST',
      body: JSON.stringify({
        collection: 'instances',
        query,
        limit: params.limit,
        skip: params.skip,
        sort: params.sort || {},
      }),
    });
  },

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

  // Get all collections using query endpoint
  async getCollections(params?: { limit?: number; skip?: number; sort?: Record<string, 1 | -1> }): Promise<{ results: Collection[]; total: number; sort?: Record<string, 1 | -1> }> {
    return apiCall<{ results: Collection[]; total: number; sort?: Record<string, 1 | -1> }>('/query', {
      method: 'POST',
      body: JSON.stringify({
        collection: 'collections',
        query: {},
        limit: params?.limit,
        skip: params?.skip,
        sort: params?.sort || {},
      }),
    });
  },

  // Get studies for a specific collection using query endpoint
  async getCollectionStudies(collectionId: string, params: { limit?: number; skip?: number; filters?: any; sort?: Record<string, 1 | -1> }) {
    const query: Record<string, any> = { collection_ids: collectionId };

    if (params.filters) {
      const { modality, patientId, dateRange, description } = params.filters;
      if (modality) query.modality = modality;
      if (patientId) query.patient_id = { $regex: patientId, $options: 'i' };
      if (dateRange && dateRange[0] && dateRange[1]) {
        query.study_date = { $gte: dateRange[0], $lte: dateRange[1] };
      }
      if (description) query.study_description = { $regex: description, $options: 'i' };
    }

    return apiCall<{ results: Study[]; total: number; sort?: Record<string, 1 | -1> }>('/query', {
      method: 'POST',
      body: JSON.stringify({
        collection: 'studies',
        query,
        limit: params.limit,
        skip: params.skip,
        sort: params.sort || {},
      }),
    });
  },
};

// Query API for custom MongoDB queries
export const queryApi = {
  // Run custom MongoDB queries
  async runQuery<T = any>(queryRequest: QueryRequest): Promise<T[]> {
    const response = await apiCall<{ results: T[]; total: number }>('/query', {
      method: 'POST',
      body: JSON.stringify(queryRequest),
    });
    return response.results;
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