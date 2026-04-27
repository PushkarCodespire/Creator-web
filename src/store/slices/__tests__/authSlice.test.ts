import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  register,
  fetchCurrentUser,
  logout,
  clearError,
  updateUser,
  setProfileComplete,
} from '../authSlice';
import type { User } from '../../../types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock the API module — authSlice imports authApi from '../../services/api'
vi.mock('../../../services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

import { authApi } from '../../../services/api';

const mockedAuthApi = authApi as {
  login: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  getCurrentUser: ReturnType<typeof vi.fn>;
};

// localStorage mock
const localStorageMock = (() => {
  let storage: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => storage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
    removeItem: vi.fn((key: string) => { delete storage[key]; }),
    clear: vi.fn(() => { storage = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  isVerified: false,
  createdAt: '2025-01-01T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('authSlice', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ----- Initial state -----

  describe('initial state', () => {
    it('defaults to unauthenticated when localStorage is empty', () => {
      const store = createStore();
      const { auth } = store.getState();

      expect(auth.user).toBeNull();
      expect(auth.token).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
      expect(auth.isLoading).toBe(false);
      expect(auth.error).toBeNull();
    });
  });

  // ----- Synchronous reducers -----

  describe('logout', () => {
    it('clears all auth state and localStorage', () => {
      const store = createStore();

      // Simulate logged-in state via a fulfilled login
      mockedAuthApi.login.mockResolvedValueOnce({
        data: { data: { user: mockUser, token: 'tok-1', isProfileComplete: true } },
      });

      return store.dispatch(login({ email: 'a@b.com', password: 'pw' })).then(() => {
        store.dispatch(logout());

        const { auth } = store.getState();
        expect(auth.user).toBeNull();
        expect(auth.token).toBeNull();
        expect(auth.isAuthenticated).toBe(false);
        expect(auth.isProfileComplete).toBe(false);
        expect(auth.error).toBeNull();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('isProfileComplete');
      });
    });
  });

  describe('clearError', () => {
    it('resets the error field to null', () => {
      const store = createStore();

      // Force an error via a rejected login
      mockedAuthApi.login.mockRejectedValueOnce({
        response: { data: { error: 'bad creds' } },
      });

      return store.dispatch(login({ email: 'a@b.com', password: 'pw' })).then(() => {
        expect(store.getState().auth.error).toBe('bad creds');

        store.dispatch(clearError());
        expect(store.getState().auth.error).toBeNull();
      });
    });
  });

  describe('updateUser', () => {
    it('merges partial user data into the existing user', async () => {
      const store = createStore();

      mockedAuthApi.login.mockResolvedValueOnce({
        data: { data: { user: mockUser, token: 'tok-1' } },
      });
      await store.dispatch(login({ email: 'a@b.com', password: 'pw' }));

      store.dispatch(updateUser({ name: 'Updated Name', bio: 'new bio' }));

      const { auth } = store.getState();
      expect(auth.user?.name).toBe('Updated Name');
      expect(auth.user?.bio).toBe('new bio');
      // Existing fields preserved
      expect(auth.user?.email).toBe(mockUser.email);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        expect.stringContaining('Updated Name'),
      );
    });

    it('does nothing when there is no user', () => {
      const store = createStore();
      store.dispatch(updateUser({ name: 'Nope' }));
      expect(store.getState().auth.user).toBeNull();
    });
  });

  describe('setProfileComplete', () => {
    it('updates isProfileComplete and persists to localStorage', () => {
      const store = createStore();
      store.dispatch(setProfileComplete(true));

      expect(store.getState().auth.isProfileComplete).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('isProfileComplete', 'true');

      store.dispatch(setProfileComplete(false));
      expect(store.getState().auth.isProfileComplete).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('isProfileComplete', 'false');
    });
  });

  // ----- Async thunks -----

  describe('login thunk', () => {
    it('sets loading state while pending', () => {
      // Create a promise that never resolves during this assertion
      let resolveLogin!: (v: unknown) => void;
      mockedAuthApi.login.mockReturnValueOnce(
        new Promise((r) => { resolveLogin = r; }),
      );

      const store = createStore();
      const promise = store.dispatch(login({ email: 'a@b.com', password: 'pw' }));

      expect(store.getState().auth.isLoading).toBe(true);
      expect(store.getState().auth.error).toBeNull();

      // Clean up
      resolveLogin({ data: { data: { user: mockUser, token: 't' } } });
      return promise;
    });

    it('populates user, token, and isAuthenticated on success', async () => {
      mockedAuthApi.login.mockResolvedValueOnce({
        data: {
          data: { user: mockUser, token: 'jwt-abc', isProfileComplete: true },
        },
      });

      const store = createStore();
      await store.dispatch(login({ email: 'a@b.com', password: 'pw' }));

      const { auth } = store.getState();
      expect(auth.isLoading).toBe(false);
      expect(auth.user).toEqual(mockUser);
      expect(auth.token).toBe('jwt-abc');
      expect(auth.isAuthenticated).toBe(true);
      expect(auth.isProfileComplete).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'jwt-abc');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockUser),
      );
    });

    it('sets error on failure', async () => {
      mockedAuthApi.login.mockRejectedValueOnce({
        response: { data: { error: 'Invalid credentials' } },
      });

      const store = createStore();
      await store.dispatch(login({ email: 'a@b.com', password: 'wrong' }));

      const { auth } = store.getState();
      expect(auth.isLoading).toBe(false);
      expect(auth.error).toBe('Invalid credentials');
      expect(auth.isAuthenticated).toBe(false);
    });

    it('falls back to generic message when error response is missing', async () => {
      mockedAuthApi.login.mockRejectedValueOnce(new Error('network'));

      const store = createStore();
      await store.dispatch(login({ email: 'a@b.com', password: 'pw' }));

      expect(store.getState().auth.error).toBe('Login failed');
    });
  });

  describe('register thunk', () => {
    it('populates user and token on success (success-wrapped response)', async () => {
      mockedAuthApi.register.mockResolvedValueOnce({
        data: {
          success: true,
          data: { user: mockUser, token: 'reg-tok' },
        },
      });

      const store = createStore();
      await store.dispatch(
        register({ email: 'a@b.com', password: 'pw', name: 'Test' }),
      );

      const { auth } = store.getState();
      expect(auth.user).toEqual(mockUser);
      expect(auth.token).toBe('reg-tok');
      expect(auth.isAuthenticated).toBe(true);
      expect(auth.isProfileComplete).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('isProfileComplete', 'false');
    });

    it('sets error on failure', async () => {
      mockedAuthApi.register.mockRejectedValueOnce({
        response: { data: { error: 'Email taken' } },
      });

      const store = createStore();
      await store.dispatch(
        register({ email: 'dup@b.com', password: 'pw', name: 'Test' }),
      );

      const { auth } = store.getState();
      expect(auth.isLoading).toBe(false);
      expect(auth.error).toBe('Email taken');
    });

    it('rejects when server returns no user/token', async () => {
      mockedAuthApi.register.mockResolvedValueOnce({
        data: { success: true, data: {} },
      });

      const store = createStore();
      await store.dispatch(
        register({ email: 'a@b.com', password: 'pw', name: 'Test' }),
      );

      expect(store.getState().auth.error).toBe('Invalid response from server');
    });
  });

  describe('fetchCurrentUser thunk', () => {
    it('updates user on success', async () => {
      mockedAuthApi.getCurrentUser.mockResolvedValueOnce({
        data: { data: { user: mockUser, isProfileComplete: true } },
      });

      const store = createStore();
      await store.dispatch(fetchCurrentUser());

      const { auth } = store.getState();
      expect(auth.user).toEqual(mockUser);
      expect(auth.isAuthenticated).toBe(true);
      expect(auth.isProfileComplete).toBe(true);
      expect(auth.isLoading).toBe(false);
    });

    it('clears auth state and localStorage on failure', async () => {
      localStorageMock.setItem('token', 'old');
      localStorageMock.setItem('user', '{}');

      mockedAuthApi.getCurrentUser.mockRejectedValueOnce({
        response: { data: { error: 'Expired' } },
      });

      const store = createStore();
      await store.dispatch(fetchCurrentUser());

      const { auth } = store.getState();
      expect(auth.user).toBeNull();
      expect(auth.token).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
      expect(auth.isLoading).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });
});
