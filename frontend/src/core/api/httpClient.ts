import { authService } from '../../modules/auth/api/authService';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type RequestConfig = RequestInit & {
  json?: boolean;
  retry?: boolean;
};

const NGROK_WARNING_HEADER = 'ngrok-skip-browser-warning';

class HttpClient {
  private getHeaders(json?: boolean): HeadersInit {
    const headers: Record<string, string> = {};

    if (json) {
      headers['Content-Type'] = 'application/json';
    }

    if (
      API_BASE_URL.includes('ngrok-free.app') ||
      API_BASE_URL.includes('ngrok-free.dev') ||
      API_BASE_URL.includes('ngrok.io')
    ) {
      headers[NGROK_WARNING_HEADER] = 'true';
    }

    return headers;
  }

  async request(endpoint: string, config: RequestConfig = {}): Promise<Response> {
    const { json, retry = true, ...customConfig } = config;
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = authService.getAccessToken();

    const fetchConfig: RequestInit = {
      ...customConfig,
      headers: {
        ...this.getHeaders(json),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(customConfig.headers ?? {}),
      },
      credentials: 'include',
    };

    const response = await fetch(url, fetchConfig);

    if (response.status === 401 && retry) {
      const isRefreshed = await authService.refreshSession();
      if (isRefreshed) {
        return this.request(endpoint, { ...config, retry: false });
      } else {
        authService.clearSession();
      }
    }

    if (response.status === 401) {
      authService.clearSession();
    }

    return response;
  }

  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    const response = await this.request(endpoint, { ...config, method: 'GET', json: true });
    if (!response.ok) throw new Error(`GET request to ${endpoint} failed`);
    return response.json() as Promise<T>;
  }

  async post<T>(endpoint: string, body: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    const response = await this.request(endpoint, {
      ...config,
      method: 'POST',
      json: true,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `POST request to ${endpoint} failed`);
    }
    return response.json() as Promise<T>;
  }
}

export const httpClient = new HttpClient();
