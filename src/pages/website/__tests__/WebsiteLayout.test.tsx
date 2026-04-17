import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../components/WebsiteNav', () => ({
  WebsiteNav: () => <nav data-testid="website-nav">Nav</nav>,
}));

vi.mock('../components/WebsiteFooter', () => ({
  WebsiteFooter: () => <footer data-testid="website-footer">Footer</footer>,
}));

import WebsiteLayout from '../WebsiteLayout';

describe('WebsiteLayout', () => {
  it('renders without crashing', () => {
    renderWithProviders(<WebsiteLayout />);
    expect(screen.getByTestId('website-nav')).toBeInTheDocument();
    expect(screen.getByTestId('website-footer')).toBeInTheDocument();
  });

  it('renders nav component', () => {
    renderWithProviders(<WebsiteLayout />);
    expect(screen.getByTestId('website-nav')).toBeInTheDocument();
  });

  it('renders footer component', () => {
    renderWithProviders(<WebsiteLayout />);
    expect(screen.getByTestId('website-footer')).toBeInTheDocument();
  });
});
