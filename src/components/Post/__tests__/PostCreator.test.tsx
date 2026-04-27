import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import PostCreator from '../PostCreator';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  postApi: {
    createPost: vi.fn().mockResolvedValue({ data: { data: { id: '1' } } }),
  },
  getImageUrl: (url: string) => url,
}));

describe('PostCreator', () => {
  it('renders textarea with placeholder', () => {
    renderWithProviders(<PostCreator />);
    expect(screen.getByPlaceholderText('Commence neural transmission...')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    renderWithProviders(<PostCreator placeholder="Share something..." />);
    expect(screen.getByPlaceholderText('Share something...')).toBeInTheDocument();
  });

  it('renders Transmit button', () => {
    renderWithProviders(<PostCreator />);
    expect(screen.getByText('Transmit')).toBeInTheDocument();
  });

  it('renders media upload buttons when allowMedia is true', () => {
    renderWithProviders(<PostCreator allowMedia />);
    expect(screen.getByText('Visual')).toBeInTheDocument();
    expect(screen.getByText('Stream')).toBeInTheDocument();
  });

  it('renders Abort button when onCancel is provided', () => {
    const onCancel = vi.fn();
    renderWithProviders(<PostCreator onCancel={onCancel} />);
    expect(screen.getByText('Abort')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Abort'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows character count', () => {
    renderWithProviders(<PostCreator maxLength={5000} />);
    expect(screen.getByText('0 / 5,000')).toBeInTheDocument();
  });
});
