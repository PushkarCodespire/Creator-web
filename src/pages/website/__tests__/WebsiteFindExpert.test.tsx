import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const mockGetAll = vi.fn().mockResolvedValue({
  data: {
    data: {
      creators: [
        { id: '1', displayName: 'TestCreator', category: 'Fitness', isVerified: true, profileImage: '/img.png' },
      ],
    },
  },
});

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  creatorApi: { getAll: mockGetAll },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../data/creators-data', () => ({
  CREATORS: [
    { id: 'c1', name: 'Demo Creator', slug: 'demo', cardImg: '/card.png' },
  ],
}));

import WebsiteFindExpert from '../WebsiteFindExpert';

describe('WebsiteFindExpert', () => {
  beforeEach(() => {
    mockGetAll.mockClear();
  });

  it('renders without crashing', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText(/Get the right advice/i)).toBeInTheDocument();
  });

  it('renders hero section with search bar', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByPlaceholderText(/What do you need help with/i)).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders category filter buttons', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Fat Loss')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText('Loading creators...')).toBeInTheDocument();
  });

  it('renders creators after data loads', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    await waitFor(() => {
      expect(screen.getByText('TestCreator')).toBeInTheDocument();
    });
  });

  it('renders featured experts section', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText('Featured Experts')).toBeInTheDocument();
  });

  it('renders bottom CTA section', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText(/Connect with the world/i)).toBeInTheDocument();
    expect(screen.getByText('Get Started for Free')).toBeInTheDocument();
  });

  it('calls API with default params on mount', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(mockGetAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, sortBy: 'popular' }),
    );
  });
});
