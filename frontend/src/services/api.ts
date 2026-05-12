export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface AuthProfile {
  sub: string;
  dni: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

type RequestOptions = RequestInit & {
  json?: boolean;
  retry?: boolean;
};

const STORAGE_KEYS = {
  profile: 'chulhaksan_profile',
  legacyToken: 'chulhaksan_token',
  accessToken: 'chulhaksan_access_token',
};

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

const NGROK_FLAG = 'ngrok-skip-browser-warning';

function isNgrokEnvironment() {
  return (
    API_URL.includes('ngrok-free.app') ||
    API_URL.includes('ngrok-free.dev') ||
    API_URL.includes('ngrok.io')
  );
}

function buildHeaders(json?: boolean) {
  const headers: Record<string, string> = {};

  if (json) {
    headers['Content-Type'] = 'application/json';
  }

  if (isNgrokEnvironment()) {
    headers[NGROK_FLAG] = 'true';
  }

  return headers;
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function saveToken(token: string) {
  localStorage.setItem(STORAGE_KEYS.accessToken, token);
}

export function clearAuth() {
  Object.values(STORAGE_KEYS).forEach((key) =>
    localStorage.removeItem(key),
  );
}

export function getProfile(): AuthProfile | null {
  const storedProfile = localStorage.getItem(STORAGE_KEYS.profile);

  if (!storedProfile) return null;

  try {
    return JSON.parse(storedProfile);
  } catch {
    return null;
  }
}

export function saveProfile(profile: AuthProfile) {
  localStorage.setItem(
    STORAGE_KEYS.profile,
    JSON.stringify(profile),
  );
}

async function request(
  endpoint: string,
  options: RequestOptions = {},
) {
  const { json, retry = true, ...rest } = options;

  const token = getToken();

  const response = await fetch(
    endpoint.startsWith('http')
      ? endpoint
      : `${API_URL}${endpoint}`,
    {
      ...rest,
      headers: {
        ...buildHeaders(json),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(rest.headers || {}),
      },
      credentials: 'include',
    },
  );

  if (response.status === 401 && retry) {
    const refreshed = await refreshSession();

    if (refreshed) {
      return request(endpoint, {
        ...options,
        retry: false,
      });
    }
  }

  if (response.status === 401) {
    clearAuth();
  }

  return response;
}

export async function apiFetch(
  endpoint: string,
  options?: RequestOptions,
) {
  return request(endpoint, options);
}

export async function login(
  dni: string,
  password: string,
) {
  const response = await request('/auth/login', {
    method: 'POST',
    json: true,
    body: JSON.stringify({ dni, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.message || 'Credenciales inválidas.',
    );
  }

  const data = await response.json();

  if (data?.accessToken) {
    saveToken(data.accessToken);
  }

  return data;
}

export async function refreshSession() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: buildHeaders(true),
    credentials: 'include',
  });

  return response.ok;
}

export async function logout() {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: buildHeaders(true),
    credentials: 'include',
  });

  clearAuth();
}

export async function fetchMe() {
  const response = await request('/auth/me');

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.message || 'No se pudo cargar el perfil.',
    );
  }

  const profile: AuthProfile = await response.json();

  if (!profile?.role) {
    throw new Error('Perfil inválido.');
  }

  saveProfile(profile);

  return profile;
}