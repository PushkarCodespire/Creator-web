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

  it('renders an ant-alert element when demo mode is active', async () => {
    import.meta.env.VITE_DEMO_MODE = 'true';

    const { container } = render(<DemoModeBanner />);

    await waitFor(() => {
      expect(container.querySelector('.ant-alert')).toBeInTheDocument();
    });
  });

  it('renders the default message text when no message prop is given', async () => {
    import.meta.env.VITE_DEMO_MODE = 'true';

    render(<DemoModeBanner />);

    await waitFor(() => {
      expect(screen.getByText(/Payments, emails, and payouts are simulated/)).toBeInTheDocument();
    });
  });

  it('stores dismissal in localStorage using the custom storageKey', async () => {
    import.meta.env.VITE_DEMO_MODE = 'true';

    render(
      <DemoModeBanner
        message="Dismiss test"
        storageKey="my-custom-key"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Dismiss test')).toBeInTheDocument();
    });

    // Simulate closing the alert
    const closeBtn = document.querySelector('.ant-alert-close-icon');
    if (closeBtn) {
      (closeBtn as HTMLElement).click();
      await waitFor(() => {
        expect(localStorage.getItem('my-custom-key')).toBe('true');
      });
    }
  });

  it('respects custom storageKey for dismissal — custom key dismissed does not hide default key banner', async () => {
    // Dismiss only the custom key
    localStorage.setItem('custom-key', 'true');
    import.meta.env.VITE_DEMO_MODE = 'true';

    // Default key banner should still appear
    render(<DemoModeBanner />);

    await waitFor(() => {
      expect(screen.getByText(/DEMO MODE/)).toBeInTheDocument();
    });
  });

  it('does not render when VITE_DEMO_MODE is set to a non-true string', async () => {
    import.meta.env.VITE_DEMO_MODE = 'false';

    const { container } = render(<DemoModeBanner />);

    await waitFor(() => {
      expect(container.querySelector('.ant-alert')).toBeNull();
    });
  });

  it('hides banner after close handler is called', async () => {
    import.meta.env.VITE_DEMO_MODE = 'true';

    const { container } = render(<DemoModeBanner />);

    await waitFor(() => {
      expect(container.querySelector('.ant-alert')).toBeInTheDocument();
    });

    const closeBtn = container.querySelector('.ant-alert-close-icon');
    if (closeBtn) {
      (closeBtn as HTMLElement).click();
      await waitFor(() => {
        expect(container.querySelector('.ant-alert')).toBeNull();
      });
    }
  });

  it('renders null immediately when VITE_DEMO_MODE is absent', () => {
    const { container } = render(<DemoModeBanner />);
    // Before useEffect fires, visible starts false so nothing renders
    expect(container.firstChild).toBeNull();
  });

  it('renders an ant-alert of type warning', async () => {
    import.meta.env.VITE_DEMO_MODE = 'true';

    const { container } = render(<DemoModeBanner />);

    await waitFor(() => {
      expect(container.querySelector('.ant-alert-warning')).toBeInTheDocument();
    });
  });

  it('default storageKey is "demo-mode-banner-dismissed"', async () => {
    import.meta.env.VITE_DEMO_MODE = 'true';

    const { container } = render(<DemoModeBanner />);

    await waitFor(() => {
      expect(container.querySelector('.ant-alert')).toBeInTheDocument();
    });

    const closeBtn = container.querySelector('.ant-alert-close-icon');
    if (closeBtn) {
      (closeBtn as HTMLElement).click();
      await waitFor(() => {
        expect(localStorage.getItem('demo-mode-banner-dismissed')).toBe('true');
      });
    }
  });

  it('does not render when default storageKey is already dismissed', async () => {
    localStorage.setItem('demo-mode-banner-dismissed', 'true');
    import.meta.env.VITE_DEMO_MODE = 'true';

    const { container } = render(<DemoModeBanner />);

    await waitFor(() => {
      expect(container.querySelector('.ant-alert')).toBeNull();
    });
  });

  it('renders when custom storageKey has not been dismissed', async () => {
    import.meta.env.VITE_DEMO_MODE = 'true';
    // custom-fresh-key not set in localStorage

    render(
      <DemoModeBanner
        message="Fresh demo"
        storageKey="custom-fresh-key"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Fresh demo')).toBeInTheDocument();
    });
  });

  it('renders the banner as closable (has a close button)', async () => {
    import.meta.env.VITE_DEMO_MODE = 'true';

    const { container } = render(<DemoModeBanner />);

    await waitFor(() => {
      expect(container.querySelector('.ant-alert-close-icon')).toBeInTheDocument();
    });
  });
});
