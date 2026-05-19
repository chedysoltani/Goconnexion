const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request(endpoint: string, options: RequestInit = {}) {
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
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
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    },
    register: async (signupData: any) => {
      // Align frontend select-role role with backend UserRole enum
      const roleMapped = signupData.role === 'freelancer' ? 'FREELANCER' : 'ENTREPRENEUR';
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
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    me: () => request('/auth/me'),
  },

  users: {
    suggestions: () => request('/users/suggestions'),
    updateProfile: (data: any) => request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },

  freelancers: {
    list: (params: { skills?: string; minRate?: number; maxRate?: number; availableOnly?: boolean } = {}) => {
      const query = new URLSearchParams();
      if (params.skills) query.set('skills', params.skills);
      if (params.minRate) query.set('minRate', String(params.minRate));
      if (params.maxRate) query.set('maxRate', String(params.maxRate));
      if (params.availableOnly) query.set('availableOnly', 'true');
      
      return request(`/freelancers?${query.toString()}`);
    },
    getProfile: () => request('/freelancers/profile'),
    updateProfile: (data: any) => request('/freelancers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },

  entrepreneurs: {
    list: () => request('/entrepreneurs'),
    getProfile: () => request('/entrepreneurs/profile'),
    updateProfile: (data: any) => request('/entrepreneurs/profile', {
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
    create: (data: any) => request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request(`/projects/${id}`, {
      method: 'DELETE',
    }),
    apply: (projectId: string, coverLetter?: string) => request(`/projects/${projectId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ coverLetter }),
    }),
    getApplications: (projectId: string) => request(`/projects/${projectId}/applications`),
    updateApplicationStatus: (applicationId: string, status: string) => request(`/projects/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  },

  messaging: {
    conversations: () => request('/messaging/conversations'),
    messages: (conversationId: string) => request(`/messaging/conversations/${conversationId}/messages`),
    sendMessage: (conversationId: string, content: string) => request(`/messaging/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
    startConversation: (targetUserId: string) => request('/messaging/conversations', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    }),
  },

  notifications: {
    list: () => request('/notifications'),
    markRead: (id: string) => request(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
    markAllRead: () => request('/notifications/read-all', {
      method: 'PUT',
    }),
  },

  incubator: {
    posts: (category?: string) => {
      const query = category ? `?category=${encodeURIComponent(category)}` : '';
      return request(`/incubator${query}`);
    },
    getOne: (id: string) => request(`/incubator/${id}`),
    createPost: (data: { title: string; content: string; category: string }) => request('/incubator', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    deletePost: (id: string) => request(`/incubator/${id}`, {
      method: 'DELETE',
    }),
    addComment: (id: string, content: string) => request(`/incubator/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
    toggleLike: (id: string) => request(`/incubator/${id}/like`, {
      method: 'POST',
    }),
  },

  analytics: {
    dashboard: () => request('/analytics/dashboard'),
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
};
