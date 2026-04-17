// ===========================================
// GIF BUTTON COMPONENT
// ===========================================

import { useState } from 'react';
import { Popover, Tooltip } from 'antd';
import { GifOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import GifPicker from './GifPicker';
import CustomButton from '../common/Button/CustomButton';

interface GifButtonProps {
  onGifSelect: (gifUrl: string) => void;
  disabled?: boolean;
}

export const GifButton: React.FC<GifButtonProps> = ({ onGifSelect, disabled = false }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleGifSelect = (gifUrl: string) => {
    onGifSelect(gifUrl);
    setPopoverOpen(false);
  };

  const gifPickerContent = (
    <div style={{ width: '400px', maxWidth: '90vw' }}>
      <GifPicker onGifSelect={handleGifSelect} apiKey={import.meta.env.VITE_GIPHY_API_KEY || 'YOUR_GIPHY_API_KEY'} />
    </div>
  );

  return (
    <Popover
      content={gifPickerContent}
      trigger="click"
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      placement="topLeft"
      overlayStyle={{ maxWidth: '450px' }}
    >
      <Tooltip title="Send a GIF">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <CustomButton
            variant="ghost"
            icon={<GifOutlined style={{ fontSize: '20px', fontWeight: 'bold' }} />}
            disabled={disabled}
            style={{ padding: '8px' }}
          />
        </motion.div>
      </Tooltip>
    </Popover>
  );
};

export default GifButton;
