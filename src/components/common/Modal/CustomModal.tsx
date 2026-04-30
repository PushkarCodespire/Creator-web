// ===========================================
// CUSTOM MODAL COMPONENT
// Standardized modal with CodeSpire styling
// ===========================================

import React from 'react';
import { Modal, ModalProps } from 'antd';
import { colors, shadows, spacing } from '../../../styles/tokens';

export interface CustomModalProps extends ModalProps {
    icon?: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
    icon,
    title,
    children,
    ...props
}) => {
    return (
        <Modal
            {...props}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], padding: '4px 0' }}>
                    {icon && (
                        <div style={{
                            color: colors.primary.solid,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            {icon}
                        </div>
                    )}
                    <span style={{ fontWeight: 700, fontSize: '18px', color: colors.text.primary }}>
                        {title}
                    </span>
                </div>
            }
            styles={{
                mask: {
                    backdropFilter: 'blur(4px)',
                    background: 'rgba(0, 0, 0, 0.45)', // Standard Ant Design mask
                },
                content: {
                    borderRadius: '16px',
                    boxShadow: shadows.lg,
                    padding: '0',
                    background: '#ffffff', // Force white background for light theme
                },
                header: {
                    padding: '20px 24px',
                    borderBottom: `1px solid ${colors.gray[100]}`,
                    marginBottom: '0',
                    background: '#ffffff',
                },
                body: {
                    padding: '24px',
                    background: '#ffffff',
                },
                footer: {
                    padding: '16px 24px',
                    borderTop: `1px solid ${colors.gray[100]}`,
                    background: '#f9fafb', // Suble footer background
                    borderRadius: '0 0 16px 16px',
                }
            }}
            width={props.width || 600}
        >
            {children}
        </Modal>
    );
};

export default CustomModal;
