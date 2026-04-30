// ===========================================
// ERROR BOUNDARY COMPONENT
// Catches React errors and displays fallback UI
// ===========================================

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service (e.g., Sentry)
    const windowWithSentry = window as unknown as { Sentry?: { captureException: (error: Error, context: Record<string, unknown>) => void } };
    if (windowWithSentry.Sentry) {
      windowWithSentry.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Result
        status="error"
        title="Something went wrong"
        subTitle={error?.message || 'An unexpected error occurred. Please try again.'}
        extra={[
          <Button
            type="primary"
            key="retry"
            icon={<ReloadOutlined />}
            onClick={onReset}
          >
            Try Again
          </Button>,
          <Button
            key="home"
            icon={<HomeOutlined />}
            onClick={handleHome}
          >
            Go Home
          </Button>,
        ]}
      />
    </div>
  );
};

// Export as functional component wrapper for easier use
export const ErrorBoundary: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => {
  return <ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>;
};

export default ErrorBoundary;

