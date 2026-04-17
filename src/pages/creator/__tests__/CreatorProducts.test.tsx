import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  programApi: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          { id: 'p1', name: 'Fat Loss Program', description: 'A program', price: 999, category: 'Fat Loss' },
          { id: 'p2', name: 'Protein Bar', description: JSON.stringify({ type: 'product', link: 'https://example.com', promoCode: 'SAVE10', desc: 'Best protein bar' }), price: 499, category: '__product__' },
        ],
      },
    }),
    create: vi.fn().mockResolvedValue({ data: { data: { id: 'p3' } } }),
    update: vi.fn().mockResolvedValue({ data: { success: true } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

import CreatorProducts from '../CreatorProducts';

describe('CreatorProducts', () => {
  it('renders the products page after data loads', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Fat Loss Program')).toBeInTheDocument();
    });
  });

  it('separates products from programs', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Fat Loss Program')).toBeInTheDocument();
    });

    // The product should also be rendered
    expect(screen.getByText('Protein Bar')).toBeInTheDocument();
  });
});
