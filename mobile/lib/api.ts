import { API_URL } from './config';
import { loadTokens, refreshSession } from './session';

export class ApiError extends Error {
  readonly status: number;
  readonly details?: Record<string, string[]>;

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Attach the Bearer access token (default true). */
  auth?: boolean;
  retry?: boolean;
}

interface ErrorPayload {
  message?: string;
  details?: Record<string, string[]>;
}

function describeError(payload: (ErrorPayload & { data?: unknown }) | null): string | null {
  if (!payload) return null;
  const parts: string[] = [];
  if (payload.message) parts.push(payload.message);
  Object.entries(payload.details ?? {}).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages.length) parts.push(`${field}: ${messages.join(', ')}`);
  });
  return parts.length ? parts.join(' — ') : null;
}

/**
 * Thin JSON client for the Academia NG API. Refreshes once on a 401 and retries.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, retry = true } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const tokens = await loadTokens();
    if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(`Cannot reach the API server at ${API_URL}.`, 0);
  }

  if (response.status === 401 && auth && retry && (await refreshSession())) {
    return api<T>(path, { ...options, retry: false });
  }

  const payload = (await response.json().catch(() => null)) as (ErrorPayload & { data?: unknown }) | null;

  if (!response.ok) {
    throw new ApiError(
      describeError(payload) ?? `Request failed (${response.status})`,
      response.status,
      payload?.details
    );
  }

  if (payload && 'data' in payload) return payload.data as T;
  return payload as unknown as T;
}
