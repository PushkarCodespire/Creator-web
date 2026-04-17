import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { CreatorCard } from '../CreatorCard';
import type { Creator } from '../../../types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../services/api', () => ({
  getImageUrl: (url: string) => `http://localhost:5000${url}`,
}));

const mockCreator: Creator = {
  id: 'creator-1',
  displayName: 'John Doe',
  bio: 'Test bio',
  tagline: 'Expert in AI',
  profileImage: '/uploads/avatar.jpg',
  category: 'Technology',
  tags: ['AI', 'ML'],
  isVerified: true,
  totalChats: 42,
  rating: 4.5,
};

describe('CreatorCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders creator display name and tagline', () => {
    renderWithProviders(<CreatorCard creator={mockCreator} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Expert in AI')).toBeInTheDocument();
  });

  it('renders rating badge', () => {
    renderWithProviders(<CreatorCard creator={mockCreator} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('renders category badge and chat count', () => {
    renderWithProviders(<CreatorCard creator={mockCreator} />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('42 chats')).toBeInTheDocument();
  });

  it('navigates to creator page on card click', () => {
    renderWithProviders(<CreatorCard creator={mockCreator} />);
    // Click the outer card div (not the button)
    fireEvent.click(screen.getByText('John Doe'));
    expect(mockNavigate).toHaveBeenCalledWith('/creator/creator-1');
  });

  it('navigates to chat on Start Chat button click', () => {
    renderWithProviders(<CreatorCard creator={mockCreator} />);
    fireEvent.click(screen.getByText('Start Chat'));
    expect(mockNavigate).toHaveBeenCalledWith('/chat/creator-1');
  });

  it('shows "New" when rating is missing', () => {
    const noRatingCreator = { ...mockCreator, rating: undefined };
    renderWithProviders(<CreatorCard creator={noRatingCreator} />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });
});
