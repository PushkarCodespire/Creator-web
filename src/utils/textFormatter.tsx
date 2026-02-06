// ===========================================
// TEXT FORMATTER UTILITY
// ===========================================

import React from 'react';
import { colors, typography } from '../styles/tokens';

/**
 * Format text with markdown-style syntax
 * Supports: **bold**, *italic*, `code`, ~~strikethrough~~
 * @param text - The text to format
 * @returns React elements with formatted text
 */
export const formatText = (text: string): React.ReactNode => {
  if (!text) return null;

  // Split by code blocks first to preserve them
  const codePattern = /`([^`]+)`/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = codePattern.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      parts.push(...formatNonCode(beforeText, key));
      key++;
    }

    // Add code block
    parts.push(
      <code
        key={`code-${key}`}
        style={{
          background: colors.gray[100],
          padding: '2px 6px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: typography.fontSize.sm,
          color: colors.error.solid,
        }}
      >
        {match[1]}
      </code>
    );
    key++;
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(...formatNonCode(text.substring(lastIndex), key));
  }

  return parts.length > 0 ? <>{parts}</> : text;
};

/**
 * Format non-code text (bold, italic, strikethrough)
 */
const formatNonCode = (text: string, startKey: number): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let key = startKey;

  // Pattern for formatting
  const patterns = [
    { regex: /\*\*([^*]+)\*\*/g, style: { fontWeight: typography.fontWeight.bold } }, // **bold**
    { regex: /\*([^*]+)\*/g, style: { fontStyle: 'italic' } }, // *italic*
    { regex: /~~([^~]+)~~/g, style: { textDecoration: 'line-through' } }, // ~~strikethrough~~
  ];

  // Process each line for multiple formatting
  const lines = currentText.split('\n');

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      parts.push(<br key={`br-${key++}`} />);
    }

    let segments: (string | React.ReactNode)[] = [line];

    // Apply each pattern
    patterns.forEach(({ regex, style }) => {
      const newSegments: (string | React.ReactNode)[] = [];

      segments.forEach((segment) => {
        if (typeof segment === 'string') {
          const subParts: (string | React.ReactNode)[] = [];
          let lastIdx = 0;
          let m;
          const segmentRegex = new RegExp(regex.source, regex.flags);

          while ((m = segmentRegex.exec(segment)) !== null) {
            // Add text before match
            if (m.index > lastIdx) {
              subParts.push(segment.substring(lastIdx, m.index));
            }

            // Add formatted text
            subParts.push(
              <span key={`fmt-${key++}`} style={style}>
                {m[1]}
              </span>
            );

            lastIdx = m.index + m[0].length;
          }

          // Add remaining text
          if (lastIdx < segment.length) {
            subParts.push(segment.substring(lastIdx));
          }

          newSegments.push(...(subParts.length > 0 ? subParts : [segment]));
        } else {
          newSegments.push(segment);
        }
      });

      segments = newSegments;
    });

    parts.push(...segments.map((seg, _) =>
      typeof seg === 'string' ? <React.Fragment key={`seg-${key++}`}>{seg}</React.Fragment> : seg
    ));
  });

  return parts;
};

/**
 * Strip all formatting from text
 * @param text - Formatted text
 * @returns Plain text
 */
export const stripFormatting = (text: string): string => {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/`([^`]+)`/g, '$1') // Code
    .replace(/~~([^~]+)~~/g, '$1'); // Strikethrough
};
