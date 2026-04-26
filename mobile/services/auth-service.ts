import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api-client';

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    profile: {
      full_name: string;
      is_student: boolean;
      has_completed_onboarding: boolean;
    };
  };
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  await AsyncStorage.setItem('access_token', data.access);
  await AsyncStorage.setItem('refresh_token', data.refresh);

  return data;
}

export async function register(username: string, email: string, password: string): Promise<any> {
  return apiRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
}
