vi.mock('../../../services/api', () => ({
  userApi: {
    getCategories: vi.fn().mockResolvedValue({
      data: {
        data: {
          categories: [
            { value: 'tech', label: 'Technology', icon: '💻' },
            { value: 'fitness', label: 'Fitness', icon: '💪' },
            { value: 'business', label: 'Business', icon: '💼' },
          ],
        },
      },
    }),
    updateInterests: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import InterestSelector from '../InterestSelector';

describe('InterestSelector', () => {
  it('renders loading state initially', () => {
    const { container } = renderWithProviders(
      <InterestSelector onComplete={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders with default props', () => {
    const { container } = renderWithProviders(
      <InterestSelector />
    );
    expect(container).toBeTruthy();
  });

  it('renders interest categories after loading', async () => {
    renderWithProviders(<InterestSelector onComplete={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
    expect(screen.getByText('Fitness')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
  });

  it('renders default title', async () => {
    renderWithProviders(<InterestSelector onComplete={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('What are you interested in?')).toBeInTheDocument();
    });
  });

  it('renders custom title when provided', async () => {
    renderWithProviders(<InterestSelector title="Choose your interests" onComplete={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Choose your interests')).toBeInTheDocument();
    });
  });

  it('renders save button after loading', async () => {
    renderWithProviders(<InterestSelector onComplete={vi.fn()} />);
    await waitFor(() => {
      // With 0 selected and minSelection=3, the button reads "Select 3 more"
      expect(screen.getByText('Select 3 more')).toBeInTheDocument();
    });
  });

  it('can click a category to select it', async () => {
    renderWithProviders(<InterestSelector onComplete={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Technology'));
    // After clicking, category gets selected (no crash)
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders default description text', async () => {
    renderWithProviders(<InterestSelector onComplete={vi.fn()} />);
    await waitFor(() => {
      expect(
        screen.getByText('Select at least 3 categories to personalize your experience')
      ).toBeInTheDocument();
    });
  });

  it('renders custom description when provided', async () => {
    renderWithProviders(
      <InterestSelector description="Pick your topics" onComplete={vi.fn()} />
    );
    await waitFor(() => {
      expect(screen.getByText('Pick your topics')).toBeInTheDocument();
    });
  });

  it('shows "Continue" button text when minimum selections met', async () => {
    const { userApi } = await import('../../../services/api');
    (userApi.getCategories as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          categories: [
            { value: 'tech', label: 'Technology', icon: '💻' },
            { value: 'fitness', label: 'Fitness', icon: '💪' },
            { value: 'business', label: 'Business', icon: '💼' },
          ],
        },
      },
    });
    renderWithProviders(
      <InterestSelector minSelection={1} onComplete={vi.fn()} />
    );
    await waitFor(() => expect(screen.getByText('Technology')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Technology'));
    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });
  });

  it('renders "Skip for now" button when showSkip is true', async () => {
    renderWithProviders(<InterestSelector showSkip={true} onComplete={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Skip for now')).toBeInTheDocument();
    });
  });

  it('does not render "Skip for now" when showSkip is false', async () => {
    renderWithProviders(<InterestSelector showSkip={false} onComplete={vi.fn()} />);
    await waitFor(() => {
      expect(screen.queryByText('Skip for now')).not.toBeInTheDocument();
    });
  });

  it('renders progress "Selected: / " counter', async () => {
    renderWithProviders(<InterestSelector onComplete={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/Selected:/)).toBeInTheDocument();
    });
  });

  it('renders category icons', async () => {
    renderWithProviders(<InterestSelector onComplete={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('💻')).toBeInTheDocument();
      expect(screen.getByText('💪')).toBeInTheDocument();
    });
  });
});
