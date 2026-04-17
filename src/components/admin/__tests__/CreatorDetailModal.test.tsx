import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CreatorDetailModal from '../CreatorDetailModal';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getCreator: vi.fn(),
    getCreatorContents: vi.fn().mockResolvedValue({
      data: { data: { contents: [], pagination: { page: 1, total: 0 } } },
    }),
    getUserModerationHistory: vi.fn().mockResolvedValue({
      data: { data: { moderationLogs: [], reportsAgainst: [] } },
    }),
    updateCreator: vi.fn(),
    verifyCreator: vi.fn(),
    rejectCreator: vi.fn(),
    setCreatorActive: vi.fn(),
    updateContentStatus: vi.fn(),
    deleteContent: vi.fn(),
  },
}));

import { adminApi } from '../../../services/api';

const mockCreator = {
  creator: {
    id: 'c-1',
    userId: 'u-1',
    displayName: 'Test Creator',
    bio: 'A great creator',
    tagline: 'Best tagline',
    category: 'Tech',
    tags: ['AI'],
    isVerified: true,
    isActive: true,
  },
  analytics: {
    contentCount: 10,
    conversationCount: 50,
    messageCount: 200,
  },
};

describe('CreatorDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render content when not visible', () => {
    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={false} onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
  });

  it('shows loading spinner while fetching', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    // Loading state renders a Spin
    expect(screen.getByText('Loading creator...')).toBeInTheDocument();
  });

  it('renders creator details after loading', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockCreator },
    });

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('renders tabs for Overview, Content, and History', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockCreator },
    });

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
    expect(screen.getByText('Content Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Compliance Logs')).toBeInTheDocument();
  });
});
