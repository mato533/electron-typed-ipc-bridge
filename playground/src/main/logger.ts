import { AbstractLogger } from 'electron-typed-ipc-bridge/main'

import type { LogLevel } from 'electron-typed-ipc-bridge/main'

export class MyLogger extends AbstractLogger {
  protected writeLog(level: LogLevel, message: string): void {
    console.log(`[${level}] ${message}`)
  }
}
