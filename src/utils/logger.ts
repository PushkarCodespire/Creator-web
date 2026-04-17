const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (isDev) console.log(message, ...args); // eslint-disable-line no-console
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) console.warn(message, ...args); // eslint-disable-line no-console
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(message, ...args); // eslint-disable-line no-console
  },
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) console.debug(message, ...args); // eslint-disable-line no-console
  },
};
