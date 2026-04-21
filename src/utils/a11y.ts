/**
 * Accessibility helpers.
 *
 * onKeyActivate: returns an onKeyDown handler that invokes the provided
 * callback when the user presses Enter or Space. Use on clickable non-button
 * elements together with `role="button"` and `tabIndex={0}` so they are
 * keyboard-operable (resolves SonarQube S1082 / jsx-a11y/click-events-have-key-events).
 *
 * Usage:
 *   <div
 *     role="button"
 *     tabIndex={0}
 *     onClick={handleClick}
 *     onKeyDown={onKeyActivate(handleClick)}
 *   />
 */
import type { KeyboardEvent } from 'react';

export function onKeyActivate<T = Element>(handler: (e: KeyboardEvent<T>) => void) {
  return (e: KeyboardEvent<T>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler(e);
    }
  };
}
