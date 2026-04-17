import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const mockGetById = vi.fn().mockResolvedValue({
  data: {
    data: {
      id: 'c1',
      displayName: 'Test Creator',
      tagline: 'Fitness Expert',
      about: 'I help people get fit',
      category: 'Fitness',
      isVerified: true,
      profileImage: '/img.png',
      coverImage: '/cover.png',
      rating: 4.5,
      totalChats: 200,
      followersCount: 500,
      socialLinks: {},
      faqs: [],
    },
  },
});

vi.mock('../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  creatorApi: {
    getById: mockGetById,
    getContent: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
  postApi: { getByCreator: vi.fn().mockResolvedValue({ data: { data: { posts: [] } } }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../../styles/tokens', () => ({
  colors: {
    primary: { solid: '#1268FF', subtle: '#E8F0FE', gradient: 'linear-gradient(135deg, #1268FF, #7C3AED)' },
    text: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF' },
    gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB' },
    success: { solid: '#10B981' },
  },
  typography: { fontWeight: { bold: 700 }, fontSize: {} },
  spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px' },
  shadows: { sm: 'none', md: 'none', lg: 'none', xl: 'none' },
  borderRadius: {},
}));

vi.mock('../../styles/animations', () => ({
  pageVariants: {},
  fadeIn: {},
  slideUp: {},
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: vi.fn(() => true),
  useScroll: vi.fn(() => ({ scrollY: { get: () => 0 } })),
  useTransform: vi.fn(() => 0),
}));

vi.mock('../../components/common/Card/CustomCard', () => ({
  default: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('../../components/common/Button/CustomButton', () => ({
  default: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('../../components/common/Loading/Skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

vi.mock('../../components/common/EmptyState/EmptyState', () => ({
  EmptyState: () => <div>No data</div>,
}));

vi.mock('../../components/Follow', () => ({
  FollowButton: () => <button>Follow</button>,
}));

vi.mock('../../components/Post', () => ({
  PostCard: () => <div>Post</div>,
  PostData: null,
}));

vi.mock('../../components/Creator/ChatPreview', () => ({
  ChatPreview: () => <div>Chat Preview</div>,
}));

vi.mock('../../components/Creator/CreatorContentGallery', () => ({
  CreatorContentGallery: () => <div>Content Gallery</div>,
}));

vi.mock('../../components/Creator/CreatorStats', () => ({
  CreatorStats: () => <div>Creator Stats</div>,
}));

vi.mock('../../components/Creator/FAQAccordion', () => ({
  FAQAccordion: () => <div>FAQ</div>,
}));

vi.mock('../../components/Creator/CreatorReviews', () => ({
  default: () => <div>Reviews</div>,
}));

vi.mock('../../components/Social/ShareDialog', () => ({
  ShareDialog: () => null,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: 'c1' })),
  };
});

import CreatorProfile from '../CreatorProfile';

describe('CreatorProfile', () => {
  it('renders without crashing', () => {
    renderWithProviders(<CreatorProfile />);
    // Skeleton shows while loading
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders creator name after data loads', async () => {
    renderWithProviders(<CreatorProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
  });

  it('calls getById with correct id', () => {
    renderWithProviders(<CreatorProfile />);
    expect(mockGetById).toHaveBeenCalledWith('c1');
  });
});
