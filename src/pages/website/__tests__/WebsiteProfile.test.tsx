import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const mockGetById = vi.fn().mockResolvedValue({
  data: {
    data: {
      id: 'c1',
      displayName: 'Test Creator',
      tagline: 'Fitness Coach',
      about: 'Expert in fitness',
      category: 'Fitness',
      isVerified: true,
      profileImage: '/img.png',
      rating: 4.5,
      totalChats: 100,
      faqs: [{ question: 'Q1', answer: 'A1' }],
    },
  },
});

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  creatorApi: { getById: mockGetById },
  reviewApi: {
    getByCreator: vi.fn().mockResolvedValue({ data: { data: { reviews: [] } } }),
    create: vi.fn().mockResolvedValue({ data: {} }),
  },
  programApi: {
    getByCreator: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
  bookingApi: {
    getPublicSlots: vi.fn().mockResolvedValue({ data: { data: [] } }),
    requestBooking: vi.fn().mockResolvedValue({ data: {} }),
  },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ creatorId: 'c1' })),
  };
});

import WebsiteProfile from '../WebsiteProfile';

describe('WebsiteProfile', () => {
  it('renders without crashing', () => {
    renderWithProviders(<WebsiteProfile />);
    // Loading state initially
    expect(document.querySelector('[class]')).toBeTruthy();
  });

  it('renders creator profile after load', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
  });

  it('calls getById API with correct id', () => {
    renderWithProviders(<WebsiteProfile />);
    expect(mockGetById).toHaveBeenCalledWith('c1');
  });
});
