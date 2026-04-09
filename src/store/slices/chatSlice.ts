// ===========================================
// CHAT SLICE
// ===========================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatApi } from '../../services/api';
import { Conversation, Message } from '../../types';

interface ChatState {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  guestId: string | null;
}

const initialState: ChatState = {
  currentConversation: null,
  conversations: [],
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  guestId: localStorage.getItem('guestId')
};

export const startConversation = createAsyncThunk(
  'chat/startConversation',
  async (creatorId: string, { rejectWithValue }) => {
    try {
      const response = await chatApi.startConversation(creatorId);
      const { conversation, guestId } = response.data.data;
      if (guestId) {
        localStorage.setItem('guestId', guestId);
      }
      return { conversation, guestId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to start conversation');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content, media }: { conversationId: string; content: string; media?: any[] }, { rejectWithValue }) => {
    try {
      const response = await chatApi.sendMessage(conversationId, content, media);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send message');
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'chat/fetchConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await chatApi.getConversation(conversationId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch conversation');
    }
  }
);

export const fetchUserConversations = createAsyncThunk(
  'chat/fetchUserConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatApi.getUserConversations();
      return response.data.data.conversations || response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch conversations');
    }
  }
);

export const editMessage = createAsyncThunk(
  'chat/editMessage',
  async ({ messageId, content }: { messageId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await chatApi.editMessage(messageId, content);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to edit message');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId: string, { rejectWithValue }) => {
    try {
      await chatApi.deleteMessage(messageId);
      return messageId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChat: (state) => {
      state.currentConversation = null;
      state.messages = [];
      state.error = null;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Dedupe by id — the same message may arrive via both REST response
      // (sendMessage.fulfilled) and socket push (message:new). We want to
      // only render it once.
      const incoming = action.payload;
      if (!incoming?.id) {
        state.messages.push(incoming);
        return;
      }
      const existingIdx = state.messages.findIndex(m => m.id === incoming.id);
      if (existingIdx === -1) {
        state.messages.push(incoming);
      } else {
        // Merge fields in case the later version has more info
        state.messages[existingIdx] = { ...state.messages[existingIdx], ...incoming };
      }
    },
    setGuestId: (state, action: PayloadAction<string>) => {
      state.guestId = action.payload;
      localStorage.setItem('guestId', action.payload);
    },
    updateMessage: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const message = state.messages.find(m => m.id === action.payload.id);
      if (message) {
        message.content = action.payload.content;
      }
    },
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload.conversation;
        state.messages = action.payload.conversation.messages || [];
        if (action.payload.guestId) {
          state.guestId = action.payload.guestId;
        }
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        const pushDedup = (msg: any) => {
          if (!msg) return;
          if (!msg.id) {
            state.messages.push(msg);
            return;
          }
          const idx = state.messages.findIndex(m => m.id === msg.id);
          if (idx === -1) {
            state.messages.push(msg);
          } else {
            state.messages[idx] = { ...state.messages[idx], ...msg };
          }
        };
        pushDedup(action.payload.userMessage);
        pushDedup(action.payload.aiMessage);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
        state.messages = action.payload.messages || [];
      })
      .addCase(fetchUserConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        const message = state.messages.find(m => m.id === action.payload.id);
        if (message) {
          message.content = action.payload.content;
        }
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(m => m.id !== action.payload);
      });
  }
});

export const { clearChat, addMessage, setGuestId, updateMessage, removeMessage } = chatSlice.actions;
export default chatSlice.reducer;
