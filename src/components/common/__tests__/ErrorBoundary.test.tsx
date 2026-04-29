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

  it('renders "Try Again" and "Go Home" buttons in default fallback', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowingComponent message="render buttons" />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go Home/i })).toBeInTheDocument();
  });

  it('does not render custom fallback when no error occurs', () => {
    renderWithProviders(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <GoodComponent />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Custom fallback')).not.toBeInTheDocument();
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('resets error state when Try Again is clicked and shows fallback before reset', () => {
    // ThrowingComponent always throws so we verify reset shows fallback still
    renderWithProviders(
      <ErrorBoundary>
        <ThrowingComponent message="reset check error" />
      </ErrorBoundary>
    );

    // Error UI should be visible immediately (synchronous error boundary)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();

    // After clicking Try Again, the boundary resets (child re-throws, boundary catches again)
    screen.getByRole('button', { name: /Try Again/i }).click();

    // Boundary catches the re-thrown error and shows the fallback again
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders the actual error message as subTitle in default fallback', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowingComponent message="Specific error message" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Specific error message')).toBeInTheDocument();
  });

  it('custom fallback suppresses both "Try Again" and "Go Home" buttons', () => {
    renderWithProviders(
      <ErrorBoundary fallback={<div>Minimal fallback</div>}>
        <ThrowingComponent message="suppress buttons" />
      </ErrorBoundary>
    );

    expect(screen.queryByRole('button', { name: /Try Again/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Go Home/i })).not.toBeInTheDocument();
  });

  it('renders multiple children correctly when no error occurs', () => {
    renderWithProviders(
      <ErrorBoundary>
        <div>Child One</div>
        <div>Child Two</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child One')).toBeInTheDocument();
    expect(screen.getByText('Child Two')).toBeInTheDocument();
  });

  it('does not render children when a child throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowingComponent message="child throws" />
      </ErrorBoundary>
    );

    expect(screen.queryByText('All good')).not.toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders a deeply nested throwing component and shows fallback', () => {
    renderWithProviders(
      <ErrorBoundary>
        <div>
          <div>
            <ThrowingComponent message="nested throw" />
          </div>
        </div>
      </ErrorBoundary>
    );

    expect(screen.getByText('nested throw')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders custom fallback as a React element with custom content', () => {
    renderWithProviders(
      <ErrorBoundary fallback={<p>Oops, an error happened</p>}>
        <ThrowingComponent message="any error" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops, an error happened')).toBeInTheDocument();
  });

  it('default fallback shows "Something went wrong" title for every thrown error', () => {
    const AnotherThrower = () => { throw new Error('another error'); };
    renderWithProviders(
      <ErrorBoundary>
        <AnotherThrower />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('another error')).toBeInTheDocument();
  });

  it('wrapping a good component with a custom fallback still renders the child', () => {
    renderWithProviders(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <div>Healthy child</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Healthy child')).toBeInTheDocument();
    expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
  });

  it('two independent ErrorBoundaries isolate errors correctly', () => {
    renderWithProviders(
      <div>
        <ErrorBoundary>
          <ThrowingComponent message="boundary one error" />
        </ErrorBoundary>
        <ErrorBoundary>
          <GoodComponent />
        </ErrorBoundary>
      </div>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('All good')).toBeInTheDocument();
  });
});
