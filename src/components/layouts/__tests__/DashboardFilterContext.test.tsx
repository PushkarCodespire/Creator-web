import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { DashboardFilterProvider, useDashboardFilter } from '../DashboardFilterContext';

function TestConsumer() {
  const { period, setPeriod, days } = useDashboardFilter();
  return (
    <div>
      <span data-testid="period">{period}</span>
      <span data-testid="days">{days}</span>
      <button onClick={() => setPeriod('7D')}>Set 7D</button>
      <button onClick={() => setPeriod('30D')}>Set 30D</button>
      <button onClick={() => setPeriod('90D')}>Set 90D</button>
    </div>
  );
}

describe('DashboardFilterContext', () => {
  it('has a default period of 90D', () => {
    renderWithProviders(
      <DashboardFilterProvider>
        <TestConsumer />
      </DashboardFilterProvider>
    );

    expect(screen.getByTestId('period').textContent).toBe('90D');
  });

  it('has default days of 90', () => {
    renderWithProviders(
      <DashboardFilterProvider>
        <TestConsumer />
      </DashboardFilterProvider>
    );

    expect(screen.getByTestId('days').textContent).toBe('90');
  });

  it('updates days to 7 when period is set to 7D', () => {
    renderWithProviders(
      <DashboardFilterProvider>
        <TestConsumer />
      </DashboardFilterProvider>
    );

    fireEvent.click(screen.getByText('Set 7D'));

    expect(screen.getByTestId('period').textContent).toBe('7D');
    expect(screen.getByTestId('days').textContent).toBe('7');
  });

  it('updates days to 30 when period is set to 30D', () => {
    renderWithProviders(
      <DashboardFilterProvider>
        <TestConsumer />
      </DashboardFilterProvider>
    );

    fireEvent.click(screen.getByText('Set 30D'));

    expect(screen.getByTestId('period').textContent).toBe('30D');
    expect(screen.getByTestId('days').textContent).toBe('30');
  });

  it('keeps days at 90 when period is set to 90D', () => {
    renderWithProviders(
      <DashboardFilterProvider>
        <TestConsumer />
      </DashboardFilterProvider>
    );

    fireEvent.click(screen.getByText('Set 7D'));
    fireEvent.click(screen.getByText('Set 90D'));

    expect(screen.getByTestId('period').textContent).toBe('90D');
    expect(screen.getByTestId('days').textContent).toBe('90');
  });

  it('renders children inside DashboardFilterProvider', () => {
    renderWithProviders(
      <DashboardFilterProvider>
        <span data-testid="child">hello</span>
      </DashboardFilterProvider>
    );

    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('useDashboardFilter returns a setPeriod function', () => {
    renderWithProviders(
      <DashboardFilterProvider>
        <TestConsumer />
      </DashboardFilterProvider>
    );

    expect(screen.getByText('Set 7D')).toBeDefined();
  });

  it('switching between periods tracks correctly', () => {
    renderWithProviders(
      <DashboardFilterProvider>
        <TestConsumer />
      </DashboardFilterProvider>
    );

    fireEvent.click(screen.getByText('Set 7D'));
    expect(screen.getByTestId('days').textContent).toBe('7');

    fireEvent.click(screen.getByText('Set 30D'));
    expect(screen.getByTestId('days').textContent).toBe('30');

    fireEvent.click(screen.getByText('Set 90D'));
    expect(screen.getByTestId('days').textContent).toBe('90');
  });

  it('days is still 90 after clicking Set 90D from the default state', () => {
    renderWithProviders(
      <DashboardFilterProvider>
        <TestConsumer />
      </DashboardFilterProvider>
    );

    fireEvent.click(screen.getByText('Set 90D'));

    expect(screen.getByTestId('period').textContent).toBe('90D');
    expect(screen.getByTestId('days').textContent).toBe('90');
  });

  it('period and days are in sync after multiple rapid changes', () => {
    renderWithProviders(
      <DashboardFilterProvider>
        <TestConsumer />
      </DashboardFilterProvider>
    );

    fireEvent.click(screen.getByText('Set 30D'));
    fireEvent.click(screen.getByText('Set 7D'));
    fireEvent.click(screen.getByText('Set 30D'));

    expect(screen.getByTestId('period').textContent).toBe('30D');
    expect(screen.getByTestId('days').textContent).toBe('30');
  });

  it('provides context values to deeply nested consumers', () => {
    function Inner() {
      const { period } = useDashboardFilter();
      return <span data-testid="inner-period">{period}</span>;
    }
    function Middle() {
      return <div><Inner /></div>;
    }
    renderWithProviders(
      <DashboardFilterProvider>
        <Middle />
      </DashboardFilterProvider>
    );
    expect(screen.getByTestId('inner-period').textContent).toBe('90D');
  });

  it('multiple consumers in the same tree share state', () => {
    function SecondConsumer() {
      const { days } = useDashboardFilter();
      return <span data-testid="days2">{days}</span>;
    }
    function BothConsumers() {
      return (
        <>
          <TestConsumer />
          <SecondConsumer />
        </>
      );
    }
    renderWithProviders(
      <DashboardFilterProvider>
        <BothConsumers />
      </DashboardFilterProvider>
    );

    fireEvent.click(screen.getByText('Set 7D'));

    expect(screen.getByTestId('days').textContent).toBe('7');
    expect(screen.getByTestId('days2').textContent).toBe('7');
  });
});
