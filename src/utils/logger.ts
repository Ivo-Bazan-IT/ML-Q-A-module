import { config } from '../config/index.js';

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const logLevelMap: Record<string, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
};

class Logger {
  private currentLevel: LogLevel;

  constructor() {
    this.currentLevel = logLevelMap[config.logging.level] || LogLevel.INFO;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (data) {
      formatted += `\n${JSON.stringify(data, null, 2)}`;
    }
    return formatted;
  }

  debug(message: string, data?: any): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.currentLevel <= LogLevel.INFO) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.currentLevel <= LogLevel.WARN) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, data?: any): void {
    if (this.currentLevel <= LogLevel.ERROR) {
      console.error(this.formatMessage('error', message, data));
    }
  }
}

export const logger = new Logger();
