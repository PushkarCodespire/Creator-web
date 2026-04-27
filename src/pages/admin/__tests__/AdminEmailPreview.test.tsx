import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getEmailPreview: vi.fn().mockResolvedValue({ data: { data: { subject: '', html: '' } } }),
  },
}));

vi.mock('../../../styles/AdminPanel.css', () => ({}));

import AdminEmailPreview from '../AdminEmailPreview';

describe('AdminEmailPreview', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminEmailPreview />);
    expect(container.firstChild).toBeTruthy();
  });
});
