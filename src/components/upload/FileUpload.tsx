// ===========================================
// FILE UPLOAD - Base Component
// ===========================================
// Reusable drag-and-drop file upload component

import React, { useState } from 'react';
import { Upload, message, Progress } from 'antd';
import { InboxOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  multiple?: boolean;
  onUpload: (file: File) => Promise<{ url: string }>;
  onRemove?: (file: File) => void;
  disabled?: boolean;
  listType?: 'text' | 'picture' | 'picture-card';
  showUploadList?: boolean;
  children?: React.ReactNode;
}

interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  percent?: number;
  url?: string;
  file: File;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*',
  maxSize = 10, // 10MB default
  maxFiles = 1,
  multiple = false,
  onUpload,
  onRemove,
  disabled = false,
  showUploadList = true,
  children
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Validate file
  const validateFile = (file: File): boolean => {
    // Check file size
    const isValidSize = file.size / 1024 / 1024 < maxSize;
    if (!isValidSize) {
      message.error(`File must be smaller than ${maxSize}MB!`);
      return false;
    }

    // Check file type
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileExtension = `.${file.name.split('.').pop()}`;

      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0];
          return fileType.startsWith(baseType);
        }
        return fileType === type;
      });

      if (!isValidType) {
        message.error(`File type not supported. Accepted: ${accept}`);
        return false;
      }
    }

    // Check max files
    if (fileList.length >= maxFiles) {
      message.error(`Maximum ${maxFiles} file(s) allowed`);
      return false;
    }

    return true;
  };

  // Handle file upload
  const handleUpload = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    const uploadFile: UploadFile = {
      uid: `${Date.now()}-${file.name}`,
      name: file.name,
      status: 'uploading',
      percent: 0,
      file
    };

    setFileList(prev => [...prev, uploadFile]);
    setUploading(true);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setFileList(prev => prev.map(f =>
          f.uid === uploadFile.uid && f.percent! < 90
            ? { ...f, percent: f.percent! + 10 }
            : f
        ));
      }, 200);

      // Upload file
      const result = await onUpload(file);

      clearInterval(progressInterval);

      // Update file status
      setFileList(prev => prev.map(f =>
        f.uid === uploadFile.uid
          ? { ...f, status: 'done', percent: 100, url: result.url }
          : f
      ));

      message.success(`${file.name} uploaded successfully`);
    } catch (error: any) {
      message.error(`${file.name} upload failed: ${error.message}`);

      setFileList(prev => prev.map(f =>
        f.uid === uploadFile.uid
          ? { ...f, status: 'error' }
          : f
      ));
    } finally {
      setUploading(false);
    }
  };

  // Handle file removal
  const handleRemove = (file: UploadFile) => {
    setFileList(prev => prev.filter(f => f.uid !== file.uid));
    if (onRemove) {
      onRemove(file.file);
    }
  };

  // Custom request to prevent default upload
  const customRequest = ({ file, onSuccess }: any) => {
    handleUpload(file as File);
    onSuccess('ok');
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple,
    accept,
    disabled: disabled || uploading,
    customRequest,
    showUploadList: false,
    fileList: []
  };

  return (
    <div className="file-upload-container">
      <Dragger {...uploadProps}>
        {children || (
          <div style={{ padding: '20px' }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for single or bulk upload. Max size: {maxSize}MB
              {accept !== '*' && ` | Accepted: ${accept}`}
            </p>
          </div>
        )}
      </Dragger>

      {/* Custom file list */}
      {showUploadList && fileList.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {fileList.map(file => (
            <div
              key={file.uid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                marginBottom: '8px',
                backgroundColor: file.status === 'error' ? '#fff2f0' : 'white'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{file.name}</div>
                {file.status === 'uploading' && (
                  <Progress
                    percent={file.percent}
                    size="small"
                    status="active"
                    style={{ marginTop: '4px' }}
                  />
                )}
                {file.status === 'error' && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px' }}>Upload failed</div>
                )}
              </div>
              <CloseCircleOutlined
                onClick={() => handleRemove(file)}
                style={{
                  fontSize: '16px',
                  color: '#999',
                  cursor: 'pointer',
                  marginLeft: '12px'
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
