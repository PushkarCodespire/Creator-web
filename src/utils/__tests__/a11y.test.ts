import { onKeyActivate } from '../a11y';

describe('onKeyActivate', () => {
  it('calls handler on Enter key', () => {
    const handler = vi.fn();
    const onKeyDown = onKeyActivate(handler);

    const event = new KeyboardEvent('keydown', { key: 'Enter' }) as unknown as React.KeyboardEvent;
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });

    onKeyDown(event);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('calls handler on Space key', () => {
    const handler = vi.fn();
    const onKeyDown = onKeyActivate(handler);

    const event = new KeyboardEvent('keydown', { key: ' ' }) as unknown as React.KeyboardEvent;
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });

    onKeyDown(event);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('does NOT call handler for other keys', () => {
    const handler = vi.fn();
    const onKeyDown = onKeyActivate(handler);

    const event = new KeyboardEvent('keydown', { key: 'Tab' }) as unknown as React.KeyboardEvent;
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });

    onKeyDown(event);
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns a function', () => {
    const result = onKeyActivate(vi.fn());
    expect(typeof result).toBe('function');
  });
});
