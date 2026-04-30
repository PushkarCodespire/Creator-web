import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { convertToDownloadUrl, downloadDisplayedImage, createImageDownloadHandler } from './downloadHelpers';

// Mock fileDownloadUtils
vi.mock('./fileDownloadUtils', () => ({
  downloadFile: vi.fn().mockResolvedValue(undefined),
}));

import { downloadFile } from './fileDownloadUtils';

describe('downloadHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('convertToDownloadUrl', () => {
    it('converts /api/uploads/ path to /api/download/', () => {
      expect(convertToDownloadUrl('/api/uploads/content/image.jpg')).toBe(
        '/api/download/content/image.jpg'
      );
    });

    it('converts /uploads/ path to /api/download/', () => {
      expect(convertToDownloadUrl('/uploads/content/image.jpg')).toBe(
        '/api/download/content/image.jpg'
      );
    });

    it('returns existing /api/download/ path as-is', () => {
      expect(convertToDownloadUrl('/api/download/content/image.jpg')).toBe(
        '/api/download/content/image.jpg'
      );
    });

    it('prepends /api/download to a bare path starting with /', () => {
      expect(convertToDownloadUrl('/content/image.jpg')).toBe(
        '/api/download/content/image.jpg'
      );
    });

    it('prepends /api/download/ to a bare path without leading /', () => {
      expect(convertToDownloadUrl('content/image.jpg')).toBe(
        '/api/download/content/image.jpg'
      );
    });

    it('handles full HTTP URLs by extracting pathname', () => {
      expect(
        convertToDownloadUrl('http://example.com/api/uploads/content/image.jpg')
      ).toBe('/api/download/content/image.jpg');
    });

    it('handles full HTTPS URLs by extracting pathname', () => {
      expect(
        convertToDownloadUrl('https://cdn.example.com/uploads/photos/pic.png')
      ).toBe('/api/download/photos/pic.png');
    });
  });

  describe('downloadDisplayedImage', () => {
    it('calls downloadFile with converted URL and extracted filename', async () => {
      await downloadDisplayedImage('/api/uploads/content/photo.jpg');

      expect(downloadFile).toHaveBeenCalledWith(
        '/api/download/content/photo.jpg',
        'photo.jpg'
      );
    });

    it('uses custom filename when provided', async () => {
      await downloadDisplayedImage('/api/uploads/content/photo.jpg', 'my-photo.jpg');

      expect(downloadFile).toHaveBeenCalledWith(
        '/api/download/content/photo.jpg',
        'my-photo.jpg'
      );
    });
  });

  describe('createImageDownloadHandler', () => {
    it('returns a function', () => {
      const handler = createImageDownloadHandler('/api/uploads/img.jpg');
      expect(typeof handler).toBe('function');
    });

    it('calls preventDefault and stopPropagation on the event', async () => {
      const handler = createImageDownloadHandler('/api/uploads/img.jpg');
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      await handler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('triggers download with correct URL and filename', async () => {
      const handler = createImageDownloadHandler('/api/uploads/photos/pic.png', 'custom.png');
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      await handler(mockEvent);

      expect(downloadFile).toHaveBeenCalledWith(
        '/api/download/photos/pic.png',
        'custom.png'
      );
    });

    it('re-throws errors from downloadFile', async () => {
      const error = new Error('Download failed');
      vi.mocked(downloadFile).mockRejectedValueOnce(error);

      const handler = createImageDownloadHandler('/api/uploads/img.jpg');
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      await expect(handler(mockEvent)).rejects.toThrow('Download failed');
    });
  });
});
