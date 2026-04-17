// ===========================================
// DOCUMENT UPLOAD - PDF/DOC Files
// ===========================================

import React, { useState } from 'react';
import { Upload, Button, List, message } from 'antd';
import {
  UploadOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import api from '../../services/api';

export interface DocumentUploadProps {
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  uploadEndpoint?: string;
  onUploadSuccess?: (files: UploadedDocument[]) => void;
  onRemove?: (fileId: string) => void;
  disabled?: boolean;
  showList?: boolean;
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  maxFiles = 10,
  maxSize = 50, // 50MB default
  accept = '.pdf,.doc,.docx,.txt',
  uploadEndpoint = '/upload/document',
  onUploadSuccess,
  onRemove,
  disabled = false,
  showList = true
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  // Get file icon based on type
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
      case 'txt':
        return <FileTextOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
      default:
        return <FileOutlined style={{ fontSize: '24px', color: '#666' }} />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Custom upload request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customRequest = async ({ file, onSuccess, onError, onProgress }: any) => {
    const formData = new FormData();
    formData.append('document', file);

    try {
      setUploading(true);

      const response = await api.post(uploadEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          onProgress({ percent });
        }
      });

      const uploadedDoc: UploadedDocument = {
        id: response.data.data.id || Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: response.data.data.url,
        uploadedAt: new Date()
      };

      setUploadedDocs(prev => [...prev, uploadedDoc]);

      if (onUploadSuccess) {
        onUploadSuccess([...uploadedDocs, uploadedDoc]);
      }

      onSuccess(response.data);
      message.success(`${file.name} uploaded successfully`);
    } catch (error: unknown) {
      onError(error as Error);
      const msg = error instanceof Error ? error.message : 'An error occurred';
      message.error(`${file.name} upload failed: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle file removal
  const handleRemove = (file: UploadFile | UploadedDocument) => {
    if ('uid' in file) {
      // Remove from fileList
      setFileList(prev => prev.filter(f => f.uid !== file.uid));
    } else {
      // Remove uploaded document
      setUploadedDocs(prev => prev.filter(doc => doc.id !== file.id));
      if (onRemove) {
        onRemove(file.id);
      }
    }
  };

  // Before upload validation
  const beforeUpload = (file: File) => {
    // Check file size
    const isValidSize = file.size / 1024 / 1024 < maxSize;
    if (!isValidSize) {
      message.error(`File must be smaller than ${maxSize}MB!`);
      return Upload.LIST_IGNORE;
    }

    // Check file type
    const acceptedExts = accept.split(',').map(ext => ext.trim());
    const fileExt = `.${file.name.split('.').pop()}`;
    const isValidType = acceptedExts.includes(fileExt);

    if (!isValidType) {
      message.error(`File type not supported. Accepted: ${accept}`);
      return Upload.LIST_IGNORE;
    }

    // Check max files
    if (fileList.length + uploadedDocs.length >= maxFiles) {
      message.error(`Maximum ${maxFiles} file(s) allowed`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  // Handle file list change
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (info: any) => {
    let newFileList = [...info.fileList];

    // Limit file list
    newFileList = newFileList.slice(-maxFiles);

    setFileList(newFileList);
  };

  return (
    <div className="document-upload">
      <Upload
        fileList={fileList}
        customRequest={customRequest}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        disabled={disabled || uploading}
        showUploadList={showList}
        multiple
        accept={accept}
      >
        <Button icon={<UploadOutlined />} disabled={disabled || uploading} loading={uploading}>
          Upload Documents
        </Button>
      </Upload>

      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        Accepted formats: {accept} • Max size: {maxSize}MB per file • Max {maxFiles} files
      </div>

      {/* Uploaded documents list */}
      {showList && uploadedDocs.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontWeight: 500, marginBottom: '8px' }}>
            Uploaded Documents ({uploadedDocs.length})
          </div>
          <List
            size="small"
            bordered
            dataSource={uploadedDocs}
            renderItem={doc => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(doc)}
                    disabled={disabled}
                  >
                    Remove
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={getFileIcon(doc.name)}
                  title={
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      {doc.name}
                    </a>
                  }
                  description={
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {formatFileSize(doc.size)} • Uploaded{' '}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
