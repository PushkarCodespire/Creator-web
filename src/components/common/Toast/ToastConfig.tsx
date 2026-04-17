// ===========================================
// TOAST NOTIFICATION CONFIGURATION
// react-toastify setup with custom styling
// ===========================================

import { toast, ToastOptions, ToastContainer as ToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { colors, borderRadius, shadows } from '../../../styles/tokens';
import {
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle
} from 'lucide-react';

/**
 * Default Toast Configuration
 */
export const defaultToastConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  style: {
    borderRadius: borderRadius.lg,
    boxShadow: shadows.xl,
    fontFamily: "'Inter', sans-serif",
    padding: '12px 16px',
  },
};

/**
 * Custom Toast Functions
 */
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      ...defaultToastConfig,
      ...options,
      icon: <CheckCircle size={20} color="#ffffff" />,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      ...defaultToastConfig,
      ...options,
      icon: <XCircle size={20} color="#ffffff" />,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, {
      ...defaultToastConfig,
      ...options,
      icon: <Info size={20} color="#ffffff" />,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      ...defaultToastConfig,
      ...options,
      icon: <AlertTriangle size={20} color="#ffffff" />,
    });
  },

  promise: async <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, {
      pending: {
        render: loading,
        ...defaultToastConfig,
      },
      success: {
        render: typeof success === 'function' ? ({ data }) => success(data as T) : success,
        ...defaultToastConfig,
      },
      error: {
        render: typeof error === 'function' ? ({ data }) => error(data) : error,
        ...defaultToastConfig,
      },
    });
  },
};

/**
 * Toast Container Component
 * Add this to your root App component
 */
export const ToastContainer = () => {
  return (
    <ToastifyContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{
        zIndex: 9999,
      }}
      toastStyle={{
        borderRadius: borderRadius.lg,
        boxShadow: shadows.xl,
        fontFamily: "'Inter', sans-serif",
      }}
    />
  );
};

// Custom CSS (inject in global styles)
export const toastStyles = `
  .Toastify__toast {
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.xl};
    font-family: 'Inter', sans-serif;
  }

  .Toastify__toast--success {
    background: linear-gradient(135deg, ${colors.success.start} 0%, ${colors.success.end} 100%);
    color: white;
  }

  .Toastify__toast--error {
    background: linear-gradient(135deg, ${colors.error.start} 0%, ${colors.error.end} 100%);
    color: white;
  }

  .Toastify__toast--warning {
    background: linear-gradient(135deg, ${colors.warning.start} 0%, ${colors.warning.end} 100%);
    color: white;
  }

  .Toastify__toast--info {
    background: linear-gradient(135deg, ${colors.primary.start} 0%, ${colors.primary.end} 100%);
    color: white;
  }

  .Toastify__progress-bar {
    background: rgba(255, 255, 255, 0.7);
  }

  .Toastify__close-button {
    color: white;
    opacity: 0.7;
  }

  .Toastify__close-button:hover {
    opacity: 1;
  }
`;

export default showToast;
