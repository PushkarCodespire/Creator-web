vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...p }: any) => <a href={to} {...p}>{children}</a>,
  };
});

vi.mock('../../WebsiteHome.module.css', () => ({
  default: {},
}));

vi.mock('../../data/creators-data', () => ({
  CREATORS: [
    {
      id: 'creator1',
      name: 'Creator One',
      title: 'Tech Expert',
      chats: '100+ Chats',
      about: 'About Creator One',
      tags: ['Tech'],
      questions: ['How do I code?'],
      cardImg: '/card1.jpg',
      modalImg: '/modal1.jpg',
    },
  ],
}));

vi.mock('../../data/config', () => ({
  getBackendIdForSlug: vi.fn((id: string) => id),
}));

vi.mock('../../../../services/api', () => ({
  getImageUrl: vi.fn((x: string) => x),
}));

import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { CreatorsGrid } from '../CreatorsGrid';

describe('CreatorsGrid', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorsGrid />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with API creators', () => {
    const creators = [
      { id: 'api1', displayName: 'API Creator', category: 'Tech', profileImage: null },
    ];
    const { container } = renderWithProviders(
      <CreatorsGrid creators={creators as any} />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
