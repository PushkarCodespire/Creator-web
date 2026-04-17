import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ErrorBoundary } from '../ErrorBoundary';

// Suppress console.error noise from React ErrorBoundary internals
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// A component that always throws
const ThrowingComponent = ({ message }: { message: string }) => {
  throw new Error(message);
};

// A component that renders normally
const GoodComponent = () => <div>All good</div>;

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    renderWithProviders(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders default fallback UI when a child throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowingComponent message="Test error" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    renderWithProviders(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent message="Oops" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('shows generic message when error has no message', () => {
    const EmptyErrorComponent = () => {
      throw new Error('');
    };

    renderWithProviders(
      <ErrorBoundary>
        <EmptyErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    // Empty message falls back to the default subTitle text
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
  });
});
