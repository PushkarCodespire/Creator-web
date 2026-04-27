vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...p }: any) => <a href={to} {...p}>{children}</a>,
  };
});

vi.mock('../../WebsiteHome.module.css', () => ({ default: {} }));

import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { WebsiteFooter } from '../WebsiteFooter';

describe('WebsiteFooter', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<WebsiteFooter />);
    expect(container.firstChild).toBeTruthy();
  });
});
