// ===========================================
// AUTH SLICE
// ===========================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isProfileComplete?: boolean;
}

// Load initial state from localStorage
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const parseUser = (raw: string | null) => {
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const initialState: AuthState = {
  user: parseUser(storedUser),
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
  isProfileComplete: localStorage.getItem('isProfileComplete') === 'true'
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(email, password);
      const { user, token, isProfileComplete } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      if (isProfileComplete !== undefined) {
        localStorage.setItem('isProfileComplete', String(isProfileComplete));
      }
      return { user, token, isProfileComplete };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } | string } } };
      const apiError = err.response?.data?.error;
      const errorMessage =
        (typeof apiError === 'object' && apiError?.message) ||
        (typeof apiError === 'string' && apiError) ||
        'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: { email: string; password: string; name: string; role?: string; dateOfBirth?: string; location?: string; phone?: string; redirectAfterVerification?: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.register(data);

      // Handle API response structure: { success: true, data: { user, token } }
      const responseData = response.data.success ? response.data.data : response.data;
      const { user, token } = responseData;

      if (!user || !token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('isProfileComplete', 'false');
      return { user, token };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } | string; message?: string } }; message?: string };
      // API returns { error: { code, message, details } } — extract the string message
      const apiError = err.response?.data?.error;
      const errorMessage =
        (typeof apiError === 'object' && apiError?.message) ||
        (typeof apiError === 'string' && apiError) ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      const { user, isProfileComplete } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      if (isProfileComplete !== undefined) {
        localStorage.setItem('isProfileComplete', String(isProfileComplete));
      }
      return { user, isProfileComplete };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isProfileComplete = false;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('isProfileComplete');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    setProfileComplete: (state, action: PayloadAction<boolean>) => {
      state.isProfileComplete = action.payload;
      localStorage.setItem('isProfileComplete', String(action.payload));
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isProfileComplete = action.payload.isProfileComplete;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isProfileComplete = false;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        if (action.payload.isProfileComplete !== undefined) {
          state.isProfileComplete = action.payload.isProfileComplete;
        }
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  }
});

export const { logout, clearError, updateUser, setProfileComplete, loginSuccess } = authSlice.actions;
export default authSlice.reducer;
