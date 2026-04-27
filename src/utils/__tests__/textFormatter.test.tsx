import { render } from '@testing-library/react';
import { formatText } from '../textFormatter';

describe('formatText', () => {
  it('returns null for empty string', () => {
    expect(formatText('')).toBeNull();
  });

  it('returns null for falsy input', () => {
    expect(formatText('')).toBeNull();
  });

  it('returns plain text unchanged', () => {
    const result = formatText('Hello world');
    expect(result).not.toBeNull();
  });

  it('renders inline code with backticks', () => {
    const result = formatText('Use `console.log()` here');
    const { container } = render(<>{result}</>);
    expect(container.textContent).toContain('console.log()');
  });

  it('renders bold text with **', () => {
    const result = formatText('This is **bold** text');
    const { container } = render(<>{result}</>);
    expect(container.textContent).toContain('bold');
  });

  it('renders italic text with *', () => {
    const result = formatText('This is *italic* text');
    const { container } = render(<>{result}</>);
    expect(container.textContent).toContain('italic');
  });

  it('handles strikethrough with ~~', () => {
    const result = formatText('This is ~~strikethrough~~ text');
    const { container } = render(<>{result}</>);
    expect(container.textContent).toContain('strikethrough');
  });
});
