// ===========================================
// DOWNLOAD HELPER UTILITIES
// Additional utilities for handling downloads
// ===========================================

import React from 'react';
import { downloadFile } from './fileDownloadUtils';

/**
 * Converts a display/upload URL to a download URL
 * @param url - The current URL (e.g., /api/uploads/content/image.jpg)
 * @returns The download URL (e.g., /api/download/content/image.jpg)
 */
export function convertToDownloadUrl(url: string): string {
    if (url.startsWith('http')) {
        // If it's a full URL, we need to parse it
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        return convertToDownloadUrl(pathname); // Recursively handle the pathname
    }

    // Replace /api/uploads with /api/download
    if (url.includes('/api/uploads/')) {
        return url.replace('/api/uploads/', '/api/download/');
    }

    // Replace /uploads with /api/download
    if (url.includes('/uploads/')) {
        return url.replace('/uploads/', '/api/download/');
    }

    // If it's already a download URL, return as-is
    if (url.includes('/api/download/')) {
        return url;
    }

    // Otherwise, assume it's just a path like /content/image.jpg
    // and prepend /api/download
    return `/api/download${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Downloads an image that's currently being displayed
 * This is useful for adding download buttons to images shown with /api/uploads
 * @param displayUrl - The URL currently being used to display the image
 * @param filename - Optional custom filename
 */
export async function downloadDisplayedImage(displayUrl: string, filename?: string): Promise<void> {
    const downloadUrl = convertToDownloadUrl(displayUrl);

    // Extract filename from URL if not provided
    const finalFilename = filename || downloadUrl.split('/').pop() || 'download';

    return downloadFile(downloadUrl, finalFilename);
}

/**
 * Creates a download button click handler for images
 * @param imageUrl - The image URL to download
 * @param filename - Optional custom filename
 * @returns Click handler function
 */
export function createImageDownloadHandler(imageUrl: string, filename?: string) {
    return async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await downloadDisplayedImage(imageUrl, filename);
        } catch (error) {
            console.error('Failed to download image:', error);
            throw error;
        }
    };
}
