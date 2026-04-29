vi.mock('../../../services/api', () => ({
  getImageUrl: vi.fn((x: string) => x),
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ChatInfoPanel } from '../ChatInfoPanel';

const mockCreator = {
  id: '1',
  displayName: 'Test Creator',
  profileImage: '/img.jpg',
  bio: 'A great creator',
  category: 'Tech',
  isVerified: true,
  username: 'testcreator',
  userId: 'u1',
  subscribers: 100,
  messagePrice: 5,
  isActive: true,
  createdAt: '',
};

import { screen, fireEvent } from '@testing-library/react';

describe('ChatInfoPanel', () => {
  it('renders null when collapsed', () => {
    const { container } = renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when not collapsed', () => {
    const { container } = renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with null creator', () => {
    const { container } = renderWithProviders(
      <ChatInfoPanel creator={null} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders creator display name when not collapsed', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('Test Creator')).toBeInTheDocument();
  });

  it('renders creator category when not collapsed', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('Tech')).toBeInTheDocument();
  });

  it('renders Follow button when not collapsed', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('Follow')).toBeInTheDocument();
  });

  it('renders About section when not collapsed', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders creator bio text when provided', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('A great creator')).toBeInTheDocument();
  });

  it('renders fallback bio when creator has no bio', () => {
    const creatorNoBio = { ...mockCreator, bio: undefined };
    renderWithProviders(
      <ChatInfoPanel creator={creatorNoBio as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText(/AI-powered mentorship/i)).toBeInTheDocument();
  });

  it('renders stats: followers, rating, and chats counts', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('2.5K')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
  });

  it('calls onSendMessage with FAQ question when FAQ item is clicked', () => {
    const onSend = vi.fn();
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={onSend} isCollapsed={false} />
    );
    fireEvent.click(screen.getByText('What are your core services?'));
    expect(onSend).toHaveBeenCalledWith('What are your core services?');
  });

  it('renders related content resources section', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('React Tutorial 2024')).toBeInTheDocument();
    expect(screen.getByText('Clean Code Guide')).toBeInTheDocument();
  });

  it('renders fallback category text when creator has no category', () => {
    const creatorNoCategory = { ...mockCreator, category: undefined };
    renderWithProviders(
      <ChatInfoPanel creator={creatorNoCategory as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('Expert Creator')).toBeInTheDocument();
  });

  it('renders all three FAQ items', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('What are your core services?')).toBeInTheDocument();
    expect(screen.getByText('Pricing for custom projects?')).toBeInTheDocument();
    expect(screen.getByText('How to get started?')).toBeInTheDocument();
  });

  it('calls onSendMessage with second FAQ question when clicked', () => {
    const onSend = vi.fn();
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={onSend} isCollapsed={false} />
    );
    fireEvent.click(screen.getByText('Pricing for custom projects?'));
    expect(onSend).toHaveBeenCalledWith('Pricing for custom projects?');
  });

  it('calls onSendMessage with third FAQ question when clicked', () => {
    const onSend = vi.fn();
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={onSend} isCollapsed={false} />
    );
    fireEvent.click(screen.getByText('How to get started?'));
    expect(onSend).toHaveBeenCalledWith('How to get started?');
  });

  it('renders skill tags React, Node.js, TypeScript', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders Resources section heading', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });

  it('renders Quick FAQs section heading', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('Quick FAQs')).toBeInTheDocument();
  });

  it('renders Followers stat label', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('Followers')).toBeInTheDocument();
  });

  it('renders Rating and Chats stat labels', () => {
    renderWithProviders(
      <ChatInfoPanel creator={mockCreator as any} onSendMessage={vi.fn()} isCollapsed={false} />
    );
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Chats')).toBeInTheDocument();
  });
});
