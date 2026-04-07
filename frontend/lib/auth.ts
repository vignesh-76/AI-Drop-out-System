const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Local storage keys
const ACCESS_TOKEN_KEY = "edupulse_access_token";
const REFRESH_TOKEN_KEY = "edupulse_refresh_token";
const MENTOR_KEY = "edupulse_mentor";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MentorData {
  mentor_id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface AuthResponse extends AuthTokens, MentorData {}

// Token management with localStorage safety
export const tokenAPI = {
  setTokens: (tokens: AuthTokens, mentorData: MentorData) => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
        localStorage.setItem(MENTOR_KEY, JSON.stringify(mentorData));
        console.log('[AUTH] Tokens saved to localStorage');
      }
    } catch (e) {
      console.error('[AUTH] Failed to save tokens to localStorage:', e);
    }
  },

  getAccessToken: () => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
      }
    } catch (e) {
      console.error('[AUTH] Failed to read access token from localStorage:', e);
    }
    return null;
  },

  getRefreshToken: () => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
      }
    } catch (e) {
      console.error('[AUTH] Failed to read refresh token from localStorage:', e);
    }
    return null;
  },

  getMentorData: () => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        const data = localStorage.getItem(MENTOR_KEY);
        return data ? JSON.parse(data) : null;
      }
    } catch (e) {
      console.error('[AUTH] Failed to read mentor data from localStorage:', e);
    }
    return null;
  },

  clearTokens: () => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(MENTOR_KEY);
        console.log('[AUTH] Tokens cleared from localStorage');
      }
    } catch (e) {
      console.error('[AUTH] Failed to clear tokens from localStorage:', e);
    }
  },

  isTokenExpiringSoon: (expiresIn: number = 300000) => {
    try {
      // Check if token expires within the given milliseconds (default 5 minutes)
      const token = typeof window !== 'undefined' && localStorage ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
      if (!token) return true;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      return expiresAt - now < expiresIn;
    } catch (e) {
      console.error('[AUTH] Failed to check token expiration:', e);
      return true;
    }
  }
};

// Authentication API calls
export const authAPI = {
  signup: async (email: string, password: string, fullName: string, role: string = "mentor") => {
    try {
      console.log('[API] Signup request:', { email, full_name: fullName, role });
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName, role })
      });

      console.log('[API] Signup response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('[API] Signup error:', error);
        throw new Error(error.detail || "Sign up failed");
      }

      const data: AuthResponse = await response.json();
      console.log('[API] Signup success:', data);
      return data;
    } catch (error) {
      console.error('[API] Signup fetch error:', error);
      throw error;
    }
  },

  signin: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Sign in failed");
    }

    const data: AuthResponse = await response.json();
    return data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data: AuthResponse = await response.json();
    return data;
  },

  getCurrentMentor: async (accessToken: string) => {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch mentor data");
    }

    return response.json();
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Password reset request failed");
    }

    return response.json();
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: newPassword })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Password reset failed");
    }

    return response.json();
  }
};
