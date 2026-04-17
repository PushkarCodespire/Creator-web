import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import chatReducer from '../slices/chatSlice';

// The store module reads localStorage at import time, so we must set up
// mocks before importing the real store.
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

describe('Redux store (index)', () => {
  it('can be created with auth and chat reducers', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        chat: chatReducer,
      },
    });

    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('chat');
  });

  it('has the expected initial auth state shape', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        chat: chatReducer,
      },
    });

    const { auth } = store.getState();
    expect(auth).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }),
    );
  });

  it('has the expected initial chat state shape', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        chat: chatReducer,
      },
    });

    const { chat } = store.getState();
    expect(chat).toEqual(
      expect.objectContaining({
        currentConversation: null,
        conversations: [],
        messages: [],
        isLoading: false,
        isSending: false,
        error: null,
      }),
    );
  });
});
