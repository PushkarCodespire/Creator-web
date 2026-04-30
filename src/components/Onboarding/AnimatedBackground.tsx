import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            background: '#f9fafb', // CodeSpire Light Background
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* 1. Mesh Gradient Layer */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 0% 0%, rgba(18, 104, 255, 0.03) 0%, transparent 50%), radial-gradient(circle at 100% 0%, rgba(87, 0, 255, 0.02) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(18, 104, 255, 0.03) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(87, 0, 255, 0.02) 0%, transparent 50%)',
                zIndex: 0
            }} />

            {/* 2. Floating Aurora Blobs (Light) */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.6, 0.4],
                    x: [0, 30, 0],
                    y: [0, 20, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '20%',
                    width: '60vw',
                    height: '60vw',
                    background: 'radial-gradient(circle, rgba(18, 104, 255, 0.05) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    zIndex: 1
                }}
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, -30, 0],
                    y: [0, -20, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '10%',
                    width: '70vw',
                    height: '70vw',
                    background: 'radial-gradient(circle, rgba(87, 0, 255, 0.04) 0%, transparent 70%)',
                    filter: 'blur(120px)',
                    zIndex: 1
                }}
            />

            {/* 3. Subtle Animated Grain Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.02,
                pointerEvents: 'none',
                background: 'url("https://grainy-gradients.vercel.app/noise.svg")',
                zIndex: 2
            }} />

            {/* 4. Main Content Wrapper */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {children}
            </div>
        </div>
    );
};

export default AnimatedBackground;
