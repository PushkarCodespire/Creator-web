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

});
