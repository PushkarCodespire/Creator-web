// ===========================================
// IMAGE UPLOAD - With Crop Functionality
// ===========================================

import React, { useState, useCallback, useRef } from 'react';
import { Modal, Button, Slider, message } from 'antd';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { UploadOutlined, RotateRightOutlined } from '@ant-design/icons';

export interface ImageUploadProps {
  aspectRatio?: number; // e.g., 1 for square, 16/9 for widescreen
  maxSize?: number; // in MB
  minWidth?: number;
  minHeight?: number;
  onUpload: (croppedImage: Blob, fileName: string) => Promise<{ url: string }>;
  disabled?: boolean;
  buttonText?: string;
  cropShape?: 'rect' | 'round';
  children?: React.ReactNode;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  aspectRatio = 1,
  maxSize = 5,
  minWidth,
  minHeight,
  onUpload,
  disabled = false,
  buttonText = 'Upload Image',
  cropShape = 'rect',
  children,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size / 1024 / 1024 > maxSize) {
      message.error(`Image must be smaller than ${maxSize}MB`);
      return;
    }

    // Read file
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Validate dimensions
        if (minWidth && img.width < minWidth) {
          message.error(`Image width must be at least ${minWidth}px`);
          return;
        }
        if (minHeight && img.height < minHeight) {
          message.error(`Image height must be at least ${minHeight}px`);
          return;
        }

        setImageSrc(reader.result as string);
        setFileName(file.name);
        setIsModalVisible(true);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Handle crop complete
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Create cropped image
  const createCroppedImage = async (): Promise<Blob> => {
    if (!imageSrc || !croppedAreaPixels) {
      throw new Error('No image to crop');
    }

    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Set canvas size to cropped area
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    // Apply rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw cropped image
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.9
      );
    });
  };

  // Handle upload
  const handleUpload = async () => {
    try {
      setUploading(true);
      const croppedImage = await createCroppedImage();
      await onUpload(croppedImage, fileName);
      setIsModalVisible(false);
      setImageSrc(null);
      setRotation(0);
      setZoom(1);
    } catch (error: any) {
      message.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    setImageSrc(null);
    setRotation(0);
    setZoom(1);
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <div onClick={triggerUpload} style={{ display: 'inline-block', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {children || (
          <Button icon={<UploadOutlined />} disabled={disabled}>
            {buttonText}
          </Button>
        )}
      </div>

      <Modal
        title="Crop Image"
        open={isModalVisible}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={uploading}
            onClick={handleUpload}
          >
            Upload
          </Button>
        ]}
      >
        <div style={{ position: 'relative', height: '400px', backgroundColor: '#333' }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape={cropShape}
            />
          )}
        </div>

        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ marginRight: '8px' }}>Zoom:</span>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={setZoom}
              style={{ width: '200px', display: 'inline-block' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <span style={{ marginRight: '8px' }}>Rotation:</span>
            <Slider
              value={rotation}
              min={0}
              max={360}
              step={1}
              onChange={setRotation}
              style={{ width: '200px', display: 'inline-block', marginRight: '8px' }}
            />
            <Button
              icon={<RotateRightOutlined />}
              onClick={() => setRotation((rotation + 90) % 360)}
              size="small"
            >
              Rotate 90°
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ImageUpload;
