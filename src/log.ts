import meta from '../package.json';

const consoleStyle = `
  background-color: indianred;
  border-radius: 2px;
  color: white;
  line-height: 1.5;
  padding: 1px 4px;
  text-shadow: 0 1px 0px rgba(0, 0, 0, 0.2);
`;

function __console(type: string, ...args: unknown[]): void {
  if (atom?.inDevMode()) {
    args.unshift(`%c${meta.name}%c`, consoleStyle, '')
    global.console[type](...args);
  }
}

export default {
  clear(...args: unknown[]): void {
    __console('clear', ...args);
  },

  debug(...args: unknown[]): void {
    __console('debug', ...args);
  },

  error(...args: unknown[]): void {
    __console('error', ...args);
  },

  info(...args: unknown[]): void {
    __console('info', ...args);
  },

  log(...args: unknown[]): void {
    __console('log', ...args);
  },

  warn(...args: unknown[]): void {
    __console('warn', ...args);
  }
}
