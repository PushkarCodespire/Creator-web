import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CreatePostModal from '../CreatePostModal';

vi.mock('../../../services/api', () => ({
  postApi: {
    createPost: vi.fn().mockResolvedValue({ data: { success: true, data: { id: 'new-post' } } }),
  },
}));

describe('CreatePostModal', () => {
  const defaultProps = {
    visible: true,
    onCancel: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal title', () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
  });

  it('renders textarea with placeholder', () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
  });

  it('renders Cancel and Post buttons', () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
  });

  it('renders upload button', () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    expect(screen.getByText('Upload Media (Image/Video)')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('does not render when not visible', () => {
    renderWithProviders(<CreatePostModal {...defaultProps} visible={false} />);
    expect(screen.queryByText('Create New Post')).not.toBeInTheDocument();
  });
});
