import { onKeyActivate } from '../a11y';

describe('onKeyActivate', () => {
  it('calls the handler when Enter key is pressed', () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);
    const event = { key: 'Enter', preventDefault: vi.fn() } as any;

    keyHandler(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls the handler when Space key is pressed', () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);
    const event = { key: ' ', preventDefault: vi.fn() } as any;

    keyHandler(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does NOT call the handler for Tab key', () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);
    const event = { key: 'Tab', preventDefault: vi.fn() } as any;

    keyHandler(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('does NOT call the handler for Escape key', () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);
    const event = { key: 'Escape', preventDefault: vi.fn() } as any;

    keyHandler(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('does NOT call the handler for a letter key', () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);
    const event = { key: 'a', preventDefault: vi.fn() } as any;

    keyHandler(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('calls e.preventDefault() when Enter is pressed', () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);
    const preventDefault = vi.fn();
    const event = { key: 'Enter', preventDefault } as any;

    keyHandler(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('calls e.preventDefault() when Space is pressed', () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);
    const preventDefault = vi.fn();
    const event = { key: ' ', preventDefault } as any;

    keyHandler(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('does NOT call e.preventDefault() for other keys', () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);
    const preventDefault = vi.fn();
    const event = { key: 'Tab', preventDefault } as any;

    keyHandler(event);

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('passes the event object to the handler', () => {
    const handler = vi.fn();
    const keyHandler = onKeyActivate(handler);
    const event = { key: 'Enter', preventDefault: vi.fn() } as any;

    keyHandler(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it('works with a generic element type parameter', () => {
    const handler = vi.fn<[React.KeyboardEvent<HTMLButtonElement>], void>();
    const keyHandler = onKeyActivate<HTMLButtonElement>(handler);
    const event = { key: 'Enter', preventDefault: vi.fn() } as any;

    keyHandler(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
