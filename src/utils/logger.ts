export type LogLevel = 'info' | 'warn' | 'error' | 'verbose' | 'debug' | 'silly'

const PACKAGE_NAME = 'electron-typed-ipc-bridge'

const LOG_LEVEL = {
  info: 'info',
  warn: 'warn',
  error: 'error',
  verbose: 'verbose',
  debug: 'debug',
  silly: 'silly',
} as const

interface Logger {
  info(message: string): void
  warn(message: string): void
  error(message: string): void
  verbose(message: string): void
  debug(message: string): void
  silly(message: string): void
}

abstract class AbstractLogger implements Logger {
  protected isEnabled: boolean
  constructor(option = { isEnabled: true }) {
    this.isEnabled = option.isEnabled
  }
  info(message: string) {
    this._writeLog(LOG_LEVEL.info, message)
  }

  warn(message: string) {
    this._writeLog(LOG_LEVEL.warn, message)
  }

  error(message: string) {
    this._writeLog(LOG_LEVEL.error, message)
  }

  verbose(message: string) {
    this._writeLog(LOG_LEVEL.verbose, message)
  }

  debug(message: string) {
    this._writeLog(LOG_LEVEL.debug, message)
  }

  silly(message: string) {
    this._writeLog(LOG_LEVEL.silly, message)
  }
  protected _writeLog(level: LogLevel, message: string) {
    if (!this.isEnabled) {
      return
    }
    const _message = `[${PACKAGE_NAME}] ${message}`
    this.writeLog(level, _message)
  }
  protected abstract writeLog(level: LogLevel, message: string): void
}

class DefaultLogger extends AbstractLogger {
  protected writeLog(level: LogLevel, message: string): void {
    switch (level) {
      case LOG_LEVEL.info:
      case LOG_LEVEL.warn:
        console.log(message)
        break

      case LOG_LEVEL.error:
        console.error(message)
        break

      case LOG_LEVEL.verbose:
      case LOG_LEVEL.debug:
      case LOG_LEVEL.silly:
        console.debug(message)
        break
    }
  }
}

let mainLogger: Logger = new DefaultLogger()
let preloadLogger: Logger = new DefaultLogger()

type MainOption = {
  logger?: {
    main?: Logger
  }
}
type PreloadOption = {
  logger?: {
    preload?: Logger
  }
}

const initialiseMain = (option: MainOption = {}) => {
  if (option.logger) {
    if (option.logger.main) {
      mainLogger = option.logger.main
    } else {
      mainLogger = new DefaultLogger({ isEnabled: false })
    }
  }
}
const initialisePreload = (option: PreloadOption = {}) => {
  if (option.logger) {
    if (option.logger.preload) {
      preloadLogger = option.logger.preload
    } else {
      preloadLogger = new DefaultLogger({ isEnabled: false })
    }
  }
}
export {
  Logger,
  AbstractLogger,
  DefaultLogger,
  MainOption,
  PreloadOption,
  LOG_LEVEL,
  initialiseMain,
  initialisePreload,
  mainLogger,
  preloadLogger,
}
