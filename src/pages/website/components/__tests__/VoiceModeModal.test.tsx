vi.mock('../../../../services/api', () => ({
  chatApi: {
    sendMessage: vi.fn().mockResolvedValue({ data: { data: { aiMessage: { content: 'Hi there', audioUrl: null } } } }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { waitFor, screen } from '@testing-library/react';
import VoiceModeModal from '../VoiceModeModal';

const defaultProps = {
  onClose: vi.fn(),
  conversationId: 'conv-1',
  creatorName: 'Test Creator',
  creatorAvatar: null,
};

describe('VoiceModeModal', () => {
  it('renders when closed', () => {
    const { container } = renderWithProviders(<VoiceModeModal open={false} {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders when open and shows creator name', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
  });

  it('renders with avatar image', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} creatorAvatar="/avatar.jpg" />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('renders with different voice provider', async () => {
    const { container } = renderWithProviders(
      <VoiceModeModal open={true} {...defaultProps} voiceProvider="elevenlabs" />
    );
    await waitFor(() => {
      expect(container.firstChild).toBeTruthy();
    });
  });

  it('renders idle state with tap instruction', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/tap/i)).toBeInTheDocument();
    });
  });

  it('renders close (×) button when open', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} />);
    await waitFor(() => {
      // The × close button
      expect(screen.getByText('×')).toBeInTheDocument();
    });
  });

  it('calls onClose when × button is clicked', async () => {
    const onClose = vi.fn();
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByText('×')).toBeInTheDocument();
    });

    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByText('×'));

    expect(onClose).toHaveBeenCalled();
  });

  it('renders "Press Escape to close" hint when open', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/press escape to close/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn();
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent } = await import('@testing-library/react');
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('shows nothing when open=false', () => {
    const { container } = renderWithProviders(<VoiceModeModal open={false} {...defaultProps} />);
    // Component returns null when closed
    expect(container.firstChild).toBeNull();
  });

  it('renders with inworld voice provider', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} voiceProvider="inworld" />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
  });

  it('renders with chatterbox voice provider', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} voiceProvider="chatterbox" />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
  });

  it('shows "Tap to speak" label in idle state', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Tap to speak')).toBeInTheDocument();
    });
  });

  it('renders the avatar initial letter when no avatarUrl is given', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} creatorName="Alice" />);
    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  it('renders an img element when creatorAvatar is provided', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} creatorAvatar="/some/avatar.jpg" />);
    await waitFor(() => {
      const img = document.querySelector('img');
      expect(img).toBeTruthy();
      expect(img?.getAttribute('alt')).toBe('Test Creator');
    });
  });

  it('does not render creator name or escape hint when closed', () => {
    renderWithProviders(<VoiceModeModal open={false} {...defaultProps} />);
    expect(screen.queryByText('Test Creator')).not.toBeInTheDocument();
    expect(screen.queryByText(/press escape to close/i)).not.toBeInTheDocument();
  });

  it('renders the clickable avatar circle with role button', () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} />);
    // The modal renders synchronously — both the × button and the avatar div[role="button"] are present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('does not crash when conversationId is null', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} conversationId={null} />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
  });

  it('does not call onMessageSent on initial render', async () => {
    const onMessageSent = vi.fn();
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} onMessageSent={onMessageSent} />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
    expect(onMessageSent).not.toHaveBeenCalled();
  });

  it('does not call onVoiceBlocked on initial render', async () => {
    const onVoiceBlocked = vi.fn();
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} onVoiceBlocked={onVoiceBlocked} />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
    expect(onVoiceBlocked).not.toHaveBeenCalled();
  });

  it('renders with multi-word creator name and shows initial correctly', async () => {
    renderWithProviders(<VoiceModeModal open={true} {...defaultProps} creatorName="John Doe" />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      // First letter of "John Doe" is J
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  it('modal does not render any DOM when open=false (returns null)', () => {
    const { container } = renderWithProviders(<VoiceModeModal open={false} {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('Escape key listener is removed when modal is closed (no double-fire)', async () => {
    const onClose = vi.fn();
    const { unmount } = renderWithProviders(<VoiceModeModal open={true} {...defaultProps} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
    unmount();
    // Fire escape after unmount — onClose should not be called again
    const { fireEvent: fe } = await import('@testing-library/react');
    fe.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  it('renders without crashing when onMessageSent and onVoiceBlocked are undefined', async () => {
    const props = { open: true, onClose: vi.fn(), conversationId: 'c1', creatorName: 'Solo', creatorAvatar: null };
    renderWithProviders(<VoiceModeModal {...props} />);
    await waitFor(() => {
      expect(screen.getByText('Solo')).toBeInTheDocument();
    });
  });
});
