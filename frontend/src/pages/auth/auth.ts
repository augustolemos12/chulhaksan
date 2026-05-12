export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type AuthProfile = {
    sub: string;
    dni: string;
    role: UserRole;
    mustChangePassword?: boolean;
};

const PROFILE_KEY = 'chulhaksan_profile';
const LEGACY_TOKEN_KEY = 'chulhaksan_token';
const ACCESS_TOKEN_KEY = 'chulhaksan_access_token';

export const apiBaseUrl =
    import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const NGROK_HEADER = 'ngrok-skip-browser-warning';

export function getApiHeaders(options?: { json?: boolean }) {
    const headers: Record<string, string> = {};
    if (options?.json) {
        headers['Content-Type'] = 'application/json';
    }
    if (
        apiBaseUrl.includes('ngrok-free.app') ||
        apiBaseUrl.includes('ngrok-free.dev') ||
        apiBaseUrl.includes('ngrok.io')
    ) {
        headers[NGROK_HEADER] = 'true';
    }
    return headers;
}

export function getToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function apiFetch(
    input: string,
    init: (RequestInit & { json?: boolean; retry?: boolean }) = {},
) {
    const { json, retry = true, ...rest } = init;
    const url = input.startsWith('http') ? input : `${apiBaseUrl}${input}`;
    const token = getToken();

    const response = await fetch(url, {
        ...rest,
        headers: {
            ...getApiHeaders({ json }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(rest.headers ?? {}),
        },
        credentials: 'include',
    });

    if (response.status === 401 && retry) {
        const refreshed = await refreshSession();
        if (refreshed) {
            return apiFetch(input, { ...init, retry: false });
        }
    }

    if (response.status === 401) {
        clearAuth();
    }

    return response;
}

export function clearAuth() {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getProfile(): AuthProfile | null {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthProfile;
    } catch {
        return null;
    }
}

export function setProfile(profile: AuthProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function login(dni: string, password: string) {
    const response = await apiFetch('/auth/login', {
        method: 'POST',
        json: true,
        body: JSON.stringify({ dni, password }),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message ?? 'Credenciales inválidas.');
    }

    const data = (await response.json()) as {
        mustChangePassword?: boolean;
        accessToken?: string;
    };
    if (data?.accessToken) {
        setToken(data.accessToken);
    }
    return data;
}

export async function refreshSession() {
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: getApiHeaders({ json: true }),
        credentials: 'include',
    });
    return response.ok;
}

export async function logout() {
    await fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        headers: getApiHeaders({ json: true }),
        credentials: 'include',
    });
    clearAuth();
}

export async function fetchMe() {
    const response = await apiFetch('/auth/me', { method: 'GET' });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message ?? 'No se pudo cargar el perfil.');
    }

    const profile = (await response.json()) as AuthProfile;
    if (!profile?.role) {
        throw new Error('Perfil inválido.');
    }
    setProfile(profile);
    return profile;
}
