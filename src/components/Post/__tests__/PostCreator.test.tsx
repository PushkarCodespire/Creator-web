vi.mock('../../../services/api', () => ({
  postApi: {
    createPost: vi.fn().mockResolvedValue({ data: { data: { id: '1' } } }),
    getFeed: vi.fn().mockResolvedValue({ data: { data: { posts: [], pagination: { total: 0 } } } }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    textarea: ({ children, ...p }: any) => <textarea {...p}>{children}</textarea>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import PostCreator from '../PostCreator';

const authState = {
  auth: {
    user: { id: '1', name: 'Test', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('PostCreator', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<PostCreator />, {
      preloadedState: authState,
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders textarea with default placeholder', () => {
    renderWithProviders(<PostCreator />, { preloadedState: authState });
    expect(screen.getByPlaceholderText('Commence neural transmission...')).toBeInTheDocument();
  });

  it('renders textarea with custom placeholder', () => {
    renderWithProviders(<PostCreator placeholder="Share your thoughts..." />, { preloadedState: authState });
    expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument();
  });

  it('renders Transmit button', () => {
    renderWithProviders(<PostCreator />, { preloadedState: authState });
    expect(screen.getByText('Transmit')).toBeInTheDocument();
  });

  it('renders Visual upload button when allowMedia is true', () => {
    renderWithProviders(<PostCreator allowMedia={true} />, { preloadedState: authState });
    expect(screen.getByText('Visual')).toBeInTheDocument();
  });

  it('renders Stream upload button when allowMedia is true', () => {
    renderWithProviders(<PostCreator allowMedia={true} />, { preloadedState: authState });
    expect(screen.getByText('Stream')).toBeInTheDocument();
  });

  it('renders Abort button when onCancel is provided', () => {
    renderWithProviders(<PostCreator onCancel={vi.fn()} />, { preloadedState: authState });
    expect(screen.getByText('Abort')).toBeInTheDocument();
  });

  it('does not render media buttons when allowMedia is false', () => {
    renderWithProviders(<PostCreator allowMedia={false} />, { preloadedState: authState });
    expect(screen.queryByText('Visual')).not.toBeInTheDocument();
    expect(screen.queryByText('Stream')).not.toBeInTheDocument();
  });

  it('renders character count', () => {
    renderWithProviders(<PostCreator />, { preloadedState: authState });
    expect(screen.getByText(/0 \/ 5,000/)).toBeInTheDocument();
  });

  it('updates character count as user types', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(<PostCreator />, { preloadedState: authState });
    const textarea = screen.getByPlaceholderText('Commence neural transmission...');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    await waitFor(() => {
      expect(screen.getByText(/11 \/ 5,000/)).toBeInTheDocument();
    });
  });

  it('Transmit button is disabled when content is empty', () => {
    renderWithProviders(<PostCreator />, { preloadedState: authState });
    const btn = screen.getByText('Transmit').closest('button');
    expect(btn).toBeDisabled();
  });

  it('Transmit button is enabled after typing content', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(<PostCreator />, { preloadedState: authState });
    const textarea = screen.getByPlaceholderText('Commence neural transmission...');
    fireEvent.change(textarea, { target: { value: 'My new post' } });
    await waitFor(() => {
      const btn = screen.getByText('Transmit').closest('button');
      expect(btn).not.toBeDisabled();
    });
  });

  it('calls onCancel when Abort is clicked', () => {
    const { fireEvent } = { fireEvent: require('@testing-library/react').fireEvent };
    const onCancel = vi.fn();
    renderWithProviders(<PostCreator onCancel={onCancel} />, { preloadedState: authState });
    fireEvent.click(screen.getByText('Abort'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls postApi.createPost and onPostCreated on submit', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { postApi } = await import('../../../services/api');
    const onPostCreated = vi.fn();
    renderWithProviders(<PostCreator onPostCreated={onPostCreated} />, { preloadedState: authState });
    const textarea = screen.getByPlaceholderText('Commence neural transmission...');
    fireEvent.change(textarea, { target: { value: 'My test post content' } });
    await waitFor(() => {
      const btn = screen.getByText('Transmit').closest('button');
      expect(btn).not.toBeDisabled();
    });
    fireEvent.click(screen.getByText('Transmit'));
    await waitFor(() => {
      expect(postApi.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'My test post content', type: 'TEXT' })
      );
      expect(onPostCreated).toHaveBeenCalled();
    });
  });

  it('renders custom maxLength character counter', () => {
    renderWithProviders(<PostCreator maxLength={280} />, { preloadedState: authState });
    expect(screen.getByText(/0 \/ 280/)).toBeInTheDocument();
  });
});
