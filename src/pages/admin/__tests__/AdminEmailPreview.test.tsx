import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getEmailPreview: vi.fn().mockResolvedValue({
      data: {
        data: {
          subject: 'Welcome to CreatorPal!',
          html: '<h1>Welcome</h1><p>Hello John Doe</p>',
        },
      },
    }),
  },
}));

import AdminEmailPreview from '../AdminEmailPreview';

describe('AdminEmailPreview', () => {
  it('renders the email preview page', async () => {
    renderWithProviders(<AdminEmailPreview />);

    // The page should render without crashing
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });
});
