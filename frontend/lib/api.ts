import { AskRequest, AskResponse, HealthResponse } from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export class ApiClientError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

/**
 * Checks the health status of the backend API.
 */
export async function checkApiHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new ApiClientError('Backend service returned an unhealthy status.', res.status);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    throw new ApiClientError(
      'Unable to connect to the AI Study Assistant backend. Make sure the server is running on http://localhost:8000.'
    );
  }
}

/**
 * Submits a question to the FastAPI backend POST /api/ask endpoint.
 */
export async function askQuestion(question: string): Promise<AskResponse> {
  const trimmed = question.trim();
  if (!trimmed) {
    throw new ApiClientError('Please enter a question before asking.');
  }

  const payload: AskRequest = { question: trimmed };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiClientError(
      'Unable to connect to the backend server. Please verify the FastAPI backend is running.'
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new ApiClientError(
      'Failed to parse the response from the server. Please try again.',
      response.status
    );
  }

  if (!response.ok) {
    const message =
      (typeof data?.detail === 'string' && data.detail) ||
      'An error occurred while getting an answer from the AI. Please try again.';
    throw new ApiClientError(message, response.status);
  }

  return data as AskResponse;
}
