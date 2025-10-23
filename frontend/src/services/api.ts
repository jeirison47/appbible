const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Cliente de API con manejo de autenticación JWT
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }

  return data;
}

/**
 * API de autenticación
 */
export const authApi = {
  register: (data: { email: string; password: string; displayName: string }) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => fetchAPI('/auth/me'),
};

/**
 * API de lectura
 */
export const readingApi = {
  getBooks: () => fetchAPI('/reading/books'),

  getBooksWithCompletion: () => fetchAPI('/reading/books/with-completion'),

  getBook: (bookSlug: string) => fetchAPI(`/reading/books/${bookSlug}`),

  getChapter: (bookSlug: string, chapterNumber: number, version: string = 'RV1960') =>
    fetchAPI(`/reading/books/${bookSlug}/${chapterNumber}?version=${version}`),

  getVerseOfTheDay: (version: string = 'RV1960') =>
    fetchAPI(`/reading/verse-of-the-day?version=${version}`),

  searchVerses: (query: string, version: string = 'RV1960', limit: number = 50) =>
    fetchAPI(`/reading/search?q=${encodeURIComponent(query)}&version=${version}&limit=${limit}`),
};

/**
 * API de administración
 */
export const adminApi = {
  getUsers: () => fetchAPI('/admin/users'),

  getAnalytics: () => fetchAPI('/admin/analytics'),

  getRoles: () => fetchAPI('/admin/roles'),

  getPermissions: () => fetchAPI('/admin/permissions'),

  getSystemStats: () => fetchAPI('/admin/system-stats'),

  getUserStats: () => fetchAPI('/admin/user-stats'),

  updateSystemDailyGoal: (goal: number) =>
    fetchAPI('/admin/system-daily-goal', {
      method: 'PUT',
      body: JSON.stringify({ goal }),
    }),

  // Gestión de roles de usuarios
  getUserRoles: (userId: string) => fetchAPI(`/admin/users/${userId}/roles`),

  assignRoleToUser: (userId: string, roleId: string) =>
    fetchAPI(`/admin/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ roleId }),
    }),

  removeRoleFromUser: (userId: string, roleId: string) =>
    fetchAPI(`/admin/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
    }),
};

/**
 * API de progreso y gamificación
 */
export const progressApi = {
  completeChapter: (data: {
    chapterId: string;
    readingTimeSeconds: number;
    version?: 'RV1960' | 'KJV';
    readingMode?: 'PATH' | 'FREE';
  }) =>
    fetchAPI('/progress/complete-chapter', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyProgress: () => fetchAPI('/progress/me'),

  getBookProgress: (bookSlug: string) => fetchAPI(`/progress/book/${bookSlug}`),

  updateDailyGoal: (goal: number) =>
    fetchAPI('/progress/daily-goal', {
      method: 'PUT',
      body: JSON.stringify({ goal }),
    }),

  getDailyGoalStats: () => fetchAPI('/progress/daily-goal/stats'),

  getLeaderboard: () => fetchAPI('/progress/leaderboard'),
};

/**
 * API de configuración de la app
 */
export const configApi = {
  // Obtener todas las configuraciones (público)
  getAllConfig: () => fetchAPI('/config'),

  // Obtener configuración por clave (público)
  getConfigByKey: (key: string) => fetchAPI(`/config/${key}`),

  // Admin: Actualizar una configuración
  updateConfig: (key: string, value: string, type: string = 'string') =>
    fetchAPI(`/admin/config/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, type }),
    }),

  // Admin: Actualizar múltiples configuraciones
  updateMultipleConfig: (configs: Array<{ key: string; value: string; type: string }>) =>
    fetchAPI('/admin/config', {
      method: 'PUT',
      body: JSON.stringify({ configs }),
    }),

  // Admin: Eliminar una configuración
  deleteConfig: (key: string) =>
    fetchAPI(`/admin/config/${key}`, {
      method: 'DELETE',
    }),
};
