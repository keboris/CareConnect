import { API_BASE_URL } from '../config/api';
import { getCookie } from './cookies';

/**
 * Make an authenticated API request
 * Automatically includes the authentication token from cookies if available
 * @param endpoint - The API endpoint to call (e.g., '/users')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns The parsed JSON response
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Get authentication token from cookies
  const token = getCookie('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  
  return response.json();
}

/**
 * API helper object with common HTTP methods
 */
export const api = {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};
