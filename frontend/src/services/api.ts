import { useAuthStore } from '../stores/authStore';

let customApiBaseUrl: string | null = null;

export const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://court-advisors-freelance-mobility.trycloudflare.com/api/v1';

export function getApiBaseUrl(): string {
  return customApiBaseUrl || DEFAULT_API_URL;
}

export function setCustomApiUrl(url: string | null): void {
  customApiBaseUrl = url?.trim() ? url.trim() : null;
}

export async function testApiConnection(baseUrl?: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  const base = (baseUrl || getApiBaseUrl()).replace(/\/api\/v1\/?$/, '');
  const url = `${base}/health`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      return { ok: true, status: res.status };
    }
    return { ok: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Connection timed out or refused' };
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers = {}, body, ...rest } = options;
  const url = `${getApiBaseUrl()}${endpoint}`;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const requestHeaders: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const tokens = useAuthStore.getState().tokens;
    if (tokens?.accessToken) {
      requestHeaders['Authorization'] = `Bearer ${tokens.accessToken}`;
    }
  }

  let response = await fetch(url, {
    ...rest,
    body,
    headers: requestHeaders,
  });

  // Handle Token Expiry & Automatic Refresh
  if (response.status === 401 && requiresAuth) {
    const currentTokens = useAuthStore.getState().tokens;
    if (currentTokens?.refreshToken) {
      try {
        const refreshRes = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentTokens.refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          useAuthStore.getState().setTokens(refreshData.tokens);

          // Retry original request with refreshed access token
          requestHeaders['Authorization'] = `Bearer ${refreshData.tokens.accessToken}`;
          response = await fetch(url, {
            ...rest,
            headers: requestHeaders,
          });
        } else {
          useAuthStore.getState().logout();
        }
      } catch (e) {
        useAuthStore.getState().logout();
      }
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    (error as any).code = data.code || 'API_ERROR';
    (error as any).details = data.details || null;
    throw error;
  }

  return data as T;
}

export const authApi = {
  register: (payload: any) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload), requiresAuth: false }),
  login: (payload: any) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload), requiresAuth: false }),
  logout: (refreshToken?: string) =>
    apiRequest('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }), requiresAuth: false }),
  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }), requiresAuth: false }),
  changePassword: (payload: { currentPassword?: string; newPassword?: string }) =>
    apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }),
};

export const usersApi = {
  getMe: () => apiRequest('/users/me'),
  updateMe: (payload: any) => apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMe: () => apiRequest('/users/me', { method: 'DELETE' }),
  exportData: () => apiRequest('/users/export'),
};


export const exercisesApi = {
  list: (params: { search?: string; type?: string; muscleGroup?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.type) query.set('type', params.type);
    if (params.muscleGroup) query.set('muscleGroup', params.muscleGroup);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    return apiRequest(`/exercises?${query.toString()}`, { requiresAuth: false });
  },
  getById: (id: string) => apiRequest(`/exercises/${id}`, { requiresAuth: false }),
};

export const progressionsApi = {
  getTrees: () => apiRequest('/progressions', { requiresAuth: false }),
  evaluate: (skill: string) =>
    apiRequest('/progressions/evaluate', { method: 'POST', body: JSON.stringify({ skill }) }),
};

export const workoutsApi = {
  listRoutines: () => apiRequest('/workouts/routines'),
  getRoutine: (id: string) => apiRequest(`/workouts/routines/${id}`),
  createRoutine: (payload: any) =>
    apiRequest('/workouts/routines', { method: 'POST', body: JSON.stringify(payload) }),
  updateRoutine: (id: string, payload: any) =>
    apiRequest(`/workouts/routines/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteRoutine: (id: string) =>
    apiRequest(`/workouts/routines/${id}`, { method: 'DELETE' }),
  listSessions: () => apiRequest('/workouts'),
  createSession: (payload: any) =>
    apiRequest('/workouts', { method: 'POST', body: JSON.stringify(payload) }),
  listRecords: () => apiRequest('/workouts/records'),
};

export const runsApi = {
  listRuns: () => apiRequest('/runs'),
  createRun: (payload: any) =>
    apiRequest('/runs', { method: 'POST', body: JSON.stringify(payload) }),
};

export const socialApi = {
  getFeed: (params?: { sort?: 'latest' | 'popular' | 'milestones'; type?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    const qs = searchParams.toString();
    return apiRequest(`/social/feed${qs ? `?${qs}` : ''}`);
  },
  createPost: (payload: {
    caption?: string;
    postType?: string;
    mediaUrl?: string;
    mediaType?: string;
    thumbnailUrl?: string;
    xpEarned?: number;
    metadata?: any;
    workoutId?: string;
    runId?: string;
  }) =>
    apiRequest('/social/feed', { method: 'POST', body: JSON.stringify(payload) }),
  getPost: (postId: string) =>
    apiRequest(`/social/posts/${postId}`),
  editPost: (postId: string, payload: { caption: string }) =>
    apiRequest(`/social/posts/${postId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deletePost: (postId: string) =>
    apiRequest(`/social/posts/${postId}`, { method: 'DELETE' }),
  toggleLike: (postId: string) =>
    apiRequest(`/social/posts/${postId}/like`, { method: 'POST' }),
  getComments: (postId: string) =>
    apiRequest(`/social/posts/${postId}/comments`),
  createComment: (postId: string, payload: { text: string }) =>
    apiRequest(`/social/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteComment: (postId: string, commentId: string) =>
    apiRequest(`/social/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),
  reportPost: (postId: string, payload: { reason: string; notes?: string }) =>
    apiRequest(`/social/posts/${postId}/report`, { method: 'POST', body: JSON.stringify(payload) }),
  uploadMedia: (formData: FormData) =>
    apiRequest('/social/upload', { method: 'POST', body: formData }),
  getPublicProfile: (userId: string) =>
    apiRequest(`/social/users/${userId}/public-profile`),
  getLeaderboard: (exerciseName?: string) => {
    const query = exerciseName ? `?exercise=${encodeURIComponent(exerciseName)}` : '';
    return apiRequest(`/social/leaderboard${query}`);
  },
  getStreaksLeaderboard: (params?: { mode?: 'streak' | 'workouts'; league?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.mode) searchParams.append('mode', params.mode);
    if (params?.league) searchParams.append('league', params.league);
    const qs = searchParams.toString();
    return apiRequest(`/social/streaks-leaderboard${qs ? `?${qs}` : ''}`);
  },
  getPersonalRanking: () => apiRequest('/social/personal-ranking'),
};



