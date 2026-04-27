vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    promise: vi.fn(),
  },
  ToastContainer: ({ children }: any) => <div data-testid="toast-container">{children}</div>,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import showToast, { ToastContainer, defaultToastConfig } from '../Toast/ToastConfig';
import { toast } from 'react-toastify';

describe('ToastConfig', () => {
  it('ToastContainer renders', () => {
    const { getByTestId } = renderWithProviders(<ToastContainer />);
    expect(getByTestId('toast-container')).toBeTruthy();
  });

  it('defaultToastConfig has position', () => {
    expect(defaultToastConfig.position).toBe('top-right');
  });

  it('showToast.success calls toast.success', () => {
    showToast.success('Test message');
    expect(toast.success).toHaveBeenCalledWith('Test message', expect.any(Object));
  });

  it('showToast.error calls toast.error', () => {
    showToast.error('Error message');
    expect(toast.error).toHaveBeenCalledWith('Error message', expect.any(Object));
  });

  it('showToast.info calls toast.info', () => {
    showToast.info('Info message');
    expect(toast.info).toHaveBeenCalledWith('Info message', expect.any(Object));
  });

  it('showToast.warning calls toast.warning', () => {
    showToast.warning('Warning message');
    expect(toast.warning).toHaveBeenCalledWith('Warning message', expect.any(Object));
  });
});
