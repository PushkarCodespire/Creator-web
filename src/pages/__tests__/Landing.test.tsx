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

vi.mock('../../styles/tokens', () => ({
  colors: {
    primary: { solid: '#1268FF', subtle: '#E8F0FE', gradient: 'linear-gradient(135deg, #1268FF, #7C3AED)' },
    text: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF' },
    gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB' },
    success: { solid: '#10B981' },
  },
  typography: { fontWeight: { bold: 700 }, fontSize: {} },
  spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px' },
  shadows: { sm: 'none', md: 'none' },
  borderRadius: {},
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
});
