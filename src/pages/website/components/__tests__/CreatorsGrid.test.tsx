vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...p }: any) => <a href={to} {...p}>{children}</a>,
  };
});

vi.mock('../../WebsiteHome.module.css', () => ({
  default: {},
}));

vi.mock('../../data/creators-data', () => ({
  CREATORS: [
    {
      id: 'creator1',
      name: 'Creator One',
      title: 'Tech Expert',
      chats: '100+ Chats',
      about: 'About Creator One',
      tags: ['Tech'],
      questions: ['How do I code?'],
      cardImg: '/card1.jpg',
      modalImg: '/modal1.jpg',
    },
  ],
}));

vi.mock('../../data/config', () => ({
  getBackendIdForSlug: vi.fn((id: string) => id),
}));

vi.mock('../../../../services/api', () => ({
  getImageUrl: vi.fn((x: string) => x),
}));

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { CreatorsGrid } from '../CreatorsGrid';

describe('CreatorsGrid', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorsGrid />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with API creators', () => {
    const creators = [
      { id: 'api1', displayName: 'API Creator', category: 'Tech', profileImage: null },
    ];
    const { container } = renderWithProviders(
      <CreatorsGrid creators={creators as any} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders creator card button from static data', () => {
    renderWithProviders(<CreatorsGrid />);
    expect(screen.getByLabelText('View Creator One')).toBeInTheDocument();
  });

  it('opens creator modal on card click', () => {
    renderWithProviders(<CreatorsGrid />);
    fireEvent.click(screen.getByLabelText('View Creator One'));
    expect(screen.getByText('Creator One')).toBeInTheDocument();
  });

  it('shows Start Chat link in modal', () => {
    renderWithProviders(<CreatorsGrid />);
    fireEvent.click(screen.getByLabelText('View Creator One'));
    expect(screen.getByText('Start Chat')).toBeInTheDocument();
  });

  it('renders API creator card button', () => {
    const creators = [
      { id: 'api1', displayName: 'API Creator', category: 'Tech', profileImage: null },
    ];
    renderWithProviders(<CreatorsGrid creators={creators as any} />);
    expect(screen.getByLabelText('View API Creator')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    renderWithProviders(<CreatorsGrid />);
    fireEvent.click(screen.getByLabelText('View Creator One'));
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('modal has aria-modal="true"', () => {
    renderWithProviders(<CreatorsGrid />);
    fireEvent.click(screen.getByLabelText('View Creator One'));
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('shows creator title in modal', () => {
    renderWithProviders(<CreatorsGrid />);
    fireEvent.click(screen.getByLabelText('View Creator One'));
    expect(screen.getByText('Tech Expert')).toBeInTheDocument();
  });

  it('shows creator About section in modal', () => {
    renderWithProviders(<CreatorsGrid />);
    fireEvent.click(screen.getByLabelText('View Creator One'));
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('About Creator One')).toBeInTheDocument();
  });

  it('shows creator tag in modal', () => {
    renderWithProviders(<CreatorsGrid />);
    fireEvent.click(screen.getByLabelText('View Creator One'));
    expect(screen.getByText('Topics')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
  });

  it('shows FAQ section with question in modal', () => {
    renderWithProviders(<CreatorsGrid />);
    fireEvent.click(screen.getByLabelText('View Creator One'));
    expect(screen.getByText('Frequently Asked Questions (FAQ)')).toBeInTheDocument();
    expect(screen.getByText('How do I code?')).toBeInTheDocument();
  });

  it('modal Ask Anything input is rendered read-only', () => {
    renderWithProviders(<CreatorsGrid />);
    fireEvent.click(screen.getByLabelText('View Creator One'));
    const input = screen.getByPlaceholderText('Ask Anything');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('readonly');
  });

  it('renders first letter placeholder when no cardImg provided for API creator', () => {
    const creators = [
      { id: 'api2', displayName: 'Zara Lee', category: 'Yoga', profileImage: null },
    ];
    renderWithProviders(<CreatorsGrid creators={creators as any} />);
    expect(screen.getByLabelText('View Zara Lee')).toBeInTheDocument();
  });

  it('Start Chat link points to correct website-chat URL', () => {
    renderWithProviders(<CreatorsGrid />);
    fireEvent.click(screen.getByLabelText('View Creator One'));
    const link = screen.getByRole('link', { name: 'Start Chat' });
    expect(link).toHaveAttribute('href', expect.stringContaining('website-chat'));
  });
});
