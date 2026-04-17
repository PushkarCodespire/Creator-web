import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../EmptyState/EmptyState';

describe('EmptyState', () => {
  it('renders default no-data state', () => {
    render(<EmptyState />);
    expect(screen.getByText('No Data Found')).toBeInTheDocument();
    expect(screen.getByText('There is no data to display at the moment.')).toBeInTheDocument();
  });

  it('renders no-results type', () => {
    render(<EmptyState type="no-results" />);
    expect(screen.getByText('No Results Found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument();
  });

  it('renders error type', () => {
    render(<EmptyState type="error" />);
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
  });

  it('renders no-posts type', () => {
    render(<EmptyState type="no-posts" />);
    expect(screen.getByText('No Posts Yet')).toBeInTheDocument();
  });

  it('renders no-chats type', () => {
    render(<EmptyState type="no-chats" />);
    expect(screen.getByText('No Conversations')).toBeInTheDocument();
  });

  it('renders no-notifications type', () => {
    render(<EmptyState type="no-notifications" />);
    expect(screen.getByText('No Notifications')).toBeInTheDocument();
  });

  it('renders custom title and description', () => {
    render(
      <EmptyState
        title="Custom Title"
        description="Custom description text"
      />
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  it('renders action button and handles click', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        action={{ text: 'Create New', onClick: handleClick }}
      />
    );

    const button = screen.getByText('Create New');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders action via flat props (actionText + onAction)', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        actionText="Do Something"
        onAction={handleAction}
      />
    );

    const button = screen.getByText('Do Something');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when no action is provided', () => {
    render(<EmptyState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
