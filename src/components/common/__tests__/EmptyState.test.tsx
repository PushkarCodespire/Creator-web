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

  it('renders default description for error type', () => {
    render(<EmptyState type="error" />);
    expect(screen.getByText('We encountered an error. Please try again.')).toBeInTheDocument();
  });

  it('renders default description for no-posts type', () => {
    render(<EmptyState type="no-posts" />);
    expect(screen.getByText('Start creating your first post to engage with your audience.')).toBeInTheDocument();
  });

  it('renders default description for no-chats type', () => {
    render(<EmptyState type="no-chats" />);
    expect(screen.getByText('Start chatting with creators to see conversations here.')).toBeInTheDocument();
  });

  it('renders default description for no-notifications type', () => {
    render(<EmptyState type="no-notifications" />);
    expect(screen.getByText("We'll notify you when something new happens.")).toBeInTheDocument();
  });

  it('custom title overrides the type default title', () => {
    render(<EmptyState type="no-posts" title="Override Title" />);
    expect(screen.getByText('Override Title')).toBeInTheDocument();
    expect(screen.queryByText('No Posts Yet')).not.toBeInTheDocument();
  });

  it('custom description overrides the type default description', () => {
    render(<EmptyState type="no-data" description="Override description" />);
    expect(screen.getByText('Override description')).toBeInTheDocument();
    expect(screen.queryByText('There is no data to display at the moment.')).not.toBeInTheDocument();
  });

  it('action prop takes priority over flat actionText/onAction props', () => {
    const actionClick = vi.fn();
    const flatClick = vi.fn();
    render(
      <EmptyState
        action={{ text: 'Action Button', onClick: actionClick }}
        actionText="Flat Button"
        onAction={flatClick}
      />
    );
    expect(screen.getByText('Action Button')).toBeInTheDocument();
    expect(screen.queryByText('Flat Button')).not.toBeInTheDocument();
  });

  it('does not render action button when only actionText is provided without onAction', () => {
    render(<EmptyState actionText="Orphan Button" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
