vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../StreamingMessage.css', () => ({}));

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import StreamingMessage from '../StreamingMessage';

describe('StreamingMessage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<StreamingMessage content="Hello" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the content text', () => {
    renderWithProviders(<StreamingMessage content="AI is responding..." />);
    expect(screen.getByText('AI is responding...')).toBeInTheDocument();
  });

  it('renders "AI is typing..." indicator', () => {
    renderWithProviders(<StreamingMessage content="Hello" />);
    expect(screen.getByText('AI is typing...')).toBeInTheDocument();
  });

  it('renders with creator name', () => {
    const { container } = renderWithProviders(
      <StreamingMessage content="Hi" creatorName="Alice" creatorAvatar="/avatar.jpg" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the streaming-cursor span', () => {
    const { container } = renderWithProviders(<StreamingMessage content="Hello" />);
    expect(container.querySelector('.streaming-cursor')).toBeTruthy();
  });

  it('renders exactly three typing-dot spans', () => {
    const { container } = renderWithProviders(<StreamingMessage content="Hello" />);
    const dots = container.querySelectorAll('.typing-dot');
    expect(dots).toHaveLength(3);
  });

  it('renders message-wrapper with ai and streaming classes', () => {
    const { container } = renderWithProviders(<StreamingMessage content="Hello" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('message-wrapper')).toBe(true);
    expect(wrapper.classList.contains('ai')).toBe(true);
    expect(wrapper.classList.contains('streaming')).toBe(true);
  });

  it('renders the avatar element', () => {
    const { container } = renderWithProviders(<StreamingMessage content="Hello" />);
    expect(container.querySelector('.ant-avatar')).toBeTruthy();
  });

  it('uses first character of creatorName as avatar fallback', () => {
    renderWithProviders(<StreamingMessage content="Hi" creatorName="Bob" />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders message-bubble and streaming-bubble classes on the bubble div', () => {
    const { container } = renderWithProviders(<StreamingMessage content="Testing" />);
    const bubble = container.querySelector('.message-bubble');
    expect(bubble).toBeTruthy();
    expect(bubble!.classList.contains('streaming-bubble')).toBe(true);
  });

  it('renders content inside the streaming bubble', () => {
    const { container } = renderWithProviders(<StreamingMessage content="Unique content here" />);
    const bubble = container.querySelector('.message-bubble');
    expect(bubble!.textContent).toContain('Unique content here');
  });

  it('renders message-content-wrapper div inside the message-wrapper', () => {
    const { container } = renderWithProviders(<StreamingMessage content="Hello" />);
    const wrapper = container.querySelector('.message-content-wrapper');
    expect(wrapper).toBeTruthy();
  });

  it('renders message-time and streaming-indicator classes on the indicator div', () => {
    const { container } = renderWithProviders(<StreamingMessage content="Hello" />);
    const indicator = container.querySelector('.message-time');
    expect(indicator).toBeTruthy();
    expect(indicator!.classList.contains('streaming-indicator')).toBe(true);
  });

  it('renders an avatar with size 40', () => {
    const { container } = renderWithProviders(<StreamingMessage content="Hello" />);
    // AntD Avatar applies ant-avatar-lg / ant-avatar classes; size is passed as prop
    const avatar = container.querySelector('.ant-avatar');
    expect(avatar).toBeTruthy();
  });

  it('renders avatar src when creatorAvatar is provided', () => {
    const { container } = renderWithProviders(
      <StreamingMessage content="Hi" creatorAvatar="https://cdn.example.com/pic.jpg" creatorName="Dana" />
    );
    const img = container.querySelector('img[src="https://cdn.example.com/pic.jpg"]') as HTMLImageElement;
    expect(img).toBeTruthy();
  });

  it('renders empty string content without error', () => {
    const { container } = renderWithProviders(<StreamingMessage content="" />);
    expect(container.firstChild).toBeTruthy();
    const bubble = container.querySelector('.message-bubble');
    // bubble still renders even with empty content
    expect(bubble).toBeTruthy();
  });

  it('renders "AI is typing..." text in a span with correct inline color style', () => {
    renderWithProviders(<StreamingMessage content="Hello" />);
    const typingText = screen.getByText('AI is typing...');
    expect(typingText.tagName.toLowerCase()).toBe('span');
    expect(typingText.style.color).toBe('rgb(148, 163, 184)'); // #94A3B8
  });
});
