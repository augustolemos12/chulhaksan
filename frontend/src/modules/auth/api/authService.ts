import { httpClient, API_BASE_URL } from '../../../core/api/httpClient';

export type RoleType = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface UserProfile {
  sub: string;
  dni: string;
  role: RoleType;
  mustChangePassword?: boolean;
}

interface LoginResponse {
  accessToken?: string;
  mustChangePassword?: boolean;
}

const STORAGE_KEYS = {
  USER_PROFILE: 'chulhaksan_profile',
  ACCESS_TOKEN: 'chulhaksan_access_token',
  LEGACY_TOKEN: 'chulhaksan_token',
};

class AuthService {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  clearSession(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  }

  getCurrentProfile(): UserProfile | null {
    const rawData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!rawData) return null;
    try {
      return JSON.parse(rawData) as UserProfile;
    } catch {
      return null;
    }
  }

  setCurrentProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  async refreshSession(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_BASE_URL.includes('ngrok') ? { 'ngrok-skip-browser-warning': 'true' } : {}),
        },
        credentials: 'include',
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  async login(dni: string, password: string): Promise<LoginResponse> {
    const data = await httpClient.post<LoginResponse>('/auth/login', { dni, password });
    if (data?.accessToken) {
      this.setAccessToken(data.accessToken);
    }
    return data;
  }

  async logout(): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(API_BASE_URL.includes('ngrok') ? { 'ngrok-skip-browser-warning': 'true' } : {}),
            },
            credentials: 'include',
        });
    } catch (error) {
        console.error('Logout error', error);
    } finally {
        this.clearSession();
    }
  }

  async fetchUserProfile(): Promise<UserProfile> {
    const response = await httpClient.request('/auth/me', { method: 'GET' });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar perfil de usuario.');
    }
    const profile = await response.json() as UserProfile;
    if (!profile?.role) throw new Error('Perfil de usuario inválido.');
    
    this.setCurrentProfile(profile);
    return profile;
  }
}

export const authService = new AuthService();
