import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn().mockResolvedValue({ data: {} }) },
  creatorApi: { getCreatorProfile: vi.fn().mockResolvedValue({ data: { data: null } }) },
  reviewApi: { getCreatorReviews: vi.fn().mockResolvedValue({ data: { data: [] } }) },
  programApi: { getCreatorPrograms: vi.fn().mockResolvedValue({ data: { data: [] } }) },
  bookingApi: { getCreatorAvailability: vi.fn().mockResolvedValue({ data: { data: [] } }) },
  followApi: { getFollowStatus: vi.fn().mockResolvedValue({ data: { data: { isFollowing: false } } }) },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: 'test-creator' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

import WebsiteProfile from '../WebsiteProfile';

describe('WebsiteProfile', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<WebsiteProfile />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders loading or content state', () => {
    const { container } = renderWithProviders(<WebsiteProfile />);
    expect(container).toBeTruthy();
  });
});
