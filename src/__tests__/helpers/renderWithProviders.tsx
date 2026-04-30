import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import authReducer from '../../store/slices/authSlice';
import chatReducer from '../../store/slices/chatSlice';
import type { RootState } from '../../store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, ...renderOptions }: ExtendedRenderOptions = {}
) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      chat: chatReducer,
    },
    preloadedState: preloadedState as RootState,
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
