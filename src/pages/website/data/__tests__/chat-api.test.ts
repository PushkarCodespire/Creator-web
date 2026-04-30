vi.mock('../config', () => ({
  CHAT_CONFIG: { apiUrl: 'https://api.example.com', freeTrialLimit: 5, creatorBackendIds: {} },
  isChatWiredUp: vi.fn().mockReturnValue(true),
}));

import { ChatApiError, startConversation, sendMessage } from '../chat-api';

describe('ChatApiError', () => {
  it('is an Error subclass', () => {
    const err = new ChatApiError('oops');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ChatApiError);
  });

  it('has name ChatApiError', () => {
    expect(new ChatApiError('msg').name).toBe('ChatApiError');
  });

  it('stores the message', () => {
    expect(new ChatApiError('bad thing').message).toBe('bad thing');
  });

  it('stores an optional status code', () => {
    expect(new ChatApiError('not found', 404).status).toBe(404);
  });

  it('status is undefined when not provided', () => {
    expect(new ChatApiError('no status').status).toBeUndefined();
  });
});

describe('startConversation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns conversationId and displayName on success', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          conversation: { id: 'conv-1' },
          creator: { id: 'cr-1', displayName: 'Test AI' },
        },
      }),
    });

    const result = await startConversation('cr-1', 'guest-1');
    expect(result.conversationId).toBe('conv-1');
    expect(result.creatorDisplayName).toBe('Test AI');
  });

  it('throws ChatApiError when response is not ok', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    await expect(startConversation('cr-1', 'guest-1')).rejects.toBeInstanceOf(ChatApiError);
  });

  it('throws ChatApiError when success:false', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, data: null }),
    });

    await expect(startConversation('cr-1', 'guest-1')).rejects.toBeInstanceOf(ChatApiError);
  });
});

describe('sendMessage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns userMessage and aiMessage on success', async () => {
    const mockUser = { id: 'm1', content: 'Hello', senderType: 'USER' as const };
    const mockAi = { id: 'm2', content: 'Hi there', senderType: 'AI' as const };

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { userMessage: mockUser, aiMessage: mockAi },
      }),
    });

    const result = await sendMessage('conv-1', 'Hello', 'guest-1');
    expect(result.userMessage.content).toBe('Hello');
    expect(result.aiMessage?.content).toBe('Hi there');
  });

  it('throws ChatApiError on HTTP error', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limited',
    });

    await expect(sendMessage('conv-1', 'hi', 'guest-1')).rejects.toBeInstanceOf(ChatApiError);
  });

  it('handles null aiMessage (creator did not reply yet)', async () => {
    const mockUser = { id: 'm1', content: 'Hello', senderType: 'USER' as const };

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { userMessage: mockUser, aiMessage: null },
      }),
    });

    const result = await sendMessage('conv-1', 'Hello', 'guest-1');
    expect(result.aiMessage).toBeNull();
  });
});
