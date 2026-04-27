import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  chatApi: {
    uploadMedia: vi.fn().mockResolvedValue({ data: { url: '/test.jpg' } }),
  },
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import MediaUploadButton from '../MediaUploadButton';

describe('MediaUploadButton', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <MediaUploadButton conversationId="conv-1" onUpload={vi.fn()} />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
