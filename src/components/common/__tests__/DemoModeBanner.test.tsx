import { render, screen, waitFor } from '@testing-library/react';
import DemoModeBanner from '../../DemoModeBanner';

describe('DemoModeBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset VITE_DEMO_MODE to undefined
    delete (import.meta.env as any).VITE_DEMO_MODE;
  });

  it('does not render when VITE_DEMO_MODE is not true', async () => {
    const { container } = render(<DemoModeBanner />);
    // Wait for useEffect to run
    await waitFor(() => {
      expect(container.querySelector('.ant-alert')).toBeNull();
    });
  });

  it('renders when VITE_DEMO_MODE is true', async () => {
    import.meta.env.VITE_DEMO_MODE = 'true';

    render(<DemoModeBanner />);

    await waitFor(() => {
      expect(screen.getByText(/DEMO MODE/)).toBeInTheDocument();
    });
  });

  it('does not render when previously dismissed', async () => {
    localStorage.setItem('demo-mode-banner-dismissed', 'true');
    import.meta.env.VITE_DEMO_MODE = 'true';

    const { container } = render(<DemoModeBanner />);

    await waitFor(() => {
      expect(container.querySelector('.ant-alert')).toBeNull();
    });
  });

  it('uses custom message and storageKey', async () => {
    import.meta.env.VITE_DEMO_MODE = 'true';

    render(
      <DemoModeBanner
        message="Custom demo message"
        storageKey="custom-key"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Custom demo message')).toBeInTheDocument();
    });
  });
});
