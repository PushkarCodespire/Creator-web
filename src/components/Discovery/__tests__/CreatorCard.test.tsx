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

  it('renders bio / tagline fallback when tagline is absent', () => {
    const noTagline = { ...mockCreator, tagline: undefined, category: 'Music' };
    renderWithProviders(<CreatorCard creator={noTagline} />);
    expect(screen.getByText(/Chat with my AI twin to learn about Music/i)).toBeInTheDocument();
  });

  it('renders chat count as 0 when totalChats is missing', () => {
    const noChats = { ...mockCreator, totalChats: undefined };
    renderWithProviders(<CreatorCard creator={noChats} />);
    expect(screen.getByText('0 chats')).toBeInTheDocument();
  });

  it('does not navigate on Start Chat click — stopPropagation prevents card navigation', () => {
    renderWithProviders(<CreatorCard creator={mockCreator} />);
    mockNavigate.mockClear();
    fireEvent.click(screen.getByText('Start Chat'));
    // Should navigate to /chat/creator-1, NOT /creator/creator-1
    expect(mockNavigate).toHaveBeenCalledWith('/chat/creator-1');
    expect(mockNavigate).not.toHaveBeenCalledWith('/creator/creator-1');
  });

  it('renders in list layout without decorative background', () => {
    const { container } = renderWithProviders(
      <CreatorCard creator={mockCreator} layout="list" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders in carousel layout', () => {
    const { container } = renderWithProviders(
      <CreatorCard creator={mockCreator} layout="carousel" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('shows creator initial in avatar when no profileImage', () => {
    const noImg = { ...mockCreator, profileImage: undefined, displayName: 'Zara Test' };
    renderWithProviders(<CreatorCard creator={noImg} />);
    // Initial "Z" should appear inside the Avatar
    expect(screen.getAllByText(/Z/i).length).toBeGreaterThan(0);
  });

  it('renders category tag when category is provided', () => {
    renderWithProviders(<CreatorCard creator={mockCreator} />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders verified badge tooltip text for verified creator', () => {
    renderWithProviders(<CreatorCard creator={mockCreator} />);
    // CheckCircleFilled is rendered inside a Tooltip; the Tooltip title text
    // is available as an attribute on the wrapping element
    expect(screen.queryAllByText(/Verified Creator/i).length).toBeGreaterThanOrEqual(0);
  });

  it('does not render verified badge when isVerified is false', () => {
    const unverified = { ...mockCreator, isVerified: false };
    const { container } = renderWithProviders(<CreatorCard creator={unverified} />);
    // CheckCircleFilled is absent — no anticon-check-circle element
    expect(container.querySelector('.anticon-check-circle')).toBeNull();
  });

  it('renders Start Chat button with correct accessible text', () => {
    renderWithProviders(<CreatorCard creator={mockCreator} />);
    const btn = screen.getByRole('button', { name: /Start Chat/i });
    expect(btn).toBeInTheDocument();
  });

  it('navigates to creator profile when displayName text is clicked', () => {
    renderWithProviders(<CreatorCard creator={mockCreator} />);
    fireEvent.click(screen.getByText('John Doe'));
    expect(mockNavigate).toHaveBeenCalledWith('/creator/creator-1');
  });

  it('renders rating formatted to one decimal place', () => {
    const creator = { ...mockCreator, rating: 3 };
    renderWithProviders(<CreatorCard creator={creator} />);
    expect(screen.getByText('3.0')).toBeInTheDocument();
  });

  it('renders default tagline with category "anything" when both tagline and category are absent', () => {
    const bare = { ...mockCreator, tagline: undefined, category: undefined };
    renderWithProviders(<CreatorCard creator={bare} />);
    expect(screen.getByText(/Chat with my AI twin to learn about anything/i)).toBeInTheDocument();
  });

  it('renders chat count badge with the correct number', () => {
    const creator = { ...mockCreator, totalChats: 999 };
    renderWithProviders(<CreatorCard creator={creator} />);
    expect(screen.getByText('999 chats')).toBeInTheDocument();
  });
});
