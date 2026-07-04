// Les tokens JWT sont stockés dans des cookies httpOnly posés par le backend.
// Le frontend ne touche jamais aux tokens — le navigateur les envoie automatiquement.
// Seul l'objet `user` (non-sensible) est gardé en localStorage pour l'UI.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request(endpoint: string, options: RequestInit = {}, retry = true): Promise<any> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // envoie les cookies gc_access / gc_refresh automatiquement
  });

  // Token expiré — tenter un refresh silencieux une fois
  if (response.status === 401 && retry && typeof window !== 'undefined' && !endpoint.startsWith('/auth/')) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // envoie gc_refresh, reçoit de nouveaux cookies
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        // Mettre à jour les données user en localStorage (pas le token — c'est dans le cookie)
        if (refreshData.user && typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(refreshData.user));
        }
        return request(endpoint, options, false);
      }
    } catch {
      // refresh impossible, on laisse passer le 401
    }

    // Session définitivement expirée — nettoyer et rediriger
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      // Appel logout pour que le backend efface les cookies httpOnly
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
      window.location.href = '/auth/login';
    }
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erreur ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: async (credentials: any) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      // Les cookies sont posés par le backend — on stocke seulement l'objet user
      if (data.user && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    },

    register: async (signupData: any) => {
      const roleMap: Record<string, string> = {
        freelancer: 'FREELANCER',
        entrepreneur: 'ENTREPRENEUR',
        user: 'COLLABORATOR',
      };
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          role: roleMap[signupData.role] ?? 'COLLABORATOR',
        }),
      });
      if (data.user && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    },

    logout: async () => {
      // Demande au backend d'effacer les cookies httpOnly (le JS ne peut pas le faire lui-même)
      await request('/auth/logout', { method: 'POST' }).catch(() => {});
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    },

    me: () => request('/auth/me'),

    refresh: () => request('/auth/refresh', { method: 'POST' }),

    forgotPassword: (email: string) =>
      request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

    resetPassword: (token: string, password: string) =>
      request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  },

  users: {
    list: () => request('/users'),
    suggestions: () => request('/users/suggestions'),
    updateProfile: (data: any) =>
      request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  freelancers: {
    list: (params: { skills?: string; minRate?: number; maxRate?: number; availableOnly?: boolean; search?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.skills) query.set('skills', params.skills);
      if (params.minRate) query.set('minRate', String(params.minRate));
      if (params.maxRate) query.set('maxRate', String(params.maxRate));
      if (params.availableOnly) query.set('availableOnly', 'true');
      if (params.search) query.set('search', params.search);
      return request(`/freelancers?${query.toString()}`);
    },
    getProfile: () => request('/freelancers/profile'),
    updateProfile: (data: any) =>
      request('/freelancers/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  entrepreneurs: {
    list: () => request('/entrepreneurs'),
    getProfile: () => request('/entrepreneurs/profile'),
    updateProfile: (data: any) =>
      request('/entrepreneurs/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  projects: {
    list: (params: { search?: string; status?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.set('search', params.search);
      if (params.status) query.set('status', params.status);
      return request(`/projects?${query.toString()}`);
    },
    getOne: (id: string) => request(`/projects/${id}`),
    create: (data: any) =>
      request('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
    apply: (projectId: string, coverLetter?: string) =>
      request(`/projects/${projectId}/apply`, { method: 'POST', body: JSON.stringify({ coverLetter }) }),
    getApplications: (projectId: string) => request(`/projects/${projectId}/applications`),
    updateApplicationStatus: (applicationId: string, status: string) =>
      request(`/projects/applications/${applicationId}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },

  messaging: {
    conversations: () => request('/messaging/conversations'),
    messages: (conversationId: string) =>
      request(`/messaging/conversations/${conversationId}/messages`),
    sendMessage: (conversationId: string, content: string) =>
      request(`/messaging/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    startConversation: (targetUserId: string) =>
      request('/messaging/conversations', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  },

  notifications: {
    list: () => request('/notifications'),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
  },

  incubator: {
    posts: (category?: string) => {
      const query = category ? `?category=${encodeURIComponent(category)}` : '';
      return request(`/incubator${query}`);
    },
    getOne: (id: string) => request(`/incubator/${id}`),
    createPost: (data: { title: string; content: string; category: string }) =>
      request('/incubator', { method: 'POST', body: JSON.stringify(data) }),
    deletePost: (id: string) => request(`/incubator/${id}`, { method: 'DELETE' }),
    addComment: (id: string, content: string) =>
      request(`/incubator/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
    toggleLike: (id: string) => request(`/incubator/${id}/like`, { method: 'POST' }),
  },

  analytics: {
    dashboard: () => request('/analytics/dashboard'),
    earnings: () => request('/analytics/earnings'),
  },

  admin: {
    stats: () => request('/admin/stats'),
    users: (page = 1, limit = 20) => request(`/admin/users?page=${page}&limit=${limit}`),
    deleteUser: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    updateUserPlan: (id: string, plan: string) =>
      request(`/admin/users/${id}/plan`, { method: 'PUT', body: JSON.stringify({ plan }) }),
  },

  feed: {
    list: () => request('/feed'),
    create: (data: { content: string; imageUrl?: string }) =>
      request('/feed', { method: 'POST', body: JSON.stringify(data) }),
    toggleLike: (id: string) => request(`/feed/${id}/like`, { method: 'POST' }),
    addComment: (id: string, content: string) =>
      request(`/feed/${id}/comment`, { method: 'POST', body: JSON.stringify({ content }) }),
  },

  uploads: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request('/uploads', { method: 'POST', body: formData });
    },
  },

  subscription: {
    get: () => request('/subscription'),
    plans: () => request('/subscription/plans'),
    checkout: (plan: 'PRO' | 'BUSINESS', interval: 'monthly' | 'yearly' = 'monthly', provider: 'stripe' | 'wise' = 'stripe') =>
      request('/subscription/checkout', { method: 'POST', body: JSON.stringify({ plan, interval, provider }) }),
    upgrade: (plan: 'PRO' | 'BUSINESS') =>
      request('/subscription/upgrade', { method: 'POST', body: JSON.stringify({ plan }) }),
    portal: () => request('/subscription/portal', { method: 'POST' }),
    cancel: () => request('/subscription/cancel', { method: 'DELETE' }),
    wiseInstructions: (plan: string, interval: 'monthly' | 'yearly' = 'monthly') =>
      request('/subscription/wise/payment-instructions', { method: 'POST', body: JSON.stringify({ plan, interval }) }),
  },

  connections: {
    sendRequest: (receiverId: string, options?: { message?: string; isCoffee?: boolean }) =>
      request('/connections/request', { method: 'POST', body: JSON.stringify({ receiverId, ...options }) }),
    acceptRequest: (requestId: string) =>
      request(`/connections/accept/${requestId}`, { method: 'POST' }),
    declineRequest: (requestId: string) =>
      request(`/connections/decline/${requestId}`, { method: 'POST' }),
    pending: () => request('/connections/pending'),
    sent: () => request('/connections/sent'),
    friends: () => request('/connections/friends'),
    remove: (friendId: string) =>
      request(`/connections/${friendId}`, { method: 'DELETE' }),
  },

  events: {
    list: (params: { category?: string; type?: string; upcoming?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.category) query.set('category', params.category);
      if (params.type) query.set('type', params.type);
      if (params.upcoming) query.set('upcoming', params.upcoming);
      return request(`/events?${query.toString()}`);
    },
    getOne: (id: string) => request(`/events/${id}`),
    create: (data: any) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/events/${id}`, { method: 'DELETE' }),
    register: (eventId: string) => request(`/events/${eventId}/register`, { method: 'POST' }),
    cancelRegistration: (eventId: string) => request(`/events/${eventId}/register`, { method: 'DELETE' }),
    myRegistrations: () => request('/events/my-registrations'),
    participants: (eventId: string) => request(`/events/${eventId}/participants`),
  },

  businessCards: {
    list: () => request('/business-cards'),
    received: () => request('/business-cards/received'),
    stats: () => request('/business-cards/stats'),
    create: (data: any) => request('/business-cards', { method: 'POST', body: JSON.stringify(data) }),
    accept: (id: string) => request(`/business-cards/${id}/accept`, { method: 'PATCH' }),
    delete: (id: string) => request(`/business-cards/${id}`, { method: 'DELETE' }),
  },

  referral: {
    dashboard: () => request('/referral/dashboard'),
    leaderboard: () => request('/referral/leaderboard'),
    registerReferral: (code: string) => request(`/referral/register/${code}`, { method: 'POST' }),
  },

  advertisements: {
    list: (placement?: string) => {
      const query = placement ? `?placement=${placement}` : '';
      return request(`/advertisements${query}`);
    },
    mine: () => request('/advertisements/mine'),
    create: (data: any) => request('/advertisements', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/advertisements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    stats: (id: string) => request(`/advertisements/${id}/stats`),
    trackImpression: (id: string) => request(`/advertisements/${id}/impression`, { method: 'POST' }),
    trackClick: (id: string) => request(`/advertisements/${id}/click`, { method: 'POST' }),
  },
};
