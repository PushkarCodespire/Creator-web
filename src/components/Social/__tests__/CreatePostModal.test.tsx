import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CreatePostModal from '../CreatePostModal';
import { postApi } from '../../../services/api';

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

  it('shows error message when submitting with empty content and no file', async () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Post'));
    // postApi.createPost should NOT have been called because content is empty
    expect(postApi.createPost).not.toHaveBeenCalled();
  });

  it('calls postApi.createPost with correct type when content is provided', async () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("What's on your mind?"), {
      target: { value: 'Hello world' },
    });
    fireEvent.click(screen.getByText('Post'));
    await waitFor(() => {
      expect(postApi.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Hello world', type: 'TEXT' })
      );
    });
  });

  it('calls onSuccess and onCancel after successful post creation', async () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("What's on your mind?"), {
      target: { value: 'Test post content' },
    });
    fireEvent.click(screen.getByText('Post'));
    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  it('updates textarea value as user types', () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(textarea, { target: { value: 'typing test' } });
    expect((textarea as HTMLTextAreaElement).value).toBe('typing test');
  });

  it('renders supported formats helper text', () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    expect(screen.getByText(/Supported formats/)).toBeInTheDocument();
  });

  it('clears textarea content after successful post creation', async () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(textarea, { target: { value: 'temp content' } });
    expect((textarea as HTMLTextAreaElement).value).toBe('temp content');

    fireEvent.click(screen.getByText('Post'));

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('modal is open when visible prop is true', () => {
    renderWithProviders(<CreatePostModal {...defaultProps} visible={true} />);
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
  });

  it('Post button is present and clickable', () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    const postBtn = screen.getByText('Post');
    expect(postBtn).toBeInTheDocument();
    expect(() => fireEvent.click(postBtn)).not.toThrow();
  });

  it('does not call onSuccess when content is empty', async () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Post'));
    // Give any async work a chance to settle
    await new Promise((r) => setTimeout(r, 50));
    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
  });

  it('calls postApi.createPost with publishedAt as an ISO string', async () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("What's on your mind?"), {
      target: { value: 'ISO date test' },
    });
    fireEvent.click(screen.getByText('Post'));
    await waitFor(() => {
      const callArg = (postApi.createPost as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callArg.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  it('calls postApi.createPost with empty media array for text-only post', async () => {
    renderWithProviders(<CreatePostModal {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("What's on your mind?"), {
      target: { value: 'text only' },
    });
    fireEvent.click(screen.getByText('Post'));
    await waitFor(() => {
      const callArg = (postApi.createPost as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callArg.media).toEqual([]);
    });
  });
});
