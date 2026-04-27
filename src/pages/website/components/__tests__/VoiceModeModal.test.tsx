vi.mock('../../../../services/api', () => ({
  chatApi: {
    sendVoiceMessage: vi.fn().mockResolvedValue({ data: { data: { reply: 'Hi there' } } }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import VoiceModeModal from '../VoiceModeModal';

describe('VoiceModeModal', () => {
  it('renders when closed', () => {
    const { container } = renderWithProviders(
      <VoiceModeModal
        open={false}
        onClose={vi.fn()}
        conversationId={null}
        creatorName="Test Creator"
        creatorAvatar={null}
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders when open', () => {
    const { container } = renderWithProviders(
      <VoiceModeModal
        open={true}
        onClose={vi.fn()}
        conversationId="conv-1"
        creatorName="Test Creator"
        creatorAvatar="/avatar.jpg"
      />
    );
    expect(container).toBeTruthy();
  });
});
