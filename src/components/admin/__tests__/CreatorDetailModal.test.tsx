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

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { adminApi } from '../../../services/api';

const mockCreatorResponse = {
  data: {
    data: {
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
        youtubeUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        websiteUrl: '',
      },
      analytics: {
        contentCount: 10,
        conversationCount: 50,
        messageCount: 200,
      },
    },
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

  it('calls getCreator when opened with a creatorId', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(adminApi.getCreator).toHaveBeenCalledWith('c-1');
    });
  });

  it('renders the modal with creator display name after data loads', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
  });

  it('calls getCreatorContents when opened', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(adminApi.getCreatorContents).toHaveBeenCalledWith('c-1', expect.any(Object));
    });
  });

  it('calls getUserModerationHistory with the creator userId', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(adminApi.getUserModerationHistory).toHaveBeenCalledWith('u-1');
    });
  });

  it('shows a loading spinner while fetching', () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    // Ant Design Spin renders while loading is true
    const spinner = document.querySelector('.ant-spin');
    expect(spinner).toBeTruthy();
  });

  it('resets state and does not fetch when closed', () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId={null} visible={false} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(adminApi.getCreator).not.toHaveBeenCalled();
  });

  it('renders analytics stats after data loads', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      // contentCount = 10, conversationCount = 50, messageCount = 200
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    });
  });

  it('renders VERIFIED and ACTIVE tags when creator is verified and active', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('VERIFIED')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });
  });

  it('renders the Overview, Content Portfolio and Compliance Logs tabs', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Content Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Compliance Logs')).toBeInTheDocument();
    });
  });

  it('renders Update Profile and Verify Creator buttons in the overview tab', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Update Profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verify Creator/i })).toBeInTheDocument();
    });
  });

  it('calls verifyCreator when Verify Creator button is clicked', async () => {
    const unverifiedResponse = {
      data: {
        data: {
          creator: { ...mockCreatorResponse.data.data.creator, isVerified: false },
          analytics: mockCreatorResponse.data.data.analytics,
        },
      },
    };
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(unverifiedResponse);
    (adminApi.verifyCreator as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } });

    const { fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Verify Creator/i })).toBeInTheDocument();
    });

    fe.click(screen.getByRole('button', { name: /Verify Creator/i }));

    await waitFor(() => {
      expect(adminApi.verifyCreator).toHaveBeenCalledWith('c-1');
    });
  });

  it('shows no moderation logs message in Compliance Logs tab', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    const { fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Compliance Logs')).toBeInTheDocument();
    });

    fe.click(screen.getByText('Compliance Logs'));

    await waitFor(() => {
      expect(screen.getByText(/No moderation logs found/i)).toBeInTheDocument();
    });
  });

  it('renders "No reports found" text in Compliance Logs tab when reportsAgainst is empty', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    const { fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Compliance Logs')).toBeInTheDocument();
    });

    fe.click(screen.getByText('Compliance Logs'));

    await waitFor(() => {
      expect(screen.getByText(/No reports found against this creator/i)).toBeInTheDocument();
    });
  });

  it('renders UNVERIFIED tag when creator is not verified', async () => {
    const unverifiedResponse = {
      data: {
        data: {
          creator: { ...mockCreatorResponse.data.data.creator, isVerified: false },
          analytics: mockCreatorResponse.data.data.analytics,
        },
      },
    };
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(unverifiedResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('UNVERIFIED')).toBeInTheDocument();
    });
  });

  it('renders INACTIVE tag when creator isActive is false', async () => {
    const inactiveResponse = {
      data: {
        data: {
          creator: { ...mockCreatorResponse.data.data.creator, isActive: false },
          analytics: mockCreatorResponse.data.data.analytics,
        },
      },
    };
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(inactiveResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('INACTIVE')).toBeInTheDocument();
    });
  });

  it('renders Deactivate button when creator isActive=true', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Deactivate/i })).toBeInTheDocument();
    });
  });

  it('renders Activate button when creator isActive=false', async () => {
    const inactiveResponse = {
      data: {
        data: {
          creator: { ...mockCreatorResponse.data.data.creator, isActive: false },
          analytics: mockCreatorResponse.data.data.analytics,
        },
      },
    };
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(inactiveResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Activate/i })).toBeInTheDocument();
    });
  });

  it('Verify Creator button is disabled when creator is already verified', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Verify Creator/i });
      expect(btn).toBeDisabled();
    });
  });

  it('renders category value from creator data in the form', async () => {
    (adminApi.getCreator as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatorResponse);

    renderWithProviders(
      <CreatorDetailModal creatorId="c-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      // category is "Tech" from mockCreatorResponse
      expect(screen.getByDisplayValue('Tech')).toBeInTheDocument();
    });
  });
});
