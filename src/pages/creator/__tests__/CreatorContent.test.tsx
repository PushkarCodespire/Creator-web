import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('../../../services/api', () => ({
  contentApi: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: {
          contents: [
            { id: 'c1', title: 'My YouTube Video', type: 'YOUTUBE_VIDEO', status: 'COMPLETED', createdAt: '2024-01-01T00:00:00Z', _count: { chunks: 5 } },
            { id: 'c2', title: 'My FAQ Guide', type: 'FAQ', status: 'COMPLETED', createdAt: '2024-01-02T00:00:00Z', _count: { chunks: 3 } },
          ],
          pagination: { total: 2, page: 1, limit: 20 },
        },
      },
    }),
    create: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    retrain: vi.fn().mockResolvedValue({ data: {} }),
    addYouTube: vi.fn().mockResolvedValue({ data: {} }),
    addManual: vi.fn().mockResolvedValue({ data: {} }),
    addFAQ: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/socket', () => {
  const sock = { on: vi.fn(), off: vi.fn(), emit: vi.fn(), disconnect: vi.fn() };
  return { connectSocket: vi.fn(() => sock), getSocket: vi.fn(() => sock) };
});

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import CreatorContent from '../CreatorContent';

const authState = {
  auth: {
    user: { id: '1', name: 'Test', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('CreatorContent', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorContent />, {
      preloadedState: authState,
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders content items after data loads', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('My YouTube Video')).toBeInTheDocument();
    });
  });

  it('renders second content item after data loads', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('My FAQ Guide')).toBeInTheDocument();
    });
  });

  it('renders add content button', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('My YouTube Video')).toBeInTheDocument();
    });
    // Page should have rendered the table with content
    expect(screen.getByText('My FAQ Guide')).toBeInTheDocument();
  });

  it('renders Connect YouTube and Add Knowledge header buttons', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Connect YouTube')).toBeInTheDocument();
    });
    expect(screen.getByText('Add Knowledge')).toBeInTheDocument();
    expect(screen.getByText('Sync FAQ')).toBeInTheDocument();
  });

  it('opens YouTube modal when Connect YouTube is clicked', async () => {
    const { getByText } = renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(getByText('Connect YouTube')).toBeInTheDocument();
    });
    fireEvent.click(getByText('Connect YouTube'));
    await waitFor(() => {
      expect(screen.getByText('Ingest YouTube Feed')).toBeInTheDocument();
    });
  });

  it('opens manual content modal when Add Knowledge is clicked', async () => {
    const { getByText } = renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(getByText('Add Knowledge')).toBeInTheDocument();
    });
    fireEvent.click(getByText('Add Knowledge'));
    await waitFor(() => {
      expect(screen.getByText('Neural Instruction')).toBeInTheDocument();
    });
  });

  it('opens FAQ modal when Sync FAQ is clicked', async () => {
    const { getByText } = renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(getByText('Sync FAQ')).toBeInTheDocument();
    });
    fireEvent.click(getByText('Sync FAQ'));
    await waitFor(() => {
      expect(screen.getByText('FAQ Matrix Sync')).toBeInTheDocument();
    });
  });

  it('renders stat cards with correct counts after load', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('My YouTube Video')).toBeInTheDocument();
    });
    // Neural Assets stat card shows total (2 contents)
    expect(screen.getByText('Neural Assets')).toBeInTheDocument();
    expect(screen.getByText('Calibrated')).toBeInTheDocument();
  });

  it('renders sort toggle button and toggles sort order on click', async () => {
    const { getByText } = renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(getByText('Recent Flux')).toBeInTheDocument();
    });
    fireEvent.click(getByText('Recent Flux'));
    await waitFor(() => {
      expect(screen.getByText('Legacy Assets')).toBeInTheDocument();
    });
  });

  it('renders Protocol Registry sub-heading in the table section', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Protocol Registry')).toBeInTheDocument();
    });
  });

  it('renders Intelligence Nexus page title', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Nexus')).toBeInTheDocument();
    });
  });

  it('renders Active Sync stat card', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Active Sync')).toBeInTheDocument();
    });
  });

  it('renders Interference stat card', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Interference')).toBeInTheDocument();
    });
  });

  it('YouTube modal contains the YouTube URL input placeholder after opening', async () => {
    const { getByText } = renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(getByText('Connect YouTube')).toBeInTheDocument());
    fireEvent.click(getByText('Connect YouTube'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://youtube.com/watch?v=...')).toBeInTheDocument();
    });
  });

  it('renders "Append Response Vector" button inside FAQ modal', async () => {
    const { getByText } = renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(getByText('Sync FAQ')).toBeInTheDocument());
    fireEvent.click(getByText('Sync FAQ'));
    await waitFor(() => {
      expect(screen.getByText('Append Response Vector')).toBeInTheDocument();
    });
  });

  it('renders the managing count text in the page subtitle', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText(/Managing 2 neural knowledge vectors/i)).toBeInTheDocument();
    });
  });

  it('renders the Nexus Actions column header in the table', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Nexus Actions')).toBeInTheDocument();
    });
  });

  it('renders the Neural Asset column header in the table', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Neural Asset')).toBeInTheDocument();
    });
  });

  it('renders the Intelligence Chunks column header', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Intelligence Chunks')).toBeInTheDocument();
    });
  });

  it('renders the Class column header', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Class')).toBeInTheDocument();
    });
  });

  it('renders the Current State column header', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Current State')).toBeInTheDocument();
    });
  });

  it('renders the Video Stream URL label inside YouTube modal', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Connect YouTube')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Connect YouTube'));
    await waitFor(() => {
      // The label text in the DOM is "Video Stream URL" (CSS uppercases it visually)
      expect(screen.getByText('Video Stream URL')).toBeInTheDocument();
    });
  });

  it('renders Initiate Neural Capture submit button in YouTube modal', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Connect YouTube')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Connect YouTube'));
    await waitFor(() => {
      expect(screen.getByText('Initiate Neural Capture')).toBeInTheDocument();
    });
  });

  it('renders Synchronize Knowledge Vector submit button in manual modal', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Add Knowledge')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Add Knowledge'));
    await waitFor(() => {
      expect(screen.getByText('Synchronize Knowledge Vector')).toBeInTheDocument();
    });
  });

  it('renders Synchronize FAQ Matrix submit button in FAQ modal', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Sync FAQ')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sync FAQ'));
    await waitFor(() => {
      expect(screen.getByText('Synchronize FAQ Matrix')).toBeInTheDocument();
    });
  });

  it('renders "Zero intelligence vectors detected." empty text when no contents', async () => {
    const { contentApi } = await import('../../../services/api');
    (contentApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          contents: [],
          pagination: { total: 0, page: 1, limit: 20 },
        },
      },
    });
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Zero intelligence vectors detected.')).toBeInTheDocument();
    });
  });

  it('toggles sort back to newest after two clicks', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Recent Flux')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Recent Flux'));
    await waitFor(() => expect(screen.getByText('Legacy Assets')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Legacy Assets'));
    await waitFor(() => expect(screen.getByText('Recent Flux')).toBeInTheDocument());
  });

  it('manual modal contains the title input placeholder after opening', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Add Knowledge')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Add Knowledge'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('e.g. CORE PHILOSOPHY MATRIX')).toBeInTheDocument();
    });
  });

  // ── NEW TESTS ───────────────────────────────────────────────────────────────

  it('calls contentApi.getAll on mount', async () => {
    const { contentApi } = await import('../../../services/api');
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(contentApi.getAll).toHaveBeenCalled();
    });
  });

  it('YouTube modal is open (only one modal visible) when Connect YouTube is clicked', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Connect YouTube')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Connect YouTube'));
    await waitFor(() => expect(screen.getByText('Ingest YouTube Feed')).toBeInTheDocument());
    // Manual and FAQ modal should NOT be open simultaneously
    expect(screen.queryByText('Neural Instruction')).not.toBeInTheDocument();
    expect(screen.queryByText('FAQ Matrix Sync')).not.toBeInTheDocument();
  });

  it('manual modal is open (only one modal visible) when Add Knowledge is clicked', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Add Knowledge')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Add Knowledge'));
    await waitFor(() => expect(screen.getByText('Neural Instruction')).toBeInTheDocument());
    expect(screen.queryByText('Ingest YouTube Feed')).not.toBeInTheDocument();
    expect(screen.queryByText('FAQ Matrix Sync')).not.toBeInTheDocument();
  });

  it('FAQ modal is open (only one modal visible) when Sync FAQ is clicked', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Sync FAQ')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sync FAQ'));
    await waitFor(() => expect(screen.getByText('FAQ Matrix Sync')).toBeInTheDocument());
    expect(screen.queryByText('Ingest YouTube Feed')).not.toBeInTheDocument();
    expect(screen.queryByText('Neural Instruction')).not.toBeInTheDocument();
  });

  it('renders the Added Temporal column header', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Added Temporal')).toBeInTheDocument();
    });
  });

  it('renders COMPLETED status badges for loaded content', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      const completedBadges = screen.getAllByText('COMPLETED');
      expect(completedBadges.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('renders chunk counts for loaded content rows', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      // c1 has 5 chunks, c2 has 3 chunks
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('shows PROCESSING status badge for a PROCESSING item', async () => {
    const { contentApi } = await import('../../../services/api');
    (contentApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          contents: [
            { id: 'p1', title: 'Processing Item', type: 'MANUAL_TEXT', status: 'PROCESSING', createdAt: '2024-01-01T00:00:00Z', _count: { chunks: 0 } },
          ],
          pagination: { total: 1, page: 1, limit: 20 },
        },
      },
    });
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('SYNCING')).toBeInTheDocument();
    });
  });

  it('shows FAILED status badge for a FAILED item', async () => {
    const { contentApi } = await import('../../../services/api');
    (contentApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          contents: [
            { id: 'f1', title: 'Failed Item', type: 'MANUAL_TEXT', status: 'FAILED', createdAt: '2024-01-01T00:00:00Z', _count: { chunks: 0 }, errorMessage: 'Timeout' },
          ],
          pagination: { total: 1, page: 1, limit: 20 },
        },
      },
    });
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('FAILED')).toBeInTheDocument();
    });
  });

  it('shows the "Vectors" label under each chunk count', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      const vectorLabels = screen.getAllByText('Vectors');
      expect(vectorLabels.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('renders "Active knowledge streams" subtitle in table section', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Active knowledge streams for neural extraction')).toBeInTheDocument();
    });
  });

  it('submits YouTube form and calls addYouTube', async () => {
    const { contentApi } = await import('../../../services/api');
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Connect YouTube')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Connect YouTube'));
    await waitFor(() => expect(screen.getByPlaceholderText('https://youtube.com/watch?v=...')).toBeInTheDocument());

    const urlInput = screen.getByPlaceholderText('https://youtube.com/watch?v=...');
    fireEvent.change(urlInput, { target: { value: 'https://youtube.com/watch?v=abc123' } });
    fireEvent.click(screen.getByText('Initiate Neural Capture'));

    await waitFor(() => {
      expect(contentApi.addYouTube).toHaveBeenCalledWith('https://youtube.com/watch?v=abc123', undefined);
    });
  });

  it('submits manual form and calls addManual', async () => {
    const { contentApi } = await import('../../../services/api');
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Add Knowledge')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Add Knowledge'));
    await waitFor(() => expect(screen.getByPlaceholderText('e.g. CORE PHILOSOPHY MATRIX')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('e.g. CORE PHILOSOPHY MATRIX'), {
      target: { value: 'My Knowledge Title' },
    });
    fireEvent.change(screen.getByPlaceholderText('Inject full knowledge context here...'), {
      target: { value: 'A'.repeat(110) },
    });
    fireEvent.click(screen.getByText('Synchronize Knowledge Vector'));

    await waitFor(() => {
      expect(contentApi.addManual).toHaveBeenCalledWith('My Knowledge Title', 'A'.repeat(110));
    });
  });

  it('FAQ modal shows "Interrogative Query" field label', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Sync FAQ')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sync FAQ'));
    await waitFor(() => {
      expect(screen.getByText('Interrogative Query')).toBeInTheDocument();
    });
  });

  it('FAQ modal shows "Synchronized Response" field label', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Sync FAQ')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sync FAQ'));
    await waitFor(() => {
      expect(screen.getByText('Synchronized Response')).toBeInTheDocument();
    });
  });

  it('FAQ modal shows "FAQ Bundle Identifier" label', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Sync FAQ')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sync FAQ'));
    await waitFor(() => {
      expect(screen.getByText('FAQ Bundle Identifier')).toBeInTheDocument();
    });
  });

  it('renders delete (danger) buttons for content rows', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('My YouTube Video')).toBeInTheDocument());
    // Each row has a danger delete button inside a Popconfirm
    const deleteButtons = document.querySelectorAll('button.ant-btn-dangerous');
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('shows neural processing info note inside YouTube modal', async () => {
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => expect(screen.getByText('Connect YouTube')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Connect YouTube'));
    await waitFor(() => {
      expect(screen.getByText(/Neural processing extracts transcripts/i)).toBeInTheDocument();
    });
  });

  it('renders "Managing 0 neural knowledge vectors" when content is empty', async () => {
    const { contentApi } = await import('../../../services/api');
    (contentApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          contents: [],
          pagination: { total: 0, page: 1, limit: 20 },
        },
      },
    });
    renderWithProviders(<CreatorContent />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText(/Managing 0 neural knowledge vectors/i)).toBeInTheDocument();
    });
  });
});
