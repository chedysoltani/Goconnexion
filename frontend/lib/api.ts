const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function setAuthCookies(accessToken: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `gc_token=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
}

function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'gc_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
}

async function request(endpoint: string, options: RequestInit = {}, retry = true): Promise<any> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Token expired — try to refresh once
  if (response.status === 401 && retry && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem('token', refreshData.accessToken);
          localStorage.setItem('refreshToken', refreshData.refreshToken);
          localStorage.setItem('user', JSON.stringify(refreshData.user));
          setAuthCookies(refreshData.accessToken);
          return request(endpoint, options, false);
        }
      } catch {
        // refresh failed, fall through to logout
      }
    }

    // Refresh impossible — clear session and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    clearAuthCookies();
    window.location.href = '/auth/login';
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuthCookies(data.accessToken);
      }
      return data;
    },

    register: async (signupData: any) => {
      const roleMap: Record<string, string> = {
        freelancer: 'FREELANCER',
        entrepreneur: 'ENTREPRENEUR',
        user: 'COLLABORATOR',
      };
      const roleMapped = roleMap[signupData.role] ?? 'COLLABORATOR';

      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          role: roleMapped,
        }),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuthCookies(data.accessToken);
      }
      return data;
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        clearAuthCookies();
      }
    },

    me: () => request('/auth/me'),

    refresh: (refreshToken: string) =>
      request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }, false),
  },

  users: {
    suggestions: () => request('/users/suggestions'),
    updateProfile: (data: any) =>
      request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
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
      request('/freelancers/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  entrepreneurs: {
    list: () => request('/entrepreneurs'),
    getProfile: () => request('/entrepreneurs/profile'),
    updateProfile: (data: any) =>
      request('/entrepreneurs/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
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
      request('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
    apply: (projectId: string, coverLetter?: string) =>
      request(`/projects/${projectId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ coverLetter }),
      }),
    getApplications: (projectId: string) => request(`/projects/${projectId}/applications`),
    updateApplicationStatus: (applicationId: string, status: string) =>
      request(`/projects/applications/${applicationId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
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
      request('/messaging/conversations', {
        method: 'POST',
        body: JSON.stringify({ targetUserId }),
      }),
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
      request('/incubator', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deletePost: (id: string) => request(`/incubator/${id}`, { method: 'DELETE' }),
    addComment: (id: string, content: string) =>
      request(`/incubator/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    toggleLike: (id: string) => request(`/incubator/${id}/like`, { method: 'POST' }),
  },

  analytics: {
    dashboard: () => request('/analytics/dashboard'),
  },

  feed: {
    list: () => request('/feed'),
    create: (data: { content: string; imageUrl?: string }) =>
      request('/feed', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    toggleLike: (id: string) => request(`/feed/${id}/like`, { method: 'POST' }),
    addComment: (id: string, content: string) =>
      request(`/feed/${id}/comment`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  },

  uploads: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request('/uploads', {
        method: 'POST',
        body: formData,
      });
    },
  },

  subscription: {
    get: () => request('/subscription'),
    plans: () => request('/subscription/plans'),
    checkout: (plan: 'PRO' | 'BUSINESS', interval: 'monthly' | 'yearly' = 'monthly') =>
      request('/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan, interval }),
      }),
    upgrade: (plan: 'PRO' | 'BUSINESS') =>
      request('/subscription/upgrade', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      }),
    portal: () => request('/subscription/portal', { method: 'POST' }),
    cancel: () => request('/subscription/cancel', { method: 'DELETE' }),
  },

  connections: {
    sendRequest: (receiverId: string, options?: { message?: string; isCoffee?: boolean }) =>
      request('/connections/request', {
        method: 'POST',
        body: JSON.stringify({ receiverId, ...options }),
      }),
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
    stats: () => request('/business-cards/stats'),
    create: (data: any) => request('/business-cards', { method: 'POST', body: JSON.stringify(data) }),
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
