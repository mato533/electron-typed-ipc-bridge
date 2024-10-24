import type { LogLevel, Logger } from '../utils/logger'

export abstract class AbstractLogger implements Logger {
  info(message: string): void
  warn(message: string): void
  error(message: string): void
  verbose(message: string): void
  debug(message: string): void
  silly(message: string): void
  protected abstract writeLog(level: LogLevel, message: string): void
}

export type { LogLevel }
