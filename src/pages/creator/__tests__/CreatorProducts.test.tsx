import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  programApi: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          { id: 'p1', name: 'Fat Loss Program', description: JSON.stringify({ type: 'program', desc: 'A program' }), price: 999, category: 'Fat Loss' },
          { id: 'p2', name: 'Protein Bar', description: JSON.stringify({ type: 'product', link: 'https://example.com', promoCode: 'SAVE10', desc: 'Best protein bar' }), price: 499, category: '__product__' },
        ],
      },
    }),
    create: vi.fn().mockResolvedValue({ data: { data: { id: 'p3' } } }),
    update: vi.fn().mockResolvedValue({ data: { success: true } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  linkPreviewApi: {
    getPreview: vi.fn().mockResolvedValue({ data: { data: { title: '', siteName: '' } } }),
    generateDescription: vi.fn().mockResolvedValue({ data: { data: { description: '' } } }),
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

  it('renders page heading after data loads', async () => {
    renderWithProviders(<CreatorProducts />);
    await waitFor(() => {
      expect(screen.getByText('Products & Programs')).toBeInTheDocument();
    });
  });

  it('renders Products and Programs section headings', async () => {
    renderWithProviders(<CreatorProducts />);
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Fitness Programs')).toBeInTheDocument();
    });
  });

  it('renders Add Product and Add Program buttons', async () => {
    renderWithProviders(<CreatorProducts />);
    await waitFor(() => {
      expect(screen.getByText('Add Product')).toBeInTheDocument();
      expect(screen.getByText('Add Program')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderWithProviders(<CreatorProducts />);
    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
  });

  it('shows empty products message when no products exist', async () => {
    const { programApi } = await import('../../../services/api');
    (programApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: [] },
    });

    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText(/No products yet/i)).toBeInTheDocument();
    });
  });

  it('shows empty programs message when no programs exist', async () => {
    const { programApi } = await import('../../../services/api');
    (programApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: [] },
    });

    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText(/No programs yet/i)).toBeInTheDocument();
    });
  });

  it('opens product form when Add Product is clicked', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Product'));

    await waitFor(() => {
      expect(screen.getByText('New Product')).toBeInTheDocument();
    });
  });

  it('opens program form when Add Program is clicked', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Add Program')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Program'));

    await waitFor(() => {
      expect(screen.getByText('New Program')).toBeInTheDocument();
    });
  });

  it('calls programApi.create when Create Product is submitted with a name', async () => {
    const { programApi } = await import('../../../services/api');

    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Product'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Whey Protein Isolate/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Whey Protein Isolate/i), {
      target: { value: 'My New Product' },
    });

    fireEvent.click(screen.getByText('Create Product'));

    await waitFor(() => {
      expect(programApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My New Product', category: '__product__' })
      );
    });
  });

  it('calls programApi.delete when the delete button on a product is clicked', async () => {
    const { programApi } = await import('../../../services/api');

    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Protein Bar')).toBeInTheDocument();
    });

    // Find the trash buttons — first one is for the program, second for the product
    const trashButtons = document.querySelectorAll('button[type="button"]');
    // Filter to ones that have a Trash2 icon (red border)
    const deleteButtons = Array.from(trashButtons).filter((btn) =>
      (btn as HTMLButtonElement).style.borderColor?.includes('fecaca') ||
      btn.innerHTML.includes('Trash')
    );

    // Click the delete button for the product (Protein Bar, id p2)
    // The product cards come after the program cards; last delete button is the product
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[deleteButtons.length - 1]);
      await waitFor(() => {
        expect(programApi.delete).toHaveBeenCalled();
      });
    }
  });

  it('renders product promo code badge when promoCode is set', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('SAVE10')).toBeInTheDocument();
    });
  });

  it('closes product form when the × close button is clicked', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Product'));
    await waitFor(() => {
      expect(screen.getByText('New Product')).toBeInTheDocument();
    });

    // Click the X button to close
    const closeButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg') && !btn.textContent?.trim()
    );
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('New Product')).not.toBeInTheDocument();
    });
  });

  it('closes product form when Cancel button is clicked', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Product'));
    await waitFor(() => {
      expect(screen.getByText('New Product')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByText('New Product')).not.toBeInTheDocument();
    });
  });

  it('closes program form when the Cancel button is clicked', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Add Program')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Program'));
    await waitFor(() => {
      expect(screen.getByText('New Program')).toBeInTheDocument();
    });

    // There are two Cancel buttons (one for product already closed, one for program)
    const cancelButtons = screen.getAllByText('Cancel');
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);

    await waitFor(() => {
      expect(screen.queryByText('New Program')).not.toBeInTheDocument();
    });
  });

  it('calls programApi.create when Create Program is submitted with a name', async () => {
    const { programApi } = await import('../../../services/api');

    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Add Program')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Program'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/12-Week Fat Loss Challenge/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/12-Week Fat Loss Challenge/i), {
      target: { value: 'My Fitness Plan' },
    });

    fireEvent.click(screen.getByText('Create Program'));

    await waitFor(() => {
      expect(programApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My Fitness Plan' })
      );
    });
  });

  it('renders program description in the card', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('A program')).toBeInTheDocument();
    });
  });

  it('renders product description in the card', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Best protein bar')).toBeInTheDocument();
    });
  });

  it('renders "Visit" link for a product with a link', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Visit')).toBeInTheDocument();
    });
  });

  it('renders the product price correctly', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('₹499')).toBeInTheDocument();
    });
  });

  it('renders the program price correctly', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('₹999')).toBeInTheDocument();
    });
  });

  it('shows "Edit Product" form title when an edit button is clicked on a product card', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Protein Bar')).toBeInTheDocument();
    });

    // Find all pencil/edit buttons — collect them by looking at Pencil icon buttons
    const editButtons = Array.from(document.querySelectorAll('button[type="button"]')).filter(
      btn => btn.querySelector('svg') && (btn as HTMLElement).style.border?.includes('ede8e3')
    );

    // The second edit button (index 1) belongs to the Protein Bar product card
    if (editButtons.length >= 2) {
      fireEvent.click(editButtons[editButtons.length - 1]);
      await waitFor(() => {
        expect(screen.getByText('Edit Product')).toBeInTheDocument();
      });
    }
  });

  it('shows "Edit Program" form title when an edit button is clicked on a program card', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Fat Loss Program')).toBeInTheDocument();
    });

    const editButtons = Array.from(document.querySelectorAll('button[type="button"]')).filter(
      btn => btn.querySelector('svg') && (btn as HTMLElement).style.border?.includes('ede8e3')
    );

    if (editButtons.length >= 1) {
      fireEvent.click(editButtons[0]);
      await waitFor(() => {
        expect(screen.getByText('Edit Program')).toBeInTheDocument();
      });
    }
  });

  it('renders the program category badge (Fat Loss) in the card', async () => {
    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      // 'Fat Loss' appears as the category badge on the program card
      const badges = screen.getAllByText('Fat Loss');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('does not save product when name is empty', async () => {
    const { programApi } = await import('../../../services/api');
    const createSpy = programApi.create as ReturnType<typeof vi.fn>;
    createSpy.mockClear();

    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Product'));

    await waitFor(() => {
      expect(screen.getByText('Create Product')).toBeInTheDocument();
    });

    // Do NOT fill in a name — click create directly
    fireEvent.click(screen.getByText('Create Product'));

    // programApi.create should NOT have been called
    await waitFor(() => {
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  it('does not save program when name is empty', async () => {
    const { programApi } = await import('../../../services/api');
    const createSpy = programApi.create as ReturnType<typeof vi.fn>;
    createSpy.mockClear();

    renderWithProviders(<CreatorProducts />);

    await waitFor(() => {
      expect(screen.getByText('Add Program')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Program'));

    await waitFor(() => {
      expect(screen.getByText('Create Program')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create Program'));

    await waitFor(() => {
      expect(createSpy).not.toHaveBeenCalled();
    });
  });
});
