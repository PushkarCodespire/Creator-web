import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  authApi: { becomeCreator: vi.fn().mockResolvedValue({ data: { data: { user: {}, token: 'tok' } } }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../components/CustomizeForm', () => ({
  CustomizeForm: ({ onAction }: { onAction: () => void }) => (
    <div data-testid="customize-form">
      <button onClick={onAction}>Mock Action</button>
    </div>
  ),
}));

import WebsiteCreateAI from '../WebsiteCreateAI';

describe('WebsiteCreateAI', () => {
  it('renders without crashing', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Create Your/i)).toBeInTheDocument();
  });

  it('renders hero section', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Creator Pal/i)).toBeInTheDocument();
    expect(screen.getByText(/Create My AI/i)).toBeInTheDocument();
  });

  it('renders testimonials section', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    expect(screen.getByText('Sarah Miller')).toBeInTheDocument();
    expect(screen.getByText('Mike Torres')).toBeInTheDocument();
  });

  it('renders How It Works section with 3 steps', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Connect Content')).toBeInTheDocument();
    expect(screen.getByText('Tweak It')).toBeInTheDocument();
    expect(screen.getByText('Ready to Launch')).toBeInTheDocument();
  });

  it('renders Train Your AI section', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Train Your AI')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('PDFs')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('renders customize form', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByTestId('customize-form')).toBeInTheDocument();
  });

  it('renders live section', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Your CreatorPal is Live/i)).toBeInTheDocument();
  });

  it('renders disclaimer text', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Free till 31st May/i)).toBeInTheDocument();
  });
});
