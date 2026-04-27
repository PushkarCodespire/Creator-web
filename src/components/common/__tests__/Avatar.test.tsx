import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CustomAvatar from '../Avatar/Avatar';

describe('CustomAvatar', () => {
  it('renders without props', () => {
    const { container } = renderWithProviders(<CustomAvatar />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with src', () => {
    const { container } = renderWithProviders(<CustomAvatar src="test.jpg" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with status indicator', () => {
    const { container } = renderWithProviders(
      <CustomAvatar status="online" showStatus />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with gradientRing', () => {
    const { container } = renderWithProviders(
      <CustomAvatar gradientRing />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders verified badge', () => {
    const { container } = renderWithProviders(
      <CustomAvatar verified />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with all status variants', () => {
    const statuses = ['online', 'offline', 'busy', 'away'] as const;
    statuses.forEach((status) => {
      const { container } = renderWithProviders(
        <CustomAvatar status={status} showStatus />
      );
      expect(container.firstChild).toBeTruthy();
    });
  });
});
