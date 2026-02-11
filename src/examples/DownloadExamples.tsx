// ===========================================
// DOWNLOAD USAGE EXAMPLES
// Examples of how to use the download utilities
// ===========================================

import React from 'react';
import { Button, Space, Card } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadFromUrl, downloadFile } from '../utils/fileDownloadUtils';
import { downloadDisplayedImage, convertToDownloadUrl } from '../utils/downloadHelpers';
import { DownloadButton } from '../components/common/DownloadButton';

/**
 * Example 1: Simple Download Button Component
 * Best for: Quick implementation with built-in error handling
 */
export const Example1_SimpleDownloadButton = () => {
    return (
        <Card title="Example 1: Simple Download Button">
            <Space direction="vertical">
                {/* Download from download URL */}
                <DownloadButton
                    url="/api/download/content/example.pdf"
                    filename="my-document.pdf"
                    isDownloadUrl
                >
                    Download PDF
                </DownloadButton>

                {/* Download from display URL (will be converted automatically) */}
                <DownloadButton
                    url="/api/uploads/content/image.jpg"
                    filename="my-image.jpg"
                >
                    Download Image
                </DownloadButton>

                {/* With custom styling */}
                <DownloadButton
                    url="/api/download/content/video.mp4"
                    type="primary"
                    size="large"
                    isDownloadUrl
                >
                    Download Video
                </DownloadButton>
            </Space>
        </Card>
    );
};

/**
 * Example 2: Manual Download with Custom Button
 * Best for: Custom UI requirements or additional logic
 */
export const Example2_ManualDownload = () => {
    const handleDownload = async () => {
        try {
            await downloadFromUrl('/api/download/content/report.xlsx', 'monthly-report.xlsx');
            console.log('Download started successfully');
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download file');
        }
    };

    return (
        <Card title="Example 2: Manual Download">
            <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                type="primary"
            >
                Download Report
            </Button>
        </Card>
    );
};

/**
 * Example 3: Download Image from Display URL
 * Best for: Downloading images that are currently being displayed
 */
export const Example3_DownloadDisplayedImage = () => {
    const imageUrl = '/api/uploads/content/profile-photo.jpg';

    const handleDownload = async () => {
        try {
            await downloadDisplayedImage(imageUrl, 'profile-photo.jpg');
            console.log('Image download started');
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <Card title="Example 3: Download Displayed Image">
            <Space direction="vertical" align="center">
                {/* Display image */}
                <img
                    src={imageUrl}
                    alt="Profile"
                    style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 8 }}
                />

                {/* Download button */}
                <Button
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                >
                    Download This Photo
                </Button>
            </Space>
        </Card>
    );
};

/**
 * Example 4: Convert Display URL to Download URL
 * Best for: When you need the download URL but don't want to trigger download yet
 */
export const Example4_URLConversion = () => {
    const displayUrl = '/api/uploads/content/document.pdf';
    const downloadUrl = convertToDownloadUrl(displayUrl);

    return (
        <Card title="Example 4: URL Conversion">
            <Space direction="vertical">
                <div>Display URL: <code>{displayUrl}</code></div>
                <div>Download URL: <code>{downloadUrl}</code></div>

                <Button
                    onClick={() => downloadFromUrl(downloadUrl, 'document.pdf')}
                >
                    Download Document
                </Button>
            </Space>
        </Card>
    );
};

/**
 * Example 5: Download with Loading State
 * Best for: Providing user feedback during download
 */
export const Example5_DownloadWithLoading = () => {
    const [loading, setLoading] = React.useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            await downloadFromUrl('/api/download/content/large-file.zip', 'archive.zip');
            alert('Download started successfully!');
        } catch (error) {
            alert('Download failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Example 5: Download with Loading State">
            <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                loading={loading}
                type="primary"
            >
                {loading ? 'Preparing Download...' : 'Download Large File'}
            </Button>
        </Card>
    );
};

/**
 * Example 6: Download Multiple Files
 * Best for: Batch downloading multiple files
 */
export const Example6_MultipleDownloads = () => {
    const files = [
        { url: '/api/download/content/file1.pdf', name: 'document1.pdf' },
        { url: '/api/download/content/file2.pdf', name: 'document2.pdf' },
        { url: '/api/download/content/file3.pdf', name: 'document3.pdf' },
    ];

    const handleDownloadAll = async () => {
        for (const file of files) {
            try {
                await downloadFromUrl(file.url, file.name);
                // Add small delay between downloads
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Failed to download ${file.name}:`, error);
            }
        }
        alert('All downloads started!');
    };

    return (
        <Card title="Example 6: Download Multiple Files">
            <Space direction="vertical">
                {files.map((file, index) => (
                    <div key={index}>
                        <Button
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => downloadFromUrl(file.url, file.name)}
                        >
                            {file.name}
                        </Button>
                    </div>
                ))}

                <Button
                    type="primary"
                    onClick={handleDownloadAll}
                >
                    Download All Files
                </Button>
            </Space>
        </Card>
    );
};

/**
 * Example 7: Download from Chat Message
 * Best for: File attachments in chat/messaging
 */
export const Example7_ChatFileDownload = () => {
    const fileAttachment = {
        name: 'meeting-notes.docx',
        url: '/api/download/chat-media/abc123.docx',
        size: 45678, // bytes
        type: 'document'
    };

    const handleDownload = async () => {
        try {
            await downloadFromUrl(fileAttachment.url, fileAttachment.name);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <Card title="Example 7: Chat File Download">
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    background: '#f5f5f5',
                    borderRadius: 8,
                    cursor: 'pointer'
                }}
                onClick={handleDownload}
            >
                <DownloadOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{fileAttachment.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                        {(fileAttachment.size / 1024).toFixed(1)} KB
                    </div>
                </div>
            </div>
        </Card>
    );
};

/**
 * Example 8: Download with Callbacks
 * Best for: Tracking download events or analytics
 */
export const Example8_DownloadWithCallbacks = () => {
    const handleDownloadComplete = () => {
        console.log('Download completed successfully');
        // Track analytics
        // Update UI
        // Show success notification
    };

    const handleDownloadError = (error: Error) => {
        console.error('Download error:', error);
        // Track error analytics
        // Show error notification
        // Suggest retry
    };

    return (
        <Card title="Example 8: Download with Callbacks">
            <DownloadButton
                url="/api/download/content/important-file.pdf"
                filename="important-file.pdf"
                isDownloadUrl
                onDownloadComplete={handleDownloadComplete}
                onDownloadError={handleDownloadError}
            >
                Download with Tracking
            </DownloadButton>
        </Card>
    );
};

/**
 * Complete Usage Example Component
 * Demonstrates all patterns together
 */
export const DownloadExamplesPage = () => {
    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <h1>Download Functionality Examples</h1>
            <p>Various examples of implementing file downloads in the application</p>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Example1_SimpleDownloadButton />
                <Example2_ManualDownload />
                <Example3_DownloadDisplayedImage />
                <Example4_URLConversion />
                <Example5_DownloadWithLoading />
                <Example6_MultipleDownloads />
                <Example7_ChatFileDownload />
                <Example8_DownloadWithCallbacks />
            </Space>
        </div>
    );
};

export default DownloadExamplesPage;
