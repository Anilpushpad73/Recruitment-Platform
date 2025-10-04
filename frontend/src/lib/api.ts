const API_BASE_URL = "https://recruitment-backend-2le0.onrender.com";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // final configuration object make for  fetch API
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data.errors
      );
    }

    return data.data || data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      'Network error. Please check your connection.',
      0
    );
  }
};

export const authApi = {
  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    const response = await apiRequest<{
      token: string;
      user: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token
    localStorage.setItem('authToken', response.token);
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest<{
      token: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token
    localStorage.setItem('authToken', response.token);
    return response;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Always remove token, even if request fails
      localStorage.removeItem('authToken');
    }
  },

  getCurrentUser: async () => {
    return apiRequest<{ user: any }>('/auth/me');
  },
};

export const profileApi = {
  getProfile: async () => {
    return apiRequest<{ profile: any }>('/profile');
  },

  updateProfile: async (profileData: any) => {
    return apiRequest<{ profile: any }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  deactivateAccount: async () => {
    return apiRequest('/profile', {
      method: 'DELETE',
    });
  },
};

export { ApiError };
export type { ApiResponse };
