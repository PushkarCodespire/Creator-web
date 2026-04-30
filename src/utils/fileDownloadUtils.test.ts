import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile, getFilenameFromUrl, downloadFromUrl } from './fileDownloadUtils';

describe('fileDownloadUtils', () => {
  describe('getFilenameFromUrl', () => {
    it('extracts filename from a simple URL path', () => {
      expect(getFilenameFromUrl('/api/download/content/photo.jpg')).toBe('photo.jpg');
    });

    it('extracts filename from URL with query params', () => {
      expect(getFilenameFromUrl('/api/download/photo.jpg?token=abc')).toBe('photo.jpg');
    });

    it('extracts filename from URL with hash', () => {
      expect(getFilenameFromUrl('/api/download/photo.jpg#section')).toBe('photo.jpg');
    });

    it('extracts filename from URL with both query and hash', () => {
      expect(getFilenameFromUrl('/api/download/photo.jpg?t=1#top')).toBe('photo.jpg');
    });

    it('returns last segment for deeply nested paths', () => {
      expect(getFilenameFromUrl('/a/b/c/d/file.webp')).toBe('file.webp');
    });
  });

  describe('downloadFile', () => {
    let mockBlob: Blob;
    let mockObjectUrl: string;
    let mockLink: { href: string; download: string; click: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      mockObjectUrl = 'blob:http://localhost/fake-url';

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        statusText: 'OK',
        blob: vi.fn().mockResolvedValue(mockBlob),
      });

      // Mock URL.createObjectURL / revokeObjectURL
      window.URL.createObjectURL = vi.fn().mockReturnValue(mockObjectUrl);
      window.URL.revokeObjectURL = vi.fn();

      // Mock createElement('a')
      mockLink = { href: '', download: '', click: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

      localStorage.clear();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('fetches the file and triggers download', async () => {
      await downloadFile('/api/download/photo.jpg', 'photo.jpg');

      expect(fetch).toHaveBeenCalledWith('/api/download/photo.jpg', expect.objectContaining({
        method: 'GET',
      }));
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.href).toBe(mockObjectUrl);
      expect(mockLink.download).toBe('photo.jpg');
      expect(mockLink.click).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectUrl);
    });

    it('includes Authorization header when token is in localStorage', async () => {
      localStorage.setItem('token', 'my-jwt-token');

      await downloadFile('/api/download/photo.jpg', 'photo.jpg');

      expect(fetch).toHaveBeenCalledWith(
        '/api/download/photo.jpg',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-jwt-token',
          }),
        })
      );
    });

    it('does not include Authorization header when no token', async () => {
      await downloadFile('/api/download/photo.jpg', 'photo.jpg');

      const callHeaders = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBeUndefined();
    });

    it('throws when response is not ok', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(downloadFile('/api/download/missing.jpg', 'missing.jpg')).rejects.toThrow(
        'Download failed: Not Found'
      );
    });
  });

  describe('downloadFromUrl', () => {
    beforeEach(() => {
      // Mock downloadFile behavior through fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        statusText: 'OK',
        blob: vi.fn().mockResolvedValue(new Blob(['test'])),
      });
      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:fake');
      window.URL.revokeObjectURL = vi.fn();
      const mockLink = { href: '', download: '', click: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('uses custom filename when provided', async () => {
      await downloadFromUrl('/api/download/photo.jpg', 'custom.jpg');
      // The fetch was called with the URL
      expect(fetch).toHaveBeenCalledWith('/api/download/photo.jpg', expect.any(Object));
    });

    it('extracts filename from URL when not provided', async () => {
      await downloadFromUrl('/api/download/content/image.webp');
      expect(fetch).toHaveBeenCalledWith('/api/download/content/image.webp', expect.any(Object));
    });
  });
});
