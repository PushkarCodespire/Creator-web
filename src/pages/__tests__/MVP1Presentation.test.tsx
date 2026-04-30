import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import MVP1Presentation from '../MVP1Presentation';

describe('MVP1Presentation', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<MVP1Presentation />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders tab navigation', () => {
    renderWithProviders(<MVP1Presentation />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('User Types')).toBeInTheDocument();
    expect(screen.getByText('AI Technology')).toBeInTheDocument();
  });

  it('renders MVP1 Status tab', () => {
    renderWithProviders(<MVP1Presentation />);
    expect(screen.getByText('MVP1 Status')).toBeInTheDocument();
  });

  it('renders feature checklist items', async () => {
    renderWithProviders(<MVP1Presentation />);
    // Feature checklist is in the MVP1 Status tab — click it first
    fireEvent.click(screen.getByText('MVP1 Status'));
    await waitFor(() => {
      expect(screen.getAllByText(/AI Chat System/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/User Management/i)[0]).toBeInTheDocument();
    });
  });

  it('renders Money Flow tab', () => {
    renderWithProviders(<MVP1Presentation />);
    expect(screen.getByText('Money Flow')).toBeInTheDocument();
  });

  it('renders the page header title', () => {
    renderWithProviders(<MVP1Presentation />);
    expect(screen.getByText('AI Creator Platform')).toBeInTheDocument();
  });

  it('renders the MVP1 Investor Presentation subtitle', () => {
    renderWithProviders(<MVP1Presentation />);
    expect(screen.getByText('MVP1 Investor Presentation')).toBeInTheDocument();
  });

  it('renders completion percentage badge', () => {
    renderWithProviders(<MVP1Presentation />);
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('renders all 8 tab buttons', () => {
    renderWithProviders(<MVP1Presentation />);
    const expectedTabs = ['Overview', 'User Types', 'User Journeys', 'AI Technology', 'Features & Pages', 'Money Flow', 'Technical Architecture', 'MVP1 Status'];
    expectedTabs.forEach((tab) => {
      expect(screen.getByText(tab)).toBeInTheDocument();
    });
  });

  it('Overview tab shows Platform Vision and Key Metrics by default', () => {
    renderWithProviders(<MVP1Presentation />);
    expect(screen.getByText('Platform Vision')).toBeInTheDocument();
    expect(screen.getByText('Key Metrics')).toBeInTheDocument();
  });

  it('Overview tab shows metric values: 50 creators, 200 users', () => {
    renderWithProviders(<MVP1Presentation />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('Creators')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('clicking User Types tab shows Fans (Users) card', async () => {
    renderWithProviders(<MVP1Presentation />);
    fireEvent.click(screen.getByText('User Types'));
    await waitFor(() => {
      expect(screen.getByText('Fans (Users)')).toBeInTheDocument();
    });
  });

  it('clicking User Types tab shows Creators and Companies cards', async () => {
    renderWithProviders(<MVP1Presentation />);
    fireEvent.click(screen.getByText('User Types'));
    await waitFor(() => {
      expect(screen.getByText('Creators')).toBeInTheDocument();
      expect(screen.getByText('Companies (Brands)')).toBeInTheDocument();
    });
  });

  it('clicking User Journeys tab shows Fan Journey', async () => {
    renderWithProviders(<MVP1Presentation />);
    fireEvent.click(screen.getByText('User Journeys'));
    await waitFor(() => {
      expect(screen.getByText('Fan Journey')).toBeInTheDocument();
    });
  });

  it('clicking AI Technology tab shows Content Training Pipeline', async () => {
    renderWithProviders(<MVP1Presentation />);
    fireEvent.click(screen.getByText('AI Technology'));
    await waitFor(() => {
      expect(screen.getByText('Content Training Pipeline')).toBeInTheDocument();
    });
  });

  it('clicking Features & Pages tab shows Public Pages section', async () => {
    renderWithProviders(<MVP1Presentation />);
    fireEvent.click(screen.getByText('Features & Pages'));
    await waitFor(() => {
      expect(screen.getByText('Public Pages')).toBeInTheDocument();
    });
  });

  it('clicking Money Flow tab shows Subscription Revenue Flow', async () => {
    renderWithProviders(<MVP1Presentation />);
    fireEvent.click(screen.getByText('Money Flow'));
    await waitFor(() => {
      expect(screen.getByText('Subscription Revenue Flow')).toBeInTheDocument();
    });
  });

  it('clicking Technical Architecture tab shows Frontend Stack and Backend Stack', async () => {
    renderWithProviders(<MVP1Presentation />);
    fireEvent.click(screen.getByText('Technical Architecture'));
    await waitFor(() => {
      expect(screen.getByText('Frontend Stack')).toBeInTheDocument();
      expect(screen.getByText('Backend Stack')).toBeInTheDocument();
    });
  });

  it('MVP1 Status tab shows overall completion percentage and feature counts', async () => {
    renderWithProviders(<MVP1Presentation />);
    fireEvent.click(screen.getByText('MVP1 Status'));
    await waitFor(() => {
      expect(screen.getByText('Overall Completion')).toBeInTheDocument();
      expect(screen.getByText('Features Complete')).toBeInTheDocument();
      expect(screen.getByText('Features Pending')).toBeInTheDocument();
    });
  });
});
