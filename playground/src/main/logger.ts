import { AbstractLogger, type LogLevel } from 'electron-typed-ipc-bridge'

export class MyLogger extends AbstractLogger {
  protected writeLog(level: LogLevel, message: string): void {
    console.log(`[${level}] ${message}`)
  }
}
