vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    h2: ({ children, ...p }: any) => <h2 {...p}>{children}</h2>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import WelcomeModal from '../WelcomeModal';

describe('WelcomeModal', () => {
  it('renders when visible', () => {
    const { container } = renderWithProviders(
      <WelcomeModal visible={true} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders with userName', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} userName="Alice" />);
    expect(screen.getByText(/Welcome, Alice/i)).toBeInTheDocument();
  });

  it('renders when not visible', () => {
    const { container } = renderWithProviders(
      <WelcomeModal visible={false} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders Welcome to Creator Platform title', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} />);
    expect(screen.getByText('Welcome to Creator Platform')).toBeInTheDocument();
  });

  it('renders Next button', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} />);
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('navigates to next step on Next click', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Discover Creators')).toBeInTheDocument();
  });

  it('renders skip option', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} />);
    // Button text is "Skip Tutorial" in the component
    expect(screen.getByText('Skip Tutorial')).toBeInTheDocument();
  });

  it('renders step 1 description text', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} />);
    expect(
      screen.getByText('Connect with your favorite creators through AI-powered conversations')
    ).toBeInTheDocument();
  });

  it('renders step 2 title after two Next clicks', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Start Chatting')).toBeInTheDocument();
  });

  it('renders Previous button when not on first step', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('Previous button is not visible on the first step', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} />);
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('navigates back to first step using Previous', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Discover Creators')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByText('Welcome to Creator Platform')).toBeInTheDocument();
  });

  it('renders "Get Started" button on the last step', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} />);
    // 4 steps total — click Next 3 times to reach the last step
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('calls onClose when Skip Tutorial is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(<WelcomeModal visible={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Skip Tutorial'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders "Follow & Stay Updated" on the fourth step', () => {
    renderWithProviders(<WelcomeModal visible={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Follow & Stay Updated')).toBeInTheDocument();
  });
});
