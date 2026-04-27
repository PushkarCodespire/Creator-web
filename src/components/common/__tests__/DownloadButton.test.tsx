vi.mock('../../../utils/fileDownloadUtils', () => ({
  downloadFromUrl: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../utils/downloadHelpers', () => ({
  downloadDisplayedImage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import DownloadButton from '../DownloadButton/DownloadButton';

describe('DownloadButton', () => {
  it('renders with default text', () => {
    const { getByText } = renderWithProviders(
      <DownloadButton url="/api/uploads/test.jpg" />
    );
    expect(getByText('Download')).toBeTruthy();
  });

  it('renders with custom children', () => {
    const { getByText } = renderWithProviders(
      <DownloadButton url="/api/uploads/test.jpg">Download Image</DownloadButton>
    );
    expect(getByText('Download Image')).toBeTruthy();
  });

  it('renders with different types', () => {
    const { container } = renderWithProviders(
      <DownloadButton url="/api/uploads/test.jpg" type="primary" size="large" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with isDownloadUrl flag', () => {
    const { container } = renderWithProviders(
      <DownloadButton url="/api/download/test.jpg" isDownloadUrl />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
