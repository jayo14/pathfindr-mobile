import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = await AsyncStorage.getItem('access_token');

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (options.params) {
    Object.keys(options.params).forEach(key => url.searchParams.append(key, options.params![key]));
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle token refresh logic if needed or redirect to login
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (refreshToken && endpoint !== '/auth/login/' && endpoint !== '/auth/refresh/') {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });
        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            await AsyncStorage.setItem('access_token', data.access);
            return apiRequest<T>(endpoint, options);
        }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || 'API Request failed');
  }

  return response.json() as Promise<T>;
}
