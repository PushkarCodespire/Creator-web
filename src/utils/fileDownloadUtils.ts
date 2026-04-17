// ===========================================
// DOWNLOAD UTILITY
// Handles file downloads using fetch and blob
// ===========================================

import { logger } from './logger';

/**
 * Downloads a file from the given URL using fetch API
 * This properly handles the Content-Disposition: attachment header
 * set by the backend /api/download endpoint
 * 
 * @param url - The download URL (e.g., /api/download/content/image.webp)
 * @param filename - The filename to save as
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
    try {
        // Fetch the file
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // Include authorization if needed
                ...(localStorage.getItem('token') && {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                })
            }
        });

        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }

        // Get file as blob
        const blob = await response.blob();

        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        logger.error('Download error:', error);
        throw error;
    }
}

/**
 * Extracts filename from a URL path
 * @param url - The URL to extract filename from
 * @returns The filename
 */
export function getFilenameFromUrl(url: string): string {
    // Remove query parameters and hash
    const cleanUrl = url.split('?')[0].split('#')[0];

    // Get the last segment of the path
    const segments = cleanUrl.split('/');
    return segments[segments.length - 1];
}

/**
 * Downloads a file from a download URL that already includes the /api/download path
 * @param downloadUrl - The full download URL
 * @param customFilename - Optional custom filename, otherwise extracts from URL
 */
export async function downloadFromUrl(downloadUrl: string, customFilename?: string): Promise<void> {
    const filename = customFilename || getFilenameFromUrl(downloadUrl);
    return downloadFile(downloadUrl, filename);
}
