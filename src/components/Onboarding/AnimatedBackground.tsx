import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Create static seeds for stars to avoid hydration mismatch
    const stars = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: Math.random() * 2 + 1,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5
        }));
    }, []);

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            background: '#020617', // Deeper slate/black
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* 1. Deep Space Layer (Gradients) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 10%, #1e1b4b 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e293b 0%, transparent 50%)',
                zIndex: 0
            }} />

            {/* 2. Aurora/Nebula Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '40vw',
                    height: '40vw',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    zIndex: 1
                }}
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, -40, 0],
                    y: [0, -20, 0],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '5%',
                    width: '50vw',
                    height: '50vw',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
                    filter: 'blur(120px)',
                    zIndex: 1
                }}
            />

            {/* 3. Twinkling Starfield */}
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    initial={{ opacity: 0.1 }}
                    animate={{ opacity: [0.1, 0.8, 0.1] }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        left: star.left,
                        top: star.top,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        background: 'white',
                        borderRadius: '50%',
                        filter: 'blur(0.5px)',
                        boxShadow: '0 0 4px rgba(255,255,255,0.8)',
                        zIndex: 2
                    }}
                />
            ))}

            {/* 4. Moving Light Lines (Scanline Effect) */}
            <motion.div
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '20vh',
                    background: 'linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.03), transparent)',
                    zIndex: 3
                }}
            />

            {/* 5. Main Content Wrapper */}
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

            {/* 6. Bottom Glow */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(99, 102, 241, 0.5), transparent)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                zIndex: 4
            }} />
        </div>
    );
};

export default AnimatedBackground;
