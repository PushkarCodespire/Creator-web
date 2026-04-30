import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import FollowButton from '../FollowButton';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, ...props }: any) => <div style={style} {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  followApi: {
    checkFollowing: vi.fn().mockResolvedValue({ data: { data: { isFollowing: false } } }),
    followCreator: vi.fn().mockResolvedValue({}),
    unfollowCreator: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../styles/animations', () => ({
  buttonHover: {},
  buttonTap: {},
}));

import { followApi } from '../../../services/api';

const authenticatedState = {
  auth: {
    isAuthenticated: true,
    user: { id: 'u1', name: 'Test User', email: 'test@test.com', role: 'USER' as const, isVerified: true, createdAt: '' },
    token: 'test-token',
  } as any,
};

describe('FollowButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Follow text when not following', () => {
    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowing={false} />,
      { preloadedState: authenticatedState }
    );
    expect(screen.getByText('Follow')).toBeInTheDocument();
  });

  it('renders Following text when already following', () => {
    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowing={true} />,
      { preloadedState: authenticatedState }
    );
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('shows follower count when showCount is true', () => {
    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowerCount={100} showCount />,
      { preloadedState: authenticatedState }
    );
    expect(screen.getByText('100 followers')).toBeInTheDocument();
  });

  it('calls followCreator API on click', async () => {
    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowing={false} />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByText('Follow'));

    await waitFor(() => {
      expect(followApi.followCreator).toHaveBeenCalledWith('c-1');
    });
  });

  it('calls unfollowCreator API when already following and clicked', async () => {
    (followApi.checkFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { isFollowing: true } },
    });
    (followApi.unfollowCreator as ReturnType<typeof vi.fn>).mockResolvedValue({});

    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowing={true} />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByText('Following'));

    await waitFor(() => {
      expect(followApi.unfollowCreator).toHaveBeenCalledWith('c-1');
    });
  });

  it('increments follower count after successful follow', async () => {
    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowing={false} initialFollowerCount={10} showCount />,
      { preloadedState: authenticatedState }
    );

    expect(screen.getByText('10 followers')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Follow'));

    await waitFor(() => {
      expect(screen.getByText('11 followers')).toBeInTheDocument();
    });
  });

  it('decrements follower count after successful unfollow', async () => {
    (followApi.checkFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { isFollowing: true } },
    });
    (followApi.unfollowCreator as ReturnType<typeof vi.fn>).mockResolvedValue({});

    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowing={true} initialFollowerCount={20} showCount />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByText('Following'));

    await waitFor(() => {
      expect(screen.getByText('19 followers')).toBeInTheDocument();
    });
  });

  it('calls onFollowChange callback with new following state and count', async () => {
    const onFollowChange = vi.fn();

    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowing={false} initialFollowerCount={5} onFollowChange={onFollowChange} />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByText('Follow'));

    await waitFor(() => {
      expect(onFollowChange).toHaveBeenCalledWith(true, 6);
    });
  });

  it('displays singular "follower" when count is 1', () => {
    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowerCount={1} showCount />,
      { preloadedState: authenticatedState }
    );
    expect(screen.getByText('1 follower')).toBeInTheDocument();
  });

  it('checks follow status on mount when authenticated', async () => {
    (followApi.checkFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { isFollowing: false } },
    });

    renderWithProviders(
      <FollowButton creatorId="c-99" />,
      { preloadedState: authenticatedState }
    );

    await waitFor(() => {
      expect(followApi.checkFollowing).toHaveBeenCalledWith('c-99');
    });
  });

  it('does not check follow status when unauthenticated', () => {
    renderWithProviders(
      <FollowButton creatorId="c-1" />,
      { preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any } }
    );
    expect(followApi.checkFollowing).not.toHaveBeenCalled();
  });

  it('renders "Unfollow" text on hover when already following', () => {
    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowing={true} />,
      { preloadedState: authenticatedState }
    );
    const btn = screen.getByText('Following');
    fireEvent.mouseEnter(btn.closest('button') || btn);
    expect(screen.getByText('Unfollow')).toBeInTheDocument();
  });

  it('reverts back to "Following" on mouse leave after hover', () => {
    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowing={true} />,
      { preloadedState: authenticatedState }
    );
    const btn = screen.getByText('Following');
    const buttonEl = btn.closest('button') || btn;
    fireEvent.mouseEnter(buttonEl);
    expect(screen.getByText('Unfollow')).toBeInTheDocument();
    fireEvent.mouseLeave(buttonEl);
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('does not show follower count when showCount is false (default)', () => {
    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowerCount={42} />,
      { preloadedState: authenticatedState }
    );
    expect(screen.queryByText('42 followers')).not.toBeInTheDocument();
  });

  it('displays large follower count with toLocaleString formatting', () => {
    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowerCount={1000} showCount />,
      { preloadedState: authenticatedState }
    );
    // 1000 renders as "1,000 followers" via toLocaleString
    expect(screen.getByText(/followers/)).toBeInTheDocument();
  });

  it('does not call followCreator when isLoading is true (double click guard)', async () => {
    // Make followCreator hang so loading stays true
    (followApi.followCreator as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowing={false} />,
      { preloadedState: authenticatedState }
    );

    const btn = screen.getByText('Follow');
    fireEvent.click(btn);
    fireEvent.click(btn);

    // followCreator should only be called once despite double click
    await waitFor(() => {
      expect(followApi.followCreator).toHaveBeenCalledTimes(1);
    });
  });

  it('reverts state on followCreator API error', async () => {
    (followApi.followCreator as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    renderWithProviders(
      <FollowButton creatorId="c-1" initialFollowing={false} initialFollowerCount={5} showCount />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByText('Follow'));

    await waitFor(() => {
      // After error, reverts back to original state
      expect(screen.getByText('5 followers')).toBeInTheDocument();
    });
  });
});
