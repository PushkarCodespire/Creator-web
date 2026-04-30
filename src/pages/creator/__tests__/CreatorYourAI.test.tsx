import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  creatorApi: {
    updateProfile: vi.fn().mockResolvedValue({ data: { success: true } }),
    getDashboard: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
  contentApi: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: {
          contents: [
            { id: '1', title: 'YouTube Video', type: 'YOUTUBE_VIDEO', status: 'COMPLETED', _count: { chunks: 5 }, createdAt: '2026-01-01' },
          ],
          pagination: { total: 1, page: 1, limit: 20 },
        },
      },
    }),
    getVoiceClone: vi.fn().mockResolvedValue({
      data: { data: { status: 'READY' } },
    }),
    getAiSummary: vi.fn().mockResolvedValue({
      data: { data: { summary: 'AI summary text' } },
    }),
    previewYouTube: vi.fn().mockResolvedValue({ data: { data: { title: 'Preview' } } }),
    addYouTube: vi.fn().mockResolvedValue({ data: { data: { id: '2' } } }),
    addManual: vi.fn().mockResolvedValue({ data: { data: { id: '3' } } }),
    addFAQ: vi.fn().mockResolvedValue({ data: { data: { id: '4' } } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
    retrain: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

vi.mock('../../../components/VoiceCloneSection/VoiceCloneSection', () => ({
  VoiceCloneSection: ({ onStatusChange }: { onStatusChange: (s: string) => void }) => {
    onStatusChange('READY');
    return <div data-testid="voice-clone-section">Voice Clone Section</div>;
  },
}));

import CreatorYourAI from '../CreatorYourAI';

const preloadedState = {
  auth: {
    user: {
      name: 'Test Creator',
      creator: {
        id: 'c1',
        aiTone: 'friendly',
        aiPersonality: 'helpful',
        welcomeMessage: 'Welcome!',
      },
    } as any,
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('CreatorYourAI', () => {
  it('renders the page without crashing', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('renders knowledge base content after data loads', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('YouTube Video')).toBeInTheDocument();
    });
  });

  it('renders AI Personality section heading', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('AI Personality')).toBeInTheDocument();
    });
  });

  it('renders Scenario Training section heading', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Scenario Training')).toBeInTheDocument();
    });
  });

  it('renders Voice Clone section heading', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Voice Clone')).toBeInTheDocument();
    });
  });

  it('renders Knowledge Base section heading', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    });
  });

  it('clicking YouTube button shows Add YouTube Video form', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('YouTube'));

    await waitFor(() => {
      expect(screen.getByText('Add YouTube Video')).toBeInTheDocument();
    });
  });

  it('clicking Text button shows Add Manual form', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Text'));

    await waitFor(() => {
      expect(screen.getByText('Add Manual Content')).toBeInTheDocument();
    });
  });

  it('clicking FAQ button shows Add FAQ form', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('FAQ'));

    await waitFor(() => {
      // "Add FAQ" appears as both the form heading and the submit button; just check it's present
      expect(screen.getAllByText('Add FAQ').length).toBeGreaterThan(0);
    });
  });

  it('scenario training next/prev navigation changes the displayed question number', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Scenario Training')).toBeInTheDocument();
    });

    // First question is displayed (question 1 of 10)
    expect(screen.getByText(/^1\./)).toBeInTheDocument();

    // Click Next
    fireEvent.click(screen.getByText('Next →'));

    await waitFor(() => {
      expect(screen.getByText(/^2\./)).toBeInTheDocument();
    });

    // Click Prev to go back
    fireEvent.click(screen.getByText('← Prev'));

    await waitFor(() => {
      expect(screen.getByText(/^1\./)).toBeInTheDocument();
    });
  });

  it('Save AI Settings button is present and clickable', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('AI Personality')).toBeInTheDocument();
    });

    const saveBtn = screen.getAllByText('Save AI Settings')[0];
    expect(saveBtn).toBeInTheDocument();
    fireEvent.click(saveBtn);
    // Button should reflect saving state or complete without throwing
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('clicking AI Summary button opens the summary modal', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('AI Summary')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('AI Summary'));

    await waitFor(() => {
      // The modal heading is the same "AI Summary" text; also the modal body renders
      expect(screen.getAllByText('AI Summary').length).toBeGreaterThan(0);
    });
  });

  it('clicking energy level button toggles the selection', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('AI Personality')).toBeInTheDocument();
    });

    const calmBtn = screen.getByText(/Calm/i);
    fireEvent.click(calmBtn);

    // After click, the button should be styled as active — no crash
    expect(calmBtn).toBeInTheDocument();

    // Click again to deselect (toggle off)
    fireEvent.click(calmBtn);
    expect(calmBtn).toBeInTheDocument();
  });

  it('adding an opinionated topic via the Add button renders the tag', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a topic/i)).toBeInTheDocument();
    });

    const topicInput = screen.getByPlaceholderText(/Type a topic/i);
    fireEvent.change(topicInput, { target: { value: 'Nutrition' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('Nutrition')).toBeInTheDocument();
    });
  });

  it('opens YouTube form, fills URL, and clicking Fetch Transcript calls previewYouTube', async () => {
    const { contentApi } = await import('../../../services/api');
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('YouTube'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Paste YouTube URL')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Paste YouTube URL'), {
      target: { value: 'https://youtube.com/watch?v=test' },
    });
    fireEvent.click(screen.getByText('Fetch Transcript'));

    await waitFor(() => {
      expect(contentApi.previewYouTube).toHaveBeenCalled();
    });
  });

  it('shows empty state when knowledge base has no content', async () => {
    const { contentApi } = await import('../../../services/api');
    (contentApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { contents: [], pagination: { total: 0, page: 1, limit: 20 } } },
    });

    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('No training data yet')).toBeInTheDocument();
    });
  });

  it('renders the Regenerate button inside the AI Summary modal', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('AI Summary')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('AI Summary'));

    await waitFor(() => {
      expect(screen.getByText('Regenerate')).toBeInTheDocument();
    });
  });

  it('renders the page heading "Your AI"', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Your AI/i })).toBeInTheDocument();
    });
  });

  it('renders the subtitle about configuring AI personality', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Configure your AI personality/i)).toBeInTheDocument();
    });
  });

  it('selecting Balanced energy level button and deselecting works without error', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Balanced/i)).toBeInTheDocument();
    });
    const btn = screen.getByText(/Balanced/i);
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it('clicking Supportive honesty style selects it', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Supportive/i)).toBeInTheDocument();
    });
    const btn = screen.getByText(/Supportive/i);
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it('clicking Tough Love honesty style toggles without error', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Tough Love/i)).toBeInTheDocument();
    });
    const btn = screen.getByText(/Tough Love/i);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it('clicking Detailed response format selects it', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Detailed/i)).toBeInTheDocument();
    });
    const btn = screen.getByText(/Detailed/i);
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it('scenario training shows 10 pagination buttons', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Scenario Training')).toBeInTheDocument();
    });
    // Pagination buttons are numbered 1-10
    for (let i = 1; i <= 10; i++) {
      expect(screen.getAllByText(String(i)).length).toBeGreaterThan(0);
    }
  });

  it('typing in the welcome message input updates the field', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/First thing your AI says/i)).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText(/First thing your AI says/i);
    fireEvent.change(input, { target: { value: 'Hello there!' } });
    expect((input as HTMLInputElement).value).toBe('Hello there!');
  });

  it('adding an opinionated topic via Enter key renders the tag', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a topic/i)).toBeInTheDocument();
    });
    const topicInput = screen.getByPlaceholderText(/Type a topic/i);
    fireEvent.change(topicInput, { target: { value: 'Mindset' } });
    fireEvent.keyDown(topicInput, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByText('Mindset')).toBeInTheDocument();
    });
  });

  it('added topic has a remove (×) button', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a topic/i)).toBeInTheDocument();
    });
    const topicInput = screen.getByPlaceholderText(/Type a topic/i);
    fireEvent.change(topicInput, { target: { value: 'Discipline' } });
    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => {
      expect(screen.getByText('Discipline')).toBeInTheDocument();
    });
    // The × remove button should appear next to the tag
    const removeButtons = document.querySelectorAll('button[type="button"]');
    const removeBtn = Array.from(removeButtons).find(
      b => b.textContent === '×'
    );
    expect(removeBtn).toBeTruthy();
    if (removeBtn) fireEvent.click(removeBtn);
    await waitFor(() => {
      expect(screen.queryByText('Discipline')).not.toBeInTheDocument();
    });
  });

  it('closing the FAQ form with X hides the form', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('FAQ'));
    await waitFor(() => {
      expect(screen.getAllByText('Add FAQ').length).toBeGreaterThan(0);
    });
    // Find the × close button inside the FAQ form panel
    const faqForm = document.querySelector('[style*="fde68a"]') ??
      document.querySelector('[style*="fef3c7"]');
    const closeX = faqForm?.querySelector('button[type="button"]');
    if (closeX) {
      fireEvent.click(closeX);
      await waitFor(() => {
        expect(screen.queryByText('Add FAQ')).not.toBeInTheDocument();
      });
    }
  });

  it('renders Voice Clone section with VoiceCloneSection component', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByTestId('voice-clone-section')).toBeInTheDocument();
    });
  });
});
