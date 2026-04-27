vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { data: { id: '1', url: '/doc.pdf', filename: 'doc.pdf', size: 1024 } } }),
  },
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { DocumentUpload } from '../DocumentUpload';

describe('DocumentUpload', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<DocumentUpload />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with custom props', () => {
    const { container } = renderWithProviders(
      <DocumentUpload maxFiles={3} maxSize={10} disabled />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with showList=false', () => {
    const { container } = renderWithProviders(
      <DocumentUpload showList={false} />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
