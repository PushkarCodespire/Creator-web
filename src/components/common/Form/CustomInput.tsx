// ===========================================
// CUSTOM INPUT COMPONENT
// Standardized input with CodeSpire styling
// ===========================================

import React from 'react';
import { Input, InputProps } from 'antd';
import { colors, spacing, typography } from '../../../styles/tokens';

export interface CustomInputProps extends InputProps {
    label?: string;
    helperText?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
    label,
    helperText,
    style,
    ...props
}) => {
    return (
        <div style={{ marginBottom: spacing[4], width: '100%' }}>
            {label && (
                <label
                    style={{
                        display: 'block',
                        marginBottom: spacing[2],
                        fontSize: '12px',
                        fontWeight: 700,
                        color: colors.gray[600],
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}
                >
                    {label}
                </label>
            )}
            <Input
                {...props}
                style={{
                    height: '44px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.gray[200]}`,
                    padding: `0 ${spacing[3]}`,
                    fontSize: typography.fontSize.sm,
                    color: colors.text.primary,
                    ...style,
                }}
            />
            {helperText && (
                <p
                    style={{
                        marginTop: spacing[1],
                        fontSize: '12px',
                        color: colors.gray[500],
                    }}
                >
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default CustomInput;
