vi.mock('../fileDownloadUtils', () => ({
  downloadFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { convertToDownloadUrl, downloadDisplayedImage } from '../downloadHelpers';

describe('convertToDownloadUrl', () => {
  it('converts /api/uploads/ to /api/download/', () => {
    expect(convertToDownloadUrl('/api/uploads/content/image.jpg'))
      .toBe('/api/download/content/image.jpg');
  });

  it('converts /uploads/ to /api/download/', () => {
    expect(convertToDownloadUrl('/uploads/content/image.jpg'))
      .toBe('/api/download/content/image.jpg');
  });

  it('returns already-download URL unchanged', () => {
    expect(convertToDownloadUrl('/api/download/content/image.jpg'))
      .toBe('/api/download/content/image.jpg');
  });

  it('prepends /api/download to bare path', () => {
    expect(convertToDownloadUrl('/image.jpg'))
      .toBe('/api/download/image.jpg');
  });

  it('handles full HTTP URLs', () => {
    const result = convertToDownloadUrl('http://localhost:5000/api/uploads/content/image.jpg');
    expect(result).toBe('/api/download/content/image.jpg');
  });
});

describe('downloadDisplayedImage', () => {
  it('calls downloadFile with converted URL', async () => {
    const { downloadFile } = await import('../fileDownloadUtils');
    await downloadDisplayedImage('/api/uploads/content/image.jpg', 'image.jpg');
    expect(downloadFile).toHaveBeenCalledWith(
      '/api/download/content/image.jpg',
      'image.jpg'
    );
  });
});
