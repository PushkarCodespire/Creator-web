// ===========================================
// CHAT PREVIEW COMPONENT
// Shows sample conversation preview
// ===========================================

import { useState } from 'react';
import { Avatar, Button, Card } from 'antd';
import { MessageOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { colors, spacing, typography } from '../../styles/tokens';
import CustomButton from '../common/Button/CustomButton';

interface ChatPreviewProps {
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  welcomeMessage?: string;
  sampleMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const ChatPreview: React.FC<ChatPreviewProps> = ({
  creatorId,
  creatorName,
  creatorAvatar,
  welcomeMessage,
  sampleMessages = [
    { role: 'user', content: 'Hi! Can you help me with fitness advice?' },
    { role: 'assistant', content: welcomeMessage || 'Of course! I\'d be happy to help you with fitness advice. What specific area would you like to focus on?' },
  ],
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <MessageOutlined />
          <span>Sample Conversation</span>
        </div>
      }
      extra={
        <Button type="link" size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
      }
      style={{ marginBottom: spacing[4] }}
    >
      <div style={{ maxHeight: expanded ? 'none' : '300px', overflow: 'hidden' }}>
        {sampleMessages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: spacing[3],
              alignItems: 'flex-end',
              gap: spacing[2],
            }}
          >
            {msg.role === 'assistant' && (
              <Avatar size={32} src={creatorAvatar}>
                {creatorName[0]}
              </Avatar>
            )}
            <div
              style={{
                maxWidth: '70%',
                padding: `${spacing[2]} ${spacing[3]}`,
                borderRadius: '12px',
                background: msg.role === 'user' ? colors.primary.solid : colors.gray[100],
                color: msg.role === 'user' ? '#fff' : colors.gray[900],
                fontSize: typography.fontSize.sm,
                lineHeight: 1.5,
              }}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <Avatar size={32} style={{ background: colors.primary.solid }}>
                U
              </Avatar>
            )}
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: spacing[4], textAlign: 'center' }}>
        <CustomButton
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={() => navigate(`/chat/${creatorId}`)}
          block
        >
          Start Real Conversation
        </CustomButton>
      </div>
    </Card>
  );
};

export default ChatPreview;



