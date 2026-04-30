import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../../components/common/Button/CustomButton', () => ({
  default: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('../../components/common/Card/CustomCard', () => ({
  default: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('../../components/Discovery', () => ({
  FeaturedCreators: () => <div data-testid="featured-creators">Featured Creators</div>,
}));

vi.mock('../../styles/animations', () => ({
  pageVariants: {},
  fadeIn: {},
  slideUp: {},
  scaleIn: {},
  staggerContainer: {},
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: vi.fn(() => true),
  useAnimation: vi.fn(() => ({ start: vi.fn() })),
}));

vi.mock('lucide-react', () => ({
  MessageSquare: () => <span />,
  Rocket: () => <span />,
  CircleDollarSign: () => <span />,
  Users: () => <span />,
  CheckCircle2: () => <span />,
  Star: () => <span />,
  ArrowRight: () => <span />,
  Play: () => <span />,
  ShieldCheck: () => <span />,
  Sparkles: () => <span />,
  TrendingUp: () => <span />,
  Zap: () => <span />,
}));

import Landing from '../Landing';

describe('Landing', () => {
  it('renders without crashing', () => {
    renderWithProviders(<Landing />);
    // Landing page should render something
    expect(document.querySelector('div')).toBeTruthy();
  });

  it('renders featured creators component', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByTestId('featured-creators')).toBeInTheDocument();
  });

  it('renders testimonials section with reviewer names', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('Rahul Mehta')).toBeInTheDocument();
    expect(screen.getByText('Anjali Verma')).toBeInTheDocument();
  });

  it('renders creator steps section', () => {
    renderWithProviders(<Landing />);
    // 'Upload your content' appears in both steps section and pricing card features list
    expect(screen.getAllByText('Upload your content')[0]).toBeInTheDocument();
    expect(screen.getByText(/AI trains on your expertise/i)).toBeInTheDocument();
    expect(screen.getByText(/Go live & start earning/i)).toBeInTheDocument();
  });

  it('renders user steps section', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Find your creator')).toBeInTheDocument();
    expect(screen.getByText('Ask anything')).toBeInTheDocument();
    expect(screen.getByText(/Get 24\/7 support/i)).toBeInTheDocument();
  });

  it('renders pricing plans', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Start Free')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Scale Without Burnout')).toBeInTheDocument();
    expect(screen.getByText('Deep Community Insights')).toBeInTheDocument();
    expect(screen.getByText('Personalized AI')).toBeInTheDocument();
    expect(screen.getByText('Secure & Private')).toBeInTheDocument();
  });

  it('renders hero headline text', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Turn Your Expertise Into')).toBeInTheDocument();
    expect(screen.getByText('24/7 AI Conversations')).toBeInTheDocument();
  });

  it('renders Start as Creator CTA button', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Start as Creator')).toBeInTheDocument();
  });

  it('renders Explore Creators buttons', () => {
    renderWithProviders(<Landing />);
    const buttons = screen.getAllByText('Explore Creators');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders FAQ section heading', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('renders FAQ question labels', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('How does the AI learn from creators?')).toBeInTheDocument();
    expect(screen.getByText('How accurate are the AI responses?')).toBeInTheDocument();
  });

  it('renders "How it works" section heading', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('How it works')).toBeInTheDocument();
  });

  it('renders "For creators" and "For users" sub-headings', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('For creators')).toBeInTheDocument();
    expect(screen.getByText('For users')).toBeInTheDocument();
  });

  it('renders testimonial quotes', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText(/passive income while helping thousands/i)).toBeInTheDocument();
  });

  it('renders pricing plan Creator option', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Creator')).toBeInTheDocument();
    expect(screen.getByText('Apply as Creator')).toBeInTheDocument();
  });

  it('renders "Most Popular" badge on Premium plan', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('renders the live demo card preview text', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('AI Chat Preview')).toBeInTheDocument();
  });

  it('renders final CTA heading', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Ready to Transform Your Creator Journey?')).toBeInTheDocument();
  });

  it('renders Start Free Today button in the final CTA', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByText('Start Free Today')).toBeInTheDocument();
  });
});
