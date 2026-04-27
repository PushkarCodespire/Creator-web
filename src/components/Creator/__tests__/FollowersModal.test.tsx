vi.mock('../../../services/api', () => ({
  creatorApi: {
    getFollowers: vi.fn().mockResolvedValue({
      data: { data: { followers: [], total: 0 } },
    }),
    removeFollower: vi.fn().mockResolvedValue({ data: {} }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { FollowersModal } from '../FollowersModal';

describe('FollowersModal', () => {
  it('renders when not visible', () => {
    const { container } = renderWithProviders(
      <FollowersModal visible={false} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders when visible', () => {
    const { container } = renderWithProviders(
      <FollowersModal visible={true} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });
});
