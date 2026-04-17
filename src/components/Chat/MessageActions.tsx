// ===========================================
// MESSAGE ACTIONS COMPONENT
// Dropdown menu for message actions (copy, edit, delete, bookmark, share)
// ===========================================

import { useState } from 'react';
import { Dropdown, MenuProps, message as antMessage, Modal, Input } from 'antd';
import {
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  ShareAltOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { chatApi, bookmarkApi } from '../../services/api';
import { colors } from '../../styles/tokens';

const { TextArea } = Input;

interface MessageActionsProps {
  messageId: string;
  content: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  isBookmarked?: boolean;
  onBookmarkChange?: (bookmarked: boolean) => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  content,
  role,
  onEdit,
  onDelete,
  isBookmarked,
  onBookmarkChange,
}) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [deleting, setDeleting] = useState(false);

  // Only allow edit/delete for user's own messages
  const canEdit = isAuthenticated && role === 'USER';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      antMessage.success('Message copied to clipboard');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (__error) {
      antMessage.error('Failed to copy message');
    }
  };

  const handleEdit = () => {
    setEditContent(content);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      antMessage.error('Message cannot be empty');
      return;
    }

    try {
      await chatApi.editMessage(messageId, editContent);
      if (onEdit) {
        onEdit(messageId, editContent);
      }
      setEditModalVisible(false);
      antMessage.success('Message updated');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      antMessage.error(err.response?.data?.error || 'Failed to update message');
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await chatApi.deleteMessage(messageId);
      if (onDelete) {
        onDelete(messageId);
      }
      antMessage.success('Message deleted');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      antMessage.error(err.response?.data?.error || 'Failed to delete message');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'Shared Message',
        text: content,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${content}\n\n${window.location.href}`);
        antMessage.success('Message link copied to clipboard');
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        antMessage.error('Failed to share message');
      }
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'copy',
      label: 'Copy',
      icon: <CopyOutlined />,
      onClick: handleCopy,
    },
    ...(canEdit
      ? [
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: handleEdit,
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Delete this message?',
                content: 'This action cannot be undone.',
                okText: 'Delete',
                cancelText: 'Cancel',
                okButtonProps: { danger: true, loading: deleting },
                onOk: handleDelete,
              });
            },
          },
        ]
      : []),
    {
      key: 'bookmark',
      label: isBookmarked ? 'Remove bookmark' : 'Bookmark',
      icon: isBookmarked ? <BookOutlined style={{ color: colors.warning.solid }} /> : <BookOutlined />,
      onClick: async () => {
        try {
          if (isBookmarked) {
            await bookmarkApi.removeBookmark(messageId);
            if (onBookmarkChange) onBookmarkChange(false);
            antMessage.success('Bookmark removed');
          } else {
            await bookmarkApi.addBookmark(messageId);
            if (onBookmarkChange) onBookmarkChange(true);
            antMessage.success('Message bookmarked');
          }
        } catch (error: unknown) {
          const err = error as { response?: { data?: { error?: string } } };
          antMessage.error(err.response?.data?.error || 'Failed to update bookmark');
        }
      },
    },
    {
      key: 'share',
      label: 'Share',
      icon: <ShareAltOutlined />,
      onClick: handleShare,
    },
  ];

  return (
    <>
      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <MoreOutlined
          style={{
            fontSize: '16px',
            color: colors.gray[500],
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.primary.solid;
            e.currentTarget.style.background = colors.primary.light;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.gray[500];
            e.currentTarget.style.background = 'transparent';
          }}
        />
      </Dropdown>

      <Modal
        title="Edit Message"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => {
          setEditModalVisible(false);
          setEditContent(content);
        }}
        okText="Save"
        cancelText="Cancel"
      >
        <TextArea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          rows={4}
          maxLength={2000}
          showCount
        />
      </Modal>
    </>
  );
};

export default MessageActions;

