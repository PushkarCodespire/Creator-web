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

  it('clicking Show Less after Show More returns to Show More', () => {
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Test Creator" />
    );
    fireEvent.click(screen.getByText('Show More'));
    fireEvent.click(screen.getByText('Show Less'));
    expect(screen.getByText('Show More')).toBeInTheDocument();
  });

  it('renders Start Real Conversation button', () => {
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Test Creator" />
    );
    expect(screen.getByText('Start Real Conversation')).toBeInTheDocument();
  });

  it('renders creator first-letter avatar for assistant messages', () => {
    renderWithProviders(
      <ChatPreview
        creatorId="c-1"
        creatorName="Alice"
        welcomeMessage="Hi there!"
      />
    );
    // Avatar shows first letter of creatorName
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders "U" avatar for user messages', () => {
    const messages = [{ role: 'user' as const, content: 'A user question' }];
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Bob" sampleMessages={messages} />
    );
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('prefers sampleMessages over welcomeMessage when both supplied', () => {
    const messages = [{ role: 'assistant' as const, content: 'From samples' }];
    renderWithProviders(
      <ChatPreview
        creatorId="c-1"
        creatorName="Test Creator"
        welcomeMessage="From welcome"
        sampleMessages={messages}
      />
    );
    expect(screen.getByText('From samples')).toBeInTheDocument();
    expect(screen.queryByText('From welcome')).not.toBeInTheDocument();
  });

  it('navigates to the correct creatorId path', () => {
    renderWithProviders(
      <ChatPreview creatorId="creator-42" creatorName="Test Creator" />
    );
    fireEvent.click(screen.getByText('Start Real Conversation'));
    expect(mockNavigate).toHaveBeenCalledWith('/chat/creator-42');
  });

  it('renders first letter of multi-word creator name in avatar', () => {
    renderWithProviders(
      <ChatPreview
        creatorId="c-1"
        creatorName="Zoe Smith"
        welcomeMessage="Hi!"
      />
    );
    expect(screen.getByText('Z')).toBeInTheDocument();
  });

  it('renders multiple assistant and user message bubbles', () => {
    const messages = [
      { role: 'assistant' as const, content: 'Welcome!' },
      { role: 'user' as const, content: 'Thanks!' },
      { role: 'assistant' as const, content: 'How can I help?' },
    ];
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Test Creator" sampleMessages={messages} />
    );
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByText('Thanks!')).toBeInTheDocument();
    expect(screen.getByText('How can I help?')).toBeInTheDocument();
  });

  it('Start Real Conversation button is rendered as a button element', () => {
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Test Creator" />
    );
    const btn = screen.getByText('Start Real Conversation').closest('button');
    expect(btn).toBeTruthy();
  });

  it('shows empty state and Start Real Conversation when no messages and no welcomeMessage', () => {
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Test Creator" />
    );
    expect(screen.getByText('No preview available yet.')).toBeInTheDocument();
    expect(screen.getByText('Start Real Conversation')).toBeInTheDocument();
  });

  it('Show More button is rendered as a link-type button', () => {
    renderWithProviders(
      <ChatPreview creatorId="c-1" creatorName="Test Creator" />
    );
    const showMoreBtn = screen.getByText('Show More').closest('button');
    expect(showMoreBtn).toBeTruthy();
  });
});
