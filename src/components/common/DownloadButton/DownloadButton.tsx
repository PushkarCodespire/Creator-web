// ===========================================
// DOWNLOAD BUTTON COMPONENT
// Reusable button for downloading files
// ===========================================

import React, { useState } from 'react';
import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadFromUrl, downloadFile } from '../../../utils/fileDownloadUtils';
import { convertToDownloadUrl, downloadDisplayedImage } from '../../../utils/downloadHelpers';

export interface DownloadButtonProps {
    /** The URL to download from. Can be display URL or download URL */
    url: string;
    /** Optional custom filename for the download */
    filename?: string;
    /** Button text */
    children?: React.ReactNode;
    /** Button type */
    type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
    /** Button size */
    size?: 'small' | 'middle' | 'large';
    /** Additional className */
    className?: string;
    /** Whether the URL is already a download URL (vs display URL) */
    isDownloadUrl?: boolean;
    /** Callback after successful download */
    onDownloadComplete?: () => void;
    /** Callback on download error */
    onDownloadError?: (error: Error) => void;
}

/**
 * DownloadButton Component
 * 
 * A reusable button component for downloading files from the backend.
 * Automatically handles converting display URLs to download URLs if needed.
 * 
 * @example
 * // Download from display URL
 * <DownloadButton url="/api/uploads/content/image.jpg" filename="my-image.jpg">
 *   Download Image
 * </DownloadButton>
 * 
 * @example
 * // Download from download URL (already has /api/download)
 * <DownloadButton url="/api/download/content/doc.pdf" isDownloadUrl>
 *   Download PDF
 * </DownloadButton>
 */
export const DownloadButton: React.FC<DownloadButtonProps> = ({
    url,
    filename,
    children = 'Download',
    type = 'default',
    size = 'middle',
    className,
    isDownloadUrl = false,
    onDownloadComplete,
    onDownloadError,
}) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        if (!url) {
            message.error('No URL provided');
            return;
        }

        setLoading(true);

        try {
            if (isDownloadUrl) {
                // URL already points to download endpoint
                await downloadFromUrl(url, filename);
            } else {
                // URL points to display endpoint, need to convert
                await downloadDisplayedImage(url, filename);
            }

            message.success('Download started');
            onDownloadComplete?.();
        } catch (error) {
            console.error('Download failed:', error);
            message.error('Failed to download file');
            onDownloadError?.(error as Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            type={type}
            size={size}
            icon={<DownloadOutlined />}
            loading={loading}
            onClick={handleDownload}
            className={className}
        >
            {children}
        </Button>
    );
};

export default DownloadButton;
