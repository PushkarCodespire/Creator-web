import { configureStore } from '@reduxjs/toolkit';
import chatReducer, {
  startConversation,
  sendMessage,
  fetchConversation,
  fetchUserConversations,
  editMessage,
  deleteMessage,
  clearChat,
  addMessage,
  setGuestId,
  updateMessage,
  removeMessage,
} from '../chatSlice';
import type { Message, Conversation } from '../../../types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../../services/api', () => ({
  chatApi: {
    startConversation: vi.fn(),
    sendMessage: vi.fn(),
    getConversation: vi.fn(),
    getUserConversations: vi.fn(),
    editMessage: vi.fn(),
    deleteMessage: vi.fn(),
  },
}));

import { chatApi } from '../../../services/api';

const mockedChatApi = chatApi as {
  startConversation: ReturnType<typeof vi.fn>;
  sendMessage: ReturnType<typeof vi.fn>;
  getConversation: ReturnType<typeof vi.fn>;
  getUserConversations: ReturnType<typeof vi.fn>;
  editMessage: ReturnType<typeof vi.fn>;
  deleteMessage: ReturnType<typeof vi.fn>;
};

// localStorage mock
const localStorageMock = (() => {
  let storage: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => storage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
    removeItem: vi.fn((key: string) => { delete storage[key]; }),
    clear: vi.fn(() => { storage = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createStore() {
  return configureStore({ reducer: { chat: chatReducer } });
}

const makeMsg = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  conversationId: 'conv-1',
  role: 'USER',
  content: 'hello',
  createdAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

const makeConversation = (overrides: Partial<Conversation> = {}): Conversation => ({
  id: 'conv-1',
  creatorId: 'creator-1',
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  messages: [makeMsg()],
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('chatSlice', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ----- Initial state -----

  describe('initial state', () => {
    it('has empty defaults', () => {
      const { chat } = createStore().getState();
      expect(chat.currentConversation).toBeNull();
      expect(chat.conversations).toEqual([]);
      expect(chat.messages).toEqual([]);
      expect(chat.isLoading).toBe(false);
      expect(chat.isSending).toBe(false);
      expect(chat.error).toBeNull();
      expect(chat.guestId).toBeNull();
    });
  });

  // ----- Synchronous reducers -----

  describe('clearChat', () => {
    it('resets conversation, messages, and error', async () => {
      const store = createStore();

      mockedChatApi.startConversation.mockResolvedValueOnce({
        data: { data: { conversation: makeConversation(), guestId: 'g-1' } },
      });
      await store.dispatch(startConversation('creator-1'));

      store.dispatch(clearChat());
      const { chat } = store.getState();

      expect(chat.currentConversation).toBeNull();
      expect(chat.messages).toEqual([]);
      expect(chat.error).toBeNull();
    });
  });

  describe('addMessage', () => {
    it('appends a new message', () => {
      const store = createStore();
      const msg = makeMsg({ id: 'msg-new' });

      store.dispatch(addMessage(msg));
      expect(store.getState().chat.messages).toHaveLength(1);
      expect(store.getState().chat.messages[0].id).toBe('msg-new');
    });

    it('deduplicates by id — merges when same id already exists', () => {
      const store = createStore();
      const msg1 = makeMsg({ id: 'msg-1', content: 'first' });
      const msg2 = makeMsg({ id: 'msg-1', content: 'updated' });

      store.dispatch(addMessage(msg1));
      store.dispatch(addMessage(msg2));

      expect(store.getState().chat.messages).toHaveLength(1);
      expect(store.getState().chat.messages[0].content).toBe('updated');
    });

    it('appends message with no id without dedup', () => {
      const store = createStore();
      const msg = { ...makeMsg(), id: undefined } as unknown as Message;

      store.dispatch(addMessage(msg));
      store.dispatch(addMessage(msg));

      expect(store.getState().chat.messages).toHaveLength(2);
    });
  });

  describe('setGuestId', () => {
    it('sets guestId in state and localStorage', () => {
      const store = createStore();
      store.dispatch(setGuestId('guest-abc'));

      expect(store.getState().chat.guestId).toBe('guest-abc');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('guestId', 'guest-abc');
    });
  });

  describe('updateMessage', () => {
    it('updates content of an existing message', () => {
      const store = createStore();
      store.dispatch(addMessage(makeMsg({ id: 'msg-1', content: 'old' })));

      store.dispatch(updateMessage({ id: 'msg-1', content: 'new content' }));
      expect(store.getState().chat.messages[0].content).toBe('new content');
    });

    it('does nothing when message id not found', () => {
      const store = createStore();
      store.dispatch(addMessage(makeMsg({ id: 'msg-1', content: 'old' })));

      store.dispatch(updateMessage({ id: 'nonexistent', content: 'new' }));
      expect(store.getState().chat.messages[0].content).toBe('old');
    });
  });

  describe('removeMessage', () => {
    it('removes a message by id', () => {
      const store = createStore();
      store.dispatch(addMessage(makeMsg({ id: 'msg-1' })));
      store.dispatch(addMessage(makeMsg({ id: 'msg-2' })));

      store.dispatch(removeMessage('msg-1'));
      expect(store.getState().chat.messages).toHaveLength(1);
      expect(store.getState().chat.messages[0].id).toBe('msg-2');
    });
  });

  // ----- Async thunks -----

  describe('startConversation thunk', () => {
    it('sets currentConversation and messages on success', async () => {
      const conv = makeConversation();
      mockedChatApi.startConversation.mockResolvedValueOnce({
        data: { data: { conversation: conv, guestId: 'g-1' } },
      });

      const store = createStore();
      await store.dispatch(startConversation('creator-1'));

      const { chat } = store.getState();
      expect(chat.isLoading).toBe(false);
      expect(chat.currentConversation).toEqual(conv);
      expect(chat.messages).toEqual(conv.messages);
      expect(chat.guestId).toBe('g-1');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('guestId', 'g-1');
    });

    it('sets isLoading while pending', () => {
      let resolve!: (v: unknown) => void;
      mockedChatApi.startConversation.mockReturnValueOnce(
        new Promise((r) => { resolve = r; }),
      );

      const store = createStore();
      const promise = store.dispatch(startConversation('creator-1'));

      expect(store.getState().chat.isLoading).toBe(true);
      expect(store.getState().chat.error).toBeNull();

      resolve({ data: { data: { conversation: makeConversation() } } });
      return promise;
    });

    it('sets error on failure', async () => {
      mockedChatApi.startConversation.mockRejectedValueOnce({
        response: { data: { error: 'Creator not found' } },
      });

      const store = createStore();
      await store.dispatch(startConversation('bad-id'));

      const { chat } = store.getState();
      expect(chat.isLoading).toBe(false);
      expect(chat.error).toBe('Creator not found');
    });
  });

  describe('sendMessage thunk', () => {
    it('appends userMessage and aiMessage on success (with dedup)', async () => {
      const userMsg = makeMsg({ id: 'u-1', role: 'USER', content: 'hi' });
      const aiMsg = makeMsg({ id: 'a-1', role: 'ASSISTANT', content: 'hello' });

      mockedChatApi.sendMessage.mockResolvedValueOnce({
        data: { data: { userMessage: userMsg, aiMessage: aiMsg } },
      });

      const store = createStore();
      await store.dispatch(sendMessage({ conversationId: 'conv-1', content: 'hi' }));

      const { chat } = store.getState();
      expect(chat.isSending).toBe(false);
      expect(chat.messages).toHaveLength(2);
      expect(chat.messages[0].id).toBe('u-1');
      expect(chat.messages[1].id).toBe('a-1');
    });

    it('sets isSending while pending', () => {
      let resolve!: (v: unknown) => void;
      mockedChatApi.sendMessage.mockReturnValueOnce(
        new Promise((r) => { resolve = r; }),
      );

      const store = createStore();
      const promise = store.dispatch(
        sendMessage({ conversationId: 'conv-1', content: 'hi' }),
      );

      expect(store.getState().chat.isSending).toBe(true);

      resolve({ data: { data: { userMessage: makeMsg(), aiMessage: undefined } } });
      return promise;
    });

    it('sets error on failure', async () => {
      mockedChatApi.sendMessage.mockRejectedValueOnce({
        response: { data: { error: 'Rate limited' } },
      });

      const store = createStore();
      await store.dispatch(
        sendMessage({ conversationId: 'conv-1', content: 'hi' }),
      );

      expect(store.getState().chat.isSending).toBe(false);
      expect(store.getState().chat.error).toBe('Rate limited');
    });
  });

  describe('fetchConversation thunk', () => {
    it('sets currentConversation and messages on success', async () => {
      const conv = makeConversation({ id: 'conv-2' });
      mockedChatApi.getConversation.mockResolvedValueOnce({
        data: { data: conv },
      });

      const store = createStore();
      await store.dispatch(fetchConversation('conv-2'));

      const { chat } = store.getState();
      expect(chat.currentConversation).toEqual(conv);
      expect(chat.messages).toEqual(conv.messages);
    });

    it('sets error on failure', async () => {
      mockedChatApi.getConversation.mockRejectedValueOnce({
        response: { data: { error: 'Not found' } },
      });

      const store = createStore();
      const result = await store.dispatch(fetchConversation('bad'));

      expect(result.meta.requestStatus).toBe('rejected');
    });
  });

  describe('fetchUserConversations thunk', () => {
    it('populates conversations array on success', async () => {
      const convList = [makeConversation({ id: 'c-1' }), makeConversation({ id: 'c-2' })];
      mockedChatApi.getUserConversations.mockResolvedValueOnce({
        data: { data: { conversations: convList } },
      });

      const store = createStore();
      await store.dispatch(fetchUserConversations());

      expect(store.getState().chat.conversations).toEqual(convList);
    });

    it('handles flat array response (no conversations wrapper)', async () => {
      const convList = [makeConversation({ id: 'c-3' })];
      mockedChatApi.getUserConversations.mockResolvedValueOnce({
        data: { data: convList },
      });

      const store = createStore();
      await store.dispatch(fetchUserConversations());

      expect(store.getState().chat.conversations).toEqual(convList);
    });
  });

  describe('editMessage thunk', () => {
    it('updates the message content in state', async () => {
      const store = createStore();
      store.dispatch(addMessage(makeMsg({ id: 'msg-1', content: 'original' })));

      mockedChatApi.editMessage.mockResolvedValueOnce({
        data: { data: { id: 'msg-1', content: 'edited' } },
      });

      await store.dispatch(editMessage({ messageId: 'msg-1', content: 'edited' }));

      expect(store.getState().chat.messages[0].content).toBe('edited');
    });

    it('sets error on failure', async () => {
      mockedChatApi.editMessage.mockRejectedValueOnce({
        response: { data: { error: 'Forbidden' } },
      });

      const store = createStore();
      const result = await store.dispatch(
        editMessage({ messageId: 'msg-1', content: 'x' }),
      );

      expect(result.meta.requestStatus).toBe('rejected');
    });
  });

  describe('deleteMessage thunk', () => {
    it('removes the message from state', async () => {
      const store = createStore();
      store.dispatch(addMessage(makeMsg({ id: 'msg-del' })));

      mockedChatApi.deleteMessage.mockResolvedValueOnce({});

      await store.dispatch(deleteMessage('msg-del'));

      expect(store.getState().chat.messages).toHaveLength(0);
    });

    it('sets error on failure', async () => {
      mockedChatApi.deleteMessage.mockRejectedValueOnce({
        response: { data: { error: 'Not allowed' } },
      });

      const store = createStore();
      const result = await store.dispatch(deleteMessage('msg-1'));

      expect(result.meta.requestStatus).toBe('rejected');
    });
  });
});
