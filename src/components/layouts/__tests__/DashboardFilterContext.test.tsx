import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardFilterProvider, useDashboardFilter } from '../DashboardFilterContext';

function Consumer() {
  const { period, setPeriod, days } = useDashboardFilter();
  return (
    <div>
      <span data-testid="period">{period}</span>
      <span data-testid="days">{days}</span>
      <button onClick={() => setPeriod('7D')}>Set 7D</button>
      <button onClick={() => setPeriod('30D')}>Set 30D</button>
    </div>
  );
}

describe('DashboardFilterContext', () => {
  it('provides default period of 90D and 90 days', () => {
    render(
      <DashboardFilterProvider>
        <Consumer />
      </DashboardFilterProvider>
    );
    expect(screen.getByTestId('period').textContent).toBe('90D');
    expect(screen.getByTestId('days').textContent).toBe('90');
  });

  it('updates period and days when setPeriod is called', () => {
    render(
      <DashboardFilterProvider>
        <Consumer />
      </DashboardFilterProvider>
    );
    fireEvent.click(screen.getByText('Set 7D'));
    expect(screen.getByTestId('period').textContent).toBe('7D');
    expect(screen.getByTestId('days').textContent).toBe('7');
  });

  it('updates to 30D', () => {
    render(
      <DashboardFilterProvider>
        <Consumer />
      </DashboardFilterProvider>
    );
    fireEvent.click(screen.getByText('Set 30D'));
    expect(screen.getByTestId('period').textContent).toBe('30D');
    expect(screen.getByTestId('days').textContent).toBe('30');
  });
});
