vi.mock('../../../services/api', () => ({
  postApi: {
    create: vi.fn().mockResolvedValue({ data: { data: { id: '1' } } }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    textarea: ({ children, ...p }: any) => <textarea {...p}>{children}</textarea>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import PostCreator from '../PostCreator';


describe('PostCreator', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<PostCreator />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });
});
