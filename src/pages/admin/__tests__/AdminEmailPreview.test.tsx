import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent, act } from '@testing-library/react';
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

  it('renders the page heading', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByText('Email Template Preview')).toBeInTheDocument();
  });

  it('renders the page subtitle', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByText(/Preview all email templates with customizable sample data/i)).toBeInTheDocument();
  });

  it('renders the template selector label', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByText('Select Email Template')).toBeInTheDocument();
  });

  it('renders Sample Data section', () => {
    renderWithProviders(<AdminEmailPreview />);
    // Use getAllByText because the subtitle also contains "sample data" (case-insensitive)
    expect(screen.getAllByText(/Sample Data/i)[0]).toBeInTheDocument();
  });

  it('renders name input with default value', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });

  it('renders email input with default value', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  it('renders the Template Selector card title', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByText('Template Selector')).toBeInTheDocument();
  });

  it('renders the Refresh Preview button', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByText('Refresh Preview')).toBeInTheDocument();
  });

  it('renders the Copy HTML button', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByText('Copy HTML')).toBeInTheDocument();
  });

  it('renders the email preview iframe', async () => {
    renderWithProviders(<AdminEmailPreview />);
    await waitFor(() => {
      expect(document.querySelector('iframe[title="Email Preview"]')).toBeTruthy();
    });
  });

  it('renders the demo mode info box text', async () => {
    renderWithProviders(<AdminEmailPreview />);
    await waitFor(() => {
      expect(screen.getAllByText(/Demo Mode/i).length).toBeGreaterThan(0);
    });
  });

  it('renders the page subtitle with period', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByText(/Preview all email templates with customizable sample data\./i)).toBeInTheDocument();
  });

  it('renders the template Select component (options only appear when dropdown is open)', () => {
    renderWithProviders(<AdminEmailPreview />);
    // Ant Design Select options are not in the DOM until the dropdown is opened.
    // Check the select control container is rendered instead.
    const selects = document.querySelectorAll('.ant-select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('renders the Name label for the name input', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders the Email label for the email input', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders the preview subject after initial fetch', async () => {
    renderWithProviders(<AdminEmailPreview />);
    await waitFor(() => {
      expect(screen.getByText(/Subject:/i)).toBeInTheDocument();
    });
  });

  // ── NEW TESTS ────────────────────────────────────────────────────────────────

  it('renders a Select component for the template selector', () => {
    const { container } = renderWithProviders(<AdminEmailPreview />);
    // Ant Design Select renders with the ant-select class
    expect(container.querySelector('.ant-select')).toBeTruthy();
  });

  it('renders the admin-page wrapper element', () => {
    const { container } = renderWithProviders(<AdminEmailPreview />);
    expect(container.querySelector('.admin-page')).toBeTruthy();
  });

  it('renders the admin-hero section', () => {
    const { container } = renderWithProviders(<AdminEmailPreview />);
    expect(container.querySelector('.admin-hero')).toBeTruthy();
  });

  it('renders admin-hero-title and admin-hero-subtitle classes', () => {
    const { container } = renderWithProviders(<AdminEmailPreview />);
    expect(container.querySelector('.admin-hero-title')).toBeTruthy();
    expect(container.querySelector('.admin-hero-subtitle')).toBeTruthy();
  });

  it('updating the Name input changes its displayed value', async () => {
    renderWithProviders(<AdminEmailPreview />);
    const nameInput = screen.getByDisplayValue('John Doe') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
    await waitFor(() => {
      expect(nameInput.value).toBe('Jane Smith');
    });
  });

  it('updating the Email input changes its displayed value', async () => {
    renderWithProviders(<AdminEmailPreview />);
    const emailInput = screen.getByDisplayValue('john@example.com') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'jane@test.com' } });
    await waitFor(() => {
      expect(emailInput.value).toBe('jane@test.com');
    });
  });

  it('iframe has the correct width style', async () => {
    renderWithProviders(<AdminEmailPreview />);
    await waitFor(() => {
      const iframe = document.querySelector('iframe[title="Email Preview"]') as HTMLIFrameElement;
      expect(iframe).toBeTruthy();
      expect(iframe.style.width).toBe('100%');
    });
  });

  it('iframe has height of 800px', async () => {
    renderWithProviders(<AdminEmailPreview />);
    await waitFor(() => {
      const iframe = document.querySelector('iframe[title="Email Preview"]') as HTMLIFrameElement;
      expect(iframe.style.height).toBe('800px');
    });
  });

  it('calls getEmailPreview on mount for a backend template', async () => {
    const { adminApi } = await import('../../../services/api');
    renderWithProviders(<AdminEmailPreview />);
    await waitFor(() => {
      expect(adminApi.getEmailPreview).toHaveBeenCalled();
    });
  });

  it('renders the Copy HTML button as a button element', () => {
    renderWithProviders(<AdminEmailPreview />);
    const copyBtn = screen.getByText('Copy HTML').closest('button');
    expect(copyBtn).toBeTruthy();
  });

  it('renders the Refresh Preview button as a button element', () => {
    renderWithProviders(<AdminEmailPreview />);
    const refreshBtn = screen.getByText('Refresh Preview').closest('button');
    expect(refreshBtn).toBeTruthy();
  });

  it('renders the SendGrid demo-mode explanation text', async () => {
    renderWithProviders(<AdminEmailPreview />);
    await waitFor(() => {
      expect(screen.getByText(/SendGrid/i)).toBeInTheDocument();
    });
  });

  it('renders the Preview card title text', async () => {
    renderWithProviders(<AdminEmailPreview />);
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  it('Refresh Preview button triggers getEmailPreview again', async () => {
    const { adminApi } = await import('../../../services/api');
    renderWithProviders(<AdminEmailPreview />);
    await waitFor(() => expect(screen.getByText('Refresh Preview')).toBeInTheDocument());
    const callsBefore = (adminApi.getEmailPreview as ReturnType<typeof vi.fn>).mock.calls.length;
    await act(async () => {
      fireEvent.click(screen.getByText('Refresh Preview'));
    });
    await waitFor(() => {
      expect((adminApi.getEmailPreview as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it('getEmailPreview API error falls back to local template preview', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getEmailPreview as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('API error'));
    renderWithProviders(<AdminEmailPreview />);
    // iframe should still render even when API fails
    await waitFor(() => {
      expect(document.querySelector('iframe[title="Email Preview"]')).toBeTruthy();
    });
  });

  it('renders the sample data customization heading', () => {
    renderWithProviders(<AdminEmailPreview />);
    expect(screen.getByText('Sample Data (customize as needed)')).toBeInTheDocument();
  });

  it('renders a Divider between template selector and sample data', () => {
    const { container } = renderWithProviders(<AdminEmailPreview />);
    expect(container.querySelector('.ant-divider')).toBeTruthy();
  });
});
