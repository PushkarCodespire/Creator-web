import { render, screen } from '@testing-library/react';
import StreamingMessage from '../../Chat/StreamingMessage';

describe('StreamingMessage', () => {
  it('renders message content', () => {
    render(<StreamingMessage content="Hello, I am generating a response..." />);
    expect(screen.getByText('Hello, I am generating a response...')).toBeInTheDocument();
  });

  it('shows typing indicator', () => {
    render(<StreamingMessage content="Thinking..." />);
    expect(screen.getByText('AI is typing...')).toBeInTheDocument();
  });

  it('renders creator avatar initial when no avatar image', () => {
    render(
      <StreamingMessage
        content="Response text"
        creatorName="Alice"
      />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders avatar image when creatorAvatar is provided', () => {
    render(
      <StreamingMessage
        content="Response text"
        creatorAvatar="https://example.com/avatar.jpg"
        creatorName="Bob"
      />
    );

    const avatar = document.querySelector('img');
    expect(avatar).toBeTruthy();
    expect(avatar!.getAttribute('src')).toBe('https://example.com/avatar.jpg');
  });

  it('applies streaming CSS classes', () => {
    const { container } = render(<StreamingMessage content="text" />);

    expect(container.querySelector('.streaming')).toBeTruthy();
    expect(container.querySelector('.streaming-bubble')).toBeTruthy();
    expect(container.querySelector('.streaming-cursor')).toBeTruthy();
  });

  it('renders empty content without crashing', () => {
    render(<StreamingMessage content="" />);
    expect(screen.getByText('AI is typing...')).toBeInTheDocument();
  });
});
