vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    setTextColor: vi.fn(),
    save: vi.fn(),
  })),
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ExportButton } from '../ExportButton';

describe('ExportButton', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ExportButton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with creatorName prop', () => {
    const { container } = renderWithProviders(
      <ExportButton creatorName="Test Creator" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with onExport callback', () => {
    const { container } = renderWithProviders(
      <ExportButton onExport={vi.fn()} creatorName="Creator" />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
