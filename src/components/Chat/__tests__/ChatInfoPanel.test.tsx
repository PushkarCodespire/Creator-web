vi.mock('../../../services/api', () => ({
  getImageUrl: vi.fn((x: string) => x),
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ChatInfoPanel } from '../ChatInfoPanel';

const mockCreator = {
  id: '1',
  displayName: 'Test Creator',
  profileImage: '/img.jpg',
  bio: 'A great creator',
  category: 'Tech',
  isVerified: true,
  username: 'testcreator',
  userId: 'u1',
  subscribers: 100,
  messagePrice: 5,
  isActive: true,
  createdAt: '',
};

describe('ChatInfoPanel', () => {
  it('renders null when collapsed', () => {
    const { container } = renderWithProviders(
      <ChatInfoPanel
        creator={mockCreator as any}
        onSendMessage={vi.fn()}
        isCollapsed={true}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when not collapsed', () => {
    const { container } = renderWithProviders(
      <ChatInfoPanel
        creator={mockCreator as any}
        onSendMessage={vi.fn()}
        isCollapsed={false}
      />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with null creator', () => {
    const { container } = renderWithProviders(
      <ChatInfoPanel
        creator={null}
        onSendMessage={vi.fn()}
        isCollapsed={false}
      />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
