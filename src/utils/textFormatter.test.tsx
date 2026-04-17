import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { formatText, stripFormatting } from './textFormatter';

describe('textFormatter', () => {
  describe('formatText', () => {
    it('returns null for empty string', () => {
      expect(formatText('')).toBeNull();
    });

    it('renders plain text', () => {
      const { container } = render(<>{formatText('hello world')}</>);
      expect(container.textContent).toBe('hello world');
    });

    it('renders bold text with **', () => {
      const { container } = render(<>{formatText('this is **bold** text')}</>);
      expect(container.textContent).toBe('this is bold text');
      const span = container.querySelector('span');
      expect(span).toBeTruthy();
      expect(span?.textContent).toBe('bold');
    });

    it('renders italic text with *', () => {
      const { container } = render(<>{formatText('this is *italic* text')}</>);
      expect(container.textContent).toBe('this is italic text');
    });

    it('renders code with backticks', () => {
      const { container } = render(<>{formatText('use `console.log` here')}</>);
      expect(container.textContent).toBe('use console.log here');
      const code = container.querySelector('code');
      expect(code).toBeTruthy();
      expect(code?.textContent).toBe('console.log');
    });

    it('renders strikethrough text with ~~', () => {
      const { container } = render(<>{formatText('this is ~~deleted~~ text')}</>);
      expect(container.textContent).toBe('this is deleted text');
    });

    it('handles newlines by inserting <br/> elements', () => {
      const { container } = render(<>{formatText('line1\nline2')}</>);
      const brs = container.querySelectorAll('br');
      expect(brs.length).toBe(1);
      expect(container.textContent).toBe('line1line2');
    });

    it('handles mixed formatting', () => {
      const { container } = render(
        <>{formatText('**bold** and *italic* and `code`')}</>
      );
      expect(container.textContent).toBe('bold and italic and code');
      expect(container.querySelector('code')).toBeTruthy();
    });
  });

  describe('stripFormatting', () => {
    it('strips bold markers', () => {
      expect(stripFormatting('**bold**')).toBe('bold');
    });

    it('strips italic markers', () => {
      expect(stripFormatting('*italic*')).toBe('italic');
    });

    it('strips code markers', () => {
      expect(stripFormatting('`code`')).toBe('code');
    });

    it('strips strikethrough markers', () => {
      expect(stripFormatting('~~deleted~~')).toBe('deleted');
    });

    it('strips all formatting from mixed text', () => {
      expect(
        stripFormatting('**bold** and *italic* and `code` and ~~strike~~')
      ).toBe('bold and italic and code and strike');
    });

    it('returns plain text unchanged', () => {
      expect(stripFormatting('no formatting here')).toBe('no formatting here');
    });
  });
});
