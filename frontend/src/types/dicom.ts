// TypeScript interfaces matching the backend Pydantic models

// ObjectId type (MongoDB ObjectId as string)
export type ObjectId = string;

// Researcher interface
export interface Researcher {
  id?: ObjectId;
  researcher_id: string;
  name: string;
  email: string;
  jobs?: ObjectId[];
}

// Case interface
export interface Case {
  case_id: string;
  patient_id: string;
  accession_numbers: string[];
}

// Collection interface
export interface Collection {
  id?: ObjectId;
  name: string;
  description: string;
  cases: Case[];
  created_at?: string;
  updated_at?: string;
}

// Study Series Link interface (shallow series reference in study)
export interface StudySeriesLink {
  series_id: ObjectId;
  series_instance_uid: string;
  series_number?: number;
  series_description?: string;
  modality?: string;
}

// Study interface - matches StudyModel
export interface Study {
  id?: ObjectId;
  study_instance_uid: string;
  accession_number?: string;
  patient_id?: string;
  acquisition_datetime?: string;
  study_date?: string;
  study_description?: string;
  modality?: string;
  metadata: Record<string, any>;
  collection_ids: ObjectId[];
  series?: StudySeriesLink[];
  created_at?: string;
  updated_at?: string;
}

// Series interface - matches SeriesModel
export interface Series {
  id?: ObjectId;
  study_id: ObjectId;
  accession_number?: string;
  
  // Promoted fields for indexing
  series_instance_uid: string;
  series_number?: number;
  series_description?: string;
  body_part_examined?: string;
  series_date?: string;
  series_time?: string;
  manufacturer?: string;
  manufacturer_model_name?: string;
  protocol_name?: string;
  kvp?: number;
  slice_thickness?: number;
  image_position_patient?: number[];
  
  metadata: Record<string, any>;
  
  // Links
  collection_ids: ObjectId[];
  instances: ObjectId[];
  
  // For natural-language later
  _search_text?: string;
  embeddings_id?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// Instance interface - matches InstanceModel
export interface Instance {
  id?: ObjectId;
  series_id: ObjectId;
  metadata: Record<string, any>;
  
  // Promoted fields
  sop_instance_uid: string;
  sop_class_uid?: string;
  instance_number?: number;
  acquisition_datetime?: string;
  image_orientation?: string;
  image_position?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// Query Request interface - matches QueryRequest
export interface QueryRequest {
  collection: "studies" | "series" | "instances";
  query?: Record<string, any>;
}

// API Response interfaces
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface InsertResponse {
  inserted_id: string;
}

export interface StudiesResponse {
  studies: Study[];
  total: number;
  page: number;
  limit: number;
}

export interface SeriesResponse {
  series: Series[];
  total: number;
}

export interface InstancesResponse {
  instances: Instance[];
  total: number;
}

// Table State interface for frontend state management
export interface TableState {
  studies: Study[];
  loading: boolean;
  error: string | null;
  expandedRows: Set<string>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  sorting: {
    field: keyof Study;
    direction: 'asc' | 'desc';
  };
  filters: {
    modality?: string;
    dateRange?: [Date, Date];
    patientId?: string;
    studyDescription?: string;
  };
}
