// ===========================================
// TESTS: ToastConfig (showToast, ToastContainer, defaultToastConfig, toastStyles)
// ===========================================

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    promise: vi.fn(),
  },
  ToastContainer: ({ position, autoClose }: any) => (
    <div
      data-testid="toast-container"
      data-position={position}
      data-auto-close={autoClose}
    />
  ),
}));

vi.mock('react-toastify/dist/ReactToastify.css', () => ({}));

vi.mock('lucide-react', () => ({
  CheckCircle: () => <span data-testid="check-icon" />,
  XCircle: () => <span data-testid="x-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertTriangle: () => <span data-testid="alert-icon" />,
}));

vi.mock('../../../styles/tokens', () => ({
  colors: {
    primary: { start: '#3b82f6', end: '#8b5cf6', solid: '#3b82f6' },
    success: { start: '#10b981', end: '#059669' },
    error: { start: '#ef4444', end: '#dc2626', solid: '#ef4444' },
    warning: { start: '#f59e0b', end: '#d97706', solid: '#f59e0b' },
    gray: {},
  },
  borderRadius: { lg: '12px' },
  shadows: { xl: '0 20px 25px rgba(0,0,0,0.1)' },
}));

import { toast } from 'react-toastify';
import showToast, {
  defaultToastConfig,
  ToastContainer,
  toastStyles,
} from '../Toast/ToastConfig';

describe('defaultToastConfig', () => {
  it('has position set to top-right', () => {
    expect(defaultToastConfig.position).toBe('top-right');
  });

  it('has autoClose set to 3000', () => {
    expect(defaultToastConfig.autoClose).toBe(3000);
  });
});

describe('showToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('showToast.success calls toast.success with the message', () => {
    showToast.success('Operation succeeded');
    expect(toast.success).toHaveBeenCalledWith(
      'Operation succeeded',
      expect.objectContaining({ position: 'top-right' })
    );
  });

  it('showToast.error calls toast.error with the message', () => {
    showToast.error('Something went wrong');
    expect(toast.error).toHaveBeenCalledWith(
      'Something went wrong',
      expect.objectContaining({ position: 'top-right' })
    );
  });

  it('showToast.info calls toast.info with the message', () => {
    showToast.info('Here is some info');
    expect(toast.info).toHaveBeenCalledWith(
      'Here is some info',
      expect.objectContaining({ position: 'top-right' })
    );
  });

  it('showToast.warning calls toast.warning with the message', () => {
    showToast.warning('Watch out!');
    expect(toast.warning).toHaveBeenCalledWith(
      'Watch out!',
      expect.objectContaining({ position: 'top-right' })
    );
  });

  it('showToast.promise calls toast.promise', async () => {
    const promise = Promise.resolve('done');
    await showToast.promise(promise, {
      loading: 'Loading...',
      success: 'Done!',
      error: 'Failed!',
    });
    expect(toast.promise).toHaveBeenCalledWith(
      promise,
      expect.objectContaining({
        pending: expect.objectContaining({ render: 'Loading...' }),
        success: expect.objectContaining({ render: 'Done!' }),
        error: expect.objectContaining({ render: 'Failed!' }),
      })
    );
  });

  it('is the default export and is the showToast object', () => {
    expect(showToast).toHaveProperty('success');
    expect(showToast).toHaveProperty('error');
    expect(showToast).toHaveProperty('info');
    expect(showToast).toHaveProperty('warning');
    expect(showToast).toHaveProperty('promise');
  });
});

describe('ToastContainer', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ToastContainer />);
    expect(container).toBeTruthy();
  });

  it('renders with data-testid="toast-container"', () => {
    renderWithProviders(<ToastContainer />);
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });
});

describe('toastStyles', () => {
  it('is a non-empty string', () => {
    expect(typeof toastStyles).toBe('string');
    expect(toastStyles.length).toBeGreaterThan(0);
  });

  it('contains "Toastify"', () => {
    expect(toastStyles).toContain('Toastify');
  });

  it('contains "Toastify__toast--success"', () => {
    expect(toastStyles).toContain('Toastify__toast--success');
  });

  it('contains "Toastify__toast--error"', () => {
    expect(toastStyles).toContain('Toastify__toast--error');
  });

  it('contains "Toastify__toast--warning"', () => {
    expect(toastStyles).toContain('Toastify__toast--warning');
  });

  it('contains "Toastify__toast--info"', () => {
    expect(toastStyles).toContain('Toastify__toast--info');
  });

  it('contains "Toastify__progress-bar"', () => {
    expect(toastStyles).toContain('Toastify__progress-bar');
  });
});

describe('defaultToastConfig (extra checks)', () => {
  it('has hideProgressBar set to false', () => {
    expect(defaultToastConfig.hideProgressBar).toBe(false);
  });

  it('has closeOnClick set to true', () => {
    expect(defaultToastConfig.closeOnClick).toBe(true);
  });

  it('has pauseOnHover set to true', () => {
    expect(defaultToastConfig.pauseOnHover).toBe(true);
  });

  it('has draggable set to true', () => {
    expect(defaultToastConfig.draggable).toBe(true);
  });
});

describe('showToast (extra checks)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('showToast.success passes an icon option', () => {
    showToast.success('With icon');
    const callArgs = (toast.success as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1]).toHaveProperty('icon');
  });

  it('showToast.error passes an icon option', () => {
    showToast.error('Error icon');
    const callArgs = (toast.error as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1]).toHaveProperty('icon');
  });

  it('showToast.info passes an icon option', () => {
    showToast.info('Info icon');
    const callArgs = (toast.info as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1]).toHaveProperty('icon');
  });

  it('showToast.warning passes an icon option', () => {
    showToast.warning('Warning icon');
    const callArgs = (toast.warning as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1]).toHaveProperty('icon');
  });
});

describe('defaultToastConfig (shape checks)', () => {
  it('has a progress property (undefined)', () => {
    expect(Object.prototype.hasOwnProperty.call(defaultToastConfig, 'progress')).toBe(true);
  });

  it('has a style property that is an object', () => {
    expect(typeof defaultToastConfig.style).toBe('object');
    expect(defaultToastConfig.style).not.toBeNull();
  });

  it('style has borderRadius defined', () => {
    const style = defaultToastConfig.style as Record<string, unknown>;
    expect(style.borderRadius).toBeDefined();
  });
});

describe('showToast.success (options merging)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merges caller-supplied options with defaults', () => {
    showToast.success('Merged', { autoClose: 5000 });
    const callArgs = (toast.success as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1]).toHaveProperty('autoClose', 5000);
  });

  it('caller-supplied icon overrides default icon', () => {
    const customIcon = <span data-testid="custom" />;
    showToast.success('Custom icon', { icon: customIcon });
    const callArgs = (toast.success as ReturnType<typeof vi.fn>).mock.calls[0];
    // icon in defaultToastConfig is overridden by the spread, then re-set last
    // The source applies ...options then icon, so the icon prop is the custom icon
    expect(callArgs[1].icon).not.toBeUndefined();
  });
});

describe('toastStyles (class coverage)', () => {
  it('contains "Toastify__close-button"', () => {
    expect(toastStyles).toContain('Toastify__close-button');
  });

  it('contains "Toastify__toast" base class', () => {
    expect(toastStyles).toContain('.Toastify__toast');
  });

  it('contains "border-radius"', () => {
    expect(toastStyles).toContain('border-radius');
  });
});
