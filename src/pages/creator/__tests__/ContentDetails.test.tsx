import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('../../../services/api', () => ({
  contentApi: {
    getById: vi.fn().mockResolvedValue({
      data: {
        data: {
          id: 'c1',
          title: 'My YouTube Tutorial',
          type: 'YOUTUBE_VIDEO',
          sourceUrl: 'https://youtube.com/watch?v=abc123',
          status: 'COMPLETED',
          chunksCount: 12,
          createdAt: '2026-01-15T10:00:00Z',
          updatedAt: '2026-01-15T11:00:00Z',
          chunks: [
            { id: 'ch1', chunkIndex: 0, text: 'This is the first chunk of content.', tokenCount: 120, createdAt: '2026-01-15T11:00:00Z' },
          ],
        },
      },
    }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    retrain: vi.fn().mockResolvedValue({ data: {} }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('../../../utils/socket', () => {
  const sock = { on: vi.fn(), off: vi.fn(), emit: vi.fn(), disconnect: vi.fn() };
  return { connectSocket: vi.fn(() => sock), getSocket: vi.fn(() => sock) };
});

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: { children: React.ReactNode; [key: string]: unknown }) => <div {...p as React.HTMLAttributes<HTMLDivElement>}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ contentId: 'c1' }), useNavigate: () => mockNavigate };
});

import ContentDetails from '../ContentDetails';

const creatorState = {
  auth: {
    user: { id: '1', name: 'Test Creator', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('ContentDetails', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });
    // The Spin component renders with aria-busy while loading
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('renders the content title after data loads', async () => {
    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('My YouTube Tutorial')).toBeInTheDocument();
    });
  });

  it('renders the Return to Registry back button', async () => {
    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Return to Registry')).toBeInTheDocument();
    });
  });

  it('renders the Intelligence Specification card', async () => {
    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Intelligence Specification')).toBeInTheDocument();
    });
  });

  it('renders the Purge Asset delete button', async () => {
    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getAllByText('Purge Asset').length).toBeGreaterThan(0);
    });
  });

  it('renders the chunk vector list when chunks are present', async () => {
    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Neural Vector Inspection (1)')).toBeInTheDocument();
    });
    expect(screen.getByText('This is the first chunk of content.')).toBeInTheDocument();
  });

  it('renders the Nexus Status sidebar card', async () => {
    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Nexus Status')).toBeInTheDocument();
    });
  });

  it('renders the Operational Protocols sidebar card', async () => {
    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Operational Protocols')).toBeInTheDocument();
    });
  });

  it('navigates back when Return to Registry is clicked', async () => {
    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Return to Registry')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Return to Registry'));
    expect(mockNavigate).toHaveBeenCalledWith('/creator-dashboard/content');
  });

  it('navigates to content list when Purge Asset is clicked', async () => {
    const { contentApi } = await import('../../../services/api');
    (contentApi.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: {} });

    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getAllByText('Purge Asset').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText('Purge Asset')[0]);

    await waitFor(() => {
      expect(contentApi.delete).toHaveBeenCalledWith('c1');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/creator-dashboard/content');
  });

  it('renders FAILED status correctly and shows Perform Recalibration button', async () => {
    const { contentApi } = await import('../../../services/api');
    (contentApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c2',
          title: 'Failed Content',
          type: 'MANUAL_TEXT',
          status: 'FAILED',
          errorMessage: 'Processing error occurred',
          chunksCount: 0,
          createdAt: '2026-01-15T10:00:00Z',
          updatedAt: '2026-01-15T11:00:00Z',
          chunks: [],
        },
      },
    });

    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getAllByText('Perform Recalibration').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Offline').length).toBeGreaterThan(0);
  });

  it('renders the error alert when status is FAILED with an error message', async () => {
    const { contentApi } = await import('../../../services/api');
    (contentApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c3',
          title: 'Failed Content',
          type: 'MANUAL_TEXT',
          status: 'FAILED',
          errorMessage: 'Something went wrong during processing',
          chunksCount: 0,
          createdAt: '2026-01-15T10:00:00Z',
          updatedAt: '2026-01-15T11:00:00Z',
          chunks: [],
        },
      },
    });

    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Neural Disruption Detected')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong during processing')).toBeInTheDocument();
    });
  });

  it('shows PROCESSING status with progress card', async () => {
    const { contentApi } = await import('../../../services/api');
    (contentApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c4',
          title: 'Processing Content',
          type: 'YOUTUBE_VIDEO',
          sourceUrl: 'https://youtube.com/watch?v=xyz',
          status: 'PROCESSING',
          chunksCount: 0,
          createdAt: '2026-01-15T10:00:00Z',
          updatedAt: '2026-01-15T11:00:00Z',
          chunks: [],
        },
      },
    });

    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Neural Extraction in Progress')).toBeInTheDocument();
    });
    expect(screen.getAllByText('Syncing').length).toBeGreaterThan(0);
  });

  it('renders sourceUrl as a link when present', async () => {
    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /youtube\.com/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://youtube.com/watch?v=abc123');
    });
  });

  it('renders FAQ type with correct label', async () => {
    const { contentApi } = await import('../../../services/api');
    (contentApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c5',
          title: 'FAQ Content',
          type: 'FAQ',
          status: 'COMPLETED',
          chunksCount: 3,
          createdAt: '2026-01-15T10:00:00Z',
          updatedAt: '2026-01-15T11:00:00Z',
          chunks: [],
        },
      },
    });

    renderWithProviders(<ContentDetails />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('FAQ Matrix')).toBeInTheDocument();
    });
  });
});
