vi.mock('../../utils/fileDownloadUtils', () => ({
  downloadFromUrl: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../utils/downloadHelpers', () => ({
  downloadDisplayedImage: vi.fn().mockResolvedValue(undefined),
  convertToDownloadUrl: vi.fn((url: string) => url),
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../components/common/DownloadButton', () => ({
  DownloadButton: ({ children }: any) => <button>{children}</button>,
}));

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import {
  Example1_SimpleDownloadButton,
  Example2_ManualDownload,
  Example3_DownloadDisplayedImage,
  Example4_URLConversion,
  Example5_DownloadWithLoading,
} from '../DownloadExamples';

describe('DownloadExamples', () => {
  it('Example1 renders without crashing', () => {
    const { container } = renderWithProviders(<Example1_SimpleDownloadButton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('Example1 renders download buttons', () => {
    renderWithProviders(<Example1_SimpleDownloadButton />);
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
    expect(screen.getByText('Download Image')).toBeInTheDocument();
    expect(screen.getByText('Download Video')).toBeInTheDocument();
  });

  it('Example2 renders without crashing', () => {
    const { container } = renderWithProviders(<Example2_ManualDownload />);
    expect(container.firstChild).toBeTruthy();
  });

  it('Example2 renders download button', () => {
    renderWithProviders(<Example2_ManualDownload />);
    expect(screen.getByText('Download Report')).toBeInTheDocument();
  });

  it('Example3 renders without crashing', () => {
    const { container } = renderWithProviders(<Example3_DownloadDisplayedImage />);
    expect(container.firstChild).toBeTruthy();
  });

  it('Example4 renders without crashing', () => {
    const { container } = renderWithProviders(<Example4_URLConversion />);
    expect(container.firstChild).toBeTruthy();
  });

  it('Example5 renders download button text', () => {
    renderWithProviders(<Example5_DownloadWithLoading />);
    expect(screen.getByText('Download Large File')).toBeInTheDocument();
  });
});
