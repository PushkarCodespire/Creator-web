// ===========================================
// OPTIMIZED IMAGE COMPONENT
// Lazy loading with blur placeholder
// ===========================================

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../styles/tokens';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  objectFit = 'cover',
  loading = 'lazy',
  placeholder,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Use Intersection Observer for lazy loading
    if (loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px', // Load image 50px before it enters viewport
        }
      );

      observer.observe(imgRef.current);

      return () => {
        observer.disconnect();
      };
    } else {
      setImageSrc(src);
    }
  }, [src, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    setImageSrc('/default-image.png'); // Fallback image
    if (onError) onError();
  };

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        background: colors.gray[100],
        ...style,
      }}
      className={className}
    >
      {/* Blur placeholder while loading */}
      {!isLoaded && !hasError && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${colors.gray[100]}, ${colors.gray[200]})`,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Actual image */}
      <motion.img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          display: 'block',
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default OptimizedImage;
