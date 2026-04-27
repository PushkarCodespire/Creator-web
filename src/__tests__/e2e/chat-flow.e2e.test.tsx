// ===========================================
// CHAT FLOW E2E TESTS
// ===========================================

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../../store';
import Chat from '../../../pages/Chat';

// Mock API calls
jest.mock('../../../services/api', () => ({
  creatorApi: {
    getById: jest.fn().mockResolvedValue({
      data: {
        data: {
          id: 'creator-1',
          displayName: 'Test Creator',
          profileImage: null,
        },
      },
    }),
  },
  chatApi: {
    startConversation: jest.fn().mockResolvedValue({
      data: {
        data: {
          conversationId: 'conv-1',
        },
      },
    }),
    sendMessage: jest.fn().mockResolvedValue({
      data: {
        data: {
          message: {
            id: 'msg-1',
            role: 'USER',
            content: 'Hello',
            createdAt: new Date(),
          },
          aiResponse: {
            id: 'msg-2',
            role: 'ASSISTANT',
            content: 'Hi there!',
            createdAt: new Date(),
          },
        },
      },
    }),
    getConversation: jest.fn().mockResolvedValue({
      data: {
        data: {
          messages: [],
        },
      },
    }),
  },
}));

const renderChat = () => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    </Provider>
  );
};

describe('Chat Flow E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load creator profile and display chat interface', async () => {
    renderChat();

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/ask.*anything/i)).toBeInTheDocument();
  });

  it('should send a message and display response', async () => {
    renderChat();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask.*anything/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/ask.*anything/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hello, how are you?' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    });

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(/hi there/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle voice message recording', async () => {
    renderChat();

    await waitFor(() => {
      expect(screen.getByText('Record')).toBeInTheDocument();
    });

    const recordButton = screen.getByText('Record');
    fireEvent.click(recordButton);

    await waitFor(() => {
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });
  });
});



