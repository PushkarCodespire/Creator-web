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
});
