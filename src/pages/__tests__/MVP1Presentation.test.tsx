import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import MVP1Presentation from '../MVP1Presentation';

describe('MVP1Presentation', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<MVP1Presentation />);
    expect(container.firstChild).toBeTruthy();
  });
});
