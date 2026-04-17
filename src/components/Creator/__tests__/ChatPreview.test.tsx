import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import ChatPreview from '../ChatPreview';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('ChatPreview', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders Sample Conversation heading', () => {
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Test Creator" />
    );
    expect(screen.getByText('Sample Conversation')).toBeInTheDocument();
  });

  it('shows empty message when no preview available', () => {
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Test Creator" />
    );
    expect(screen.getByText('No preview available yet.')).toBeInTheDocument();
  });

  it('renders welcome message as assistant message', () => {
    renderWithProviders(
      <ChatPreview
        creatorId="c-1"
        creatorName="Test Creator"
        welcomeMessage="Hello! How can I help you?"
      />
    );
    expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
  });

  it('renders sample messages', () => {
    const messages = [
      { role: 'user' as const, content: 'What is AI?' },
      { role: 'assistant' as const, content: 'AI is artificial intelligence.' },
    ];
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Test Creator" sampleMessages={messages} />
    );
    expect(screen.getByText('What is AI?')).toBeInTheDocument();
    expect(screen.getByText('AI is artificial intelligence.')).toBeInTheDocument();
  });

  it('navigates to chat on Start Real Conversation click', () => {
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Test Creator" />
    );
    fireEvent.click(screen.getByText('Start Real Conversation'));
    expect(mockNavigate).toHaveBeenCalledWith('/chat/c-1');
  });

  it('toggles Show More / Show Less', () => {
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Test Creator" />
    );
    expect(screen.getByText('Show More')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Show More'));
    expect(screen.getByText('Show Less')).toBeInTheDocument();
  });
});
