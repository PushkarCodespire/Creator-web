import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ShareDialog } from '../ShareDialog';

describe('ShareDialog', () => {
  it('renders when visible', () => {
    const { container } = renderWithProviders(
      <ShareDialog
        visible={true}
        onClose={vi.fn()}
        url="https://example.com/creator/test"
        title="Share Creator"
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders when not visible', () => {
    const { container } = renderWithProviders(
      <ShareDialog
        visible={false}
        onClose={vi.fn()}
        url="https://example.com/creator/test"
      />
    );
    expect(container).toBeTruthy();
  });
});
