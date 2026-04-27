vi.mock('../CreatorSidebar', () => ({
  default: () => <div data-testid="creator-sidebar" />,
}));

vi.mock('../CreatorHeader', () => ({
  default: () => <div data-testid="creator-header" />,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, Outlet: () => <div data-testid="outlet" /> };
});

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CreatorDashboardLayout from '../CreatorDashboardLayout';

describe('CreatorDashboardLayout', () => {
  it('renders sidebar, header, and outlet', () => {
    const { getByTestId } = renderWithProviders(<CreatorDashboardLayout />);
    expect(getByTestId('creator-sidebar')).toBeTruthy();
    expect(getByTestId('creator-header')).toBeTruthy();
    expect(getByTestId('outlet')).toBeTruthy();
  });
});
