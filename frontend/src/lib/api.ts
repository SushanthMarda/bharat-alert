const API_BASE = '/api';

interface FetchOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    // Auto-logout on 401 — dispatch a custom event that AuthContext listens to
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || `Request failed with status ${response.status}`);
  }

  return json.data;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getMe: (token: string) =>
    request<{ user_id: number; username: string; role: string }>('/auth/me', { token }),

  // Reports
  getReports: (status?: string) =>
    request<unknown[]>('/reports' + (status ? `?status=${status}` : '')),

  getReport: (id: number) =>
    request<unknown>(`/reports/${id}`),

  createReport: (data: Record<string, unknown>) =>
    request<unknown>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approveReport: (id: number, token: string) =>
    request<unknown>(`/reports/${id}/approve`, { method: 'POST', token }),

  rejectReport: (id: number, token: string) =>
    request<unknown>(`/reports/${id}/reject`, { method: 'POST', token }),

  solveReport: (id: number, token: string) =>
    request<unknown>(`/reports/${id}/solve`, { method: 'POST', token }),

  // Sightings
  getSightings: (report_id?: number) =>
    request<unknown[]>('/sightings' + (report_id ? `?report_id=${report_id}` : '')),

  createSighting: (data: Record<string, unknown>) =>
    request<unknown>('/sightings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Watchers
  registerWatcher: (data: Record<string, unknown>) =>
    request<unknown>('/watchers/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Stats & Map
  getStats: () =>
    request<{ pending: number; approved: number; solved: number; total_sightings: number; total_watchers: number }>('/stats'),

  getMapData: () =>
    request<unknown[]>('/map-data'),

  getHealth: () =>
    request<{ status: string; db: string }>('/health'),
};
