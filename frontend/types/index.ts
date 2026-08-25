export interface AskRequest {
  question: string;
}

export interface AskResponse {
  answer: string;
  model: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}
