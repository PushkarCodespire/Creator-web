// ===========================================
// Streaming Message Component
// Displays AI responses with typing animation
// ===========================================

import { Avatar } from 'antd';
import { motion } from 'framer-motion';
import './StreamingMessage.css';

interface StreamingMessageProps {
    content: string;
    creatorAvatar?: string;
    creatorName?: string;
}

const StreamingMessage: React.FC<StreamingMessageProps> = ({
    content,
    creatorAvatar,
    creatorName
}) => {
    return (
        <motion.div
            className="message-wrapper ai streaming"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Avatar
                size={40}
                src={creatorAvatar}
                className="message-avatar"
            >
                {creatorName?.[0]}
            </Avatar>
            <div className="message-content-wrapper">
                <div className="message-bubble streaming-bubble">
                    {content}
                    <span className="streaming-cursor"></span>
                </div>
                <div className="message-time streaming-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span style={{ marginLeft: '8px', color: '#94A3B8', fontSize: '12px' }}>
                        AI is typing...
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default StreamingMessage;
