
import React, { useState } from 'react';
import { Modal, Input, Button, Upload, message, Select, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { postApi } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface CreatePostModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: (newPost: Record<string, unknown>) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onCancel, onSuccess }) => {
    const [content, setContent] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [fileList, setFileList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [_postType, setPostType] = useState('TEXT'); // 'TEXT', 'IMAGE', 'VIDEO'

    const _handleUpload = ({ _file, onSuccess: uploadSuccess }: { _file: File; onSuccess: (msg: string) => void }) => {
        setTimeout(() => {
            uploadSuccess('ok');
        }, 0);
    };

    const handleSubmit = async () => {
        if (!content.trim() && fileList.length === 0) {
            message.error('Please add some content or media');
            return;
        }

        try {
            setLoading(true);

            const media: { url: string; type: string }[] = [];

            // If there are files, we would ideally upload them first to a media server
            // For this implementation, we'll simulate the structure required by the API
            // In a real app, successful uploads would return URLs
            if (fileList.length > 0) {
                // Determine type based on file
                const isVideo = fileList[0].type.startsWith('video/');
                setPostType(isVideo ? 'VIDEO' : 'IMAGE');

                // TODO: Implement actual file upload to server
                // For now, we are creating a placeholder or using a mock URL if available from response
                // Since the API expects { url: string, type: 'image' | 'video' }
                // We might need to handle this in the parent or use a dedicated upload endpoint first

                // Assuming we upload first:
                // const uploadResponse = await api.upload(fileList[0].originFileObj);
                // media.push({ url: uploadResponse.url, type: isVideo ? 'video' : 'image' });
            }

            const postData = {
                content,
                type: fileList.length > 0 ? (fileList[0].type.startsWith('video/') ? 'VIDEO' : 'IMAGE') : 'TEXT',
                media: media, // This needs to be populated with actual URLs after upload
                publishedAt: new Date().toISOString(), // Immediate publish
            };

            const response = await postApi.createPost(postData);

            if (response.data.success) {
                message.success('Post created successfully');
                setContent('');
                setFileList([]);
                onSuccess(response.data.data);
                onCancel();
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (__error) {
            message.error('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadProps: any = {
        onRemove: (file: { uid: string; type?: string; size?: number }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setFileList((prev: any[]) => {
                const index = prev.indexOf(file);
                const newFileList = prev.slice();
                newFileList.splice(index, 1);
                return newFileList;
            });
        },
        beforeUpload: (file: { type: string; size: number }) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'video/mp4';
            if (!isJpgOrPng) {
                message.error('You can only upload JPG/PNG images or MP4 videos!');
            }
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('Media must be smaller than 10MB!');
            }

            if (isJpgOrPng && isLt10M) {
                setFileList([file]); // Single file for now to keep it simple
            }

            return false; // Manual upload
        },
        fileList,
    };

    return (
        <Modal
            title="Create New Post"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Post
                </Button>,
            ]}
        >
            <TextArea
                rows={4}
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ marginBottom: '16px', borderRadius: '8px' }}
            />

            <div>
                <Upload {...uploadProps} listType="picture">
                    <Button icon={<UploadOutlined />}>Upload Media (Image/Video)</Button>
                </Upload>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                    Supported formats: JPG, PNG, MP4. Max size: 10MB.
                </Text>
            </div>
        </Modal>
    );
};

export default CreatePostModal;
